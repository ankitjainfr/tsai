const express = require("express");
const { Bot, InlineKeyboard } = require("grammy");
const bodyParser = require("body-parser");
require("dotenv").config();
const TOKEN = '7435621483:AAGRUIjDzAJdKTwAThDbgwQyNJ96WSTm3KI';
const URL = 'https://turboswap2.vercel.app/';

const token = process.env.BOT_TOKEN;

console.log(token);
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

const app = express();
app.use(bodyParser.json());

// Handle the /start command
bot.command("start", async (ctx) => {
  console.log("/start command received");


  // Reply with personalized message and horizontal inline keyboard
  await ctx.replyWithPhoto(
    "Welcome to TurboSwap AI!",
    {
      caption: ``,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Play",
              url: "https://turboswap2.vercel.app", // Link to your Next.js app
            },
            {
              text: "X",
              url: "https://x.com/TurbosAIonTon", // Link to x
            },
            {
              text: "TG",
              url: "https://t.me/TurbosAI_ton", // Replace with your community link
            },
          ],
        ],
      },
    }
  );
});

// Start the bot.
bot.start();

app.post(`/bot${token}`, (req, res) => {
  bot.handleUpdate(req.body, res);
});

app.get("/", (req, res) => {
  res.send("Welcome to the bot server!");
});

app.listen(5000, async () => {
  console.log("Server is running on port 3000");

  //   await bot.api.deleteWebhook();
  await bot.api.setWebhook(`https://api.telegram.org/bot${TOKEN}/setWebhook?url=${URL}`);
  console.log("Webhook set");
});
