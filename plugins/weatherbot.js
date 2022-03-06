
export let plugin = {
    command: '!weather',
    exec: function(bot_obj, args) {
        bot_obj.sendChatMessage("Weather of the day!", args.channel)
    }
}