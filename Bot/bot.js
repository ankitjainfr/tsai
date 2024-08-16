const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const app = express();

const TOKEN = "7435621483:AAGRUIjDzAJdKTwAThDbgwQyNJ96WSTm3KI";  // Asegúrate de reemplazar "YOUR_BOT_TOKEN" con tu token real
const bot = new Telegraf(TOKEN);

app.use(express.json());

const web_link = "https://turboswap2.vercel.app";
const community_link = "https://t.me/Turbo Swap_ton";

bot.start((ctx) => {
    const startPayload = ctx.startPayload;
    const urlSent = `${web_link}?ref=${startPayload}`;
    const user = ctx.message.from;
    const userName = user.username ? `@${user.username}` : user.first_name;

    ctx.replyWithPhoto(
        { url: 'https://libooproject.website/wp-content/uploads/2024/07/pikaso_texttoimage_adorable-cartoon-style-Whimsical-cartoonstyle-Whit-1.jpeg' }, // Reemplaza 'URL_DE_LA_IMAGEN' con la URL de tu imagen
        {
            caption: `*Hey! Welcome to TurboSwap, tap, help and get $LIBOO Tokens.*
Got friends?
Bring them all into the game.
More buddies, more coins, more help!`,
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