'use strict';
// Summarize observed opportunity, never infer eligibility or combine successors.
const fs = require('fs'), z = require('zlib'), path = require('path');
function summarize(report, definitions) {
  if (!Array.isArray(report.rows) || !report.rows.length) throw Error('No retained cases');
  const kit = new Set(definitions.kit), payoffs = new Set(definitions.payoffs);
  const rows = report.rows.map(r => {
    if (!Array.isArray(r.snapshots) || !r.snapshots.length || !Array.isArray(r.picks)) throw Error('Missing raw observations');
    for (const checks of [r.checks, r.control?.checks]) {
      if (!checks || ['state', 'row', 'metrics', 'warnings', 'diagnostic'].some(k => checks[k] !== true)) throw Error('Unverified replay ' + r.seed);
    }
    if (r.nextRandom !== r.control.nextRandom || r.dropped !== 0 || r.choiceDropped !== 0 || r.errors.length) throw Error('Incomplete or impure replay ' + r.seed);
    const people = new Map();
    function person(id) {
      if (typeof id !== 'string' || !id) throw Error('Unknown bearer');
      if (!people.has(id)) people.set(id, {person:id, maxSimultaneous:0, payoffObserved:false, deedObserved:false, offerCalls:0, acquiredAtChoice:[], occupationKnown:false});
      return people.get(id);
    }
    function held(p, ids) {
      if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) throw Error('Unknown held set');
      p.maxSimultaneous = Math.max(p.maxSimultaneous, new Set(ids.filter(id => kit.has(id))).size);
      p.payoffObserved ||= ids.some(id => payoffs.has(id));
    }
    for (const s of r.snapshots) {
      const p = person(s.person); held(p, s.held);
      p.deedObserved ||= s.marketDeed != null;
      p.occupationKnown ||= s.occupation != null;
    }
    const offers = [];
    for (const pick of r.picks) {
      const p = person(pick.person); held(p, pick.before); held(p, pick.after);
      const offered = pick.offers.map(o => o.id).filter(id => kit.has(id));
      if (!offered.length) continue;
      p.offerCalls++;
      const gained = kit.has(pick.id) && !pick.before.includes(pick.id) && pick.after.includes(pick.id);
      if (gained) p.acquiredAtChoice.push({day:pick.day, id:pick.id});
      offers.push({person:pick.person, day:pick.day, offered, picked:pick.id, gained});
    }
    return {policy:r.policy, seed:r.seed, people:[...people.values()], offers};
  });
  const people = rows.flatMap(r => r.people), offers = rows.flatMap(r => r.offers);
  return {scope:'Actual chooseAbility calls and sampled per-bearer holdings/deeds. Counts are calls, not unique sheets. No capstone eligibility or natural viability verdict.',
    sourceDigest:report.sourceDigest, observerDigest:report.observerDigest, contractDigest:report.contractDigest,
    totals:{runs:rows.length, bearerOccurrences:people.length, runsWithOffer:rows.filter(r=>r.offers.length).length,
      offerCalls:offers.length, acquiredAtChoice:offers.filter(o=>o.gained).length,
      runsWithDeed:rows.filter(r=>r.people.some(p=>p.deedObserved)).length,
      maxSimultaneous:Math.max(...people.map(p=>p.maxSimultaneous)),
      payoffBearerOccurrences:people.filter(p=>p.payoffObserved).length,
      unknownOccupationBearerOccurrences:people.filter(p=>!p.occupationKnown).length}, rows};
}
if (require.main === module) {
  const input = process.argv[2], root = path.resolve(process.argv[3] || '.');
  if (!input) throw Error('Usage: node scripts/summarize-market-path.js <report.json.gz> <exact-game-root>');
  const report = JSON.parse(z.gunzipSync(fs.readFileSync(input)));
  const B = require('./balance-panel');
  const crypto = require('crypto');
  const digest = crypto.createHash('sha256').update(JSON.stringify(B.manifest(root))).digest('hex');
  if (digest !== report.sourceDigest) throw Error('Wrong Game/controller source for retained replay');
  const abilities = JSON.parse(fs.readFileSync(path.join(root,'src/data/abilities.json'),'utf8'));
  const paths = JSON.parse(fs.readFileSync(path.join(root,'src/data/godpaths.json'),'utf8'));
  const definitions = {kit:abilities.filter(a=>a.lane==='magic' && [a.path,a.alsoPath].includes('miser')).map(a=>a.id),
    payoffs:Object.values(paths.paths.miser.subclasses).map(s=>s.payoff)};
  process.stdout.write(JSON.stringify(summarize(report, definitions),null,2)+'\n');
}
module.exports = {summarize};
