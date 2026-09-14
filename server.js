const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname)));

app.post("/api/summarize", async (req, res) => {
  try {
    const text = req.body.text;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "請先輸入文字" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `請將下面這段文字整理成清楚、簡潔的繁體中文摘要。

請保留：
1. 核心主旨
2. 重要資訊
3. 關鍵結論

不要加入原文沒有的資訊。

原文：
${text}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(500).json({
        error: "Gemini API 呼叫失敗"
      });
    }

    const summary =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      console.error(data);
      return res.status(500).json({
        error: "Gemini 沒有返回摘要"
      });
    }

    res.json({ summary });

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
