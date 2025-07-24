const { z } = require('zod');
const { openAIService, validationService } = require('../services');
const { logger, successResponse, errorResponse, validationErrorResponse } = require('../utils');

const generateDocument = async (req, res) => {
  try {
    // Validate input
    const validatedData = validationService.validateDocumentRequest({
      text: req.body.text,
      documentType: req.body.documentType,
      image: req.file
    });

    // Generate document using OpenAI
    const generatedDocument = await openAIService.generateDocument(
      validatedData.text,
      validatedData.documentType,
      validatedData.image
    );

    res.json(successResponse({
      document: generatedDocument,
      documentType: validatedData.documentType
    }, 'Document generated successfully'));

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(validationErrorResponse(error.errors));
    }

    logger.error('Document generation error:', error);
    res.status(500).json(errorResponse(error, 'Failed to generate document'));
  }
};

module.exports = {
  generateDocument
};
