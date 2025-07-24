// app.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const routes = require('./routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// routes/index.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');

// Render main page
router.get('/', (req, res) => {
  res.render('index');
});

// Generate document endpoint
router.post('/api/generate', 
  upload.single('image'), 
  documentController.generateDocument
);

module.exports = router;

// controllers/documentController.js
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

// services/validationService.js
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

// services/openAIService.js
const OpenAI = require('openai');
const fs = require('fs').promises;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateDocument = async (text, documentType, imageFile) => {
  try {
    const messages = [
      {
        role: 'system',
        content: getSystemPrompt(documentType)
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: text
          }
        ]
      }
    ];

    // Add image if provided
    if (imageFile) {
      const imageData = await fs.readFile(imageFile.path);
      const base64Image = imageData.toString('base64');
      
      messages[1].content.push({
        type: 'image_url',
        image_url: {
          url: `data:${imageFile.mimetype};base64,${base64Image}`
        }
      });

      // Clean up uploaded file
      await fs.unlink(imageFile.path);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

const getSystemPrompt = (documentType) => {
  const prompts = {
    specification: `あなたは優秀なシステムエンジニアです。
与えられた情報から詳細な仕様書を作成してください。
以下の構成で作成してください：
1. 概要
2. 機能要件
3. 非機能要件
4. 画面設計（画像がある場合）
5. データ設計
6. 制約事項`,

    design: `あなたは優秀なシステムアーキテクトです。
与えられた情報から詳細な設計書を作成してください。
以下の構成で作成してください：
1. システム構成
2. アーキテクチャ設計
3. データベース設計
4. API設計
5. セキュリティ設計
6. 実装方針`,

    confirmation: `あなたは優秀なQAエンジニアです。
与えられた情報から確認書を作成してください。
以下の構成で作成してください：
1. 確認事項一覧
2. テストケース
3. 受入基準
4. リスク事項
5. 確認スケジュール`
  };

  return prompts[documentType] || prompts.specification;
};

module.exports = {
  generateDocument
};

// middleware/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

module.exports = upload;

// package.json
{
  "name": "spec-generator",
  "version": "1.0.0",
  "description": "Specification and Design Document Generator",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ejs": "^3.1.9",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "openai": "^4.20.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}

// .env
OPENAI_API_KEY=your-openai-api-key-here
PORT=3000
