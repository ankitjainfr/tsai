const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const app = express();
const TOKEN = "7435621483:AAGRUIjDzAJdKTwAThDbgwQyNJ96WSTm3KI";  // Asegúrate de reemplazar "YOUR_BOT_TOKEN" con tu token real
const bot = new Telegraf(TOKEN);
app.use(express.json());
const web_link = "https://turboswap2.vercel.app";
const community_link = "https://t.me/TurboSwapAI_ton";

bot.start((ctx) => {
    const inviteLink = ctx.message.getChat().invite_link;
    const urlSent = `${web_link}?ref=${inviteLink}`;
    const user = ctx.message.from;
    const userName = user.username ? `@${user.username}` : user.first_name;

    ctx.replyWithMarkdownV2(`*Hey! Welcome to TurboSwap AI, tap, help and get $TurboSwap AI Tokens.*
Got friends?, Bring them all into the game.
⚡️ Token listing:
Confirmed listings on Tier-1 CEXs.
Backed by [redacted] (reveal coming soon) 🤫`,{
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                  [{ text: "👋 Yeah, Start Playing!", web_app: { url: urlSent } }],
                  [{ text: "Join our Community", url: community_link }]
                ]
            },
        }
    );
});

bot.launch();

app.listen(3005, () => {
    console.log("server is me and now running");
});
