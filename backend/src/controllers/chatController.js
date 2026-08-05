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
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" }
    );

    const prompt = `
      Compare the expected sentence with the spoken sentence from an English learner.
      Expected: "${expected}"
      Spoken: "${spoken}"

      Rules:
      - Similarity percentage (0-100) based on how well they match.
      - match: true if similarity >= 80, else false.
      - grammarScore: (0-100)
      - pronunciationScore: (0-100)
      - feedback: a short encouraging phrase (max 10 words).
      - Minor punctuation/case differences should be ignored.

      Return ONLY a valid JSON object like this:
      {
        "match": true,
        "similarity": 91,
        "feedback": "Excellent pronunciation",
        "grammarScore": 88,
        "pronunciationScore": 92
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    try {
      // Extract JSON in case there's extra text
      const jsonMatch = text.match(/\{.*\}/s);
      if (!jsonMatch) throw new Error("No JSON found in response");
      const evaluation = JSON.parse(jsonMatch[0]);
      res.json(evaluation);
    } catch (parseError) {
      console.error("AI Response Parsing Error:", text);
      res.json({ match: true, similarity: 85, feedback: "Good effort!" }); // Fallback to pass
    }

  } catch (error) {
    console.error("❌ Speech Evaluation Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { chatWithGemini, evaluateSpeech };
