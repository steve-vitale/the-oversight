# Journey succession r209 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r209 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r209: follows crisis r208 (today). Base: master
783487438 at run start (journey-crisis r208). Lock:
playtest-loop-2.lock run_id journey2-succession-20261115T055546Z (own,
created at run start; no prior lock present).

## Standing state (why this run plays leg 7, and what it fixes)

r202 succession LANDED 2026-11-14 (adoption final tip, gate 333/7 GO,
0 attributable): MANTLE-FINE PASS, CONTROLS PASS, CAP-NC PASS (3/3
eligible — first full denominator), DRY CENSUS **FAIL — 1 other-class
hit** (dlg:help, seed 34262 d85 Logan: the cistern ask run-blocked,
"...Sorry, lost my train of thought."). r202 filed two next-fix items
and fixed neither; THIS run is the fix arm for both:

**F1 — dlg:help dry (binding fix).** Traced this run (r202 left the
blocking rule UNTRACED): preRun=true, preSelf=false — a RUN-LEDGER
block. The water_haul favor line is templated (3 openers x 3 asks over
a village-wide cistern level = 9 combos), so another villager stating
the identical ask recently refuses Logan's identical line. The
deferred-opener branch of ask_favor.engageBeat (convo-wants.js) returned
the ask with NO ledger guard — while the whyLine branch directly above
it carries the r147/r151/r166 guard. Fix: same guard at the source —
if the deferred ask would block, try the three fresh need phrasings in
order; return null when all are blocked so the caller falls back to
its own graceful line (dlg:help's nowant pool). Proof test:
scripts/test-journey-succession-r209-deferred-ask-block-20261115.js
(engage / allblocked / control / ledger — ALL GREEN pre-panel).

**F2 — favor-block direction quoted as memory (second seam).** Traced
this run: the resume opener quoted 'Your partner is inside the Haven
hall. Go through the door to meet them.' — the favor-water.js line-92
inside/outside mismatch block, which carries NO reasonKey, so the r130
rotation never applies and the raw direction is spoken through sayLine
and noted as the 'want' thread's last beat, then planted as the
thread's memory snippet. Fix: sayLine accepts opts.noBeat (line still
spoken, ledgered, voiced — never thread content); the favor handler
passes noBeat for BLOCKED favor lines only. Proof test:
scripts/test-journey-succession-r209-favorblock-nobeat-20261115.js
(handler / direct / control — ALL GREEN pre-panel; the handler case
reproduces Logan's exact spoken line with the thread memory staying
the favor ask).

No canon doc covers succession/mantle (grep empty, same as r54/r91/
r94/r202). No canon invented. No src/js change beyond the two fixes
above (convo-wants.js, conversation.js, convo-dialogue.js).

## Questions (r209)

(1) FIX VERIFICATION, dlg:help (binding): on a fresh succession panel
with the fix, 0 dlg:help dry-replacements — the r202 hit must not
recur. Any dlg:help dry hit is a fix regression (headline finding).
(2) FIX VERIFICATION, favor-block snippet (descriptive, post-panel
grep): 0 resume-opener quotes containing a favor-block direction line
("Haven hall", "Go through the door", "same side of the Haven door")
across the panel's transcripts. A recurrence is a fix regression.
(3) WILD CHECK, r192 F1–F3 + r193 agency fix + r131 HEED + r191
fresh-favor + r201 favor-settle + r132 nod-loop + r209 F1/F2
(binding): 0 deflect_q dry-replacements, 0 refusal dry-replacements,
0 dlg:doubt dry-replacements, 0 agency-closer dry lines, 0 warn_you
dry-replacements, 0 fresh-favor phantom re-asks on the fresh panel.
Any NEW dry line on a surface not yet pooled is the next fix item —
file it, do not fix it in this run.
(4) MANTLE-FINE (binding, r170 rules): every bearer death hands the
mantle to a living successor synchronously on the fresh band.
(5) DRY CENSUS (binding, extended per r187 metric review, AMENDED per
r202 metric review): 0 ask:lately fellBack; 0 warn_you, 0 confront,
0 deflect_q, 0 dlg:doubt dry-replacements; 0 dry lines on the carried
same-class sites (exh closers, base more); 0 AGENCY-DRY / TEACH-DRY /
OPENER-DRY. **Amendment (r202 proposal, adopted here): any dry hit
fails the census, named-class or other-class — the analyzer is the
judge; other-class hits are filed as next-fix items AND fail the run.**
Honest nonverbal fallbacks (r81 design) are listed, not counted.
(6) CONTROLS (binding, r193 REVISED smoke bar): smoke 33998
at-death snapshot d6 Heinrich→Sofia, alive 11, fallen 1, newTrust 21
+ machinery (pick rank 1, funeral INCALL true, selfReq 0 on every
seed). If the snapshot differs, investigate BEFORE adopting (base
drift vs fix effect — the fixes spend no RNG, so a move needs an
explanation).
(7) Descriptive: CAP-NC bonded-by-deadline among eligible;
denominator < 3 stays INSUFFICIENT-DATA. bondedEver reported
descriptively.
(8) Watch: day-skips stay at zero (eleventh straight panel watch).

## Panel

- Driver: scripts/journey-succession-r209-20261115.js (r202 driver,
  rename only: r202 -> r209; seeds changed below; EVID 2026-11-15).
- Analyzer: scripts/analyze-journey-succession-r209-20261115.js
  (r202 analyzer, rename only; default PREFIX r209).
- Panel runner: scripts/run-journey-succession-r209-panel.sh (r202
  runner, rename only).
- Seeds: FRESH BAND 34281–34284 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34281 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for each seed 34281–34284: 0 hits each. First choice 34271–34274
  REJECTED: 34274 is named in evidence/2026-11-05/
  sim-grindfinish-b-prereg.md (`:34274` — a wave-4+ TB fight tile
  reference); per the skill a named band is used even without a judged
  corpus. Full-evidence grep for 3428[1-4] hits only pantryKcal
  VALUES (34281/34282/34284) in Oct 12/15 measurement JSONs
  (kcal-r8-pilot.json, kcal-r8-winseek-after.json, perseed
  tribhealth/belongfeast/leadfeast) — measurements, not seed
  reservations. No forbidden/contaminated band list names 3428x (no
  band list exists in the goal hidden_files).
- Band 34281–34284 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation. (Comparison: 34261–34264
  = r202 panel; 34251–34254 = r197; 34241–34244 = r193; 34231–34234 =
  r187; 34221–34224 = r183; 34211–34218 = r181; 34201–34208 = r177;
  34011–34018 = r169; 33998 = standing smoke control.)

## Bars (binding, §14)

- MANTLE-FINE (binding, revised r170 rules): PASS — 0 flippedImmediate
  =false rows outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips.
- DRY CENSUS (binding, extended + amended): 0 ask:lately fellBack;
  0 warn_you, 0 confront, 0 deflect_q, 0 dlg:doubt dry-replacements;
  0 dry lines on the carried same-class sites (exh closers, base
  more); 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY; ANY other-class dry
  hit also fails. Honest nonverbal fallbacks listed, not counted.
- R192/R193/R131/R191/R201/R132/R209 WILD CHECK (binding): 0
  deflect_q + 0 refusal + 0 dlg:doubt + 0 agency-closer + 0 warn_you
  dry hits + 0 fresh-favor phantom re-asks + 0 dlg:help dry hits on
  the fresh panel (same counts as the DRY CENSUS lines above, stated
  separately because these are landed-fix regressions if they fire).
- CONTROLS (binding, r193 REVISED smoke bar): smoke 33998 at-death
  snapshot d6 Heinrich→Sofia, alive 11, fallen 1, newTrust 21 +
  MANTLE-FINE clean + pick rank 1, funeral INCALL true, selfReq 0
  on every seed.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.

## What would count as interesting

- A dlg:help dry hit on the panel (F1 fix regression — the run's
  headline finding).
- A favor-block direction quoted in a resume opener (F2 fix
  regression — found by the post-panel transcript grep).
- A deflect_q / refusal / dlg:doubt / agency-closer / warn_you dry
  hit on the panel (landed-fix regression).
- A fresh-favor phantom re-ask on the panel (r191 fix regression).
- A nod-loop repeat (r132 fix regression).
- A NEW dry line on an unpooled surface (the next fix item).
- Any MANTLE-FINE miss on the fresh band (regression).
- Smoke at-death snapshot moving off d6/11/1/21 on the current base
  without an RNG explanation (base-drift investigation).

## Metric review (carried)

- r202's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in its run note). This run runs telemetry-check against
  the succession baseline and reports LOUD lines; it does NOT roll
  the baseline forward until the mismatch is resolved.
- DRY CENSUS amendment adopted (see Q5): the analyzer fails on any
  dry hit; the prereg now states that explicitly, closing r202's
  open question.
- Proof refresh rounds 11 + 12 remain owed (not this run's).
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: eleventh straight panel watch.
