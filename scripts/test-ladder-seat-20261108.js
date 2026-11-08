// scripts/test-ladder-seat-20261108.js — ladder seat surgery proofs (leg 2).
// Prereg: evidence/2026-11-08/sim-ladder-leg2-prereg.md (bars L2-1, L2-5, L2-7).
// Uses the shared kit (scripts/godpath/lib.js); rigged states, no seeds.
'use strict';
const K = require('./godpath/lib');

function resetXp(Game) {
  // Zero every track for the scholar and every living villager, so each
  // rigged total is exact (npcXp() seeds an occupation lean on first
  // touch — overwriting every track after creation removes it).
  const T = ['combat', 'field', 'social', 'craft', 'strange'];
  const pt = Game.playerTracks();
  for (const t of T) pt[t].xp = 0;
  const roster = ((Game.state.village || {}).roster || []);
  for (const vid of roster) {
    if (!vid || vid === Game.villagerId) continue;
    const vp = Game.vpOf ? Game.vpOf(vid) : null;
    if (vp && vp.dead) continue;
    const x = Game.npcXp(vid);
    for (const t of T) x[t] = 0;
  }
}

function setLedger(Game, wave, points) {
  Game.state.waveLedger = Game.state.waveLedger || {};
  Game.state.waveLedger[wave] = { points, perType: {}, perTypeX: {} };
}

function resetLadderState(Game) {
  resetXp(Game);
  Game.state.waveLedger = {};
  Game.state.feastLog = [];
  Game.state.waveKillLog = [];
  try { Game.deedState().contestsSurvived = 0; } catch (e) {}
  try { Game.state.codex = { plants: {}, monsters: {}, animals: {}, recipes: {}, techniques: {}, skills: {} }; } catch (e) {}
  try { const ls = Game.hierarchyState(); ls.length = 0; } catch (e) {}
  delete Game.state._ladderPeakStage;
  delete Game.state._ladderCapBeat;
  try { Game.state.nationalLive = false; Game.state.globalLive = false; Game.state.networkLive = false; } catch (e) {}
  try {
    const pg = Game.progState();
    delete pg.ladderCapstone; delete pg.ladderCapstoneDay; delete pg.ladderCapstoneDetail;
    pg.crises = {}; pg.sentimentTaught = false;
    pg.tableWaiting = false; pg.tableDone = false; pg.tableAnnounced = false;
  } catch (e) {}
  try {
    const s = Game.state.scholar;
    s.prog = s.prog || {};
    delete s.prog.feastSurgeUsed; delete s.prog.feastSurge;
    s.integration = 0;
  } catch (e) {}
}

function rigVillage(Game) { // 12 counted: Fight 6 + Forage 6
  setLedger(Game, 3, 12);
  Game.playerTracks().field.xp = 72;
}

function rigNational(Game) { // 40 counted: Fight 24 + Forage 16
  setLedger(Game, 3, 48);
  Game.playerTracks().field.xp = 192;
}

function wavesFor(counts) { // synthetic deed keys, like test-fullseat-shortfall
  const out = {};
  counts.forEach((n, wi) => { for (let i = 0; i < n; i++) out[`w${wi + 1}_${i}`] = wi + 1; });
  return out;
}

function rigDeeds(Game, o) {
  o = o || {};
  const d = Game.deedState();
  d.wavesFaced = wavesFor(o.w || [5, 5, 4, 3, 2]);
  d.contestsSurvived = (o.contests == null) ? 3 : o.contests;
  const pg = Game.progState();
  pg.crises = {};
  const nc = (o.crises == null) ? 3 : o.crises;
  for (let i = 0; i < nc; i++) pg.crises['crisis_' + i] = 1;
  Game.state.nationalLive = false; Game.state.globalLive = false; Game.state.networkLive = false;
  if (o.rank === 'national') Game.state.nationalLive = true;
  else if (o.rank === 'global') Game.state.globalLive = true;
  else if (o.rank === 'regional') Game.state.networkLive = true;
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  s.integration = (o.integration == null) ? 45 : o.integration; // 45 -> integration stage 2
  pg.sentimentTaught = !!o.sentiment;
  s.prog = s.prog || {};
  if (o.surge) s.prog.feastSurgeUsed = true; else delete s.prog.feastSurgeUsed;
}

function livingVillager(Game) {
  const roster = ((Game.state.village || {}).roster || []);
  for (const vid of roster) {
    if (!vid || vid === Game.villagerId) continue;
    const vp = Game.vpOf ? Game.vpOf(vid) : null;
    if (vp && !vp.dead) return vid;
  }
  return null;
}

async function main() {
  const T = K.reporter('test-ladder-seat-20261108');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);

  // --- L2-5 data: ladder-capstones.json loads (not the in-code mirror) ---
  T.ok('data.ladderCapstones is the JSON (has _doc)', !!(Game.data && Game.data.ladderCapstones && Game.data.ladderCapstones._doc), JSON.stringify(Game.data && Game.data.ladderCapstones && Object.keys(Game.data.ladderCapstones)));
  T.ok('data.ladderCapstones holds 3 capstones', !!(Game.data && Game.data.ladderCapstones && Array.isArray(Game.data.ladderCapstones.capstones) && Game.data.ladderCapstones.capstones.length === 3), 'got ' + (Game.data && Game.data.ladderCapstones && Game.data.ladderCapstones.capstones && Game.data.ladderCapstones.capstones.length));
  const defs = Game.ladderCapstones();
  T.ok('ladderCapstones() returns the three defs', Array.isArray(defs) && defs.length === 3 && defs.map(d => d.id).sort().join(',') === 'feast_embassy,military_tribute,trade_charter', defs.map(d => d.id).join(','));

  // --- deedGateReady without feastSurgeUsed (brief §b.4) ---
  resetLadderState(Game);
  rigDeeds(Game, { rank: 'national', sentiment: true, surge: false });
  let g = Game.deedGateReady();
  T.ok('deedGateReady ok with sentimentTaught, NO surge (pellet bearer unblocked)', g.ok === true && g.foodDeeds === true, JSON.stringify(g));
  resetLadderState(Game);
  rigDeeds(Game, { rank: 'national', sentiment: false, surge: true });
  g = Game.deedGateReady();
  T.ok('deedGateReady refuses: lesson untaught even with a spent surge', g.ok === false && g.foodDeeds === false, JSON.stringify(g));

  // --- lesser opens at Village with sentimentTaught and no feast ---
  resetLadderState(Game);
  rigDeeds(Game, { w: [4, 4, 3, 0, 0], contests: 2, crises: 2, rank: 'regional', sentiment: true, surge: false });
  rigVillage(Game);
  let seat = Game.tableSeat();
  T.ok('lesser opens at Village peak with sentimentTaught and no feast', seat.seat === 'lesser', seat.seat);
  T.ok('lesser detail carries ladder peak 1', seat.detail && seat.detail.ladderPeakStage === 1, 'peak ' + (seat.detail && seat.detail.ladderPeakStage));
  T.ok('lesser detail carries ladder counted >= 12', seat.detail && (seat.detail.ladderCounted | 0) >= 12, 'counted ' + (seat.detail && seat.detail.ladderCounted));

  // --- lesser refuses below Village ---
  resetLadderState(Game);
  rigDeeds(Game, { w: [4, 4, 3, 0, 0], contests: 2, crises: 2, rank: 'regional', sentiment: true, surge: false });
  seat = Game.tableSeat();
  T.ok('lesser refuses below Village peak', seat.seat === 'none', seat.seat);
  T.ok('lesser detail names ladder peak 0', seat.detail && seat.detail.ladderPeakStage === 0, 'peak ' + (seat.detail && seat.detail.ladderPeakStage));

  // --- full needs National + capstone ---
  resetLadderState(Game);
  rigDeeds(Game, { rank: 'national', sentiment: true, surge: false });
  rigNational(Game);
  seat = Game.tableSeat();
  T.ok('full refuses with National peak but NO capstone (lesser instead)', seat.seat === 'lesser', seat.seat);
  let fs = Game.fullSeatShortfall(seat);
  T.ok('shortfall names the missing capstone', fs.missing.some(m => /no capstone deed delivered/.test(m)), JSON.stringify(fs.missing));
  T.ok('shortfall does NOT name the unspent surge', !fs.missing.some(m => /surge/i.test(m)), JSON.stringify(fs.missing));
  for (const kind of ['military_tribute', 'trade_charter', 'feast_embassy']) {
    Game.progState().ladderCapstone = kind;
    seat = Game.tableSeat();
    T.ok('full opens with capstone delivered: ' + kind, seat.seat === 'full', seat.seat);
    delete Game.progState().ladderCapstone;
  }
  seat = Game.tableSeat();
  T.ok('full refuses again once the capstone record is gone', seat.seat === 'lesser', seat.seat);
  // Full refuses below National peak even with a capstone.
  resetLadderState(Game);
  rigDeeds(Game, { rank: 'national', sentiment: true, surge: false });
  rigVillage(Game); // peak 1
  Game.progState().ladderCapstone = 'trade_charter';
  seat = Game.tableSeat();
  T.ok('full refuses below National peak even with a capstone', seat.seat === 'lesser', seat.seat);
  fs = Game.fullSeatShortfall(seat);
  T.ok('shortfall names the ladder points shortfall', fs.missing.some(m => /only \d+ of 40 counted ladder points/.test(m)), JSON.stringify(fs.missing));
  T.ok('shortfall names the cap never-silently (ladder line quoted)', fs.missing.some(m => /Ladder —/.test(m)), JSON.stringify(fs.missing));
  // Full still refuses when another bar fails.
  resetLadderState(Game);
  rigDeeds(Game, { rank: 'national', sentiment: true, surge: false, contests: 2 });
  rigNational(Game);
  Game.progState().ladderCapstone = 'trade_charter';
  seat = Game.tableSeat();
  T.ok('full refuses when contests are short (2 of 3)', seat.seat === 'lesser', seat.seat);
  // A full seat with everything met names nothing missing.
  resetLadderState(Game);
  rigDeeds(Game, { rank: 'national', sentiment: true, surge: false });
  rigNational(Game);
  Game.progState().ladderCapstone = 'trade_charter';
  seat = Game.tableSeat();
  T.ok('full seat prices with everything met and no surge spent', seat.seat === 'full', seat.seat);
  fs = Game.fullSeatShortfall(seat);
  T.ok('full seat shortfall is empty when earned', fs.ready === true && fs.missing.length === 0 && fs.line === '', JSON.stringify(fs));

  // --- seat lines voice the ladder (Q10) ---
  resetLadderState(Game);
  rigDeeds(Game, { w: [4, 4, 3, 0, 0], contests: 2, crises: 2, rank: 'regional', sentiment: true, surge: false });
  rigVillage(Game);
  seat = Game.tableSeat();
  const lesserLine = Game.tableSeatLine(seat);
  T.ok('lesser seat line names the ladder', /Ladder — Village Standing/.test(lesserLine), lesserLine);
  T.ok('lesser seat line names counted tracks', /Fight 6/.test(lesserLine) && /Forage 6/.test(lesserLine), lesserLine);
  resetLadderState(Game);
  rigDeeds(Game, { rank: 'national', sentiment: true, surge: false });
  rigNational(Game);
  Game.progState().ladderCapstone = 'trade_charter';
  seat = Game.tableSeat();
  const fullLine = Game.tableSeatLine(seat);
  T.ok('full seat line names the ladder', /Ladder — National Standing/.test(fullLine), fullLine);
  const plain = Game.tableSeatLine({ seat: 'lesser', detail: { rank: 'regional', w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2 } });
  T.ok('seat without ladder detail reads the old line byte-identical', plain === 'A lesser seat — regional standing, waves 1–3 faced (4/4/3), 2 contests survived, 2 crises weathered. The table does not rise. It prices.', plain);

  // --- tablePreview carries the ladder block (leg 3 renders it) ---
  resetLadderState(Game);
  rigDeeds(Game, { rank: 'national', sentiment: true, surge: false });
  rigNational(Game);
  Game.progState().ladderCapstone = 'feast_embassy';
  const pg = Game.progState();
  pg.tableWaiting = true; pg.tableDone = false;
  Game.state.scholar.day = 95;
  const pv = Game.tablePreview();
  T.ok('preview exists on a priced seat', !!pv, JSON.stringify(pv && pv.seat));
  T.ok('preview ladder block: National, 40 counted', !!pv && pv.ladder && pv.ladder.stage === 3 && pv.ladder.counted >= 40, JSON.stringify(pv && pv.ladder));
  T.ok('preview ladder block names the capstone', !!pv && pv.ladder && pv.ladder.capstone === 'feast_embassy', JSON.stringify(pv && pv.ladder));
  T.ok('preview ladder line names National Standing', !!pv && pv.ladder && /National Standing/.test(pv.ladder.line), JSON.stringify(pv && pv.ladder));

  // --- L2-7 LIVE vs PEAK: the seat stays priced after the village thins ---
  // (prereg decision: PEAK stage gates the seat. The ladder is the living
  // village's strength — deaths drop the LIVE stage — but the seat is priced
  // on what the village DID, the capstone delivery is irreversible, and the
  // standing offer does not withdraw.)
  resetLadderState(Game);
  rigDeeds(Game, { rank: 'national', sentiment: true, surge: false });
  // Ladder from the ROSTER's XP (not the scholar's), so deaths move it.
  const roster = ((Game.state.village || {}).roster || []).filter(vid => vid && vid !== Game.villagerId);
  const v1 = roster[0], v2 = roster[1];
  T.ok('two living villagers exist to rig', !!v1 && !!v2);
  setLedger(Game, 3, 48); // Fight 24
  if (v1) Game.npcXp(v1).field = 96;
  if (v2) Game.npcXp(v2).field = 96; // Forage 16 -> 40 counted, National
  T.ok('rigged National (live)', Game.ladderStage() === 3, 'stage ' + Game.ladderStage());
  Game.progState().ladderCapstone = 'trade_charter';
  seat = Game.tableSeat();
  T.ok('full seat priced at National', seat.seat === 'full', seat.seat);
  // Record the peak the honest way (a real dawn tick), then lose both villagers.
  Game.ladderTick();
  T.ok('peak recorded at 3 by the tick', Game.ladderPeakStage() === 3, 'peak ' + Game.ladderPeakStage());
  if (v1) { const vp = Game.vpOf(v1); if (vp) vp.dead = true; }
  if (v2) { const vp = Game.vpOf(v2); if (vp) vp.dead = true; }
  T.ok('live stage DROPPED after the deaths (the test is not vacuous)', Game.ladderStage() < 3, 'live ' + Game.ladderStage());
  T.ok('peak stage remembers National', Game.ladderPeakStage() === 3, 'peak ' + Game.ladderPeakStage());
  seat = Game.tableSeat();
  T.ok('PEAK decision: full seat stays priced after the village thins', seat.seat === 'full', seat.seat);

  T.done();
}

main().catch(e => { console.error(e); process.exitCode = 1; });
