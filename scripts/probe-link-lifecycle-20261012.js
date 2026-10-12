// probe-link-lifecycle-20261012.js — trace every hierarchy link's birth/death on a replay of seed 20202.
// Wraps _linkNote + the link-status mutators; logs day, link id, kind, other village, trust, what happened.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { scalecourt } = require('./policies/scalecourt');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20202]);
const DAYCAP = parseInt(process.env.DAYCAP || '117', 10);

function gday(G) { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function otherName(G, link) {
  try {
    const ovs = G.state.otherVillages || [];
    const tid = link.a === 'haven' ? link.b : link.a;
    const ov = ovs.find(v => v.id === tid);
    return (ov && ov.name) || tid;
  } catch (e) { return '?'; }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'probe-link', fullTelemetry: false });
  const events = [];
  const log = (ev) => events.push(Object.assign({ day: gday(Game) }, ev));
  // snapshot link set daily and diff
  const seen = new Map();
  // wrap say to catch link-related beats
  const _say = Game.say;
  Game.say = function (...a) {
    const s = String(a[0] || '');
    if (/link|covenant|charter|tribute|bows|kneel|breaks|snap|dissolve|walk away/i.test(s)) {
      log({ type: 'say', line: s.slice(0, 220) });
    }
    try { return _say.apply(this, a); } catch (e) { return a[0]; }
  };
  await setupGame(Game);
  const policy = Object.assign({}, scalecourt);
  policy.id = 'probe-link';
  const origDaily = scalecourt.daily.bind(scalecourt);
  policy.daily = function (G, ctx) {
    origDaily(G, ctx);
    try {
      const links = G.hierarchyState ? G.hierarchyState() : [];
      const cur = new Set(links.map(l => l.id));
      for (const l of links) {
        const prev = seen.get(l.id);
        const sig = `${l.kind}|${l.status}|${l.trust}|${l.primary || '-'}>${l.subordinate || '-'}`;
        if (!prev) {
          log({ type: 'link-born', id: l.id, kind: l.kind, with: otherName(G, l), status: l.status, trust: l.trust, linkDay: l.day });
        } else if (prev !== sig) {
          log({ type: 'link-change', id: l.id, kind: l.kind, with: otherName(G, l), from: prev, to: sig });
        }
        seen.set(l.id, sig);
      }
      for (const [id, sig] of seen) {
        if (!cur.has(id) && !String(sig).startsWith('GONE')) {
          log({ type: 'link-gone', id, last: sig });
          seen.set(id, 'GONE');
        }
      }
    } catch (e) {}
  };
  await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'probe-link' } });
  console.log(`\n=== SEED ${seed} LINK LIFECYCLE (day <= ${DAYCAP}) ===`);
  for (const e of events) {
    if (e.type === 'say') console.log(`d${e.day} SAY: ${e.line}`);
    else console.log(`d${e.day} ${e.type}: ${e.id || ''} ${e.kind || ''} with=${e.with || ''} status=${e.status || ''} trust=${e.trust != null ? e.trust : ''} ${e.from ? e.from + ' -> ' + e.to : ''} ${e.last ? 'last=' + e.last : ''} ${e.linkDay != null ? 'linkDay=' + e.linkDay : ''}`);
  }
}

(async () => {
  for (const s of SEEDS) {
    try { await runSeed(s); } catch (e) { console.log('FATAL', e && e.stack || e); }
  }
})().catch(e => { console.error(e); process.exit(2); });
