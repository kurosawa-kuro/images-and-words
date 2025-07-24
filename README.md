# images-and-words

Node.js JavaScript Express EJS

OpenAI APIにテキストと画像を送信するNode.jsのサンプルコードです。

## 🏗️ プロジェクト構造（ベストプラクティス準拠）

```
images-and-words/
├── src/                          # アプリケーションソースコード
│   ├── app.js                    # アプリケーションエントリーポイント
│   ├── controllers/              # リクエストハンドラー
│   │   ├── index.js             # コントローラーエクスポート
│   │   ├── documentController.js # ドキュメント生成コントローラー
│   │   └── usageController.js   # 使用状況コントローラー
│   ├── services/                 # ビジネスロジック
│   │   ├── index.js             # サービスエクスポート
│   │   ├── openAIService.js     # OpenAI API統合
│   │   ├── usageService.js      # 使用状況管理
│   │   └── validationService.js # バリデーション
│   ├── routes/                   # ルート定義
│   │   └── index.js             # ルート設定
│   ├── middleware/               # カスタムミドルウェア
│   │   ├── index.js             # ミドルウェアエクスポート
│   │   ├── upload.js            # ファイルアップロード
│   │   └── rateLimit.js         # レート制限
│   ├── config/                   # 設定ファイル
│   │   └── index.js             # アプリケーション設定
│   ├── utils/                    # ユーティリティ関数
│   │   ├── index.js             # ユーティリティエクスポート
│   │   ├── logger.js            # ログ機能
│   │   └── response.js          # レスポンス形式統一
│   └── types/                    # 型定義（TypeScript風）
│       ├── index.js             # 型定義エクスポート
│       └── document.js          # ドキュメント関連型
├── tests/                        # テストファイル
│   ├── api.test.js              # API統合テスト
│   └── services.test.js         # サービス単体テスト
├── public/                       # 静的ファイル
├── views/                        # EJSテンプレート
├── uploads/                      # アップロードファイル
├── data/                         # データファイル
└── package.json                  # プロジェクト設定
```

## 🚀 セットアップ

### 1. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の内容を設定してください：

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# OpenAI Model Configuration (最も安価なモデル)
OPENAI_MODEL=gpt-3.5-turbo

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. アプリケーションの起動

```bash
npm start
```

開発モードで起動する場合：
```bash
npm run dev
```

## 🧪 テスト実行

```bash
# 全テスト実行
npm test

# ウォッチモード
npm run test:watch
```

## 💰 コスト管理

このシステムは最も安価なGPT-3.5-turboモデルを使用しています：

- **料金**: $0.002 per 1K tokens
- **使用状況監視**: `/api/usage`エンドポイントで確認可能
- **レート制限**: 15分間に100リクエストまで
- **自動フォールバック**: APIエラー時はモックレスポンスを使用

## 📊 API使用状況の確認

```bash
# 使用状況の取得
GET /api/usage

# 使用状況のリセット
POST /api/usage/reset
```

## 🏛️ アーキテクチャ設計

### レイヤー構造
1. **Routes Layer**: URLマッピングとリクエスト振り分け
2. **Controllers Layer**: リクエスト処理とレスポンス生成
3. **Services Layer**: ビジネスロジックと外部API統合
4. **Utils Layer**: 共通ユーティリティとヘルパー関数

### 設計原則
- **Separation of Concerns**: 各レイヤーの責任を明確に分離
- **Dependency Injection**: モジュール間の疎結合を実現
- **Error Handling**: 統一されたエラーハンドリング
- **Logging**: 構造化されたログ出力
- **Testing**: 包括的なテストカバレッジ

### レスポンス形式統一
```javascript
// 成功レスポンス
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}

// エラーレスポンス
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

## 🔧 開発ガイドライン

### コード規約
- **命名規則**: camelCase for variables, PascalCase for classes
- **ファイル構造**: 機能別にディレクトリを分割
- **インポート順序**: 外部ライブラリ → 内部モジュール
- **エラーハンドリング**: try-catch文での適切な例外処理

### テスト戦略
- **Unit Tests**: 個別の関数・メソッドのテスト
- **Integration Tests**: APIエンドポイントの統合テスト
- **Mock Usage**: 外部依存関係のモック化

### セキュリティ考慮事項
- **入力検証**: Zodスキーマによる厳密なバリデーション
- **ファイルアップロード**: ファイルタイプとサイズの制限
- **レート制限**: API呼び出し回数の制限
- **環境変数**: 機密情報の安全な管理

## 📈 パフォーマンス最適化

- **非同期処理**: async/awaitパターンの活用
- **エラーフォールバック**: API障害時の自動復旧
- **リソース管理**: ファイルの適切なクリーンアップ
- **ログ最適化**: 開発環境でのみデバッグログ出力

## 🔄 今後の拡張予定

- **データベース統合**: 生成履歴の永続化
- **キャッシュ機能**: Redisによるレスポンスキャッシュ
- **認証機能**: JWTによるユーザー認証
- **API文書**: Swaggerによる自動文書生成
