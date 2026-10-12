#!/usr/bin/env python3
"""Insert the 58 wave 3-5 calm/aggro sprites into sprites.js SPRITES object.
Validates every SVG (parseable XML, 32x32 viewBox, sprite class, no
template-literal hazards) before touching the file."""
import re, sys, xml.etree.ElementTree as ET
sys.path.insert(0, 'scripts')
from sprites_wave3 import W3
from sprites_wave4 import W4
from sprites_wave5 import W5

PATH = 'src/js/sprites.js'
ALL = {}
for d in (W3, W4, W5):
    for k, v in d.items():
        assert k not in ALL, f'duplicate key {k}'
        ALL[k] = v

print(f'total new sprites: {len(ALL)}')
assert len(ALL) == 58, len(ALL)

# ---- validate
for k, svg in sorted(ALL.items()):
    assert '`' not in svg and '${' not in svg, f'{k}: template literal hazard'
    try:
        root = ET.fromstring(svg)
    except Exception as e:
        raise SystemExit(f'{k}: XML parse failed: {e}')
    assert root.get('viewBox') == '0 0 32 32', f'{k}: bad viewBox {root.get("viewBox")}'
    assert root.get('class') == 'sprite', f'{k}: bad class'
    assert root.tag.endswith('svg'), f'{k}: not an svg root'
    assert len(svg) > 150, f'{k}: suspiciously short'
print('all 58 SVGs valid: parseable, 32x32 viewBox, class=sprite')

# ---- calm/aggro pairing + id coverage
ids = sorted(set(k.rsplit('_', 1)[0] for k in ALL))
assert len(ids) == 29, ids
for mid in ids:
    assert f'{mid}_calm' in ALL and f'{mid}_aggro' in ALL, mid
print('29 monsters x calm/aggro confirmed:', ', '.join(ids))

# ---- insert after moderator_aggro (last monster sprite entry)
lines = open(PATH).read().split('\n')
anchor = None
for i, l in enumerate(lines):
    if l.startswith('    moderator_aggro:'):
        anchor = i
        break
assert anchor is not None, 'anchor not found'
assert lines[anchor + 1].strip() == '};', lines[anchor + 1][:60]
# no dupes already present
for mid in ids:
    for l in lines:
        assert not l.startswith(f'    {mid}_calm:'), f'{mid}_calm already present'
        assert not l.startswith(f'    {mid}_aggro:'), f'{mid}_aggro already present'

new_lines = []
for mid in ids:
    for form in ('calm', 'aggro'):
        esc = ALL[f'{mid}_{form}'].replace('"', '\\"')
        new_lines.append(f'    {mid}_{form}: `{esc}`,')
lines[anchor + 1:anchor + 1] = new_lines
open(PATH, 'w').write('\n'.join(lines))
print(f'inserted {len(new_lines)} entries after line {anchor + 1}')
