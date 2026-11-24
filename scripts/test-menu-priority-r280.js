#!/usr/bin/env node
'use strict';
// Proof: a stranded run's cancel verb must surface on page 1
// (journey-establishment r280, 2026-11-24).
//
// Finding (r277 panel, live — seed 109018, Stan's forage_help run, bearer
// Aaliyah died d18): the cancel verb (dlg:favor_cancel, BEARER-END branch,
// r265) WAS offered and ready at Haven on d19–d21, but the sitting's menu
// was flooded by open betrayal cases — 54–56 options across 7–8 pages,
// the wedge's 6-page cap never reaching the favor items — so the run
// closed only on d22, 3 dawns after first stranding, over the frozen
// 2-dawn bar. The verb works; it was buried.
//
// Fix (game code, this run): convoFavorEndUrgent (convo-wants.js) names
// the gone-owner shape — a joint forage/water run whose bearer <redacted>
// dead or roster-gone (BEARER-END, r265) or, for forage, whose partner is
// gone while the scholar is the bearer <redacted> r81) — and convoMenuPage
// (conversation.js) ranks that cancel -1, ahead of even the betrayal-case
// flood, so a real player sees it on page 1. A healthy live run's early
// end is NOT urgent — its owner can still close it — so it keeps its
// default rank (4).
//
// This test proves, on the live handlers, with a staged 50-option
// betrayal flood (10 open cases x 5 options each, the r277 shape):
//  (1) the helper is true for a bearer-ended forage run, true for a
//      bearer-ended water run, true for the forage partner-gone shape,
//      and false for a healthy live run, a scholar-bearer water run,
//      and no favor at all;
//  (2) in a real sitting with the flood, the urgent cancel is FIRST on
//      page 1 of convoChoices (not merely present somewhere);
//  (3) CONTROL: the same flood with a healthy live run leaves the
//      cancel OFF page 1 (still ranked last, reachable by paging);
//  (4) pressing the urgent cancel actually ends the run (returned).
// Staging follows test-warnheed-reset-r277.js (seed 1175, shared
// harness scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

function stageCases(Game, v, vid, n) {
  // 10 open cases x 5 options each (site, witnesses, investigate, moot,
  // letlie) — the r277 flood shape. playerRole 'bystander' keeps the
  // accused-only verbs (askheard/tellside) and the bribe branch out.
  const others = (v.roster || []).filter(id => id !== Game.villagerId && id !== vid);
  const bs = Game.betrayalState();
  bs.cases = [];
  for (let i = 0; i < n; i++) {
    const target = others[(i * 2) % others.length];
    const accused = others[(i * 2 + 1) % others.length];
    bs.cases.push({
      id: 'case_r280_' + i, status: 'open', knownToPlayer: true,
      playerRole: 'bystander', target, accused: [accused], accuser: accused,
      charge: 'theft', siteExamined: false, witnessesNamed: false,
      flipped: false, foundBribes: [], exposedBribes: [], witnesses: [],
      askedHeard: {}, toldSide: {}, trial: null, belief: {},
    });
  }
  return bs.cases.length;
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
  // Stand the staged villagers next to the scholar at Haven: the healthy
  // early end (control) requires adjacency (favor-forage.js adjacent()),
  // while the bearer-end branch does not. Same node, same tile, inside
  // flags left alone (both undefined => match).
  const s0 = Game.state.scholar;
  if (!Number.isFinite(s0.mx)) { s0.mx = 4; s0.my = 4; }
  v.nodePos = v.nodePos || {};
  v.positions = v.positions || {};
  for (const id of [vid, vid2]) {
    v.nodePos[id] = { nx: hx, ny: hy };
    v.positions[id] = { mx: s0.mx, my: s0.my };
  }
  const deadBearer = commAble[2];
  const deadPartner = commAble[3];
  Game.getPerson(deadBearer).dead = true;
  Game.getPerson(deadPartner).dead = true;

  // ---- (1) helper unit checks (no sitting needed) ----
  check('helper exists', typeof Game.convoFavorEndUrgent === 'function');
  v.favorLedger = v.favorLedger || {};

  const favorUrgent = {
    id: 'fav-r280-urgent', vid, kind: 'forage_help', state: 'promised',
    forageRun: { bearer: deadBearer, returned: false,
      playerHaul: [{ kcalEach: 100, units: 2 }], partnerHaul: [{ kcalEach: 100, units: 2 }] },
  };
  v.favorLedger[vid] = favorUrgent;
  check('helper true for bearer-ended forage run',
    Game.convoFavorEndUrgent(vid) === true);

  const favorWater = {
    id: 'fav-r280-water', vid: vid2, kind: 'water_haul', state: 'promised',
    waterRun: { bearer: deadBearer, returned: false, partnerWater: [] },
  };
  v.favorLedger[vid2] = favorWater;
  check('helper true for bearer-ended water run',
    Game.convoFavorEndUrgent(vid2) === true);

  const favorPartnerGone = {
    id: 'fav-r280-partner', vid: deadPartner, kind: 'forage_help', state: 'promised',
    forageRun: { bearer: me, returned: false,
      playerHaul: [{ kcalEach: 100, units: 2 }], partnerHaul: [{ kcalEach: 100, units: 2 }] },
  };
  // NB: the holder here is the dead partner themself — helper-only, no
  // sitting is opened with them. The scholar is the bearer, partner gone.
  v.favorLedger[deadPartner] = favorPartnerGone;
  check('helper true for forage partner-gone (scholar is bearer)',
    Game.convoFavorEndUrgent(deadPartner) === true);

  const favorWaterMine = {
    id: 'fav-r280-watermine', vid, kind: 'water_haul', state: 'promised',
    waterRun: { bearer: me, returned: false, partnerWater: [] },
  };
  // Temporarily swap vid's favor to the scholar-bearer water shape.
  v.favorLedger[vid] = favorWaterMine;
  check('helper false for water run the scholar themself bears (no r81 mirror)',
    Game.convoFavorEndUrgent(vid) === false);
  v.favorLedger[vid] = favorUrgent;

  const favorHealthy = {
    id: 'fav-r280-healthy', vid: vid2, kind: 'forage_help', state: 'promised',
    forageRun: { bearer: me, returned: false,
      playerHaul: [{ kcalEach: 100, units: 2 }], partnerHaul: [{ kcalEach: 100, units: 2 }] },
  };
  v.favorLedger[vid2] = favorHealthy;
  check('helper false for a healthy live run (living bearer, partner alive)',
    Game.convoFavorEndUrgent(vid2) === false);

  delete v.favorLedger[vid2];
  check('helper false with no favor at all',
    Game.convoFavorEndUrgent(vid2) === false);
  v.favorLedger[vid2] = favorHealthy;

  // ---- flood staging (shared by (2) and (3)) ----
  const nCases = stageCases(Game, v, vid, 10);
  check('10 open cases staged', nCases === 10);

  function driveAns(targetVid) {
    // Answer any hanging question (the opener's generic question owns
    // the menu until answered — ans:/gq: menus short-circuit paging and
    // never offer the cancel). Mirrors test-warnheed-reset-r277.js.
    for (let t = 0; t < 4; t++) {
      let choices = [];
      try { choices = Game.convoChoices(targetVid) || []; } catch (e) { break; }
      const ans = (choices || []).find(ch => ch && ch.id && ch.id.indexOf('ans:') === 0);
      if (!ans) break;
      const r = Game.convoTurn(targetVid, ans.id);
      if (r && r.ended) break;
    }
  }

  function hangStage0AskFavor(targetVid) {
    const c = Game.convoGet(targetVid);
    c.want = { id: 'ask_favor', stage: 0 };
    return c;
  }

  // ---- (2) urgent cancel FIRST on page 1 under the flood ----
  const opened = Game.startConvo(vid);
  check('urgent sitting opens', !!opened && !opened.refused && !opened.ended);
  driveAns(vid);
  hangStage0AskFavor(vid);
  const choices = Game.convoChoices(vid) || [];
  const cancelIdx = choices.findIndex(ch => ch && ch.id === 'dlg:favor_cancel');
  const menuPages = Game.convoGet(vid).menuPages;
  console.log(`  [probe] urgent menu: ${choices.length} choices on page 1, menuPages=${menuPages}, cancelIdx=${cancelIdx}`);
  console.log(`  [probe] page 1 ids: ${choices.map(ch => ch.id).join(',')}`);
  check('menu is actually flooded (multi-page)', menuPages > 1, `menuPages=${menuPages}`);
  check('urgent cancel IS offered', cancelIdx !== -1);
  check('urgent cancel is FIRST on page 1 (the fix)',
    cancelIdx === 0, `cancelIdx=${cancelIdx}`);
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- (3) CONTROL: healthy live run, same flood — cancel OFF page 1 ----
  const opened2 = Game.startConvo(vid2);
  check('control sitting opens', !!opened2 && !opened2.refused && !opened2.ended);
  driveAns(vid2);
  hangStage0AskFavor(vid2);
  const choices2 = Game.convoChoices(vid2) || [];
  const cancelIdx2 = choices2.findIndex(ch => ch && ch.id === 'dlg:favor_cancel');
  const menuPages2 = Game.convoGet(vid2).menuPages;
  console.log(`  [probe] control menu: ${choices2.length} choices on page 1, menuPages=${menuPages2}, cancelIdx=${cancelIdx2}`);
  check('control menu is actually flooded (multi-page)', menuPages2 > 1, `menuPages=${menuPages2}`);
  check('control cancel is NOT on page 1 (healthy end stays ranked last)',
    cancelIdx2 === -1, `cancelIdx2=${cancelIdx2} page1=${choices2.map(ch => ch.id).join(',')}`);
  // Sweep the remaining pages (driver-style, up to all pages): the healthy
  // early end must still be OFFERED somewhere — just not first.
  let foundPage2 = -1;
  {
    let guard = 0;
    let cur = choices2;
    while (guard < 20 && cur.some(ch => ch.id === 'menu:more')) {
      guard++;
      const nr = Game.convoNextMenu(vid2);
      if (!nr || !nr.choices) break;
      cur = nr.choices;
      if (cur.some(ch => ch.id === 'dlg:favor_cancel')) { foundPage2 = guard; break; }
    }
  }
  check('control cancel IS offered on a later page (reachable by paging)',
    foundPage2 > 0, `foundPage=${foundPage2}`);
  try { Game.endConvo(vid2, 'left'); } catch (e) {}

  // ---- (4) pressing the urgent cancel ends the run ----
  const opened3 = Game.startConvo(vid);
  check('end sitting opens', !!opened3 && !opened3.refused && !opened3.ended);
  driveAns(vid);
  hangStage0AskFavor(vid);
  const choices3 = Game.convoChoices(vid) || [];
  check('cancel offered in the end sitting',
    choices3.some(ch => ch && ch.id === 'dlg:favor_cancel'));
  const r = Game.convoTurn(vid, 'dlg:favor_cancel');
  check('pressing the urgent cancel ends the run (returned)',
    favorUrgent.forageRun.returned === true,
    `returned=${favorUrgent.forageRun.returned} line=${String((r && r.line) || '').slice(0, 100)}`);
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  console.log(`\n=== RESULT: ${pass} pass ===`);
  process.exit(0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
