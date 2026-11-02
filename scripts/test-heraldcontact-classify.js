#!/usr/bin/env node
// test-heraldcontact-classify.js — UNIT PROOF for the contact
// classifier (scripts/heraldcontact-classify.js) on stub recorder
// rows. No game load. Every code leg, the decision order, and the
// UNCLASSIFIED-only-when-unexplained rule.
// Usage: node scripts/test-heraldcontact-classify.js
'use strict';
const { classify } = require('./heraldcontact-classify');

let pass = 0, fail = 0;
function check(name, rec, want) {
  const got = classify(rec).code;
  if (got === want) { pass++; }
  else { fail++; console.error(`FAIL ${name}: want ${want}, got ${got} — ${JSON.stringify(classify(rec).why)}`); }
}
function S(day, wave, rank, omenStage) { return { day, wave, rank, omenStage, present: false, pend: false, pendMid: null }; }

check('ATTEMPTED beats everything', { samples: [S(10, 4, 'regional', 2)], attempts: [{ day: 50, cls: 'REFUSED', reason: 'MUSTER-GATE' }], endReason: 'survived', gameDays: 90 }, 'ATTEMPTED');
check('ATTEMPTED fought', { samples: [S(10, 4, 'regional', 2)], attempts: [{ day: 50, cls: 'FOUGHT', reason: null }], endReason: 'survived', gameDays: 90 }, 'ATTEMPTED');
check('LOCATED_NO_ENGAGE', { samples: [S(10, 4, 'regional', 0), S(20, 4, 'regional', 1), S(30, 4, 'regional', 2)], attempts: [], endReason: 'survived', gameDays: 90, endOmen: { stage: 2, day: 30 } }, 'LOCATED_NO_ENGAGE');
check('OMEN_STUCK stage 1', { samples: [S(10, 4, 'regional', 0), S(20, 4, 'regional', 1)], attempts: [], endReason: 'survived', gameDays: 90, endOmen: { stage: 1, day: 10 } }, 'OMEN_STUCK');
check('OMEN_STUCK stage 0', { samples: [S(10, 4, 'regional', 0)], attempts: [], endReason: 'over-other', gameDays: 40, endOmen: { stage: 0, day: 10 } }, 'OMEN_STUCK');
check('NO_OMEN', { samples: [S(10, 4, 'regional', null), S(50, 4, 'regional', null)], attempts: [], endReason: 'survived', gameDays: 90, endOmen: null }, 'NO_OMEN');
check('NEVER_REGIONAL', { samples: [S(10, 4, 'village', null)], attempts: [], endReason: 'survived', gameDays: 180, endOmen: null }, 'NEVER_REGIONAL');
check('DIED_BEFORE_REGIONAL', { samples: [S(10, 4, 'village', null)], attempts: [], endReason: 'over-other', gameDays: 60, endOmen: null }, 'DIED_BEFORE_REGIONAL');
check('LOST_BEFORE_REGIONAL', { samples: [S(10, 4, 'village', null)], attempts: [], endReason: 'village-lost', gameDays: 60, endOmen: null }, 'LOST_BEFORE_REGIONAL');
check('NEVER_WAVE4', { samples: [S(10, 3, 'village', null)], attempts: [], endReason: 'survived', gameDays: 180, endOmen: null }, 'NEVER_WAVE4');
check('DIED_BEFORE_WAVE4', { samples: [S(10, 2, 'village', null)], attempts: [], endReason: 'over-other', gameDays: 45, endOmen: null }, 'DIED_BEFORE_WAVE4');
check('LOST_BEFORE_WAVE4', { samples: [S(10, 2, 'village', null)], attempts: [], endReason: 'village-lost', gameDays: 45, endOmen: null }, 'LOST_BEFORE_WAVE4');
// Regional routinely precedes wave 4: wave-4 legs must NOT require
// regionalDay == null (classifier bug found on pilot 97304/97306/97308).
check('NEVER_WAVE4 regional-reached', { samples: [S(10, 3, 'regional', null)], attempts: [], endReason: 'survived', gameDays: 180, endOmen: null }, 'NEVER_WAVE4');
check('DIED_BEFORE_WAVE4 regional-reached', { samples: [S(10, 3, 'regional', null)], attempts: [], endReason: 'over-other', gameDays: 90, endOmen: null }, 'DIED_BEFORE_WAVE4');
check('LOST_BEFORE_WAVE4 regional-reached', { samples: [S(10, 3, 'regional', null)], attempts: [], endReason: 'village-lost', gameDays: 89, endOmen: null }, 'LOST_BEFORE_WAVE4');
check('UNCLASSIFIED empty record', {}, 'UNCLASSIFIED');
check('UNCLASSIFIED undecidable end', { samples: [S(10, 3, 'village', null)], attempts: [], endReason: 'bogus', gameDays: 90, endOmen: null }, 'UNCLASSIFIED');
// Decision-order guard: stage-2 sample + attempts must still be ATTEMPTED.
check('order: attempt beats located', { samples: [S(30, 4, 'regional', 2)], attempts: [{ day: 40, cls: 'REFUSED', reason: 'MUSTER-GATE' }], endReason: 'survived', gameDays: 90 }, 'ATTEMPTED');
// Milestone fallback: no samples, milestones only.
check('milestone fallback LOCATED', { samples: [], milestones: { wave4Day: 10, regionalDay: 12, omenStartDay: 15, omenStage2Day: 30 }, attempts: [], endReason: 'survived', gameDays: 90 }, 'LOCATED_NO_ENGAGE');

console.log(`heraldcontact-classify unit: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
