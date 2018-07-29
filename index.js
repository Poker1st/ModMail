// Require Packages
const Discord = require('discord.js');
 
// Configure Packages
const client = new Discord.Client();
const prefix = ''; // If you would like to add commands to the bot set this here
const ownerID = ''; // Set your ID in here. Do it by copy and pasting it through discord.
const active = new Map();

client.on("error", (e) => console.error(e));
  client.on("warn", (e) => console.warn(e));
  client.on("debug", (e) => console.info(e));

 
client.on('ready', () => { 
    client.user.setGame('Message me for help!');
    console.log(`Bot has started, with ${client.users.size} users!`);
  
    });
  
  client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`${guild.name} SERVER JOINED (id: ${guild.id})! KEEP CAUTION!`);
  });
  
  client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  });

  const db = require('quick.db');

// Listener Events
client.on('message', async message => { 
    if (message.author.bot) return;
    
    // Check if Message is in a DM
    if (message.guild === null) {
        // Fetch Activity Info
        let active = await db.fetch(`support_${message.author.id}`);
        let guild = client.guilds.get(''); // Your Server ID
        let channel, found = true;
        try {
            if (active) client.channels.get(active.channelID).guild;
        } catch(e) {
            found = false;
        }
        if (!active || !found) {
            // Create Support Channel.
            active = {};
            let modRoles = guild.roles.find("name", ""); // Find the Mod/Admin roles so only Admin/Mods will see the tickets. Add it in the quotes
            let everyone = guild.roles.find("name","@" + "everyone");
            let bot = guild.roles.find("name","Bot");
            channel = await guild.createChannel(`${message.author.username}-${message.author.discriminator}`);
                channel.setParent(''); // Management Category ID
                channel.setTopic(`_complete to close the Ticket | ModMail for ${message.author.tag} | ID: ${message.author.id}`);
                channel.overwritePermissions(modRoles, {
                    VIEW_CHANNEL: true,
                    SEND_MESSAGES: true,
                    MANAGE_CHANNELS: true
                });
                channel.overwritePermissions(everyone, {
                    VIEW_CHANNEL: false,
                });
                channel.overwritePermissions(bot, {
                    VIEW_CHANNEL: true,
                    SEND_MESSAGES: true,
                    MANAGE_CHANNELS: true
                }); // This will set the permissions so only Staff will see the ticket.
            let author = message.author;
            const newChannel = new Discord.RichEmbed()
                .setColor('36393E')
                .setAuthor(author.tag, author.displayAvatarURL)
                .setFooter('ModMail Ticket Created')
                .addField('User', author)
                .addField('ID', author.id);
            await channel.send(newChannel);
            
            const newTicket = new Discord.RichEmbed()
                .setColor('36393E')
                .setAuthor(`Hello, ${author.tag}`, author.displayAvatarURL)
                .setFooter('ModMail Ticket Created');
                
            await author.send(newTicket);
            
            // Update Active Data
            active.channelID = channel.id;
            active.targetID = author.id;
        }
        
        channel = client.channels.get(active.channelID);
        const dm = new Discord.RichEmbed()
            .setColor('36393E')
            .setAuthor(`Thank you, ${message.author.tag}`, message.author.displayAvatarURL)
            .setFooter(`Your message has been sent -- A staff member will be in contact soon.`);
            
        await message.author.send(dm);
        
        const embed = new Discord.RichEmbed()
            .setColor('36393E')
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            .setDescription(message.content)
            .setFooter(`Message Recieved -- ${message.author.tag}`);
            
        await channel.send(embed);
        db.set(`support_${message.author.id}`, active);
        db.set(`supportChannel_${channel.id}`, message.author.id);
        return;
    }
    
    let support = await db.fetch(`supportChannel_${message.channel.id}`);
    if (support) {
        support = await db.fetch(`support_${support}`);
        let supportUser = client.users.get(support.targetID);
        if (!supportUser) return message.channel.delete();
        
        // !complete command
        if (message.content.toLowerCase() === "_complete") {
            const complete = new Discord.RichEmbed()
                .setColor('36393E')
                .setAuthor(`Hey, ${supportUser.tag}`, supportUser.displayAvatarURL)
                .setFooter('Ticket Closed')
                .setDescription('*Your ModMail has been marked as **Complete**. If you wish to reopen this, or create a new one, please send a message to the bot.*');
                
            supportUser.send(complete);
            message.channel.delete()
                .then(console.log(`Support for ${supportUser.tag} has been closed.`))
                .catch(console.error);
            return db.delete(`support_${support.targetID}`);
        }
        const embed = new Discord.RichEmbed()
            .setColor('36393E')
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            .setFooter(`Message Recieved`)
            .setDescription(message.content);
            
        client.users.get(support.targetID).send(embed);
        message.delete({timeout: 1000});
        embed.setFooter(`Message Sent -- ${supportUser.tag}`).setDescription(message.content);
        return message.channel.send(embed);
    }


  // Variables
  let msg = message.content.toUpperCase(); // This takes the message.content, and turns it all uppercase.
  let sender = message.author; // This variable holds the message's author.
  let args = message.content.slice(prefix.length).trim().split(' '); // This variable takes the message.content, slices off the prefix from the front, then trims the blank spaces on the side, and turns it into an array by separating it by spaces.
  let cmd = args.shift().toLowerCase(); // This variable holds the first item from the args array, which is taken off of the args array and turned into lowercase.
 
  // Return Statements
  if (!msg.startsWith(prefix)) return; // If the message doesn't start with the prefix, exit the code.
 
})
 

client.login(""); //Currently this is set to testing bot. MUST BE CHANGED IF EDITING FOR KANEKI!