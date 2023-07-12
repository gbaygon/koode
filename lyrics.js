import genius from 'genius-lyrics-api';
import fs from 'fs';
import * as config from './config.js';

// fetch lyrics from genius, caches the results to disk
export async function fetchLyrics(title, artist) {
    const filename =`${artist} - ${title}`.replace('\/','-');
    const file = `${config.lyricsCache}/${filename}.txt`;

    let lyrics = '';

    try {
        lyrics = fs.readFileSync(file).toString();
    } catch {}

    if(!lyrics) {
        const options = {
            apiKey: config.GENIUS_ACCESS_TOKEN,
            title,
            artist,
            optimizeQuery: true
        };
        lyrics = await genius.getLyrics(options)
        try {
            fs.mkdirSync(config.lyricsCache);
        } catch {}

        fs.writeFileSync(file, lyrics || '');
        console.log('* Lyrics Source:', 'Web');
    } else {
        console.log('* Lyrics Source:', 'Cache');
    }
    
    return lyrics;
}

// splits the lyrics in an array - removes [Verse 1], etc. Also removes empty lines
export function processLyrics(lyrics) {
    lyrics = lyrics.split('\n')
        .map(line => line.trim())
        .filter(line => !!line.trim() && line[0] != '[');

    return lyrics;
}
