# Journey succession r224 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r224 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r224: follows crisis r223 (today). Base: master
2fd2dad1f at run start (journey-scale r223). Lock:
playtest-loop-2.lock run_id loop2-20261116T085537Z (own, created at
run start; no prior lock present).

## Standing state (why this run plays leg 7, and what it fixes)

r218 succession LANDED 2026-11-16 (adoption gate 333/7 GO, 0
attributable): MANTLE-FINE PASS (twelfth straight zero panel), F3
(commit-refusal noBeat) verified in the wild (0 opener quotes across
71 transcripts), WILD CHECK PASS on landed fixes — but DRY CENSUS
**FAIL — 3 other-class hits**, all `preRun:true` run-ledger blocks on
the exact dry line `"...Sorry, lost my train of thought."` on NEW
surfaces. r218 filed three next-fix items and fixed none; THIS run is
the fix arm for all three:

**F4a — curious singleton q_teach_me (2 hits).** Seed 34291 d71,
Benjamin + Carolina, pick `alive:want:curious`, key `"Teach me
something. Anything you know that I don't."` (characterGen.json:6022,
`q_teach_me`). The question is a SINGLETON — one `q` line in the def.
It was asked in an unsampled sitting earlier in the run, consuming the
line in the 48-entry run ledger; both sampled d71 sittings then drew
the same question and went dry. Root cause (traced this run):
`convoPickUnaskedQuestion` (convo-wants.js:3071) filters by askedQs /
village-wide askedAny but NEVER checks `convoWouldBlock` — and its
fallback branch (per-villager-unasked when the village-wide pool is
exhausted) deliberately re-serves already-asked questions. Fix: make
the pick ledger-aware — filter BOTH branches by
`!convoWouldBlock(vid, q.q)`, so a question whose line was recently
spoken is skipped and another is picked (or the want can't open,
honestly). This is the guard-at-the-source class (r209 F1), and it
fixes the whole singleton-question class, not just q_teach_me — so no
data variants are added. Proof test:
scripts/test-journey-succession-r224-curious-ledger-pick-20261116.js
(pick-skips-blocked / pick-returns-unblocked / pool-exhausted-null —
run RED on unfixed code first).

**F4b — recap reframe splice (second sighting, promoted).** Benjamin
d+14 (34291): `"Between us — Still on what's been happening."` — the
same reframe-prefix + `"Still on <topic>"` splice as r209's Maya
(`"Let me be straight — Still on that question."`). 1 of 19 "Still on"
recap lines on the r218 panel carries the splice; the other 18 are
clean. Root cause (traced this run): `convoRecapLine`
(conversation.js) returns a first (non-reframed) recap through
`voiceLine`, and a `"Still on X."` body is itself a re-anchor — a
voice opener stacked on it doubles the discourse marker. The openers
come from temperament/age/voice-state pools via voiceLine
(`"Let me be straight — "` bold, `"Between us — "` close-state).
Fix: a RE-ANCHOR guard inside voiceLine, same pattern as the existing
FAVOR-HEADS guard — lines matching `^"Still on ` never take an
opener (closers still allowed; an empty closer pool returns the line
undecorated, which the existing `if (!bit) return line` already
handles). This kills the splice class everywhere voiceLine is called,
not just recaps. Proof test:
scripts/test-journey-succession-r224-recap-voice-guard-20261116.js
(still-on-no-opener across temperaments/seeds / normal-line-still-
voiced / closer-still-allowed — run RED on unfixed code first).

**F4c — dlg:help re-speaks the opener's quote (1 hit).** Seed 34293
d105, Carl, pick `dlg:help`, key the Saad/pods line. The resume opener
quoted the Saad line as the thread snippet, then dlg:help's engageBeat
returned the SAME line and sayLine ledger-blocked it → dry. Root
cause (traced this run, correcting r218's shorthand): the opener quote
does NOT ledger the snippet (the opener is one structural sayLine
whose ledger key is its frame) — the block is `preRun:true`, i.e. the
seek_taken repeat-ack engageBeat line is FULLY DETERMINISTIC after
the first telling (`"Still nothing on ${first}. I told you about the
pods..."`, convo-wants.js), so any earlier sitting that spoke it
within the 48-entry run-ledger window blocks the re-ask. Two-layer
fix: (1) SOURCE — give the repeat-ack line variants via
convoPickCycle (3 honest phrasings, all keeping "still nothing" +
pods + first name), so repeats cycle instead of parroting; (2)
BACKSTOP — in the dlg:help handler (convo-dialogue.js), after
engageBeat returns favorLine and it is composed, if
`convoWouldBlock(vid, composed)` is true, fall to the nowant pool
instead of speaking it (the r209-F1 guard class, generalized from
r218's filed snippet-equality shape to the actual block predicate —
WouldBlock mirrors sayLine's block decision exactly for these
non-exempt lines). Proof test:
scripts/test-journey-succession-r224-help-block-guard-20261116.js
(blocked-falls-to-nowant / unblocked-speaks-verbatim / variants-cycle
/ control-successful-help-unchanged — run RED on unfixed code first).

No canon doc covers succession/mantle (docs/CANON.md grep: 0
mentions, re-checked this run, same as r54/r91/r94/r202/r209/r218).
No canon invented. No src/js change beyond the three fixes above
(convo-wants.js, conversation.js, convo-dialogue.js).

## Smoke-bar re-baseline (measurement maintenance, pre-registered)

r218's CONTROLS failed on a moved smoke snapshot and its A/B proved
base drift (d6 Heinrich→Sofia 11/1/21 → d7 Heinrich→Ashanti 10/2/33
on the r218 base); r218 proposed re-baselining the smoke bar to the
current-master snapshot. The base has moved again since (master
2fd2dad1f). This run re-baselines by measurement, not by adoption:
- S_pristine: smoke 33998 run on the PRISTINE worktree code (before
  fixes), recorded in evidence as
  journey-succession-r224-smoke-pristine-33998.stdout.json. Compared
  against r218's d7 Ashanti 10/2/33: equal = no base drift since r218;
  different = base drift, recorded as such.
- S_fixed: smoke 33998 run on the FIXED code as part of the panel.
  Compared against S_pristine: equal = the fixes move nothing on the
  smoke; different = the fixes shift it (F4b's voiceLine skip changes
  RNG draws on Still-on recaps — the named suspect), recorded as an
  RNG-draw effect, not a semantic change, provided the death record's
  shape stays sane (a handoff happened, funeral held, pick rank 1).
- The CONTROLS bar for this panel uses the RE-BASELINED snapshot
  S_fixed as the expected smoke snapshot. The bar is re-baselined by
  this prereg + the two measurements — not silently, and not
  mid-panel.

## Questions (r224)

(1) FIX VERIFICATION, F4a (binding): proof test ALL GREEN on the
    fixed code (and RED on unfixed code for the pick-skips-blocked
    case, run before the fix lands). Panel: 0 curious-singleton dry
    hits.
(2) FIX VERIFICATION, F4b (binding): proof test ALL GREEN on the
    fixed code (and RED on unfixed code, run before the fix lands).
    Panel transcript grep: 0 recap splices (a discourse opener
    prefixing a "Still on <topic>" body) across the panel's
    transcripts.
(3) FIX VERIFICATION, F4c (binding): proof test ALL GREEN on the
    fixed code (and RED on unfixed code, run before the fix lands).
    Panel: 0 dlg:help dry hits.
(4) WILD CHECK, r192 F1–F3 + r193 agency fix + r131 HEED + r191
    fresh-favor + r201 favor-settle + r132 nod-loop + r209 F1/F2
    + r218 F3 + r224 F4a/F4b/F4c (binding): 0 deflect_q
    dry-replacements, 0 refusal dry-replacements, 0 dlg:doubt
    dry-replacements, 0 agency-closer dry lines, 0 warn_you
    dry-replacements, 0 fresh-favor phantom re-asks, 0 dlg:help dry
    hits on the fresh panel. Any NEW dry line on a surface not yet
    pooled is the next fix item — file it, do not fix it in this run.
(5) MANTLE-FINE (binding, r170 rules): every bearer <redacted> hands
    the mantle to a living successor synchronously on the fresh
    band.
(6) DRY CENSUS (binding, extended per r187 metric review, AMENDED
    per r202 metric review): 0 ask:lately fellBack; 0 warn_you,
    0 confront, 0 deflect_q, 0 dlg:doubt dry-replacements; 0 dry
    lines on the carried same-class sites (exh closers, base
    more); 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY. Any dry hit
    fails the census, named-class or other-class — the analyzer
    is the judge; other-class hits are filed as next-fix items
    AND fail the run. Honest nonverbal fallbacks (r81 design)
    are listed, not counted.
(7) CONTROLS (binding, smoke bar RE-BASELINED per the A/B above):
    smoke 33998 at-death snapshot = S_fixed (measured this run,
    pre-panel on pristine code + on fixed code) + machinery (pick
    rank 1, funeral INCALL true, selfReq 0 on every seed). If the
    fixed-code snapshot differs from the pristine snapshot, the
    difference is attributed by the A/B (RNG-draw effect vs base
    drift) BEFORE adopting — a move with no attribution is an
    investigation item, not a re-baseline.
(8) Descriptive: CAP-NC bonded-by-deadline among eligible;
    denominator < 3 stays INSUFFICIENT-DATA. bondedEver reported
    descriptively.
(9) Watch: day-skips stay at zero (thirteenth straight panel watch).
(10) Descriptive, carried from r216 (C3c watch): resume openers
    naming a want whose favor changed within 14 days of planting
    (stale want label) — count qualifying cases; 0 qualifying
    cases keeps the watch open, a stale quote is a finding.
(11) Descriptive, carried from r216: recap-after-favor-commit
    reading "Nothing important" — count sittings where a favor
    commit is followed by a recap naming nothing; a second
    sighting (after 14461 d31) promotes it to a fix item.
    (r218: 0 sightings. Stays filed, not promoted.)

## Panel

- Driver: scripts/journey-succession-r224-20261116.js (r218 driver,
  rename only: r218 -> r224; seeds changed below; EVID 2026-11-16).
- Analyzer: scripts/analyze-journey-succession-r224-20261116.js
  (r218 analyzer, rename only; default PREFIX r224).
- Panel runner: scripts/run-journey-succession-r224-panel.sh (r218
  runner, rename only).
- Seeds: FRESH BAND 34301–34304 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control, re-baselined this run). Pilot first: seed 34301 alone to
  verify the driver runs clean on this base; then the remaining 3
  seeds sequentially, then smoke. The panel runner is launched with
  nohup so it survives the coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for 34301–34304: 0 hits each. Full-evidence grep for 34301/34302/
  34303/34304 across evidence/**/*.md: 0 hits in ANY file. No
  forbidden/contaminated band list names 3430x (no band list exists
  in the goal hidden_files).
- Band 34301–34304 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation. (Comparison: 34291–34294
  = r218 panel; 34281–34284 = r209; 34261–34264 = r202; 34251–34254 =
  r197; 34241–34244 = r193; 34231–34234 = r187; 34221–34224 = r183;
  34211–34218 = r181; 34201–34208 = r177; 34011–34018 = r169;
  33998 = standing smoke control.)

## Bars (binding, §14)

- MANTLE-FINE (binding, revised r170 rules): PASS — 0 flippedImmediate
  =false rows outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips.
- DRY CENSUS (binding, extended + amended): 0 ask:lately fellBack;
  0 warn_you, 0 confront, 0 deflect_q, 0 dlg:doubt dry-replacements;
  0 dry lines on the carried same-class sites (exh closers, base
  more); 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY; ANY other-class dry
  hit also fails. Honest nonverbal fallbacks listed, not counted.
- R192/R193/R131/R191/R201/R132/R209/R218 WILD CHECK (binding): 0
  deflect_q + 0 refusal + 0 dlg:doubt + 0 agency-closer + 0 warn_you
  dry hits + 0 fresh-favor phantom re-asks + 0 dlg:help dry hits on
  the fresh panel (same counts as the DRY CENSUS lines above, stated
  separately because these are landed-fix regressions if they fire).
- F4a/F4b/F4c FIX VERIFICATION (binding): proof tests ALL GREEN on
  the fixed code (RED on unfixed code first) + panel greps 0
  (curious-singleton dry hits; recap splices; dlg:help dry hits).
- CONTROLS (binding, smoke bar RE-BASELINED this run): smoke 33998
  at-death snapshot = S_fixed + MANTLE-FINE clean + pick rank 1,
  funeral INCALL true, selfReq 0 on every seed.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.

## What would count as interesting

- A curious-singleton dry hit on the panel (F4a fix regression —
  the run's headline finding).
- A recap splice on the panel (F4b fix regression).
- A dlg:help dry hit on the panel (F4c fix regression — the run's
  headline finding).
- A deflect_q / refusal / dlg:doubt / agency-closer / warn_you dry
  hit on the panel (landed-fix regression).
- A fresh-favor phantom re-ask on the panel (r191 fix regression).
- A nod-loop repeat (r132 fix regression).
- A NEW dry line on an unpooled surface (the next fix item).
- Any MANTLE-FINE miss on the fresh band (regression).
- Smoke A/B divergence: pristine-vs-fixed (fix RNG effect) or
  pristine-vs-r218-bar (base drift) — either is a finding, and an
  unattributed move is an investigation item.
- CAP-NC denominator >= 3 for the first time in several runs.

## Metric review (carried)

- r209/r218's telemetry baseline was NOT rolled (means-vs-sum
  mismatch documented in their run notes). This run runs
  telemetry-check against the succession baseline and reports LOUD
  lines; it does NOT roll the baseline forward until the mismatch
  is resolved.
- DRY CENSUS amendment stands (any dry hit fails).
- CONTROLS: the frozen smoke bar is re-baselined THIS run by the
  pre-registered A/B (see above) — the first re-baseline of the
  bar since r193.
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: thirteenth straight panel watch.
- Proof refresh rounds 11 + 12 remain owed (not this run's).
