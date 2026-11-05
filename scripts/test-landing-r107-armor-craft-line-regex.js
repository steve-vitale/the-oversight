// Proof test for the r107 R69 ARMOR instrument fix (driver-only, zero src/js):
//   The R69 line-scan counted armor-craft attempts two ways: armor_craft
//   telemetry events (typed, armor only) vs narration lines matched by
//   regex. The old fail regex /came apart in their hands/ matched THREE
//   different craft systems in src/js/villager-build.js — armor fail (1211),
//   weapon fail (1374) and ammo fail (1531) — so craftLinesFail counted
//   weapon+ammo failures while craftTeleFail counted armor only. The r107
//   panel showed the disagreement on 9/10 seeds (e.g. seed 1004: tele
//   0ok/2fail vs lines 0ok/6fail). The fix narrows the fail regex to the
//   armor line's distinctive wording ("spent the afternoon sewing").
// Usage: node scripts/test-landing-r107-armor-craft-line-regex.js [driver.js]
//   Defaults to scripts/journey-landing-r108-20261105.js (the fixed driver).
//   Exits 0 with PASS on the fixed driver; exits 1 (FAIL) on the r107
//   driver, which is the before/after proof.
const fs = require('fs');
const path = require('path');
const driverPath = process.argv[2] || path.join(__dirname, 'journey-landing-r108-20261105.js');
const src = fs.readFileSync(driverPath, 'utf8');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'ok' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };

// Extract the two R69 line-scan regexes from the driver under test.
function extractRegex(marker) {
  const line = src.split('\n').find(l => l.includes(marker));
  if (!line) return null;
  const m = line.match(/if \(\/(.+)\/\.test\(s\)\)/);
  return m ? new RegExp(m[1]) : null;
}
const okRe = extractRegex('MET.armorCraftLinesOk++');
const failRe = extractRegex('MET.armorCraftLinesFail++');
check('ok regex extracted from driver', !!okRe, okRe ? String(okRe) : 'not found');
check('fail regex extracted from driver', !!failRe, failRe ? String(failRe) : 'not found');
if (!okRe || !failRe) { console.log('ARMOR-CRAFT-LINE-REGEX: FAIL'); process.exit(1); }

// Known lines, verbatim from src/js/villager-build.js (names filled in).
const lines = {
  armorFail: 'Brian spent the afternoon sewing, and the Bark Vest came apart in their hands. The bark strips are wasted.',
  weaponFail: 'Brian spent the afternoon at the workbench, and the Stone Spear came apart in their hands. The materials are wasted.',
  ammoFail: 'Brian spent the afternoon at the workbench, and the Crossbow bolt came apart in their hands. The materials are wasted.',
  armorOk: 'Brian spent the afternoon at the workbench and sewed a Bark Vest that holds together. Brian wears it now.',
  weaponOk: '🗡️ Brian spent the afternoon at the workbench and made a Stone Spear — and carries it now, their own work in their own hands.',
  ammoOk: 'Brian spent the afternoon at the workbench and made 5 Crossbow bolt — and carries them now, their own work in their own hands.',
};
check('fail regex matches the ARMOR fail line', failRe.test(lines.armorFail));
check('fail regex does NOT match the WEAPON fail line', !failRe.test(lines.weaponFail));
check('fail regex does NOT match the AMMO fail line', !failRe.test(lines.ammoFail));
check('ok regex matches the ARMOR ok line', okRe.test(lines.armorOk));
check('ok regex does NOT match the WEAPON ok line', !okRe.test(lines.weaponOk));
check('ok regex does NOT match the AMMO ok line', !okRe.test(lines.ammoOk));
// The bug, demonstrated: the old broad regex matched all three fails.
check('old broad regex would match all three fails (bug demo)', /came apart in their hands/.test(lines.armorFail) && /came apart in their hands/.test(lines.weaponFail) && /came apart in their hands/.test(lines.ammoFail));
console.log(fail === 0 ? 'ARMOR-CRAFT-LINE-REGEX: PASS' : 'ARMOR-CRAFT-LINE-REGEX: FAIL');
process.exit(fail === 0 ? 0 : 1);
