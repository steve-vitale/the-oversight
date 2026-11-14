# Journey succession r197 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r197 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r197: the 18:00 CST succession attempt was
numbered r196 in its abort note but a crisis run already holds r196,
so this run takes r197 to stay unambiguous. Base: master 5f83ca93d
(reaper lock-skip) at run start.

## Standing state (why this run plays leg 7 fresh)

r193 succession LANDED 2026-11-13 as master 48ed1ffd7: fix 1f257d01f
(agency closer dry-line pool-picker in villager-agency.js,
convoWouldBlock pre-check). r193 verdicts on its fresh panel
(34241–34244 + smoke 33998): MANTLE-FINE PASS, DRY-CENSUS PASS (0 dry
hits), CAP-NC insufficient data (1/1 eligible bonded). Since r193's
base, master has moved through the r194 endgame landing (e2e35630c)
and the r195 social-life landing, plus sim-transplant3 commits and
the reaper commit — r195 touched conversation.js (favor-requirements
spend-out), so the smoke control is re-derived this run, not assumed.

The 18:00 CST succession attempt ABORTED on the worktree cap (16/16
active, a sibling registered in the gap after the reap). No play, no
fix, no merge; rotation-b stayed 7. This run retries on a freed
registry (reap at run start: 13/16 active, registration succeeded).

Carried standing questions (from r155, via the aborted r196 note):
the teach-narration dry (Black Walnut / Mayapple — a TEACH-DRY watch
item, line numbers drifted since r155), the carried agency dry
(r193's fix is the answer — this run wild-checks it), and the mantle
2-day latency owed item (fineLatency>=2 is a binding MANTLE-FINE
miss).

## Questions (r197)

(1) WILD CHECK, r192 F1–F3 + r193 agency fix (binding): on a fresh
succession panel, do the ledger-aware pool fixes hold — 0 deflect_q
dry-replacements, 0 refusal dry-replacements, 0 dlg:doubt
dry-replacements, 0 agency-closer dry lines? Any NEW dry line on a
surface not yet pooled is the next fix item (same class, new
surface) — file it, do not fix it in this run unless trivially scoped
with its own proof test.
(2) MANTLE-FINE (binding, r170 rules): does every bearer death hand
the mantle to a living successor synchronously on the fresh band?
(3) DRY CENSUS (binding, extended per r187 metric review): 0
ask:lately fellBack; 0 warn_you dry-replacements; 0 confront
dry-replacements; 0 deflect_q (F1); 0 dlg:doubt (F3); 0 dry lines on
the carried same-class sites (exh closers, base more); 0 AGENCY-DRY /
TEACH-DRY / OPENER-DRY. The r155 teach-narration dry is a TEACH-DRY
watch item inside this census: if it fires, it is the next fix, filed
with seed/day/villager/pick/key/sites.
(4) CONTROLS (binding, smoke bar RE-DERIVED this run): smoke 33998
on the current base. r193's bar was 2/9/3/3/2 (deaths.bearer 2,
census.alive 9, census.fallen 3, stage 3, mentions 2). If this run's
smoke reproduces 2/9/3/3/2, the bar is re-derived as adopted; if it
differs, investigate BEFORE adopting (base drift vs fix effect — the
fixes spend no RNG, so a move needs an explanation). Machinery checks
hold regardless: MANTLE-FINE clean, pick rank 1, funeral INCALL true,
selfReq 0 on every seed.
(5) Descriptive: does the CAP-NC bondedEver signal repeat (r181/r183/
r187/r193: probe-opened pairs bonded eventually)? No decisive
denominator is expected.
(6) Watch: day-skips stay at zero (ninth straight panel watch).

## Panel

- Driver: scripts/journey-succession-r197-20261113.js (r193 driver,
  rename only: r193 -> r197; seeds changed below; EVID 2026-11-13).
- Analyzer: scripts/analyze-journey-succession-r197-20261113.js
  (r193 analyzer, rename only; default PREFIX r197).
- Panel runner: scripts/run-journey-succession-r197-panel.sh (r193
  runner, rename only).
- Seeds: FRESH BAND 34251–34254 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34251 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for each seed 34251–34254: 0 hits each. (Comparison: 34241–34244 =
  r193 panel; 34231–34234 = r187 panel; 34221–34224 = r183 panel;
  34211–34218 = r181 panel; 34201–34208 = r177 panel; 34011–34018 =
  r169 panel; 33998 = standing smoke control.) No forbidden/
  contaminated band list names 3425x (no band list exists in the goal
  hidden_files).
- Band 34251–34254 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation.

## Bars (binding, §14)

- MANTLE-FINE (binding, revised r170 rules): PASS — 0 flippedImmediate
  =false rows outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips.
- DRY CENSUS (binding, extended): 0 ask:lately fellBack; 0 warn_you,
  0 confront, 0 deflect_q, 0 dlg:doubt dry-replacements; 0 dry lines
  on the carried same-class sites (exh closers, base more); 0
  AGENCY-DRY / TEACH-DRY / OPENER-DRY. Honest nonverbal fallbacks
  (r81 design) are listed, not counted.
- R192 WILD CHECK + R193 AGENCY WILD CHECK (binding): 0 deflect_q +
  0 refusal + 0 dlg:doubt + 0 agency-closer dry hits on the fresh
  panel (same count as the DRY CENSUS lines above, stated separately
  because these are landed-fix regressions if they fire).
- CONTROLS (binding, smoke bar re-derived): smoke 33998 headlines
  2/9/3/3/2 (adopted if reproduced on this base; any difference is
  investigated first) + MANTLE-FINE clean + pick rank 1, funeral
  INCALL true, selfReq 0 on every seed.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.

## What would count as interesting

- A deflect_q / refusal / dlg:doubt / agency-closer dry hit on the
  panel (landed-fix regression — the run's headline finding).
- The r155 teach-narration dry firing (TEACH-DRY) — the next fix
  item, filed with its seed/day/villager/pick/key/sites.
- A NEW dry line on an unpooled surface (the next fix item).
- A warn_you or confront dry-replacement despite the r186/r187 fixes
  (regression, not re-proof).
- Any MANTLE-FINE miss on the fresh band (regression — r194/r195
  touched conversation paths every sitting runs).
- Smoke headlines moving off 2/9/3/3/2 on the current base without
  an RNG explanation (base-drift investigation).
- A sixth straight panel with bondedEver 2/2 on probe-opened pairs
  (capacity signal strengthening while the denominator stays starved).

## Metric review (carried)

- r193's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in its run note). This run runs telemetry-check against
  the succession baseline and reports LOUD lines; it does NOT roll
  the baseline forward until the mismatch is resolved.
- Proof refresh rounds 11 + 12 remain owed (r192 + r194 + r195 +
  r193 all changed src/js since b10's panel). This run does not own
  that refresh; it reports its own gate only.
