#!/usr/bin/env node
// analyze-homeward-substrate-b.js — shadow-vs-armed E validator +
// approach-clean screener (sim-homeward-substrate-b, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-homeward-substrate-b-prereg.md.
// Reads driver .jsonl files (one JSON object per seed, stdout of
// scripts/homext-abl-b-driver.js). NO episode logic is duplicated
// beyond the prereg's own definitions, which are implemented
// literally here from exact driver fields:
//   day.hops[].from/to, .simOk, .vetoed, .homeward,
//   day.dayEndReturnSim.ok, day.end.pos, day.homewardVetoes,
//   day.start.haven.
// Modes:
//   --validate --shadow <file> --armed <file> --seed <n>
//     --day <d> --terminator <fx,fy->tx,ty>
//     Matched prefix = shadow day-d hops from index 0 through the
//     first occurrence of the terminator hop, compared hop by hop
//     (same from->to, in order) against the armed day-d hops from
//     index 0 through the terminator's first occurrence. Prints a
//     per-hop table and a VALIDATE line (agreement count + bar).
//   --screen --shadow <file> --armed <file>
//     Applies the prereg APPROACH-CLEAN definition to every seed:
//     a shadow trip (walk-out W from haven + homeward hop H with
//     simOk=false landing on the day-end tile with a failing
//     dayEndReturnSim) whose identical W appears under the armed
//     leg with all simOk=true, vetoed=false, immediately followed
//     by a homeward hop H' O->T with simOk=false and a vetoed
//     entry that day. Prints every candidate trip + a SCREEN line.
// Exit 0 always (reporter, never a judge); the caller applies the
// prereg bar / band qualifier.
'use strict';
const fs = require('fs');
const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
};
function load(file) {
  return fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}
function hopKey(h) { return h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y; }
function parseHop(s) {
  const m = /^(\d+),(\d+)->(\d+),(\d+)$/.exec(s.trim());
  if (!m) return null;
  return { from: { x: +m[1], y: +m[2] }, to: { x: +m[3], y: +m[4] } };
}
function sameHop(a, b) { return a.from.x === b.from.x && a.from.y === b.from.y && a.to.x === b.to.x && a.to.y === b.to.y; }
function samePos(a, b) { return a && b && a.x === b.x && a.y === b.y; }

if (process.argv.includes('--validate')) {
  const shadow = load(arg('shadow', null));
  const armed = load(arg('armed', null));
  const seed = +arg('seed', '0');
  const day = +arg('day', '0');
  const term = parseHop(arg('terminator', ''));
  if (!term) { console.error('usage: --validate needs --terminator fx,fy->tx,ty'); process.exit(2); }
  const sInst = shadow.find((i) => i.seed === seed);
  const aInst = armed.find((i) => i.seed === seed);
  if (!sInst || !aInst) { console.error('seed not found in one leg'); process.exit(2); }
  const sDay = (sInst.days || []).find((d) => d.loopDay === day);
  const aDay = (aInst.days || []).find((d) => d.loopDay === day);
  if (!sDay || !aDay) { console.error('day not found in one leg'); process.exit(2); }
  const cut = (hops) => {
    const idx = hops.findIndex((h) => sameHop(h, term));
    return idx < 0 ? null : hops.slice(0, idx + 1);
  };
  const sPre = cut(sDay.hops || []);
  const aPre = cut(aDay.hops || []);
  if (!sPre || !aPre) { console.log('VALIDATE seed=' + seed + ' day=' + day + ' TERMINATOR-NOT-FOUND shadow=' + !!sPre + ' armed=' + !!aPre); process.exit(0); }
  let agree = 0, total = 0, shapeOk = sPre.length === aPre.length;
  console.log('VALIDATE seed=' + seed + ' day=' + day + ' hop | shadowSimOk | armedSimOk | agree');
  const n = Math.max(sPre.length, aPre.length);
  for (let i = 0; i < n; i++) {
    const s = sPre[i], a = aPre[i];
    if (!s || !a || !sameHop(s, a)) { shapeOk = false; console.log('  ' + (s ? hopKey(s) : '?') + ' vs ' + (a ? hopKey(a) : '?') + ' SHAPE-MISMATCH'); continue; }
    total++;
    const ok = s.simOk === a.simOk;
    if (ok) agree++;
    console.log('  ' + hopKey(s) + ' | ' + s.simOk + ' | ' + a.simOk + ' | ' + (ok ? 'yes' : 'NO'));
  }
  const armedVetoBeforeEnd = (aDay.hops || []).slice(0, aPre.length - 1).some((h) => h.vetoed);
  console.log('VALIDATE seed=' + seed + ' day=' + day + ' agreement=' + agree + '/' + total +
    ' shapeOk=' + shapeOk + ' armedVetoBeforeEnd=' + armedVetoBeforeEnd +
    ' BAR100=' + (shapeOk && total > 0 && agree === total && !armedVetoBeforeEnd ? 'PASS' : 'FAIL'));
  process.exit(0);
}

if (process.argv.includes('--screen')) {
  const shadow = load(arg('shadow', null));
  const armed = load(arg('armed', null));
  const aBySeed = new Map(armed.map((i) => [i.seed, i]));
  let bandCandidates = 0;
  console.log('SCREEN-CANDIDATE seed | day | walkOut | homewardHop | armedHomeV(day) | shadowEndKcal');
  for (const sInst of shadow) {
    const aInst = aBySeed.get(sInst.seed);
    if (!aInst) continue;
    for (const sDay of (sInst.days || [])) {
      const hops = sDay.hops || [];
      const haven = (sDay.start && sDay.start.haven) || { x: 4, y: 4 };
      const endPos = sDay.end && sDay.end.pos;
      const endSim = sDay.dayEndReturnSim;
      if (!endPos || !endSim || endSim.ok !== false) continue;
      // First H on this seed/day: homeward, E-fails, lands on day-end tile.
      const hIdx = hops.findIndex((h) => h.homeward && h.simOk === false && samePos(h.to, endPos));
      if (hIdx < 0) continue;
      const H = hops[hIdx];
      // Walk W back from H to haven: contiguous, each hop's to == next hop's from.
      const W = [];
      let cur = H.from;
      let ok = true;
      for (let i = hIdx - 1; i >= 0; i--) {
        const h = hops[i];
        if (!samePos(h.to, cur)) { ok = false; break; }
        W.unshift(h);
        cur = h.from;
        if (samePos(cur, haven)) break;
      }
      if (!ok || W.length === 0 || !samePos(cur, haven)) continue;
      if (!W.every((h) => h.simOk === true)) continue;
      // Armed leg, same day: identical W contiguous, all pass, not vetoed,
      // immediately followed by H' O->T homeward with simOk=false + vetoed entry.
      const aDay = (aInst.days || []).find((d) => d.loopDay === sDay.loopDay);
      if (!aDay) continue;
      const aHops = aDay.hops || [];
      let found = null;
      for (let i = 0; i + W.length < aHops.length + 1 && i + W.length <= aHops.length; i++) {
        if (!W.every((w, j) => sameHop(aHops[i + j], w))) continue;
        if (!W.every((w, j) => aHops[i + j].simOk === true && aHops[i + j].vetoed === false)) continue;
        const nxt = aHops[i + W.length];
        if (nxt && nxt.homeward && nxt.simOk === false && sameHop(nxt, H)) { found = nxt; break; }
      }
      if (!found) continue;
      const vetoedEntry = aHops.some((h) => sameHop(h, H) && h.vetoed === true);
      if (!vetoedEntry || (aDay.homewardVetoes || 0) < 1) continue;
      bandCandidates++;
      console.log('SCREEN-CANDIDATE ' + sInst.seed + ' | day ' + sDay.loopDay + ' | ' +
        W.map(hopKey).join(' ') + ' | ' + hopKey(H) + ' | ' + aDay.homewardVetoes +
        ' | ' + (sDay.end.kcal !== undefined ? sDay.end.kcal : '?'));
      // One candidate per seed/day at most (H is the first such hop); continue scanning other days.
    }
  }
  console.log('SCREEN BAND candidates=' + bandCandidates + ' QUALIFIES=' + (bandCandidates >= 1 ? 'YES' : 'no'));
  process.exit(0);
}

console.error('usage: analyze-homeward-substrate-b.js --validate ... | --screen ...');
process.exit(2);
