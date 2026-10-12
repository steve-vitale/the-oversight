#!/usr/bin/env python3
"""Visual proof: a size-3 Eater on a 9x9 grid with the sprite spanning its
3x3 footprint exactly as the .multitile CSS lays out (anchor top-left,
sprite at 300% of cell size). Also a size-2 bulldozer aggro for scale."""
import re, io
import cairosvg
from PIL import Image

JS = open('src/js/sprites.js').read()
def get_svg(key):
    m = re.search(r'^    ' + re.escape(key) + r': `(.*?)`,$', JS, re.M | re.S)
    assert m, key
    return m.group(1).replace('\\"', '"')

CELL = 64
W = H = CELL * 9
img = Image.new('RGB', (W, H + 40), '#101018')
from PIL import ImageDraw
d = ImageDraw.Draw(img)
# grid
for y in range(9):
    for x in range(9):
        d.rectangle([x*CELL, y*CELL, (x+1)*CELL, (y+1)*CELL],
                    fill='#1a2f1a', outline='#2a3f2a')
# eater aggro size 3 anchored at (2,2): sprite spans 3x3
svg = get_svg('eater_aggro')
png = cairosvg.svg2png(bytestring=svg.encode(), output_width=CELL*3, output_height=CELL*3)
sp = Image.open(io.BytesIO(png)).convert('RGBA')
img.paste(sp, (2*CELL, 2*CELL), sp)
# anchor marker
d.rectangle([2*CELL, 2*CELL, 2*CELL+6, 2*CELL+6], fill='#ffd54d')
# bulldozer aggro size 2 anchored at (6,5)
svg2 = get_svg('bulldozer_aggro')
png2 = cairosvg.svg2png(bytestring=svg2.encode(), output_width=CELL*2, output_height=CELL*2)
sp2 = Image.open(io.BytesIO(png2)).convert('RGBA')
img.paste(sp2, (6*CELL, 5*CELL), sp2)
d.rectangle([6*CELL, 5*CELL, 6*CELL+6, 5*CELL+6], fill='#ffd54d')
d.text((8, H+8), 'size-3 Eater (2,2) + size-2 Bulldozer (6,5) — one sprite per body, spanning (yellow = anchor)',
       fill='#c9c9d4')
img.save('evidence/2026-10-12/multitile-span-proof.png')
print('wrote evidence/2026-10-12/multitile-span-proof.png', img.size)
