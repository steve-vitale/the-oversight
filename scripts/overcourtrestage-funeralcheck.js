// overcourtrestage-funeralcheck.js — dissolution-channel attribution for the
// overcourt confirm's armed-leg collapses (sim-overcourt-restage, axis
// scale-onramp, run fleshout-20261023T2015Z).
//
// The confirm's secondary metric went the wrong way (armed 6 vs control 3
// post-formation -102s, plus three -136 same-day multi-link collapses the
// -102 classifier missed). Kill discipline (Steve 2026-10-21) demands the
// root cause before any kill: is the lever wrong, or is this noise?
//
// This instrument re-runs the 5 dissolved armed-leadfeast configs
// (s68901 d139, s68902 d80, s68904 d111, s68906 d138, s68909 d77) under the
// IDENTICAL armed policy + env (deterministic — asserts the sweep's dip
// steps reproduce) and snapshots per-day per-link {trust, status, history
// tail} using the diag-linkdissolve snapshot pattern (read-only reuse of
// the committed instrument's approach, zero src/js). Each dissolution day
// is then attributed: a funeral/succession note within [D-3, D] coupled to
// a same-day multi-link trust drop = the DIAG's succession channel
// (correlated shock — the lever's theory assumed INDEPENDENT single-link
// failures); otherwise the trust trajectories name the channel.
//
// Namespace overcourtrestage-*. Per-seed JSONs written ONCE to
// evidence/2026-10-23/perseed-overcourtrestage-funeralcheck/ with
// hash-after-write readback. NEVER /tmp.
//
// Usage (pinned substrate):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 LINKFORM=2 node scripts/overcourtrestage-funeralcheck.js
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const LF = require(path.join(REPO, 'scripts', 'policies', 'linkform'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));

function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE']) {
    if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 is required.`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 is required.'); process.exit(2); }
  if (process.env.LINKFORM !== '2') { console.error('STOP: LINKFORM=2 is required (armed leg only).'); process.exit(2); }
  if (!WS.instrumentOn()) { console.error('STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }
}
checkEnv();

const SEEDS = [68901, 68902, 68904, 68906, 68909];
const DAYS = 180;
const EVID = path.join(REPO, 'evidence', '2026-10-23', 'perseed-overcourtrestage-funeralcheck');
fs.mkdirSync(EVID, { recursive: true });
// expected dissolution days from the sweep (assert reproduction)
const EXPECT = { 68901: [139], 68902: [80], 68904: [111], 68906: [138], 68909: [77] };

function gday(Game) { try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; } }

function snapshotLinks(Game, state) {
  const rows = [];
  let links = [];
  try { links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : []; } catch (e) {}
  for (const l of links) {
    try {
      const id = l.id || l.linkId || null;
      let role = 'other', other = null;
      if (l.primary === 'haven') { role = 'primary'; other = l.subordinate; }
      else if (l.subordinate === 'haven') { role = 'subordinate'; other = l.primary; }
      else if (l.a === 'haven' || l.b === 'haven') { role = 'peer'; other = (l.a === 'haven' ? l.b : l.a); }
      else continue;
      const hist = l.history || [];
      const hn = hist.length;
      const key = String(id) + '|' + String(other);
      const grew = hn !== (state.prevHistN[key] | 0);
      state.prevHistN[key] = hn;
      const row = { id, other: String(other), role, trust: (l.trust | 0), status: l.status || 'active', histN: hn };
      if (grew) row.histTail = hist.slice(-8).map(h => ({ d: (h.day | 0), k: String(h.kind || ''), n: String(h.note || '').slice(0, 200) }));
      rows.push(row);
    } catch (e) {}
  }
  let dip = null;
  try { const st = Game.villageStanding ? Game.villageStanding() : null; if (st) dip = st.diplomacy | 0; } catch (e) {}
  return { links: rows, dip };
}

function writeVerified(p, text) {
  fs.writeFileSync(p, text);
  const back = fs.readFileSync(p, 'utf8');
  if (back !== text) { console.error(`WRITE-VERIFY FAIL: ${p}`); process.exit(3); }
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16);
}

async function oneRun(seed) {
  const policy = LF.linkformArmedFor();
  const { Game } = await loadGame({ seed, mode: 'overcourtrestage-funeralcheck', fullTelemetry: false });
  const t = { instrumentErrors: [], window: [] };
  const uninstall = WS.install(Game, t);
  await setupGame(Game);
  const snap = { prevHistN: {} };
  const days = {};
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      let r;
      try { r = policy.daily(Gm, ctx); } finally {
        try { days[gday(Gm)] = snapshotLinks(Gm, snap); } catch (e) {}
      }
      return r;
    },
  });
  await quietLog(async () => { await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  // dissolution days: single-day dip drops >= 102
  const dayList = Object.keys(days).map(Number).sort((a, b) => a - b);
  const dissDays = [];
  for (let i = 1; i < dayList.length; i++) {
    const x = (days[dayList[i]].dip | 0) - (days[dayList[i - 1]].dip | 0);
    if (x <= -102) dissDays.push({ day: dayList[i], step: x });
  }
  const exp = EXPECT[seed] || [];
  const reproduced = exp.every(d => dissDays.some(x => x.day === d));
  const out = { seed, policyId: 'linkform-overcourt-armorvillage', env: 'LINKFORM=2 + pinned substrate', dissDays, reproduced, days };
  const sha = writeVerified(path.join(EVID, `s${seed}.json`), JSON.stringify(out) + '\n');
  console.log(`s${seed}: dissDays=${JSON.stringify(dissDays)} reproduced=${reproduced} sha=${sha}`);
  return out;
}

// attribution: for each dissolution day, gather funeral/succession notes in
// [D-3, D] and per-link trust deltas [D-3, D].
function attribute(seed, corpus) {
  const r = corpus[seed];
  const out = [];
  for (const { day: D, step } of r.dissDays) {
    const notes = [];
    const drops = [];
    for (let d = D - 3; d <= D; d++) {
      const s = r.days[d];
      if (!s) continue;
      for (const l of s.links) {
        for (const h of (l.histTail || [])) {
          if (h.d >= D - 3 && h.d <= D && /succession|funeral|grief|chaos|haircut|pressed tribute/i.test(h.k + ' ' + h.n)) {
            notes.push({ link: l.other, d: h.d, k: h.k, n: h.n });
          }
        }
      }
    }
    for (let d = D - 2; d <= D; d++) {
      const a = r.days[d - 1], b = r.days[d];
      if (!a || !b) continue;
      for (const lb of b.links) {
        const la = a.links.find(x => String(x.other) === String(lb.other));
        if (la) drops.push({ link: lb.other, d, from: la.trust, to: lb.trust });
      }
    }
    const bigDrops = drops.filter(x => x.from - x.to >= 6 && x.d === D);
    const channel = notes.length && bigDrops.length >= 2 ? 'succession (correlated multi-link shock)'
      : notes.length && bigDrops.length === 1 ? 'succession (single-link funeral snap)'
      : bigDrops.length >= 2 ? 'multi-link same-day drop, no funeral note in tails (unattributed-shock)'
      : 'erosion/other';
    out.push({ day: D, step, channel, nNotes: notes.length, notes: notes.slice(0, 6), bigDrops });
  }
  return out;
}

if (require.main === module) {
  (async () => {
    const corpus = {};
    for (const seed of SEEDS) corpus[seed] = await oneRun(seed);
    console.log('\n## attribution');
    const summary = {};
    for (const seed of SEEDS) {
      const at = attribute(seed, corpus);
      summary[seed] = at;
      for (const e of at) {
        console.log(`s${seed} d${e.day} (step ${e.step}): ${e.channel}`);
        for (const n of e.notes) console.log(`    note d${n.d} [${n.k}] ${n.n.slice(0, 120)}`);
        for (const x of e.bigDrops) console.log(`    drop ${x.link}: ${x.from} -> ${x.to} on d${x.d}`);
      }
    }
    writeVerified(path.join(EVID, 'attribution.json'), JSON.stringify(summary, null, 1) + '\n');
    console.log('wrote attribution.json');
  })().catch(e => { console.error(e && e.stack || e); process.exit(1); });
}

module.exports = { snapshotLinks, attribute };
