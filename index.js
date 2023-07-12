import express from 'express';
import mustache from 'mustache';
import url from 'url';
import * as utils from './utils.js';
import * as config from './config.js';
import * as screenshot from './screenshot.js';
import * as ly from './lyrics.js';

const app = express();

// STATE
let lastSong ='';

// template server, it gets all the data and returns a webpage
app.get('/', async(req, res) => {
    let data = {}; 
    console.log('* /', 'Request Received', req.url);
    console.time("renderTemplate");
    utils.currentSong()
        .then(songRes => {
            console.log('* /', 'Song Updated');
            data = songRes;
            const addr = req.query.addr ? req.query.addr : 'addr:111.111.77.77';
            const battery = req.query.battery ? req.query.battery : 'Battery Level: 117%';
        
            data.battery = utils.getPercent(battery);
            data.addr = utils.getIp(addr);
            return utils.getDurationInfo();
        }).then(duration => {
            data.duration = duration;
        }).then(() => {
            console.log('* /', 'Fetching Lyrics');
            return ly.fetchLyrics(data.title, data.artist);
        }).then(lyrics => {
            console.log('* /', 'Sending Template');
            data.lyrics = ly.processLyrics(lyrics || '');
            var output = mustache.render(utils.loadTemplate(), data);
            res.send(output);
            console.timeEnd("renderTemplate");
        })
        .catch(err => {
            console.log('** ERROR', err);
        });
});

// kindle server, if a new song is detected screenshots the webpage then sends it to kindle, code: 200
// if there are no updates returns 204 no-content
app.get('/refresh', async(req, res) => {
    console.log('*');
    // console.log('* /refresh', 'Request Received', req.url);
    utils.currentSong()
        .then(data => {
            // console.log('* /refresh', 'Song Updated', req.url);
            const dfile = data.file;
            const songChanged = dfile && lastSong != dfile;
            
            if (songChanged) {
                console.time("updateKindle");
                console.log("** NEW SONG DETECTED");
                lastSong = dfile;
                const kindleStatusString = url.parse(req.url).query;

                console.time("takeScreenshot");
                screenshot.takeScreenshot(kindleStatusString).then((screenshot) => {
                    console.timeEnd("takeScreenshot");

                    if(screenshot) {
                        console.log("** SCREENSHOT OK");
                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Content-Length': screenshot.length,
                            });
                            console.log('* /refresh', 'Sending Screenshot to Kindle');
                        res.end(screenshot);
                    }
                    else {
                        res.writeHead(500);
                        res.end();
                    }
                    console.timeEnd("updateKindle");
                });
            } else {
                // console.log('* /refresh', 'No Updates Sent', req.url);
                res.writeHead(204);
                res.end();
            }
        });
});

// serve static files js, css, etc
app.use(express.static('template'));

app.listen(config.port, () => {
  console.log(`Koode Server listening on port ${config.port}`)
});

