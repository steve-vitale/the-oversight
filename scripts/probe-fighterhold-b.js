// probe-fighterhold-b.js — DIAGNOSTIC ONLY (Stage 0 mechanism probe, NOT
// judged data): for each scholar (player) death on a seed, record the fight
// that killed them — monster id/wave, pack, scholar HP at fight start,
// allies in the fight, location, and whether the same monster killed
// multiple scholars. Pure-read instrumentation: wraps Game.tele BEFORE
// runDays (the harness chains through it), counts tbBarrierExit calls,
// never calls a Game method inside a snapshot (holdbuild recorder lesson).
// Usage: node scripts/probe-fighterhold-b.js <seed> [days]
// Output: evidence/2026-11-14/fighterhold-b-probe-<seed>.json
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { answercourtPolicy, resetAnswercourtStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-answercourt-b'));
const { resetScaleclimbStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-scaleclimb-b'));

const seed = parseInt(process.argv[2] || '100201', 10);
const DAYS = parseInt(process.argv[3] || '150', 10);

(async function () {
  resetAnswercourtStats(); resetScaleclimbStats();
  const { Game } = await loadGame({ seed: seed, mode: 'fighterhold-probe', fullTelemetry: false });
  const fights = [];   // combat_start rows
  const deaths = [];   // death rows (all kinds)
  let lastFight = null;
  let barrierExits = 0;
  let barrierExitResults = {};

  const origTele = Game.tele;
  Game.tele = function (type, data) {
    let r;
    try { r = origTele.apply(this, arguments); } catch (e) { throw e; }
    try {
      const st = (this.state || {});
      const s = st.scholar || {};
      const day = s.day || 0;
      if (type === 'combat_start') {
        // tbfight is assigned before this tele fires (game.js:35586 -> 35609).
        let fighters = null;
        try {
          const f = this.tbfight;
          if (f && Array.isArray(f.fighters)) {
            fighters = f.fighters.map(function (x) {
              if (!x) return null;
              return { key: x.key || null, kind: x.kind || null,
                name: x.name || x.monsterId || null,
                monsterId: (x.mdef && x.mdef.id) || x.monsterId || null,
                hp: (x.hp !== undefined ? Math.round(x.hp) : null),
                villagerId: x.villagerId || null, alive: x.alive !== false };
            });
          }
        } catch (e) { fighters = 'read-err'; }
        const row = { day: day, scholar: this.villagerId || null,
          scholarHp: (s.health !== undefined ? Math.round(s.health) : null),
          mx: s.mx, my: s.my, insideHaven: !!s.insideHaven,
          vs: data && data.vs, wave: data && data.wave, pack: data && data.pack,
          php: data && data.php, maxhp: data && data.maxhp,
          fighters: fighters };
        fights.push(row);
        lastFight = row;
      } else if (type === 'death') {
        deaths.push({ day: day, kind: data && data.kind, who: data && data.who,
          cause: data && data.cause, player: !!(data && data.player),
          scholarAtDeath: this.villagerId || null,
          lastFight: lastFight ? { day: lastFight.day, vs: lastFight.vs, wave: lastFight.wave,
            pack: lastFight.pack, php: lastFight.php,
            nFighters: Array.isArray(lastFight.fighters) ? lastFight.fighters.length : null,
            nAllies: Array.isArray(lastFight.fighters) ? lastFight.fighters.filter(function (x) { return x && (x.kind === 'villager' || x.kind === 'ally'); }).length : null,
            monsterKeys: Array.isArray(lastFight.fighters) ? lastFight.fighters.filter(function (x) { return x && x.kind === 'monster'; }).map(function (x) { return x.monsterId || x.name; }) : null } : null });
      }
    } catch (e) {}
    return r;
  };
  // Count barrier-exit attempts (flee) — counter only, behavior unchanged.
  try {
    const origBE = Game.tbBarrierExit;
    if (typeof origBE === 'function') {
      Game.tbBarrierExit = function () {
        barrierExits += 1;
        const ret = origBE.apply(this, arguments);
        const k = String(ret);
        barrierExitResults[k] = (barrierExitResults[k] || 0) + 1;
        return ret;
      };
    }
  } catch (e) {}

  const ctx = {};
  await setupGame(Game);
  const result = await runDays(Game, answercourtPolicy, { days: DAYS, manifest: undefined, sampleEvery: 1 });
  const out = { seed: seed, days: DAYS, endReason: result.endReason,
    endDay: (Game.state.scholar || {}).day || 0,
    fights: fights, deaths: deaths,
    barrierExits: barrierExits, barrierExitResults: barrierExitResults,
    ctxCounters: ctx };
  const outPath = path.join(REPO, 'evidence', '2026-11-14', 'fighterhold-b-probe-' + seed + '.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  // ---- summary ----
  const scholarDeaths = deaths.filter(function (d) { return d.player; });
  const scholarFights = fights.filter(function (f) { return true; }); // all combat_starts involve the scholar (php set)
  const fatalFights = scholarDeaths.map(function (d) { return d.lastFight; }).filter(Boolean);
  const soloFatal = fatalFights.filter(function (f) { return (f.nAllies || 0) === 0; }).length;
  const waves = {};
  fatalFights.forEach(function (f) { waves[f.wave] = (waves[f.wave] || 0) + 1; });
  const php = fatalFights.map(function (f) { return f.php; }).filter(function (x) { return x !== null && x !== undefined; });
  php.sort(function (a, b) { return a - b; });
  const med = php.length ? php[Math.floor(php.length / 2)] : null;
  console.log(JSON.stringify({ seed: seed, endReason: result.endReason, endDay: out.endDay,
    fights: fights.length, deaths: deaths.length, scholarDeaths: scholarDeaths.length,
    fatalFights: fatalFights.length, soloFatal: soloFatal,
    fatalWaves: waves, fatalPhpMedian: med, fatalPhpMin: php[0], fatalPhpMax: php[php.length - 1],
    barrierExits: barrierExits, barrierExitResults: barrierExitResults,
    outPath: outPath }, null, 2));
  // Per-scholar-death table.
  console.log('scholar deaths (day, cause, fight vs/wave/pack, php, allies, monsterKeys):');
  for (const d of scholarDeaths) {
    const f = d.lastFight;
    console.log(' d' + d.day, d.cause, '| fight d' + (f ? f.day : '?'), (f ? f.vs : '?'),
      'w' + (f ? f.wave : '?'), 'pack' + (f ? f.pack : '?'), 'php' + (f ? f.php : '?'),
      'allies' + (f ? f.nAllies : '?'), JSON.stringify(f ? f.monsterKeys : null));
  }
  process.exit(0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
