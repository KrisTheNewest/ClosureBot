const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");   
var church = "blaze";
var mysql = require('mysql');
const fs = require('fs').promises;

var con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

setTimeout(async function(){  
    try {
        console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`)
        client.user.setActivity(`kek`);
        console.log("Servers:")
        client.guilds.forEach((guild) => {
            if (guild.name === undefined) {
                process.exit(1);
            }
            console.log(" - " + guild.name);
        });

	setInterval(() => {
            con.query(`SELECT * FROM warns`, function (err, result, fields) {
                if (err) throw err;
            });

	    var clsguild = client.guilds.get("280709755486470144");
	        clsguild.fetchMembers().catch(err => console.error(err));
        }, 300 * 1000);

        var targetChannel = client.channels.get("659758727800291329");
        var targetGuild = client.guilds.get("280709755486470144");
        targetGuild.fetchMembers().then(console.log("Fetched the members!")).catch(error => console.error(error));
        
        fs.readFile("/home/krisnewpl/closurejs/mutes.json", 'utf8').then(data => {
    
            if (data.length === 0) {
                return targetChannel.send("No past mutes found!");
            }
            else {
                data = JSON.parse(data);
                let keys = Object.keys(data);
                let date = Date.now();
                targetChannel.send(`Found ${keys.length} mute(s).`);
            
                for (var i = 0; i < keys.length; i++) {
                    let future = data[keys[i]];
                    let delay = future - date;
                    let mem = keys[i];
                    
                    setTimeout(() => {
                        let muted = targetGuild.members.get(mem);
                        let warned = client.users.get(mem);
                        muted.removeRole("390754319135408129")
                        .then(targetChannel.send(`User ${warned.tag} (${warned.id}) has been unmuted!`))
                        .catch(error => targetChannel.send(`${warned.tag} (${warned.id}) has left before i unmuted them!`));
    
                        fs.readFile("/home/krisnewpl/closurejs/mutes.json", 'utf8').then(data => {
                            data = JSON.parse(data);
                            delete data[mem];
                            data = JSON.stringify(data);
                            fs.writeFile("mutes.json", data).then(warned.send("You have been unmuted.")).catch(error => console.error(error));
    
                        }).catch(error => console.error(error));
    
                    }, delay);
                }
            }
    
        }).catch(error => console.error(error));

        const filter = async (reaction, user) => {
            let auth = reaction["message"]["guild"].fetchMember(user).then(authmem => authmem);
            auth = await auth;
            if (auth.roles.has("690673087565266955") || auth.roles.has("690673233275650128")) {
                return;
            }
            if (reaction.emoji.name === 'VignaBlush') {
                auth.addRole("690673087565266955");
            }
        }

        let test = client.channels.get("723846198657810463")
        .fetchMessage("723849063329431572").then(rules => rules);
        test = await test;
test.createReactionCollector(filter);

    } catch (error) {
        console.error('ready error:');
        console.error(error);
    }
}, 10000);


client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`I have joined a new server!`);
}).catch;

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`I have left a server!`);
}).catch;

client.on("message", async message => {
    try {

        if (message.content.toLowerCase().startsWith(".") && message.channel.id === "723528249866715186") {
            message.delete();
            message.channel.send("Wrong channel, " + message.author + " is a dumbass");
        }

        if (message.content.toLowerCase().startsWith(config.prefix + "ping")) {
            const m = await message.channel.send("Ping?");
            m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
        }

        if (message.content.toLowerCase().startsWith(config.prefix + "uptime")) {

            var readyTime = (client.readyAt);
            var currentDate = new Date()
            var currentTime = currentDate.getTime();
    
            currentTime = currentTime - readyTime;
            var days = Math.floor((currentTime / 86400000))
            currentTime = currentTime - days * 86400000
            var hours = Math.floor((currentTime / 3600000))
            currentTime = currentTime - hours * 3600000
            var minutes = Math.floor((currentTime / 60000))
            currentTime = currentTime - minutes * 60000
            var seconds = Math.floor((currentTime / 1000))
            currentTime = currentTime - seconds * 1000;
            var milliseconds = currentTime;
    
            message.channel.send('I have been working for ' + days + ' days, '
                + hours + ' hours, ' + minutes + ' minutes and ' + seconds + ' seconds. No need for coffee yet.')
        }

        if (message.content.toLowerCase().startsWith(config.prefix + "kick")) {
            let reason = String(message.content.replace(config.prefix + "kick ", "").trimLeft().split(" ").slice(1,2));

            if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send(`Tsk, tsk. You don't have permission to do this, ${message.author.username}.`);
        
                if (message.mentions.users.size === 0) return message.channel.send("You forgot to mention the user you want to mute.");
    
                    if (reason.length === 0) {
                        reason = "None provided";
                    }

                        let mention = message.mentions.users.first();
                        let auth = await message.guild.fetchMember(mention).then(authmem => authmem);
                        message.delete();
                        await message.channel.send(new Discord.RichEmbed()
                        .setTitle("Kick")
                        .setDescription(`${mention.tag} has been kicked for\n\n\`${reason}\``)
                        .setColor("8300ff").setFooter("ClosureBot").setTimestamp());
                        await mention.send(new Discord.RichEmbed()
                        .setTitle("Kick")
                        .setDescription(`You have been kicked from the RIHQ server for the following reasons:\n\n\`${reason}\`\n`)
                        .setColor("8300ff").setFooter("ClosureBot").setTimestamp());
                        await auth.kick(reason);
        }


        if (message.content.toLowerCase().startsWith(config.prefix + "mute")) {

            let args = String(message.content.replace(config.prefix + "mute ", "").trimLeft().split(" ").slice(1,2));
            var targetChannel = client.channels.get("659758727800291329");
            
            if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send(`Tsk, tsk. You don't have permission to do this, ${message.author.username}.`);
        
                if (message.mentions.users.size === 0) return message.channel.send("You forgot to mention the user you want to mute.");
        
                    if (args.length === 0) return message.channel.send("You forgot to state how long the user should be muted for.");
        
                        if (args.includes("h")) {
        
                            var testingargs = args.replace("h", "");
                                
                                if (isNaN(testingargs)) return message.channel.send("This is not a valid time!");
                                    testingargs = parseInt(testingargs);
                                    var mutedfor = testingargs * 60 * 60 * 1000;
                        }
        
                            else if (args.includes("m")) {
        
                                var testingargs = args.replace("m", "");
                                
                                    if (isNaN(testingargs)) return message.channel.send("This is not a valid time!");
                                        testingargs = parseInt(testingargs);
                                        var mutedfor = testingargs * 60 * 1000;
                            }
                                else return message.channel.send("Please write m(minutes) or h(hours).");
        
                                // console.error(testingargs);
                                // console.error(args);
                                // return;
        
                                    let mention = message.mentions.users.first();
                                    let date =  Date.now();
                                    let object = `{"${mention.id}": ${date + mutedfor}}`;
                                    let msg = mention.tag + ` (${mention.id}) has been muted until ` + new Date(date + mutedfor) + ` (${args})`;
        
                                    fs.readFile("/home/krisnewpl/closurejs/mutes.json", 'utf8').then(data => {
        
                                        if (data.length === 0) {
        
                                            fs.writeFile("mutes.json", object)
                                            .then(message.channel.send(msg))
                                            .catch(error => console.error(error));
        
                                        }
                                        else {
        
                                            data = JSON.parse(data);
                                            object = JSON.parse(object);
                                            let returnedObject = Object.assign(data, object);
                                            returnedObject = JSON.stringify(returnedObject);
        
                                            fs.writeFile("mutes.json", returnedObject)
                                            .then(message.channel.send(msg))
                                            .then(mention.send("You have been muted til " + new Date(date + mutedfor) + ` (${args})`))
                                            .catch(error => console.error(error));
        
                                        }
        
                                    }).catch(error => console.error(error));
        
                                    message.guild.fetchMember(mention)
                                    .then(m => m.addRole("390754319135408129")) 
                                    .catch(error => console.error(error));
        
                                    setTimeout(() => {
        
                                        message.guild.fetchMember(mention)
                                        .then(m => m.removeRole("390754319135408129"))
                                        .catch(error => targetChannel.send(`${mention.tag} (${mention.id}) has left before i unmuted them! (or unmuted beforehand)`));
                                        
                                        fs.readFile("/home/krisnewpl/closurejs/mutes.json", 'utf8').then(data => {
        
                                            data = JSON.parse(data);
                                            delete data[mention.id];
                                            data = JSON.stringify(data);
        
                                            fs.writeFile("mutes.json", data)
                                            .then(mention.send("You have been unmuted."))
                                            .then(targetChannel.send(mention.tag + ` (${mention.id}) has been unmuted.`))
                                            .catch(error => console.error(error));
        
                                        }).catch(error => console.error(error));
        
                                    }, mutedfor);
        
        }
        
        if (message.content.startsWith(config.prefix + "help")) {
            let embed = new Discord.RichEmbed()
            .setColor("8300ff")
            .setAuthor("Help page", "https://i.imgur.com/dCNn70Q.png")
            .setDescription("Available commands:")
            .addField("Roles", "`" + config.prefix + "role` - type for more info.")
            .addField("Remove roles", "`" + config.prefix + "remove` removes a role you got. Usually both full and short names work.")
            .addField("The usual", "`" + config.prefix + "ping`," +  " `" + config.prefix + "uptime`")
            if (!message.member.hasPermission("MANAGE_ROLES")) {
                embed.setFooter("ClosureBot", "https://ak.hypergryph.com/future").setTimestamp();
            }
            let mod = new Discord.RichEmbed()
            .setColor("8300ff")
            .setDescription("And since you're a moderator:")
            .addField("Warns", `\`${config.prefix}warn <mention> <warn message>\` warns a member. 3 warns = kick, 4th warn is a ban.`)
            .addField("Mute", `\`${config.prefix}mute <mention> <time + m(minutes)/h(hours)>\` mutes a member for a given time.`)
            .addField("Ban", `\`${config.prefix}ban <mention> <optional: days of messages that are going to be deleted | reason of the ban>\` bans a member`)
	    .addField("Kick", `\`${config.prefix}kick <mention> <optional: reason>\` kicks a member.`)
            .addField("Soon:tm:", "Nuke")
            .setFooter("ClosureBot", "https://ak.hypergryph.com/future").setTimestamp();

            message.channel.send(embed);

            if (message.member.hasPermission("MANAGE_ROLES")) {
                message.channel.send(mod);
            }
        }

        if (message.content.toLowerCase().startsWith(config.prefix + "warn")) {
        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send(`Tsk, tsk. You don't have permission to do this, ${message.author.username}.`);
            if (!message.mentions.users.size) return message.channel.send("You forgot to mention the user you want to warn.");
                let warnmsg = message.content.replace(config.prefix + "warn ", "").trimLeft().split(' ').slice(1);
                let warned = message.mentions.users.first();
                let id = con.escape(message.mentions.users.first().id);
                let date = new Date;
                let dmy  = date.toLocaleDateString('en-GB', {weekday: "short", year: "numeric", month: "short", day: "2-digit"});
                let hms = date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
                let time = dmy + ' ' + hms;
                let msg = [];
        
                if (warnmsg.length === 0) return message.channel.send("Write a warn message");
        
                    for (let i = 0; i < warnmsg.length; i++) {
                        msg.push(warnmsg[i]);
                    }
                    msg = msg.join(" ");
                    msg = msg.replace("'", "ˈ");
                    message.delete()
                    con.query(`SELECT user, time, warn FROM warns WHERE user IN (${id})`, async function (err, result, fields) {
                        if (err) throw err;
                            let data = result;
                            data = JSON.stringify(data);
                            data = JSON.parse(data);
                        
                            con.query(`INSERT INTO warns (user, time, warn) VALUES (${id}, '${time}', '${msg}')`, async function (err, result) {
                                if (err) throw err;                                 
                                let auth = message.guild.fetchMember(warned).then(authmem => authmem);
                                auth = await auth;
                                    if ((data.length + 1) === 4) {
                                        await message.mentions.users.first().send(new Discord.RichEmbed()
                                        .setTitle("Warn/Ban")
                                        .setDescription(`You have been banned from the Rhodes Island HQ server for getting warned for the 4 time:\n\n${msg}`)
                                        .setColor("8300ff").setFooter("ClosureBot").setTimestamp());
                                        await auth.ban({reason: "4th warn"}); 
                                        message.channel.send(warned.tag + " has been warned for the 4th time and banned.");
                                    }
                                        else if ((data.length + 1) === 3) {
                                            await message.mentions.users.first().send(new Discord.RichEmbed()
                                            .setTitle("Warn/kick")
                                            .setDescription(`You have been kicked from the Rhodes Island HQ server for getting warned 3 times:\n\n${msg}`)
                                            .setColor("8300ff").setFooter("ClosureBot").setTimestamp());
                                            await auth.kick("3rd warn");
                                            message.channel.send(warned.tag + " has been warned for the 3rd time and kicked.");
                                        }
                                            else {
                                                message.channel.send(new Discord.RichEmbed()
                                                .setTitle("Warn")
                                                .setDescription(`${warned} has been warned for\n\n\`${msg}\`\n\nThis member have been warned [\`${data.length + 1}\`] time(s).`)
                                                .setColor("8300ff").setFooter("ClosureBot").setTimestamp());
                                                message.mentions.users.first().send(new Discord.RichEmbed()
                                                .setTitle("Warn")
                                                .setDescription(`You have been warned on the Rhodes Island HQ server for\n\n${msg}\n    `)
                                                .setColor("8300ff").setFooter("ClosureBot").setTimestamp());
                                            }
                            });
                    });
        
        }
        
        if (message.content.toLowerCase().startsWith(config.prefix + "history")) {
        // if (!message.mentions.users.size) return message.channel.send("You forgot to mention.");
        // let id = message.mentions.users.first().id;
        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send(`Tsk, tsk. You don't have permission to do this, ${message.author.username}.`);
            let id = con.escape(message.content.replace(config.prefix + "history", "").replace(/([^0-9])/g, ""));
           // console.error(id.length);
                if (id.length != "20") {
                    return message.channel.send("Provided ID is wrong.");
                }
        
            con.query(`SELECT user, time, warn FROM warns WHERE user IN (${id})`, function (err, result, fields) {
                if (err) throw err;
                let data = JSON.stringify(result);
                data = JSON.parse(data);
                if (data.length === 0) {
                    return message.channel.send("No past mutes found!\nThe user was a good boy.")
                }
                else {
                let warnhistory = [];
                for (entries in data) {
                    warnhistory.push(`User ${data[entries]["user"]} was warned for \`${data[entries]["warn"]}\` on ${data[entries]["time"]}`);
                }
                message.channel.send(warnhistory.join("\n"));
                }
            });
        }

        if (message.content.toLowerCase().startsWith(config.prefix + "ban")) {
            if (!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send(`Tsk, tsk. You don't have permission to do this, ${message.author.username}.`);
            if (!message.mentions.users.size) return message.channel.send("You forgot to mention the user you want to ban.");
                let delmsg = message.content.split(' ').slice(2,3);
                let banmsg = message.content.split(' ').slice(3);
                // let id = message.mentions.users.first().id;
                let warned = message.mentions.users.first();
                if (isNaN(delmsg)) {
                    banmsg.unshift(String(delmsg));
                    // console.error("yes!");
                    delmsg = 0;
                }
                else {delmsg = parseInt(delmsg)}

                // console.error(delmsg);
                // console.error(banmsg);

                let auth = message.guild.fetchMember(warned).then(authmem => authmem);
                auth = await auth;
                let msg = [];

                if (banmsg.length === 0) {
                    msg = "No reason provided";
                }
                else {
                    for (var i = 0; i < banmsg.length; i++) {
                        msg.push(banmsg[i]);
                    }
                    msg = msg.join(" ");
                }
                await message.mentions.users.first().send("You have been banned from the Rhodes Island HQ server for the following reasons:\n" +
                "\n" +
                msg + "\n" +
                "\n" +
                "If you have any complants or think the ban is unjust, please contact:\n" +
                (message.guild.roles.get('287237074967592960').members.map(m=>m.user.tag)).join(" "));
                let ban = {days: delmsg, reason: msg};
                await auth.ban(ban).then(() => message.channel.send(`${warned} was banned by ${message.author} for ${msg}` ));

        }

        if (message.content.toLowerCase().startsWith(config.prefix + "role")) {

            let args = message.content.toLowerCase().replace(config.prefix + "role ", "");
            let embed = new Discord.RichEmbed()
            .setColor("8300ff")
            .setAuthor("List of roles", "https://i.imgur.com/dCNn70Q.png")
            .setDescription("Available roles:")
            .addField("Rhodes Island (purple)", "`ri`\n`rhodes island`")
            .addField("RM Sympathizers (pink)", "`rm`\n`rm sympathizers`")
            .addField("Church of " + church, `\`church\`\n\`church of ${church}\``)
            .addField("Server Events", "`events`\n`server events`")
            .addField("Note:", "The command and roles are *not* case sensitive.\nCorrect syntax !role `name of a role`")
            .setFooter("ClosureBot", "https://ak.hypergryph.com/future").setTimestamp();
            let auth = message.guild.fetchMember(message.author)
            .then(authmem => authmem);
            auth = await auth;
            
           // if (auth.roles.has("442364397780860931") || auth.roles.has("391948622834696222") || auth.roles.has("391948622834696222") || auth.roles.has("681838780210348074")) return message.channel.send("You already got this role.");

            switch (args) {

                case "rm":
                case "rm sympathizers":
                    auth.addRole("442364397780860931");
                    message.react("👍");
                break;

                case "ri":
                case "rhodes island":
                    auth.addRole("391948622834696222");
                    message.react("👍");
                break;

                case "church of " + church:
                case "church":
                    auth.addRole("562934247472627712");
                    message.react("👍");
                break;

                case "server events":
                case "events":
                    auth.addRole("681838780210348074");
                    message.react("👍");
                break;

                default:
                    message.channel.send(embed);

            }

        }

        if (message.content.toLowerCase().startsWith(config.prefix + "remove")) {

            let args = message.content.toLowerCase().replace(config.prefix + "remove ", "");
            let auth = message.guild.fetchMember(message.author)
            .then(authmem => authmem);
            auth = await auth;

            switch (args) {

                case "rm":
                case "rm sympathizers":
                    if (auth.roles.has("442364397780860931")) {
                        auth.removeRole('442364397780860931');
                        message.react('👍');
                    }
                    else {
                        message.channel.send("You don't have this role.");
                    }
                break;

                case "ri":
                case "rhodes island":
                    if (auth.roles.has("391948622834696222")) {
                        auth.removeRole('391948622834696222');
                        message.react('👍');
                    }
                    else {
                        message.channel.send("You don't have this role.");
                    }
                break;

                case "church of " + church:
                case "church":
                    if (auth.roles.has("562934247472627712")) {
                        auth.removeRole('562934247472627712');
                        message.react('👍');
                    }
                    else {
                        message.channel.send("You don't have this role.");
                    }
                break;

                case "server events":
                case "events":
                    if (auth.roles.has("681838780210348074")) {
                        auth.removeRole('681838780210348074');
                        message.react('👍');
                    }
                    else {
                        message.channel.send("You don't have this role.");
                    }
                break;

                default:
                    message.channel.send("Are you sure you got this role? Make sure it's spelled correctly.\nPS Every assignable role is removable. ~~maybe~~");

            }
        }
/*
        if (message.content.toLowerCase().startsWith(config.prefix + "rules")) {
            let foo = new Date;
            var idk = {
                "embed": {
                    "files": ["./NSFW.png"],
                  "description": "**WARNING!** Links in this message contain R-18 content!\n" + 
                  "\n\"Where should i post this?\"\n" + 
                  "<#390753498456653825>: [fanart1](https://cdn.discordapp.com/attachments/655391988668956672/683392426231988299/75499110_p0.jpg), [fanart2](https://cdn.discordapp.com/attachments/655391988668956672/683063857123426336/79595017_p0.jpg) - swimsuits and lingerie are considered as SFW on this server!\n" +
                  "<#655391988668956672>: [nsfw](https://cdn.discordapp.com/attachments/655391988668956672/682119118958493726/7895f0db7e719b78a2ad4ca904e91047.png), [nsfw2](https://cdn.discordapp.com/attachments/655391988668956672/681984146351980686/3ff6ad55d26cc1af74d523dfd71b4d70.jpg) - Doesn't need an explanation, no?\n" + 
                  "<#690681226587144232>: [ecchi1](https://cdn.discordapp.com/attachments/655391988668956672/683237930130604081/4fdb90d7cbc40e270d092f5487cb3144.jpg), [ecchi2](https://cdn.discordapp.com/attachments/655391988668956672/682151341107314742/77652632_p0.jpg) - anything that is erotic but not completly explicit (i.e. see-through nipples);\n" +
                  "<#655392423219953685>: Discussions about NSFW games;\n" +
                  "<#668432851695304734>: NSFW shitposting & sharing doujins. Please keep most of discussions here.\n\n" +
                  "**BANNED CONTENT:**\n- Ryona;\n- Loli/Shota/Cub;\n- Scat;\n- Guro.\n" +
                  "\n**WARN SYSTEM:**\n" +
                  "Posting images in a wrong category 3 times will lead to permanently losing permissions to view NSFW channels.\n"+
                  "There're **no ** warnings before losing permissions to view NSFW channels for posting **ryona**, **scat** and **guro**! As for loli, there's only ***one *** warn before the ban from nsfw.\n\n" +
                  "If you still aren't sure where you should send an image, contact <@196338784458113024> or <@182126754184298496>.",
                  "color": 8585471,
                  "footer": {
                    "text": "ClosureBot",
                    "icon_url": "https://i.imgur.com/dCNn70Q.png"
                  },
                  "timestamp": foo.toJSON(),
                  "fields": [
                    {
                      "name": "About reposts...",
                      "value": "Please avoid reposts! Before you post try to seach for a pic via the search function. Reposts of the same image within 24 hours will be deleted! Too frequent reposts will lead to a warn!"
                    },
                    {
                      "name": "Thumbnails",
                      "value": "Please avoid posting thumbnails *and screenshots* as well. On pixiv, click on an image (twice if it's a gallery) before you download it. On Danbooru and such, click on `view original`."
                    },
                    {
                      "name": "Sources",
                      "value": "To find source of an image, you can either use [Saucenao](https://saucenao.com/) or just Google Search. Pictures from pixiv contain image's ID in the name (78876077_p0 -> https://www.pixiv.net/en/artworks/78876077)."
                    },
                    {
                      "name": "\u200b",
                      "value": "To get access to the nsfw channels, please react <:VignaBlush:622426795417010206> under this message."
                    }
                  ]
                }
              }
            message.channel.send(idk)
        }
*/
    } catch (error) {
        console.error('message error:');
        console.error(error);
    }
}).catch;

client.on("guildMemberUpdate", async (oldMember, newMember) =>{
    try {
        var targetchannel = client.channels.get("686471376651288598");
        var date = new Date;
        var dmy  = date.toLocaleDateString('en-GB', {weekday: "long", year: "numeric", month: "long", day: "2-digit"});
        var hms = date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
        var time = dmy + ' ' + hms;
        var oldnickname = oldMember.nickname;
        var newnickname = newMember.nickname;
        var auditpromise = newMember.guild.fetchAuditLogs({limit: 1}).then(audit => {
            return audit.entries.first();
        });
        var auditresult = await auditpromise;

            if (oldMember.nickname === null) {
                oldnickname = "```N/A```";
            }
            if (newMember.nickname === null) {
                newnickname = "```N/A```";
            }

            if (auditresult["action"] === "MEMBER_UPDATE") {
                var embed = new Discord.RichEmbed()
                .setColor("#0099ff")
                .setTitle("A nickname was changed:")
                .setThumbnail(oldMember.user.displayAvatarURL)
                .setDescription("```" + oldMember.user.tag + " (" + oldMember.user.id + ")```")
                .addField("Old nickname:", oldnickname)
                .addField("New nickname:", newnickname)
                .addField("By:", auditresult["executor"]["username"] + "#" + auditresult["executor"]["discriminator"])
                .addField("Date", time)
                .setFooter("ClosureBot", "https://i.imgur.com/dCNn70Q.png").setTimestamp();
                targetchannel.send(embed);
            }
            else if (auditresult["action"] === "MEMBER_ROLE_UPDATE") {
                var embed = new Discord.RichEmbed()
                .setColor("#0099ff")
                .setTitle("Member's role was changed:")
                .setThumbnail(oldMember.user.displayAvatarURL)
                .setDescription("```" + oldMember.user.tag + " (" + oldMember.user.id + ")```")
                if (auditresult["changes"][0]["key"] === "$add") {
                    embed.addField("Changes:", `✅ ${auditresult["changes"][0]["new"][0]["name"]}`);
                }
                else if (auditresult["changes"][0]["key"] === "$remove") {
                    embed.addField("Changes:", `❌ ${auditresult["changes"][0]["new"][0]["name"]}`);
                }
                embed.addField("By:", auditresult["executor"]["username"] + "#" + auditresult["executor"]["discriminator"])
                .addField("Date", time)
                .setFooter("ClosureBot", "https://i.imgur.com/dCNn70Q.png").setTimestamp();
                targetchannel.send(embed);
            }

    } catch (error) {
        console.error('guildMemberUpdate error:');
        console.error(error);
    }
}).catch;

client.on("messageUpdate", (oldMessage, newMessage) => {
    try {
        var targetchannel = client.channels.get("686471376651288598");
        if (oldMessage.content === newMessage.content) {
            return;
        }
        var old = oldMessage.content;
        if (old.length === 0) {
            old = "```N/A (empty)```"
        }
        var embed = new Discord.RichEmbed()
        .setColor("#cc33ff")
        .setTitle("A message was edited!")
        .setThumbnail(oldMessage.author.displayAvatarURL)
        .setDescription("Author of the message:\n```" + oldMessage.author.tag + " (" + oldMessage.author.id + ")```" + `\n [Jump to the message](https://discordapp.com/channels/${oldMessage.guild.id}/${oldMessage.channel["id"]}/${oldMessage.id})`)
        if (old.length > 1000 || newMessage.content > 1000) {
            let oldmsgpt1 = old.slice(0, 1000);
            let oldmsgpt2 = old.slice(1000);
            let newmsgpt1 = newMessage.content.slice(0, 1000);
            let newmsgpt2 = newMessage.content.slice(1000);
            embed.addField("Original message: part 1:", oldmsgpt1);
            if (oldmsgpt2.length != 0) {
                embed.addField("Original message: part 2:", oldmsgpt2);
            }
            embed.addField("New message: part 1:", newmsgpt1);
            if (newmsgpt2.length != 0) {
            embed.addField("New message: part 2:", newmsgpt2);
            }
        }
        else {
            embed.addField("Original message:", old)
            .addField("New message:", newMessage.content)
        }
        embed.addField("Date", newMessage.editedAt)
        .setFooter("ClosureBot", "https://i.imgur.com/dCNn70Q.png").setTimestamp();
        targetchannel.send(embed);
    } catch (error) {
        console.error('messageUpdate error')
        console.error(error)
    }
}).catch;
client.on("guildMemberRemove", async left => {
    try {
        var targetchannel = client.channels.get("686471376651288598");
        var date = new Date;
        var dmy  = date.toLocaleDateString('en-GB', {weekday: "long", year: "numeric", month: "long", day: "2-digit"});
        var hms = date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
        var time = dmy + ' ' + hms;
        arr = [];
        left.roles.forEach(element => {
            arr.push(element);
        });
        var auditpromise = left.guild.fetchAuditLogs({limit: 1}).then(audit => {
            return audit.entries.first();
        });
        var auditresult = await auditpromise;
        if (auditresult["action"] === "MEMBER_KICK" && auditresult["target"]["id"] === left.user.id) {
            var embed = new Discord.RichEmbed()
            .setColor("#cc9900")
            .setTitle("A member was kicked!")
            .setThumbnail(left.user.displayAvatarURL)
            .setDescription("```" + left.user.tag + " (" + left.user.id + ")```")
            .addField("By:", auditresult["executor"]["username"] + "#" + auditresult["executor"]["discriminator"])
            .addField("Reason:", auditresult["reason"])
            .addField("Roles:", arr)
            .addField("Date", time)
            .setFooter("ClosureBot", "https://i.imgur.com/dCNn70Q.png").setTimestamp();
            targetchannel.send(embed);
        }
        else {
            var embed = new Discord.RichEmbed()
            .setColor("#ffffff")
            .setTitle("A member left.")
            .setThumbnail(left.user.displayAvatarURL)
            .setDescription("```" + left.user.tag + " (" + left.user.id + ")```")
            .addField("Roles:", arr)
            .addField("Date", time)
            .setFooter("ClosureBot", "https://i.imgur.com/dCNn70Q.png").setTimestamp();
            targetchannel.send(embed);
        }

    } catch (error) {
        console.error('guildMemberRemove error:');
        console.error(error);
    }
}).catch;

client.on("guildBanRemove", (guild, user) => {
    try {
        var targetchannel = client.channels.get("686471376651288598");
        var date = new Date;
        var dmy  = date.toLocaleDateString('en-GB', {weekday: "long", year: "numeric", month: "long", day: "2-digit"});
        var hms = date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
        var time = dmy + ' ' + hms;
        var embed = new Discord.RichEmbed()
        .setColor("#cc0000")
        .setTitle("A user was unbanned!")
        .setThumbnail(user.displayAvatarURL)
        .setDescription("```" + user.tag + " (" + user.id + ")```")
        .addField("Date", time)
        .setFooter("ClosureBot", "https://i.imgur.com/dCNn70Q.png").setTimestamp();
        targetchannel.send(embed);
    } catch (error) {
        console.error('guildBanRemove error:');
        console.error(error);
    }
}).catch;

client.on("guildBanAdd", (guild, user) => {
    try {
        var targetchannel = client.channels.get("686471376651288598");
        var date = new Date;
        var dmy  = date.toLocaleDateString('en-GB', {weekday: "long", year: "numeric", month: "long", day: "2-digit"});
        var hms = date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
        var time = dmy + ' ' + hms;
        guild.fetchBan(user).then(ban => {
            var banmsg = ban.reason;
            if (ban.reason == null){
                banmsg = "```None provided```";
            }
            var embed = new Discord.RichEmbed()
            .setColor("#cc0000")
            .setTitle("A user was banned!")
            .setThumbnail(user.displayAvatarURL)
            .setDescription("```" + user.tag + " (" + user.id + ")```")
            .addField("Reason:", banmsg)
            .addField("Date", time)
            .setFooter("ClosureBot", "https://i.imgur.com/dCNn70Q.png").setTimestamp();
            targetchannel.send(embed);
        });
    } catch (error) {
        console.error('ERROR:');
        console.error(error);
    }
}).catch;

client.on("guildMemberAdd", newmem => {
    try {
        var targetchannel = client.channels.get("686471376651288598");
        var date = new Date;
        var now = Date.parse(date);
        var age = Date.parse(newmem.user.createdAt);
        var difference = now - age;
        var maths = 24 * 60 * 60 * 1000;
        var embed = new Discord.RichEmbed()
        .setColor("#33cc33")
        .setTitle("A new user joined!")
        .setThumbnail(newmem.user.displayAvatarURL)
        .setDescription("```" + newmem.user.tag + " (" + newmem.user.id + ")```")
        .addField("Account age:", Math.round(difference / maths) + " days", inline = true)
        .addField("New user count:", newmem.guild.memberCount, inline = true)
        .addField("Date", newmem.joinedAt)
        .setFooter("ClosureBot", "https://i.imgur.com/dCNn70Q.png").setTimestamp();
        targetchannel.send(embed);
    } catch (error) {
        console.error('ERROR:');
        console.error(error);
    }
}).catch;

client.on("messageDelete", msgdel => {
    try {
        if (msgdel.author.id === "663016118893412363") {
            return;
        }
        var targetchannel = client.channels.get("686471376651288598");
        var date = new Date;
        var dmy  = date.toLocaleDateString('en-GB', {weekday: "long", year: "numeric", month: "long", day: "2-digit"});
        var hms = date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
        var time = dmy + ' ' + hms;
        var deltedmsg = msgdel.content;
        if (deltedmsg.length === 0) {
            deltedmsg = "```N/A (empty)```";
        }
        var arr = [];
        if (msgdel.attachments.length != 0) {
            msgdel.attachments.forEach(element => {
                arr.push(element.proxyURL);
            });
        }
        var delembed = new Discord.RichEmbed()
        .setTitle("A message was deleted!")
        .setThumbnail(msgdel.author.displayAvatarURL)
        .setDescription("Author of the message:\n" +
            "```" + msgdel.author.tag + " (" + msgdel.author.id + ")```");
        if (deltedmsg.length > 1000) {
            let delmsgpt1 = deltedmsg.slice(0, 1000);
            let delmsgpt2 = deltedmsg.slice(1000);
            delembed.addField("Content of the message part 1:", delmsgpt1)
            .addField("Content of the message part 2:", delmsgpt2);
        }
        else {
            delembed.addField("Content of the message:", deltedmsg);
        }
        delembed.addField("In a channel:", msgdel.channel)
        .addField("Date:", time)
        .setColor("#ff6600")
        .setFooter("ClosureBot", "https://i.imgur.com/dCNn70Q.png").setTimestamp();
        if (arr.length != "0") {
            delembed.addField("With following files (might be unreliable):", arr.join(" "));
        }
        targetchannel.send(delembed);

    } catch (error) {
        console.error('ERROR:');
        console.error(error);
    }
}).catch;

client.login(config.token);
