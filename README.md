# images-and-words

Node.js JavaScript Express EJS

OpenAI APIにテキストと画像を送信するNode.jsのサンプルコードです。

## **基本的な実装**

```javascript
// openai-vision.js
import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 画像をBase64に変換
function encodeImage(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

async function analyzeImageWithText() {
  try {
    // ローカル画像をBase64エンコード
    const base64Image = encodeImage('./sample-image.jpg');

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この画像に何が写っていますか？詳しく説明してください。"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeImageWithText();
```

## **URL画像を使用する場合**

```javascript
async function analyzeImageFromURL() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この建物の建築様式を分析してください。"
            },
            {
              type: "image_url",
              image_url: {
                url: "https://example.com/building.jpg"
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## **複数画像の比較**

```javascript
async function compareMultipleImages() {
  try {
    const image1 = encodeImage('./before.jpg');
    const image2 = encodeImage('./after.jpg');

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "これら2つの画像の違いを説明してください。"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image1}`
              }
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image2}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## **実用的な使用例（画像分析API）**

```javascript
// image-analyzer.js
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '画像がアップロードされていません' });
    }

    // アップロードされた画像をBase64に変換
    const base64Image = req.file.buffer.toString('base64');
    const prompt = req.body.prompt || "この画像を説明してください。";

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${req.file.mimetype};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    res.json({
      analysis: response.choices[0].message.content,
      usage: response.usage
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'API呼び出しエラー' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## **パッケージインストール**

```bash
# 必要なパッケージ
npm install openai express multer dotenv

# package.json に type: "module" を追加
{
  "type": "module",
  "dependencies": {
    "openai": "^4.0.0",
    "express": "^4.18.0",
    "multer": "^1.4.5-lts.1"
  }
}
```

## **環境変数設定**

```bash
# .env
OPENAI_API_KEY=sk-your-api-key-here
```

## **注意点**
- 画像サイズは20MB以下
- サポート形式: PNG, JPEG, WEBP, GIF
- `gpt-4-vision-preview`モデルを使用
- Base64エンコード時のメモリ使用量に注意

これらのコードで、テキストと画像を組み合わせたOpenAI APIの活用が可能です。
