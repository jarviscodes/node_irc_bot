
export const plugin = {
    command: '!news',
    exec: function(bot_obj, args) {
        bot_obj.sendChatMessage("News of the day!", args.channel)
    }
}
