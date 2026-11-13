# Journey succession r193 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r193 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r193 = next Lane B number after r192 crisis.
Base: master a1f2aa484 (sim-combatdedup-b landing) at run start.

## Standing state (why this run plays leg 7 fresh)

r187 succession (2026-11-12) landed the confront dry-replacement fix
and carried TWO next fix items: the deflect_q dry line (Desmond d48,
seed 34234) and the hardcoded refusal line ("Not this again."). BOTH
were fixed the same day by the crisis r192 run, which LANDED 2026-11-13
as master 4c4df500e: F1 deflect_q pool-picker
(`convoDeflectQLine`, conversation.js), F2 refusal pool (`refused`,
truth.js, via drawTruthLineUnblocked), F3 dlg:doubt probe pools
(convo-dialogue.js), F4 monsterNoun clause-verb gap, F5
question-shaped thread labels. r192 verified F1–F5 on crisis seeds
(39 transcripts, 0 deflect_q dry hits; 40/40 proof tests). This run
does NOT re-fix them. Its job is the WILD CHECK on succession seeds —
the leg where the F1 defect was found — plus the standing succession
bars, on a fresh panel, on the current base (which has since moved
through the sim-combatdedup-b landing: combat-line dedup, survival
byte-identical 8/8 per its commit message, so census headlines are
expected stable).

Stale-lock recovery at run start: the 08:00 CST occurrence's lock
(run_id 2026-11-13T14:07:41Z) had no registered worktree, no
heartbeat, and no journey2 tree on disk — dead per the overlap guard
(the 08:15–08:46 CST write flap killed that run before registration).
Lock deleted, this run's lock created (run_id
journey2-succession-20261113T1500Z). Registration was slow (~10.5 min:
the register script's internal reap + cold-index checkout after a VM
replacement at ~15:12Z, new boot bbb98318). Heartbeat loop r193 running
every 5 min from 15:18Z.

## Questions (r193)

(1) WILD CHECK, r192 F1–F3 (binding): on a fresh succession panel, do
the ledger-aware pool fixes hold — 0 deflect_q dry-replacements, 0
refusal dry-replacements, 0 dlg:doubt dry-replacements? The fixes are
ordered pools with no RNG on any path (original first, first variant
the ledger would not block), so a wild dry hit on any of these picks
would be a REGRESSION of a landed fix, not a re-proof. Any NEW dry
line on a surface not yet pooled is the next fix item (same class,
new surface) — file it, do not fix it in this run unless it is
trivially scoped with its own proof test.
(2) MANTLE-FINE (binding, r170 rules): does every bearer death hand
the mantle to a living successor synchronously on the fresh band?
(3) DRY CENSUS (binding, extended per r187 metric review): 0
ask:lately fellBack; 0 warn_you dry-replacements (r186 fix, wild
check); 0 confront dry-replacements (r187 fix, wild check); 0
deflect_q (F1, wild check); 0 dlg:doubt (F3, wild check); 0 dry lines
on the carried same-class sites (exh closers, base more); 0
AGENCY-DRY / TEACH-DRY / OPENER-DRY. The analyzer gains a machine
DRY-CENSUS section this run (r187 did it by manual grep); the section
counts sayTrace fellBack=true entries by pick and lists the honest
nonverbal exceptions (r81 design) separately.
(4) CONTROLS (binding, smoke bar RE-DERIVED this run): smoke 33998
on the current base. r187's metric review proposed 2/9/3/3/2
(deaths.bearer 2, census.alive 9, census.fallen 3, stage 3, mentions
2), proven on r187's pristine base (byte-identical headlines on the
fix branch). If this run's smoke reproduces 2/9/3/3/2, the bar is
adopted as re-derived; if it differs, investigate BEFORE adopting
(base drift vs fix effect — the fixes spend no RNG, so a move needs
an explanation). Machinery checks hold regardless: MANTLE-FINE clean,
pick rank 1, funeral INCALL true, selfReq 0 on every seed.
(5) Descriptive: does the CAP-NC bondedEver signal repeat (r181/r183/
r187: 2/2 probe-opened pairs bonded eventually)? No decisive
denominator is expected.
(6) Watch: day-skips stay at zero (eighth straight panel watch).

## Panel

- Driver: scripts/journey-succession-r193-20261113.js (r187 driver,
  rename only: r187 -> r193; seeds changed below; EVID 2026-11-13).
- Analyzer: scripts/analyze-journey-succession-r193-20261113.js
  (r187 analyzer, rename only + NEW DRY-CENSUS section over
  sayTrace fellBack=true, by pick, with the r81 honest-nonverbal
  exception listed separately).
- Panel runner: scripts/run-journey-succession-r193-panel.sh (r187
  runner, rename only).
- Seeds: FRESH BAND 34241–34244 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34241 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for each seed 34241–34244: 0 hits each. (Comparison: 34231–34234 =
  r187 panel; 34221–34224 = r183 panel; 34211–34218 = r181 panel;
  34201–34208 = r177 panel; 34011–34018 = r169 panel; 33998 =
  standing smoke control.) No forbidden/contaminated band list names
  3424x (no band list exists in the goal hidden_files).
- Band 34241–34244 is FRESH. The smoke seed 33998 is a re-run of the
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
- R192 WILD CHECK (binding): 0 deflect_q + 0 refusal + 0 dlg:doubt
  dry hits on the fresh panel (same count as the DRY CENSUS lines
  above, stated separately because these three are landed-fix
  regressions if they fire).
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

- A deflect_q / refusal / dlg:doubt dry hit on the panel (landed-fix
  regression — the run's headline finding).
- A NEW dry line on an unpooled surface (the next fix item, filed
  with its seed/day/villager/pick/key/sites).
- A warn_you or confront dry-replacement despite the r186/r187 fixes
  (regression, not re-proof).
- Any MANTLE-FINE miss on the fresh band (regression — the r192
  fixes touch conversation paths every sitting runs).
- Smoke headlines moving off 2/9/3/3/2 on the current base without
  an RNG explanation (base-drift investigation).
- A fifth straight panel with bondedEver 2/2 on probe-opened pairs
  (capacity signal strengthening while the denominator stays starved).
