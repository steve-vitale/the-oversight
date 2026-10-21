'use strict';
// Reuse the established byte-verification recipe, adding worker/release metadata.
const fs=require('fs'),Module=require('module');
let source=fs.readFileSync('evidence/2026-10-20/garden-cultivation-live-verify-r1.cjs','utf8').replaceAll('garden-cultivation','company-favor').replaceAll('evidence/2026-10-20/','evidence/2026-10-21/');
const old='const jobs=Object.entries(expectedInputs(process.cwd())),results=[];let next=0;';
if(!source.includes(old))throw Error('Live verification recipe changed');
source=source.replace(old,"const expected={...expectedInputs(process.cwd())};for(const file of ['sw.js','version.json','manifest.json'])expected[file]=sha(fs.readFileSync(file,'utf8'));const jobs=Object.entries(expected),results=[];let next=0;");
const m=new Module(__filename,module);m.filename=__filename;m.paths=module.paths;m._compile(source,__filename);
