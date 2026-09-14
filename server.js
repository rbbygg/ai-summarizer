const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "2mb" }));

// 顯示網站
app.use(express.static(path.join(__dirname)));

// AI 摘要 API
app.post("/api/summarize", async (req, res) => {
  try {
    const text = req.body.text;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "請先輸入文字"
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: `請將下面這段文字整理成清楚、簡潔的繁體中文摘要。

請保留：
1. 核心主旨
2. 重要資訊
3. 關鍵結論

不要加入原文沒有的資訊。

原文：
${text}`
    });

    res.json({
      summary: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI 摘要失敗，請稍後再試"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
