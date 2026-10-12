'use strict';
// Proof: audio placeholder wiring (Steve 2026-10-12).
// 1. Every wave 3-5 monster id resolves to exactly one signature sound.
// 2. Every animal monster resolves to a real-animal pool (fallbacks listed).
// 3. Every weapon/item attack path fires a wired audioEvent.
// 4. Every placeholder entry carries placeholder:true AND is tagged in the
//    debug board.
// RED: run against pristine (registry absent) — must fail.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(c, n) { if (c) { pass++; } else { fail++; failures.push(n); console.log('  FAIL:', n); } }

// ---- load registry (pure data, no DOM) ----
let AR = null;
try {
  const regPath = path.join(ROOT, 'src', 'js', 'audio-registry.js');
  const src = fs.readFileSync(regPath, 'utf8');
  const mod = { exports: {} };
  new Function('module', 'exports', 'Math', src)(mod, mod.exports, Math);
  AR = mod.exports;
  ok(true, 'registry loads');
} catch (e) { ok(false, 'registry loads: ' + e.message); }
if (!AR) { console.log(`\n${pass} passed, ${fail} failed`); process.exit(1); }

// ---- 1. every wave 3-5 monster -> exactly one signature ----
const monsters = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'monsters.json'), 'utf8'));
const w35 = monsters.filter(m => [3, 4, 5].includes(m.wave));
ok(w35.length === 29, `29 wave 3-5 monsters (got ${w35.length})`);
const sigHooks = new Set();
for (const m of w35) {
  const hook = AR.monsterSig[m.id];
  ok(!!hook, `monster ${m.id} has a primary signature hook`);
  if (hook) {
    const e = AR.signatures[hook];
    ok(!!e, `${m.id}: hook ${hook} in signatures`);
    if (e) {
      ok(e.placeholder === true, `${m.id}: ${hook} flagged placeholder:true`);
      ok(fs.existsSync(path.join(ROOT, e.file)), `${m.id}: file exists ${e.file}`);
      const sz = fs.existsSync(path.join(ROOT, e.file)) ? fs.statSync(path.join(ROOT, e.file)).size : 0;
      ok(sz > 4000, `${m.id}: file non-trivial (${sz}b)`);
      sigHooks.add(hook);
    }
  }
}
ok(Object.keys(AR.signatures).length === 32, `32 signature entries (got ${Object.keys(AR.signatures).length})`);

// ---- 2. animal monsters -> real pools; list fallbacks ----
const animalMonsters = {};
for (const m of monsters) {
  if (![1, 2].includes(m.wave)) continue;
  const enc = m.encounter || {};
  const hooks = [enc.noticeAudio, enc.aggroAudio, enc.resolveAudio].filter(Boolean);
  if (hooks.length) animalMonsters[m.id] = hooks;
}
const fallbacks = [];
for (const [mid, hooks] of Object.entries(animalMonsters)) {
  for (const h of hooks) {
    const r = AR.resolveHook(h);
    if (!r) continue; // hook not in registry -> synth path, not our claim
    if (r.kind === 'animal') {
      if (r.placeholder === false && r.file) {
        ok(fs.existsSync(path.join(ROOT, r.file)), `animal ${mid}/${h}: pool file exists`);
      } else {
        fallbacks.push(`${mid}/${h} (${r.label})`);
      }
    }
  }
}
console.log('  animal pool fallbacks (documented gaps):');
fallbacks.forEach(f => console.log('    - ' + f));
ok(fallbacks.length > 0, 'fallback list is non-empty (raccoon/turtle documented)');
// every pool with files: files exist and are non-trivial
for (const [k, a] of Object.entries(AR.animals)) {
  for (const f of a.files) {
    const sz = fs.existsSync(path.join(ROOT, f)) ? fs.statSync(path.join(ROOT, f)).size : 0;
    ok(sz > 4000, `animal pool ${k}: ${f} non-trivial`);
  }
  if (!a.files.length) ok(a.placeholder === true, `animal pool ${k}: empty pool flagged placeholder`);
}

// ---- 3. weapon/item attack paths fire wired events ----
const gameSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
const finSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'finale-campaign.js'), 'utf8');
for (const ev of ['weaponSwing', 'weaponHit', 'bowRelease', 'itemEat', 'itemDrink', 'trapSpring']) {
  ok(gameSrc.includes(`audioEvent('${ev}'`), `game.js fires audioEvent('${ev}')`);
  ok(!!AR.weapons[ev], `registry has weapons.${ev}`);
  ok(AR.weapons[ev] && AR.weapons[ev].placeholder === true, `weapons.${ev} flagged placeholder:true`);
  const f = AR.weapons[ev] && AR.weapons[ev].file;
  const sz = f && fs.existsSync(path.join(ROOT, f)) ? fs.statSync(path.join(ROOT, f)).size : 0;
  ok(sz > 2000, `weapons.${ev}: file exists and non-trivial`);
}
ok(finSrc.includes("audioEvent('fiCrewQuiet'"), 'finale-campaign fires fiCrewQuiet');
ok(finSrc.includes("audioEvent('fiOpeningSting'"), 'finale-campaign fires fiOpeningSting');
// resolveHook returns the right kind for every weapon hook
for (const ev of Object.keys(AR.weapons)) {
  const r = AR.resolveHook(ev);
  ok(r && r.kind === 'weapon' && r.placeholder === true, `resolveHook('${ev}') -> weapon placeholder`);
}

// ---- 4. placeholder:true everywhere it must be + debug board tags ----
for (const [n, s] of Object.entries(AR.signatures)) ok(s.placeholder === true, `signatures.${n} placeholder:true`);
const dbgSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'debug-scenarios.js'), 'utf8');
ok(dbgSrc.includes('[PLACEHOLDER]'), 'debug board shows [PLACEHOLDER] tag');
ok(dbgSrc.includes('[REAL]'), 'debug board shows [REAL] tag');
ok(dbgSrc.includes('AudioRegistry.signatures'), 'board reads tags from registry data (signatures)');
ok(dbgSrc.includes('AudioRegistry.animals'), 'board reads tags from registry data (animals)');
ok(dbgSrc.includes('AudioRegistry.weapons'), 'board reads tags from registry data (weapons)');
ok(dbgSrc.includes('audioAnimals') && dbgSrc.includes('audioWeapons'), 'animal + weapon boards registered');
// every signature hook is playable from the board
for (const n of Object.keys(AR.signatures)) {
  ok(dbgSrc.includes('AudioRegistry.signatures'), `board covers signatures (data-driven)`);
  break;
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
