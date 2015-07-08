'use strict';

var Twit    = require('./node_modules/twit/lib/twitter');
var Weather = require('./weather.js');
var NLP     = require('nlp_compromise');

var Droid   = module.exports = function(config) { 
  this.twit = new Twit(config);
};

Weather.defaults({units:'metric', lang:'en', mode:'json'});


/**
 * Accepted "weather" keywords
 *
 * @type Array
 */
Droid.prototype.acceptedKeywords = ['today', 'tomorrow', 'forecast'];

/**
 * Post a new tweet
 *
 * @param String status
 * @param Callback callback
 */
Droid.prototype.tweet = function (status, callback) {

    if(typeof status !== 'string') {
      return callback(new Error('tweet must be of type String'));
    } else if(status.length > 140) {
      return callback(new Error('tweet is too long: ' + status.length));
    }

    this.twit.post('statuses/update', { status: '@' + this.screen_name + ' ' + status }, callback);

    console.log('#Tweeting: ', status);
};

/**
 * Prase a direct message
 *
 * @param String tweet
 */
Droid.prototype.parseTweet = function (tweet, screen_name) {

    this.screen_name = screen_name;

    var postcodes = this.getPostcodes(tweet); 
    var keywords  = this.getKeywords(tweet);  

    if (postcodes[0] && keywords[0]) {

        switch(keywords[0]) {

            case 'today':
                this.todaysWeather(postcodes[0]);
                break;

            case 'tomorrow':
                this.tomorrowsWeather(postcodes[0]);
                break;

            case 'forecast':
                var days = this.getDays(tweet); 
                this.weatherForecast(postcodes[0], days[0]);
                break;                

            default:
                this.tweet('Sorry I don\'t understand..!', function(){});
        }
    }
};

/**
 * Get post codes from a string
 *
 * @param String tweet
 */
Droid.prototype.getPostcodes = function (tweet) {

    var postcodes = tweet.match(/\d{3}[a-zA-Z0-9]/g); // reg-ex finds ALL groups of 4 digits

    return (postcodes) ? postcodes : [0];
};

/**
 * Get days number
 *
 * @param String tweet
 */
Droid.prototype.getDays = function (tweet) {

    var days = tweet.match(/(\d+)(?!.*\d)/g); // reg-ex finds last number occurence

    return (days > 0) ? days : 0;
};

/**
 * Get key words from a string
 *
 * @param String tweet
 */
Droid.prototype.getKeywords = function(tweet) {

    var keywords = [];

    for (var i = 0; i < this.acceptedKeywords.length; i++) {

        if (tweet.indexOf(this.acceptedKeywords[i]) > -1) {

            keywords.push(this.acceptedKeywords[i]);
        }
    }

    return keywords;
};


/**
 * Calculates the "Heat Index", a more accurate temp gauge - https://en.wikipedia.org/wiki/Heat_index
 *
 * @param Integer temp
 * @param Integer humidity
 */
Droid.prototype.heatIndex = function (temp, humidity) {

    var t = temp || 0;
    var h = humidity || 0;

    t = (9 * t / 5 + 32) // to fh

    // Steadman's result
    var heatIndex = 0.5 * (t + 61 + (t - 68) * 1.2 + h * 0.094);

    // regression equation of Rothfusz is appropriate
    if (t >= 80) {
        var heatIndexBase = (-42.379                      +
                               2.04901523 * t             +
                              10.14333127         * h     +
                              -0.22475541 * t     * h     +
                              -0.00683783 * t * t         +
                              -0.05481717         * h * h +
                               0.00122874 * t * t * h     +
                               0.00085282 * t     * h * h +
                              -0.00000199 * t * t * h * h);
        // adjustment
        if (h < 13 && t <= 112) {
            heatIndex = heatIndexBase - (13 - h) / 4 * Math.sqrt((17 - Math.abs(t - 95)) / 17);
        } else if (h > 85 && t <= 87) {
            heatIndex = heatIndexBase + ((h - 85) / 10) * ((87 - t) / 5)
        } else {
            heatIndex = heatIndexBase;
        }
    }
    
    return (5 * (heatIndex - 32) / 9); // to c
}

/**
 * Prases weather data into a human readable string... kinda...
 *
 * @param Object weatherData
 * @param String tense
 */
Droid.prototype.humanizeWeatherData = function (weatherData, weatherClass, tense) {

    // weather data
    var heatIndex       = this.heatIndex(weatherData.temp, weatherData.humidity);
    var tip             = '';

    // build class response
    switch(weatherClass) {

        case 'Clouds':
            weatherClass = 'cloudy';
            break;

        case 'Rain':
            weatherClass = 'rainy'
            break;

        case 'Clear':
            weatherClass = 'clear'
            break;  

        case 'Snow':
            weatherClass = 'snowing!'
            break; 

        case 'Extreme':
            weatherClass = 'wild!!'
            break;                                      

        default:
            weatherClass = 'and classed as '+weatherClass;
    }    

    // description strings
    var tempDescriptions = [
        this.parseTense('It is',tense)+' '+weatherData.temp+'C (feels like '+Math.round(heatIndex)+'C) outside',
        this.parseTense('It is',tense)+' '+weatherData.temp+'C (feels like '+Math.round(heatIndex)+'C)',
        'The temprature '+this.parseTense('is',tense)+' '+weatherData.temp+'C (feels like '+Math.round(heatIndex)+'C)',
    ];
    var classDescriptions = [
        'and '+weatherClass,
        'and '+this.parseTense('will be',tense)+' '+weatherClass
    ];
    var tipDescription = {
        cold:   ['don\'t forget to rug up!', 'stay warm.','Brrrr thats chilly!','don\'t catch a cold!'],
        warm:   ['enjoy the day!','go to the park.','go outside its warm!'],
        hot:    ['take your swimmers...','it\'s beach weather!'],
        wet:    ['pack an umberalla.', 'wear a raincoat.', 'stay dry..!'],
    };

    // determine tip
    if (heatIndex < 15) {
        tip = tipDescription.cold[Math.floor(Math.random()*tipDescription.cold.length)];
    }
    else if (heatIndex > 15 && heatIndex < 29) {
        tip = tipDescription.warm[Math.floor(Math.random()*tipDescription.warm.length)];
    }
    else if (heatIndex > 29) {
        tip = tipDescription.hot[Math.floor(Math.random()*tipDescription.hot.length)];
    }

    if ( !(Math.random()+.5|0) && weatherClass == 'Rain') {
        tip = tipDescription.wet[Math.floor(Math.random()*tipDescription.wet.length)];
    }

    // build
    var response =  tempDescriptions[Math.floor(Math.random()*tempDescriptions.length)] +
                    ' ' +
                    classDescriptions[Math.floor(Math.random()*classDescriptions.length)] +
                    ', ' +
                    tip;
    
    return response;
};

/**
 * parse tense
 *
 * @param String text
 * @param String tense
 */
Droid.prototype.parseTense = function (text, tense) {

    text = NLP.pos(text);

    return (tense == 'future') ? text.to_future().text() : text.to_present().text();
};

/**
 * tweets todays weather for a postcode
 *
 * @param Integer postcode
 */
Droid.prototype.todaysWeather = function (postcode) {

    var _self = this; // closure ref

    Weather.now({zip: postcode+',AU'}, function(err, response) {

        var text = _self.humanizeWeatherData(response.main, response.weather[0].main);

        _self.tweet(text, function(){});
    }); 
};

/**
 * tweets tomorrows weather for a postcode
 *
 * @param Integer postcode
 */
Droid.prototype.tomorrowsWeather = function (postcode) {

    var _self = this; // closure ref

    Weather.forecast({q: postcode+',AU', cnt: 0}, function(err, response) {

        var nextDay         = response.list[0].dt + 24*60*60;
        var weatherData     = {};
        var weatherClass    = {};

        // find neartest match .. could be better...
        for(var i = 0; i < response.list.length; i++) {

            if (response.list[i].dt >= nextDay) {

                weatherData = response.list[i].main;
                weatherClass = response.list[i].weather[0].main;
            }
        }

        var text = _self.humanizeWeatherData(weatherData, weatherClass, 'future');

        _self.tweet(text, function(){});
    }); 
};

/**
 * tweets tomorrows weather for a postcode
 *
 * @param Integer postcode
 */
Droid.prototype.weatherForecast = function (postcode, days) {

    var _self = this; // closure ref

    Weather.forecast({q: postcode+',AU', cnt: 0}, function(err, response) {

        var nextDay         = response.list[0].dt + days*24*60*60;
        var weatherData     = {};
        var weatherClass    = {};

        // find neartest match .. could be better...
        for(var i = 0; i < response.list.length; i++) {

            if (response.list[i].dt >= nextDay) {

                weatherData = response.list[i].main;
                weatherClass = response.list[i].weather[0].main;
            }
        }

        var text = _self.humanizeWeatherData(weatherData, weatherClass, 'future');

        _self.tweet(text, function(){});
    }); 
};

