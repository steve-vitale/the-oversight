'use strict';
// Duplicate script tags execute private closures twice. In particular, an
// outer travel wrapper can otherwise generate a receipt invisible to the
// current favor receipt method even though both came from the same file.
const fs=require('fs'),K=require('./lib'),T=K.reporter('Entry script uniqueness');
const html=fs.readFileSync(K.ROOT+'/index.html','utf8').replace(/<!--[\s\S]*?-->/g,'');
function duplicates(text){
 const paths=[...text.matchAll(/<script\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi)].map(m=>m[2].split(/[?#]/)[0]);
 return paths.filter((p,i)=>paths.indexOf(p)!==i);
}
T.ok('every entry script executes once',duplicates(html).length===0,duplicates(html).join(','));
T.ok('a repeated module with a different cache query is rejected',duplicates(html+'<script src="src/js/favor-forage.js?v=reject-control"></script>').includes('src/js/favor-forage.js'));
T.done();
