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
      return res.status(400).json({
        error: "請先輸入文字"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
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

    console.log("Gemini response:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini API 呼叫失敗",
        details: data
      });
    }

    const summary =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      return res.status(500).json({
        error: "Gemini 沒有返回摘要",
        details: data
      });
    }

    res.json({
      summary: summary
    });

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "伺服器發生錯誤",
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
