const pool = require('../config/db');

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*)::integer AS "totalReports",
        COUNT(CASE WHEN maintenance_priority ILIKE '%critical%' OR maintenance_priority ILIKE '%urgent%' THEN 1 END)::integer AS "criticalRoads",
        COALESCE(ROUND(AVG(safety_score)), 0)::integer AS "averageSafetyScore",
        COALESCE(ROUND(AVG(road_health_score)), 0)::integer AS "averageRoadHealth"
      FROM road_reports;
    `;
    const dbResult = await pool.query(query);
    const stats = dbResult.rows[0] || {
      totalReports: 0,
      criticalRoads: 0,
      averageSafetyScore: 0,
      averageRoadHealth: 0
    };
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboard/issues
const getDashboardIssues = async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(CASE WHEN detected_issues ILIKE '%pothole%' THEN 1 END)::integer AS "potholes",
        COUNT(CASE WHEN detected_issues ILIKE '%crack%' THEN 1 END)::integer AS "cracks",
        COUNT(CASE WHEN detected_issues ILIKE '%water%' OR detected_issues ILIKE '%flood%' THEN 1 END)::integer AS "waterlogging",
        COUNT(CASE WHEN detected_issues ILIKE '%mark%' OR detected_issues ILIKE '%fade%' OR detected_issues ILIKE '%line%' THEN 1 END)::integer AS "fadedMarkings",
        COUNT(CASE WHEN detected_issues ILIKE '%collapse%' OR detected_issues ILIKE '%landslide%' OR detected_issues ILIKE '%sinkhole%' THEN 1 END)::integer AS "roadCollapse"
      FROM road_reports;
    `;
    const dbResult = await pool.query(query);
    const issues = dbResult.rows[0] || {
      potholes: 0,
      cracks: 0,
      waterlogging: 0,
      fadedMarkings: 0,
      roadCollapse: 0
    };
    res.status(200).json(issues);
  } catch (error) {
    console.error("Error in getDashboardIssues:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboard/recent-reports
const getRecentReports = async (req, res) => {
  try {
    const query = `
      SELECT id, image_url, detected_issues, road_health_score, safety_score, maintenance_priority, created_at
      FROM road_reports
      ORDER BY created_at DESC, id DESC
      LIMIT 10;
    `;
    const dbResult = await pool.query(query);
    res.status(200).json(dbResult.rows);
  } catch (error) {
    console.error("Error in getRecentReports:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardIssues,
  getRecentReports
};
