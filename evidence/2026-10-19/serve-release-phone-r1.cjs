'use strict';
// Disposable UI playtest origin. SW intentionally disabled; use the separate
// installed-lifecycle runner for offline/update verification.
const http=require('http'),fs=require('fs'),path=require('path'),root=process.cwd(),port=Number(process.argv[2]||8853);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Pass an unoccupied user port');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff2':'font/woff2'};
http.createServer((req,res)=>{
 res.setHeader('Cache-Control','no-store');if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
 const u=new URL(req.url,'http://127.0.0.1');if(u.pathname==='/sw.js'){res.writeHead(404);return res.end()}
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname))}catch(e){res.writeHead(400);return res.end()}
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(file,(e,bytes)=>{if(e){res.writeHead(404);return res.end()}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(req.method==='HEAD'?undefined:bytes)});
}).listen(port,'127.0.0.1',()=>console.log(JSON.stringify({root,origin:'http://127.0.0.1:'+port,pid:process.pid,serviceWorker:'disabled for source-bound UI playtests'})));
