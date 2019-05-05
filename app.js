const Discord = require('discord.js');
const request = require('request-promise');
const client = new Discord.Client();
const metameta = require('riassumere').default;
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

async function replaceMessage(shortLink, msg, originalLink)  {
  const embedMessage = new Discord.RichEmbed();

  msg.delete();

  metameta(originalLink)
  .then(metadata => {

    embedMessage
    .setAuthor(msg.author.username, msg.author.avatarURL)
    .setDescription(metadata.description)
    .setURL(shortLink);
    metadata.image ? embedMessage.setThumbnail(metadata.image) : null;
  })
  .then(result => {

    if (result) {
      result.length < 60 ? embedMessage.setTitle(result) : embedMessage.setTitle(result.slice(0, 30) + "...");
      msg.channel.send(embedMessage);
    } else {
      msg.channel.send(embedMessage);
    }

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

function isUrl(s) {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(s);
}

client.login(process.env.BOT_TOKEN);
client.on("error", console.error);
