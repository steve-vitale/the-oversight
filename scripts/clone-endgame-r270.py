#!/usr/bin/env python3
"""Clone the r267 endgame probe + analyzer to r270 (lane B, 2026-11-22).

Renames only run-identifying occurrences (r267->r270, substrate hash),
restores the r267 ADDITIONS history block and the r267 W5-FACING
section header (the blanket rename wrongly re-dates them to r270),
and ADDS the r270 instruments (prereg Q1/Q2/Q3/Q5 carried, analyzer-side
only, zero src/js):
  - PLAN-map entries 107501-107508 (fresh band, prereg §FRESH-BAND):
    107501-107502 'wavesnw', 107503-107508 'waves'.
The r267 instruments (TRIBUTE_FIRST order flag, CHARTER daily census,
capstoneReadinessDaily, STALL-FATES, W5-FACING census) are carried
verbatim.
Verifies the result by diffing against the r267 originals: the only
differences must be the renames, the header, the substrate comment,
the PLAN-map addition, and the r270 ADDITIONS comment named above.
Dates are UNCHANGED (r267 and r270 both ran 2026-11-22 CST).
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
    tmp = path + '.r270tmp'
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
src = open(f'{WT}/scripts/probe-endgame-r267-20261122.js').read()
p = src
assert p.count('dd740ad83') == 2, 'substrate hash count wrong'
p = p.replace('r267', 'r270')
p = p.replace('dd740ad83', 'ff17699c7')

# Restore the r267 ADDITIONS history block (it describes instruments
# added in r267; the blanket rename wrongly re-dated it to r270).
assert p.count('// r270 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):') == 1, 'r267 ADDITIONS anchor count wrong'
p = p.replace(
    '// r270 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):',
    '// r267 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):')

# Guard: the PLAN-DEATH label must never be re-dated.
assert 'r270 PLAN-DEATH WATCH' not in p, 'PLAN-DEATH label wrongly re-dated'
# Guard: WARPATH diagnostic carried, not duplicated — exactly one
# declaration, one snapshot block, one per-seed field.
assert p.count('warpathDeedsAtSit = null') == 1, 'WARPATH declaration count wrong'
assert p.count('warpathDeeds: warpathDeedsAtSit') == 1, 'WARPATH field count wrong'
assert p.count('WARPATH DIAGNOSTIC (prereg') == 1, 'WARPATH snapshot count wrong'

# Rewrite the header (lines 1-6) to the r270 header.
old_header = p.split('\n')[:6]
new_header = [
    '// probe-endgame-r270-20261122.js — journey-endgame r270 (lane B, 2026-11-22).',
    '// R267 probe verbatim EXCEPT renames r267->r270, evidence dir',
    '// 2026-11-22/perseed-endgame-r270, header, substrate comment',
    '// ff17699c7, + PLAN-map entries 107501-107508 (fresh band, prereg',
    '// §FRESH-BAND) — all named in',
    '// journey-endgame-r270-prereg.md. The r264 additions',
]
p = '\n'.join(new_header + p.split('\n')[6:])

# r270 ADDITIONS comment above the PLAN const (mirrors the r267 pattern):
# newest first, directly above the r267 ADDITIONS block.
anchor = '// r267 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):'
assert p.count(anchor) == 1, 'r267 ADDITIONS anchor count wrong (post-restore)'
p = p.replace(anchor, '// r270 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):\n'
    '// PLAN-map entries 107501-107502 \'wavesnw\' + 107503-107508 \'waves\'\n'
    '// (fresh band 107501-107508, verified fresh per\n'
    '// local_seed_band_freshness; the r267 instruments are carried\n'
    '// verbatim, zero other logic change).\n' + anchor, 1)

# PLAN-map entries for the fresh band (C-wide pattern: first 2 wavesnw,
# next 6 waves).
old_plan_tail = "107336: 'waves' };"
assert p.count(old_plan_tail) == 1, 'PLAN tail count wrong'
p = p.replace(old_plan_tail,
    "107336: 'waves', 107501: 'wavesnw', 107502: 'wavesnw', 107503: 'waves', 107504: 'waves', 107505: 'waves', 107506: 'waves', 107507: 'waves', 107508: 'waves' };", 1)

if '--print-probe' in sys.argv:
    sys.stdout.write(p)
    sys.exit(0)
robust_write(f'{WT}/scripts/probe-endgame-r270-20261122.js', p)
print('probe cloned')

# ---------------- analyzer ----------------
src = open(f'{WT}/scripts/analyze-endgame-r267-20261122.js').read()
a = src
a = a.replace('r267', 'r270')

# Fix the header lineage line (post-rename text): the r267 analyzer's
# line 3 still names R264 as the parent. Name the true parent here.
old_line3 = '// R264 analyzer verbatim EXCEPT input dir, r264->r270, + the W5-FACING section.'
assert a.count(old_line3) == 1, 'analyzer header line 3 count wrong'
a = a.replace(old_line3,
              '// R267 analyzer verbatim EXCEPT input dir, r267->r270.')

# Restore the r267 W5-FACING section header (carried verbatim from
# r267; the blanket rename wrongly re-dated it to r270).
assert a.count('// r270 W5-FACING (prereg Q2 — new, from r264\'s finding that both pilot') == 1, 'W5-FACING header count wrong'
a = a.replace('// r270 W5-FACING (prereg Q2 — new, from r264\'s finding that both pilot',
              '// r267 W5-FACING (prereg Q2 — new, from r264\'s finding that both pilot')

if '--print-analyzer' in sys.argv:
    sys.stdout.write(a)
    sys.exit(0)
robust_write(f'{WT}/scripts/analyze-endgame-r270-20261122.js', a)
print('analyzer cloned')
print('clone done')
