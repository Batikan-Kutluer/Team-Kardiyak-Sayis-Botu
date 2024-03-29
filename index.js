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
  try {
    let args = m.cleanContent.split(" ");

    switch (args[0] || m.cleanContent) {
      case "--test":
        if (auth(m)) return;

        m.reply("Pong!");
        break;
      case "--set":
        if (auth(m)) return;

        if (Number(args[1])) {
          last.num = Number(args[1]);
          fs.writeFileSync("./db.json", JSON.stringify(last), "utf8");
        }

        break;
      case "--sayi":
        m.reply(`${last.num || "0"}`)
          .then(() => {
            setTimeout((_) => {
              m?.delete().catch(() => {
                m.channel.send("Yeterli iznim yok!");
              });
              setTimeout(() => {
                _?.delete().catch(() => {
                  m.channel.send("Yeterli iznim yok!");
                });
              }, 1 * 1000);
            }, 3 * 1000);
          })
          .catch(() => {});
        break;

      case "--stop":
        if (auth(m)) return;

        stop = true;
        m.reply("Stopping...").then((t) => {
          setTimeout(() => {
            t.delete().catch(() => {
              m.channel.send("Yeterli iznim yok!");
            });
          }, 3 * 1000);
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
        break;

      default:
        if (!Number(m.cleanContent)) {
          if (m.cleanContent != "0") return;
        }
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
          m.react("👌");

          console.log(last.user, m.channel.lastMessage.author.id);
        } else {
          m.reply(
            last.user !== m.channel.lastMessage.author.id
              ? `Yanlış sayı! (${last.num + 1})`
              : "Son yazan kişi sensin!"
          )
            .then((_) => {
              setTimeout(() => {
                m?.delete().catch(() => {
                  m.channel.send("Yeterli iznim yok!");
                });
                setTimeout(() => {
                  _?.delete().catch(() => {
                    m.channel.send("Yeterli iznim yok!");
                  });
                }, 1 * 1000);
              }, 3 * 1000);
            })
            .catch(() => {
              m.channel.send(
                "Yeterli izinlere sahip değilim! Kullanıcının mesajını silemedim."
              );
            });
        }
        break;
    }
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);
