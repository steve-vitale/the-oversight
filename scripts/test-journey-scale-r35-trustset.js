// scripts/test-journey-scale-r35-trustset.js — proof for the r35 trust-setter
// instrument. Extracts the driver's REAL installTrustSetters + pickChoice
// functions (not copies) and replays synthetic links/choices through them.
// Run with an r34 driver path as argv[2] it must FAIL (RED: r34 has no
// installTrustSetters, no betrayal pick, no DRIVER DROP marker, DAYCAP 150).
// Usage: node scripts/test-journey-scale-r35-trustset.js [driverPath]
'use strict';
const fs = require('fs');
const path = require('path');
const driverPath = process.argv[2] || path.join(__dirname, 'journey-scale-r35-20261025.js');
const src = fs.readFileSync(driverPath, 'utf8');
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label); } }
// Static wiring assertions (fail on the r34 driver).
ok(src.includes('function installTrustSetters()'), 'driver defines installTrustSetters');
ok((src.match(/installTrustSetters\(\); \/\/ R35/g) || []).length >= 2, 'policy.daily calls installTrustSetters before AND after baseDaily');
ok(src.includes('trustSetLog: trustSetLog.slice()'), 'census carries trustSetLog');
ok(src.includes("'betrayal:accept'"), 'picker ENGAGE includes betrayal:accept');
ok(src.includes("'betrayal:decline'"), 'picker DEFLECT includes betrayal:decline');
ok(src.includes('DRIVER DROP'), 'runConversation logs a DRIVER DROP marker on unhandled choices');
ok(src.includes("DAYCAP || '180'"), 'driver DAYCAP default is 180');
// Extract the real setter functions: trustSetLog decl through CONVO_DAYS.
const setStart = src.indexOf('let trustSetLog = [];');
const setEnd = src.indexOf('const CONVO_DAYS', setStart);
ok(setStart !== -1 && setEnd !== -1, 'installTrustSetters extractable from driver source');
if (setStart !== -1 && setEnd !== -1) {
  const fnSrc = src.slice(setStart, setEnd);
  let testLinks = [], testDay = 0;
  const links = () => testLinks;
  const gday = () => testDay;
  const linkOther = (l) => (l.a === 'haven' ? l.b : l.a);
  const factory = new Function('links', 'gday', 'linkOther', fnSrc + '\nreturn { installTrustSetters, trustSetLog };');
  const fns = factory(links, gday, linkOther);
  const log = fns.trustSetLog;
  // One covenant link, installed at trust 30.
  testDay = 10;
  const link = { id: 'l1', a: 'haven', b: 'vX', kind: 'covenant', status: 'active', trust: 30 };
  testLinks = [link];
  fns.installTrustSetters();
  ok(log.length === 0, 'install logs nothing by itself');
  // A named caller drops trust by 5: the stack must name the caller.
  function councilWarPact() { link.trust = Math.max(0, link.trust - 5); }
  councilWarPact();
  ok(log.length === 1 && log[0].delta === -5 && log[0].before === 30 && log[0].after === 25, 'drop -5 logged with before/after');
  ok(/councilWarPact/.test(log[0].stack || ''), 'drop stack names the caller (councilWarPact)');
  ok(log[0].other === 'vX' && log[0].day === 10, 'drop logged with link + day');
  // An unchanged assignment logs nothing.
  link.trust = 25;
  ok(log.length === 1, 'unchanged assignment logs nothing');
  // A _trustGain-style gain: stack must still name the real caller chain.
  function recordDeedWrap() { link.trust = Math.min(100, link.trust + 4); }
  recordDeedWrap();
  ok(log.length === 2 && log[1].delta === 4, 'gain +4 logged');
  ok(/recordDeedWrap/.test(log[1].stack || ''), 'gain stack names the caller');
  // Re-install is idempotent: one more assignment logs once, not twice.
  fns.installTrustSetters();
  link.trust = 20;
  ok(log.length === 3 && log[2].delta === -9, 're-install does not double-log (single -9 entry)');
  // The getter still reads the live value for snapshots.
  ok(link.trust === 20, 'getter reads current trust');
  // Inactive links are skipped.
  testLinks = [{ id: 'l2', a: 'haven', b: 'vY', kind: 'covenant', status: 'broken', trust: 40 }];
  fns.installTrustSetters();
  ok(log.length === 3, 'inactive link produces no install/log');
}
// Extract the real picker: ENGAGE decl through runConversation.
const pickStart = src.indexOf('const ENGAGE');
const pickEnd = src.indexOf('function runConversation', pickStart);
ok(pickStart !== -1 && pickEnd !== -1, 'pickChoice extractable from driver source');
if (pickStart !== -1 && pickEnd !== -1) {
  const fnSrc = src.slice(pickStart, pickEnd);
  const factory = new Function(fnSrc + '\nreturn { pickChoice, DEFLECT };');
  const { pickChoice, DEFLECT } = factory();
  const mk = (ids) => ids.map(id => ({ id, label: id }));
  // Betrayal: accept engages when both are offered.
  let p = pickChoice(mk(['betrayal:accept', 'betrayal:decline', 'leave']), 0, { consec: 0, deflected: false });
  ok(p && p.id === 'betrayal:accept', 'betrayal accept engages when offered');
  // Betrayal: decline alone is picked (deflect path) rather than leaving.
  p = pickChoice(mk(['betrayal:decline', 'leave']), 0, { consec: 0, deflected: false });
  ok(p && p.id === 'betrayal:decline', 'betrayal decline picked when it is the only engage/deflect option');
  ok(DEFLECT.indexOf('betrayal:decline') !== -1, 'betrayal:decline counts as a deflect for the goon guard');
  // Picker cap inherited: one consecutive more/goon then blocked.
  p = pickChoice(mk(['dlg:more', 'dlg:help', 'leave']), 0, { consec: 1, deflected: false });
  ok(p && p.id === 'dlg:help', 'stretch cap still blocks a second consecutive dlg:more');
  // Goon after a deflect still blocked.
  p = pickChoice(mk(['goon', 'dlg:help', 'leave']), 0, { consec: 0, deflected: true });
  ok(p && p.id === 'dlg:help', 'goon after deflect still blocked');
}
console.log(`trustset: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
