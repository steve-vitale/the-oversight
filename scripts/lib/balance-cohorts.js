'use strict';
const crypto = require('crypto');
const key = r => r.row.policy + ':' + r.row.seed;
function validate(panel) {
  const errors = [], excluded = panel.exclusions || [], occupation = panel.options.occupation;
  const expected = new Set(panel.options.policies.flatMap(p => panel.options.seeds.map(s => p + ':' + s)));
  const cases = [...panel.rows, ...excluded], keys = cases.map(key);
  if (keys.some(k => !expected.has(k))) errors.push('Case does not belong to declared panel');
  if (new Set(keys).size !== keys.length) errors.push('Duplicate played/excluded cases');
  if (keys.length !== expected.size) errors.push('Incomplete panel');
  if (excluded.length && !occupation) errors.push('Exclusions require an explicit occupation');
  if (panel.rows.some(r => r.excluded) || excluded.some(r => r.excluded !== true)) errors.push('Played/excluded collections disagree');
  const playedKeys = new Set(panel.rows.map(key)), excludedKeys = new Set(excluded.map(key));
  for (const [kind, proofs, keys] of [['campaign', panel.validity.neutrality, playedKeys], ['selection', panel.validity.selection || [], excludedKeys]]) {
    for (const n of proofs) {
      if (!n.match || n.warnings || !keys.has(n.policy + ':' + n.seed) ||
          (kind === 'selection' ? n.kind !== 'selection' : n.kind != null && n.kind !== 'campaign')) errors.push('Invalid ' + kind + ' proof: ' + n.policy + ':' + n.seed);
    }
  }
  for (const r of cases) {
    if (r.warnings?.length) errors.push('Runtime warning: ' + key(r));
    if (!occupation) continue;
    const s = r.row.selection, offered = s?.offered;
    if (!s || s.schemaVersion !== 1 || s.requestedOccupation !== occupation || s.origin !== panel.options.origin ||
        !Array.isArray(offered) || !offered.length || offered.some(p => !p.id || !p.occupation) ||
        new Set(offered.map(p => p.id)).size !== offered.length || !/^[a-f0-9]{64}$/.test(s.rosterHash || '')) {
      errors.push('Invalid occupation receipt: ' + key(r)); continue;
    }
    if (r.excluded === true) {
      if (s.status !== 'excluded' || s.reason !== 'occupation_not_offered' || offered.some(p => p.occupation === occupation) ||
          r.metrics != null || r.gear != null || r.row.won != null || r.stateHashKind !== 'selection' ||
          r.stateHash !== crypto.createHash('sha256').update(JSON.stringify(s)).digest('hex')) errors.push('Invalid absent-offer exclusion: ' + key(r));
    } else if (s.status !== 'played' || !Number.isSafeInteger(s.selectedOfferIndex) || s.selectedOfferIndex < 0 ||
        offered[s.selectedOfferIndex]?.id !== s.selectedId || offered[s.selectedOfferIndex]?.occupation !== occupation ||
        s.startingBearer !== s.selectedId || s.occupation !== occupation || !s.region ||
        !r.metrics || !r.gear || !Array.isArray(r.observerErrors) ||
        (panel.options.region && panel.options.region !== s.region)) errors.push('Invalid started occupation: ' + key(r));
  }
  for (const policy of panel.options.policies) {
    const played = panel.rows.some(r => r.row.policy === policy);
    if (played && !panel.validity.neutrality.some(n => n.policy === policy && n.kind !== 'selection' && n.match && !n.warnings)) errors.push('Missing passing neutrality proof: ' + policy);
    if (!played && occupation && !(panel.validity.selection || []).some(n => n.policy === policy && n.kind === 'selection' && n.match && !n.warnings)) errors.push('Missing deterministic excluded selection proof: ' + policy);
  }
  return errors;
}
function coverage(panel, policy) {
  const rows = panel.rows.filter(r => r.row.policy === policy), excluded = (panel.exclusions || []).filter(r => r.row.policy === policy), reasons = {};
  for (const r of excluded) { const name = r.row.selection.reason; reasons[name] = (reasons[name] || 0) + 1; }
  return { attempted: rows.length + excluded.length, played: rows.length, excluded: excluded.length, reasons };
}
module.exports = { key, validate, coverage };
