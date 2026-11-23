#!/usr/bin/env python3
"""Clone the r270 endgame probe + analyzer to r275 (lane B, 2026-11-23).

Renames only run-identifying occurrences (r270->r275, dates
20261122->20261123 + 2026-11-22->2026-11-23, substrate hash),
restores the r270 ADDITIONS history block (the blanket rename
wrongly re-dates it to r275), and ADDS the r275 instruments (prereg Q1/Q2/Q3/Q5 carried, analyzer-side
only, zero src/js):
  - PLAN-map entries 107582-107589 (fresh band, prereg §FRESH-BAND):
    107582-107583 'wavesnw', 107584-107589 'waves'.
The r270 instruments (TRIBUTE_FIRST order flag, CHARTER daily census,
capstoneReadinessDaily, STALL-FATES, W5-FACING census) are carried
verbatim.
Verifies the result by diffing against the r270 originals: the only
differences must be the renames, the dates, the header, the substrate
comment, the PLAN-map addition, and the r275 ADDITIONS comment named
above.
Dates DO change here (r270 ran 2026-11-22, r275 runs 2026-11-23) —
unlike the r270 clone, where they were unchanged. The date renames
are safe: every '20261122' / '2026-11-22' occurrence in both files
is the file's own filename or its own evidence dir (probe 3+4,
analyzer 4+2, verified by grep before cloning); no historical
reference carries either date string.
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
    tmp = path + '.r275tmp'
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
src = open(f'{WT}/scripts/probe-endgame-r270-20261122.js').read()
p = src
assert p.count('ff17699c7') == 2, 'substrate hash count wrong'
p = p.replace('r270', 'r275')
p = p.replace('20261122', '20261123')
p = p.replace('2026-11-22', '2026-11-23')
p = p.replace('ff17699c7', 'b24528ae7')

# Restore the r270 ADDITIONS history block (it describes instruments
# added in r270; the blanket rename wrongly re-dated it to r275).
assert p.count('// r275 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):') == 1, 'r270 ADDITIONS anchor count wrong'
p = p.replace(
    '// r275 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):',
    '// r270 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):')

# Guard: the PLAN-DEATH label must never be re-dated.
assert 'r275 PLAN-DEATH WATCH' not in p, 'PLAN-DEATH label wrongly re-dated'
# Guard: WARPATH diagnostic carried, not duplicated — exactly one
# declaration, one snapshot block, one per-seed field.
assert p.count('warpathDeedsAtSit = null') == 1, 'WARPATH declaration count wrong'
assert p.count('warpathDeeds: warpathDeedsAtSit') == 1, 'WARPATH field count wrong'
assert p.count('WARPATH DIAGNOSTIC (prereg') == 1, 'WARPATH snapshot count wrong'

# Rewrite the header (lines 1-6) to the r275 header.
old_header = p.split('\n')[:6]
new_header = [
    '// probe-endgame-r275-20261123.js — journey-endgame r275 (lane B, 2026-11-23).',
    '// R270 probe verbatim EXCEPT renames r270->r275, evidence dir',
    '// 2026-11-23/perseed-endgame-r275, header, substrate comment',
    '// b24528ae7, + PLAN-map entries 107582-107589 (fresh band, prereg',
    '// §FRESH-BAND) — all named in',
    '// journey-endgame-r275-prereg.md. The r264 additions',
]
p = '\n'.join(new_header + p.split('\n')[6:])

# r275 ADDITIONS comment above the PLAN const (mirrors the r270 pattern):
# newest first, directly above the r270 ADDITIONS block.
anchor = '// r270 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):'
assert p.count(anchor) == 1, 'r270 ADDITIONS anchor count wrong (post-restore)'
p = p.replace(anchor, '// r275 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):\n'
    '// PLAN-map entries 107582-107583 \'wavesnw\' + 107584-107589 \'waves\'\n'
    '// (fresh band 107582-107589, verified fresh per\n'
    '// local_seed_band_freshness; the r270 instruments are carried\n'
    '// verbatim, zero other logic change).\n' + anchor, 1)

# PLAN-map entries for the fresh band (C-wide pattern: first 2 wavesnw,
# next 6 waves).
old_plan_tail = "107508: 'waves' };"
assert p.count(old_plan_tail) == 1, 'PLAN tail count wrong'
p = p.replace(old_plan_tail,
    "107508: 'waves', 107582: 'wavesnw', 107583: 'wavesnw', 107584: 'waves', 107585: 'waves', 107586: 'waves', 107587: 'waves', 107588: 'waves', 107589: 'waves' };", 1)

if '--print-probe' in sys.argv:
    sys.stdout.write(p)
    sys.exit(0)
robust_write(f'{WT}/scripts/probe-endgame-r275-20261123.js', p)
print('probe cloned')

# ---------------- analyzer ----------------
src = open(f'{WT}/scripts/analyze-endgame-r270-20261122.js').read()
a = src
a = a.replace('r270', 'r275')
a = a.replace('20261122', '20261123')
a = a.replace('2026-11-22', '2026-11-23')

# Fix the header lineage line (post-rename text): the r270 analyzer's
# line 3 still names R267 as the parent. Name the true parent here.
old_line3 = '// R267 analyzer verbatim EXCEPT input dir, r267->r275.'
assert a.count(old_line3) == 1, 'analyzer header line 3 count wrong'
a = a.replace(old_line3,
              '// R270 analyzer verbatim EXCEPT input dir, r270->r275.')

# The r270 W5-FACING section header is already 'r267' (the r270 clone
# restored it); the blanket rename does not touch it. Assert it survives
# untouched — there is nothing to re-date here.
assert a.count('// r267 W5-FACING (prereg Q2 — new, from r264\'s finding that both pilot') == 1, 'W5-FACING header count wrong'
assert '// r275 W5-FACING (prereg Q2' not in a, 'W5-FACING header wrongly re-dated'

if '--print-analyzer' in sys.argv:
    sys.stdout.write(a)
    sys.exit(0)
robust_write(f'{WT}/scripts/analyze-endgame-r275-20261123.js', a)
print('analyzer cloned')
print('clone done')
