const { Telegraf } = require("telegraf");
const TOKEN = "7091294846:AAGRUIjDzAJdKTwAThDbgwQyNJ96WSTm3KI";
const bot = new Telegraf(TOKEN);

const web_link = "https://turboswap2.vercel.app";
const community_link = "https://t.me/Turbo Swap_ton"; 
const how_to_earn = `How to play Turbo Swap 🤑

💰 Tap to earn
Tap the screen and collect coins.

🚀 Booster
Use booster and other tools to increase your coins faster.

📈 Level
The more coins you have on your balance, the higher the level of your geto is and the faster you can earn more coins.

👥 Friends
Invite your friends and you’ll get bonuses. Help a friend move to the next level and you'll get even more bonuses.

🪙 Token listing
At the end of the season, a token will be released and distributed among the players.
Dates will be announced in our announcement channel. Stay tuned!`;


bot.start((ctx) => {
  const startPayload = ctx.startPayload;
  const urlSent = `${web_link}?ref=${startPayload}`;
  const user = ctx.message.from;
  const userName = user.username ? `@${user.username}` : user.first_name;
  ctx.replyWithMarkdown(`*Hey, ${userName}! Welcome to Turbo Swap Spirit!*
Tap on the Turbo Swap and see your balance rise.

*Turbo Swap* is a Special Telegram App on the TON Blockchain. The biggest part of Turbo Swap Token distribution will occur among the players here.

Got friends, relatives, co-workers?
Bring them all into the game.
More friends, more coins.`, {
      reply_markup: {
          inline_keyboard: [
            [{ text: "👋 Play Turbo Swap!", web_app: { url: urlSent } }],
            [{ text: "Join Community", url: community_link }],
            [{ text: "How to earn?", callback_data: "how_to_earn" }]
          ],
      },
  });
});

bot.action("how_to_earn", (ctx) => {
  ctx.reply(how_to_earn);
});

bot.launch();
