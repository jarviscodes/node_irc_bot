import dotenv from "dotenv";
import axios from "axios";

export let plugin = {
    command: '!weather',
    exec: function(bot_obj, args) {
        dotenv.config( {path: './plugins/.env'});
        const owm_api_key = process.env.OWM_API_KEY;
        const location = args.rest.shift();
        if (!location){
            bot_obj.sendChatMessage("Usage: !weather [location]", args.channel);
        }else{
            bot_obj.sendChatMessage("Weather of the day!", args.channel)
            axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${owm_api_key}`).then(result => {
                const data_elem = result.data.shift();
                const city_lat = data_elem.lat;
                const city_lon = data_elem.lon;
                const city_name = data_elem.name;
                bot_obj.sendChatMessage(`Weather for ${city_name} (${city_lat},${city_lon}) :`, args.channel);
                axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${city_lat}&lon=${city_lon}&appid=${owm_api_key}&units=metric`)
                    .then(result => {
                        const result_weather = result.data.weather.shift();
                        const result_info = result.data.main;
                        const result_visibility = result.data.visibility;
                        const result_wind = result.data.wind;
                        const clouds = result.data.clouds;
                        bot_obj.sendChatMessage(`The weather in ${location} today: ${result_weather.description}`, args.channel);
                        bot_obj.sendChatMessage(`Current temperature of ${result_info.temp}. Min: ${result_info.temp_min}°C, Max: ${result_info.temp_max}°C`, args.channel);
                        bot_obj.sendChatMessage(`Atmospheric Humidity: ${result_info.humidity} %`, args.channel);
                        bot_obj.sendChatMessage(`Wind: ${result_wind.speed}KM/h at ${result_wind.deg}° and ${clouds.all} % clouds.`, args.channel);
                    }).catch(err => {
                        console.log(err);
                        bot_obj.sendChatMessage("Something went wrong fetching the weather data.", args.channel);
                    })
            }).catch(err => {
                console.log(err);
                bot_obj.sendChatMessage("Something went wrong fetching the geolocation.", args.channel);
            })
        }
    }
}