'use strict';
// Actual DOM-free renderer, with the real data definitions. No Game substitute
// or gameplay fixture: the browser calls these same presentation functions.
const vm=require('vm'),K=require('./lib'),T=K.reporter('regional visual coverage'),plants=K.readJSON('src/data/plants.json'),monsters=K.readJSON('src/data/monsters.json'),source=K.readSrc('src/js/sprites.js'),context={console,Math:Object.create(Math)};
context.Math.random=()=>{throw Error('Rendering must not consume gameplay RNG');};context.globalThis=context;vm.createContext(context);vm.runInContext(source,context);context.Scattering.Game={data:{plants}};const S=context.Scattering.Sprites,before=JSON.stringify(plants),regional=S.regionalPlantIds?.()||[];
T.ok('eighty missing regional species and two generic-chain collisions have explicit art',regional.length===82&&regional.includes('cowpea')&&regional.includes('peanut'));
T.ok('every actual plant has a three-stage visual chain',plants.every(p=>S.chainFor(p.id)?.length===3));
T.ok('regional species resolve to their own identified asset',regional.every(id=>S.chainFor(id)[2]===id&&S.plantSprite(id,2,'plant')===S.get(id)));
T.ok('unidentified regional plants do not reveal their specific asset',regional.every(id=>S.plantSprite(id,0,'plant')!==S.get(id)));
T.ok('examined regional categories do not reveal species or hazard tags',regional.every(id=>{const c=S.chainFor(id);return c[1]!==id&&!['toxic','safe','poison'].includes(c[1])&&S.plantSprite(id,1,'plant')===S.get(c[1]);}));
T.ok('no safety flag is used as a visual identity',plants.every(p=>!S.chainFor(p.id).some(n=>['toxic','safe','poison'].includes(n))));
T.ok('regional species have distinct authored SVG bodies',new Set(regional.map(id=>S.get(id))).size===regional.length);
T.ok('every monster has distinct calm and aggro assets',monsters.every(m=>{const a=S.monsterSprite(m.id,false),b=S.monsterSprite(m.id,true);return a&&b&&a!==b;}));
T.ok('every generated or literal asset is exposed to SVG validation',S.ids?.().length>300&&regional.every(id=>S.ids().includes(id)));
T.ok('rendering does not modify gameplay data or expanded taxonomies',before===JSON.stringify(plants));
const legacy=K.readJSON('evidence/2026-10-17/regional-visual-legacy.json'),hash=x=>require('crypto').createHash('sha256').update(x).digest('hex');
T.ok('all372 existing rendered assets, including taro, retain their exact SVG',Object.keys(legacy.sprites).length===372&&Object.entries(legacy.sprites).every(([id,h])=>S.get(id)&&hash(S.get(id))===h));T.done();
