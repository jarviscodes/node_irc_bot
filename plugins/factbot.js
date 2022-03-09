import dotenv from "dotenv";
import axios from "axios";

export let plugin = {
    command: '!fact',
    exec: function (bot_obj, args) {
        dotenv.config({path: './plugins/.env'});
        axios.get(`https://uselessfacts.jsph.pl/random.json?language=en`).then(result => {
            const fact = result.data.text;
            bot_obj.sendChatMessage(`${fact}`, args.channel);
        }).catch(err => {
            console.log(err);
            bot_obj.sendChatMessage("Not so Fun Fact, our HTTP request failed :(", args.channel);
        })
    }
}
