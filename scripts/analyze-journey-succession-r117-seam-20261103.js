// analyze-journey-succession-r117-seam-20261103.js -- SEAM section for
// the r117 succession panel: counts party_rolepick picks, handover lines
// ("stepping back") and assignment lines ("is ... now.") in the panel
// transcripts, plus invite YOU lines by wording ("us" vs "me") and
// double-line invites (us immediately followed by me for one invite).
// Reads evidence/2026-11-03/journey-succession-r117-transcript-*.txt.
// Usage: node scripts/analyze-journey-succession-r117-seam-20261103.js
// Output: SEAM counts + verdict lines. Exit 0 unless files are missing.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-11-03');
const files = fs.readdirSync(EVID).filter(f => /^journey-succession-r117-transcript-.*\.txt$/.test(f)).sort();
let rolepicks = 0, handover = 0, assign = 0, paired = 0, unpaired = 0;
let inviteUs = 0, inviteMe = 0, doubleLine = 0;
const unpairedFiles = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(EVID, f), 'utf8');
  const lines = text.split('\n');
  let picksInFile = 0, hasHandover = false, hasAssign = false;
  let prevYouInvite = null;
  for (const ln of lines) {
    if (/YOU PICK \[party_rolepick:/.test(ln)) { rolepicks++; picksInFile++; }
    if (/stepping back/.test(ln)) { handover++; hasHandover = true; }
    if (/is .* now\./.test(ln) && /NPC:/.test(ln)) { assign++; hasAssign = true; }
    const mUs = /^YOU: "Want to come with us\?"/.test(ln);
    const mMe = /^YOU: "Want to come with me\?"/.test(ln);
    if (mUs) { inviteUs++; if (prevYouInvite === 'me') doubleLine++; prevYouInvite = 'us'; }
    else if (mMe) { inviteMe++; if (prevYouInvite === 'us') doubleLine++; prevYouInvite = 'me'; }
    else if (/^YOU:/.test(ln)) { prevYouInvite = null; }
  }
  if (picksInFile) {
    if (hasHandover || hasAssign) paired++;
    else { unpaired++; unpairedFiles.push(f); }
  }
}
console.log('SEAM (r117 panel transcripts)');
console.log(`  transcripts: ${files.length}`);
console.log(`  rolepick picks: ${rolepicks} | handover lines: ${handover} | assignment lines: ${assign}`);
console.log(`  transcripts with a rolepick that show handover or assignment: ${paired} | showing neither: ${unpaired}`);
if (unpairedFiles.length) console.log(`  unpaired files: ${unpairedFiles.join(', ')}`);
console.log(`  invite YOU lines: us=${inviteUs} me=${inviteMe} | double-line invites: ${doubleLine}`);
console.log(`SEAM-ROLEPICK ${unpaired === 0 ? 'PASS' : 'FAIL'} (unpaired=${unpaired})`);
console.log(`SEAM-INVITE ${doubleLine === 0 ? 'PASS' : 'FAIL'} (double=${doubleLine}, us=${inviteUs}, me=${inviteMe})`);
