import dotenv from "dotenv";
import axios from "axios";

export let plugin = {
    command: '!chuck',
    exec: function (bot_obj, args) {
        dotenv.config({path: './plugins/.env'});
        axios.get(`https://api.chucknorris.io/jokes/random`).then(result => {
            const joke = result.data.value;
            bot_obj.sendChatMessage(`${joke}`, args.channel);
        }).catch(err => {
            console.log(err);
            bot_obj.sendChatMessage("Chuck did a roundhouse kick on our HTTP request and it died :(", args.channel);
        })
    }
}