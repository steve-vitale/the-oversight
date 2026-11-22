#!/usr/bin/env python3
"""Clone the r264 endgame probe + analyzer to r267 (lane B, 2026-11-22).

Renames only run-identifying occurrences (r264->r267, substrate hash,
dates), restores the r264 ADDITIONS history block and the r264
INSTRUMENT labels (the blanket rename wrongly re-dates them to r267),
and ADDS the r267 instruments (prereg Q2, analyzer-side only, zero
src/js):
  - W5-FACING census (Q2): distinct wave-5 types faced per seed that
    reaches the table, from the existing w5FaceEvents/facedIds fields
    (W5-question rows) — no probe change.
  - PLAN-map entries 107329-107336 (fresh band, prereg §FRESH-BAND):
    107329-107330 'wavesnw', 107331-107336 'waves'.
The r264 instruments (TRIBUTE_FIRST order flag, CHARTER daily census,
capstoneReadinessDaily, STALL-FATES) are carried verbatim.
Verifies the result by diffing against the r264 originals: the only
differences must be the renames, the dates, the header, the PLAN-map
addition, and the W5-FACING section named above.
"""
import re
import sys
import os
import time

WT = '/home/hatch/workspace/worktrees/journey2-endgame'


def robust_write(path, content):
    """Write content to path, retrying through write-flap flicker.

    The flap denies fresh-file writes intermittently (EPERM, second
    granularity). Write to a sibling temp file, verify the byte count,
    then rename into place. Retry up to 150 times (~5 min, 2s cadence —
    the denial flickers, so sample densely) before giving up.
    Byte count uses len(content.encode('utf-8')) — the r246 adoption
    fix: len(content) counts characters, and the probe has non-ASCII
    bytes, so a char-count check fails every write.
    """
    tmp = path + '.r267tmp'
    last_err = None
    for attempt in range(150):
        try:
            with open(tmp, 'w') as f:
                f.write(content)
            got = os.path.getsize(tmp)
            if got != len(content.encode('utf-8')):
                raise IOError(f'short write: {got} != {len(content.encode("utf-8"))} bytes')
            os.rename(tmp, path)
            return
        except (PermissionError, OSError) as e:
            last_err = e
            try:
                if os.path.exists(tmp):
                    os.remove(tmp)
            except OSError:
                pass
            time.sleep(2)
    raise last_err


# ---------------- probe ----------------
src = open(f'{WT}/scripts/probe-endgame-r264-20261121.js').read()
p = src
p = p.replace('r264', 'r267')
p = p.replace('c55bc8503', 'dd740ad83')
p = p.replace('2026-11-21', '2026-11-22')
p = p.replace('20261121', '20261122')

# Restore the r264 ADDITIONS history block (it describes instruments
# added in r264; the blanket rename wrongly re-dated it to r267).
assert p.count('// r267 ADDITIONS (prereg Q2/Q3, probe-side only, zero src/js):') == 1, 'r264 ADDITIONS anchor count wrong'
p = p.replace(
    '// r267 ADDITIONS (prereg Q2/Q3, probe-side only, zero src/js):',
    '// r264 ADDITIONS (prereg Q2/Q3, probe-side only, zero src/js):')

# Restore the r264 instrument labels (carried verbatim from r264; the
# blanket rename wrongly re-dated them to r267).
assert p.count('// r267 Q2: tribute jumps the delivery queue when ready+payable') == 1, 'TRIBUTE_FIRST flag label count wrong'
p = p.replace('// r267 Q2: tribute jumps the delivery queue when ready+payable',
              '// r264 Q2: tribute jumps the delivery queue when ready+payable')
assert p.count('// r267 Q3: per-kind readiness + hierarchy snapshot on EVERY peak>=3 day') == 1, 'readinessDaily label count wrong'
p = p.replace('// r267 Q3: per-kind readiness + hierarchy snapshot on EVERY peak>=3 day',
              '// r264 Q3: per-kind readiness + hierarchy snapshot on EVERY peak>=3 day')
assert p.count('// r267 CHARTER CENSUS (prereg Q3): save the per-kind readiness on') == 1, 'CHARTER CENSUS label count wrong'
p = p.replace('// r267 CHARTER CENSUS (prereg Q3): save the per-kind readiness on',
              '// r264 CHARTER CENSUS (prereg Q3): save the per-kind readiness on')
assert p.count('// r267 TRIBUTE-FIRST (prereg Q2): when TRIBUTE_FIRST=1, a') == 1, 'TRIBUTE-FIRST label count wrong'
p = p.replace('// r267 TRIBUTE-FIRST (prereg Q2): when TRIBUTE_FIRST=1, a',
              '// r264 TRIBUTE-FIRST (prereg Q2): when TRIBUTE_FIRST=1, a')

# Guard: the PLAN-DEATH label must never be re-dated.
assert 'r267 PLAN-DEATH WATCH' not in p, 'PLAN-DEATH label wrongly re-dated'
# Guard: WARPATH diagnostic carried, not duplicated — exactly one
# declaration, one snapshot block, one per-seed field.
assert p.count('warpathDeedsAtSit = null') == 1, 'WARPATH declaration count wrong'
assert p.count('warpathDeeds: warpathDeedsAtSit') == 1, 'WARPATH field count wrong'
assert p.count('WARPATH DIAGNOSTIC (prereg') == 1, 'WARPATH snapshot count wrong'

# Rewrite the header (lines 1-6) to the r267 header.
old_header = p.split('\n')[:6]
new_header = [
    '// probe-endgame-r267-20261122.js — journey-endgame r267 (lane B, 2026-11-22).',
    '// R264 probe verbatim EXCEPT renames r264->r267, evidence dir',
    '// 2026-11-22/perseed-endgame-r267, header, substrate comment',
    '// dd740ad83, + PLAN-map entries 107329-107336 (fresh band, prereg',
    '// §FRESH-BAND) — all named in',
    '// journey-endgame-r267-prereg.md. The r264 additions',
]
p = '\n'.join(new_header + p.split('\n')[6:])

# r267 ADDITIONS comment above the PLAN const (mirrors the r264 pattern):
# newest first, directly above the r264 ADDITIONS block.
anchor = '// r264 ADDITIONS (prereg Q2/Q3, probe-side only, zero src/js):'
assert p.count(anchor) == 1, 'r264 ADDITIONS anchor count wrong (post-restore)'
p = p.replace(anchor, '// r267 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):\n'
    '// PLAN-map entries 107329-107330 \'wavesnw\' + 107331-107336 \'waves\'\n'
    '// (fresh band 107329-107336, verified fresh per\n'
    '// local_seed_band_freshness; the r264 instruments are carried\n'
    '// verbatim, zero other logic change).\n' + anchor, 1)

# PLAN-map entries for the fresh band (C-wide pattern: first 2 wavesnw,
# next 6 waves).
old_plan_tail = "89857: 'waves' };"
assert p.count(old_plan_tail) == 1, 'PLAN tail count wrong'
p = p.replace(old_plan_tail,
    "89857: 'waves', 107329: 'wavesnw', 107330: 'wavesnw', 107331: 'waves', 107332: 'waves', 107333: 'waves', 107334: 'waves', 107335: 'waves', 107336: 'waves' };", 1)

if '--print-probe' in sys.argv:
    sys.stdout.write(p)
    sys.exit(0)
robust_write(f'{WT}/scripts/probe-endgame-r267-20261122.js', p)
print('probe cloned')

# ---------------- analyzer ----------------
src = open(f'{WT}/scripts/analyze-endgame-r264-20261121.js').read()
a = src
a = a.replace('r264', 'r267')
a = a.replace('c55bc8503', 'dd740ad83')
a = a.replace('2026-11-21', '2026-11-22')
a = a.replace('20261121', '20261122')

# Fix the header lineage line (post-rename text): the r264 analyzer's
# line 3 still names R259 as the parent (the r264 clone's fix silently
# missed — its target string did not match). Name the true parent here.
old_line3 = '// R259 analyzer verbatim EXCEPT input dir, r259->r267, + the NOTICK/CARRY tally carried. The M23b'
assert a.count(old_line3) == 1, 'analyzer header line 3 count wrong'
a = a.replace(old_line3,
              '// R264 analyzer verbatim EXCEPT input dir, r264->r267, + the W5-FACING section.')

# Restore the r264 section headers (carried verbatim from r264; the
# blanket rename wrongly re-dated them to r267).
assert a.count('// r267 STALL-FATES (prereg Q1') == 1, 'STALL-FATES header count wrong'
a = a.replace('// r267 STALL-FATES (prereg Q1', '// r264 STALL-FATES (prereg Q1')
assert a.count('// r267 TRIBUTE-FIRST (prereg Q2)') == 1, 'TRIBUTE-FIRST header count wrong'
a = a.replace('// r267 TRIBUTE-FIRST (prereg Q2)', '// r264 TRIBUTE-FIRST (prereg Q2)')
assert a.count('// r267 CHARTER-CENSUS (prereg Q3)') == 1, 'CHARTER-CENSUS header count wrong'
a = a.replace('// r267 CHARTER-CENSUS (prereg Q3)', '// r264 CHARTER-CENSUS (prereg Q3)')
# Restore the r264 gated helper name (definition + its one use).
assert a.count('r267gatedOf') == 2, 'r264gatedOf count wrong'
a = a.replace('r267gatedOf', 'r264gatedOf')

# --- r267 section: W5-FACING, inserted after the CHARTER-CENSUS verdict,
# before the STARVATION anchor (same anchor the r264 clone used) ---
old_starv = "// R185 STARVATION WATCH (prereg §PASS-C-WIDE; printed on every pass,"
assert a.count(old_starv) == 1, 'STARVATION anchor count wrong'
section = r'''
// r267 W5-FACING (prereg Q2 — new, from r264's finding that both pilot
// seeds faced only 1 of 2 wave-5 types, so the deed gate stayed shut
// even after the stall unblocked): distinct wave-5 types faced per seed
// that reaches the table (announced), from the W5-question rows above
// (facedIds = distinct w5FaceEvents ids). The deed gate needs w5>=2
// distinct types faced; this census names whether the gate's w5 bar is
// the binding constraint. Descriptive — no bar; the verdict is
// instrument completeness (every announced seed classified), ok=true
// always like TRIBUTE-FIRST's VOID pattern.
const w5fRows = w5rows.filter(x => (recs.find(r => r.seed === x.seed) || {}).announceDay != null);
const w5fDist = {};
for (const x of w5fRows) w5fDist[x.facedIds.length] = (w5fDist[x.facedIds.length] || 0) + 1;
const w5fGateOpen = w5fRows.filter(x => x.facedIds.length >= 2).length;
verdict('W5-FACING', true,
  w5fRows.length === 0 ? 'VACUOUS: no seed reached the table — nothing to census'
  : `${w5fRows.length} seeds reached the table, distinct w5 types faced distribution ${JSON.stringify(w5fDist)}; w5>=2 (deed-gate bar) ${w5fGateOpen}/${w5fRows.length} — ` +
    w5fRows.map(x => `${x.seed}:uw${x.uw} faced=${x.facedIds.length}[${x.facedIds.join(',') || 'none'}] sat=${((recs.find(r => r.seed === x.seed) || {}).satSeatKind) || '—'}`).join(' | '));

'''
a = a.replace(old_starv, section + old_starv, 1)

# Append the new id to primaryIds.
old_primary_tail = "'CHARTER-CENSUS'];";
assert a.count(old_primary_tail) == 1, 'primaryIds tail count wrong'
a = a.replace(old_primary_tail, "'CHARTER-CENSUS', 'W5-FACING'];", 1)

if '--print-analyzer' in sys.argv:
    sys.stdout.write(a)
    sys.exit(0)
robust_write(f'{WT}/scripts/analyze-endgame-r267-20261122.js', a)
print('analyzer cloned')
print('clone done')
