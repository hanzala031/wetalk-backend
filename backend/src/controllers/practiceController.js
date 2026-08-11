const User = require('../models/User');

/**
 * Evaluate Pronunciation
 * Route: POST /api/practice/pronunciation
 * Access: Private
 */
exports.evaluatePronunciation = async (req, res) => {
  try {
    const { expected } = req.body;
    const target = expected || 'Perseverance';
    
    // Simulate pronunciation evaluation
    const accuracy = Math.floor(Math.random() * (96 - 78 + 1)) + 78;
    const overall = accuracy;
    
    const result = {
      pronunciationScore: accuracy,
      grammarScore: Math.floor(Math.random() * (95 - 80 + 1)) + 80,
      vocabularyScore: Math.floor(Math.random() * (95 - 80 + 1)) + 80,
      mnemonicScore: Math.floor(Math.random() * (95 - 80 + 1)) + 80,
      overallProgress: overall,
      levelLabel: overall >= 90 ? "Expert" : overall >= 75 ? "Advanced" : "Intermediate",
      feedback: `Excellent pronunciation of '${target}'! Your spoken accent matches standard US guidelines.`,
      tip: "Very close! Focus on the vocal release at the end of the word.",
      match: accuracy >= 70,
      spokenText: target
    };

    return res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Evaluate Pronunciation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error evaluating pronunciation',
      error: error.message
    });
  }
};

/**
 * Get Vocabulary Flashcards
 * Route: GET /api/practice/vocabulary
 * Access: Private
 */
exports.getVocabularyFlashcards = async (req, res) => {
  try {
    const flashcards = [
      {
        id: "fc_1",
        word: "Ephemerality",
        phonetic: "/ɪˌfem.əˈræl.ɪ.ti/",
        definition: "The state of lasting for a very short time; transience.",
        tip: "Try using the word \"Ephemerality\" as a bubble or a mnemonic relay to strengthen your memory anchor."
      },
      {
        id: "fc_2",
        word: "Serendipity",
        phonetic: "/ˌser.ənˈdɪp.ɪ.ti/",
        definition: "The occurrence of events by chance in a happy or beneficial way.",
        tip: "Picture a serene dip in the water — a happy accident that leads to joy and discovery."
      },
      {
        id: "fc_3",
        word: "Mellifluous",
        phonetic: "/məˈlɪf.lu.əs/",
        definition: "Sweet or musical; pleasant to hear.",
        tip: "Think of \"mellow\" + \"fluent\" — a voice that flows smoothly like honey."
      },
      {
        id: "fc_4",
        word: "Perspicacious",
        phonetic: "/ˌpɜː.spɪˈkeɪ.ʃəs/",
        definition: "Having a ready insight into things; shrewd.",
        tip: "Imagine someone with a \"periscope\" who sees through things clearly and quickly."
      },
      {
        id: "fc_5",
        word: "Surreptitious",
        phonetic: "/ˌsʌr.əpˈtɪʃ.əs/",
        definition: "Kept secret, especially because it would not be approved of.",
        tip: "Think \"secret\" + \"secret reptile\" — sneaking quietly like a lizard without being noticed."
      }
    ];

    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      flashcards,
      masteredWords: user ? (user.masteredWords || []) : [],
      savedWords: user ? (user.savedWords || []) : []
    });
  } catch (error) {
    console.error('Get Vocabulary Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching flashcards',
      error: error.message
    });
  }
};

/**
 * Master Vocabulary Word
 * Route: POST /api/practice/vocabulary/master
 * Access: Private
 */
exports.masterVocabularyWord = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing card ID' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.masteredWords) user.masteredWords = [];
    if (!user.masteredWords.includes(id)) {
      user.masteredWords.push(id);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Word marked as mastered',
      masteredWords: user.masteredWords
    });
  } catch (error) {
    console.error('Master Word Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving mastered word',
      error: error.message
    });
  }
};

/**
 * Save Vocabulary Word
 * Route: POST /api/practice/vocabulary/save
 * Access: Private
 */
exports.saveVocabularyWord = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing card ID' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.savedWords) user.savedWords = [];
    if (!user.savedWords.includes(id)) {
      user.savedWords.push(id);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Word saved for later review',
      savedWords: user.savedWords
    });
  } catch (error) {
    console.error('Save Word Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving review word',
      error: error.message
    });
  }
};
