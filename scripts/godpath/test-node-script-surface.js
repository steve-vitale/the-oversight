'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),H=require('../sim-harness'),K=require('./lib'),T=K.reporter('Full native script surface');
(async()=>{const parent=fs.realpathSync(os.tmpdir()),tmp=fs.mkdtempSync(path.join(parent,'oversight-script-surface-'));try{
 const expected=Array.from({length:83},(_,i)=>'src/js/fixture-'+i+'.js').concat('src/js/bootstrap-app.js');
 fs.writeFileSync(path.join(tmp,'index.html'),`<!-- <script src="src/js/commented.js"></script> --><script>const example='<script src="src/js/inline-example.js">';</script>`+expected.map(f=>`<script defer src="${f}?v=test"></script>`).join('\n')+`<script src='src/js/app.js'></script><script src="https://example.invalid/remote.js"></script><script data-src="src/js/lazy-only.js"></script>`);
 T.ok('all83+ scripts retain exact browser order and strip cache queries',JSON.stringify(H.nodeScriptFiles(tmp))===JSON.stringify(expected));
 T.ok('comments, inline strings, remote/data-src tags and the DOM adapter do not become modules',!H.nodeScriptFiles(tmp).some(f=>/commented|inline-example|remote|lazy-only|\/app\.js$/.test(f)));
}finally{assert(tmp.startsWith(parent+path.sep)&&path.basename(tmp).startsWith('oversight-script-surface-'));fs.rmSync(tmp,{recursive:true,force:true});}
 const html=fs.readFileSync(path.join(K.ROOT,'index.html'),'utf8'),legacy=(html.match(/src\/js\/[^"']*?\.js/g)||[]).filter(f=>!/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(f));
 T.ok('current native module order is unchanged from the untruncated harness',JSON.stringify(H.nodeScriptFiles())===JSON.stringify(legacy));
 const {Game:G}=await H.loadGame({seed:7002});T.ok('real indexed late crisis APIs are attached',typeof G.aidCrisis==='function'&&typeof G.resolveAidCrisis==='function');T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
