// Anonymous public destination checks. No playback, sign-in or form submissions.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.resolve('artifacts/task10-tools/node_modules/playwright'));
const entries=[
 ['Twitch profile','https://www.twitch.tv/vegalyraebard','vegalyraebard'],
 ['Volstead collection','https://www.twitch.tv/collections/5SZ4s4DFrRe9DA','Shadow over Volstead'],
 ['Horror reading VOD','https://www.twitch.tv/videos/2877789055','King in Yellow'],
 ['Music channel','https://www.youtube.com/@VegaLyrae','VegaLyrae'],
 ['Clips channel','https://www.youtube.com/@VegaAuroraClips','VegaAuroraClips'],
 ['Technical channel','https://www.youtube.com/@VegaLDev','VegaLDev'],
 ['Featured cover','https://youtu.be/3Xoxgwa6pm4','Looping'],
 ['Aurora playlist','https://www.youtube.com/watch?v=3Xoxgwa6pm4&list=PLp2tGsotekMwhZarf9SFwIOiNX7mMJeDF','Looping'],
 ['Other covers playlist','https://www.youtube.com/watch?v=QgySd_Pq5cY&list=PLp2tGsotekMwOQKgH1yXwmUF72NF9DoRb',''],
 ['SoundCloud','https://soundcloud.com/vegalyrae','Vega'],
 ['Ko-fi','https://ko-fi.com/vegalyrae','Vega'],
 ['Chiptune Constellations','https://ko-fi.com/s/768000eed8','Chiptune'],
 ['Funky Computer','https://on.soundcloud.com/tEzd1QGjq29WjTAC6','Funky Computer'],
 ['Discord invite','https://discord.gg/UPQgsszwZA',''],
 ['GitHub profile','https://github.com/vegalyraevt','Vega Lyrae'],
 ['LinkBot repository','https://github.com/vegalyraevt/Discord_LinkBot','Discord_LinkBot'],
 ['ALIZARIN repository','https://github.com/ALIZARINENGINE/AlizarinEngine','AlizarinEngine'],
 ['826michigan','https://www.826michigan.org/about/','826michigan'],
 ['X profile','https://x.com/VegaLyraeVT','VegaLyrae']
];
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const context=await browser.newContext(),results=[];
 await context.route(/\.(?:m3u8|mp4)(?:\?|$)/,r=>r.abort());
 for(const [name,url,expected]of entries){
  const page=await context.newPage();let status,title='',text='',destination=url,error;
  try{const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:15000});status=response?.status();await page.waitForTimeout(1000);title=await page.title();text=await page.locator('body').innerText({timeout:2000});destination=page.url();}catch(e){error=e.message.split('\n')[0];destination=page.url();}
  let classification='Unverified because of platform restrictions';
  const restricted=/access denied|verify (?:you|that)|captcha|unusual traffic|automated|checking your browser|403 forbidden/i.test(text)||!!error||status===403||status===429;
  const unavailable=/video (?:is |has been )?(?:unavailable|removed)|content (?:is )?(?:no longer |not )available|page (?:was |is )?not found|this (?:video|collection) is unavailable/i.test(text)||status===404||status===410;
  if(!restricted&&unavailable)classification='Unavailable';
  else if(!restricted&&status>=200&&status<300&&expected&&(title+' '+text).toLowerCase().includes(expected.toLowerCase()))classification=destination===url?'Verified':'Redirected to a valid destination';
  results.push({name,url,destination,status,title,classification,error,scope:'Rendered anonymous page; no media playback test'});
  console.log(name+': '+classification+' ('+(status||'no HTTP response')+')');
  await page.close();
 }
 await browser.close();
 fs.writeFileSync('artifacts/task10-external-results.json',JSON.stringify(results,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
