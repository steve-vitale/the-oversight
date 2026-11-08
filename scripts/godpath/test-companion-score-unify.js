#!/usr/bin/env node
// test-companion-score-unify.js — VILLAGER-BRAIN Phase 4 residual (OVE-54).
//
// One companionScore ranks "who to spend time with" for the door ask,
// the party launch pick, and favor-company partner scoring. Prepared
// scene: three call sites agree on ranking order.
//
// Cases (seed 20261108):
//   1. companionScore / companionRank / companyPartnerScore exist and are wired.
//   2. Prepared asker + 3 candidates with distinct scores — door, party, and
//      company partner rankings are identical (same ids, same order, same s).
//   3. Door path (objAskCompanion candidate order via companionRank) matches.
//   4. Failing control: a private parallel formula (errand-only +4) disagrees
//      with the shared rank — proves the meter detects divergence.
//   5. Overwrite count stays 0 on refuse (OVE-45 invariant still holds).
//
// Usage: node scripts/godpath/test-companion-score-unify.js
// Exit 0 = pass, 1 = fail. No repo writes.
'use strict';
const path = require('path');
const { loadGame, setupGame } = require(path.join(__dirname, '..', 'sim-harness'));

const SEED = 20261108;
const K = require('./lib');
const T = K.reporter('companion-score-unify');

function setTemper(Game, vid, temper) {
  const person = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
  if (person) {
    person.personality = person.personality || {};
    person.personality.temperament = temper;
  }
  const chars = (Game.data && Game.data.villagers) || [];
  const ch = chars.find(x => x && x.id === vid);
  if (ch) {
    ch.personality = ch.personality || {};
    ch.personality.temperament = temper;
  }
}

function setNeeds(Game, vid, patch) {
  try {
    const n = Game.npcNeeds(vid);
    if (!n) return;
    Object.assign(n, patch);
  } catch (e) {}
}

function setOutdoorReady(Game, vid, hx, hy, ready) {
  const o = Game.objOf(vid);
  if (ready) {
    o.kind = 'FORAGE'; o.purpose = 'forage'; o.state = 'ready';
    o.indoor = false; o.tx = hx + 1; o.ty = hy;
    o.tightness = 1; o.partsLeft = 3; o.companion = null;
  } else {
    o.kind = 'HAVEN_CHORE'; o.purpose = 'chore'; o.state = 'indoor';
    o.indoor = true; o.companion = null; o.targetVid = null;
  }
}

function idsOf(rank) { return rank.map(r => r.id); }
function scoresOf(rank) { return rank.map(r => r.s); }

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'proof' });
  await setupGame(Game);
  Game.state.scholar.day = 14;
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;

  T.section('wiring');
  T.ok('companionScore attached', typeof Game.companionScore === 'function');
  T.ok('companionRank attached', typeof Game.companionRank === 'function');
  T.ok('companyPartnerScore attached', typeof Game.companyPartnerScore === 'function');

  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  T.ok('roster has ≥4 NPCs', ids.length >= 4, 'got ' + ids.length);
  if (ids.length < 4) return T.done();

  const asker = ids[0];
  const hi = ids[1];
  const mid = ids[2];
  const lo = ids[3];

  for (const id of ids) {
    setNeeds(Game, id, { hunger: 10, energy: 80, social: 40, fear: 10 });
    setTemper(Game, id, 'steady');
    setOutdoorReady(Game, id, hx, hy, false);
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
    try { Game.npcSetInside(id, true); } catch (e) {}
    v.trust = v.trust || {}; v.trust[id] = 20;
    v.sick = v.sick || {}; delete v.sick[id];
    v.away = v.away || {}; delete v.away[id];
    try {
      if (Game.bumpPersonTrust) {
        // Reset directional trust by writing a known floor via person map.
        const p = Game.getPerson(id);
        if (p) p.trust = {};
      }
    } catch (e) {}
  }

  // Distinct scores via the shared levers (errand +4, temper +2, trust +1, social +1):
  // hi: outdoor ready + bold + trust>40 + social>65  → 4+2+1+1 = 8
  // mid: outdoor ready + warm                         → 4+2     = 6
  // lo:  indoor + steady + low trust + low social     → 0
  setOutdoorReady(Game, hi, hx, hy, true);
  setTemper(Game, hi, 'bold');
  v.trust[hi] = 80;
  setNeeds(Game, hi, { social: 80 });

  setOutdoorReady(Game, mid, hx, hy, true);
  setTemper(Game, mid, 'warm');
  v.trust[mid] = 30;
  setNeeds(Game, mid, { social: 40 });

  setOutdoorReady(Game, lo, hx, hy, false);
  setTemper(Game, lo, 'steady');
  v.trust[lo] = 10;
  setNeeds(Game, lo, { social: 20 });

  const cands = [hi, mid, lo];

  T.section('shared ranking agreement');
  const doorRank = Game.companionRank(asker, cands, { context: 'door' });
  const partyRank = Game.companionRank(asker, cands, { context: 'party' });
  const companyRank = cands
    .map(id => ({ id, s: Game.companyPartnerScore(asker, id) }))
    .sort((a, b) => (b.s - a.s) || String(a.id).localeCompare(String(b.id)));

  T.ok('door rank order hi>mid>lo', idsOf(doorRank).join(',') === [hi, mid, lo].join(','),
    'got ' + idsOf(doorRank).join(',') + ' scores=' + scoresOf(doorRank).join(','));
  T.ok('party matches door', idsOf(partyRank).join(',') === idsOf(doorRank).join(',') &&
    scoresOf(partyRank).join(',') === scoresOf(doorRank).join(','),
    'party=' + idsOf(partyRank).join(',') + '/' + scoresOf(partyRank).join(','));
  T.ok('company matches door', idsOf(companyRank).join(',') === idsOf(doorRank).join(',') &&
    scoresOf(companyRank).join(',') === scoresOf(doorRank).join(','),
    'company=' + idsOf(companyRank).join(',') + '/' + scoresOf(companyRank).join(','));

  const sHi = Game.companionScore(asker, hi, { context: 'door' });
  const sMid = Game.companionScore(asker, mid, { context: 'door' });
  const sLo = Game.companionScore(asker, lo, { context: 'door' });
  T.ok('hi score is 8', sHi === 8, 'got ' + sHi);
  T.ok('mid score is 6', sMid === 6, 'got ' + sMid);
  T.ok('lo score is 0', sLo === 0, 'got ' + sLo);
  T.ok('companyPartnerScore === companionScore',
    Game.companyPartnerScore(asker, hi) === sHi &&
    Game.companyPartnerScore(asker, mid) === sMid &&
    Game.companyPartnerScore(asker, lo) === sLo);

  T.section('door ask uses shared rank');
  // Make asker outdoor-ready so objAskCompanion can run.
  setOutdoorReady(Game, asker, hx, hy, true);
  const askerObj = Game.objOf(asker);
  askerObj.tx = hx + 1; askerObj.ty = hy; askerObj.tightness = 1; askerObj.partsLeft = 3;
  askerObj.companion = null;
  for (const id of [hi, mid, lo, asker]) {
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
    v.away = v.away || {}; delete v.away[id];
    v.sick = v.sick || {}; delete v.sick[id];
  }
  // Refuse: overwrite count stays 0 (OVE-45).
  const beforeHi = {
    kind: Game.objOf(hi).kind, state: Game.objOf(hi).state, indoor: !!Game.objOf(hi).indoor,
  };
  const refused = Game.objAskCompanion(asker, askerObj, hx, hy, { roll: 1 });
  T.ok('refuse returns null', refused == null, 'got ' + refused);
  T.ok('refuse leaves companion objective untouched',
    Game.objOf(hi).kind === beforeHi.kind &&
    Game.objOf(hi).state === beforeHi.state &&
    !!Game.objOf(hi).indoor === beforeHi.indoor);
  // Accept: door picks the top companionScore candidate (hi), not roster-first.
  askerObj.companion = null;
  const accepted = Game.objAskCompanion(asker, askerObj, hx, hy, { roll: 0 });
  T.ok('accept returns top-ranked companion', accepted === hi,
    'got ' + accepted + ' expected ' + hi);
  T.ok('asker linked to top companion', askerObj.companion === hi,
    'companion=' + askerObj.companion);

  T.section('failing control — private formula diverges');
  // Restore distinct shared scores, then compare against a private
  // errand-only formula that ignores temper/trust/social — it must not
  // match the shared order (proves the agreement meter can fail).
  setOutdoorReady(Game, hi, hx, hy, true);
  setTemper(Game, hi, 'bold');
  v.trust[hi] = 80;
  setNeeds(Game, hi, { social: 80 });
  setOutdoorReady(Game, mid, hx, hy, false);
  setTemper(Game, mid, 'warm');
  v.trust[mid] = 30;
  setNeeds(Game, mid, { social: 40 });
  setOutdoorReady(Game, lo, hx, hy, true);
  setTemper(Game, lo, 'steady');
  v.trust[lo] = 10;
  setNeeds(Game, lo, { social: 20 });
  // shared: hi=8, lo=4 (errand only), mid=2 (warm) → hi,lo,mid
  // private errand-only: hi=4, lo=4, mid=0 → hi/lo by id, then mid
  // Force private top ≠ shared top by giving ONLY lo the errand under a
  // temper-blind scorer while shared still crowns hi.
  setOutdoorReady(Game, hi, hx, hy, false); // hi shared=4 (bold+trust+social), private=0
  // shared: lo=4, hi=4, mid=2 — lo/hi by id, then mid
  // private: lo=4, hi=0, mid=0 → lo first always
  const shared = Game.companionRank(asker, cands, { context: 'door' });
  const privateRank = cands.map(id => {
    const co = Game.objOf(id);
    const s = (co && !co.indoor && co.state === 'ready' && co.kind !== 'LEAVE') ? 4 : 0;
    return { id, s };
  }).sort((a, b) => (b.s - a.s) || String(a.id).localeCompare(String(b.id)));
  T.ok('private errand-only top is lo', privateRank[0] && privateRank[0].id === lo,
    privateRank[0] ? privateRank[0].id : 'empty');
  // Shared either crowns hi (when hi id < lo) or ties lo first; scores differ.
  T.ok('private score vector ≠ shared',
    cands.map(id => Game.companionScore(asker, id)).join(',') !==
    cands.map(id => {
      const co = Game.objOf(id);
      return (co && !co.indoor && co.state === 'ready' && co.kind !== 'LEAVE') ? 4 : 0;
    }).join(','),
    'sharedScores=' + cands.map(id => Game.companionScore(asker, id)).join(',') +
    ' privateScores=' + cands.map(id => {
      const co = Game.objOf(id);
      return (co && !co.indoor && co.state === 'ready' && co.kind !== 'LEAVE') ? 4 : 0;
    }).join(','));
  T.ok('control order diverges OR shared still uses temper/trust',
    idsOf(privateRank).join(',') !== idsOf(shared).join(',') ||
    (Game.companionScore(asker, hi) === 4 && Game.companionScore(asker, lo) === 4),
    'private=' + idsOf(privateRank).join(',') + ' shared=' + idsOf(shared).join(','));

  T.done();
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
