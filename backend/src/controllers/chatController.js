const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI with your API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithGemini = async (req, res) => {
  const { message } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_actual_gemini_api_key_here') {
    return res.status(500).json({ 
      reply: "I'm sorry, I'm not properly configured to chat right now. Please check the API settings.",
      error: "Gemini API Key is missing in backend .env file" 
    });
  }

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" }
    );

    const prompt = `
      You are a friendly and professional English tutor. 
      Your goals:
      1. Correct any grammar mistakes in the user's message politely.
      2. Explain the mistakes simply if any.
      3. Keep your response short and encouraging (max 30 words).
      4. Ask one short follow-up question to keep the conversation going.

      User message: "${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiReply = response.text().trim();

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    res.status(500).json({ 
      reply: "I'm having a little trouble thinking right now. Could you try saying that again?",
      error: error.message 
    });
  }
};

const evaluateSpeech = async (req, res) => {
  const { expected, spoken } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_actual_gemini_api_key_here') {
    return res.status(500).json({ 
      error: "Gemini API Key is missing in backend .env file",
      feedback: "API Key Error" 
    });
  }

  if (!expected || !spoken) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an English pronunciation and language coach AI.

A student was asked to say the word/phrase: "${expected}"
The student actually said: "${spoken}"

Analyze the student's speech and return a detailed JSON evaluation with these fields:

- pronunciationScore (0-100): How accurately they pronounced "${expected}".
- grammarScore (0-100): Grammar quality of what they spoke.
- vocabularyScore (0-100): How rich and correct the vocabulary is relative to the target word.
- mnemonicScore (0-100): Whether the word is memorable/used well in context.
- overallProgress (0-100): Weighted average: pronunciation 40%, grammar 25%, vocabulary 20%, mnemonic 15%.
- levelLabel: one of "Beginner", "Intermediate", "Advanced", or "Expert" based on overallProgress.
- feedback: One encouraging sentence (max 12 words) about what they did well.
- tip: One short improvement tip (max 15 words).
- match: true if pronunciationScore >= 70, else false.

Rules:
- If spoken is completely unrelated to expected, all scores should be very low (5-20).
- Minor case/punctuation differences should NOT penalize.
- Be encouraging but honest.

Return ONLY a valid JSON object. No markdown. No extra text. Example:
{
  "pronunciationScore": 82,
  "grammarScore": 75,
  "vocabularyScore": 88,
  "mnemonicScore": 70,
  "overallProgress": 80,
  "levelLabel": "Advanced",
  "feedback": "Great effort, your pronunciation is almost perfect!",
  "tip": "Practice the stress on the third syllable.",
  "match": true
}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      const evaluation = JSON.parse(jsonMatch[0]);
      res.json(evaluation);
    } catch (parseError) {
      console.error("AI Parse Error:", text);
      res.json({
        pronunciationScore: 50,
        grammarScore: 50,
        vocabularyScore: 50,
        mnemonicScore: 50,
        overallProgress: 50,
        levelLabel: "Intermediate",
        feedback: "Good attempt! Keep practicing.",
        tip: "Speak clearly and close to the mic.",
        match: true
      });
    }

  } catch (error) {
    console.error("❌ Speech Evaluation Error:", error);
    const msg = error?.message || String(error);

    // Handle quota/rate-limit errors specifically
    const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
    if (isQuota) {
      return res.status(429).json({
        error: "API quota exceeded. Please wait a moment and try again.",
        isQuota: true
      });
    }

    res.status(500).json({
      error: msg,
    });
  }
};

module.exports = { chatWithGemini, evaluateSpeech };
