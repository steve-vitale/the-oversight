// voiceless-driver-20261112.js — sim-voiceless-a band driver.
//
// Runs the pairarming band (seeds 190391-190398, 150d, competent) and
// records, per seed: the daily wave-5 shortfall condition (deferred +
// veterans >= 2 + armed < 6), every captured voice line matching the
// shortfall/churn markers, and end-state wall numbers. Two legs on
// identical seeds: CONTROL (pre-build, voice absent) and VOICE
// (post-build). The driver never writes game code; it only observes.
// Refuses to overwrite an existing corpus file (same rule as the
// pairarming driver).
//
// Usage:
//   node scripts/voiceless-driver-20261112.js --leg control [--seeds 190391,190392]
//   node scripts/voiceless-driver-20261112.js --leg voice
const path = require('path');
const fs = require('fs');
const REPO = path.resolve(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts/sim-harness.js'));
const competent = require(path.join(REPO, 'scripts/policies/competent.js'));

const args = process.argv.slice(2);
const leg = (args[args.indexOf('--leg') + 1] || 'control');
if (leg !== 'control' && leg !== 'voice') { console.error('VOICELESS STOP: --leg must be control or voice'); process.exit(2); }
const seedsIdx = args.indexOf('--seeds');
const SEEDS = seedsIdx >= 0 ? args[seedsIdx + 1].split(',').map(s => parseInt(s, 10)) : [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const DAYS = 150;
const RUN = 'voiceless-band';
const outDir = path.join(REPO, 'evidence', '2026-11-12', 'perseed-voiceless-a');
fs.mkdirSync(outDir, { recursive: true });

// Shortfall voice marker: the built line says "the fifth draft waits
// until N of us do". Churn line says "dead in the wild while the fifth
// draft waits". The System hold beat ("fifth draft stays in the wings")
// is captured by the wider pattern too, so a hold-beat firing is visible
// rather than mistaken for the villager voice.
const VOICE_RE = /fifth draft waits|dead in the wild|fifth draft stays in the wings|next act is (not for strangers|still waiting)/i;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 60; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 59) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent', fullTelemetry: false });
  const voiceLines = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (VOICE_RE.test(arg) && voiceLines.length < 400) voiceLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  await setupGame(Game);
  const condDaily = [];
  let lastCondDay = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastCondDay) {
            lastCondDay = d;
            let def5 = null, rd5 = null, roster = 0;
            try { def5 = Game.standingDeferral(5); } catch (e) {}
            try { rd5 = Game.waveCombatReadiness(5); } catch (e) {}
            try { roster = ((Game.state && Game.state.village && Game.state.village.roster) || []).length; } catch (e) {}
            condDaily.push({
              day: d,
              deferred: !!(def5 && def5.deferred),
              veterans: (rd5 && rd5.veterans) | 0,
              armed: (rd5 && rd5.armed) | 0,
              armedDemand: (rd5 && rd5.demand && rd5.demand.armed) | 0,
              roster: roster,
            });
          }
        } catch (e) { errors.push('cond-snap: ' + String(e.message).slice(0, 80)); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null, scholarDeaths = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  try { scholarDeaths = ((st.village || {}).scholarDeaths || []).slice(); } catch (e) { scholarDeaths = null; }
  const deaths = ((result && result.samples && result.samples.deaths) || []).length;
  const out = {
    seed: seed, arm: 'voiceless', run: RUN, leg: leg, days: result.days,
    gameDays: (st.scholar && st.scholar.day) || 0, endReason: result.endReason,
    won: !!Game.won, over: !!Game.over, villageLost: !!Game.villageLost,
    scaleRank: scaleRank, maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked,
    standing: standing, deaths: deaths, sayCount: sayCount,
    voiceLines: voiceLines, condDaily: condDaily, scholarDeaths: scholarDeaths,
    errors: errors,
  };
  const file = path.join(outDir, 'voiceless-s' + seed + '-' + leg + '.json');
  if (fs.existsSync(file)) { console.error('VOICELESS STOP: refusing to overwrite ' + file); process.exit(2); }
  writeRobust(file, JSON.stringify(out, null, 2));
  console.log('seed ' + seed + ' leg ' + leg + ': days=' + result.days + ' end=' + result.endReason +
    ' scale=' + scaleRank + ' maxWave=' + (result.maxWaveUnlocked || 1) + ' unlocked=' + unlocked +
    ' deaths=' + deaths + ' voiceLines=' + voiceLines.length + ' errors=' + errors.length);
}

async function main() {
  for (const seed of SEEDS) await oneRun(seed);
  console.log('VOICELESS BAND DONE leg=' + leg + ' seeds=' + SEEDS.join(','));
}
main().catch(e => { console.error('VOICELESS FAIL', e); process.exit(1); });
