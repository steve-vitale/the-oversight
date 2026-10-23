#!/usr/bin/env node
// test-crisis-r44-compound-deathnaming-20261023.js — CRISIS LEG r44 (lane B).
// Proof for the two r44 fixes:
//   FIX A (safetynets.js): the 2026-10-13 compound-crisis design said a second
//     crisis kind compounds the open relief ("And now X, on top of it all"),
//     but all five raiseRelief call sites guarded `!st.relief`, making the
//     compound branch dead code. Guards now allow different-kind compounding;
//     the escalation beat fires once per relief (compound-once).
//   FIX B (statusEffects.js): the scholar's disease death named the true
//     disease (lockjaw / the trembles) unconditionally — warnings too — while
//     the villager pipeline gates on villageKnowsDisease (DISEASES.md: diseases
//     never announce their names, only symptoms). Same gate applied.
// Bindings: B1 compound branch direct; B2 natural-path compound via the real
//   tick wrappers; B3 no re-fire; B4 undiagnosed scholar lockjaw death stays
//   symptom-honest; B5 diagnosed control names it.
// Usage: node scripts/test-crisis-r44-compound-deathnaming-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function collectSay(Game) {
  const lines = [];
  const orig = Game.say.bind(Game);
  Game.say = (m) => { lines.push(String(m)); };
  return { lines, restore() { Game.say = orig; } };
}
function livingVids(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead && id !== Game.villagerId; } catch (e) { return false; }
  });
}

async function main() {
  // ---------- FIX A: compound relief ----------
  console.log('[A1] compound branch, direct invocation');
  {
    const { Game } = await loadGame({ seed: 7 });
    await setupGame(Game);
    const c = collectSay(Game);
    const r1 = Game.raiseRelief('sickness', {});
    ok('sickness relief opens', !!r1 && Game.state.relief && Game.state.relief.kind === 'sickness');
    const before = c.lines.length;
    const r2 = Game.raiseRelief('hunger', {});
    const newLines = c.lines.slice(before).join('\n');
    ok('compound branch returns the open relief', r2 === Game.state.relief && !!r2);
    ok('compound line fires ("And now hunger, on top of it all")',
      /And now hunger, on top of it all/.test(newLines), newLines.slice(0, 160));
    ok('kind switches to hunger', Game.state.relief.kind === 'hunger', Game.state.relief.kind);
    ok('partsLeft extended (>=6)', Game.state.relief.partsLeft >= 6, String(Game.state.relief.partsLeft));
    ok('compounded flag set', Game.state.relief.compounded === true);
    ok('speaker preserved', !!Game.state.relief.speaker);
    c.restore();
  }

  console.log('[A2] compound branch, natural path (real tick wrappers)');
  {
    const { Game } = await loadGame({ seed: 7 });
    await setupGame(Game);
    const vids = livingVids(Game).slice(0, 2);
    const v = Game.state.village;
    v.sick = v.sick || {};
    for (const id of vids) v.sick[id] = { name: 'gut rot', daysLeft: 14, severity: 1 };
    const c = collectSay(Game);
    Game.villageSicknessTick();
    ok('sickness relief opens via villageSicknessTick', !!Game.state.relief && Game.state.relief.kind === 'sickness',
      Game.state.relief ? Game.state.relief.kind : 'none');
    const before = c.lines.length;
    v.hungryDays = 1;
    v._hungerReliefEpisode = false;
    Game.safetyNetsDayTick();
    const newLines = c.lines.slice(before).join('\n');
    ok('hunger compounds via safetyNetsDayTick (no swallow)',
      /And now hunger, on top of it all/.test(newLines),
      newLines.slice(0, 200) || '(no new lines)');
    ok('kind switched to hunger on the natural path', Game.state.relief && Game.state.relief.kind === 'hunger',
      Game.state.relief ? Game.state.relief.kind : 'none');
    c.restore();
  }

  console.log('[A3] no re-fire (compound-once)');
  {
    const { Game } = await loadGame({ seed: 7 });
    await setupGame(Game);
    const c = collectSay(Game);
    Game.raiseRelief('sickness', {});
    Game.raiseRelief('hunger', {});
    const before = c.lines.length;
    Game.raiseRelief('sickness', {});
    Game.raiseRelief('storm', {});
    const newLines = c.lines.slice(before).join('\n');
    ok('third/fourth different-kind raise does not re-fire the line',
      !/on top of it all/.test(newLines), newLines.slice(0, 160) || '(silent)');
    ok('kind stays at first compound target', Game.state.relief.kind === 'hunger', Game.state.relief.kind);
    // same-kind re-raise still suppressed
    const r = Game.raiseRelief('hunger', {});
    ok('same-kind re-raise returns null (no duplicate)', r === null);
    c.restore();
  }

  console.log('[A4] options stand across compounding (answerRelief kind-agnostic)');
  {
    const { Game } = await loadGame({ seed: 7 });
    await setupGame(Game);
    const c = collectSay(Game);
    Game.raiseRelief('sickness', {});
    Game.raiseRelief('hunger', {});
    // use one option after compounding — must work, marked used once
    const r = Game.answerRelief('rally');
    ok('rally answers after compounding', r === 'rally', String(r));
    const r2 = Game.answerRelief('rally');
    ok('rally spent stays spent', r2 === 'used', String(r2));
    c.restore();
  }

  // ---------- FIX B: scholar disease-death knowledge gate ----------
  console.log('[B4] undiagnosed scholar lockjaw death stays symptom-honest');
  {
    const { Game } = await loadGame({ seed: 11 });
    await setupGame(Game);
    Game.applyStatus('scholar', 'lockjaw', { source: 'test', silent: true });
    Game.state.scholar.health = 100;
    const c = collectSay(Game);
    let died = null;
    const _pd = Game.playerDeath.bind(Game);
    Game.playerDeath = (cause) => { died = cause; Game.playerDeath = _pd; };
    for (let i = 0; i < 30 && !died; i++) { Game.state.scholar.health = 100; Game.tickStatuses('scholar', 'dayPart'); }
    Game.playerDeath = _pd;
    const text = c.lines.join('\n');
    c.restore();
    ok('scholar dies of untreated lockjaw', died !== null, 'no death in 30 parts');
    ok('playerDeath cause is symptom-honest (sickness, not lockjaw)', died === 'sickness', 'cause=' + died);
    ok('dying narration names no true disease', !/lockjaw/i.test(text),
      text.split('\n').filter(l => /spasm|lockjaw/i.test(l)).slice(0, 2).join(' | ').slice(0, 200));
    ok('late warning stays symptom-honest', !/\(lockjaw: ~2 days left\)/.test(text) || /\(the spasms: ~2 days left\)/.test(text),
      text.split('\n').filter(l => /days left/.test(l)).slice(0, 1).join(' ').slice(0, 160));
  }

  console.log('[B5] diagnosed control: named when the village knows');
  {
    const { Game } = await loadGame({ seed: 11 });
    await setupGame(Game);
    Game.applyStatus('scholar', 'lockjaw', { source: 'test', silent: true });
    Game.diagnoseDisease('scholar', 'lockjaw', { silent: true });
    Game.markDiseaseKnown('lockjaw');
    Game.state.scholar.health = 100;
    const c = collectSay(Game);
    let died = null;
    const _pd = Game.playerDeath.bind(Game);
    Game.playerDeath = (cause) => { died = cause; Game.playerDeath = _pd; };
    for (let i = 0; i < 30 && !died; i++) { Game.state.scholar.health = 100; Game.tickStatuses('scholar', 'dayPart'); }
    Game.playerDeath = _pd;
    const text = c.lines.join('\n');
    c.restore();
    ok('diagnosed lockjaw death names the disease', died === 'lockjaw', 'cause=' + died);
    ok('dying narration names it when known', /\(lockjaw/.test(text));
  }

  console.log('[B6] trembles mirrors lockjaw');
  {
    const { Game } = await loadGame({ seed: 11 });
    await setupGame(Game);
    Game.applyStatus('scholar', 'trembles', { source: 'test', silent: true });
    Game.state.scholar.health = 100;
    const c = collectSay(Game);
    let died = null;
    const _pd = Game.playerDeath.bind(Game);
    Game.playerDeath = (cause) => { died = cause; Game.playerDeath = _pd; };
    for (let i = 0; i < 60 && !died; i++) { Game.state.scholar.health = 100; Game.tickStatuses('scholar', 'dayPart'); }
    Game.playerDeath = _pd;
    const text = c.lines.join('\n');
    c.restore();
    ok('undiagnosed trembles death cause is sickness', died === 'sickness', 'cause=' + died);
    ok('trembles death narration symptom-honest', !/the trembles\)/.test(text),
      text.split('\n').filter(l => /tremor|trembles/i.test(l)).slice(-1).join(' ').slice(0, 200));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
