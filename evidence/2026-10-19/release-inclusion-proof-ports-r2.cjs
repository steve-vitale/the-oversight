'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),primary='038a96b39ebf3d49cf6bf02d22377a2e1cdc8b2e';
const rows=[];for(const[from,to,replacements]of [
 ['scripts/test-gear-usage-audit-20261015.js','scripts/godpath/test-gear-audit-contract.js',[["require('./godpath/lib')","require('./lib')"],["require('./gear-usage-audit')","require('../gear-usage-audit')"]]],
 ['scripts/test-drift-zero-coordinate-20261015.js','evidence/2026-10-19/release-drift-current-r2.cjs',[["require('./godpath/lib')","require('../../scripts/godpath/lib')"]]]
]){const original=cp.execFileSync('git',['show',primary+':'+from],{encoding:'utf8'});let source=original;for(const[a,b]of replacements){if(!source.includes(a))throw Error('Expected import not found');source=source.replace(a,b)}fs.writeFileSync(to,source,{flag:'wx'});rows.push({primary,from,to,originalSha256:crypto.createHash('sha256').update(original).digest('hex'),currentSha256:crypto.createHash('sha256').update(source).digest('hex'),scope:'Imports relocated only; original fixture and assertions preserved.'})}
fs.writeFileSync(path.join(__dirname,'release-inclusion-proof-ports-r2.json'),JSON.stringify(rows,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(rows.map(r=>r.to)));
