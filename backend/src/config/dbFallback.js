const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const FALLBACK_DB_PATH = path.join(__dirname, '..', 'db_fallback.json');

function initFallbackDb() {
  if (!fs.existsSync(FALLBACK_DB_PATH)) {
    const defaultData = {
      users: [],
      lessons: [],
      userprogresses: [],
      userstreaks: [],
      notifications: [],
      wtcointransactions: []
    };
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

function readDb() {
  initFallbackDb();
  try {
    const content = fs.readFileSync(FALLBACK_DB_PATH, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading fallback DB:', err.message);
    return { users: [], lessons: [], userprogresses: [], userstreaks: [], notifications: [], wtcointransactions: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing fallback DB:', err.message);
  }
}

function setupFallback() {
  initFallbackDb();

  // Helper to determine if we should use fallback
  const isDisconnected = () => {
    return mongoose.connection.readyState !== 1;
  };

  // 1. Intercept Model.prototype.save
  const originalSave = mongoose.Model.prototype.save;
  mongoose.Model.prototype.save = async function (options) {
    if (!isDisconnected()) {
      return originalSave.call(this, options);
    }

    console.warn(`[Fallback DB] Saving ${this.constructor.modelName} to local JSON file.`);
    const modelName = this.constructor.modelName.toLowerCase() + 's';
    const dbData = readDb();
    
    if (!dbData[modelName]) {
      dbData[modelName] = [];
    }

    // Assign an ID if not exists
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }

    const doc = this.toObject ? this.toObject() : this;
    doc._id = doc._id.toString();

    // Check if document already exists
    const idx = dbData[modelName].findIndex(item => item._id === doc._id);
    if (idx !== -1) {
      dbData[modelName][idx] = { ...dbData[modelName][idx], ...doc };
    } else {
      dbData[modelName].push(doc);
    }

    writeDb(dbData);
    return this;
  };

  // 2. Intercept Query.prototype.exec (for find, findOne, update, delete, etc.)
  const originalExec = mongoose.Query.prototype.exec;
  mongoose.Query.prototype.exec = async function (op, callback) {
    if (!isDisconnected()) {
      return originalExec.call(this, op, callback);
    }

    const modelName = this.model.modelName.toLowerCase() + 's';
    const queryConditions = this._conditions || {};
    const operation = this.op;
    const updateData = this._update || {};

    console.warn(`[Fallback DB] Querying ${this.model.modelName} via local JSON (${operation}).`);
    const dbData = readDb();
    let records = dbData[modelName] || [];

    // Helper to check if a record matches query conditions
    const matches = (record) => {
      for (const [key, val] of Object.entries(queryConditions)) {
        if (key === '_id') {
          if (record._id !== val.toString()) return false;
        } else if (key === '$or') {
          let orMatch = false;
          for (const condition of val) {
            let condMatch = true;
            for (const [ckey, cval] of Object.entries(condition)) {
              if (ckey === '_id') {
                if (record._id !== cval.toString()) condMatch = false;
              } else if (record[ckey] !== cval) {
                condMatch = false;
              }
            }
            if (condMatch) orMatch = true;
          }
          if (!orMatch) return false;
        } else if (typeof val === 'object' && val !== null) {
          // Basic comparison operators like $gt, $lt, $in
          if (val.$gt && !(record[key] > val.$gt)) return false;
          if (val.$lt && !(record[key] < val.$lt)) return false;
          if (val.$in && !val.$in.includes(record[key])) return false;
        } else {
          if (record[key] !== val) return false;
        }
      }
      return true;
    };

    if (operation === 'find') {
      const results = records.filter(matches);
      // Sort if sort options are provided
      if (this.options && this.options.sort) {
        const sortField = Object.keys(this.options.sort)[0];
        const sortOrder = this.options.sort[sortField];
        results.sort((a, b) => {
          if (a[sortField] < b[sortField]) return sortOrder === -1 ? 1 : -1;
          if (a[sortField] > b[sortField]) return sortOrder === -1 ? -1 : 1;
          return 0;
        });
      }
      // Map to mongoose objects
      return results.map(r => this.model.hydrate(r));
    }

    if (operation === 'findOne') {
      const record = records.find(matches);
      return record ? this.model.hydrate(record) : null;
    }

    if (operation === 'findById') {
      const idStr = queryConditions._id ? queryConditions._id.toString() : '';
      const record = records.find(r => r._id === idStr);
      return record ? this.model.hydrate(record) : null;
    }

    if (operation === 'updateOne' || operation === 'updateMany') {
      let matchedCount = 0;
      let modifiedCount = 0;
      dbData[modelName] = records.map(r => {
        if (matches(r)) {
          matchedCount++;
          modifiedCount++;
          // Apply $set and $inc operators
          const updated = { ...r };
          if (updateData.$set) {
            for (const [k, v] of Object.entries(updateData.$set)) {
              if (k.includes('.')) {
                const parts = k.split('.');
                if (parts.length === 2) {
                  if (!updated[parts[0]]) updated[parts[0]] = {};
                  updated[parts[0]][parts[1]] = v;
                }
              } else {
                updated[k] = v;
              }
            }
          }
          if (updateData.$inc) {
            for (const [k, v] of Object.entries(updateData.$inc)) {
              updated[k] = (updated[k] || 0) + v;
            }
          }
          // Plain update
          if (!updateData.$set && !updateData.$inc) {
            for (const [k, v] of Object.entries(updateData)) {
              updated[k] = v;
            }
          }
          return updated;
        }
        return r;
      });
      writeDb(dbData);
      return { matchedCount, modifiedCount };
    }

    if (operation === 'deleteOne' || operation === 'deleteMany') {
      const initialLength = records.length;
      dbData[modelName] = records.filter(r => !matches(r));
      const deletedCount = initialLength - dbData[modelName].length;
      writeDb(dbData);
      return { deletedCount };
    }

    return null;
  };

  // 3. Intercept Model.create
  const originalCreate = mongoose.Model.create;
  mongoose.Model.create = async function (docs, options) {
    if (!isDisconnected()) {
      return originalCreate.apply(this, arguments);
    }

    const modelName = this.modelName.toLowerCase() + 's';
    const dbData = readDb();
    if (!dbData[modelName]) {
      dbData[modelName] = [];
    }

    const processDoc = (docInput) => {
      const id = new mongoose.Types.ObjectId();
      const doc = {
        _id: id.toString(),
        createdAt: new Date().toISOString(),
        ...docInput
      };
      dbData[modelName].push(doc);
      return this.hydrate(doc);
    };

    let results;
    if (Array.isArray(docs)) {
      results = docs.map(processDoc);
    } else {
      results = processDoc(docs);
    }

    writeDb(dbData);
    return results;
  };

  // 4. Intercept Model.insertMany
  const originalInsertMany = mongoose.Model.insertMany;
  mongoose.Model.insertMany = async function (docs, options) {
    if (!isDisconnected()) {
      return originalInsertMany.apply(this, arguments);
    }

    const modelName = this.modelName.toLowerCase() + 's';
    const dbData = readDb();
    if (!dbData[modelName]) {
      dbData[modelName] = [];
    }

    const results = docs.map(docInput => {
      const id = new mongoose.Types.ObjectId();
      const doc = {
        _id: id.toString(),
        createdAt: new Date().toISOString(),
        ...docInput
      };
      dbData[modelName].push(doc);
      return doc;
    });

    writeDb(dbData);
    return results;
  };
}

module.exports = {
  setupFallback,
  readDb,
  writeDb
};
