#!/usr/bin/env node
// analyze-toolloss-b.js — pure reads over the judged toolloss corpora.
// Emits the per-morning cutInfo + inventory table (15215, both legs),
// the day-16 -> day-17 bracket, the pilot-band summary, and the corpse
// check. No game code, no policy code, no writes except the table JSON
// path given on the command line (default: stdout).
'use strict';
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'evidence', '2026-10-31');
function load(leg, seed) {
  return JSON.parse(fs.readFileSync(path.join(BASE, 'sim-toolloss-b-corpus-' + leg,
    'toolloss-b-nighttravel-s' + seed + '.json'), 'utf8'));
}
function loadGap(seed) {
  return JSON.parse(fs.readFileSync(path.join(BASE, 'sim-toolloss-b-corpus-gap',
    'toolloss-gap-b-nighttravel-s' + seed + '.json'), 'utf8'));
}
function knifeIn(snap) {
  if (!snap) return null;
  const inv = (snap.inv || []).some((i) => i.id === 'stone_knife');
  const eq = snap.equipped ? Object.values(snap.equipped).some((e) => e && e.id === 'stone_knife') : false;
  return inv ? 'inventory' : (eq ? 'equipped' : 'absent');
}
function morningTable(d) {
  return d.mornings.map((m) => ({
    loopDay: m.loopDay, bearer: m.morningInv ? m.morningInv.scholarId : null,
    bearerName: m.morningInv ? m.morningInv.scholarName : null,
    tier: m.morningCut ? m.morningCut.tier : null,
    toolName: m.morningCut ? m.morningCut.toolName : null,
    canFell: m.morningCut ? m.morningCut.canFell : null,
    knife: knifeIn(m.morningInv), invN: m.morningInv ? m.morningInv.inv.length : null,
    inside: m.inside, tile: m.tile,
  }));
}
function bracket(d) {
  const eve16 = d.evenings.find((e) => e.loopDay === 16);
  const morn17 = d.mornings.find((m) => m.loopDay === 17);
  const morn16 = d.mornings.find((m) => m.loopDay === 16);
  return {
    morning16: { bearer: morn16.morningInv.scholarId, tier: morn16.morningCut.tier, knife: knifeIn(morn16.morningInv) },
    evening16: { bearer: eve16.eveningInv.scholarId, tier: eve16.eveningCut.tier, knife: knifeIn(eve16.eveningInv),
      vitals: eve16.eveningInv.vitals || null, inside: eve16.inside, tile: eve16.tile },
    morning17: { bearer: morn17.morningInv.scholarId, tier: morn17.morningCut.tier, knife: knifeIn(morn17.morningInv),
      vitals: morn17.morningInv.vitals || null, inside: morn17.inside, tile: morn17.tile },
    bearerChanged: eve16.eveningInv.scholarId !== morn17.morningInv.scholarId,
  };
}
function bandSummary() {
  const out = [];
  for (const seed of [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337]) {
    const d = load('on', seed);
    const ids = [];
    let prev = null;
    const changes = [];
    for (const m of d.mornings) {
      const id = m.morningInv ? m.morningInv.scholarId : null;
      if (prev && id !== prev) changes.push({ loopDay: m.loopDay, from: prev, to: id });
      prev = id; if (id && !ids.includes(id)) ids.push(id);
    }
    const whittle = d.mornings.filter((m) => m.morningCut && m.morningCut.tier === 'whittle').map((m) => m.loopDay);
    let drop = null;
    for (let i = 1; i < d.mornings.length; i++) {
      const a = d.mornings[i - 1], b = d.mornings[i];
      if (a.morningCut && a.morningCut.tier === 'whittle' && b.morningCut && b.morningCut.tier !== 'whittle')
        drop = { fromDay: a.loopDay, toDay: b.loopDay, bearerChanged: a.morningInv.scholarId !== b.morningInv.scholarId };
    }
    out.push({ seed, bearers: ids, changes, whittleMornings: whittle, drop,
      playerDeaths: (d.deaths || []).filter((x) => x.player), end: d.endReason });
  }
  return out;
}
function corpseCheck(g) {
  const out = {};
  for (const m of g.mornings.filter((x) => x.loopDay >= 15 && x.loopDay <= 19)) {
    const c = (m.corpses || []).find((x) => x.villagerId === 'gen_gyft62f');
    out[m.loopDay] = c ? { node: c.node, mx: c.mx, my: c.my, looted: c.looted,
      items: c.items.map((i) => i.id || i.name) } : null;
  }
  return out;
}
function main() {
  const on = load('on', 15215);
  const guard = load('guard', 15215);
  const gap = loadGap(15215);
  const table = {
    seed: 15215,
    onMornings: morningTable(on),
    guardMornings: morningTable(guard),
    bracketOn: bracket(on),
    bracketGuard: bracket(guard),
    bandOn: bandSummary(),
    corpseByMorning: corpseCheck(gap),
    gapMorning17: {
      bearer: gap.mornings.find((m) => m.loopDay === 17).morningInv.scholarId,
      gapCount: gap.mornings.find((m) => m.loopDay === 17).gapCount,
      deathLine: gap.mornings.find((m) => m.loopDay === 17).gapLines.find((l) => /is dead — the wild/i.test(l)) || null,
      mantleLine: gap.mornings.find((m) => m.loopDay === 17).gapLines.find((l) => /mantle passes to/i.test(l)) || null,
      wakeLine: gap.mornings.find((m) => m.loopDay === 17).gapLines.find((l) => /wake up somebody else/i.test(l)) || null,
      fightLines: gap.mornings.find((m) => m.loopDay === 17).gapLines.filter((l) => /HUSHPUPPY|hits you for|You go down/i.test(l)),
    },
    trajectoryMatchGapVsJudged: JSON.stringify(gap.mornings.map((m) => [m.loopDay, m.morningInv.scholarId, m.morningCut.tier]))
      === JSON.stringify(on.mornings.map((m) => [m.loopDay, m.morningInv.scholarId, m.morningCut.tier])),
  };
  const out = process.argv[2];
  if (out) fs.writeFileSync(out, JSON.stringify(table, null, 2) + '\n');
  else console.log(JSON.stringify(table, null, 2));
}
if (require.main === module) main();
module.exports = { load, loadGap, knifeIn, morningTable, bracket, bandSummary, corpseCheck };
