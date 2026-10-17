#!/usr/bin/env node
// understudy-probe-20261017.js — CONTACT PROBE for the sim-understudy arm.
//
// QUESTION (finding #432a/#433): how do scholar-vs-understudy TB contacts
// arise on the pre-seat tribfloor substrate? The trickreach arm (killed at
// confirm) found ZERO understudy scholar-TB contacts on seeds 3601-3608,
// while the trickfunnel census found 16 on seeds 1801-1808. This probe
// instruments every TB fight initiation and reports the context of each
// understudy contact: initiation path, day part, tile, tent state.
//
// Read-only instrument: wraps Game.tbfight via Object.defineProperty (the
// finding-#434 hook — covers all 5 initiation paths uniformly). Captures a
// stack trace at assignment for path classification. No game-code changes.
//
// Substrate: FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 (pre-seat courtship).
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 SEEDS=1801,1802 DAYS=180 \
//   POLICIES=leadfeast,belongfeast node scripts/understudy-probe-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { leadfeast, belongfeast } = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

if (process.env.FEASTSCALE_R13 !== '1') { console.error('PROBE STOP: FEASTSCALE_R13=1 required.'); process.exit(2); }
if (process.env.TRIBFLOOR !== '1') { console.error('PROBE STOP: TRIBFLOOR=1 required.'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('PROBE STOP: SEATDRIVE=0 required.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [1801]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const OUTDIR = path.join(REPO, 'evidence', '2026-10-17', process.env.PROBE_OUTDIR || 'understudy-probe');
try { fs.mkdirSync(OUTDIR, { recursive: true }); } catch (e) {}

function classifyPath(stack, fight) {
  if (!stack) return 'unknown';
  // TRUE betrayal: the fight object carries betrayal:true (party.js:668).
  // The party.js startCombat WRAPPER (party.js:1145) adds party members to
  // real monster fights — its stack frame must not misclassify those.
  if (fight && fight.betrayal) return 'party-betrayal';
  if (/justice\.js/.test(stack)) return 'justice-uprising';
  if (/encounters\.js/.test(stack)) return 'encounters-alien-duel';
  if (/startCombat/.test(stack)) return 'startCombat';
  if (/loadGame|loadSave|rebuild/.test(stack)) return 'saveload';
  if (/reengageWaitingMonsters/.test(stack)) return 'reengage-waiting';
  // fallback: first non-harness frame
  const lines = stack.split('\n').slice(1, 8).join(' | ');
  return 'other:' + lines.slice(0, 200);
}

function attachContactProbe(Game) {
  const fights = [];
  const origDesc = Object.getOwnPropertyDescriptor(Game, 'tbfight');
  let tbVal = Game.tbfight;
  try {
    Object.defineProperty(Game, 'tbfight', {
      configurable: true,
      enumerable: origDesc ? !!origDesc.enumerable : true,
      get: function () { return tbVal; },
      set: function (v) {
        const stack = new Error('probe').stack;
        tbVal = v;
        try {
          if (v && typeof v === 'object' && Array.isArray(v.fighters)) {
            const mids = [];
            for (const x of v.fighters) {
              if (x && x.kind === 'monster') {
                try { mids.push((x.mdef || {}).id || x.monsterId || '?'); } catch (e) { mids.push('?'); }
              }
            }
            const s = Game.state.scholar || {};
            let tileType = '?';
            try { const t = Game.tileAt(Game.map.px, Game.map.py); tileType = (t && t.type) || '?'; } catch (e) {}
            fights.push({
              day: s.day || 0, dayPart: Game.dayPart,
              isNight: !!(Game.isNight && Game.isNight()),
              px: Game.map.px, py: Game.map.py, tile: tileType,
              insideTent: !!(s.insideTent),
              mids: mids,
              path: classifyPath(stack, v),
              stackTop: (stack || '').split('\n').slice(1, 5).join(' <- ').slice(0, 300),
            });
          }
        } catch (e) {}
      },
    });
  } catch (e) { console.error('PROBE: tbfight interception failed: ' + e.message); }
  return {
    fights,
    restore() {
      try {
        if (origDesc) Object.defineProperty(Game, 'tbfight', origDesc);
        else { delete Game.tbfight; Game.tbfight = tbVal; }
      } catch (e) {}
    },
  };
}

async function oneRun(seed, policyId) {
  const policy = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'understudy-probe', fullTelemetry: false });
  await setupGame(Game);
  const cap = attachContactProbe(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 60 }); });
  cap.restore();
  const understudyFights = cap.fights.filter(f => f.mids.includes('understudy'));
  const out = {
    seed, policy: policyId, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    nFights: cap.fights.length,
    nUnderstudy: understudyFights.length,
    understudyFights: understudyFights,
    // context distribution for ALL fights (denominator honesty)
    pathsAll: {},
    dayPartsAll: {},
  };
  for (const f of cap.fights) {
    out.pathsAll[f.path] = (out.pathsAll[f.path] || 0) + 1;
    out.dayPartsAll[String(f.dayPart)] = (out.dayPartsAll[String(f.dayPart)] || 0) + 1;
  }
  const fp = path.join(OUTDIR, `${policyId}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  console.log(`  [${policyId} s${seed}] fights=${out.nFights} understudy=${out.nUnderstudy} end=${out.endReason}`);
  return out;
}

(async () => {
  const all = [];
  for (const pid of POLICIES) for (const seed of SEEDS) {
    try { all.push(await oneRun(seed, pid)); }
    catch (e) { console.error(`  !! [${pid} s${seed}] FAILED: ${e.message}`); }
  }
  // Summary
  const uAll = [];
  for (const r of all) for (const f of (r.understudyFights || [])) uAll.push(Object.assign({ seed: r.seed, policy: r.policy }, f));
  console.log('\n=== UNDERSTUDY CONTACT SUMMARY ===');
  console.log(`runs=${all.length} totalFights=${all.reduce((a, r) => a + r.nFights, 0)} understudyContacts=${uAll.length}`);
  const byPath = {}, byPart = {}, byTile = {}, byTent = {};
  for (const f of uAll) {
    byPath[f.path] = (byPath[f.path] || 0) + 1;
    byPart[String(f.dayPart) + (f.isNight ? 'N' : 'D')] = (byPart[String(f.dayPart) + (f.isNight ? 'N' : 'D')] || 0) + 1;
    byTile[f.tile] = (byTile[f.tile] || 0) + 1;
    byTent[f.insideTent ? 'tent' : 'open'] = (byTent[f.insideTent ? 'tent' : 'open'] || 0) + 1;
  }
  console.log('byPath:', JSON.stringify(byPath));
  console.log('byDayPart:', JSON.stringify(byPart));
  console.log('byTile:', JSON.stringify(byTile));
  console.log('byTent:', JSON.stringify(byTent));
  for (const f of uAll.slice(0, 20)) {
    console.log(`  s${f.seed}/${f.policy} d${f.day} part=${f.dayPart} tile=${f.tile} tent=${f.insideTent} path=${f.path} mids=[${f.mids.join(',')}]`);
  }
  fs.writeFileSync(path.join(OUTDIR, 'summary.json'), JSON.stringify({ runs: all.length, contacts: uAll, byPath, byPart, byTile, byTent }, null, 1));
})().catch(e => { console.error('PROBE FATAL: ' + (e && e.stack || e)); process.exit(1); });
