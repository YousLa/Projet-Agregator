let https = require('https');
let http = require('http');
let parseString = require('xml2js').parseString;
// npm install md5
let md5 = require('md5');
// N'oubliez pas d'intaller : npm install dotenv
require('dotenv').config();
// npm install request
const request = require('request');

// Simple serveur Web avec Express 
// ^ On fait appel à un module Express avec la fonction require
const express = require('express');

// ^ Ici on crée une instance d'Express appelée app. Elle sera utilisée pour configurer et exécuter votre application
const app = express();

// ^ On lui dit d'utiliser pour la racine de mon site, le dossier htdoc
app.use('/', express.static(__dirname + '/htdocs'));

// ^ Met en place le moteur de rendu en ejs 
app.set('view engine', 'ejs');

// ^ Cette partie configure le serveur pour écouter les connexions sur le port 8080. Lorsque le serveur démarre, il affiche le message "Listeing ..." dans l'output'
app.listen(8080, function () {
    console.log('Listening on port 8080');
});

// ^ Quand notre application reçoit une requête de type get sur la route (/)
app.get('/', function (request, response) {
    // Fusion du ejs avec mes data
    response.render('index.ejs', dataToDisplay);
});

// Création d'un objet dataToDsiplay qui contient toutes les données qui seront fusionnée avec le template
let dataToDisplay = new Object();
dataToDisplay.weather = new Object();
dataToDisplay.weather.temperatures = [];
dataToDisplay.jeuxVideo = new Object();
dataToDisplay.jeuxVideo.news = [];
dataToDisplay.giphy = new Object();
dataToDisplay.giphy.item = [];
dataToDisplay.lol = new Object();
dataToDisplay.lol.news = [];
dataToDisplay.horoscope = new Object();
dataToDisplay.movie = new Object();
dataToDisplay.movie.data = [];
dataToDisplay.nasa = new Object();
dataToDisplay.anime = new Object();


updateRSSJeuxVideo();
updateWeather();
updateGiphy();
updateLol();
updateMarvel();
updateHoroscope();
updateMovie();
updateNasa();
updateAnime();

// ! DONE
// #region JeuxVideo.com

function updateRSSJeuxVideo() {
    // Envoyer une requête de type GET à l'adresse :
    // https://www.jeuxvideo.com/rss/rss-switch.xml
    // Pour obtenir une réponse XML

    let request = {
        "host": "www.jeuxvideo.com",
        "port": 443,
        "path": "/rss/rss-switch.xml"
    };

    https.get(request, receiveResponseCallback);
    // 30 minutes
    setTimeout(updateRSSJeuxVideo, 1000 * 60 * 30);
    // console.log("requête envoyée");

    function receiveResponseCallback(response) {
        // console.log('Got response:' + response.statusCode);
        let rawData = "";
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', function () {
            // console.log(rawData);
            parseString(rawData, function (err, result) {
                let date = new Date(result.rss.channel[0].item[0].pubDate);

                // Extraction du jour, du mois et de l'année
                let jour = date.getDate();
                let mois = date.getMonth() + 1; // Les mois commencent à 0, donc on ajoute 1
                let annee = date.getFullYear() % 100; // On prend les deux derniers chiffres de l'année

                // Formatage avec ajout de zéros pour assurer deux chiffres pour le jour et le mois
                let jourFormat = (jour < 10) ? `0${jour}` : jour;
                let moisFormat = (mois < 10) ? `0${mois}` : mois;

                // Affichage de la date au format DD-MM-YY
                let dateFormatee = `${jourFormat}/${moisFormat}/${annee}`;
                // console.log(dateFormatee);

                let item = {
                    "title": result.rss.channel[0].item[0].title[0],
                    "image": result.rss.channel[0].item[0].enclosure[0].$.url,
                    "link": result.rss.channel[0].item[0].link,
                    "description": result.rss.channel[0].item[0].description,
                    "date": dateFormatee,
                    "createur": result.rss.channel[0].item[0]['dc:creator'][0]
                }
                dataToDisplay.jeuxVideo.news.push(item);
                // console.log(dataToDisplay.jeuxVideo.news);
            });
        });
    }
}
// #endregion

// ! DONE
// #region Weather
function updateWeather() {
    // Envoyer une requête de type GET à l'adresse :
    // https://api.openweathermap.org/data/2.5/weather?lat=50.499527&lon=4.475402500000001&appid=...
    // Pour obtenir une réponse JSON

    let path = "/data/2.5/weather?lat=50.499527&lon=4.475402500000001&appid=" + process.env.WEATHER_API_KEY;

    let request = {
        "host": "api.openweathermap.org",
        "port": 443,
        "path": path
    };
    // console.log(path);

    https.get(request, receiveResponseCallback);
    // 5 minutes
    setTimeout(updateWeather, 1000 * 60 * 60);

    function receiveResponseCallback(response) {
        let rawData = "";
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', function () {
            // console.log(rawData);
            let weather = JSON.parse(rawData);
            dataToDisplay.weather.temperatures = weather;
            dataToDisplay.weather.temperatures.celsius = parseInt((weather.main.temp) - 273.15);
            dataToDisplay.weather.temperatures.icon = "http://openweathermap.org/img/w/" + weather.weather[0].icon + ".png";
            // console.log(dataToDisplay.weather.temperatures.icon);
        });
    }
}

// #endregion

// ! DONE
// #region Giphy

function updateGiphy() {
    // Envoyer une requête de type GET à l'adresse :
    // https://api.giphy.com/v1/gifs/random?api_key=....
    // Pour obtenir une réponse JSON

    let path = "/v1/gifs/random?api_key=" + process.env.GIPHY_API_KEY
    // console.log(path);
    let request = {
        "host": "api.giphy.com",
        "port": 443,
        "path": path
    };

    https.get(request, receiveResponseCallback);
    setTimeout(updateGiphy, 5000);

    function receiveResponseCallback(response) {
        // console.log('Got response:' + response.statusCode);
        let rawData = "";
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', function () {
            //console.log(rawData);
            let giphy = JSON.parse(rawData);
            dataToDisplay.giphy.item = giphy;
            // console.log(dataToDisplay.giphy.item.data.embed_url);
        });
    }
}

// #endregion

// ! DONE
// #region lol

function updateLol() {

    // Envoyer une requête de type GET à l'adresse : 
    // https://www.team-aaa.com/rss/game_lol.xml
    // Pour obtenir une réponse XML

    let request = {
        "host": "www.team-aaa.com",
        "port": 443,
        "path": "/rss/game_lol.xml"
    };

    https.get(request, receiveResponseCallback);
    // 30 minutes
    setTimeout(updateLol, 1000 * 60 * 30);
    // console.log("requête envoyée");

    function receiveResponseCallback(response) {
        // console.log('Got response:' + response.statusCode);
        let rawData = "";
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', function () {
            // console.log(rawData);
            parseString(rawData, function (err, result) {

                let date = new Date(result.rss.channel[0].item[0].pubDate);

                // Extraction du jour, du mois et de l'année
                let jour = date.getDate();
                let mois = date.getMonth() + 1; // Les mois commencent à 0, donc on ajoute 1
                let annee = date.getFullYear() % 100; // On prend les deux derniers chiffres de l'année

                // Formatage avec ajout de zéros pour assurer deux chiffres pour le jour et le mois
                let jourFormat = (jour < 10) ? `0${jour}` : jour;
                let moisFormat = (mois < 10) ? `0${mois}` : mois;

                // Affichage de la date au format DD-MM-YY
                let dateFormate = `${jourFormat}/${moisFormat}/${annee}`;
                // console.log(dateFormatee);

                let item = {
                    "articles": result.rss.channel[0],
                    "date": dateFormate
                }
                dataToDisplay.lol.news.push(item);
                // console.log(dataToDisplay.lol.news[0].articles);
            });
        });
    }
}

// #endregion

// #region Marvel

function updateMarvel() {
    // Envoyer une requête de type GET à l'adresse :
    // https://gateway.marvel.com/v1/public/characters?apikey=
    // Pour obtenir une réponse JSON

    let ts = (new Date()).getTime();
    let hash = md5("" + ts + process.env.MARVEL_PRIVATE_KEY + process.env.MARVEL_PUBLIC_KEY);
    let path = "/v1/public/comics?ts=" + ts + "&apikey=" + process.env.MARVEL_PUBLIC_KEY + "&hash=" + hash;
    // console.log(path);
    let request = {
        "host": "gateway.marvel.com",
        "port": 443,
        "path": path
    };

    https.get(request, receiveResponseCallback);

    // console.log("requête envoyée");

    function receiveResponseCallback(response) {
        console.log('Got response:' + response.statusCode);
        let rawData = "";
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', function () {
            // console.log(rawData);
        });
    }
}

// #endregion

// #region Horoscope
function updateHoroscope() {
    // Envoyer une requête de type GET à l'adresse :
    // https://any.ge/horoscope/api/?sign=aquarius&type=daily&day=today&lang=en
    // Pour obtenir une réponse JSON

    const options = {
        url: 'https://any.ge/horoscope/api/?sign=aquarius&type=daily&day=today&lang=en',
        headers: {
            'Accept': 'application/json'
        }
    };

    // 30 minutes
    setTimeout(updateLol, 1000 * 60 * 30);

    request(options, callback);

    function callback(error, response, rawData) {
        if (!error && response.statusCode == 200) {
            const horoscope = JSON.parse(rawData);
            dataToDisplay.horoscope.sign = horoscope[0].sign;
            dataToDisplay.horoscope.date = horoscope[0].date;
            dataToDisplay.horoscope.text = horoscope[0].text.replace(/<[^>]*>/g, '');  // retirer les balises avec .replace(/<[^>]*>/g, '')
        }
    }
}

// #endregion

// ! DONE
// #region Movie

function updateMovie() {
    // Envoyer une requête de type GET à l'adresse :
    // https://api.themoviedb.org/3/movie/upcoming?api_key=
    // Pour obtenir une réponse JSON


    // 30 minutes
    setTimeout(updateLol, 1000 * 60 * 30);

    let path = "/3/movie/popular?api_key=" + process.env.MOVIEDB_API_KEY + "&language=fr-FR";

    let request = {
        "host": "api.themoviedb.org",
        "port": 443,
        "path": path
    };

    https.get(request, receiveResponseCallback);

    function receiveResponseCallback(response) {
        let rawData = "";
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', function () {
            let movieDBApiData = JSON.parse(rawData);
            dataToDisplay.movie.data = movieDBApiData.results;

            // Format the release date
            let rawDate = dataToDisplay.movie.data[0].release_date;
            let formattedDate = formatReleaseDate(rawDate);
            dataToDisplay.movie.data[0].release_date = formattedDate;

            // console.log(dataToDisplay.movie.data[0]);
        });
    }

    // Function to format the release date
    function formatReleaseDate(rawDate) {
        let dateParts = rawDate.split("-");
        let year = dateParts[0].substring(2);
        let month = dateParts[1];
        let day = dateParts[2];

        return `${day}/${month}/${year}`;
    }
}
// #endregion

// ! DONE
// #region Nasa
function updateNasa() {

    // Envoyer une requête de type GET à l'adresse :
    // https://api.nasa.gov/planetary/apod?api_key=...
    // Pour obtenir une réponse JSON

    // 24heures
    setTimeout(updateLol, 1000 * 60 * 60 * 24);

    let path = "/planetary/apod?api_key=" + process.env.NASA_API_KEY;
    // console.log(path);

    let request = {
        "host": "api.nasa.gov",
        "port": 443,
        "path": path
    };

    https.get(request, receiveResponseCallback);

    console.log("requête envoyée");

    function receiveResponseCallback(response) {
        console.log('Got response:' + response.statusCode);
        let rawData = "";
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', function () {
            let nasa = JSON.parse(rawData);
            dataToDisplay.nasa = nasa;
            // console.log(dataToDisplay.nasa);
        });
    }

}

// #endregion

// ! DONE
// #region Anime

function updateAnime() {
    // Envoyer une requête de type GET à l'adresse :
    // https://animechan.xyz/api/random
    // Pour obtenir une réponse JSON

    // 5 minutes
    setTimeout(updateAnime, 1000 * 60);

    let request = {
        "host": "animechan.xyz",
        "port": 443,
        "path": "/api/random"
    };

    https.get(request, receiveResponseCallback);

    console.log("requête envoyée");

    function receiveResponseCallback(response) {
        console.log('Got response:' + response.statusCode);
        let rawData = "";
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', function () {
            let anime = JSON.parse(rawData);
            dataToDisplay.anime = anime;
            console.log(dataToDisplay.anime);
        });
    }

}


// #endregion


// console.log(dataToDisplay);