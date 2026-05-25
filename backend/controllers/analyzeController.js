const geminiService = require('../services/geminiService');
const pool = require('../config/db');

const analyzeRoad = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Invalid file type. Only JPG and PNG are allowed.' });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Extract language sent from frontend; default to English if missing/unsupported
    const SUPPORTED_LANGS = ['english', 'hindi', 'kannada'];
    const rawLang = (req.body.language || 'english').toLowerCase().trim();
    const language = SUPPORTED_LANGS.includes(rawLang) ? rawLang : 'english';
    console.log(`[LANG] Analysis requested in language: "${language}"`);

    // 1. Analyze with Gemini (pass language so response is multilingual)
    const analysisResult = await geminiService.analyzeImage(filePath, mimeType, language);

    // 2. Prepare database values
    // Using localhost URL for the image access
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const detectedIssuesText = analysisResult.detectedIssues.join(', ');

    // 3. Save to Supabase DB
    const insertQuery = `
      INSERT INTO road_reports 
      (image_url, detected_issues, road_health_score, safety_score, maintenance_priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    const values = [
      imageUrl,
      detectedIssuesText,
      analysisResult.roadHealthScore || 0,
      analysisResult.safetyScore || 0,
      analysisResult.maintenancePriority || 'Unknown'
    ];
    
    let reportId = null;
    try {
      const dbResult = await pool.query(insertQuery, values);
      reportId = dbResult.rows[0].id;
      console.log(`[DB SUCCESS] Successfully inserted road report into Supabase. Row ID: ${reportId}`);
    } catch (dbError) {
      console.error(`[DB ERROR] Failed to insert road report into Supabase:`, dbError.message);
      // We log the error but still return the Gemini analysis to the user
    }

    // 4. Return the full payload to frontend
    res.status(200).json({
      success: true,
      reportId,
      imageUrl,
      analysis: analysisResult
    });

  } catch (error) {
    console.error("Analyze Controller Error:", error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

module.exports = { analyzeRoad };
