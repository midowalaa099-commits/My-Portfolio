import lighthouse from 'lighthouse';
import * as launcher from 'chrome-launcher';
import fs from 'node:fs/promises';
const dir = 'outputs/purposeful-motion/';
const chrome=await launcher.launch({chromePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',chromeFlags:['--headless','--no-sandbox']});
try{for(const lang of ['en','ar'])for(const device of ['mobile','desktop'])for(let run=1;run<=3;run++){
 const opts={port:chrome.port,output:['html','json'],onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error',...(device==='desktop'?{formFactor:'desktop',screenEmulation:{mobile:false,width:1440,height:900,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1,requestLatencyMs:0,downloadThroughputKbps:0,uploadThroughputKbps:0}}:{})};
 const r=await lighthouse('http://127.0.0.1:4173/'+lang+'/',opts);
 const name=lang+'-'+device+'-'+run;await fs.writeFile(dir+name+'.json',r.report[1]);await fs.writeFile(dir+name+'.html',r.report[0]);console.log(name,JSON.stringify(Object.fromEntries(Object.entries(r.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)]))));
}}finally{await chrome.kill()}
