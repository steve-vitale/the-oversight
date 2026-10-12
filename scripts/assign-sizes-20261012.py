#!/usr/bin/env python3
"""Surgical size assignment for monsters.json — inserts "size" right after
each entry's "id" line (pure insertion, zero deletions, so the stale-revert
guard in safe-commit.sh stays quiet). All other bytes preserved exactly."""
import re, json

PATH = 'src/data/monsters.json'

SIZE3 = {'finale', 'nielsen', 'herald', 'eater', 'strike', 'suburb'}
SIZE2 = {'bulldozer', 'moderator', 'gavel', 'focus_group', 'spool',
         'chorus_line', 'terms_of_service', 'ad_break', 'congregation',
         'influencer', 'reunion', 'eulogy', 'algorithm', 'cancellation',
         'editor', 'spoiler', 'timeslot', 'finale_crew', 'finale_opening'}

def size_for(mid):
    return 3 if mid in SIZE3 else (2 if mid in SIZE2 else 1)

lines = open(PATH).read().split('\n')
out, count, have = [], 0, []
for i, l in enumerate(lines):
    out.append(l)
    m = re.match(r'^    "id": "([^"]+)",$', l)
    if not m:
        continue
    mid = m.group(1)
    j = i + 1
    has = False
    while j < len(lines) and not re.match(r'^  \},?$', lines[j]):
        if re.match(r'^    "size": \d+,?$', lines[j]):
            has = True
            break
        j += 1
    if has:
        have.append(mid)
    else:
        out.append(f'    "size": {size_for(mid)},')
        count += 1
open(PATH, 'w').write('\n'.join(out))
print('inserted:', count, '| already had:', sorted(have))

m = json.load(open(PATH))
bad = [x['id'] for x in m if not isinstance(x.get('size'), int) or not (1 <= x['size'] <= 3)]
assert not bad and len(m) == 59, bad
s3 = sorted(x['id'] for x in m if x['size'] == 3)
s2 = sorted(x['id'] for x in m if x['size'] == 2)
assert set(s3) == SIZE3 and set(s2) == SIZE2, (s3, s2)
print('size3:', s3)
print('size2:', s2)
print('OK — all 59 entries have sane sizes')
