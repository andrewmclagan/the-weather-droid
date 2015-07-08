var Bot             = require('./droid');
var config          = require('./config');

console.log('WeatherDroid is alive...');

var WeatherDroid    = new Bot(config);

var stream          = WeatherDroid.twit.stream('user', {});

stream.on('message', function (msg) {
  
    if (typeof msg.text == 'string') {

        WeatherDroid.parseTweet(msg.text, msg.user.scren_name);
    }
});