const mongoose = require('mongoose');

const learnItemSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true
  },
  urduMeaning: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  exampleSentence: {
    type: String,
    required: true
  }
});

const fillInTheBlankSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  choices: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  }
});

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  }
});

const lessonSchema = new mongoose.Schema({
  lessonNumber: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  learn: [learnItemSchema],
  practice: {
    listenAndRepeat: {
      type: [String],
      required: true
    },
    fillInTheBlanks: [fillInTheBlankSchema],
    speakYourself: {
      type: [String],
      required: true
    }
  },
  quiz: {
    type: [quizQuestionSchema],
    validate: [arrayLimit, 'Quiz must have exactly 5 questions']
  }
}, { timestamps: true });

function arrayLimit(val) {
  return val.length === 5;
}

module.exports = mongoose.model('Lesson', lessonSchema);
