#!/usr/bin/env python3
"""Render a contact sheet of the 58 new wave 3-5 sprites (calm/aggro pairs)
on dark grid-tile backgrounds, like they'd sit on the game grid."""
import re, io
import cairosvg
from PIL import Image

JS = open('src/js/sprites.js').read()
NEW_IDS = ['redactor','gavel','focus_group','spool','chorus_line',
    'terms_of_service','callback','buffering','ad_break','congregation',
    'strike','influencer','audit','reunion','suburb','eulogy','algorithm',
    'eater','cancellation','editor','rerun','spoiler','timeslot','nielsen',
    'finale','finale_crew','finale_opening','network_note','herald']

def get_svg(key):
    # find `    <key>: `<svg ...>`,`
    m = re.search(r'^    ' + re.escape(key) + r': `(.*?)`,$', JS, re.M | re.S)
    assert m, key
    return m.group(1).replace('\\"', '"')

CELL, PAD, COLS = 96, 8, 6
rows = (len(NEW_IDS) * 2 + COLS - 1) // COLS
W = COLS * (CELL + PAD) + PAD
H = rows * (CELL + PAD + 16) + PAD
sheet = Image.new('RGB', (W, H), '#101018')
from PIL import ImageDraw
d = ImageDraw.Draw(sheet)

for i, mid in enumerate(NEW_IDS):
    for j, form in enumerate(('calm', 'aggro')):
        idx = i * 2 + j
        r, c = divmod(idx, COLS)
        x = PAD + c * (CELL + PAD)
        y = PAD + r * (CELL + PAD + 16)
        d.rectangle([x, y, x + CELL, y + CELL], fill='#1a2f1a')  # grass tile
        d.rectangle([x, y, x + CELL, y + CELL], outline='#2a3f2a')
        svg = get_svg(f'{mid}_{form}')
        png = cairosvg.svg2png(bytestring=svg.encode(), write_to=None,
                               output_width=CELL, output_height=CELL)
        img = Image.open(io.BytesIO(png)).convert('RGBA')
        sheet.paste(img, (x, y), img)
        d.text((x + 3, y + CELL + 2), f'{mid[:14]} {form}',
               fill='#ffd54d' if form == 'aggro' else '#9adc9a')

sheet.save('evidence/2026-10-12/sprite-contact-sheet.png')
print('wrote evidence/2026-10-12/sprite-contact-sheet.png', sheet.size)
