const pool = require('../config/db');

// GET /api/reports
// Returns all road reports ordered by newest first with pagination support
const getReports = async (req, res) => {
  try {
    const query = `
      SELECT
        id,
        image_url,
        detected_issues,
        road_health_score,
        safety_score,
        maintenance_priority,
        created_at
      FROM road_reports
      ORDER BY created_at DESC, id DESC;
    `;
    const dbResult = await pool.query(query);
    res.status(200).json({ success: true, reports: dbResult.rows });
  } catch (error) {
    console.error('[REPORTS ERROR]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/reports/:id
// Returns a single report by ID (used for full preview with all fields)
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT
        id,
        image_url,
        detected_issues,
        road_health_score,
        safety_score,
        maintenance_priority,
        created_at
      FROM road_reports
      WHERE id = $1;
    `;
    const dbResult = await pool.query(query, [id]);
    if (dbResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.status(200).json({ success: true, report: dbResult.rows[0] });
  } catch (error) {
    console.error('[REPORT BY ID ERROR]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getReports, getReportById };
