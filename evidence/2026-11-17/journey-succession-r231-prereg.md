# Journey succession r231 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r231 play or fix. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r231: follows crisis r230 (today, 2026-11-17).
Base: master b921fde4f at run start. Lock: playtest-loop-2.lock run_id
loop2-20261117-1755Z (own, created at run start; no prior lock present).

## Standing state (why this run plays leg 7, and what it fixes)

r230 succession (2026-11-17, this morning) passed every bar and was
instrument-only: MANTLE-FINE PASS (11 deaths, all synchronous), DRY CENSUS
PASS (second fully-clean census), F5 FIRED in the wild for the first time
since r224, C3d WILD HOLD PASS (0 erasures). Its one open item, carried as
a watch item for a future build, is the mourning lines: "the mourning lines
are still templated per dead person — 'I keep expecting to see X at the
fire. Stupid.' fires 5×, 'The fire feels smaller without X' 2×, 'I keep
turning over the last thing X said to me…' 4×. Same words, only the name
changes. Honest, but shared verbatim." This run is that future build.

## Root cause (traced before the fix, not guessed)

The three repeating lines are three different templates from three
different pools (opener single-name, follow-up cope, follow-up next).
They repeat because the dead person's name is baked into the line BEFORE
the pick, and every freshness mechanism in the conversation system
dedupes by exact line text:

- `t2fol_lately` (convoTopics.js:1702-1703) substitutes `{mname}` with the
  dead name (`nm()` mapping) before returning the pools — so `convoPick`
  sees "…last thing Fiona said…" and "…last thing Sanjay said…" as two
  different lines.
- `t2gen_lately`'s mourning opener (convoTopics.js:1267-1273) builds its
  five single-name templates by string concatenation with `mnames[0]` —
  same name-baked-before-pick shape.
- `convoPick` (conversation.js:3336) dedupes per-villager by exact text,
  prefers village-fresh lines (`villageLineFresh`, game.js:2935, exact-text
  `convLineLog`), and prefers run-ledger-unseen lines (same text key).
  All three go name-blind the moment the name is baked in. The pools DO
  hold 5 opener + 3+3+3 follow-up variants; the picker simply cannot see
  that two name-swapped lines are the same template.

Verified against the r230 corpus (not just the run note): the three
templates fired 5/4/2 times across 5 files/speakers with different dead
names each time (Heinrich, Ethel, Austin, Sanjay, Cameron for the opener;
Sanjay, Heinrich, Ethel, Austin for the cope line; Gilberto, Ethel for
the next line). The same-speaker protection already works for the SAME
dead person (identical text); the gap is purely across dead persons and
across speakers.

## Fix arm (src/js/convoTopics.js ONLY — MOURN-TEMPLATE)

Substitute `{mname}` AFTER the pick, not before, so pick / per-villager
dedupe / village-fresh / run-ledger all operate on template text:

1. `t2gen_lately` mourning case, single-name branch: the five templates
   use `{mname}` instead of `mnames[0]`.
2. `t2fol_lately`: drop the `nm()` mapping — pools return with `{mname}`
   intact. (`nm()` only ever affected mourning pools; no other kind
   contains `{mname}` — verified by grep.)
3. `t2fill` resolves `{mname}` lazily, only when the picked line contains
   it, from the current lately event (`this.t2LatelyEvent(vid).name ||
   'them'`). `t2fill` is the choke point every generated line passes
   through (topic2Ask + topic2Beat), so both the opener and the
   follow-ups get their name after the pick, and no other call site can
   serve an unfilled `{mname}`.

Unchanged by design: the multi-name branch (mlist/mgone — genuinely
different lines per corpse-set, not implicated in the finding), the
nameless branch, the sick-death push, and the successor-grief push
(conditional single-fire lines, name-baked). No other topic is touched.
No game rule, price, gate, or balance number changes — this is a
line-selection fix only.

Risk, named in advance: the emission-time `sayLine` run-ledger block
still reads the FINAL (substituted) string, so a same-template /
same-dead pick by a second villager inside the 48-entry window blocks
at emission and serves the honest dry line. The pick-time village-fresh
preference (now template-aware via `noteVillageLine` on the placeholder)
should steer the second villager to another template first; the DRY
CENSUS (binding, any-hit-fails) is the guard that catches it if the
steering fails. MOURN-EXHAUST (below) is the guard against the fix
starving the opener outright.

## Questions (r231)

(1) MOURN-TEMPLATE (binding, new): the mourning templates stop wearing
    different names on the fresh panel. Analyzer scans the panel
    transcripts for the 10 name-parameterized mourning shapes (5 opener
    single-name + cope "turning over the last thing {N} said" + next
    "Nobody says {N}'s name right yet" / "The fire feels smaller without
    {N}" + part "picking up {N}'s share" / "I {habitI} for {N}").
    PASS = (a) 0 same-speaker same-shape firings for different dead, AND
    (b) 0 different-speaker same-shape same-dead firings within 5 days
    (dplus difference <= 5, the LINE_FRESH_DAYS window).
    Descriptive: per-shape counts across the panel, against the r230
    baseline (opener-expect 5, cope-last-words 4, next-fire-smaller 2) —
    expect the counts to spread across all 5 opener shapes and all
    follow-up variants instead of piling on three.
(2) MOURN-EXHAUST (binding, new): 0 servings of the exhausted line
    ("I've told you everything I know about that.") in a mourning
    sitting (a transcript sitting whose day falls within 10 days after
    any recorded death on that seed — the bearer-mantle tail). The fix
    must not trade repeats for silence.
(3) MANTLE-FINE (binding, carried, gap-subtraction): 0
    flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2,
    0 unexplained fineLatency==1, 0 day-skips.
(4) DRY CENSUS (binding, carried): 0 dry hits of any class. Any hit
    fails the run — the fix's emission-block cost would land here.
(5) WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
    C3c/F2/C3d and the carried landed-fix surfaces.
(6) C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
(7) F5 WILD EXERCISE (binding, carried): the settled-favor branch fires
    >=1x on the panel AND 0 F5-class dry hits. A zero-fire panel is a
    finding, not a pass. Targeted harness (r225 proof test) re-run on
    this base.
(8) CONTROLS (binding, smoke bar S_fixed from r230): smoke 33998
    at-death snapshot = d6 Grace 11/1/43 + machinery (pick rank 1,
    funeral INCALL true, selfReq 0 on every seed). If the smoke
    snapshot moves, it is base drift since r230, recorded as such and
    the bar re-baselines by measurement, not adoption.
(9) Descriptive: CAP-NC bonded-by-deadline among eligible;
    denominator < 3 stays INSUFFICIENT-DATA. bondedEver reported
    descriptively.
(10) Watch: day-skips stay at zero (sixteenth straight panel watch).

## Panel

- Driver: scripts/journey-succession-r231-20261117.js (r230 driver,
  rename only: r230 -> r231; seeds changed below; EVID 2026-11-17).
- Analyzer: scripts/analyze-journey-succession-r231-20261117.js
  (r230 analyzer, rename only, PLUS the MOURN-TEMPLATE + MOURN-EXHAUST
  transcript scan above; default PREFIX r231).
- Panel runner: scripts/run-journey-succession-r231-panel.sh (r230
  runner, rename only).
- Proof test: scripts/test-journey-succession-r231-mourning-template-20261117.js
  (new): stages two deaths, drives the lately opener + follow-ups for
  the same speaker about each dead person in turn, and asserts (a) the
  second dead person's opener is a DIFFERENT template than the first's,
  (b) no served line contains a literal '{mname}', (c) the follow-up
  templates differ across the two dead, (d) no exhausted line is served
  while the pool still holds variants. RED on the pre-fix code (verified
  by running against the stashed base file), GREEN on the fix.
- Seeds: FRESH BAND 34331–34334 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34331 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/**/*.md for 34331/34332/34333/34334: 0 hits. Same
  grep across the goal hidden_files .md files: 0 hits. No
  forbidden/contaminated band list names 3433x. (A prereg grep for
  3433x/3434x surfaced only a game.js line number, 34336, not a band
  reservation.)
- Band 34331–34334 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation. (Comparison: 34321–34324
  = r230 panel; 34311–34314 = r229; 34301–34304 = r224; 34291–34294 =
  r218; 34281–34284 = r209; 34271–34274 = r202; 34261–34264 = r197;
  34251–34254 = r193; 34241–34244 = r187; 34231–34234 = r183;
  34221–34224 = r181; 34211–34218 = r177; 34201–34208 = r169;
  34011–34018 = r169; 33998 = standing smoke control.)

## Corpus proof (before the panel)

The r231 analyzer's MOURN scan was run over the r230 corpora
(PREFIX=r230, evidence/2026-11-17/journey-succession-r231-mournscan-r230corpus.txt)
BEFORE the panel, to prove the instrument convicts the old code:
- Servings 34, same distribution as the r230 run note (opener-expect 5,
  cope-last-words 4, next-fire-smaller 2, plus the other 7 shapes).
- MOURN-TEMPLATE verdict FAIL: 1 same-speaker repeat — Amanda (34323)
  served opener:world-continues for Ethel (d+3) and again for Maureen
  (d+53). Village-window repeats 0.
- MOURN-EXHAUST PASS (0 in mourning sittings).
The scan also caught its own bug in the first pass: a (.+?) name capture
bled across a change-ack prefix's closing quote (dead="You want to know
about that? Okay." "Ethel"); the capture is now [^"]+? and the Amanda
repeat re-verifies with clean names. The instrument is proven
discriminating: it must PASS on the r231 panel for the fix to hold.

## Bars (binding, §14)

- MOURN-TEMPLATE (binding, NEW r231): PASS — 0 same-speaker
  same-shape firings for different dead AND 0 different-speaker
  same-shape same-dead firings within 5 days.
- MOURN-EXHAUST (binding, NEW r231): PASS — 0 exhausted-line servings
  in a mourning sitting.
- MANTLE-FINE (binding, carried, gap-subtraction): PASS — 0
  flippedImmediate=false rows outside VILLAGE-OVER, 0
  fineLatency>=2 (gap-adjusted), 0 unexplained fineLatency==1,
  0 day-skips.
- DRY CENSUS (binding, carried): 0 dry hits of any class.
- WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
  C3c/F2/C3d and the carried landed-fix surfaces.
- C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
- F5 WILD EXERCISE (binding, carried): settled-favor branch fires
  >=1x AND 0 F5-class dry hits. Targeted harness (r225 proof test)
  green on this base.
- CONTROLS (binding, smoke bar S_fixed): smoke 33998 at-death
  snapshot = d6 Grace 11/1/43 + MANTLE-FINE clean + pick rank 1,
  funeral INCALL true, selfReq 0 on every seed.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.

## What would count as interesting

- A MOURN-TEMPLATE repeat on the panel (the fix fails in the wild —
  FAIL LOUDLY; the template dedupe is not engaging where claimed).
- A MOURN-EXHAUST serving (the fix starves the opener — the trade
  this run refused to make silently).
- A DRY hit on ask:lately (the emission-block cost of the fix,
  realized — FAIL LOUDLY).
- A C3d-class erasure on the panel (r231 fix regression — FAIL LOUDLY).
- An F5-class dry hit on the panel (r225 fix regression — FAIL LOUDLY).
- A stale-favor resume opener (r228 C3c fix regression — FAIL LOUDLY).
- A narration quote in a resume opener (r228 F2 fix regression).
- A NEW dry line on an unpooled surface (the next fix item — filed).
- Any MANTLE-FINE miss on the fresh band (regression).
- A zero-fire F5 panel (the settled-favor branch never fires — the
  vacuous outcome; the fix stays proof-only).
- A live-want recap serving (convoRecapLiveLine firing in the wild —
  positive evidence the C3d fix engages, not just holds; r230 could
  not produce one).
- Smoke snapshot move vs S_fixed (base drift since r230).
- CAP-NC denominator >= 3 for the first time in several runs.

## Metric review (carried)

- r229's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in their run notes). This run runs telemetry-check
  against the succession baseline and reports LOUD lines; it does
  NOT roll the baseline forward until the mismatch is resolved.
- DRY CENSUS amendment stands (any dry hit fails).
- MANTLE-FINE stays the gap-subtraction revision (r230); no further
  revision proposed.
- F5 fired in the wild on r230 (vacuous watch CLOSED); the bar stays
  (fire >=1x) with the r225 harness as the standing proof.
- C3d wild hold: the fix's live-want path never engaged on r230 (no
  recap while a live want was open). The bar stays; a future panel
  with a live-want recap would give the positive evidence r230 could
  not.
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: sixteenth straight panel watch.
- Proof refresh rounds 11 + 12 remain owed (not this run's).
- Grief personalization (relationship-aware mourning lines — bond/kin/
  shared-deed variants) is NOT in this run's scope: this run closes
  the verbatim-repeat watch item via template-level dedupe. If the
  panel shows the dedupe working but the lines still reading as one
  voice, personalization is the next build, filed from this run's
  evidence.
