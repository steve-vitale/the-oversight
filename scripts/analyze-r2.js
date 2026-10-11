#!/usr/bin/env node
// analyze-r2.js — compare knowledge-r2 before/after sweep JSONs.
// Usage: node scripts/analyze-r2.js /tmp/knowledge-r2-before.json /tmp/knowledge-r2-after.json
'use strict';
const fs = require('fs');
const [before, after] = process.argv.slice(2).map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const B = before.runs || before, A = after.runs || after;
console.log(`seeds: before=${B.length} after=${A.length}`);

function sum(rs, f) { return rs.reduce((t, r) => t + (f(r) || 0), 0); }
function mean(rs, f) { return rs.length ? sum(rs, f) / rs.length : 0; }
function med(rs, f) {
  const s = rs.map(f).sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}
const row = (name, bf, af, fmt) => {
  fmt = fmt || (x => Math.round(x * 10) / 10);
  console.log(`${name}: before=${fmt(bf)} after=${fmt(af)}`);
};

console.log('\n--- DEPTH (the lever) ---');
row('sharedKnowledge entries w/ servings>0 (mean/run)', mean(B, r => r.ks.sharedServings), mean(A, r => r.ks.sharedServings));
row('sharedKnowledge max servings (max/run)', Math.max(...B.map(r => r.ks.sharedMaxServings || 0)), Math.max(...A.map(r => r.ks.sharedMaxServings || 0)));
const shL = rs => { const o = {}; for (const r of rs) for (const [k, v] of Object.entries(r.ks.sharedLevels || {})) o[k] = (o[k] || 0) + v; return JSON.stringify(o); };
console.log(`sharedKnowledge level histogram: before=${shL(B)} after=${shL(A)}`);
row('combineKnowledge firings (total)', sum(B, r => r.combines), sum(A, r => r.combines), x => x);
row('player plant L2 (total)', sum(B, r => (r.ks.plantLevels || {})[2]), sum(A, r => (r.ks.plantLevels || {})[2]), x => x);
row('player plant L3 (total)', sum(B, r => (r.ks.plantLevels || {})[3]), sum(A, r => (r.ks.plantLevels || {})[3]), x => x);
row('player plant L4 (total)', sum(B, r => (r.ks.plantLevels || {})[4]), sum(A, r => (r.ks.plantLevels || {})[4]), x => x);
row('player plant L1 (total)', sum(B, r => (r.ks.plantLevels || {})[1]), sum(A, r => (r.ks.plantLevels || {})[1]), x => x);
row('prepKnown (total)', sum(B, r => r.ks.prepKnown), sum(A, r => r.ks.prepKnown), x => x);

console.log('\n--- MISSION ---');
row('median survival days', med(B, r => r.days), med(A, r => r.days), x => x);
row('max survival days', Math.max(...B.map(r => r.days)), Math.max(...A.map(r => r.days)), x => x);
row('player deaths (total)', sum(B, r => r.playerDeaths), sum(A, r => r.playerDeaths), x => x);
row('villager deaths (total)', sum(B, r => r.villagerDeaths), sum(A, r => r.villagerDeaths), x => x);
row('wins', sum(B, r => r.won ? 1 : 0), sum(A, r => r.won ? 1 : 0), x => x);
row('tableWaiting', sum(B, r => r.tableWaiting ? 1 : 0), sum(A, r => r.tableWaiting ? 1 : 0), x => x);
const er = rs => { const o = {}; for (const r of rs) o[r.endReason] = (o[r.endReason] || 0) + 1; return JSON.stringify(o); };
console.log(`endReasons: before=${er(B)} after=${er(A)}`);
const mw = rs => { const o = {}; for (const r of rs) o[r.maxWaveUnlocked] = (o[r.maxWaveUnlocked] || 0) + 1; return JSON.stringify(o); };
console.log(`maxWaveUnlocked: before=${mw(B)} after=${mw(A)}`);
const ma = rs => { const o = {}; for (const r of rs) o[r.maxArc] = (o[r.maxArc] || 0) + 1; return JSON.stringify(o); };
console.log(`maxArc: before=${ma(B)} after=${ma(A)}`);
const ms = rs => { const o = {}; for (const r of rs) o[r.maxScale] = (o[r.maxScale] || 0) + 1; return JSON.stringify(o); };
console.log(`maxScale: before=${ms(B)} after=${ms(A)}`);
row('counters discovered (total)', sum(B, r => r.countersDiscovered), sum(A, r => r.countersDiscovered), x => x);
row('traps crafted (total)', sum(B, r => r.trapsCrafted), sum(A, r => r.trapsCrafted), x => x);
row('traps looted (total)', sum(B, r => r.trapsLooted), sum(A, r => r.trapsLooted), x => x);
row('tier-2 reach (maxTier>=2)', sum(B, r => (r.tier || 0) >= 2 ? 1 : 0), sum(A, r => (r.tier || 0) >= 2 ? 1 : 0), x => x);

console.log('\n--- KNOWLEDGE CHANNELS (sanity: lever should not disturb breadth) ---');
row('tested identifications (total)', sum(B, r => (r.identifyBy || {}).tested), sum(A, r => (r.identifyBy || {}).tested), x => x);
row('teachPlant p->v (total)', sum(B, r => r.teachPlant), sum(A, r => r.teachPlant), x => x);
row('monsters named (total)', sum(B, r => r.ks.monsterNamed), sum(A, r => r.ks.monsterNamed), x => x);
row('monster foodSafe (total)', sum(B, r => r.ks.monsterFoodSafe), sum(A, r => r.ks.monsterFoodSafe), x => x);
row('skills (total)', sum(B, r => r.ks.skills), sum(A, r => r.ks.skills), x => x);
row('vilMeanKnown (mean)', mean(B, r => r.ks.vilMeanKnown), mean(A, r => r.ks.vilMeanKnown));
