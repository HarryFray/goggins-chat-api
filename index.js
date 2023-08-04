const serverless = require("serverless-http");
const express = require("express");
const axios = require("axios");
const bp = require("body-parser");

const chatArray = [{ role: "system", content: "You are a helpful assistant." }];

const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.post("/converse", async (req, res) => {
  const message = req.body.message;

  const requestData = {
    model: "gpt-3.5-turbo",
    messages: chatArray.concat([
      {
        role: "system",
        content: "You are a drill sergeant. Your mission: assist and command!",
      },
      { role: "user", content: message },
    ]),
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      requestData,
      {
        headers: {
          Authorization:
            "Bearer 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",
          "Content-Type": "application/json",
        },
      }
    );

    chatArray.push({ role: "user", content: message });
    chatArray.push({
      role: "assistant",
      content: response.data.choices[0].message.content,
    });

    res.json(chatArray);
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
