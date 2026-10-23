import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'node:fs/promises';
const chrome=await chromeLauncher.launch({chromePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',chromeFlags:['--headless','--no-sandbox']});
try {
 for(const lang of ['en','ar']) for(const device of ['mobile','desktop']){
 const settings={port:chrome.port,output:['html','json'],onlyCategories:['performance','accessibility','seo'],logLevel:'error',...(device==='desktop'?{formFactor:'desktop',screenEmulation:{mobile:false,width:1440,height:900,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1,requestLatencyMs:0,downloadThroughputKbps:0,uploadThroughputKbps:0}}:{})};
 const result=await lighthouse('http://127.0.0.1:4173/?lang='+lang,settings);
 await fs.writeFile(`outputs/lighthouse-${lang}-${device}.html`,result.report[0]);await fs.writeFile(`outputs/lighthouse-${lang}-${device}.json`,result.report[1]);
 console.log(lang,device,Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])));
 console.log('Findings',Object.values(result.lhr.audits).filter(a=>a.score!==null&&a.score<.9&&a.details).map(a=>({id:a.id,title:a.title,score:a.score,details:a.details.items?.slice(0,3)})));
 }
} finally{await chrome.kill()}
