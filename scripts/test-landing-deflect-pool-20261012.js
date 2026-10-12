#!/usr/bin/env node
// PROOF: favor deflect-beat pooling (journey landing r6 2026-10-12).
//
// OBSERVED (seed 444 day 10 Sofia, day 12 Emma; seed 666 day 9): every
// ask_favor deflect spoke the identical line verbatim —
//   "No, yeah, of course. Forget I asked." They won't forget. They'll just
//   stop asking.
// across villagers and runs. The want def's deflectBeat was a single
// hardcoded string, while the same def's commitBeat and closeLine already
// pool through convoPickCycle. Same bug class in the other five want defs
// (share_news, repay, seek_comfort, warn_you, curious).
//
// Fixed: all six deflectBeats pool 3 in-voice variants via convoPickCycle
// (favor keyed by favor kind, like commitBeat). The plant survives — every
// favor variant keeps "they won't forget / won't ask twice". Emission still
// goes through sayLine (convo-dialogue.js), so the no-repeat ledger applies.
//
// RED on pristine HEAD: deflectBeat returns the single line every call
//   (assertions 1-2 FAIL).
// GREEN fixed: 3 distinct lines per want, plant preserved (all PASS).
//
// Usage: node scripts/test-landing-deflect-pool-20261012.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 777;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const EXCLUDE = new Set(['app.js', 'sprites.js', 'tile-scenes.js', 'move-anim.js', 'drama.js']);
for (const m of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/src="([^"]+)"/g)) {
  const f = m[1].split('?')[0];
  if (!f.endsWith('.js')) continue;
  if (EXCLUDE.has(path.basename(f))) continue;
  eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
}
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

// the six want ids whose deflectBeat was pooled
const WANT_IDS = ['ask_favor', 'share_news', 'repay', 'seek_comfort', 'warn_you', 'curious'];
// the plant each pool must keep (favor) / in-voice acknowledgment (others)
const PLANT = {
  ask_favor: /won't (forget|ask|raise)/i,
  share_news: /never mind|forget i said|wasn't important/i,
  repay: /won't forget|unpaid|owing/i,
  seek_comfort: /fine|nothing|fire/i,
  warn_you: /suit yourself|warned|watch yourself/i,
  curious: /fair enough|won't pry|your business/i,
};

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);

  // harvest the want defs through the game's own selector (seed priority
  // bypasses the first-meeting curiosity weighting)
  const defs = {};
  for (const wid of WANT_IDS) {
    const vid = roster[WANT_IDS.indexOf(wid) % roster.length];
    try {
      Game.convoPlantSeed(vid, { wantId: wid, note: 'test' });
      const sel = Game.convoSelectWant(vid);
      if (sel && sel.id === wid && sel.def) defs[wid] = sel.def;
    } catch (e) {}
    try { delete Game.state.village.convoSeeds[vid]; } catch (e2) {}
  }
  const missing = WANT_IDS.filter(id => !defs[id]);
  ok(!missing.length, 'all six want defs harvested (' + (missing.length ? 'missing: ' + missing.join(',') : 'ok') + ')');

  for (const wid of WANT_IDS) {
    const def = defs[wid];
    if (!def || typeof def.deflectBeat !== 'function') {
      ok(false, wid + ': deflectBeat exists');
      continue;
    }
    const vid = roster[WANT_IDS.indexOf(wid) % roster.length];
    Game.startConvo(vid);
    // three consecutive deflects in one conversation: the pool must not
    // parrot (convoPick excludes everything already said to this villager)
    const lines = [];
    for (let i = 0; i < 3; i++) lines.push(String(def.deflectBeat.call(Game, vid) || ''));
    Game.endConvo(vid, 'done');
    const distinct = new Set(lines).size;
    console.log('  ' + wid + ': ' + lines.map(l => JSON.stringify(l.slice(0, 52))).join(' | '));
    ok(distinct === 3, wid + ': 3 deflects are 3 distinct lines (got ' + distinct + ')');
    ok(lines.every(l => PLANT[wid].test(l)), wid + ': every variant keeps the beat\'s plant/voice');
  }

  // end-to-end: the real dlg:cant flow still lands an acknowledging,
  // non-dry line through sayLine
  const vid = roster[roster.length - 1];
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  const fsel = (() => {
    try {
      Game.convoPlantSeed(vid, { wantId: 'ask_favor', note: 'test' });
      const s = Game.convoSelectWant(vid);
      delete Game.state.village.convoSeeds[vid];
      return (s && s.id === 'ask_favor') ? s : null;
    } catch (e) { return null; }
  })();
  if (fsel) {
    c.want = { id: 'ask_favor', def: fsel.def, stage: 2 };
    const r = Game.convoTurn(vid, 'dlg:cant');
    const line = String((r && r.line) || '');
    console.log('  e2e dlg:cant -> ' + line.slice(0, 90));
    ok(/won't forget|won't ask twice/i.test(line), 'e2e: favor deflect keeps the plant through the real flow');
    ok(!/lost my train of thought/i.test(line), 'e2e: favor deflect is not a dry non-sequitur');
    const w2 = (Game.convoGet(vid).want) || {};
    ok(w2.resolution === 'deflected' || (w2.stage || 0) >= 3, 'e2e: want arc advances to deflected (resolution=' + (w2.resolution || '?') + ')');
  } else {
    ok(false, 'e2e: harvested an ask_favor def');
  }
  Game.endConvo(vid, 'done');

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST ERROR:', e); process.exit(2); });
