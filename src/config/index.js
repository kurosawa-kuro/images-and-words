const dotenv = require('dotenv');

// .envファイルを読み込み
dotenv.config();

const config = {
  // OpenAI設定
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  },
  
  // サーバー設定
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // ファイルアップロード設定
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png', 
      'image/gif'
    ],
  },
  
  // セキュリティ設定
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15分
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  }
};

// 必須環境変数のバリデーション
const validateConfig = () => {
  const requiredEnvVars = ['OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  警告: 以下の環境変数が設定されていません:');
    missingVars.forEach(varName => console.warn(`   - ${varName}`));
    console.warn('モックレスポンスが使用されます。');
  }
  
  return missingVars.length === 0;
};

module.exports = {
  config,
  validateConfig
}; 