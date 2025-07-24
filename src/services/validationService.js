const { z } = require('zod');

const DocumentGenerationSchema = z.object({
  text: z.string().min(1, 'Text is required').max(500, 'Text must be 500 characters or less'),
  documentType: z.enum(['specification', 'design', 'confirmation']).default('specification'),
  image: z.any().optional()
});

const validateDocumentRequest = (data) => {
  return DocumentGenerationSchema.parse(data);
};

module.exports = {
  validateDocumentRequest
};
