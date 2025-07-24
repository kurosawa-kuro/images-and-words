/**
 * Document generation request interface
 * @typedef {Object} DocumentRequest
 * @property {string} text - The input text for document generation
 * @property {string} [documentType] - The type of document to generate
 * @property {Object} [image] - Optional image file
 */

/**
 * Document generation response interface
 * @typedef {Object} DocumentResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {string} document - The generated document content
 * @property {string} documentType - The type of document generated
 */

/**
 * Document types enum
 * @enum {string}
 */
const DocumentTypes = {
  SPECIFICATION: 'specification',
  DESIGN: 'design',
  CONFIRMATION: 'confirmation'
};

/**
 * Usage statistics interface
 * @typedef {Object} UsageStats
 * @property {number} totalRequests - Total number of requests
 * @property {number} totalTokens - Total tokens used
 * @property {number} totalCost - Total cost in USD
 * @property {number} currentMonthCost - Current month cost
 * @property {number} estimatedMonthlyCost - Estimated monthly cost
 * @property {Object} requestsByDate - Requests grouped by date
 * @property {string} lastReset - Last reset timestamp
 */

module.exports = {
  DocumentTypes
}; 