import snoowrap from 'snoowrap';
import dotenv from "dotenv";

dotenv.config({path: './plugins/.env'})

export const plugin = {
    command: '!red',
    exec: function(bot_obj, args) {
        const subreddit = args.rest.shift();
        if (!subreddit){
            bot_obj.sendChatMessage("Usage: !red [subreddit]", args.channel);
        }else{
            const client_id = process.env.REDDIT_CLIENT_ID;
            const client_secret = process.env.REDDIT_SECRET;
            const user_name = process.env.BOT_REDDIT_USER;
            const password = process.env.BOT_REDDIT_PASS;

            const r = new snoowrap({
                userAgent: 'JayRadz IRCBot',
                clientId: client_id,
                clientSecret: client_secret,
                username: user_name,
                password: password
            });
            r.getHot(subreddit, {limit: 10}).then(result => {
                bot_obj.sendChatMessage(`Top 10 Reddit posts for ${subreddit}:`, args.channel)
                result.map((v, i) => {
                    bot_obj.sendChatMessage(`${v.title} (+${v.ups})`, args.channel)
                    bot_obj.sendChatMessage(`\t\t=> ${v.url}`, args.channel)
                });
            }).catch(err => {
                console.log(err);
                bot_obj.sendChatMessage("Something went wrong fetching that subreddit Hot page. Are you sure it exists?", args.channel)
            })
        }
    }
}
