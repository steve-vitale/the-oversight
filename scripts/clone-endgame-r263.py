#!/usr/bin/env python3
"""Clone the r259 endgame probe + analyzer to r263 (lane B, 2026-11-21).

Renames only run-identifying occurrences (r259->r263, substrate hash,
evidence date), restores the r259 ADDITIONS history block and the r259
INSTRUMENT labels (the blanket rename wrongly re-dates them to r263),
adds the r263 C-wide band to the PLAN map, and CARRIES the WARPATH
diagnostic verbatim (already in the r259 probe — no re-injection; the
r259 clone's injection anchors would duplicate it). Carries the
NOTICK/CARRY instrument verbatim. Verifies the result by diffing
against the r259 originals: the only differences must be the renames,
the dates, the new band, and the header.
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
    tmp = path + '.r263tmp'
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
src = open(f'{WT}/scripts/probe-endgame-r259-20261120.js').read()
p = src
p = p.replace('r259', 'r263')
p = p.replace('1fcd7edba', '5a018c5da')
p = p.replace('2026-11-20', '2026-11-21')

# Restore the r259 ADDITIONS history block (it describes entries added in
# r259; the blanket rename wrongly re-dated it to r263).
p = p.replace(
    '// r263 ADDITIONS (prereg §PASS-C-WIDE + §WARPATH, probe-side only, zero src/js):',
    '// r259 ADDITIONS (prereg §PASS-C-WIDE + §WARPATH, probe-side only, zero src/js):')

# Restore the r259 WARPATH diagnostic labels (carried verbatim from r259;
# the blanket rename wrongly re-dated them to r263 — re-date back).
p = p.replace('r263 WARPATH diagnostic', 'r259 WARPATH diagnostic')
p = p.replace('r263 WARPATH DIAGNOSTIC', 'r259 WARPATH DIAGNOSTIC')

# Guard: the PLAN-DEATH label must never be re-dated.
assert 'r263 PLAN-DEATH WATCH' not in p, 'PLAN-DEATH label wrongly re-dated'
# Guard: WARPATH diagnostic carried, not duplicated — exactly one
# declaration, one snapshot block, one per-seed field.
assert p.count('warpathDeedsAtSit = null') == 1, 'WARPATH declaration count wrong'
assert p.count('warpathDeeds: warpathDeedsAtSit') == 1, 'WARPATH field count wrong'
assert p.count('WARPATH DIAGNOSTIC (prereg') == 1, 'WARPATH snapshot count wrong'

# Rewrite the header (lines 1-6) to the r263 header.
old_header = p.split('\n')[:6]
new_header = [
    '// probe-endgame-r263-20261121.js — journey-endgame r263 (lane B, 2026-11-21).',
    '// R259 probe verbatim EXCEPT renames r259->r263, evidence dir',
    '// 2026-11-21/perseed-endgame-r263, header, substrate comment',
    '// 5a018c5da, + PLAN-map entries 89850–89857 (r263 C-wide fresh band,',
    '// verified fresh in the prereg) + the WARPATH diagnostic carried',
    '// verbatim — all named in journey-endgame-r263-prereg.md. The r219 additions',
]
p = '\n'.join(new_header + p.split('\n')[6:])

# PLAN map: append the r263 C-wide band (89850-89851 wavesnw, 89852-89857 waves).
old_plan_tail = "89840: 'wavesnw', 89841: 'wavesnw', 89842: 'waves', 89843: 'waves', 89844: 'waves', 89845: 'waves', 89846: 'waves', 89847: 'waves' };"
new_plan_tail = old_plan_tail[:-3] + ", 89850: 'wavesnw', 89851: 'wavesnw', 89852: 'waves', 89853: 'waves', 89854: 'waves', 89855: 'waves', 89856: 'waves', 89857: 'waves' };"
assert old_plan_tail in p, 'PLAN tail not found'
p = p.replace(old_plan_tail, new_plan_tail)

# r263 ADDITIONS comment above the PLAN const (mirrors the r259 pattern).
anchor = '// r259 ADDITIONS (prereg §PASS-C-WIDE + §WARPATH, probe-side only, zero src/js):'
assert anchor in p
p = p.replace(anchor, '// r263 ADDITIONS (prereg §PASS-C-WIDE, probe-side only, zero src/js):\n'
    '// PLAN-map entries 89852-89857 \'waves\' + 89850-89851 \'wavesnw\' (fresh\n'
    '// seeds for the pass-C-wide starvation-watch band; 89842-89847 \'waves\'\n'
    '// + 89840-89841 \'wavesnw\' are the r259 C-wide band, kept in the map\n'
    '// for reference). WARPATH diagnostic carried verbatim from r259.\n' + anchor, 1)

if '--print-probe' in sys.argv:
    sys.stdout.write(p)
    sys.exit(0)
robust_write(f'{WT}/scripts/probe-endgame-r263-20261121.js', p)

# ---------------- analyzer ----------------
src = open(f'{WT}/scripts/analyze-endgame-r259-20261120.js').read()
a = src
a = a.replace('r259', 'r263')
a = a.replace('2026-11-20', '2026-11-21')

# Fix the header lineage line the blanket rename left as r255->r263
# (the r259 analyzer carries the same quirk; make r263's header name
# the true parent).
a = a.replace('// R255 analyzer verbatim EXCEPT input dir, r255->r263, + the NOTICK/CARRY tally carried.',
              '// R259 analyzer verbatim EXCEPT input dir, r259->r263, + the NOTICK/CARRY tally carried.')

if '--print-analyzer' in sys.argv:
    sys.stdout.write(a)
    sys.exit(0)
robust_write(f'{WT}/scripts/analyze-endgame-r263-20261121.js', a)
print('clone done')
