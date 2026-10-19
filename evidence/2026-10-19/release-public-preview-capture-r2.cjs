'use strict';
const fs=require('fs'),path=require('path');
const from=path.join(__dirname,'release-public-preview-phone-r1.cjs'),to=path.join(__dirname,'release-public-preview-phone-r2.cjs');let s=fs.readFileSync(from,'utf8');
for(const[a,b]of [
 ["'release-public-preview-phone-'+height+'-r1'","'release-public-preview-phone-'+height+'-r2'"],
 ['responses=[],pending=[],errors=[];','responses=[],pending=[],errors=[],consoleMessages=[],failedRequests=[];'],
 ["page.on('pageerror',e=>errors.push(e.message));","page.on('console',m=>{if(['warning','error'].includes(m.type()))consoleMessages.push({type:m.type(),text:m.text(),location:m.location()})});page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));page.on('pageerror',e=>errors.push(e.message));"],
 ['expected,observed,responses,errors,played,scope:','expected,observed,responses,errors,consoleMessages,failedRequests,played,scope:'],
 ['servedInputsVerified:report.servedInputsVerified,errors}',"servedInputsVerified:report.servedInputsVerified,errors,consoleMessages:consoleMessages.length,failedRequests:failedRequests.length}"]
]){if(!s.includes(a))throw Error('Capture seam not found');s=s.replace(a,b)}
fs.writeFileSync(to,s,{flag:'wx'});console.log(to);
