const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
require('dotenv').config()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const options = {
  uri: process.env.GGL_TOKEN,
  headers: {
    "Content-type": "application/json",
  },
  json: {
    "dynamicLinkInfo": {
      "domainUriPrefix": "https://ori.page.link",
      "link": ""
    }
  }
};

client.login(process.env.BOT_TOKEN);

client.on('message', message => {
  if(message.content.match("https://|http://") && message.content.length >= 40){
    options.json.dynamicLinkInfo.link = message.content.split(" ")[0];
    request.post(options, function(error, response, body){
      if(error){
        return false;
      }
      if(body){
        message.delete();
        message.channel.send(body.shortLink);
      }
    });
  }
});
