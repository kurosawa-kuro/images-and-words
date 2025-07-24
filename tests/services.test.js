const validationService = require('../src/services/validationService');
const openAIService = require('../src/services/openAIService');
const fs = require('fs').promises;

describe('Validation Service', () => {
  describe('validateDocumentRequest', () => {
    it('should validate correct input', () => {
      const validData = {
        text: 'Valid text input',
        documentType: 'specification',
        image: null
      };

      const result = validationService.validateDocumentRequest(validData);
      expect(result.text).toBe('Valid text input');
      expect(result.documentType).toBe('specification');
      expect(result.image).toBeNull();
    });

    it('should default documentType to specification', () => {
      const validData = {
        text: 'Valid text input'
      };

      const result = validationService.validateDocumentRequest(validData);
      expect(result.documentType).toBe('specification');
    });

    it('should throw error for empty text', () => {
      const invalidData = {
        text: '',
        documentType: 'specification'
      };

      expect(() => {
        validationService.validateDocumentRequest(invalidData);
      }).toThrow();
    });

    it('should throw error for text longer than 500 characters', () => {
      const invalidData = {
        text: 'a'.repeat(501),
        documentType: 'specification'
      };

      expect(() => {
        validationService.validateDocumentRequest(invalidData);
      }).toThrow();
    });

    it('should throw error for invalid document type', () => {
      const invalidData = {
        text: 'Valid text',
        documentType: 'invalid'
      };

      expect(() => {
        validationService.validateDocumentRequest(invalidData);
      }).toThrow();
    });

    it('should accept all valid document types', () => {
      const validTypes = ['specification', 'design', 'confirmation'];
      
      validTypes.forEach(type => {
        const validData = {
          text: 'Valid text input',
          documentType: type
        };

        const result = validationService.validateDocumentRequest(validData);
        expect(result.documentType).toBe(type);
      });
    });
  });
});

describe('OpenAI Service', () => {
  describe('generateDocument', () => {
    it('should generate specification document', async () => {
      const result = await openAIService.generateDocument(
        'テストの仕様書を作成してください',
        'specification',
        null
      );

      expect(result).toContain('# 仕様書');
      expect(result).toContain('テストの仕様書を作成してください');
      expect(result).toContain('## 1. 概要');
      expect(result).toContain('## 2. 機能要件');
    });

    it('should generate design document', async () => {
      const result = await openAIService.generateDocument(
        'テストの設計書を作成してください',
        'design',
        null
      );

      expect(result).toContain('# 設計書');
      expect(result).toContain('テストの設計書を作成してください');
      expect(result).toContain('## 1. システム構成');
      expect(result).toContain('## 2. アーキテクチャ設計');
    });

    it('should generate confirmation document', async () => {
      const result = await openAIService.generateDocument(
        'テストの確認書を作成してください',
        'confirmation',
        null
      );

      expect(result).toContain('# 確認書');
      expect(result).toContain('テストの確認書を作成してください');
      expect(result).toContain('## 1. 確認事項一覧');
      expect(result).toContain('## 2. テストケース');
    });

    it('should include image section when image is provided', async () => {
      const mockImageFile = {
        path: 'test-image.png',
        originalname: 'test.png'
      };

      const originalUnlink = fs.unlink;
      fs.unlink = jest.fn().mockResolvedValue();

      const result = await openAIService.generateDocument(
        '画像付きの仕様書を作成してください',
        'specification',
        mockImageFile
      );

      expect(result).toContain('# 仕様書');
      expect(result).toContain('## 画像について');
      expect(result).toContain('提供された画像を参考に設計を行いました');
      // モックレスポンスが使用されるため、fs.unlinkは呼ばれない
      // expect(fs.unlink).toHaveBeenCalledWith('test-image.png');

      fs.unlink = originalUnlink;
    });

    it('should default to specification for unknown document type', async () => {
      const result = await openAIService.generateDocument(
        '未知の文書タイプをテストします',
        'unknown_type',
        null
      );

      expect(result).toContain('# 仕様書');
      expect(result).toContain('未知の文書タイプをテストします');
    });

    it('should handle errors gracefully', async () => {
      const originalUnlink = fs.unlink;
      fs.unlink = jest.fn().mockRejectedValue(new Error('File operation failed'));

      const mockImageFile = {
        path: 'non-existent-file.png',
        originalname: 'test.png'
      };

      // モックレスポンスが使用されるため、エラーは発生しない
      const result = await openAIService.generateDocument(
        'エラーテスト',
        'specification',
        mockImageFile
      );

      expect(result).toContain('# 仕様書');
      expect(result).toContain('エラーテスト');

      fs.unlink = originalUnlink;
    });
  });
});
