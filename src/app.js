const express = require('express');
const path = require('path');
const { validateConfig } = require('./config');
const { killPort, logger } = require('./utils');
const routes = require('./routes');

// 設定のバリデーション
validateConfig();

const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  
  // ポート3000を停止
  logger.info(`ポート${PORT}の使用状況を確認中...`);
  await killPort(PORT);
  
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

  app.listen(PORT, () => {
    logger.info(`🚀 サーバーがポート${PORT}で起動しました`);
  });
};

// サーバーを起動
startServer().catch((error) => {
  logger.error('サーバー起動エラー:', error);
  process.exit(1);
});
