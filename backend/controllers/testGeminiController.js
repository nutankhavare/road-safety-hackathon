const geminiService = require('../services/geminiService');

/**
 * Controller to test Gemini API integration.
 * Sends a static prompt to the Gemini API and returns the response.
 */
const testGemini = async (req, res) => {
  try {
    const prompt = "Analyze common road safety hazards found on Indian roads.";
    
    // Call the Gemini service
    const responseText = await geminiService.generateText(prompt);
    
    // Return expected JSON response
    res.status(200).json({
      success: true,
      response: responseText
    });
  } catch (error) {
    console.error("Test Gemini Controller Error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  testGemini,
};
