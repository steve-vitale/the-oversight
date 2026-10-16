'use strict';
// sweep-havenneedgossip-20261016.js — paired before/after sweep for the
// havenNeedGossip "A"-listener fix.
//
// PRE-REGISTERED (binds per MEASUREMENT.md §14):
//   PRIMARY metric: occurrences of the truncated single-letter listener
//     pattern ("🗣️ <speaker> to A, by the fire") in gossip beats.
//     GO: armed 0 vs control ≥1 on identical seeds.
//   Horizon: 60d, death-aware (the bug fires d4–d7; cheap and honest).
//   Substrate: pre-seat — SEATDRIVE=0 EXPLICIT (c004b9dd flipped the seat
//     default ON; pre-seat runs must opt out explicitly or they silently
//     run the win-side stack). Policies: leadfeast/belongfeast
//     (scripts/policies/feastscale.js), FEASTSCALE_R13=1.
//   Seeds: 8 FRESH (verified 0 per-seed JSON hits across evidence/ before
//     the run): 238,248,258,268,278,298,308,318.
//   Guardrails: det-gate — final Game.state SHA256 byte-identical per
//     (policy, seed) pair across arms (display-only fix must not move the
//     sim); green list stays green; no beats lost (gossip beat count
//     control ≈ fixed; every fixed-arm beat has a control twin).
//
// Run TWICE: once on the fixed tree (arm=fixed), then after
//   git checkout HEAD -- src/js/havenGrowth.js   (control)
// and a third script (compare-havenneedgossip-20261016.js) judges GO/NO-GO.
// Arm is auto-detected from src/js/havenGrowth.js content.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`sweep-havenneedgossip: need ${k}=1`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') {
  console.error('sweep-havenneedgossip: SEATDRIVE must be EXPLICITLY 0 (pre-seat substrate)');
  process.exit(2);
}

const SEEDS = [238, 248, 258, 268, 278, 298, 308, 318];
const POLICIES = { leadfeast, belongfeast };
const DAYS = 60;
const ROOT = path.join(__dirname, '..');

const hgSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'havenGrowth.js'), 'utf8');
const ARM = /const refOf = \(vid\)|this\.firstRef\(speaker\)/.test(hgSrc) ? 'fixed' : 'control';
const OUT_DIR = path.join(ROOT, 'evidence', '2026-10-16', 'perseed-havenneedgossip', ARM);
fs.mkdirSync(OUT_DIR, { recursive: true });

const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
// The exact truncation signatures — the same defect in two slots:
//   listener: "… to A, by the fire"   (the finding's filed pattern)
//   speaker:  "🗣️ A to <name>"          (same line of code, speaker side)
// (Legit first names are never bare "A"; the sweep also records every
// roster first name to prove it.)
const TRUNC_LISTENER_RE = / to A, by the fire/;
const TRUNC_SPEAKER_RE = /🗣️ A to /;
const GOSSIP_RE = /🗣️.*by the fire/;

function stateHash(Game) {
  // Det-gate: byte-identity of the GAME trajectory. state.pacing is
  // wall-clock telemetry (lastTs, per-day real ms) — non-deterministic
  // across processes by design (verified: two identical-code runs differ
  // ONLY under /pacing across 622KB of state). Exclude it; everything else
  // must be identical.
  const s = crypto.createHash('sha256');
  const st = Object.assign({}, Game.state);
  delete st.pacing;
  s.update(JSON.stringify(st));
  return s.digest('hex').slice(0, 16);
}

async function runOne(policyId, seed) {
  const base = POLICIES[policyId];
  const { Game } = await loadGame({ seed, mode: `havenneedgossip-${ARM}-${policyId}` });
  await setupGame(Game);

  // Prove no legit roster first name is bare "A" (would false-positive TRUNC_RE).
  const roster = (Game.state.village.roster || []).filter((id) => id !== Game.villagerId);
  const firstNames = roster.map((id) => { try { return String(Game.npcName(id)).split(' ')[0]; } catch (e) { return '?'; } });
  const bareA = firstNames.filter((n) => n === 'A');

  const beats = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try { const t = String(msg); if (GOSSIP_RE.test(t)) beats.push({ d: day(Game), t }); } catch (e) {}
    return origSay(msg);
  };

  const policy = Object.assign({}, base);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS }); });
  Game.say = origSay;

  const gossipBeats = beats.filter((b) => b.t.includes('🗣️'));
  const truncL = gossipBeats.filter((b) => TRUNC_LISTENER_RE.test(b.t));
  const truncS = gossipBeats.filter((b) => TRUNC_SPEAKER_RE.test(b.t));
  const out = {
    policy: policyId, seed, arm: ARM,
    days: (result && result.days) || DAYS,
    endReason: (result && result.endReason) || 'ok',
    gossipBeats: gossipBeats.length,
    truncatedListener: truncL.length,
    truncatedSpeaker: truncS.length,
    truncated: truncL.length + truncS.length,
    allBeats: gossipBeats.map((b) => `d${b.d}: ${b.t}`),
    bareAFirstNames: bareA.length,
    stateHash: stateHash(Game),
  };
  fs.writeFileSync(path.join(OUT_DIR, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  console.log(`${ARM} ${policyId} s${seed}: beats=${out.gossipBeats} truncL=${out.truncatedListener} truncS=${out.truncatedSpeaker} hash=${out.stateHash} (${out.days}d, ${out.endReason})`);
  return out;
}

async function main() {
  console.log(`sweep-havenneedgossip: arm=${ARM} seeds=${SEEDS.join(',')} policies=leadfeast,belongfeast days=${DAYS} SEATDRIVE=0 FEASTSCALE_R13=1`);
  for (const policyId of Object.keys(POLICIES)) {
    for (const seed of SEEDS) await runOne(policyId, seed);
  }
  console.log(`sweep-havenneedgossip: done -> ${OUT_DIR}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error('SWEEP FAIL:', e); process.exit(1); });
