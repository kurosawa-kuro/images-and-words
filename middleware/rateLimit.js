const { config } = require('../config');

// メモリベースのレート制限ストア
const requestStore = new Map();

const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = config.security.rateLimitWindowMs;
  const maxRequests = config.security.rateLimitMaxRequests;

  // クライアントのリクエスト履歴を取得
  const clientRequests = requestStore.get(clientIP) || [];
  
  // 時間枠外のリクエストを削除
  const validRequests = clientRequests.filter(timestamp => 
    now - timestamp < windowMs
  );

  // リクエスト数が上限に達しているかチェック
  if (validRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'レート制限に達しました。しばらく時間をおいてから再試行してください。',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }

  // 現在のリクエストを追加
  validRequests.push(now);
  requestStore.set(clientIP, validRequests);

  // レスポンスヘッダーにレート制限情報を追加
  res.set({
    'X-RateLimit-Limit': maxRequests,
    'X-RateLimit-Remaining': maxRequests - validRequests.length,
    'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
  });

  next();
};

// 定期的に古いエントリをクリーンアップ
setInterval(() => {
  const now = Date.now();
  const windowMs = config.security.rateLimitWindowMs;
  
  for (const [clientIP, requests] of requestStore.entries()) {
    const validRequests = requests.filter(timestamp => 
      now - timestamp < windowMs
    );
    
    if (validRequests.length === 0) {
      requestStore.delete(clientIP);
    } else {
      requestStore.set(clientIP, validRequests);
    }
  }
}, 60000); // 1分ごとにクリーンアップ

module.exports = rateLimit; 