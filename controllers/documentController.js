const { z } = require('zod');
const openAIService = require('../services/openAIService');
const validationService = require('../services/validationService');

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

    res.json({
      success: true,
      document: generatedDocument,
      documentType: validatedData.documentType
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('Document generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate document'
    });
  }
};

module.exports = {
  generateDocument
};
