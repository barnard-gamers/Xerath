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
  if(((message.content.trim().slice(0, 7) === "https:/" || message.content.trim().slice(0, 7) === "http://")) && message.content.length >= 40){
    options.json.dynamicLinkInfo.link = message.content.split(" ")[0];
    request.post(options, function(error, response, body){
      if(error){
        return false;
      }

      if(body && message.channel.guild !== undefined){
        message.delete();
        message.channel.send(body.shortLink);
      }elseif(body && message.channel.guild === undefined){
        message.channel.send(body.shortLink);
      }
    });
  }
});
