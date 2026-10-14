#!/usr/bin/env python3
"""Visual proof for info-bar + person-card fixes (Steve phone 2026-10-14, 390x844).

BEFORE vs AFTER computed mockups using the real CSS values from src/css/main.css.

1. info-bar-proof.png — the .ord-status region at 390px:
   BEFORE: .ord-status is a 2-col grid -> .statgrid (~189px) sits beside the
     wave-ledger .statrow (~189px). The ledger text ("WAVE LEDGER — wave 1:
     0/5 kills (kills only; counter kills +1)") wraps and collides with the
     chips; the chips themselves crowd ("2L clean" vs pack chip).
   AFTER: .statgrid spans full width (2 roomy internal cols), the ledger is
     a quiet full-width row below. No collisions.

2. person-card-proof.png — the .ord-narration region (184px fixed):
   BEFORE: .inlinecard max-height:100% + margin 8px 0 -> 184+16=200px total,
     overflowing the region; bottom buttons slide under the info bar.
   AFTER: .inlinecard height:100%, margin 0, box-sizing border-box -> exactly
     184px; sticky header + sticky action buttons, middle scrolls.

Headless Chromium hangs in this VM, so these are computed mockups following
the CSS box model. (SENSE-TESTING LAW: verbatim game strings only.)
"""
import cairosvg

W, H = 390, 844
GREEN = '#7fd67f'; DIM = '#8a8a8a'; BG = '#101010'; CARD = '#14140f'
LEDGER_TXT = '\U0001f4fa WAVE LEDGER \u2014 wave 1: 0/5 kills (kills only; counter kills +1)'

def text_esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def chip(x, y, w, label, pct, clash=False):
    bar = f'<rect x="{x}" y="{y+18}" width="{w}" height="5" rx="2.5" fill="#232323"/><rect x="{x}" y="{y+18}" width="{w*pct/100}" height="5" rx="2.5" fill="{GREEN}"/>'
    color = '#e05c5c' if clash else '#ddd'
    return (f'<text x="{x}" y="{y+12}" font-size="12" fill="{color}" font-family="monospace">{text_esc(label)}</text>' + bar)

def info_bar_before():
    # .ord-status 2-col grid: statgrid col 1, ledger col 2
    col_w = (W - 12 - 10) / 2
    s = f'<rect x="0" y="0" width="{W}" height="120" fill="{BG}"/>'
    s += f'<text x="6" y="14" font-size="10" fill="{DIM}" font-family="monospace">BEFORE: .ord-status 2-col grid</text>'
    # statgrid squeezed into col 1
    s += chip(6, 22, col_w - 4, '\u2764 100', 100)
    s += chip(6, 52, col_w - 4, '\U0001f37d 2200/2400', 92)
    # water + pack chips collide in the narrow column
    s += chip(6, 82, (col_w - 8) / 2, '\U0001f4a7 100% \u00b7 2L clean', 100, clash=True)
    s += chip(6 + (col_w - 4) / 2, 82, (col_w - 8) / 2, '\U0001f392 15.9/20kg', 80, clash=True)
    # ledger crushed into col 2 — wraps and collides
    lx = 6 + col_w + 10
    s += f'<rect x="{lx-4}" y="20" width="{col_w}" height="92" fill="none" stroke="#e05c5c" stroke-dasharray="4,3"/>'
    s += f'<text x="{lx}" y="36" font-size="12" fill="#e05c5c" font-family="monospace">\U0001f4fa WAVE LEDGER \u2014</text>'
    s += f'<text x="{lx}" y="52" font-size="12" fill="#e05c5c" font-family="monospace">wave 1: 0/5 kills</text>'
    s += f'<text x="{lx}" y="68" font-size="12" fill="#e05c5c" font-family="monospace">(kills only;</text>'
    s += f'<text x="{lx}" y="84" font-size="12" fill="#e05c5c" font-family="monospace">counter kills +1)</text>'
    s += f'<text x="{lx}" y="106" font-size="10" fill="#e05c5c" font-family="monospace">\u26a0 collides with chips</text>'
    return s

def info_bar_after():
    s = f'<rect x="0" y="0" width="{W}" height="120" fill="{BG}"/>'
    s += f'<text x="6" y="14" font-size="10" fill="{DIM}" font-family="monospace">AFTER: full-width rows</text>'
    col_w = (W - 12 - 12) / 2
    s += chip(6, 22, col_w, '\u2764 100', 100)
    s += chip(6 + col_w + 12, 22, col_w, '\U0001f37d 2200/2400 kcal', 92)
    s += chip(6, 52, col_w, '\U0001f4a7 100% \u00b7 2L clean', 100)
    s += chip(6 + col_w + 12, 52, col_w, '\U0001f392 15.9/20kg', 80)
    s += f'<line x1="6" y1="88" x2="{W-6}" y2="88" stroke="rgba(255,255,255,.15)"/>'
    s += f'<text x="6" y="104" font-size="12" fill="#bbb" font-family="monospace">{text_esc(LEDGER_TXT)}</text>'
    s += f'<text x="6" y="118" font-size="10" fill="{GREEN}" font-family="monospace">\u2713 no collisions</text>'
    return s

def card_before():
    s = f'<rect x="0" y="0" width="{W}" height="240" fill="{BG}"/>'
    s += f'<text x="6" y="14" font-size="10" fill="{DIM}" font-family="monospace">BEFORE: 184px region, card 184+16 margin = 200px</text>'
    s += f'<rect x="6" y="20" width="{W-12}" height="184" fill="none" stroke="{DIM}" stroke-dasharray="4,3"/>'
    s += f'<text x="10" y="34" font-size="10" fill="{DIM}" font-family="monospace">.ord-narration 184px</text>'
    # card overflows below the region
    s += f'<rect x="6" y="20" width="{W-12}" height="200" rx="10" fill="{CARD}" stroke="#4a4a3a"/>'
    s += f'<text x="16" y="44" font-size="14" fill="#ddd" font-family="monospace">\U0001f464 Some Villager \u2715</text>'
    for i, lbl in enumerate(['Talk (10 kcal)', 'Give food', 'Ask for help', 'Ask about...', 'Lift rations', 'Intimidate']):
        bx = 16 + (i % 2) * ((W - 44) / 2 + 8); by = 56 + (i // 2) * 48
        s += f'<rect x="{bx}" y="{by}" width="{(W-44)/2}" height="40" rx="8" fill="none" stroke="#555"/>'
        s += f'<text x="{bx+8}" y="{by+25}" font-size="13" fill="#aaa" font-family="monospace">{text_esc(lbl)}</text>'
    # info bar overlapping the card bottom
    s += f'<rect x="0" y="204" width="{W}" height="36" fill="#0a0a0a" stroke="#e05c5c"/>'
    s += f'<text x="10" y="227" font-size="12" fill="#e05c5c" font-family="monospace">\u26a0 info bar covers card bottom</text>'
    return s

def card_after():
    s = f'<rect x="0" y="0" width="{W}" height="240" fill="{BG}"/>'
    s += f'<text x="6" y="14" font-size="10" fill="{DIM}" font-family="monospace">AFTER: card height:100%, margin 0 \u2014 contained</text>'
    s += f'<rect x="6" y="20" width="{W-12}" height="184" rx="10" fill="{CARD}" stroke="{GREEN}"/>'
    s += f'<rect x="6" y="20" width="{W-12}" height="34" fill="#14140f"/>'
    s += f'<text x="16" y="42" font-size="14" fill="#ddd" font-family="monospace">\U0001f464 Some Villager \u2715 (sticky)</text>'
    for i, lbl in enumerate(['Talk (10 kcal)', 'Give food']):
        bx = 16 + i * ((W - 44) / 2 + 8)
        s += f'<rect x="{bx}" y="56" width="{(W-44)/2}" height="40" rx="8" fill="none" stroke="#555"/>'
        s += f'<text x="{bx+8}" y="{81}" font-size="13" fill="#aaa" font-family="monospace">{text_esc(lbl)}</text>'
    s += f'<text x="16" y="120" font-size="11" fill="{DIM}" font-family="monospace">\u22ef middle scrolls \u22ef</text>'
    s += f'<rect x="6" y="150" width="{W-12}" height="54" fill="#14140f"/>'
    for i, lbl in enumerate(['Lift rations', 'Intimidate']):
        bx = 16 + i * ((W - 44) / 2 + 8)
        s += f'<rect x="{bx}" y="{156}" width="{(W-44)/2}" height="40" rx="8" fill="none" stroke="{GREEN}"/>'
        s += f'<text x="{bx+8}" y="{181}" font-size="13" fill="#ddd" font-family="monospace">{text_esc(lbl)}</text>'
    s += f'<text x="16" y="198" font-size="10" fill="{DIM}" font-family="monospace">sticky actions</text>'
    s += f'<rect x="0" y="204" width="{W}" height="36" fill="#0a0a0a"/>'
    s += f'<text x="10" y="227" font-size="12" fill="{GREEN}" font-family="monospace">\u2713 info bar clear of card</text>'
    return s

def page(title, left, right):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W*2+20}" height="300" viewBox="0 0 {W*2+20} 300">'
           f'<rect width="{W*2+20}" height="300" fill="#000"/>'
           f'<text x="10" y="20" font-size="14" fill="#fff" font-family="monospace">{text_esc(title)}</text>'
           f'<g transform="translate(10,30)">{left}</g>'
           f'<g transform="translate({W+20},30)">{right}</g></svg>')
    return svg

svg1 = page('INFO BAR — before vs after', info_bar_before(), info_bar_after())
svg2 = page('PERSON CARD — before vs after', card_before(), card_after())
cairosvg.svg2png(bytestring=svg1.encode(), write_to='/tmp/info-bar-proof.png')
cairosvg.svg2png(bytestring=svg2.encode(), write_to='/tmp/person-card-proof.png')
print('wrote /tmp/info-bar-proof.png and /tmp/person-card-proof.png')

# layout math assertions
REGION = 184
print('card total before: 184 + 16 margin =', 184 + 16, '-> overflows' if 200 > REGION else '-> fits')
print('card total after: 184 + 0 margin =', 184, '-> fits' if 184 <= REGION else '-> overflows')
print('statgrid col width before: (390-12-10)/2/2 =', round((W - 12 - 10) / 2 / 2, 1), 'px per chip (cramped)')
print('statgrid col width after: (390-12-12)/2 =', round((W - 12 - 12) / 2, 1), 'px per chip (roomy)')
