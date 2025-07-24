const request = require('supertest');
const path = require('path');
const fs = require('fs');

const createApp = () => {
  const express = require('express');
  const routes = require('../src/routes');
  
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '../public')));
  
  // View engine setup
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));
  
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
  
  return app;
};

describe('API Endpoints', () => {
  let app;
  
  beforeAll(() => {
    app = createApp();
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
  });
  
  afterAll(() => {
    if (fs.existsSync('uploads')) {
      const files = fs.readdirSync('uploads');
      files.forEach(file => {
        if (file.startsWith('image-')) {
          fs.unlinkSync(path.join('uploads', file));
        }
      });
    }
  });

  describe('GET /', () => {
    it('should render the main page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.text).toContain('<!DOCTYPE html>');
    });
  });

  describe('POST /api/generate', () => {
    describe('Success cases', () => {
      it('should generate specification document with text only', async () => {
        const response = await request(app)
          .post('/api/generate')
          .field('text', 'ユーザー管理システムの仕様書を作成してください')
          .field('documentType', 'specification')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.documentType).toBe('specification');
        expect(response.body.data.document).toContain('# 仕様書');
        expect(response.body.data.document).toContain('ユーザー管理システムの仕様書を作成してください');
      });

      it('should generate design document with text only', async () => {
        const response = await request(app)
          .post('/api/generate')
          .field('text', 'Webアプリケーションの設計書を作成してください')
          .field('documentType', 'design')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.documentType).toBe('design');
        expect(response.body.data.document).toContain('# 設計書');
        expect(response.body.data.document).toContain('Webアプリケーションの設計書を作成してください');
      });

      it('should generate confirmation document with text only', async () => {
        const response = await request(app)
          .post('/api/generate')
          .field('text', 'システムテストの確認書を作成してください')
          .field('documentType', 'confirmation')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.documentType).toBe('confirmation');
        expect(response.body.data.document).toContain('# 確認書');
        expect(response.body.data.document).toContain('システムテストの確認書を作成してください');
      });

      it('should default to specification when documentType is not provided', async () => {
        const response = await request(app)
          .post('/api/generate')
          .field('text', 'デフォルトの文書タイプをテストします')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.documentType).toBe('specification');
        expect(response.body.data.document).toContain('# 仕様書');
      });
    });

    describe('Image upload tests', () => {
      it('should generate document with valid image upload', async () => {
        const testImageBuffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
          0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
          0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
          0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
          0x54, 0x08, 0x57, 0x63, 0xF8, 0x0F, 0x00, 0x00,
          0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8A, 0xB8, 0x00,
          0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
          0x42, 0x60, 0x82
        ]);

        const response = await request(app)
          .post('/api/generate')
          .field('text', '画像付きの仕様書を作成してください')
          .field('documentType', 'specification')
          .attach('image', testImageBuffer, 'test.png')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.documentType).toBe('specification');
        expect(response.body.data.document).toContain('# 仕様書');
        expect(response.body.data.document).toContain('## 画像について');
      });

      it('should reject non-image files', async () => {
        const textBuffer = Buffer.from('This is not an image file');

        const response = await request(app)
          .post('/api/generate')
          .field('text', 'テキストファイルをアップロードしてみます')
          .field('documentType', 'specification')
          .attach('image', textBuffer, 'test.txt')
          .expect(500);

        expect(response.body.success).toBe(false);
      });

      it('should handle large file rejection', async () => {
        const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 0xFF);

        const response = await request(app)
          .post('/api/generate')
          .field('text', '大きなファイルをアップロードしてみます')
          .field('documentType', 'specification')
          .attach('image', largeBuffer, 'large.png')
          .expect(500);

        expect(response.body.success).toBe(false);
      });
    });

    describe('Validation tests', () => {
      it('should reject empty text', async () => {
        const response = await request(app)
          .post('/api/generate')
          .field('text', '')
          .field('documentType', 'specification')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation error');
        expect(response.body.details).toBeDefined();
      });

      it('should reject text longer than 500 characters', async () => {
        const longText = 'a'.repeat(501);

        const response = await request(app)
          .post('/api/generate')
          .field('text', longText)
          .field('documentType', 'specification')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation error');
        expect(response.body.details).toBeDefined();
      });

      it('should reject invalid document type', async () => {
        const response = await request(app)
          .post('/api/generate')
          .field('text', '無効な文書タイプをテストします')
          .field('documentType', 'invalid_type')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation error');
        expect(response.body.details).toBeDefined();
      });

      it('should accept text at maximum length (500 characters)', async () => {
        const maxText = 'a'.repeat(500);

        const response = await request(app)
          .post('/api/generate')
          .field('text', maxText)
          .field('documentType', 'specification')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.documentType).toBe('specification');
      });
    });
  });
});
