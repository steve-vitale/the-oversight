#!/usr/bin/env python3
"""Build journey-landing-r35-20261021.js from the r34 driver (r34 lineage clone)."""
import re, sys

SRC = 'scripts/journey-landing-r34-20261020.js'
DST = 'scripts/journey-landing-r35-20261021.js'

with open(SRC) as f:
    lines = f.readlines()

# 1. Replace the r34 pre-registration header (lines 2..85, 1-indexed; line 1 is shebang)
assert lines[1].startswith('// Journey leg: LANDING (days 1-14) R34'), lines[1]
assert lines[84].rstrip() == '//       with the pinned driver \u2014 pre-existing).', repr(lines[84])
header = """\
// Journey leg: LANDING (days 1-14) R35 \u2014 nv-winddown wild check + near-dupe
// detector refinement, on tip 6381306b9.
// Landing-window exposure of commits since r34's base (e39108e3a):
//   - 4e44af418 journey-scale r19 (lane A): +17 in conversation.js \u2014 the NV
//     WINDDOWN DELIVERY fix. The budget-landing winddown beat queued in
//     heldBeats but the nonverbal thread offered no 'goon' continuer, so the
//     beat sat queued forever and gesture-spam looped without end. LANDING-
//     EXPOSED: every landing-window conversation runs the same convoTurn.
//     BUT: the pinned driver's pickChoice never picks nv: choices (falls to
//     'leave'), so r32\u2013r34's "deliberate nonverbal sits" ended on turn 1 \u2014
//     the nv path was never exercised in the wild. R35 adds NV_PROBE (below).
//   - r34's queued detector refinement (metric review): the near-dupe
//     detector's STRICT MISS on probe 101-day12 \u2014 the resume opener quotes
//     the previous sitting's true close, then the player's re-commit
//     legitimately re-fires the same gratitude line. Honest mechanism, not a
//     defect. R35 implements the queued exclusion: quote-explained pairs are
//     not near-dupes (proved RED->GREEN by the new proof test).
//   - 5446354e6 journey-social r37 (lane B): scripts + test fix, zero src
//     changes \u2014 no exposure. sim-lever arms: instruments/evidence only.
// Driver: pinned competent (r14\u2013r34 continuity). R35 additions:
//   - NV_PROBE (env, default ON in nv sits): inside a deliberate nonverbal
//     sit (second observed game-day), prefer nv: choices for up to 6 turns
//     (cycle, never the same pick twice in a row) before falling through to
//     the normal picker \u2014 mirrors the r16 MOURN_PROBE precedent (the pinned
//     policy never picks the path on its own; the beat itself is unit-proved
//     by scripts/test-nvwinddown-20261021.js).
//   - nv instruments: nvPicks, nvConvos, nvWinddownSurfaced (windingDown flip
//     after the r19 delivery), nvWinddownClosed (natural end after surfacing),
//     nvStuckLoops (driver 8-turn cap hit with >=4 nv picks and the convo
//     still active \u2014 the r19 bug's wild signature).
//
// Pre-registered (docs/MEASUREMENT.md sections 9-12, 14 \u2014 binding; \u00a714
// anti-drift: a miss is NO-GO, never re-scored mid-run):
//   Question A (blank): does the r19 nv-winddown fix hold in landing-window
//     nonverbal conversations? Gates: >=1 nv-thread conversation exercised
//     (nvPicks > 0); 0 stuck loops; every surfaced winddown closes naturally
//     (nvWinddownSurfaced == nvWinddownClosed). If 0 nv: choices are offered
//     in-window, the gate is documented-absent (reachability, not a miss).
//   Question B (instrument): the refined near-dupe detector \u2014 quote-
//     explained pairs excluded. Gates: probe 101's honest re-fire pair is NOT
//     flagged; genuine wrapper-hidden dupes still flagged (proved by
//     scripts/test-landing-r35-neardupe-20261021.js RED->GREEN: old logic
//     flags the quote pair, new logic doesn't, both flag the genuine dupe).
//   Stay-green spine (same gates as r34): V1'', V2, V3 (+scholar carve-out),
//     V4' (with the refined detector), V5', V6, M2 (System d8), WILD HAUL ARC,
//     DAY-FREEZE, OPEN BOOK, BEAT-IDENTITY WILD, R34 DEATH-LITURGY (still
//     watching), R34 THEFT-RATE. Retired: R33 FAVOR-ACTION, R33 KILLBEAT,
//     R29 SETTLE-SPEAK, R28 WILD, ASK-GOSSIP (cite r34).
//   Seeds: 201, 202 (pilot), 203, 204 (main); probe 101 (REPEAT_SIT=1,
//     MOURN_PROBE=1). Policy: competent, PINNED.
//   Horizon: 14 days, death-aware stop (+10d tail). One process per seed.
//   Pilot sizing: 201, 202 + probe 101; expand to 203, 204 iff the pilot
//     shows anything interesting (\u00a79). The stay-green spine wants the full
//     4 fresh seeds for the people check; expansion is cheap (~15s/seed).
//   Canon read: CANON.md + AGENTS.md (reread); DISEASES.md, CONVERSATIONS.md,
//     DIRECTIVES.md, KIN.md (r28\u2013r34). No new canon invented.
"""
lines[1:85] = [header]

src = ''.join(lines)

# 2. Mechanical renames
repl = [
    ('journey-landing-r34-20261020.js', 'journey-landing-r35-20261021.js'),
    ('journey-landing-r34-census-', 'journey-landing-r35-census-'),
    ('journey-landing-r34-transcript-', 'journey-landing-r35-transcript-'),
    ('journey-landing-r34-system-', 'journey-landing-r35-system-'),
    ('journey-landing-r34-fullstream-', 'journey-landing-r35-fullstream-'),
    ('evidence/2026-10-20/landing-r34', 'evidence/2026-10-21/landing-r35'),
    (": [109, 110, 111, 112]);", ": [201, 202, 203, 204]);"),
]
for old, new in repl:
    assert old in src, old
    src = src.replace(old, new)

# 3. NV_SIT probe state + picker preference (before pickChoice's DEEPEN loop)
old_pick = """function pickChoice(choices, turn, wantId) {
  const list = choices || [];"""
new_pick = """// R35 NV_PROBE: deliberate nonverbal sit flag (set by runConversation).
let NV_SIT = false;
function pickChoice(choices, turn, wantId) {
  const list = choices || [];"""
assert old_pick in src
src = src.replace(old_pick, new_pick)

old_deepen = """  // R28 (retired per r27 metric review): the pinned driver takes the
  // r26 deepening path \u2014 no resume-priority pick. Keep the instrument"""
new_deepen = """  // R35 NV_PROBE: inside a deliberate nonverbal sit, prefer nv: gestures
  // (cycle through them, up to 6 turns) \u2014 the pinned picker never takes the
  // nv path on its own (falls to 'leave'), so r32\u2013r34's nv sits ended on
  // turn 1 and the nonverbal thread was never exercised in the wild.
  // Mirrors the r16 MOURN_PROBE precedent. Default ON; NV_PROBE=0 restores
  // r34 behavior.
  if (NV_SIT && process.env.NV_PROBE !== '0' && turn < 6) {
    const nvs = list.filter(x => x && x.id && x.id.indexOf('nv:') === 0 && x.id !== lastPickId);
    if (nvs.length) { lastPickId = nvs[0].id; return nvs[0]; }
  }
  // R28 (retired per r27 metric review): the pinned driver takes the
  // r26 deepening path \u2014 no resume-priority pick. Keep the instrument"""
assert old_deepen in src
src = src.replace(old_deepen, new_deepen)

# 4. runConversation: set NV_SIT, turn-loop instruments
old_rc = """function runConversation(seed, day, vid, nvSit) {
  const fp = path.join(OUTDIR, `journey-landing-r35-transcript-${seed}-day${day}.txt`);"""
assert old_rc in src
src = src.replace(old_rc, old_rc + "\n  NV_SIT = !!nvSit; // R35: arm the nv picker for deliberate sits")

old_loop = """    sayThem(r0.line);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {"""
new_loop = """    sayThem(r0.line);
    let r = r0;
    // R35 nv instruments
    let nvPicks = 0, nvStreak = 0, nvMaxStreak = 0, offeredNv = 0;
    let wdSurfacedAt = -1, turns = 0, endedByEngine = false;
    for (let turn = 0; turn < 8; turn++) {"""
assert old_loop in src
src = src.replace(old_loop, new_loop)

old_picklog = """      log(`YOU: [${pick.id}] ${pick.label}`);
      if (pick.id === 'betrayal:decline') declinedThisTurn = true;"""
new_picklog = """      log(`YOU: [${pick.id}] ${pick.label}`);
      if (pick.id.indexOf('nv:') === 0) { nvPicks++; nvStreak++; if (nvStreak > nvMaxStreak) nvMaxStreak = nvStreak; MET.nvPicks = (MET.nvPicks || 0) + 1; }
      else nvStreak = 0;
      if (pick.id === 'betrayal:decline') declinedThisTurn = true;"""
assert old_picklog in src
src = src.replace(old_picklog, new_picklog)

old_choices = """      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }"""
new_choices = old_choices + """
      offeredNv += (choices || []).filter(ch => ch && ch.id && ch.id.indexOf('nv:') === 0).length; // R35"""
assert old_choices in src
src = src.replace(old_choices, new_choices)

old_afterturn = """      r = Game.convoTurn(vid, pick.id);
      sayThem(r.line);"""
new_afterturn = """      r = Game.convoTurn(vid, pick.id);
      turns++;
      // R35: the r19 delivery arms windingDown when the queued winddown beat
      // surfaces on an nv: turn \u2014 detect the flip.
      try {
        const cc = Game.convoGet(vid);
        if (cc && cc.windingDown && wdSurfacedAt < 0) {
          wdSurfacedAt = turn; MET.nvWinddownSurfaced = (MET.nvWinddownSurfaced || 0) + 1;
          log('nv winddown surfaced \u2713 (windingDown armed \u2014 the r19 delivery)');
        }
      } catch (e) {}
      sayThem(r.line);"""
assert old_afterturn in src
src = src.replace(old_afterturn, new_afterturn)

old_endloop = """      if (r.ended) { log('(ended by engine)'); break; }
    }"""
new_endloop = """      if (r.ended) { endedByEngine = true; log('(ended by engine)'); break; }
    }
    // R35 nv summary: the r19 bug's wild signature is a conversation that hits
    // the driver's 8-turn cap with >=4 gesture picks and is still active.
    if (nvPicks > 0) {
      MET.nvConvos = (MET.nvConvos || 0) + 1;
      let stillActive = false;
      try { stillActive = !!(Game.convoGet(vid) || {}).active; } catch (e) {}
      if (wdSurfacedAt >= 0 && endedByEngine) { MET.nvWinddownClosed = (MET.nvWinddownClosed || 0) + 1; log('nv winddown: surfaced then closed naturally \u2713'); }
      else if (wdSurfacedAt >= 0) log(`nv winddown: surfaced at turn ${wdSurfacedAt} but did NOT close naturally (endedByEngine=${endedByEngine})`);
      if (turns >= 8 && nvPicks >= 4 && stillActive) { MET.nvStuckLoops = (MET.nvStuckLoops || 0) + 1; log('!! NV STUCK LOOP: 8-turn cap hit with >=4 gesture picks, convo still active \u2014 the r19 bug signature'); }
      log(`nv summary: picks=${nvPicks} maxStreak=${nvMaxStreak} offeredNv=${offeredNv} wdSurfacedAt=${wdSurfacedAt} endedByEngine=${endedByEngine} stillActive=${stillActive}`);
    }
    if (offeredNv > 0) MET.nvOfferedTotal = (MET.nvOfferedTotal || 0) + offeredNv;
    NV_SIT = false; // R35: disarm"""
assert old_endloop in src
src = src.replace(old_endloop, new_endloop)

# 5. Near-dupe detector refinement: exclude quote-explained pairs
old_dupe = """    const normCore = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\\s+/g, ' ').trim();
    // r18 fix: keep (line, core) pairs \u2014 filtering cores alone breaks the
    // themT index alignment and misattributes the pair (caught on the
    // seed-64 probe: reported a deflection line, hid the real comfort repeat).
    const pairs = themT.map(t => ({ line: t, core: normCore(t) })).filter(p => p.core.length >= 40);
    const nearDupes = [];
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        if (pairs[i].core === pairs[j].core) continue;
        if (pairs[i].core.indexOf(pairs[j].core) !== -1 || pairs[j].core.indexOf(pairs[i].core) !== -1) {
          nearDupes.push(`${pairs[i].line.slice(0, 80)} \u27f7 ${pairs[j].line.slice(0, 80)}`);
        }
      }
    }"""
new_dupe = """    const normCore = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\\s+/g, ' ').trim();
    // r18 fix: keep (line, core) pairs \u2014 filtering cores alone breaks the
    // themT index alignment and misattributes the pair (caught on the
    // seed-64 probe: reported a deflection line, hid the real comfort repeat).
    // R35 refinement (r34 metric-review queue): a resume opener that QUOTES
    // the previous sitting's true close is not a repeat \u2014 the r34 STRICT
    // MISS (probe 101-day12): the resume opener quotes the close, then the
    // player's re-commit legitimately re-fires the same gratitude line.
    // Exclude pairs whose containment is explained by a quoted segment
    // (>=20 chars normalized, the r33 20-char floor) of one line matching
    // the other. Quoted <20 chars cannot explain a pair (guard against
    // over-exclusion, e.g. 'They said "fix the fence" and walked off').
    const QUOTE_FLOOR = 20;
    const quoteSegs = (line) => (String(line || '').match(/"[^"]*"/g) || [])
      .map(q => normCore(q)).filter(s => s.length >= QUOTE_FLOOR);
    const quoteExplained = (a, b) =>
      a.quotes.some(q => b.core.indexOf(q) !== -1) ||
      b.quotes.some(q => a.core.indexOf(q) !== -1);
    const pairs = themT.map(t => ({ line: t, core: normCore(t), quotes: quoteSegs(t) })).filter(p => p.core.length >= 40);
    const nearDupes = [];
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        if (pairs[i].core === pairs[j].core) continue;
        if (quoteExplained(pairs[i], pairs[j])) { MET.nearDupeQuoteExcluded = (MET.nearDupeQuoteExcluded || 0) + 1; continue; }
        if (pairs[i].core.indexOf(pairs[j].core) !== -1 || pairs[j].core.indexOf(pairs[i].core) !== -1) {
          nearDupes.push(`${pairs[i].line.slice(0, 80)} \u27f7 ${pairs[j].line.slice(0, 80)}`);
        }
      }
    }"""
assert old_dupe in src
src = src.replace(old_dupe, new_dupe)

# 6. Census summary: add nv + refined-detector fields (keeps r34Summary key)
old_r34 = """  var r34 = {
    headcountCodas: MET.headcountCodas || 0,"""
new_r34 = """  var r34 = {
    nvPicks: MET.nvPicks || 0,
    nvConvos: MET.nvConvos || 0,
    nvOfferedTotal: MET.nvOfferedTotal || 0,
    nvWinddownSurfaced: MET.nvWinddownSurfaced || 0,
    nvWinddownClosed: MET.nvWinddownClosed || 0,
    nvStuckLoops: MET.nvStuckLoops || 0,
    nearDupeQuoteExcluded: MET.nearDupeQuoteExcluded || 0,
    nearDupes: MET.nearDupes || 0,
    headcountCodas: MET.headcountCodas || 0,"""
assert old_r34 in src
src = src.replace(old_r34, new_r34)

with open(DST, 'w') as f:
    f.write(src)
print('wrote', DST, len(src.splitlines()), 'lines')
