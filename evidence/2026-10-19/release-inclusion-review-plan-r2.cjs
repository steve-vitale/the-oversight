'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib');
const dir=__dirname,raw=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(dir,'release-inclusion-next-originals-r1.json.gz')))),names=JSON.parse(fs.readFileSync(path.join(dir,'release-inclusion-next-r1.json'))).rows.filter(r=>r.status==='explicit_source_review_remaining').map(r=>r.file);
const rows=names.map(file=>{const s=raw[file];return{file,requires:[...s.matchAll(/require\((['"])(.*?)\1\)/g)].map(m=>m[2]),assertions:[...s.matchAll(/T\.ok\((['"`])([\s\S]*?)\1/g)].map(m=>m[2]),sourceLines:s.split('\n').length}});
fs.writeFileSync(path.join(dir,'release-inclusion-review-plan-r2.json'),JSON.stringify(rows,null,2)+'\n',{flag:'wx'});for(const r of rows)console.log(JSON.stringify({file:r.file,requires:r.requires,assertions:r.assertions.map(a=>a.slice(0,115))}));
