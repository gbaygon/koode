import puppeteer from 'puppeteer';
import cp from 'child_process';
import * as config from './config.js';
import fs from 'fs';

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 600, height: 800 });

page.on("pageerror", function(err) {  
    console.log("Page error: " + err.toString()); 
});

//await browser.close();


// takes a screenshot from template server url in 'config.templateServerAddr'
export async function takeScreenshot(kindleStatusString) {
    console.log("** TAKING SCREENSHOT")

    try {
        await page.goto(`${config.templateServerAddr}?${kindleStatusString}`, {waitUntil: 'domcontentloaded'});

        // this must be set in template after render finish (if js, else static)
        await page.waitForSelector('#rendered', {timeout: 10_000});

        await page.screenshot({
            path: config.screenshotFile, fullPage: true 
        });

        return _convert(config.screenshotFile);
    } catch(err) {
        console.log("** SCREENSHOT ERROR ", err);
        return '';
    }
}

// converts png file using imagemagick (installed externally, I tried some npm packages for this and they 
// where displayed wrongly or not recognized by kindle)
function _convert(filename) {
    console.log("** CONVERTING SCREENSHOT")
    return new Promise((resolve, reject) => {
    //const args = [filename, '-gravity', 'south', '-rotate', '90', '-extent', '600x800', '-colorspace', 'gray', '-depth', '8', filename];
    const args = [filename, '-gravity', 'center', '-extent', '600x800', '-colorspace', 'gray', '-depth', '8',  '-separate', '-average', filename];
    cp.execFile('convert', args, (error, stdout, stderr) => {
            if (error) {
                console.error({ error, stdout, stderr });
                reject();
            } else {
                const screenshot = fs.readFileSync(filename);
                resolve(screenshot);
            }
        });
    });
}
