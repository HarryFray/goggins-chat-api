const serverless = require("serverless-http");
const express = require("express");
const axios = require("axios");
const bp = require("body-parser");
const cors = require("cors");

const makeSentanceMoreProfane = (inputString) => {
  let result = inputString;

  const replacements = {
    udge: "uck",
    udging: "ucking",
    reakin: "ucking",
    ang: "amn",
    angit: "amnit",
    hoot: "hit",
    weak: "bitch",
    heck: "hell",
  };

  for (const key in replacements) {
    if (replacements.hasOwnProperty(key)) {
      const regex = new RegExp(key, "g");
      result = result.replace(regex, replacements[key]);
    }
  }

  return result;
};

const conversation = [];

const app = express();

app.use(
  cors({
    origin: ["https://goggins-chat-iframe.vercel.app", "http://localhost:3000"], // Add localhost here
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.post("/converse", async (req, res) => {
  const message = req.body.message;

  const requestData = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "Respond like you are David Goggins. Please use the word fudge, shoot, weak and dang very frequently",
      },
      { role: "user", content: message },
    ],
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      requestData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    conversation.push({ role: "user", content: message });
    conversation.push({
      role: "assistant",
      content: makeSentanceMoreProfane(
        response.data.choices[0].message.content
      ),
    });

    res.json(conversation);
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use((_, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
