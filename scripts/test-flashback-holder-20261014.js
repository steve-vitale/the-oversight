#!/usr/bin/env node
// scripts/test-flashback-holder-20261014.js — keepsake flashbacks resolve
// against the right holder's lifeseed.
//
// BUG: long sims logged `[keepsakes] flashback: Cannot read properties of
// undefined (reading '0')`. Root cause: hydrated survivors (background seeds,
// who become the player as successors) are born WITHOUT a lifeseed, and
// recordLifeseedEvent (feast_shared etc.) writes a bare { lived: [...] } stub
// onto them. playFlashback treated that stub as a real seed, and
// resolveKeepsakeText/lifeseedKin read places[0] / people[0] off it -> throw.
// The flashback (and its reveal) never played.
//
// RED before: playFlashback throws on a stubbed holder; the keepsake L1 beat
// warns "flashback: ...". GREEN after: the holder gets a real lifeseed
// (lived events kept), {kin}/{place} resolve from it, no warn.
'use strict';
const { load, newRun, reporter, captureSays } = require('./godpath/lib');

(async () => {
  const R = reporter('flashback-holder');
  const Game = await load({ seed: 11 });
  newRun(Game);
  const def = (Game.data.items || []).find(i => i.id === 'mothers_ring');
  R.ok('fixture: mothers_ring has a {kin} memory', def && /\{kin\}/.test(def.memory || ''));

  // ---- 1. the player's own seed (generated cast) ----
  R.section('own keepsake, generated player');
  {
    const me = Game.data.villagers.find(v => v.id === Game.villagerId);
    const seedBefore = me && me.lifeseed;
    const says = captureSays(Game);
    let err = null;
    try { Game.playFlashback({ itemId: 'mothers_ring', name: def.name, owner: Game.villagerId }, def); } catch (e) { err = e; }
    says.restore();
    const kin = Game.lifeseedKin(me, def.kin);
    const fb = says.find(l => l.includes('FLASHBACK')) || '';
    R.ok('plays without error', !err, err && err.message);
    R.ok('memory names the player\'s own kin', kin !== 'someone' && fb.includes(kin), `kin=${kin} fb=${fb.slice(0, 120)}`);
    R.ok('player seed untouched', me.lifeseed === seedBefore);
  }

  // ---- 2. a hydrated survivor (successor) with a { lived } stub ----
  R.section('successor: hydrated survivor with a lived-only stub');
  {
    const bg = Game.data.villagers.find(v => v.id !== Game.villagerId && !v.lifeseed
      && (Game.state.village.rosterChars || {})[v.id]);
    R.ok('fixture: a hydrated survivor without a lifeseed exists', !!bg);
    if (bg) {
      Game.villagerId = bg.id; // succession: they are the player now
      Game.recordLifeseedEvent(bg.id, 'feast_shared');
      R.ok('fixture: recordLifeseedEvent left a stub (no people)', bg.lifeseed && !bg.lifeseed.people);

      const says = captureSays(Game);
      let err = null;
      try { Game.playFlashback({ itemId: 'mothers_ring', name: def.name, owner: bg.id }, def); } catch (e) { err = e; }
      says.restore();
      const fb = says.find(l => l.includes('FLASHBACK')) || '';
      const ls = bg.lifeseed || {};
      R.ok('plays without error', !err, err && err.message);
      R.ok('holder now has a real lifeseed', Array.isArray(ls.people) && Array.isArray(ls.places) && ls.people.length > 0);
      R.ok('lived events kept', Array.isArray(ls.lived) && ls.lived.some(x => x.kind === 'feast_shared'));
      const kin = Array.isArray(ls.people) ? Game.lifeseedKin(bg, def.kin) : 'someone';
      R.ok('memory names the holder\'s kin', kin !== 'someone' && fb.includes(kin), `kin=${kin} fb=${fb.slice(0, 120)}`);
      R.ok('no unresolved placeholders', fb && !/\{(kin|place|first)\}/.test(fb));
      R.ok('one seed: rosterChars and data.villagers agree', Game.state.village.rosterChars[bg.id].lifeseed === bg.lifeseed);
    }
  }

  // ---- 3. the real call site: keepsake L1 beat, no warn ----
  R.section('keepsakeLevelBeat L1 plays the flashback (no warn)');
  {
    const bg2 = Game.data.villagers.find(v => v.id !== Game.villagerId && !v.lifeseed
      && (Game.state.village.rosterChars || {})[v.id]);
    if (bg2) {
      Game.villagerId = bg2.id;
      Game.recordLifeseedEvent(bg2.id, 'feast_shared');
      const warns = [];
      const ow = console.warn, ol = console.log;
      console.warn = (...a) => warns.push(a.join(' '));
      console.log = (...a) => { const m = a.join(' '); if (/flashback/.test(m)) warns.push(m); else ol(...a); };
      const r = { itemId: 'mothers_ring', name: def.name, owner: bg2.id };
      try { Game.keepsakeLevelBeat(r, 0, 1); } catch (e) { warns.push('threw: ' + e.message); }
      console.warn = ow; console.log = ol;
      const fbWarn = warns.filter(w => /flashback/.test(w));
      R.ok('no flashback warn', fbWarn.length === 0, fbWarn.join(' | '));
      R.ok('flashback marked played', r.flashbackPlayed === true);
    } else {
      R.ok('fixture: second hydrated survivor exists', false);
    }
  }

  R.done();
})().catch(e => { console.error('FATAL', e); process.exit(2); });
