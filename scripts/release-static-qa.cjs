// Dependency-free audit of a production build. Never prints candidate secret values.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),zlib=require('node:zlib');
const root=path.resolve(process.env.QA_SITE_DIR||'artifacts/task10-build');
const git=args=>cp.execFileSync('git',['-c','safe.directory='+process.cwd().replaceAll('\\','/'),...args],{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:20*1024*1024});
const read=p=>fs.readFileSync(p,'utf8');
const routes=['/','/aurora/','/projects/','/alizarin/','/streaming/','/about/','/portfolio/','/contact/','/music/','/support/','/stream-assets/','/lore/'];
const files=git(['ls-files','-z']).split('\0').filter(Boolean);
const report={routes:[],broken:[],mailto:[],scripts:[],legacy:[],emDashes:[],history:[],security:[],assets:[],css:{},external:[]};
const external=new Set();
for(const route of routes){
 const file=path.join(root,route,'index.html');if(!fs.existsSync(file)){report.broken.push({route,reason:'missing page'});continue;}
 const html=read(file),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 const entry={route,h1:(html.match(/<h1(?:\s|>)/g)||[]).length,duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),title:html.match(/<title>([\s\S]*?)<\/title>/)?.[1],description:html.match(/<meta name="description" content="([^"]*)"/)?.[1],canonical:html.match(/<link rel="canonical" href="([^"]*)"/)?.[1],ogTitle:html.includes('property="og:title"'),ogImage:html.includes('property="og:image"'),inSitemap:read(path.join(root,'sitemap.xml')).includes('https://vegalyrae.tech'+route)};
 report.routes.push(entry);
 if(entry.h1!==1||entry.duplicates.length||!entry.title||!entry.description||entry.canonical!=='https://vegalyrae.tech'+route||!entry.inSitemap)report.broken.push({route,reason:'metadata/headings/IDs'});
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=m[1].replaceAll('&amp;','&');
  if(url.startsWith('https://vegalyrae.tech'))continue;
  if(url.startsWith('https://')||url.startsWith('http://')){external.add(url);continue;}
  if(url.startsWith('mailto:')){const [address,q]=url.slice(7).split('?');if(address!=='contact@vegalyrae.tech')report.broken.push({route,reason:'unapproved email'});report.mailto.push({route,address,subject:q?decodeURIComponent(new URLSearchParams(q).get('subject')||''):null});continue;}
  if(!url.startsWith('/')&&!url.startsWith('#'))continue;
  const [p,hash]=url.split('#'),clean=decodeURIComponent(p.split('?')[0]);
  const target=clean?path.join(root,clean,clean.endsWith('/')?'index.html':''):file;
  if(!fs.existsSync(target)){report.broken.push({route,url,reason:'missing target'});continue;}
  if(hash&&!read(target).includes('id="'+hash+'"'))report.broken.push({route,url,reason:'missing anchor'});
 }
 for(const m of html.matchAll(/<script\b[^>]*src="([^"]+)"/g))report.scripts.push({route,src:m[1]});
 for(const m of html.matchAll(/<img\b[^>]*>/g))if(!/\balt="/.test(m[0]))report.broken.push({route,reason:'image without alt'});
 if(html.includes('\u2014'))report.emDashes.push({route,scope:'rendered'});
 for(const m of html.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g))for(const id of m[1].split(/\s+/))if(!ids.includes(id))report.broken.push({route,reason:'missing ARIA '+id});
}
for(const file of files.filter(f=>f.endsWith('.md'))){
 let old;try{old=git(['show','origin/main:'+file]);}catch{continue;}
 const route=old.match(/^permalink:\s*(\S+)/m)?.[1];if(!route)continue;
 const generated=read(path.join(root,route,'index.html'));
 const oldIds=[...old.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 report.legacy.push({file,route,missingAnchors:oldIds.filter(id=>!generated.includes('id="'+id+'"'))});
}
const publicKey=read('alizarin.md').match(/data-recaptcha-site-key="([^"]+)"/)[1];
const tokenPatterns=[/ghp_[A-Za-z0-9]{30,}/g,/github_pat_[A-Za-z0-9_]{30,}/g,/AKIA[A-Z0-9]{16}/g,/AIza[A-Za-z0-9_-]{30,}/g,/sk_live_[A-Za-z0-9]{16,}/g,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g];
function scan(text,file,commit){
 for(const pattern of tokenPatterns){pattern.lastIndex=0;if(pattern.test(text))report.security.push({file,commit,kind:'credential candidate'});}
 for(const key of text.match(/6L[A-Za-z0-9_-]{38}/g)||[])if(key!==publicKey)report.security.push({file,commit,kind:'unexpected CAPTCHA key candidate'});
}
for(const file of files.filter(f=>/\.(?:md|html|yml|js|cjs|scss|json)$/.test(f))){
 const text=read(file);scan(text,file,'working-tree');
 if(text.includes('\u2014'))report.emDashes.push({file,scope:'tracked source',count:(text.match(/\u2014/g)||[]).length});
}
const commits=git(['rev-list','--all']).trim().split(/\r?\n/);
for(const commit of commits){
 let matches;try{matches=git(['grep','-I','-n','-E','6L[A-Za-z0-9_-]{38}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16}|AIza[A-Za-z0-9_-]{30,}|sk_live_[A-Za-z0-9]{16,}|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY',commit,'--','*.md','*.html','*.yml','*.js','*.cjs','*.scss','*.json']);}catch(error){matches=error.stdout||'';}
 for(const line of String(matches).split(/\r?\n/).filter(Boolean)){const parts=line.split(':');scan(parts.slice(3).join(':'),parts[1],commit);}
}
report.history={commitsScanned:commits.length,scope:'tracked text on all reachable refs; token-pattern scan, not proof of absence of every possible secret'};
const css=fs.readFileSync(path.join(root,'assets/css/style.css'));
report.css={bytes:css.length,gzipBytes:zlib.gzipSync(css).length};
for(const file of files.filter(f=>/\.(jpg|png|svg)$/i.test(f)))report.assets.push({file,bytes:fs.statSync(file).size});
report.external=[...external].sort();
report.exclusions={artifacts:!fs.existsSync(path.join(root,'artifacts')),scripts:!fs.existsSync(path.join(root,'scripts')),readme:!fs.existsSync(path.join(root,'README.md'))};
const out=path.resolve('artifacts/task10-static-results.json');fs.writeFileSync(out,JSON.stringify(report,null,2));
console.log(JSON.stringify({routes:report.routes.length,broken:report.broken,legacy:report.legacy,secretCandidates:report.security.length,history:report.history,emDashes:report.emDashes,css:report.css,exclusions:report.exclusions,report:out},null,2));
if(report.broken.length||report.security.length||report.legacy.some(r=>r.missingAnchors.length))process.exitCode=1;
