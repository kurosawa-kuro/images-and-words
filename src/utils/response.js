const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

const errorResponse = (error, message = 'Error occurred') => ({
  success: false,
  message,
  error: error instanceof Error ? error.message : error
});

const validationErrorResponse = (errors) => ({
  success: false,
  error: 'Validation error',
  details: errors
});

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse
}; 