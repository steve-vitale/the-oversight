'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process'),B=require('../../scripts/balance-panel'),P=require('../../scripts/balance-proof-update');
const root=process.cwd(),dir=__dirname,common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim());
for(const region of ['na','eu']){
 const src=path.join(common,'release-loot-'+region+'-after-r1','panel.json.gz'),out=path.join(dir,'release-loot-'+region+'-after-r1.json.gz'),panel=JSON.parse(z.gunzipSync(fs.readFileSync(src)));
 P.validate(root,panel);fs.copyFileSync(src,out,fs.constants.COPYFILE_EXCL);
 const prefix=path.join(dir,'release-loot-'+region+'-compare-r1');const r=cp.spawnSync(process.execPath,['scripts/balance-panel.js','compare','--before',path.join(dir,'release-regional-'+region+'-after-r1.json.gz'),'--after',out,'--out',prefix],{encoding:'utf8'});
 fs.writeFileSync(prefix+'.log',r.stdout+r.stderr,{flag:'wx'});if(![0,2].includes(r.status))throw Error('Comparison failed: '+r.status+' '+r.stderr);
 const same=B.manifest(root);if(JSON.stringify(same)!==JSON.stringify(panel.sources))throw Error('Sources changed');
 console.log(JSON.stringify({region,rows:panel.rows.length,neutrality:panel.validity.neutrality,compareExit:r.status}));
}
fs.writeFileSync(path.join(dir,'release-loot-current-sources-r1.json.gz'),z.gzipSync(JSON.stringify(Object.fromEntries(Object.keys(B.manifest(root)).map(p=>[p,fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n')])))),{flag:'wx'});
for(const h of [736,844])for(const stage of [1,2,3,4,5,6,7])fs.copyFileSync(path.join(common,'release-loot-phone-'+h+'-r1','.playwright-mcp','loot-'+stage+'-'+h+'.png'),path.join(dir,'release-loot-phone-'+h+'-stage'+stage+'-r1.png'),fs.constants.COPYFILE_EXCL);
console.log(JSON.stringify({proof:P.update(root,path.join(dir,'release-loot-na-after-r1.json.gz')).panel}));
