#!/usr/bin/env node
'use strict';
// Proof: a bearer-ended run's cancel verb must be offered from ANY sitting
// with that villager, not only when the sitting opens on the favor want
// (journey-establishment r286, 2026-11-27).
//
// Finding (r286 panel, live — seed 109054, Lena's forage_help run, bearer
// Aisha died d21 in the wild): the run stranded d22 and stayed open to
// d45 — 24 stranded dawns, 0/1 closed, a NO-GO on the frozen Q1 bar.
// The driver sat 'end' with Lena 19 times while the ending was ready
// (forageFavorAction ending branch: ready, action forage_end, "This
// outing belonged to Aisha, who is gone..."), but the sit opened on a
// different want every time — grief/seek_comfort, warn_you, share_news,
// curious — and the favor menu (convoFavorActionMenu, the only place
// dlg:favor_cancel is offered) is built only when the sitting opens on
// the favor want. The r280 rank fix promotes a cancel that is already
// in the menu; it cannot conjure one into a grief/case/news menu. The
// run's only honest end was luck-of-the-draw on the opener, 24 dawns
// running. (5 further dawns the ending was not ready — "Finish the
// current event before foraging together" — an event in progress; those
// days the verb is correctly unoffered.)
//
// Fix (game code, this run): convoMenuPage (conversation.js) — when the
// urgent bearer-end shape holds (convoFavorEndUrgent) AND the ending is
// actually ready at Haven (the same forage/waterFavorAction ready gate
// the favor menu uses), the cancel joins the menu from any sitting with
// that villager, ranked first by the r280 rule. Never offered while a
// question, trade, hawk, ambush or closing owns the menu, and never
// when the ending isn't ready.
//
// This test proves, on the live handlers, with a staged bearer-ended
// forage run in the panel's exact shape (favor state 'asked', promise
// released by the mantle, bearer dead, scholar at Haven):
//  (1) the ending is ready (forageFavorAction ending branch);
//  (2) in a real sitting opened on a NON-favor want (seek_comfort /
//      grief, the panel's shape), the urgent cancel IS offered and
//      FIRST on page 1 (the fix);
//  (3) CONTROL healthy: a living-bearer run on a non-favor want does
//      NOT get the cancel injected (no false positive);
//  (4) CONTROL not-ready: the same bearer-ended run with the scholar
//      AWAY from Haven does NOT get the cancel injected (ready gate);
//  (5) pressing the injected cancel on the grief-want sitting actually
//      ends the run (returned);
//  (6) WATER mirror: a bearer-ended water run gets its cancel injected
//      on a non-favor want too.
// Staging follows test-menu-priority-r280.js (seed 1175, shared
// harness scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

function driveAns(Game, targetVid) {
  // Answer any hanging question (the opener's generic question owns
  // the menu until answered — ans:/gq: menus short-circuit paging and
  // never offer the cancel). Mirrors test-menu-priority-r280.js, plus
  // the gq: branch (a yes/no question owns the menu the same way).
  for (let t = 0; t < 6; t++) {
    let choices = [];
    try { choices = Game.convoChoices(targetVid) || []; } catch (e) { break; }
    const ans = (choices || []).find(ch => ch && ch.id && (ch.id.indexOf('ans:') === 0 || ch.id.indexOf('gq:') === 0));
    if (!ans) break;
    const r = Game.convoTurn(targetVid, ans.id);
    if (r && r.ended) break;
  }
}

function hangNonFavorWant(Game, targetVid) {
  // The panel's shape: the sitting opens on grief, not on the favor.
  const c = Game.convoGet(targetVid);
  c.want = { id: 'seek_comfort', stage: 0 };
  c.thread = 'grief';
  return c;
}

async function main() {
  const Game = await K.load({ seed: 1175 });
  K.newRun(Game);

  const v = Game.state.village;
  const me = Game.villagerId;
  // Scholar at Haven: the bearer-end ready branch requires home.
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;

  const roster = (v.roster || []).filter(id => id !== me);
  const commAble = roster.filter(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  });
  check('enough full-comm villagers to stage', commAble.length >= 4, `commAble=${commAble.length}`);
  const vid = commAble[0];
  const vid2 = commAble[1];
  const vid3 = commAble[2];
  const s0 = Game.state.scholar;
  if (!Number.isFinite(s0.mx)) { s0.mx = 4; s0.my = 4; }
  v.nodePos = v.nodePos || {};
  v.positions = v.positions || {};
  for (const id of [vid, vid2, vid3]) {
    v.nodePos[id] = { nx: hx, ny: hy };
    v.positions[id] = { mx: s0.mx, my: s0.my };
  }
  const deadBearer = commAble[3];
  Game.getPerson(deadBearer).dead = true;

  v.favorLedger = v.favorLedger || {};

  // Panel-exact shape: favor state 'asked' (mantle released the
  // promise), bearer dead, run live and unreturned.
  const favorUrgent = {
    id: 'fav-r286-urgent', vid, kind: 'forage_help', state: 'asked',
    forageRun: { bearer: deadBearer, returned: false,
      playerHaul: [{ kcalEach: 100, units: 2 }], partnerHaul: [{ kcalEach: 100, units: 2 }] },
  };
  v.favorLedger[vid] = favorUrgent;

  // ---- (1) ending ready ----
  check('helper exists', typeof Game.convoFavorEndUrgent === 'function');
  check('helper true for bearer-ended forage run (asked state)',
    Game.convoFavorEndUrgent(vid) === true);
  const endStatus = Game.forageFavorAction(vid, favorUrgent, true);
  check('ending ready at Haven for the bearer-ended run (panel shape)',
    endStatus && endStatus.ready === true && endStatus.action === 'forage_end',
    `ready=${endStatus && endStatus.ready} action=${endStatus && endStatus.action} reason=${String(endStatus && endStatus.reason || '').slice(0, 80)}`);

  // ---- (2) THE DEFECT: non-favor want sitting offers the cancel ----
  const opened = Game.startConvo(vid);
  check('grief sitting opens', !!opened && !opened.refused && !opened.ended);
  driveAns(Game, vid);
  hangNonFavorWant(Game, vid);
  const choices = Game.convoChoices(vid) || [];
  const cancelIdx = choices.findIndex(ch => ch && ch.id === 'dlg:favor_cancel');
  console.log(`  [probe] grief-want menu: ${choices.length} choices, cancelIdx=${cancelIdx}`);
  console.log(`  [probe] grief-want ids: ${choices.map(ch => ch.id).join(',')}`);
  check('menu is a real non-favor menu (favor menu did not fire)',
    !choices.some(ch => ch && ch.id === 'dlg:favor_action'));
  check('urgent cancel IS offered on a non-favor want (the fix)',
    cancelIdx !== -1, `cancelIdx=${cancelIdx} ids=${choices.map(ch => ch.id).join(',')}`);
  check('urgent cancel is FIRST on page 1 (r280 rank applies)',
    cancelIdx === 0, `cancelIdx=${cancelIdx}`);
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- (3) CONTROL healthy: living bearer, non-favor want, no inject ----
  const favorHealthy = {
    id: 'fav-r286-healthy', vid: vid2, kind: 'forage_help', state: 'promised',
    forageRun: { bearer: me, returned: false,
      playerHaul: [{ kcalEach: 100, units: 2 }], partnerHaul: [{ kcalEach: 100, units: 2 }] },
  };
  v.favorLedger[vid2] = favorHealthy;
  check('helper false for a healthy live run',
    Game.convoFavorEndUrgent(vid2) === false);
  const opened2 = Game.startConvo(vid2);
  check('healthy control sitting opens', !!opened2 && !opened2.refused && !opened2.ended);
  driveAns(Game, vid2);
  hangNonFavorWant(Game, vid2);
  const choices2 = Game.convoChoices(vid2) || [];
  console.log(`  [probe] healthy grief-want ids: ${choices2.map(ch => ch.id).join(',')}`);
  check('healthy run gets NO injected cancel on a non-favor want',
    !choices2.some(ch => ch && ch.id === 'dlg:favor_cancel'),
    `ids=${choices2.map(ch => ch.id).join(',')}`);
  try { Game.endConvo(vid2, 'left'); } catch (e) {}

  // ---- (4) CONTROL not-ready: scholar away from Haven, no inject ----
  Game.map.px = (hx + 2) % 9; Game.map.py = hy;
  const awayStatus = Game.forageFavorAction(vid, favorUrgent, true);
  check('ending NOT ready away from Haven (ready gate)',
    awayStatus && awayStatus.ready === false,
    `ready=${awayStatus && awayStatus.ready}`);
  const opened3 = Game.startConvo(vid);
  check('away sitting opens', !!opened3 && !opened3.refused && !opened3.ended);
  driveAns(Game, vid);
  hangNonFavorWant(Game, vid);
  const choices3 = Game.convoChoices(vid) || [];
  console.log(`  [probe] away grief-want ids: ${choices3.map(ch => ch.id).join(',')}`);
  check('bearer-ended run away from Haven gets NO injected cancel',
    !choices3.some(ch => ch && ch.id === 'dlg:favor_cancel'),
    `ids=${choices3.map(ch => ch.id).join(',')}`);
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  Game.map.px = hx; Game.map.py = hy;

  // ---- (5) pressing the injected cancel ends the run ----
  const opened4 = Game.startConvo(vid);
  check('end sitting opens', !!opened4 && !opened4.refused && !opened4.ended);
  driveAns(Game, vid);
  hangNonFavorWant(Game, vid);
  const choices4 = Game.convoChoices(vid) || [];
  console.log(`  [probe] end-sitting ids: ${choices4.map(ch => ch.id).join(',')}`);
  console.log(`  [probe] end-sitting active=${Game.convoGet(vid).active} menuPages=${Game.convoGet(vid).menuPages} urgent=${Game.convoFavorEndUrgent(vid)} ready=${JSON.stringify(Game.forageFavorAction(vid, favorUrgent, true))}`);
  check('cancel offered in the end sitting',
    choices4.some(ch => ch && ch.id === 'dlg:favor_cancel'));
  const r = Game.convoTurn(vid, 'dlg:favor_cancel');
  check('pressing the injected cancel ends the run (returned)',
    favorUrgent.forageRun.returned === true,
    `returned=${favorUrgent.forageRun.returned} line=${String((r && r.line) || '').slice(0, 100)}`);
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- (6) WATER mirror ----
  const favorWater = {
    id: 'fav-r286-water', vid: vid3, kind: 'water_haul', state: 'asked',
    waterRun: { bearer: deadBearer, returned: false, partnerWater: [] },
  };
  v.favorLedger[vid3] = favorWater;
  check('helper true for bearer-ended water run',
    Game.convoFavorEndUrgent(vid3) === true);
  const waterStatus = Game.waterFavorAction(vid3, favorWater, true);
  check('water ending ready at Haven',
    waterStatus && waterStatus.ready === true,
    `ready=${waterStatus && waterStatus.ready} reason=${String(waterStatus && waterStatus.reason || '').slice(0, 80)}`);
  const opened5 = Game.startConvo(vid3);
  check('water sitting opens', !!opened5 && !opened5.refused && !opened5.ended);
  driveAns(Game, vid3);
  hangNonFavorWant(Game, vid3);
  const choices5 = Game.convoChoices(vid3) || [];
  const cancelIdx5 = choices5.findIndex(ch => ch && ch.id === 'dlg:favor_cancel');
  console.log(`  [probe] water grief-want ids: ${choices5.map(ch => ch.id).join(',')}`);
  check('water cancel IS offered on a non-favor want',
    cancelIdx5 !== -1, `cancelIdx=${cancelIdx5}`);
  check('water cancel is FIRST on page 1',
    cancelIdx5 === 0, `cancelIdx=${cancelIdx5}`);
  try { Game.endConvo(vid3, 'left'); } catch (e) {}

  console.log(`\n=== RESULT: ${pass} pass ===`);
  process.exit(0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
