#!/usr/bin/env node
// test-corpsehome-b.js — proof for sim-corpsehome-b (DIAG, no game
// loaded, reads corpora + source only). Asserts the fresh-bearer
// bracket (seed 15001, Lucia Shin), the search==bracket identity,
// the narration, the code trace, the census totals, and the
// tracked-diff guard (no src/ or scripts/policies/ change vs the
// prereg base f536e3ad3). Exit non-zero on any FAIL.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function load(p) { return JSON.parse(fs.readFileSync(path.join(root, p), 'utf8')); }
const bracket = load('evidence/2026-10-31/sim-corpsehome-b-corpus-bracket/corpsehome-b-nighttravel-s15001.json');
const search = load('evidence/2026-10-31/sim-corpsehome-b-corpus-search1/corpsehome-b-nighttravel-s15001.json');
function snap(inst, day, kind) {
  const arr = kind === 'm' ? inst.mornings : inst.evenings;
  const r = arr.find((x) => x.loopDay === day);
  if (!r) return null;
  const c = (r.corpses || []).find((x) => x.villagerId === 'gen_yg04sz4');
  const inv = r.morningInv || r.eveningInv || {};
  return { bearerId: inv.scholarId, bearerName: inv.scholarName, c, pend: r.pendingBurials || [], row: r };
}
const m9 = snap(bracket, 9, 'm'), e9 = snap(bracket, 9, 'e'), m10 = snap(bracket, 10, 'm');
check('bracket seed is 15001', bracket.seed === 15001);
check('successor bearer Tomas/gen_7qjv8xz on all three bracket snapshots (snapshot short name Tomas; id is the anchor)',
  m9.bearerId === 'gen_7qjv8xz' && e9.bearerId === 'gen_7qjv8xz' && m10.bearerId === 'gen_7qjv8xz' &&
  m9.bearerName === 'Tomas' && m10.bearerName === 'Tomas');
check('corpse is Lucia gen_yg04sz4 on all three snapshots (snapshot short name Lucia; full name Lucia Shin rides on the pendingBurials entry)',
  m9.c && e9.c && m10.c && m9.c.villagerId === 'gen_yg04sz4' && m10.c.name === 'Lucia' && e9.pend[0].name === 'Lucia Shin');
check('evening 9: node (3,0) mx 0 my 8 recovered false looted false',
  e9.c.node.x === 3 && e9.c.node.y === 0 && e9.c.mx === 0 && e9.c.my === 8 && e9.c.recovered === false && e9.c.looted === false);
check('morning 10: node (4,4) mx 4 my 4 recovered true looted false',
  m10.c.node.x === 4 && m10.c.node.y === 4 && m10.c.mx === 4 && m10.c.my === 4 && m10.c.recovered === true && m10.c.looted === false);
check('pendingBurials day 8 present evening 9, cleared morning 10',
  e9.pend.length === 1 && e9.pend[0].corpseId === 'corpse_8_vlznp8' && e9.pend[0].day === 8 && m10.pend.length === 0);
check('items identical morning 9 / evening 9 / morning 10 (8 stacks)',
  JSON.stringify(m9.c.items) === JSON.stringify(e9.c.items) && JSON.stringify(e9.c.items) === JSON.stringify(m10.c.items) && m10.c.items.length === 8);
check('search leg equals bracket leg on 9m/9e/10m (no divergence)',
  ['m9', 'e9', 'm10'].every((k) => {
    const [d, kind] = k === 'm9' ? [9, 'm'] : k === 'e9' ? [9, 'e'] : [10, 'm'];
    const a = snap(search, d, kind), b = snap(bracket, d, kind);
    return a.bearerId === b.bearerId && JSON.stringify(a.c) === JSON.stringify(b.c) && JSON.stringify(a.pend) === JSON.stringify(b.pend);
  }));
const gap10 = m10.row.gapLines || [];
const sayIdx = gap10.findIndex((l) => l.startsWith('That night, they bring Lucia home.'));
const dawnIdx = gap10.findIndex((l) => l.includes('DAY 10 DAWN'));
check('say line verbatim in morning-10 gap lines, before DAY 10 DAWN',
  sayIdx >= 0 && dawnIdx > sayIdx && gap10[sayIdx].includes('the grave is dug by the fire') && gap10[sayIdx].includes('The filling of it is yours.'));
const day9 = (e9.row.fullDaySay || []);
check('day-9 full transcript: no corpse/grave/Lucia/body line (daytime carrying excluded)',
  !day9.some((l) => /corpse|grave|Lucia|body/i.test(l)));
const gap9 = (m9.row.gapLines || []);
check('morning-9 gap lines carry the death beat + mantle to Tomas',
  gap9.some((l) => l.includes('Lucia Shin is dead')) && gap9.some((l) => l.includes('mantle passes to Tomas')));
check('evening 9: Lucia was the only corpse (recentering stability vacuous, stated not assumed)',
  (e9.row.corpses || []).length === 1 && e9.row.corpses[0].id === 'corpse_8_vlznp8');
const corpsesSrc = fs.readFileSync(path.join(root, 'src/js/corpses.js'), 'utf8');
const gameSrc = fs.readFileSync(path.join(root, 'src/js/game.js'), 'utf8');
const ledgerSrc = fs.readFileSync(path.join(root, 'src/js/ledger.js'), 'utf8');
check('code: recoverBearer defined with due condition day > pending day',
  /recoverBearer\(\)/.test(corpsesSrc) && /day > \(p\.day/.test(corpsesSrc));
check('code: recoverBearer sets node/mx/my constants + recovered + deathKnown',
  /c\.node = \{ x: hx, y: hy \}/.test(corpsesSrc) && /c\.mx = 4; c\.my = 4;/.test(corpsesSrc) && /c\.recovered = true;/.test(corpsesSrc) && /c\.deathKnown = true;/.test(corpsesSrc));
check('code: say line template in recoverBearer', /That night, they bring/.test(corpsesSrc));
check('code: endDay calls recoverBearer', /recoverBearer && this\.recoverBearer\(\)/.test(gameSrc));
check('code: ledger playerDeath queues pendingBurials {corpseId, villagerId, name, day}',
  /pendingBurials\.push\(\{ corpseId: rc\.id, villagerId: oldId, name: oldName, day: s\.day/.test(ledgerSrc));
const grepOut = execSync('grep -rn "c\\.node = " src/js/*.js', { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
check('sole corpse-node writer: c.node = only in corpses.js',
  grepOut.length >= 1 && grepOut.every((l) => l.startsWith('src/js/corpses.js:')), grepOut.join(' | '));
const table = load('evidence/2026-10-31/sim-corpsehome-b-table.json');
check('census totals: 65 seeds, 46 bearer deaths, 13 away, 43 position changes',
  table.searchCensus.seeds === 65 && table.searchCensus.bearerDeaths === 46 &&
  table.searchCensus.awayDeathsEndingAtHaven === 13 && table.searchCensus.corpsePositionChanges === 43);
const summaries = [1, 2, 3, 4, 5, 6, 7].map((n) => load('evidence/2026-10-31/sim-corpsehome-b-search' + n + '-summary.json'));
const totDeaths = summaries.reduce((a, s) => a + s.bearerDeaths.length, 0);
const totMoves = summaries.reduce((a, s) => a + s.corpseMoves.length, 0);
check('summaries recompute to 46 deaths / 43 moves', totDeaths === 46 && totMoves === 43, totDeaths + '/' + totMoves);
const diff = execSync('git diff --name-only f536e3ad3 HEAD -- src scripts/policies', { cwd: root, encoding: 'utf8' }).trim();
check('tracked-diff guard: no src/ or scripts/policies/ change vs prereg base', diff === '', diff);
const prereg = fs.readFileSync(path.join(root, 'evidence/2026-10-31/sim-corpsehome-b-prereg.md'), 'utf8');
check('prereg states DIAG-GO bar + search band + panel non-applicability',
  /DIAG-GO/.test(prereg) && /15000/.test(prereg) && /NOT APPLICABLE/.test(prereg));
console.log('corpsehome-b proof: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
