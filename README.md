# images-and-words

Node.js JavaScript Express EJS

OpenAI APIにテキストと画像を送信するNode.jsのサンプルコードです。

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

# 仕様書生成システム - システム設計書

## 1. システム構成

### 1.1 アーキテクチャ
```
┌─────────────────────────────────────────┐
│          クライアント (Browser)           │
│  - HTML/EJS                             │
│  - Vanilla JavaScript                   │
│  - CSS                                  │
└────────────────┬────────────────────────┘
                 │ HTTP/HTTPS
┌────────────────┴────────────────────────┐
│         Express Server                  │
│  ┌──────────────────────────────────┐  │
│  │   Routes                         │  │
│  │   - GET  /                       │  │
│  │   - POST /api/generate           │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
│  ┌──────────────┴───────────────────┐  │
│  │   Controllers                    │  │
│  │   - documentController           │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
│  ┌──────────────┴───────────────────┐  │
│  │   Services                       │  │
│  │   - openAIService                │  │
│  │   - validationService            │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
                 │
                 │ API Call
┌─────────────────┴───────────────────────┐
│          OpenAI API                     │
│          (gpt-3.5-turbo)                │
└─────────────────────────────────────────┘
```

### 1.2 技術スタック
- **バックエンド**: Node.js + Express
- **テンプレートエンジン**: EJS
- **バリデーション**: Zod
- **APIクライアント**: OpenAI Node.js SDK
- **ファイルアップロード**: Multer
- **環境変数管理**: dotenv

## 2. API仕様

### 2.1 エンドポイント

#### GET /
- **説明**: メインページの表示
- **レスポンス**: HTML (index.ejs)

#### POST /api/generate
- **説明**: ドキュメント生成
- **リクエスト**:
  ```json
  {
    "text": "string (required, max 500 chars)",
    "documentType": "specification | design | confirmation",
    "image": "file (optional, max 1 file)"
  }
  ```
- **レスポンス**:
  ```json
  {
    "success": true,
    "document": "生成されたドキュメント内容",
    "documentType": "specification | design | confirmation"
  }
  ```

### 2.2 バリデーションスキーマ (Zod)

```javascript
const DocumentGenerationSchema = z.object({
  text: z.string().min(1).max(500),
  documentType: z.enum(['specification', 'design', 'confirmation']).default('specification'),
  image: z.any().optional()
});
```

## 3. ディレクトリ構造

```
project/
├── package.json
├── .env
├── .gitignore
├── app.js
├── routes/
│   └── index.js
├── controllers/
│   └── documentController.js
├── services/
│   ├── openAIService.js
│   └── validationService.js
├── middleware/
│   └── upload.js
├── views/
│   └── index.ejs
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── config/
    └── swagger.js
```

## 4. 画面設計

### 4.1 レイアウト
```
┌─────────────────────────────────────────┐
│            ヘッダー                      │
│     「仕様書・設計書生成ツール」          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  テキスト入力エリア               │  │
│  │  (500文字まで)                   │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  画像アップロードエリア           │  │
│  │  (ドラッグ&ドロップ対応)         │  │
│  └─────────────────────────────────┘  │
│                                         │
│  文書種類: [仕様書▼] [生成]ボタン      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  生成結果表示エリア               │  │
│  │  (Markdown形式で表示)             │  │
│  └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## 5. データフロー

1. **ユーザー入力**
   - テキスト入力（必須）
   - 画像アップロード（任意）
   - 文書種類選択

2. **クライアント側処理**
   - 入力値のバリデーション
   - FormDataオブジェクトの作成
   - Ajax (Fetch API) によるPOST送信

3. **サーバー側処理**
   - Multerによる画像受信
   - Zodによるバリデーション
   - OpenAI APIへのリクエスト構築
   - プロンプトエンジニアリング

4. **OpenAI API処理**
   - gpt-3.5-turboモデルによる生成
   - 文書種類に応じたプロンプト適用

5. **レスポンス処理**
   - 生成結果の返却
   - クライアント側での表示更新

## 6. セキュリティ考慮事項

- **入力サニタイゼーション**: XSS対策
- **ファイルアップロード制限**: 
  - 画像形式のみ許可 (jpeg, png, gif)
  - ファイルサイズ制限 (5MB)
- **レート制限**: API呼び出し回数の制限
- **環境変数**: OpenAI APIキーの安全な管理

## 7. エラーハンドリング

- **クライアント側**:
  - 入力値エラー表示
  - ネットワークエラー処理
  - タイムアウト処理

- **サーバー側**:
  - バリデーションエラー
  - OpenAI APIエラー
  - ファイルアップロードエラー

## 8. 拡張性の考慮

- **キャッシング**: Redis導入準備
- **非同期処理**: RabbitMQ導入準備
- **データベース**: 生成履歴保存用のDB接続準備
- **APIドキュメント**: Swagger自動生成
