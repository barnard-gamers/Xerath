const Discord = require('discord.js');
const request = require('request-promise');
const riassumere = require('riassumere').default;
const client = new Discord.Client();
require('dotenv').config();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
  const fullContents = message.content.trim().split(" ");

  if (!isUrl(fullContents[0]) || fullContents[0].length <= 40 || message.author.bot) {
    return false;
  }

  request(createRequestJson(fullContents[0]))
  .then(data => replaceMessage(data.shortLink, message, fullContents[0]))
  .catch(console.error);
});

client.login(process.env.BOT_TOKEN);
client.on("error", console.error);

async function replaceMessage(shortLink, msg, originalLink)  {
  const embedMessage = new Discord.RichEmbed();

  riassumere(originalLink)
  .then(metadata => {
    embedMessage
    .setAuthor(msg.author.username, msg.author.avatarURL)
    .setURL(shortLink);
    metadata.description ? embedMessage.setDescription(metadata.description) : null;
    metadata.image ? embedMessage.setThumbnail(metadata.image) : null;
    metadata.title.length < 60 ? embedMessage.setTitle(metadata.title) : embedMessage.setTitle(metadata.title.slice(0, 30) + "...");
    msg.channel.send(embedMessage);
    msg.delete();
  })
  .catch(console.error);
}

function createRequestJson (link) {
  return {
    method: 'POST',
    uri: `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.GGL_TOKEN}`,
    headers: {
      "Content-type": "application/json",
    },
    body: {
      "dynamicLinkInfo": {
        "domainUriPrefix": "https://ori.page.link",
        "link": link
      }
    },
    json: true
  };
}

function isUrl(string) {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(string);
}
