import fs from 'fs';
import request from 'superagent';
import cp from 'child_process';
import * as config from './config.js';

// regex to match percentajes 
export function getPercent(str) {
    const pattern = /(\d+(\.\d+)?%)/;
    return str.match(pattern)[0];
}

// regex to match ip
export function getIp(str) {
    const pattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    return str.match(pattern)[0];
}

// loads template for rendering
export function loadTemplate(template) {
    const tpl = 'template/index.html';
    return fs.readFileSync(tpl).toString();
}

// get moode song
export function currentSong() {
    return request.get(`${config.moodeServer}/command/?cmd=get_currentsong`)
            .then(songRes => {
                return JSON.parse(songRes.text);
            });
}

// regex to match times i.e: 3:24 
function _getTimes(str) {
    const pattern = /((?:0?[0-9]|1[0-2]):[0-5][0-9])/g;
    return str.match(pattern, str);
}

// get mpc info and parse the current duration
export function getDurationInfo() {
    return new Promise((resolve, reject) => {
        cp.execFile('mpc', (error, stdout, stderr) => {
          if (error) {
            console.error({ error, stdout, stderr });
            reject();
          } else {
            const info = stdout.split('\n');
            if (info.length > 1) {
                const playbackData = info[1];
                const times = _getTimes(playbackData);
                resolve(times[1]);
            } else {
                resolve('N/A');
            }
          }
        });
      });
}