#!/usr/bin/env node
// Journey establishment R7 (2026-10-12) — settled-favor engage proof.
// BUG (caught live, seed 777 d30): an ask_favor seed's opener declares the
// favor settled ("Never mind this wound — we got it handled") when the need
// died between the seed and the sitting — but "How can I help?" / "Tell me
// more" then spoke the DEAD favor's whyLine ("It's getting worse, not
// better...") as if the need were still live, and "I can't right now" fired
// the guilt-framed deflect beats for an ask that never existed.
// FIX (src/js/convo-wants.js): engageBeat / deflectBeat / closeLine honor
// settled favor states (moot/thanked/acknowledged/fulfilled) with honest
// it's-handled beats; voiceLine no longer double-spaces space-led closers.
// RED: pre-fix, the engage line contains the dead whyLine.
// GREEN: post-fix, engage/details are honest acknowledgments; deflect and
//        close stay with the settlement; live favors still deepen with the
//        whyLine.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 424242 >>> 0;
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
{
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const seen = new Set();
  for (const m of html.matchAll(/src="([^"]+)"/g)) {
    let f = m[1].split('?')[0];
    if (!f.endsWith('.js')) continue;
    if (EXCLUDE.has(path.basename(f))) continue;
    if (seen.has(f)) continue;
    seen.add(f);
    eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  }
}
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

(async () => {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const vid = (Game.state.village.roster || []).filter(id => id !== Game.villagerId)[0];
  const v = Game.state.village;
  v.health = v.health || {};
  // Pin the voice: a warm villager's voice adds "How are you holding up,
  // though?" to the opener, which becomes a reactive question that owns the
  // menu. Which temperament roster[0] draws is luck (origins-world 2026-10-14
  // rerolled the cast); this test is about the settled-favor menu.
  { const rec = (Game.data.villagers || []).find(x => x.id === vid); if (rec) { rec.personality = rec.personality || {}; rec.personality.temperament = 'steady'; } }

  // A sitting whose ask died between the seed and the open: hurt them, build
  // + seed the favor, then heal them. Returns { favor, whyLine, opener }.
  function mootSitting() {
    try { Game.endConvo(vid, 'done'); } catch (e) {}
    v.health[vid] = 40;
    const need = Game.convoFindFavorNeed(vid);
    if (!need || need.kind !== 'heal_help') return null;
    const favor = Game.convoBuildFavor(vid, need);
    if (!favor || favor.state !== 'asked') return null;
    Game.convoStoreFavor(favor);
    Game.convoPlantSeed(vid, { wantId: 'ask_favor', note: 'the help I asked you for', favorId: favor.id });
    v.health[vid] = 100; // need dies before the sitting
    const r0 = Game.startConvo(vid);
    return { favor, whyLine: favor.whyLine, opener: r0.line || '', choices: (r0.choices || []).map(c => c.id) };
  }

  // --- 1. the moot opener fires (precondition for the whole bug) ---
  let s = mootSitting();
  ok(!!s, 'moot sitting can be staged');
  ok(/we got it handled/i.test(s.opener), 'opener declares the favor settled (moot)', s.opener.slice(0, 120));
  ok(s.favor.state === 'moot', 'favor state is moot after opener');
  ok(s.choices.includes('dlg:help'), 'menu offers dlg:help on settled favor');

  // --- 2. "How can I help?" must NOT speak the dead ask's whyLine ---
  let r = Game.convoTurn(vid, 'dlg:help');
  const line1 = r.line || '';
  ok(!line1.includes(s.whyLine) && !/getting worse/i.test(line1),
     'dlg:help does not speak the dead whyLine', line1.slice(0, 140));
  // The settled pool cycles three honest variants; only one carries the
  // word "handled". Assert the settlement answer, not the RNG's pick among
  // honest variants (an RNG-stream shift from an unrelated change must not
  // fail this — journey establishment 2026-10-13).
  ok(/it.s handled|it.s fine\. forget i even asked|all sorted/i.test(line1),
     'dlg:help answers honestly (handled)', line1.slice(0, 140));

  // --- 3. "Tell me more" likewise ---
  s = mootSitting();
  ok(/we got it handled/i.test(s.opener), 'second moot sitting staged', s.opener.slice(0, 120));
  r = Game.convoTurn(vid, 'dlg:details');
  const line2 = r.line || '';
  ok(!line2.includes(s.whyLine), 'dlg:details does not speak the dead whyLine', line2.slice(0, 140));

  // --- 4. declining a handled favor: no guilt framing ---
  s = mootSitting();
  r = Game.convoTurn(vid, 'dlg:cant');
  const line3 = r.line || '';
  ok(!/won't forget|won't ask twice|figure it out/i.test(line3),
     'dlg:cant on settled favor has no guilt framing', line3.slice(0, 140));
  ok(/handled/i.test(line3), 'dlg:cant on settled favor acknowledges handled', line3.slice(0, 140));

  // --- 5. the close stays with the settlement ---
  const r5 = Game.endConvo(vid, 'done');
  const close5 = r5.line || '';
  ok(!/Forget I asked/i.test(close5),
     'deflected close on settled favor stays with the settlement', close5.slice(0, 140));

  // --- 6. regression: a LIVE fresh favor still deepens with the whyLine ---
  // (The whyLine-deepening applies to fresh asks at stage 1; seeded
  // follow-ups open at stage 2 where the honest-repeat path is correct.)
  // Uses water_haul: its whyLine text is fresh to the run-level no-repeat
  // ledger (the heal_help whyLine was already spoken on pristine in the
  // moot stages above, which polluted the assertion, not the code).
  _s = 777000 >>> 0;
  try { Game.endConvo(vid, 'done'); } catch (e) {}
  v.health[vid] = 100;
  v.water = v.water || {};
  v.water.clean = 0; // cistern dry -> water_haul need is live
  let freshFavor = null, freshR = null;
  for (let i = 0; i < 8 && !freshFavor; i++) {
    try { Game.endConvo(vid, 'done'); } catch (e) {}
    try { delete Game.state.village.convoSeeds[vid]; } catch (e) {}
    const r0 = Game.startConvo(vid);
    const w = (Game.convoGet(vid) || {}).want || {};
    if (w.id === 'ask_favor' && !w.fromSeed && w.favor && (w.stage || 0) < 2) {
      freshFavor = w.favor;
      freshR = Game.convoTurn(vid, 'dlg:help');
    }
  }
  ok(!!freshFavor, 'live fresh ask_favor staged via picker', freshFavor ? freshFavor.kind : 'none picked');
  if (freshFavor) {
    const fline = freshR.line || '';
    ok(fline.includes(freshFavor.whyLine),
       'live fresh favor dlg:help still deepens with the whyLine', fline.slice(0, 140));
  } else { ok(false, 'live fresh favor dlg:help still deepens with the whyLine', 'no fresh favor staged'); }
  Game.endConvo(vid, 'done');

  // --- 9. food_share whyLine is quoted speech like every other favor kind ---
  // (caught live, seed 20261011 d20: the unquoted whyLine rendered as
  // narration — "THEM: I haven't eaten right in days..." with no quotes)
  try { Game.endConvo(vid, 'done'); } catch (e) {}
  const p0 = Game.state.village.roster.filter(id => id !== Game.villagerId)[1] || vid;
  const vneeds = Game.npcNeeds ? Game.npcNeeds(p0) : {};
  let foodFavor = null;
  try {
    vneeds.hunger = 85;
    const fn = Game.convoFindFavorNeed(p0);
    if (fn && fn.kind === 'food_share') foodFavor = Game.convoBuildFavor(p0, fn);
  } catch (e) {}
  if (foodFavor) {
    ok(/^\s*"/.test(foodFavor.whyLine) && /"\s*$/.test(foodFavor.whyLine),
       'food_share whyLine is quoted speech', String(foodFavor.whyLine).slice(0, 80));
  } else {
    ok(false, 'food_share whyLine is quoted speech', 'could not stage a food_share favor');
  }

  // --- 7. voiceLine: no double-space join for space-led closers ---
  const composed = Game.voiceLine(vid, '"Will you?"');
  ok(!/  /.test(String(composed).replace(/^"|"$/g, '')), 'voiceLine has no double-space joins', String(composed));

  // --- 8. re-asking the want ("Is there something you need? Really.") on a
  //    settled favor answers honestly instead of the dead opener fallback ---
  s = mootSitting();
  ok(/we got it handled/i.test(s.opener), 'reopen sitting staged', s.opener.slice(0, 120));
  if (s.choices.includes('alive:want:ask_favor')) {
    const r8 = Game.convoTurn(vid, 'alive:want:ask_favor');
    const line8 = r8.line || '';
    ok(!/Here's the thing/.test(line8),
       'alive:want re-open on settled favor avoids the dead opener fallback', line8.slice(0, 140));
    ok(/handled/i.test(line8),
       'alive:want re-open on settled favor answers honestly', line8.slice(0, 140));
  } else {
    ok(false, 'alive:want:ask_favor offered on settled favor', 'choice missing');
  }
  Game.endConvo(vid, 'done');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
