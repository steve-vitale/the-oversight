#!/usr/bin/env python3
"""Visual proof for ui-mobile-fixes (Steve 2026-10-12, 390x844 iPhone).

1. sheet-flex-proof.png — simplified flexbox column math for the ability
   sheet ("The System Offers a Gift", 6 rich choice buttons) at 390x844,
   BEFORE vs AFTER the CSS fix. Shows the bottom buttons cut off below the
   fold before, and contained + internally scrolling after.
2. chat-type-proof.png — full-screen .chat typography before/after with
   verbatim game lines.
3. dlg-type-proof.png — inline .dialogue-box (184px region) before/after.

Headless Chromium hangs in this VM, so these are computed mockups:
the flex math follows the CSS flexbox column algorithm; typography uses
the real font-size/line-height/opacity values from src/css/main.css.
Verbatim lines only (SENSE-TESTING LAW).
"""
import cairosvg, textwrap

W, H = 390, 844
SHEET_MAX = int(0.82 * H)          # 82vh = 692
BTNS_MAX  = int(0.62 * H)          # 62vh = 523 (new cap)

HEAD_H = 57
BODY_CONTENT = 154                  # 2 paragraphs, 14px/1.55
BTN_H, BTN_GAP, BTN_PAD = 118, 8, 20
N_BTNS = 6
BTNS_CONTENT = N_BTNS * BTN_H + (N_BTNS - 1) * BTN_GAP + BTN_PAD  # 768

def flex_col(children, container):
    """children: (basis, shrink, min_h, max_h). Returns laid-out heights."""
    hs = [min(b, mx) for b, s, mn, mx in children]
    over = sum(hs) - container
    if over > 0:
        while over > 0.5:
            sc = [(b_, s) for (b_, s, mn, mx), h in zip(children, hs)
                  if s > 0 and h > mn]
            tot = sum(b_ * s for b_, s in sc)
            if tot <= 0: break
            moved = False
            for i, ((b_, s, mn, mx), h) in enumerate(zip(children, hs)):
                if s > 0 and h > mn:
                    give = over * (b_ * s) / tot
                    nh = max(mn, h - give)
                    over -= (h - nh); hs[i] = nh; moved = True
            if not moved: break
    return hs, max(0.0, over)

INF = 1e9
before_hs, before_over = flex_col(
    [(HEAD_H, 0, HEAD_H, INF), (BODY_CONTENT, 1, 0, INF), (BTNS_CONTENT, 0, BTNS_CONTENT, INF)],
    SHEET_MAX)
after_hs, after_over = flex_col(
    [(HEAD_H, 0, HEAD_H, INF), (BODY_CONTENT, 1, 0, INF), (BTNS_CONTENT, 1, 0, BTNS_MAX)],
    SHEET_MAX)
print('BEFORE heights (head/body/btns):', [round(x, 1) for x in before_hs], 'overflow px:', round(before_over, 1))
print('AFTER  heights (head/body/btns):', [round(x, 1) for x in after_hs], 'overflow px:', round(after_over, 1))

# ---------------- 1. sheet flex proof ----------------
def sheet_svg(heights, overflow, title, note, clip):
    y0 = H - SHEET_MAX
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H + 260}">']
    s.append(f'<rect width="{W}" height="{H + 260}" fill="#0a0a0a"/>')
    s.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="none" stroke="#555" stroke-width="2"/>')
    s.append(f'<text x="10" y="24" fill="#fff" font-size="15" font-family="sans-serif">{title}</text>')
    s.append(f'<rect x="0" y="{y0}" width="{W}" height="{SHEET_MAX}" fill="#161616" stroke="#3a3a3a"/>')
    y = y0
    # head
    s.append(f'<rect x="0" y="{y}" width="{W}" height="{heights[0]}" fill="#1e1e1e"/>')
    s.append(f'<text x="16" y="{y + 34}" fill="#fff" font-size="15" font-family="sans-serif">* The System Offers a Gift</text>')
    y += heights[0]
    # body
    bh = heights[1]
    if bh < 20:
        s.append(f'<rect x="0" y="{y}" width="{W}" height="6" fill="#a33"/>')
        s.append(f'<text x="16" y="{y + 24}" fill="#e88" font-size="12" font-family="sans-serif">body collapsed to {bh:.0f}px (shrank away)</text>')
    else:
        s.append(f'<rect x="0" y="{y}" width="{W}" height="{bh}" fill="#181818"/>')
        s.append(f'<text x="16" y="{y + 24}" fill="#ccc" font-size="13" font-family="sans-serif">\u201cWe watched your first week! You\u2019re good at\u2026 let us see\u2026\u201d</text>')
        s.append(f'<text x="16" y="{y + 44}" fill="#ccc" font-size="13" font-family="sans-serif">Choose one ability: \u21d5 scrolls</text>')
    y += max(bh, 6)
    # buttons — before: unclipped (the bug: they paint past the fold, unreachable,
    # tinted red). after: clipped to the laid-out btns region = the scrollport.
    btns_y = y
    btns_h = heights[2]
    if clip:
        s.append(f'<clipPath id="btnclip"><rect x="0" y="{btns_y}" width="{W}" height="{btns_h}"/></clipPath>')
        s.append('<g clip-path="url(#btnclip)">')
    for i in range(N_BTNS):
        by = btns_y + i * (BTN_H + BTN_GAP)
        cut = (not clip) and by + BTN_H > H
        col = '#7a2a2a' if cut else '#233626'
        s.append(f'<rect x="16" y="{by}" width="{W - 32}" height="{BTN_H}" fill="{col}" stroke="#4a4a4a"/>')
        s.append(f'<text x="28" y="{by + 30}" fill="#fff" font-size="15" font-family="sans-serif">Ability {i + 1} name</text>')
        s.append(f'<text x="28" y="{by + 52}" fill="#999" font-size="12" font-family="sans-serif">description \u00b7 flavor \u00b7 kcal cost</text>')
    if clip:
        s.append('</g>')
    # scroll fade at the bottom of the btns region when content exceeds it
    if BTNS_CONTENT > btns_h + 1:
        fy = btns_y + btns_h - 26
        s.append(f'<rect x="16" y="{fy}" width="{W - 32}" height="26" fill="#161616" opacity="0.85"/>')
        s.append(f'<text x="{W/2}" y="{fy + 18}" fill="#7fd67f" font-size="13" text-anchor="middle" font-family="sans-serif">\u21d5 scrolls internally</text>')
    overflow = max(0.0, overflow)
    if overflow > 1:
        s.append(f'<rect x="0" y="{H}" width="{W}" height="4" fill="#f33"/>')
        s.append(f'<rect x="8" y="{H + 8}" width="{W - 16}" height="66" fill="#0a0a0a"/>')
        s.append(f'<text x="16" y="{H + 32}" fill="#f66" font-size="14" font-family="sans-serif">\u26a0 {overflow:.0f}px of buttons BELOW the fold \u2014 cut off, no scroll</text>')
        s.append(f'<text x="16" y="{H + 54}" fill="#f66" font-size="14" font-family="sans-serif">flex-shrink:0 defeated overflow-y:auto</text>')
    else:
        s.append(f'<rect x="8" y="{H + 8}" width="{W - 16}" height="44" fill="#0a0a0a"/>')
        s.append(f'<text x="16" y="{H + 34}" fill="#7fd67f" font-size="14" font-family="sans-serif">\u2713 contained in 82vh \u2014 button area scrolls internally \u21d5</text>')
    s.append(f'<rect x="8" y="{H + 58}" width="{W - 16}" height="30" fill="#0a0a0a"/>')
    s.append(f'<text x="16" y="{H + 78}" fill="#888" font-size="12" font-family="sans-serif">{note}</text>')
    s.append('</svg>')
    return ''.join(s)

cairosvg.svg2png(bytestring=sheet_svg(before_hs, before_over, 'BEFORE — .sheet-btns flex-shrink:0',
    'head 57 / body 0 (collapsed) / btns 768 unshrinkable', False).encode(),
    write_to='/tmp/sheet-before.png')
cairosvg.svg2png(bytestring=sheet_svg(after_hs, after_over, 'AFTER — .sheet-btns flex:0 1 auto, max-height:62vh',
    'head 57 / body ~%d (scrolls) / btns ~%d (scrolls, capped)' % (after_hs[1], after_hs[2]), True).encode(),
    write_to='/tmp/sheet-after.png')

# ---------------- 2/3. typography mockups ----------------
def wrap(text, size, maxw, fontfam='sans-serif'):
    words, lines, cur = text.split(), [], ''
    avg = size * 0.52
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if len(t) * avg > maxw and cur:
            lines.append(cur); cur = wd
        else:
            cur = t
    if cur: lines.append(cur)
    return lines

def chat_svg(mode):
    # mode: 'before' | 'after'
    st = {'before': dict(bub=16, lh=1.6, mw=0.88, name=12, nopa=0.6, narr=14, nropa=0.62),
          'after':  dict(bub=17, lh=1.65, mw=0.86, name=13, nopa=0.78, narr=15, nropa=0.80)}[mode]
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}">']
    s.append(f'<rect width="{W}" height="{H}" fill="#101014"/>')
    s.append(f'<rect width="{W}" height="58" fill="#16161c"/><text x="14" y="36" fill="#fff" font-size="17" font-family="sans-serif">Marcus \u2014 nearby</text>')
    y = 78
    def bubble(who, text, you=False, narr=False):
        nonlocal y
        if narr:
            lines = wrap(text, st['narr'], W * 0.92)
            lh = st['narr'] * 1.55
            h = len(lines) * lh + 16
            for i, ln in enumerate(lines):
                s.append(f'<text x="{W/2}" y="{y + 12 + i * lh}" fill="#fff" opacity="{st["nropa"]}" font-size="{st["narr"]}" font-style="italic" text-anchor="middle" font-family="sans-serif">{ln}</text>')
            y += h + 10; return
        bw = W * st['mw']
        x = W - bw - 14 if you else 14
        bg = '#14291a' if you else '#1b1b22'
        s.append(f'<text x="{x}" y="{y}" fill="#fff" opacity="{st["nopa"]}" font-size="{st["name"]}" font-family="sans-serif">{who}</text>')
        y += st['name'] + 8
        lines = wrap(text, st['bub'], bw - 28)
        lh = st['bub'] * st['lh']
        h = len(lines) * lh + 22
        s.append(f'<rect x="{x}" y="{y}" width="{bw}" height="{h}" rx="14" fill="{bg}" stroke="#ffffff" stroke-opacity="0.13"/>')
        for i, ln in enumerate(lines):
            s.append(f'<text x="{x + 14}" y="{y + 11 + (i + 1) * lh - 4}" fill="#e8e8e8" font-size="{st["bub"]}" font-family="sans-serif">{ln}</text>')
        y += h + 14
    bubble('', 'Dawn. You wake rested. You hear the sound again \u2014 the one they made. It follows you out of sleep.', narr=True)
    bubble('Marcus', '\u201cEnough,\u201d he says. \u201cI want a say in how this village runs. A real say.\u201d')
    bubble('You', 'You hold Brass Locket. Breathe. The shaking eases.', you=True)
    s.append(f'<text x="14" y="{H - 16}" fill="#888" font-size="12" font-family="sans-serif">.chat {mode}: bubble {st["bub"]}px/{st["lh"]}, name {st["name"]}px @{st["nopa"]}, narr {st["narr"]}px @{st["nropa"]}</text>')
    s.append('</svg>')
    return ''.join(s)

cairosvg.svg2png(bytestring=chat_svg('before').encode(), write_to='/tmp/chat-before.png')
cairosvg.svg2png(bytestring=chat_svg('after').encode(), write_to='/tmp/chat-after.png')

def dlg_svg(mode):
    st = {'before': dict(fs=14, lh=1.45, sp=13), 'after': dict(fs=16, lh=1.6, sp=14)}[mode]
    RH = 184
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{RH + 60}">']
    s.append(f'<rect width="{W}" height="{RH + 60}" fill="#0a0a0a"/>')
    s.append(f'<text x="10" y="20" fill="#888" font-size="12" font-family="sans-serif">.ord-narration region (fixed 184px) \u2014 {mode}</text>')
    y0 = 30
    s.append(f'<rect x="4" y="{y0}" width="{W - 8}" height="{RH}" rx="10" fill="#0a0c14" stroke="#ffffff" stroke-opacity="0.35"/>')
    fs, lh, sp = st['fs'], st['lh'], st['sp']
    y = y0 + 10
    s.append(f'<rect x="4" y="{y0}" width="{W - 8}" height="{sp + 16}" fill="#ffffff" fill-opacity="0.06"/>')
    s.append(f'<text x="16" y="{y0 + sp + 8}" fill="#fff" font-size="{sp}" font-weight="bold" font-family="sans-serif">Marcus \u00b7 wants a say</text>')
    y = y0 + sp + 16 + 10
    lines = wrap('\u201cEnough,\u201d he says. \u201cI want a say in how this village runs. A real say.\u201d', fs, W - 40)
    for i, ln in enumerate(lines[:3]):
        s.append(f'<text x="16" y="{y + i * fs * lh}" fill="#fff" font-size="{fs}" font-family="sans-serif">{ln}</text>')
    y += 3 * fs * lh + 8
    s.append(f'<rect x="16" y="{y}" width="150" height="34" rx="6" fill="#1b2a1b" stroke="#7fd67f"/>')
    s.append(f'<text x="26" y="{y + 22}" fill="#cfc" font-size="13" font-family="sans-serif">Give him the say</text>')
    s.append(f'<rect x="176" y="{y}" width="150" height="34" rx="6" fill="#1b2a1b" stroke="#7fd67f"/>')
    s.append(f'<text x="186" y="{y + 22}" fill="#cfc" font-size="13" font-family="sans-serif">Make him earn it</text>')
    s.append(f'<text x="{W/2}" y="{y0 + RH - 10}" fill="#fff" opacity="0.85" font-size="15" text-anchor="middle" font-family="sans-serif">\u25bc</text>')
    s.append('</svg>')
    return ''.join(s)

cairosvg.svg2png(bytestring=dlg_svg('before').encode(), write_to='/tmp/dlg-before.png')
cairosvg.svg2png(bytestring=dlg_svg('after').encode(), write_to='/tmp/dlg-after.png')
print('wrote /tmp/sheet-before.png /tmp/sheet-after.png /tmp/chat-before.png /tmp/chat-after.png /tmp/dlg-before.png /tmp/dlg-after.png')
