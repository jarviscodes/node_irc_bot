import tls from 'tls';
import fs from 'fs';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

class IRCBot {
    constructor() {
        this.nickname = process.env.BOT_NICKNAME;
        this.usernames = JSON.parse(process.env.BOT_USERNAMES);
        this.channels = JSON.parse(process.env.BOT_DEV_CHANNELS);

        this.irc_host = process.env.IRC_HOST;
        this.irc_port = parseInt(process.env.IRC_PORT);
        this.connector = tls.connect(this.irc_port, this.irc_host, {}, () => console.log("Connected"));

        this.bot_net_id = "init";

        this.registered = false;

        this.plugins = {}

        this.connector.on('error', (error) => {
            console.log("Could not connect to IRC Server.");
            console.log(error);
            this.connector.destroy();
        })

        this.connector.on("data", (data) => {
            const all_lines = data.toString().split("\n");
            for(const line of all_lines){
                if(line.length > 0) this.parseMessage(line);
            }
        })

        this.connector.on("close", () => {
            console.log("TLS Connection closed");
        })

        this.login();
    }

    login(){
        this.connector.write(`USER ${this.usernames.join(" ")}\n`);
        this.connector.write(`NICK ${this.nickname}\n`);
    }

    async loadPlugins(){
        const dir = fs.opendirSync('./plugins')
        let dirent
        while ((dirent = dir.readSync()) !== null) {
            if (dirent.name.endsWith(".js")){
                const dynimp = await import('./plugins/' + dirent.name);
                this.plugins[dynimp.plugin.command] = dynimp.plugin.exec;
                console.log(`[${this.nickname.yellow}] Loaded plugin ${dirent.name.cyan} with command ${dynimp.plugin.command.red}`);
            }
        }
        dir.closeSync()
    }

    sendChatMessage(message, channel){
        this.sendMessage(`PRIVMSG ${channel} :${message}`)
    }

    parseMessage(message){
        // rfc2812#2.3
        const split_message = message.split(" ");
        if (message.startsWith(":")){
            const prefix = split_message.shift();
            const command = split_message.shift();
            console.log(`[${prefix.yellow}] ${command.brightCyan} ${[...split_message].join(' ').green}`)
            this.handleCommand(command, split_message);
        }else{
            const command = split_message.shift();
            console.log(`${command.brightCyan} ${[...split_message].join(' ').green}`);
            this.handleCommand(command, split_message);
        }
    }

    keepAlive(rest){
        this.sendMessage(`PONG ${rest}`);
    }

    joinChannel(channel_name){
        this.sendMessage(`JOIN ${channel_name}\n`);
    }

    sendMessage(message){
        this.connector.write(`${message}\n`)
    }

    pluginHandler(command, args){
        let exists = Object.keys(this.plugins).includes(command);
        if (exists){
            this.plugins[command](this, args);
        } else {
            this.sendChatMessage("I don't know what to do with that.", args.channel);
        }
    }

    handleCommand(command, rest){
        switch(command){
            case "NOTICE":
                break;
            case "PRIVMSG":
                let channel = rest.shift();
                let message = rest.join(' ');

                // Drop the \r\n at the end.
                message = message.trim();

                // Drop the : before the message
                message = message.substring(1);
                if (message.startsWith("!")){
                    let split_message = message.split(" ");
                    let chat_command = split_message.shift();
                    const args = {
                        channel,
                        rest: split_message
                    }
                    this.pluginHandler(chat_command, args);
                }
                break;
            case "001":
                this.bot_net_id = rest.pop();
                break;
            case "004":
                this.registered = true;
                for (let channel of this.channels){
                    this.joinChannel(channel);
                }
                this.loadPlugins().then(() => console.log(`[${this.nickname.yellow}] ${"Loaded all plugins from plugins directory".green}!`));
                break;
            case "396":
                let bot_nick = rest.shift();
                const new_net = rest.shift();
                let net_split = this.bot_net_id.split("@");
                net_split[1] = new_net;
                this.bot_net_id = net_split.join('@');
                break;
            case "468":
                // Invalid user
                break
            case "PING":
                this.keepAlive(rest[0]);
                break;
        }
    }

}

let x = new IRCBot();