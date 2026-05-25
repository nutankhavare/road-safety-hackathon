const getReports = async (req, res) => {
  try {
    res.status(200).json({ message: 'Get reports controller placeholder' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getReports };
