const axios = require("axios");
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// function to get all the match id in selected date
async function getAllMatch (date){
    const options = {
      method: 'GET',
      url: 'https://api-nba-v1.p.rapidapi.com/games',
      params: {date: date},
      headers: {
        'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com',
        'X-RapidAPI-Key': 'd0698d0d03msh6810f7043c2c9dep1fc38fjsndb8f573c5ca7'
      }
    };
    
    return axios.request(options).then(function (response) {
        let matchID = [];
        for(i in response.data.response ){
            matchID.push(response.data.response[i].id);
        }
        console.log(matchID)
        return matchID;
    }).catch(function (error) {
        console.error(error);
    });
}

// function to get stats all the player in match 
async function StatisticsPerGameId(IDs) {
    console.log(IDs);
    let doubldoubl = [];
    const requests = [];
    // call api by all the id in the array 
    if(IDs ==undefined){
      doubldoubl.push({
        name: 'You have exceeded the rate limit per minute for your plan, BASIC, by the API provider',
        teamOfplayer: '-',
        teamOfplayerlogo: 'https://www.seekpng.com/png/detail/334-3345964_error-icon-download-attention-symbol.png',
        points: '-',
        pos: '-',
        min: '-',
        fgm: '-',
        fga: '-',
        fgp: '-',
        ftm: '-',
        fta: '-',

    });
      return doubldoubl;
    }
    for (let i = 0; i < IDs.length; i++) {
        const options = {
            method: 'GET',
            url: 'https://api-nba-v1.p.rapidapi.com/players/statistics',
            params: { game: IDs[i] },
            headers: {
                'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com',
                'X-RapidAPI-Key':
                    'd0698d0d03msh6810f7043c2c9dep1fc38fjsndb8f573c5ca7',
            },
        };
        requests.push(axios.request(options));
    }

    const allRequests = await Promise.allSettled(requests);
    //get stats of all player in the match
    allRequests.forEach(res => {
        if (res.status === 'error') console.log(res.reason);
        if (res.status !== 'fulfilled') return;
        // console.log(res);
        res.value.data.response.forEach(stat => {
            let dd = 0;
            // check the condition of Double-Double
            if (stat.points >= 10) dd += 1;
            if (stat.totReb >= 10) dd += 1;
            if (stat.assists >= 10) dd += 1;
            if (stat.steals >= 10) dd += 1;
            if (stat.blocks >= 10) dd += 1;
            if (dd == 2) {
              //push to array the player that meet the condition
                doubldoubl.push({
                    name: stat.player.firstname + ' ' + stat.player.lastname,
                    teamOfplayer: stat.team.name,
                    teamOfplayerlogo: stat.team.logo,
                    points: stat.points,
                    pos: stat.pos,
                    min: stat.min,
                    fgm: stat.fgm,
                    fga: stat.fga,
                    fgp: stat.fgp,
                    ftm: stat.ftm,
                    fta: stat.fta,
                });
            }
            dd = 0;
        });
    });

    console.log(doubldoubl);
    return doubldoubl;
}


//serving static files
  app.use(express.static("public"));
  app.use("/css", express.static(__dirname + "public/css"));
//declear engine
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");
  
  app.get('/', function(req, res) {
    res.render('index.pug', {title: "NBA",players:[]});
});

  app.post('/', function(req, res) {
    let { date } = req.body;
    var string = date.split("/");
    let exctdate = string[2] + '-' + string[0] + '-' + string[1] ;
    console.log(exctdate)
    getAllMatch(exctdate)
    .then(StatisticsPerGameId)
    .then((value) => {
      res.render('index.pug', {title: "NBA",players:value})
    });
});

//run the server 
  app.use('/', router);
  app.listen(process.env.port || 3000);
  console.log('Running at Port 3000');