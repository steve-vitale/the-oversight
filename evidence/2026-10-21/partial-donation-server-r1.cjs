'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),root=process.cwd();
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.wav':'audio/wav','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const body=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end('Unavailable');}});
server.listen(8931,'127.0.0.1',()=>console.log('Owned partial-donation proof server at http://127.0.0.1:8931'));
