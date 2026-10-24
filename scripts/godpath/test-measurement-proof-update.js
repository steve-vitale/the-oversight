'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),K=require('./lib'),T=K.reporter('measurement proof refresh'),U=require('../balance-proof-update'),root=path.resolve(__dirname,'../..'),proof=require('../balance-proof.json'),p=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(root,proof.panel)))),clone=x=>JSON.parse(JSON.stringify(x));
function refuses(x,pattern){try{U.validate(root,x);return false;}catch(e){return pattern.test(e.message);}}
const saved=JSON.stringify(p),inputs=U.validate(root,p);
T.ok('a real current neutral panel supplies all eight maintained identities',Object.keys(inputs).length===8&&Object.hasOwn(inputs,'scripts/lib/balance-cohorts.js')&&Object.hasOwn(inputs,'scripts/lib/source-text.js'));
const stale=clone(p);stale.sources['scripts/sim-harness.js']='stale';T.ok('stale Game/controller/harness proof cannot refresh the gate',refuses(stale,/source inputs|manifest digest/));
const observer=clone(p);observer.observerDigest='stale';T.ok('a changed observer needs a fresh real proof',refuses(observer,/observer\/contract/));
const neutral=clone(p);neutral.validity.neutrality[0].match=false;T.ok('failed on/off neutrality cannot refresh the gate',refuses(neutral,/observer-neutral/));
const mixed=clone(p);mixed.validity.neutrality.push({...mixed.validity.neutrality[0],match:false});T.ok('a passing seed cannot conceal a failed proof in its cohort',refuses(mixed,/observer-neutral/));
const warned=clone(p);warned.validity.neutrality.push({...warned.validity.neutrality[0],warnings:1});T.ok('a passing seed cannot conceal a warning in another proof',refuses(warned,/observer-neutral/));
const absent=clone(p);absent.validity.neutrality=absent.validity.neutrality.filter(n=>n.policy!==p.options.policies[0]);T.ok('every declared cohort still requires a real proof',refuses(absent,/observer-neutral/));
const missing=clone(p);delete missing.rows[0].metrics.won;T.ok('missing balanced metrics cannot enter the maintained proof',refuses(missing,/invalid metrics/));
T.ok('validation never rewrites the retained input panel',saved===JSON.stringify(p));T.done();
