const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not defined.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────────
// Language instruction map — injected at the TOP of the prompt
// so Gemini knows to write all text fields in the target language
// while still returning valid JSON structure.
// ─────────────────────────────────────────────────────────────
const LANGUAGE_INSTRUCTIONS = {
  hindi: `IMPORTANT: You MUST write ALL text values inside the JSON in Hindi language using Devanagari script (हिंदी). The JSON field names/keys must remain in English. Only the string values should be in Hindi.`,
  kannada: `IMPORTANT: You MUST write ALL text values inside the JSON in Kannada language using Kannada script (ಕನ್ನಡ). The JSON field names/keys must remain in English. Only the string values should be in Kannada.`,
  english: `Write all text values in English.`,
};

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

/**
 * analyzeImage(filePath, mimeType, language)
 *
 * @param {string} filePath   - Path to the uploaded image on disk
 * @param {string} mimeType   - MIME type of the image
 * @param {string} language   - 'english' | 'hindi' | 'kannada' (default: 'english')
 * @returns {object}          - Parsed JSON result from Gemini
 */
const analyzeImage = async (filePath, mimeType, language = 'english') => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // Pick language instruction; fall back to English if not in map
    const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS['english'];

    const prompt = `${langInstruction}

Analyze this road image and identify common road safety hazards and infrastructure issues.

You MUST return ONLY a valid JSON object. No markdown. No code blocks. No explanation text outside JSON.

The JSON must match this exact structure:
{
  "detectedIssues": ["issue description 1", "issue description 2"],
  "roadHealthScore": 85,
  "safetyScore": 70,
  "maintenancePriority": "Low",
  "alerts": ["safety alert 1", "safety alert 2"],
  "roadKnowledge": ["road guidance tip 1", "road guidance tip 2"]
}

Rules:
- "detectedIssues": list of specific road problems seen in the image (e.g. potholes, cracks, waterlogging, faded markings)
- "roadHealthScore": integer 0-100 representing overall road condition
- "safetyScore": integer 0-100 representing how safe the road is for users
- "alerts": urgent warnings for road users based on what is visible
- "roadKnowledge": helpful tips or guidance for drivers/pedestrians on this type of road
- All string values in "detectedIssues", "alerts", and "roadKnowledge" MUST be written in the language specified above.
- Do NOT wrap the output in markdown code fences or any extra text.

CRITICAL ENUM LOCK — maintenancePriority:
- The "maintenancePriority" field value MUST ALWAYS be written in English.
- Allowed values are ONLY these four exact English words: "Critical", "High", "Medium", "Low".
- Do NOT translate "maintenancePriority" into Hindi, Kannada, or any other language.
- Do NOT use synonyms, alternate spellings, or script variations.
- Even when all other text is in Hindi or Kannada, this single field must stay in English.
- Example of correct output (Hindi mode): "maintenancePriority": "High"
- Example of WRONG output (Hindi mode): "maintenancePriority": "उच्च"`;

    const imagePart = fileToGenerativePart(filePath, mimeType);
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = (await result.response).text();

    // ── JSON Parsing with safety strip ────────────────────────
    // Even with responseMimeType: "application/json", occasionally
    // Gemini prepends a stray markdown fence. Strip it defensively.
    const cleaned = responseText
      .replace(/^```json\s*/i, '')  // strip leading ```json
      .replace(/^```\s*/i, '')      // strip leading ```
      .replace(/```\s*$/i, '')      // strip trailing ```
      .trim();

    const parsed = JSON.parse(cleaned);

    // ── Structural validation ──────────────────────────────────
    // Ensure required fields exist so the frontend never crashes.

    // Strict whitelist for maintenancePriority — must always be English.
    // Capitalise the raw value first to handle casing drift (e.g. "high" → "High").
    const VALID_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
    const rawPriority = parsed.maintenancePriority
      ? String(parsed.maintenancePriority).trim()
      : '';
    // Attempt case-insensitive match against the whitelist
    const normalizedPriority = VALID_PRIORITIES.find(
      (p) => p.toLowerCase() === rawPriority.toLowerCase()
    );
    // Fallback to 'Unknown' if value is missing, translated, or outside the whitelist
    const safePriority = normalizedPriority || 'Unknown';

    if (!normalizedPriority && rawPriority) {
      console.warn(`[PRIORITY WARN] Gemini returned invalid maintenancePriority: "${rawPriority}" — falling back to "Unknown"`);
    }

    return {
      detectedIssues:      Array.isArray(parsed.detectedIssues)  ? parsed.detectedIssues  : [],
      roadHealthScore:     typeof parsed.roadHealthScore === 'number' ? parsed.roadHealthScore : 0,
      safetyScore:         typeof parsed.safetyScore === 'number'     ? parsed.safetyScore     : 0,
      maintenancePriority: safePriority,
      alerts:              Array.isArray(parsed.alerts)           ? parsed.alerts           : [],
      roadKnowledge:       Array.isArray(parsed.roadKnowledge)    ? parsed.roadKnowledge    : [],
    };

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

module.exports = { generateText, analyzeImage };
