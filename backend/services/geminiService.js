const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not defined.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateText = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error) {
    throw new Error(`Gemini Text Error: ${error.message}`);
  }
};

const fileToGenerativePart = (filePath, mimeType) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
};

const analyzeImage = async (filePath, mimeType) => {
  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const prompt = `Analyze this road image and identify common road safety hazards.
You MUST return ONLY a valid JSON object matching exactly this structure, with no markdown formatting, no code blocks, and no extra text.
{
  "detectedIssues": ["issue 1", "issue 2"],
  "roadHealthScore": 85,
  "safetyScore": 70,
  "maintenancePriority": "Low",
  "alerts": ["alert 1", "alert 2"],
  "roadKnowledge": ["guidance 1", "guidance 2"]
}`;

    const imagePart = fileToGenerativePart(filePath, mimeType);
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = (await result.response).text();
    
    // Parse the JSON directly
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

module.exports = { generateText, analyzeImage };
