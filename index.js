if (process.env.NODE_ENV !== "production") require("dotenv").config();

let Discord = require("discord.js");
let fs = require("fs");

require("./webserver");

let intents = new Discord.Intents(32767);
let client = new Discord.Client({ intents });

let last = {
  ...JSON.parse(fs.readFileSync("./db.json", "utf8")),
};

let game_channel = "";

let stop = false;

client.on("ready", () => {
  console.log(
    "I am ready!",
    client.generateInvite({ permissions: 0, scopes: ["bot"] })
  );
});

let auth = (m) =>
  !m.member.permissions.has(Discord.Permissions.FLAGS.KICK_MEMBERS);

client.on("messageCreate", (m) => {
  switch (m.content) {
    case "--test":
      if (auth(m)) return;

      m.reply("Pong!");
      break;

    case "--stop":
      if (auth(m)) return;

      stop = true;
      m.reply("Stopping...").then((t) => {
        setTimeout(() => {
          t.delete();
        }, 3000);
      });
      break;

    case "--start":
      if (auth(m)) return;

      stop = false;
      break;

    case "--reset":
      if (auth(m)) return;

      last.num = 0;
      last.user = "";
      fs.writeFileSync("./db.json", JSON.stringify(last), "utf8");
      break;

    case "--gamechannel":
      console.log(auth(m));
      if (auth(m)) return;

      game_channel = m.channel.id;
      1;
      break;

    default:
      if (
        m.author.bot ||
        stop ||
        m.channel.id !== (game_channel || process.env.botChannel)
      )
        return;

      if (m.content.startsWith(".")) return;

      if (
        Number(m.content) === last.num + 1 &&
        last.user !== m.channel.lastMessage.author.id
      ) {
        last.num += 1;

        if (!m.channel.lastMessage.bot)
          last.user = m.channel.lastMessage.author.id;

        fs.writeFileSync("./db.json", JSON.stringify(last), "utf8");
        console.log(last.user, m.channel.lastMessage.author.id);
      } else {
        m.reply(
          last.user !== m.channel.lastMessage.author.id
            ? "Yanlış sayı!"
            : "Son yazan kişi sensin!"
        )
          .then((_) => {
            setTimeout(() => {
              m.delete();
              _.delete();
            }, 3000);
          })
          .catch(() => {
            m.channel.send(
              "Yeterli izinlere sahip değilim! Kullanıcının mesajını silemedim."
            );
          });
      }
      break;
  }
});

client.login(process.env.TOKEN);
