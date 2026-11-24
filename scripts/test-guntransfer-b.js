// test-guntransfer-b.js — arm sim-guntransfer-b: classify every
// living-holder gun transfer (DIAG — no game-code change).
//   node scripts/test-guntransfer-b.js            (pre-run checks:
//       frozen band, carried numbers, presence checks)
//   node scripts/test-guntransfer-b.js --live   (live proof on the
//       harness: succession moves the person, not the gun (T1); the
//       gear-day spares-gift moves a spare gun giver -> taker (T2); a
//       corpse rearm-take does NOT classify as a living transfer (T3);
//       a contest-prize grant does NOT classify as one (T4); the lend
//       path returns null with LEND unset and fires only with LEND=1 (T5))
//   node scripts/test-guntransfer-b.js --dir-arm <corpusDir>
//       corpus validation: 8 files, mode arm, substrate flags on, one
//       shared anchor, policySha matches competent.js, 0 instrument
//       errors, 8 staged arrivals bundled, holder-days == 989 (census
//       reproduction), every transfer classified, 0 unclassified,
//       lendFired == 0, zero src/js diffs.
// Reads only; never writes into the repo (live mode runs the harness
// in-memory only).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'guntransfer-driver-b'));
const analyzer = require(path.join(REPO, 'scripts', 'analyze-guntransfer-b'));
const censusAnalyzer = require(path.join(REPO, 'scripts', 'analyze-gunholder-census-b'));
const kbDriver = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

// Frozen from the prereg (sim-guntransfer-b).
const BAND_START = 107750;
const BAND_END = 107757;
const BAND_N = 8;
const CENSUS_HOLDER_DAYS = 989;
// Known transfers (gunholder-census-b §5) the replay must classify.
const KNOWN = [
  { seed: 107753, day: 69, holder: 'leo_martin', cls: 'succession' },
  { seed: 107754, day: 103, holder: 'gen_lq0e0m5', cls: 'succession' },
  { seed: 107755, day: 112, holder: 'gen_olsjsph', cls: 'succession' },
  { seed: 107756, day: 127, holder: 'yara_haddad', cls: 'succession' },
  { seed: 107754, day: 131, loser: 'gen_pc7f25r', gainer: 'zoltan_nagy', cls: 'gear-gift' },
];

function validateCorpus(dir) {
  const files = fs.readdirSync(dir).sort().filter(function (f) {
    return /guntransfer-b-s\d+-guntransfer-b-arm\.json$/.test(f);
  });
  const policySha = crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8'))
    .digest('hex').slice(0, 12);
  const anchors = {};
  const seeds = [];
  let errors = 0, missingAnchor = 0, policyMismatches = 0;
  let wrongMode = 0, bundleOff = 0, stageWrong = 0, rearmWrong = 0, rearmPresentOff = 0;
  let klArrivals = 0, klBundled = 0, holderDays = 0;
  let transfers = 0, unclassified = 0, misclassified = 0, lendFired = 0;
  let successionEvents = 0, gearGiftSear = 0;
  const seedJsons = [];
  files.forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seedJsons.push(c);
    seeds.push(c.seed);
    errors += (c.instrumentErrors || []).length;
    if (!c.anchorCommit) missingAnchor++;
    else anchors[c.anchorCommit] = (anchors[c.anchorCommit] || 0) + 1;
    if (c.policySha !== policySha) policyMismatches++;
    if (c.mode !== 'arm') wrongMode++;
    if (!c.killbundleOn) bundleOff++;
    if (!c.stageSearOn) stageWrong++;
    if (!c.rearmOn) rearmWrong++;
    if (!c.rearmPresent) rearmPresentOff++;
    const a = censusAnalyzer.analyzeSeed(c);
    klArrivals += a.klArrivals;
    klBundled += a.klBundled;
    holderDays += a.totalHolderDays;
    successionEvents += (c.successionEvents || []).length;
    gearGiftSear += (c.gearGiftEvents || []).filter(function (e) { return e.item === 'searcaster'; }).length;
    lendFired += (c.lendEvents || []).filter(function (e) { return e.fired; }).length;
  });
  const leg = analyzer.analyzeLeg(seedJsons);
  transfers = leg.transfers.length;
  unclassified = leg.unclassified;
  misclassified = leg.misclassified;
  const known = KNOWN.map(function (k) {
    const hit = leg.transfers.filter(function (t) {
      return t.seed === k.seed && t.day === k.day && t.cls === k.cls
        && (k.holder ? (t.newScholar === k.holder || t.loser === k.holder) : true)
        && (k.loser ? t.loser === k.loser : true)
        && (k.gainer ? t.gainer === k.gainer : true);
    });
    return { known: k, found: hit.length > 0, hit: hit[0] || null };
  });
  let srcJsDiff = null;
  try {
    srcJsDiff = execSync('git diff --stat HEAD -- src/js', { cwd: REPO }).toString().trim();
  } catch (e) { srcJsDiff = 'GIT-CHECK-FAILED: ' + String(e.message).slice(0, 80); }
  return {
    files: files.length, seeds: seeds, policySha: policySha,
    anchors: anchors, missingAnchor: missingAnchor,
    policyShaMismatches: policyShaMismatches, instrumentErrors: errors,
    wrongMode: wrongMode, bundleOff: bundleOff, stageWrong: stageWrong,
    rearmWrong: rearmWrong, rearmPresentOff: rearmPresentOff,
    klArrivals: klArrivals, klBundled: klBundled, klDry: klArrivals - klBundled,
    holderDays: holderDays, transfers: transfers, unclassified: unclassified,
    misclassified: misclassified, lendFired: lendFired,
    successionEvents: successionEvents, gearGiftSear: gearGiftSear,
    known: known, verdict: leg ? analyzer.judgeLeg(leg).verdict : null,
    srcJsDiff: srcJsDiff,
  };
}

function cellsOf(person) {
  let n = 0;
  for (const e of (person.items || [])) {
    const id = (typeof e === 'string') ? e : (e.itemId || e.id);
    if (id === 'fusion_cell') n += (typeof e === 'string') ? 1 : (e.units == null ? 1 : e.units);
  }
  return n;
}
function gunsOf(person) {
  let n = 0;
  for (const e of (person.items || [])) {
    const id = (typeof e === 'string') ? e : (e.itemId || e.id);
    if (id === 'searcaster') n += (typeof e === 'string') ? 1 : (e.units == null ? 1 : e.units);
  }
  return n;
}
function equippedGun(Game, person) {
  try {
    const S = globalThis.Scattering || {};
    const rw = (S.equipment && S.equipment.rangedWeaponOf) ? S.equipment.rangedWeaponOf(person, Game.data.items) : null;
    return rw ? (rw.itemId || rw.id) : null;
  } catch (e) { return null; }
}
function livePerson(Game, vid) {
  return Game.getPerson ? Game.getPerson(vid) : null;
}
function giveGun(Game, vid, cells) {
  const p = livePerson(Game, vid);
  p.items = p.items || [];
  p.items.push('searcaster');
  for (let i = 0; i < cells; i++) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: 1, kg: 0.4 });
  try { if (Game.villagerGearUp) Game.villagerGearUp(vid, false); } catch (e) {}
  return p;
}
function giveGunObject(Game, vid, cells) {
  // Contest-prize shape: the gun arrives as an OBJECT entry (alienLootGrant).
  // Bare-string guns (kill-loot / rearm shape) do NOT lend — see T5-string
  // below; the object shape is the only one _lendSearcaster can move.
  const p = livePerson(Game, vid);
  p.items = p.items || [];
  p.items.push({ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 0.4 });
  for (let i = 0; i < cells; i++) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: 1, kg: 0.4 });
  try { if (Game.villagerGearUp) Game.villagerGearUp(vid, false); } catch (e) {}
  return p;
}
function seedRow(Game, day) {
  const loc = kbDriver.gunLocationsOf(Game);
  return { day: day, scholarVid: Game.villagerId || null, locations: loc.locations,
    total: loc.total, personFlags: loc.personFlags, packCells: {} };
}
function seedJson(Game, rows, extra) {
  const base = { seed: 7, mode: 'arm', anchorCommit: 'test', gameSha: 'test',
    policySha: 'test', rearmOn: true, rearmPresent: true, instrumentErrors: [],
    days: 2, gameDays: 2, endReason: 'test', won: false, villageLost: false,
    scaleRank: 'village', maxWave: 1, unlockedWave: 1, standing: 50,
    v4gunLoc: rows, deaths: [], successionEvents: [], gearGiftEvents: [],
    lendEvents: [], lendReturnEvents: [], gearDayDiffs: [],
    grantEvents: [], killLootEvents: [], prizeEvents: [], rearmTakeEvents: [],
    corpseTakeEvents: [], fightEvents: [], encounterEvents: [], volleyEvents: [] };
  return Object.assign(base, extra || {});
}

async function liveTests() {
  let pass = 0, fail = 0;
  function check(name, cond, detail) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
  }
  process.env.KILLBUNDLE = '1';
  process.env.REARM_CELLS = '1';
  process.env.CELLGATE = '1';
  const { Game } = await loadGame({ seed: 7, mode: 'guntransfer-test', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []).filter(function (r) { return r && r !== Game.villagerId; });
  check('live: at least 10 living roster villagers to stage with', roster.length >= 10, 'roster=' + roster.length);
  check('live: playerDeath exists', typeof Game.playerDeath === 'function');
  check('live: tele exists', typeof Game.tele === 'function');
  check('live: villagerGearDay exists', typeof Game.villagerGearDay === 'function');
  check('live: _lendSearcaster exists', typeof Game._lendSearcaster === 'function');
  check('live: _returnLentSearcaster exists', typeof Game._returnLentSearcaster === 'function');

  // T1 — succession: the holder becomes the scholar; the gun does not move.
  const t1holder = roster[0];
  const oldScholar = Game.villagerId;
  giveGun(Game, t1holder, 2);
  check('live T1: holder staged (gun + 2 cells, equipped)', gunsOf(livePerson(Game, t1holder)) === 1 && cellsOf(livePerson(Game, t1holder)) === 2 && equippedGun(Game, livePerson(Game, t1holder)) === 'searcaster',
    'guns=' + gunsOf(livePerson(Game, t1holder)) + ' cells=' + cellsOf(livePerson(Game, t1holder)));
  // Trust-top: succession picks the highest-trust living villager.
  try { Game.state.village.trust = Game.state.village.trust || {}; Game.state.village.trust[t1holder] = 999; } catch (e) {}
  let pdOld = null, pdNew = null;
  const origPD = Game.playerDeath;
  Game.playerDeath = function (cause) {
    pdOld = this.villagerId || null;
    const ret = origPD.apply(this, arguments);
    pdNew = this.villagerId || null;
    return ret;
  };
  try { Game.playerDeath('the wild'); } catch (e) { check('live T1: playerDeath runs without throwing', false, String(e && e.message)); }
  Game.playerDeath = origPD;
  check('live T1: succession wrap records old -> new', pdOld === oldScholar && pdNew === t1holder, 'old=' + pdOld + ' new=' + pdNew);
  check('live T1: the holder IS the scholar now', Game.villagerId === t1holder, 'villagerId=' + Game.villagerId);
  const newScholarPerson = livePerson(Game, t1holder);
  // mantleBecome moves the successor's kit onto the scholar record and
  // clears the villager record ("never counted twice") — the gun now
  // lives in state.scholar.equipped, not on the person record.
  const schEq = (Game.state.scholar || {}).equipped || {};
  const schGun = Object.keys(schEq).map(function (k) { return schEq[k]; }).some(function (e) { return e && ((e.itemId || e.id) === 'searcaster'); });
  const schInvGuns = ((Game.state.scholar || {}).inventory || []).filter(function (e) { return (typeof e === 'string' ? e : (e.itemId || e.id)) === 'searcaster'; }).length;
  check('live T1: the new scholar still holds the gun (no item moved)', schGun || schInvGuns === 1,
    'scholarEquippedHasGun=' + schGun + ' scholarInvGuns=' + schInvGuns + ' personGuns=' + (newScholarPerson && gunsOf(newScholarPerson)));
  check('live T1: the villager record is cleared (kit lives on scholar.*)', !!newScholarPerson && gunsOf(newScholarPerson) === 0,
    'personGuns=' + (newScholarPerson && gunsOf(newScholarPerson)));
  // The old scholar's body keeps what it carried: a corpse exists for them.
  let oldCorpse = null;
  try { oldCorpse = (Game.corpses ? Game.corpses() : []).find(function (c) { return c && c.villagerId === oldScholar; }); } catch (e) {}
  check('live T1: the old scholar left a corpse (death pack, not a transfer)', !!oldCorpse, 'corpse=' + !!oldCorpse);

  // T2 — gear-day spares-gift: a spare gun moves giver -> taker.
  // The taker is whoever gains most (not a pre-picked vid): snapshot
  // every villager's guns first, then assert on the tele-named
  // recipient — the gift must land on someone who held no gun.
  const giver = roster[1];
  giveGun(Game, giver, 4);
  livePerson(Game, giver).items.push('searcaster'); // the spare duplicate
  check('live T2: giver staged with a spare (2 guns, 4 cells)', gunsOf(livePerson(Game, giver)) === 2 && cellsOf(livePerson(Game, giver)) === 4,
    'guns=' + gunsOf(livePerson(Game, giver)) + ' cells=' + cellsOf(livePerson(Game, giver)));
  const gunsBefore2 = {};
  roster.forEach(function (vid) {
    try { gunsBefore2[vid] = gunsOf(livePerson(Game, vid)); } catch (e) { gunsBefore2[vid] = -1; }
  });
  check('live T2: at least one gun-less villager exists to receive', roster.some(function (vid) { return vid !== giver && gunsBefore2[vid] === 0; }),
    JSON.stringify(gunsBefore2));
  const teleSeen = [];
  const origTele = Game.tele;
  Game.tele = function (type, payload) {
    const ret = origTele.apply(this, arguments);
    try { if (type === 'villager_gear') teleSeen.push({ type: type, payload: payload }); } catch (e) {}
    return ret;
  };
  let moved = null;
  try { moved = Game.villagerGearDay(); } catch (e) { check('live T2: villagerGearDay runs without throwing', false, String(e && e.message)); }
  Game.tele = origTele;
  const gift = teleSeen.filter(function (t) { return t.payload && t.payload.item === 'searcaster' && t.payload.from === giver; });
  check('live T2: tele villager_gear fires for the searcaster gift', gift.length === 1, 'seen=' + JSON.stringify(teleSeen.map(function (t) { return t.payload; })));
  check('live T2: the spare left the giver (1 gun left)', gunsOf(livePerson(Game, giver)) === 1, 'guns=' + gunsOf(livePerson(Game, giver)));
  if (gift.length === 1) {
    const recip = gift[0].payload.vid;
    check('live T2: the recipient held no gun before the gift', gunsBefore2[recip] === 0, 'recipient=' + recip + ' gunsBefore=' + gunsBefore2[recip]);
    check('live T2: the recipient holds the gun, equipped', gunsOf(livePerson(Game, recip)) === 1 && equippedGun(Game, livePerson(Game, recip)) === 'searcaster',
      'recipient=' + recip + ' guns=' + gunsOf(livePerson(Game, recip)) + ' equipped=' + equippedGun(Game, livePerson(Game, recip)));
    check('live T2: the recipient got no cells with it (gear moves, cells do not)', cellsOf(livePerson(Game, recip)) === 0,
      'recipientCells=' + cellsOf(livePerson(Game, recip)));
  } else {
    check('live T2: the recipient holds the gun, equipped', false, 'no gift event to name a recipient');
    check('live T2: the recipient got no cells with it (gear moves, cells do not)', false, 'no gift event to name a recipient');
  }
  check('live T2: the giver kept the cells (gear moves, cells do not)', cellsOf(livePerson(Game, giver)) === 4,
    'giverCells=' + cellsOf(livePerson(Game, giver)));
  check('live T2: gear day reports a move', typeof moved === 'number' && moved >= 1, 'moved=' + moved);

  // T3 — corpse rearm-take is NOT a living transfer (live take + analyzer).
  // Pick dead/taker fresh: the taker must be gun-less for a second-life take.
  const deadVid = roster.filter(function (vid) { return vid !== Game.villagerId && gunsOf(livePerson(Game, vid)) === 0; })[0];
  const taker3 = roster.filter(function (vid) { return vid !== Game.villagerId && vid !== deadVid && gunsOf(livePerson(Game, vid)) === 0; })[0];
  check('live T3: taker starts gun-less', !!taker3 && gunsOf(livePerson(Game, taker3)) === 0, 'taker3=' + taker3);
  giveGun(Game, deadVid, 2);
  const deadPerson = livePerson(Game, deadVid);
  let corpse = null;
  try {
    const rc = Game.registerDeath ? Game.registerDeath({ kind: 'villager', villagerId: deadVid, name: deadPerson.name || deadVid, mx: 4, my: 4, cause: 'the wild', killerId: null, items: deadPerson.items.slice(), player: false }) : null;
    corpse = rc || null;
  } catch (e) { check('live T3: registerDeath builds the corpse', false, String(e && e.message)); }
  check('live T3: corpse built holding the gun', !!corpse && (corpse.items || []).some(function (it) { return (typeof it === 'string' ? it : (it.itemId || it.id)) === 'searcaster'; }),
    'corpseItems=' + JSON.stringify((corpse && corpse.items || []).map(function (it) { return (typeof it === 'string' ? it : (it.itemId || it.id)); })));
  const rowBefore3 = seedRow(Game, 1);
  let takeRec = null;
  try { takeRec = Game.villagerRearmFromCorpse ? Game.villagerRearmFromCorpse(corpse, taker3, 'expedition') : null; } catch (e) { check('live T3: rearm take runs without throwing', false, String(e && e.message)); }
  check('live T3: rearm take returns a second-life record', !!(takeRec && takeRec.gun && takeRec.taker === taker3), JSON.stringify(takeRec));
  const rowAfter3 = seedRow(Game, 2);
  const c3 = seedJson(Game, [rowBefore3, rowAfter3], {
    rearmTakeEvents: [{ day: 2, taker: taker3, corpseVid: deadVid, corpseId: (corpse && corpse.id) || null, kind: 'second-life', gun: true, cells: 2, channel: 'expedition' }],
    deaths: [{ day: 1, kind: 'villager', who: deadVid, cause: 'the wild', player: false }],
  });
  const a3 = analyzer.analyzeSeed(c3);
  check('live T3: analyzer finds 0 living transfers for the rearm take', a3.transfers.length === 0, JSON.stringify(a3.transfers));

  // T4 — contest-prize grant is NOT a living transfer (live grant + analyzer).
  const winner = roster.filter(function (vid) { return vid !== Game.villagerId && gunsOf(livePerson(Game, vid)) === 0; })[0];
  check('live T4: winner starts gun-less', !!winner && gunsOf(livePerson(Game, winner)) === 0, 'winner=' + winner);
  const rowBefore4 = seedRow(Game, 1);
  let granted = null;
  try { granted = Game.alienLootGrant ? Game.alienLootGrant('searcaster', livePerson(Game, winner)) : null; } catch (e) { check('live T4: grant runs without throwing', false, String(e && e.message)); }
  check('live T4: grant lands a gun on the winner', !!granted && gunsOf(livePerson(Game, winner)) === 1, 'guns=' + gunsOf(livePerson(Game, winner)));
  const rowAfter4 = seedRow(Game, 2);
  const c4 = seedJson(Game, [rowBefore4, rowAfter4], {
    grantEvents: [{ day: 2, itemId: 'searcaster', toKind: 'villager', toVid: winner, caller: 'contest-prize', frame: null }],
    prizeEvents: [{ seq: 1, day: 2, who: 'player', contestId: 'tithe', granted: true, gains: [{ holder: winner, gunsGained: 1, cellsGained: 0, cellsAfter: 0 }] }],
  });
  const a4 = analyzer.analyzeSeed(c4);
  check('live T4: analyzer finds 0 living transfers for the grant', a4.transfers.length === 0, JSON.stringify(a4.transfers));

  // T5 — lend: null with LEND unset, fires with LEND=1.
  // Pick lead/lender fresh at T5 time (earlier tests moved guns around):
  // the lender gets a fresh loaded gun, the lead must be gun-less with
  // no ranged weapon at all, so the lend can only be a gun lend.
  const lenderCandidates = roster.filter(function (vid) { return vid !== Game.villagerId && gunsOf(livePerson(Game, vid)) === 0; });
  const lender = lenderCandidates[0];
  giveGunObject(Game, lender, 2);
  // T3/T4 left OTHER villagers armed (taker3: string gun + 2 cells from
  // the rearm take; winner: object gun from the grant). The lend scan
  // takes the FIRST armed villager in roster order within 1 tile of the
  // monster — taker3's string gun makes the scan pick them and return
  // null (the T5-string gap). Strip every other villager's guns + cells
  // so the staged lender is the only possible lender (T3/T4 already
  // asserted; T5 is the last stage).
  roster.forEach(function (vid) {
    if (vid === lender || vid === Game.villagerId) return;
    const p = livePerson(Game, vid);
    if (!p || !p.items) return;
    p.items = p.items.filter(function (e) {
      const id = (typeof e === 'string') ? e : (e.itemId || e.id);
      return id !== 'searcaster' && id !== 'fusion_cell';
    });
    try { if (Game.villagerGearUp) Game.villagerGearUp(vid, false); } catch (e) {}
  });
  const lead = roster.filter(function (vid) {
    return vid !== Game.villagerId && vid !== lender && gunsOf(livePerson(Game, vid)) === 0 && !equippedGun(Game, livePerson(Game, vid));
  })[0];
  check('live T5: lender staged loaded (gun + 2 cells, equipped)', !!lender && gunsOf(livePerson(Game, lender)) === 1 && cellsOf(livePerson(Game, lender)) === 2 && equippedGun(Game, livePerson(Game, lender)) === 'searcaster',
    'lender=' + lender + ' guns=' + (lender && gunsOf(livePerson(Game, lender))));
  check('live T5: lead staged gun-less with no ranged weapon', !!lead && gunsOf(livePerson(Game, lead)) === 0 && !equippedGun(Game, livePerson(Game, lead)),
    'lead=' + lead);
  const mdef4 = ((Game.data.monsters || []).find(function (m) { return m.wave === 4; })) || null;
  check('live T5: a wave-4 monster def exists', !!mdef4, mdef4 && mdef4.id);
  let lendOff = 'not-run', lendOn = 'not-run';
  try {
    try { if (Game.npcSetNode) { Game.npcSetNode(lead, 4, 4); Game.npcSetNode(lender, 4, 4); } } catch (e) {}
    delete process.env.LEND;
    lendOff = Game._lendSearcaster(lead, { id: (mdef4 && mdef4.id) || 'x', tx: 4, ty: 4 }, mdef4, {});
    check('live T5: _lendSearcaster returns null with LEND unset', lendOff === null, JSON.stringify(lendOff));
    check('live T5: the gun stays with the lender while LEND is off', gunsOf(livePerson(Game, lender)) === 1 && gunsOf(livePerson(Game, lead)) === 0,
      'lender=' + gunsOf(livePerson(Game, lender)) + ' lead=' + gunsOf(livePerson(Game, lead)));
    // T5-string (known gap, filed in sim-findings — NOT chased here): a
    // bare-string gun entry (kill-loot / rearm shape) never lends, even
    // with LEND=1 — the entry scan reads itemId/id/material, all null on
    // a string. Swap the lender's gun to the string shape and show it.
    process.env.LEND = '1';
    const lp = livePerson(Game, lender);
    lp.items = ['searcaster', { itemId: 'fusion_cell', name: 'Fusion cell', units: 2, kg: 0.4 }];
    try { if (Game.villagerGearUp) Game.villagerGearUp(lender, false); } catch (e) {}
    const lendString = Game._lendSearcaster(lead, { id: (mdef4 && mdef4.id) || 'x', tx: 4, ty: 4 }, mdef4, {});
    check('live T5-string: string-entry gun does not lend even with LEND=1 (known gap)', lendString === null, JSON.stringify(lendString));
    check('live T5-string: the string gun stays with the lender', gunsOf(livePerson(Game, lender)) === 1 && gunsOf(livePerson(Game, lead)) === 0,
      'lender=' + gunsOf(livePerson(Game, lender)) + ' lead=' + gunsOf(livePerson(Game, lead)));
    giveGunObject(Game, lender, 0); // restore the object gun (cells already there)
    livePerson(Game, lender).items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: 2, kg: 0.4 });
    try { if (Game.villagerGearUp) Game.villagerGearUp(lender, false); } catch (e) {}
    lendOn = Game._lendSearcaster(lead, { id: (mdef4 && mdef4.id) || 'x', tx: 4, ty: 4 }, mdef4, {});
    check('live T5: _lendSearcaster fires with LEND=1 (gun lend)', !!(lendOn && lendOn.lender === lender && lendOn.borrower === lead && lendOn.kind === 'gun'), JSON.stringify(lendOn));
    check('live T5: the gun moved to the lead with LEND on', gunsOf(livePerson(Game, lead)) === 1, 'lead=' + gunsOf(livePerson(Game, lead)));
  } catch (e) {
    check('live T5: lend probe runs without throwing', false, String(e && e.message));
  } finally {
    delete process.env.LEND;
  }
  // Return the lent gun so later checks (none) see a clean state; the
  // process ends here in any case.
  try { if (lendOn && Game._returnLentSearcaster) Game._returnLentSearcaster(lendOn); } catch (e) {}

  console.log('guntransfer test --live: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--live') !== -1) {
    const ok = await liveTests();
    process.exit(ok ? 0 : 1);
  }
  if (args[0] === '--dir-arm' && args[1]) {
    const v = validateCorpus(args[1]);
    const okFiles = v.files === BAND_N;
    const okSeeds = JSON.stringify(v.seeds.slice().sort()) === JSON.stringify([107750, 107751, 107752, 107753, 107754, 107755, 107756, 107757]);
    const okAnchor = Object.keys(v.anchors).length === 1 && v.missingAnchor === 0;
    const okPolicy = v.policyShaMismatches === 0;
    const okErrors = v.instrumentErrors === 0;
    const okFlags = v.wrongMode === 0 && v.bundleOff === 0 && v.stageWrong === 0 && v.rearmWrong === 0 && v.rearmPresentOff === 0;
    const okBundle = v.klArrivals === BAND_N && v.klBundled === v.klArrivals && v.klDry === 0;
    const okRepro = v.holderDays === CENSUS_HOLDER_DAYS;
    const okClass = v.unclassified === 0 && v.misclassified === 0;
    const okLend = v.lendFired === 0;
    const okKnown = v.known.every(function (k) { return k.found; });
    const okSrc = v.srcJsDiff === '';
    const all = okFiles && okSeeds && okAnchor && okPolicy && okErrors && okFlags && okBundle && okRepro && okClass && okLend && okKnown && okSrc;
    console.log(JSON.stringify({ files: v.files, seeds: v.seeds, anchors: v.anchors,
      policyShaMismatches: v.policyShaMismatches, instrumentErrors: v.instrumentErrors,
      flags: { wrongMode: v.wrongMode, bundleOff: v.bundleOff, stageWrong: v.stageWrong, rearmWrong: v.rearmWrong, rearmPresentOff: v.rearmPresentOff },
      klArrivals: v.klArrivals, klBundled: v.klBundled, klDry: v.klDry,
      holderDays: v.holderDays, censusHolderDays: CENSUS_HOLDER_DAYS,
      transfers: v.transfers, unclassified: v.unclassified, misclassified: v.misclassified,
      lendFired: v.lendFired, successionEvents: v.successionEvents, gearGiftSear: v.gearGiftSear,
      known: v.known.map(function (k) { return { seed: k.known.seed, day: k.known.day, cls: k.known.cls, found: k.found }; }),
      verdict: v.verdict, srcJsDiffEmpty: okSrc,
      checks: { okFiles: okFiles, okSeeds: okSeeds, okAnchor: okAnchor, okPolicy: okPolicy, okErrors: okErrors, okFlags: okFlags, okBundle: okBundle, okRepro: okRepro, okClass: okClass, okLend: okLend, okKnown: okKnown, okSrc: okSrc } }, null, 2));
    console.log('guntransfer test --dir-arm: ' + (all ? 'PASS' : 'FAIL'));
    process.exit(all ? 0 : 1);
  }
  // Pre-run checks (no --live, no --dir-arm).
  let pass = 0, fail = 0;
  function check(name, cond, detail) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
  }
  check('prereg: band is 107750-107757 (8 seeds)', BAND_START === 107750 && BAND_END === 107757 && BAND_N === 8);
  check('prereg: census holder-days frozen at 989', CENSUS_HOLDER_DAYS === 989);
  check('prereg: 5 known pilot-band transfers listed', KNOWN.length === 5);
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const ledgerSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'ledger.js'), 'utf8');
  const buildSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-build.js'), 'utf8');
  const corpsesSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'corpses.js'), 'utf8');
  check('presence: playerDeath in ledger.js (succession)', /playerDeath\(cause\)/.test(ledgerSrc));
  check('presence: trust-top successor pick', /candidates\.sort\(\(a, b\) => \(trust\[b\]/.test(ledgerSrc));
  check('presence: successor keeps own kit', /SUCCESSOR'S OWN KIT/.test(ledgerSrc));
  check('presence: villagerGearDay spares-gift in villager-build.js', /spares to whoever gains most/.test(buildSrc) && /via: 'gift'/.test(buildSrc));
  check('presence: _lendSearcaster env-gated LEND=1', /process\.env\.LEND === '1'/.test(gameSrc));
  check('presence: rearm transfer in corpses.js', /villagerRearmFromCorpse/.test(corpsesSrc));
  check('driver: guntransfer-driver-b.js exists', fs.existsSync(path.join(REPO, 'scripts', 'guntransfer-driver-b.js')));
  check('analyzer: analyze-guntransfer-b.js exists', fs.existsSync(path.join(REPO, 'scripts', 'analyze-guntransfer-b.js')));
  check('driver: playerDeath wrap installed', /wrapGame\('playerDeath'/.test(fs.readFileSync(path.join(REPO, 'scripts', 'guntransfer-driver-b.js'), 'utf8')));
  check('driver: tele villager_gear wrap installed', /type === 'villager_gear'/.test(fs.readFileSync(path.join(REPO, 'scripts', 'guntransfer-driver-b.js'), 'utf8')));
  check('driver: scholarVid recorded per daily row', /scholarVid: Game\.villagerId/.test(fs.readFileSync(path.join(REPO, 'scripts', 'guntransfer-driver-b.js'), 'utf8')));
  check('driver: lend wraps installed', /wrapGame\('_lendSearcaster'/.test(fs.readFileSync(path.join(REPO, 'scripts', 'guntransfer-driver-b.js'), 'utf8')) && /wrapGame\('_returnLentSearcaster'/.test(fs.readFileSync(path.join(REPO, 'scripts', 'guntransfer-driver-b.js'), 'utf8')));
  // Carried numbers (gunholder-census-b §2/§5) the prereg's bars rest on.
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-24', 'sim-gunholder-census-b.md'), 'utf8');
  check('carried: census evidence names Leo Martin d69', /Leo Martin \(s107753,\s*day 69\)/.test(ev));
  check('carried: census evidence names Zoltan Nagy d131', /Zoltan Nagy is equipped with a dry gun/.test(ev) || /Zoltan Nagy s107754 d131/.test(ev));
  check('carried: census corpus has 8 per-seed files', fs.readdirSync(path.join(REPO, 'evidence', '2026-11-24', 'perseed-gunholder-census-b')).filter(function (f) { return f.endsWith('.json'); }).length === 8);
  console.log('guntransfer test pre-run: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { validateCorpus: validateCorpus, KNOWN: KNOWN };
