// Require Packages
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');

// Configure Packages
const client = new Discord.Client();
const db = require('quick.db');
const prefix = ''; // If you would like to add commands to the bot set this here
const modROLE = ''; // Set your MOD role ID in here. Do it by copy and pasting it through discord. 
const everyone = ''; //set your @everyone role ID in here.
const auditLogs = ''; //set your Audit Logs channel ID here -- make sure it's not in the modmail category
const guildID = ''; //set your guild's server ID here 

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));
 
client.on('ready', () => { 
    client.user.setGame('Message me for help!');
    console.log(`Bot has started, with ${client.users.cache.size} users!`);
 });
  
 client.on("guildCreate", guild => {
   // This event triggers when the bot joins a guild.
   console.log(`${guild.name} SERVER JOINED (id: ${guild.id})! KEEP CAUTION!`);
 });
  
 client.on("guildDelete", guild => {
   // this event triggers when the bot is removed from a guild.
   console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
 });

/*
 .----------------.  .----------------.  .----------------.  .----------------.  .-----------------.                    
| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |                    
| |      __      | || |  ________    | || | ____    ____ | || |     _____    | || | ____  _____  | |                    
| |     /  \     | || | |_   ___ `.  | || ||_   \  /   _|| || |    |_   _|   | || ||_   \|_   _| | |                    
| |    / /\ \    | || |   | |   `. \ | || |  |   \/   |  | || |      | |     | || |  |   \ | |   | |                    
| |   / ____ \   | || |   | |    | | | || |  | |\  /| |  | || |      | |     | || |  | |\ \| |   | |                    
| | _/ /    \ \_ | || |  _| |___.' / | || | _| |_\/_| |_ | || |     _| |_    | || | _| |_\   |_  | |                    
| ||____|  |____|| || | |________.'  | || ||_____||_____|| || |    |_____|   | || ||_____|\____| | |                    
| |              | || |              | || |              | || |              | || |              | |                    
| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |                    
 '----------------'  '----------------'  '----------------'  '----------------'  '----------------'                     
 */

function isAdmin(client, message, statement) { 
   const userRole = message.member.roles.cache;
   if(userRole.has(modRole)) {
     return true;
   } else {
      if (statement == true) {
       message.reply({ embed: { description: `You don't have the following role: \`MOD\``, color: '36393E'}}); 
       return false;
      }
   }
}

client.on('message', async message => { 
   // Return Statements
  if (!message.content.startsWith(prefix) && message.channel.type != "dm" || message.author.bot) return; // If the message doesn't start with the prefix or is a bot, exit the code.

/*
===============================================   
 |  \/  |         | |               (_) | 
 | \  / | ___   __| |_ __ ___   __ _ _| | 
 | |\/| |/ _ \ / _` | '_ ` _ \ / _` | | | 
 | |  | | (_) | (_| | | | | | | (_| | | | 
 |_|  |_|\___/ \__,_|_| |_| |_|\__,_|_|_| 
=============================================== 
*/

  const messageReception = new MessageEmbed()
  .setColor('36393E')
  .setAuthor(message.author.tag, message.author.displayAvatarURL()) 
  .setThumbnail(`attachment://verified.gif`)
	
  //Check if message is in a direct message
  if (message.guild == null) {
      let active = await db.fetch(`support_${message.author.id}`);
      let guild = client.guilds.cache.get(guildID);
      let channel, found = true;

      try { 
        if (active) client.channels.cache.get(active.channelID).guild;
      } catch (e) {
        found = false;
      }

      if (!active || !found) {
        //create support channel for new respondee
        active = {};
        channel = await guild.channels.create(`${message.author.username}-${message.author.discriminator}`);     
        channel.setParent(''); //set a support ticket channel category ID here
        channel.setTopic(`Use **${prefix}close-ticket** to close the Ticket | ModMail for <@${message.author.id}>`);
        channel.overwritePermissions([ 
          {
            id: modROLE, //set MOD role id here
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS']
          },
          {
            id: message.author.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS']
          },
          {
            id: everyone, //set @EVERYONE role id here
            deny: ['VIEW_CHANNEL']
          }
        ]);
        
        messageReception
        .setTitle(`ModMail Ticket Created`)
        .setDescription(`Hello, I've opened up a new ticket for you! Our staff members ` +
        `will respond shortly. If you need to add to your ticket, plug away again!`)
        .setFooter(`ModMail Ticket Created -- ${message.author.tag}`)
        
        await message.author.send(`<@${message.author.id}>`, { embed: messageReception });
        
        // Update Active Data
        active.channelID = channel.id;
        active.targetID =  message.author.id;
      }

    channel = client.channels.cache.get(active.channelID);

    messageReception //fires for newly created and exisiting tickets 
    .setTitle(`Modmail Ticket Sent!`)
    .setDescription(`Your new content has been sent!`)
    .setFooter(`ModMail Ticket Received -- ${message.author.tag}`)
    await message.author.send(`<@${message.author.id}>`, { embed: messageReception });

    messageReception.setDescription(`**${message.content}**`) //appends `.setDescription()` method to the embed that will be sent to admins
    await channel.send(`<@${message.author.id}>`, { embed: messageReception });

    db.set(`support_${message.author.id}`, active);
    db.set(`supportChannel_${channel.id}`, message.author.id);
    return;
  }
    
    let support = await db.fetch(`supportChannel_${message.channel.id}`);
    if (support) {
        support = await db.fetch(`support_${support}`);
        let supportUser = client.users.cache.get(support.targetID);
        if (!supportUser) return message.channel.delete(); 
        
        if(isAdmin(client, message, true)) { //use isAdmin function to prevent non-mods from closing the ticket! :)
          if (message.content == `${prefix}close-ticket`) {
            messageReception 
              .setTitle(`ModMail Ticket Resolved`)
              .setAuthor(supportUser.tag, supportUser.displayAvatarURL())
              .setDescription(`*Your ModMail has been marked as **Complete**. If you wish to create a new one, please send a message to the bot.*`)
              .setFooter(`ModMail Ticket Closed -- ${supportUser.tag}`)
            supportUser.send(`<@${supportUser.id}>`, { embed: messageReception });

            message.guild.channels.cache.get(auditlogs).send(messageReception);
            message.channel.delete();
            return db.delete(`support_${support.targetID}`);
          } /* else if {
             - So here, you could make additional commands to archive, log, and/or re-open tickets! It's yours to make! :)
          } */
        }
    } 
})
 

client.login(""); //Add the token to your bot user here
