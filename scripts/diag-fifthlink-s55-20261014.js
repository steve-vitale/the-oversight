#!/usr/bin/env node
// scripts/diag-fifthlink-s55-20261014.js — replay leadcourt s55 (FOURTHLINK=1)
// and dump the 5th lead link's trust trajectory + history notes. Grounds the
// tend-vs-decay race before the layer is designed.
'use strict';
process.env.FOURTHLINK = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');

(async () => {
  const { Game } = await loadGame({ seed: 55, mode: 'fifthlink-diag' });
  await setupGame(Game);
  // watch tendLink for gains actually applied
  const tendLog = [];
  const origTend = Game.tendLink;
  Game.tendLink = function (id) {
    const before = ((Game.hierarchyState() || []).find(l => l.id === id) || {}).trust;
    const ret = origTend.call(Game, id);
    const after = ((Game.hierarchyState() || []).find(l => l.id === id) || {}).trust;
    tendLog.push({ day: (Game.state.scholar || {}).day, linkId: id, paid: ret | 0, trustBefore: before | 0, trustAfter: after | 0 });
    return ret;
  };
  const policy = Object.assign({}, fourthlink);
  const traj = [];
  const origDaily = fourthlink.daily;
  policy.daily = (G, ctx) => {
    try {
      const links = (G.hierarchyState() || []).filter(l => l.primary === 'haven' && l.status === 'active');
      const d = (G.state.scholar || {}).day;
      for (const l of links) traj.push({ day: d, id: l.id, age: d - (l.day || 0), trust: l.trust | 0, arrears: l.arrears | 0, mourning: (l.mourningUntil || 0) > d });
    } catch (e) {}
    return origDaily(G, ctx);
  };
  const result = await runDays(Game, policy, { days: 180 });
  console.log('days:', result.days, result.endReason);
  const links = (Game.hierarchyState() || []).filter(l => l.primary === 'haven').sort((a, b) => (a.day || 0) - (b.day || 0));
  links.forEach((l, i) => console.log(`link#${i + 1} formed d${l.day} trust=${l.trust | 0} status=${l.status}`));
  const fifth = links[4];
  if (!fifth) { console.log('no 5th link'); process.exit(0); }
  console.log('\n--- 5th link trust trajectory ---');
  for (const t of traj.filter(t => t.id === fifth.id)) {
    console.log(`d${t.day} age=${t.age} trust=${t.trust} arrears=${t.arrears}${t.mourning ? ' MOURNING' : ''}`);
  }
  console.log('\n--- 5th link tend calls ---');
  for (const t of tendLog.filter(t => t.linkId === fifth.id)) {
    console.log(`d${t.day} paid=${t.paid} trust ${t.trustBefore} -> ${t.trustAfter}`);
  }
  console.log('\n--- 5th link history (tribute/succession/mourning notes) ---');
  for (const h of (fifth.history || [])) {
    if (['tribute', 'succession', 'tended', 'arrears'].includes(h.kind)) {
      console.log(`d${h.day} [${h.kind}] ${String(h.note).slice(0, 140)}`);
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
