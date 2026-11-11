// test-journey-social-r180-narrsplit.js — r180 M10 analyzer split (Lane B).
// The r179 metric review: tallyNarrDup counted ALL NARR verbatim repeats
// as one number, so M10 (coach variation) failed on face-beat repeats
// that are not coach lines. The r180 split reports coach-verbatim and
// face-verbatim separately; M10 judges coach lines only.
// Coach lines are asterisk-wrapped by the engine (`*${coach}*`,
// src/js/truth.js confrontWindup); face lines are emitted bare.
// Proof: synthetic sittings + the r179 4-seed corpus as an anchor
// (15 verbatim repeats, ALL face, 0 coach — the r179 panel numbers).
'use strict';
const fs = require('fs'), path = require('path');
const { tallyNarrDup } = require('./journey-social-r180-helpers');

const COACH_A = "*You've seen the smooth deflect before — it buys them time, not truth. Thin evidence gets deflected. Bring one more thread before you go again.*";
const COACH_B = '*The deflect is a move you know now. It works when what you have is thin. Make it thick.*';
const FACE_A = 'The easy manner evaporates. What\'s left is watching you back.';
const FACE_B = 'They go very still. Not relaxed-still. Held-still.';
const t = (tag, vid, texts) => ({ tag, vid, transcript: texts.map(x => ({ who: 'NARR', text: x })) });

let pass = 0, fail = 0;
function check(name, got, want) {
  if (got === want) { pass++; console.log('PASS ' + name + ' (' + got + ')'); }
  else { fail++; console.log('FAIL ' + name + ' got=' + got + ' want=' + want); }
}

// 1. Coach repeat only: one coach line twice in one sitting.
let r = tallyNarrDup([t('D-talk-request', 'v1', [COACH_A, FACE_A, COACH_A])]);
check('coach-repeat: total', r.nVerbatimRepeats, 1);
check('coach-repeat: coach', r.nVerbatimRepeatsCoach, 1);
check('coach-repeat: face', r.nVerbatimRepeatsFace, 0);

// 2. Face repeat only: one face line twice in one sitting.
r = tallyNarrDup([t('C-friendship', 'v2', [FACE_A, COACH_B, FACE_A])]);
check('face-repeat: total', r.nVerbatimRepeats, 1);
check('face-repeat: coach', r.nVerbatimRepeatsCoach, 0);
check('face-repeat: face', r.nVerbatimRepeatsFace, 1);

// 3. Mixed: a coach repeat AND a face repeat in one sitting.
r = tallyNarrDup([t('D-talk-request', 'v3', [COACH_A, FACE_A, COACH_A, FACE_B, FACE_A, COACH_B])]);
check('mixed: total', r.nVerbatimRepeats, 2);
check('mixed: coach', r.nVerbatimRepeatsCoach, 1);
check('mixed: face', r.nVerbatimRepeatsFace, 1);

// 4. No repeats: distinct lines only.
r = tallyNarrDup([t('C-friendship', 'v4', [COACH_A, COACH_B, FACE_A, FACE_B])]);
check('clean: total', r.nVerbatimRepeats, 0);
check('clean: coach', r.nVerbatimRepeatsCoach, 0);
check('clean: face', r.nVerbatimRepeatsFace, 0);

// 5. Rows carry the class, so the analyzer can print coach vs face.
r = tallyNarrDup([t('D-talk-request', 'v5', [COACH_A, FACE_A, COACH_A, FACE_A])]);
const kinds = r.rows.filter(x => x.kind === 'verbatim-repeat').map(x => x.cls).sort().join(',');
check('rows carry cls coach,face', kinds, 'coach,face');

// 6. Corpus anchor: the r179 4-seed panel — 15 verbatim repeats, ALL face.
//    (r179 run note: 15 verbatim accuseFace repeats, all on seed 43503;
//    15 coach lines total, 0 repeats — verified by direct scan.)
const DIR = path.join(__dirname, '..', 'evidence', '2026-11-11');
let allTs = [];
for (const seed of [43501, 43502, 43503, 43504]) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, `journey-social-life-r179-${seed}.json`), 'utf8'));
  allTs.push(...(d.social || {}).transcripts || []);
}
r = tallyNarrDup(allTs);
check('r179 corpus: conversations', r.nConversations, allTs.length);
check('r179 corpus: total verbatim', r.nVerbatimRepeats, 15);
check('r179 corpus: coach verbatim', r.nVerbatimRepeatsCoach, 0);
check('r179 corpus: face verbatim', r.nVerbatimRepeatsFace, 15);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
