import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import tours from './routes/tours';
import cities from './routes/cities';
import regions from './routes/regions';
import ranges from './routes/ranges';
import language from './routes/language';
import authenticate from "./middlewares/authenticate";
import {BrowserService} from "./utils/pdf/BrowserService";
// import {syncDataApplicationSide} from "./jobs/syncDataApplicationSide";
// import {syncFilesApplicationSide} from "./jobs/syncFilesApplicationSide";
import moment from "moment";
const schedule = require('node-schedule');
import {getZuugleCors, hostMiddleware} from "./utils/zuugleCors";
import searchPhrases from "./routes/searchPhrases";

process.env.TZ = 'Europe/Berlin';

/* start api */
let port = 8080;
if(process.env.NODE_ENV === "production"){
    port = 6060;
}

let corsOptions = getZuugleCors();

let app = express();

process.setMaxListeners(0);
app.use(bodyParser.json({limit: '1024mb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json({limit: '1024mb'}));
app.use(express.urlencoded({limit: '1024mb',extended: false}));

//static file access
app.use("/public", cors({}), express.static('public'));

app.use('/api/tours', cors(corsOptions), hostMiddleware, authenticate, tours);
app.use('/api/cities', cors(corsOptions), hostMiddleware, authenticate, cities);
app.use('/api/regions', cors(corsOptions), hostMiddleware, authenticate, regions);
app.use('/api/ranges', cors(corsOptions), hostMiddleware, authenticate, ranges);
app.use('/api/language', cors(corsOptions), hostMiddleware, authenticate, language);
app.use('/api/searchPhrases', cors(corsOptions), hostMiddleware, authenticate, searchPhrases);


app.listen(port, () => console.log('Running on localhost:' + port));

(async () => {
    await BrowserService.getInstance();
})();

process.on ('SIGTERM', async () => {
    await shutdownBrowser();
});
process.on ('SIGINT', async () => {
    await shutdownBrowser();
});
process.on('exit',  async () => {
    await shutdownBrowser();
});

if(process.env.NODE_ENV !== "production"){
    process.once('SIGUSR2', async function () {
        await shutdownBrowser();
        process.kill(process.pid, 'SIGUSR2');
    });
}

const shutdownBrowser = async () => {
    try {
        const instance = await BrowserService.getInstance();
        if(!!instance){
            const browser = instance.getBrowser();
            if(!!browser){
                await browser.close();
                console.log('pupeteer browser successfully closed...')
            }
        }
    } catch(e){
        console.log('error closing pupeteer browser: ', e)
    }
}

