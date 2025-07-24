const { usageService } = require('../services');
const { logger, successResponse, errorResponse } = require('../utils');

const getUsage = async (req, res) => {
  try {
    const usage = usageService.getUsage();
    
    res.json(successResponse({
      totalRequests: usage.totalRequests,
      totalTokens: usage.totalTokens,
      totalCost: usage.totalCost,
      currentMonthCost: usage.currentMonthCost,
      estimatedMonthlyCost: usage.estimatedMonthlyCost,
      requestsByDate: usage.requestsByDate,
      lastReset: usage.lastReset
    }, 'Usage data retrieved successfully'));
  } catch (error) {
    logger.error('Usage retrieval error:', error);
    res.status(500).json(errorResponse(error, 'Failed to retrieve usage data'));
  }
};

const resetUsage = async (req, res) => {
  try {
    await usageService.resetUsage();
    
    res.json(successResponse(null, '使用状況がリセットされました'));
  } catch (error) {
    logger.error('Usage reset error:', error);
    res.status(500).json(errorResponse(error, 'Failed to reset usage data'));
  }
};

module.exports = {
  getUsage,
  resetUsage
}; 