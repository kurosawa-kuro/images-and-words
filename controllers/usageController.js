const usageService = require('../services/usageService');

const getUsage = async (req, res) => {
  try {
    const usage = usageService.getUsage();
    
    res.json({
      success: true,
      usage: {
        totalRequests: usage.totalRequests,
        totalTokens: usage.totalTokens,
        totalCost: usage.totalCost,
        currentMonthCost: usage.currentMonthCost,
        estimatedMonthlyCost: usage.estimatedMonthlyCost,
        requestsByDate: usage.requestsByDate,
        lastReset: usage.lastReset
      }
    });
  } catch (error) {
    console.error('Usage retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve usage data'
    });
  }
};

const resetUsage = async (req, res) => {
  try {
    await usageService.resetUsage();
    
    res.json({
      success: true,
      message: '使用状況がリセットされました'
    });
  } catch (error) {
    console.error('Usage reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset usage data'
    });
  }
};

module.exports = {
  getUsage,
  resetUsage
}; 