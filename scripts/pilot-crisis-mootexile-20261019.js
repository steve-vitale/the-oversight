#!/usr/bin/env node
// pilot-crisis-mootexile-20261019.js — CRISIS LEG r29 (lane B): THE MOOT-CONVICTION EXILE ROUTE.
//
// Pre-registration:
//   QUESTION (r28's named next): the moot-conviction exile route is unproven
//   (0/51 cases produced an 'exile' verdict). A murder conviction norms to
//   exile at avgBelief < -5 (betrayal.js sentenceCase) — but does the belief
//   ever bite? The murder-spree policy commits witnessed murders at Haven
//   through the real machinery (playerAttacks → betrayal combat →
//   villageEvent murder → recordCrime → justice ladder → moot).
//   Seeds: 7, 42, 99, 424242 (continuity with r25/r28). Policy: murder-spree.
//   Horizon: 120d death-aware (+10d tail); +10d tail after schism fires.
// Interesting finding: >=1/4 seeds reach a moot 'exile' verdict (route
//   proven), or 0/4 (blank: unfireable route) + diagnose why (no accusation?
//   belief never drops? ladder intervenes? village kills the player first?).
// Metrics: exileVerdicts (bound: any >0 = proven); murderCases opened;
//   avgBelief at sentence; moot firings; exilePlayer calls; schism fires;
//   player death cause.
// Usage: SEED=7 DAYS=120 node pilot-crisis-mootexile-20261019.js > rec.json 2> log
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const { murderSpree } = require(path.join(ROOT, 'scripts', 'policies', 'murder-spree'));

const SEED = parseInt(process.env.SEED || '7', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const CHUNK = 10;
const E = (s) => console.error(s);

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function aliveCount(Game) {
  try {
    return (Game.state.village.roster || []).filter(id => {
      const c = (Game.state.village.rosterChars || {})[id]; return c && c.alive !== false;
    }).length;
  } catch (e) { return -1; }
}
function nm(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return String(rc.name).split(' ')[0]; } catch (e) {}
  try { return String(Game.displayName(vid)).split(' ')[0]; } catch (e) {}
  return String(vid).slice(0, 10);
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-mootexile' });
  await setupGame(Game);
  const policy = murderSpree;
  const me = Game.villagerId;

  // --- instruments ---
  const schismFires = [];
  const exileVerdicts = [];   // resolveCase path==='exile'
  const murderCases = [];     // cases with charge murder
  const beliefAtSentence = [];// sentenceCase avgBelief samples
  const playerExiles = [];
  const mootCases = [];       // openPlayerCase calls
  const mootLines = [];       // say() lines mentioning moot/exile/trial near events
  const heatSeries = [];
  const ladderSeries = [];    // justice stage per chunk
  const seenCases = new Set();

  const _fc = Game.fireCrisis ? Game.fireCrisis.bind(Game) : null;
  if (_fc) {
    Game.fireCrisis = function (kind, ctx) {
      const r = _fc(kind, ctx);
      if (r && kind === 'schism') {
        schismFires.push({ day: dayOf(Game), name: (ctx && ctx.name) || '?', alive: aliveCount(Game) });
        E(`[SCHISM] day ${dayOf(Game)}: name=${(ctx && ctx.name) || '?'} alive=${aliveCount(Game)}`);
      }
      return r;
    };
  }
  const _rc = Game.resolveCase ? Game.resolveCase.bind(Game) : null;
  if (_rc) {
    Game.resolveCase = function (caseId, path) {
      let c = null;
      try { c = Game.getCase ? Game.getCase(caseId) : null; } catch (e) {}
      if (path === 'exile') {
        const rawAcc = (c && c.accused) || [];
        let playerAcc = false;
        try { playerAcc = rawAcc.some(a => Game.isPlayer(a)); } catch (e) { playerAcc = rawAcc.includes(me); }
        exileVerdicts.push({
          day: dayOf(Game), charge: c && c.charge,
          accused: rawAcc.map(a => nm(Game, a)),
          accusedRaw: rawAcc.map(a => String(a)),
          playerAccused: playerAcc,
        });
        E(`[EXILE-VERDICT] day ${dayOf(Game)} charge=${c && c.charge} accused=${rawAcc.map(a => nm(Game, a)).join(',')} player=${playerAcc}`);
      }
      return _rc(caseId, path);
    };
  }
  const _sc = Game.sentenceCase ? Game.sentenceCase.bind(Game) : null;
  if (_sc) {
    Game.sentenceCase = function (c) {
      try {
        const avg = Game.avgBelief ? Game.avgBelief(c) : null;
        beliefAtSentence.push({ day: dayOf(Game), charge: c && c.charge, avg,
          accused: ((c && c.accused) || []).map(a => nm(Game, a)) });
        E(`[SENTENCE] day ${dayOf(Game)} charge=${c && c.charge} avgBelief=${avg}`);
      } catch (e) {}
      return _sc(c);
    };
  }
  const _opc = Game.openPlayerCase ? Game.openPlayerCase.bind(Game) : null;
  if (_opc) {
    Game.openPlayerCase = function (accuser, charge, crimes, fab) {
      mootCases.push({ day: dayOf(Game), charge, accuser: nm(Game, accuser) });
      E(`[MOOT-CASE] day ${dayOf(Game)}: ${charge} accused by ${nm(Game, accuser)}`);
      return _opc(accuser, charge, crimes, fab);
    };
  }
  const _ep = Game.exilePlayer ? Game.exilePlayer.bind(Game) : null;
  if (_ep) {
    Game.exilePlayer = function (how) {
      playerExiles.push({ day: dayOf(Game), how });
      E(`[PLAYER-EXILE] day ${dayOf(Game)} how=${how}`);
      return _ep(how);
    };
  }
  const _say = Game.say ? Game.say.bind(Game) : null;
  if (_say) {
    Game.say = function (txt) {
      const t = String(txt || '');
      if (/moot|exil|cast out|walk out|schism|trial|murder|take what you can carry/i.test(t))
        mootLines.push({ day: dayOf(Game), line: t.slice(0, 320) });
      return _say(txt);
    };
  }

  E(`[SETUP] seed ${SEED}: murder-spree running to day ${DAYS}...`);
  let day = 0, tailLeft = 10, deadAt = null, endReason = '?', schismTail = null;
  while (day < DAYS) {
    const r = await runDays(Game, policy, { days: CHUNK });
    day += (r.days || 0);
    try {
      const h = typeof Game.justiceHeat === 'function' ? Game.justiceHeat() : null;
      heatSeries.push({ day: dayOf(Game), heat: h });
      const j = Game.justiceState ? Game.justiceState() : null;
      ladderSeries.push({ day: dayOf(Game), stage: j && j.stage, mootDemanded: !!(j && j.mootDemanded) });
    } catch (e) {}
    try {
      const cases = ((Game.betrayalState && Game.betrayalState()) || {}).cases || [];
      for (const c of cases) {
        if (c && c.id != null && !seenCases.has(c.id)) {
          seenCases.add(c.id);
          if (c.charge === 'murder') {
            murderCases.push({ day: dayOf(Game), id: c.id,
              accused: (c.accused || []).map(a => nm(Game, a)),
              status: c.status, resolution: c.resolution });
            E(`[MURDER-CASE] day ${dayOf(Game)}: vs ${(c.accused || []).map(a => nm(Game, a)).join(',')} -> ${c.resolution || c.status}`);
          }
        }
      }
    } catch (e) {}
    E(`[CHUNK] gameday ${dayOf(Game)} chunkday ${day} alive=${aliveCount(Game)} over=${!!Game.over} murders=${(r.ctx && r.ctx.murders) || '?'}`);
    if (schismFires.length && schismTail == null) { schismTail = 10; E(`[SCHISM-TAIL] starting 10d aftermath tail`); }
    if (schismTail != null) {
      schismTail -= CHUNK;
      if (schismTail <= 0) { endReason = 'schism-tail-done'; break; }
    }
    if (Game.villageLost || Game.over) {
      deadAt = dayOf(Game);
      E(`[DEAD] village lost / game over at day ${deadAt}; tail ${tailLeft}d`);
      endReason = Game.villageLost ? 'village-lost' : 'over-other';
      const tail = await runDays(Game, policy, { days: Math.min(tailLeft, CHUNK) });
      day += (tail.days || 0);
      break;
    }
    if (r.endReason !== 'survived') { endReason = r.endReason; break; }
    endReason = 'survived';
  }
  if (endReason === 'survived' && day >= DAYS) endReason = 'survived';

  let pgCrises = {};
  try { pgCrises = (Game.progState() || {}).crises || {}; } catch (e) {}

  const rec = {
    tool: 'pilot-crisis-mootexile-20261019', seed: SEED, daysSimmed: day, endReason,
    schismFires, schismFireCount: schismFires.length,
    exileVerdicts, murderCases, beliefAtSentence, playerExiles, mootCases,
    heatSeries, ladderSeries,
    mootLines: mootLines.slice(0, 60),
    pgCrises: Object.keys(pgCrises),
    census: { alive: aliveCount(Game), roster: (Game.state.village.roster || []).length },
  };
  E(`--- seed ${SEED} summary: schism=${schismFires.length} exileVerdicts=${exileVerdicts.length} murderCases=${murderCases.length} moots=${mootCases.length} ---`);
  console.log(JSON.stringify(rec));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
