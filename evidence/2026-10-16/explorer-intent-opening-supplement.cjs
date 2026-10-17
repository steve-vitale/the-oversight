'use strict';
// Measurement code changed outside the frozen212 gameplay manifest. Preserve
// the original bundle and pin this identical validation overlay separately.
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),assert=require('assert'),dir=__dirname,repo=path.resolve(dir,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const names=['scripts/balance-windows.js','scripts/lib/harness-comparison.js','scripts/lib/policy-comparison.js','scripts/godpath/test-harness-comparison.js'];
const file=path.join(dir,'explorer-intent-opening-measurement-sources.json.gz');
assert(!fs.existsSync(file),'Do not overwrite a frozen supplement');
const predecessor='explorer-intent-opening-sources.json.gz',files=Object.fromEntries(names.map(n=>{const b=fs.readFileSync(path.join(repo,n));return[n,{sha256:sha(b),base64:b.toString('base64')}];}));
fs.writeFileSync(file,z.gzipSync(JSON.stringify({predecessor:{file:predecessor,sha256:sha(fs.readFileSync(path.join(dir,predecessor)))},note:'Validation only, outside212 gameplay inputs. No original frozen source rewritten.',files})+'\n'));
