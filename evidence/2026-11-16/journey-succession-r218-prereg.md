# Journey succession r218 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r218 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r218: follows crisis r216 (2026-11-15) and
establishment r217 (Lane A). Base: master 5e0bba6e5 at run start
(sim-courtship-confirm-b). Lock: playtest-loop-2.lock run_id
oversight-playtest-loop-2-20261116T005726Z (own, created at run start;
no prior lock present).

## Standing state (why this run plays leg 7, and what it fixes)

r209 succession LANDED 2026-11-15 (adoption gate 334/6 GO, 0
attributable): MANTLE-FINE PASS (eleventh straight zero panel),
DRY CENSUS PASS 0 dry hits under the stricter any-hit-fails rule,
CONTROLS PASS, CAP-NC INSUFFICIENT-DATA (1/1 eligible). r209 fixed
F1 (deferred-ask ledger guard) and F2 (favor-block direction lines
never become thread memory, via sayLine opts.noBeat) and left one
same-class surface UNVERIFIED: the dlg:commit gate reason at
convo-dialogue.js:617. THIS run traces it and fixes it if it fires.

**F3 — commit-refusal lines become thread memory (traced this run).**
The dlg:commit handler in src/js/convo-dialogue.js speaks refusal
reasons through sayLine with NO noBeat flag, on three sites:

- **Site C (MENU-REACHABLE, headline).** A water_haul favor in
  'asked' state with the partner away: convoFavorActionMenu offers
  dlg:commit (convo-wants.js:936 passes canPromise =
  favor.state==='asked'; waterFavorAction's away block carries no
  `unsupported` and no `canPromise:false`, so the menu gate at
  convo-wants.js:2378 passes). Pressing it calls convoFavorCommit,
  whose R72/R113 away guard (convo-wants.js:2251) returns
  {ok:false, away:true, line: away line}; the handler speaks that
  line as `beat` via sayLine (convo-dialogue.js, main commit path)
  and sayLine notes every spoken line as the want thread's beat —
  so the refusal ("away from Haven, no dawn meet promised while
  out") can be planted as the thread's memory snippet and quoted in
  the next sitting's resume opener as if the NPC had said it about
  the water haul. Same shape as r209 F2, different site.
- **Site A (defense-in-depth, menu-hidden).** stay_close gate fails
  (companyFavorCommitGate !ok, e.g. legacy companyVersion or a
  passed night) → early return speaks gate.reason via sayLine,
  no noBeat. The menu already hides dlg:commit when the gate fails
  (convo-dialogue.js comment), so menu-faithful players never reach
  it — but any future caller that reaches the handler without the
  menu gate re-opens the seam.
- **Site B (defense-in-depth, menu-hidden).** convoFavorAction
  unsupported (e.g. the water_haul inside/outside mismatch — the
  SAME door-direction line r209 F2 protected on the
  dlg:favor_requirements path) → early return speaks the reason
  via sayLine, no noBeat. Menu-hidden (status.unsupported), same
  defense-in-depth note as A.

**Fix (this run, before the panel):** noBeat on sites A and B
(refusals only, spoken line unchanged); conditional
`noBeat: !committed` on the main-path sayLine — a successful
commit's thank-you beat is real conversation content and MUST
still become thread content. Proof test:
scripts/test-journey-succession-r218-commit-refusal-nobeat-20261116.js
(commit-away / commit-gate / commit-unsupported / control — run
RED on unfixed code first to prove the seam, then GREEN after
the fix).

No canon doc covers succession/mantle (docs/CANON.md grep: 0
mentions, re-checked this run, same as r54/r91/r94/r202/r209).
No canon invented. No src/js change beyond the F3 fix above
(convo-dialogue.js only).

## Questions (r218)

(1) FIX VERIFICATION, commit-refusal noBeat (binding): proof test
    ALL GREEN on the fixed code (and RED on unfixed code for the
    refusal cases, run before the fix lands).
(2) FIX VERIFICATION, wild (descriptive, post-panel transcript
    grep): 0 resume-opener quotes containing a commit-refusal line
    ("away from Haven", "no dawn meet", "new meeting night",
    "That night is over", the door-direction lines) across the
    panel's transcripts. A recurrence is a fix regression.
(3) WILD CHECK, r192 F1–F3 + r193 agency fix + r131 HEED + r191
    fresh-favor + r201 favor-settle + r132 nod-loop + r209 F1/F2
    + r218 F3 (binding): 0 deflect_q dry-replacements, 0 refusal
    dry-replacements, 0 dlg:doubt dry-replacements, 0 agency-closer
    dry lines, 0 warn_you dry-replacements, 0 fresh-favor phantom
    re-asks, 0 dlg:help dry hits on the fresh panel. Any NEW dry
    line on a surface not yet pooled is the next fix item — file
    it, do not fix it in this run.
(4) MANTLE-FINE (binding, r170 rules): every bearer death hands
    the mantle to a living successor synchronously on the fresh
    band.
(5) DRY CENSUS (binding, extended per r187 metric review, AMENDED
    per r202 metric review): 0 ask:lately fellBack; 0 warn_you,
    0 confront, 0 deflect_q, 0 dlg:doubt dry-replacements; 0 dry
    lines on the carried same-class sites (exh closers, base
    more); 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY. Any dry hit
    fails the census, named-class or other-class — the analyzer
    is the judge; other-class hits are filed as next-fix items
    AND fail the run. Honest nonverbal fallbacks (r81 design)
    are listed, not counted.
(6) CONTROLS (binding, r193 REVISED smoke bar): smoke 33998
    at-death snapshot d6 Heinrich→Sofia, alive 11, fallen 1,
    newTrust 21 + machinery (pick rank 1, funeral INCALL true,
    selfReq 0 on every seed). If the snapshot differs,
    investigate BEFORE adopting (base drift vs fix effect — the
    fix spends no RNG, so a move needs an explanation).
(7) Descriptive: CAP-NC bonded-by-deadline among eligible;
    denominator < 3 stays INSUFFICIENT-DATA. bondedEver
    reported descriptively.
(8) Watch: day-skips stay at zero (twelfth straight panel watch).
(9) Descriptive, carried from r216 (C3c watch): resume openers
    naming a want whose favor changed within 14 days of planting
    (stale want label) — count qualifying cases; 0 qualifying
    cases keeps the watch open, a stale quote is a finding.
(10) Descriptive, carried from r216: recap-after-favor-commit
    reading "Nothing important" — count sittings where a favor
    commit is followed by a recap naming nothing; a second
    sighting (after 14461 d31) promotes it to a fix item.
(11) Descriptive: Maya-style recap splice ("Let me be straight —
    Still on that question") — count occurrences; a second
    sighting promotes it to a fix item.

## Panel

- Driver: scripts/journey-succession-r218-20261116.js (r209 driver,
  rename only: r209 -> r218; seeds changed below; EVID 2026-11-16).
- Analyzer: scripts/analyze-journey-succession-r218-20261116.js
  (r209 analyzer, rename only; default PREFIX r218).
- Panel runner: scripts/run-journey-succession-r218-panel.sh (r209
  runner, rename only).
- Seeds: FRESH BAND 34291–34294 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34291 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for each seed 34291–34294: 0 hits each. Full-evidence grep for
  3429[1-4] hits only Oct 13/15 measurement JSONs (r8-after.json,
  sim-plentycap-pilot.json, etc.) — pantryKcal / pantryFresh values,
  not seed reservations (same class as r209's 3428x hits). No
  forbidden/contaminated band list names 3429x (no band list exists
  in the goal hidden_files). Goal hidden_files grep for 3429[1-4]:
  0 hits.
- Band 34291–34294 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation. (Comparison: 34281–34284
  = r209 panel; 34261–34264 = r202; 34251–34254 = r197; 34241–34244 =
  r193; 34231–34234 = r187; 34221–34224 = r183; 34211–34218 = r181;
  34201–34208 = r177; 34011–34018 = r169; 33998 = standing smoke
  control.)

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
- F3 PROOF (binding): proof test ALL GREEN on fixed code; refusal
  cases RED on unfixed code (demonstrated before the fix).
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

- A commit-refusal line quoted in a resume opener on the panel
  (F3 fix regression — the run's headline finding).
- A commit-away case RED on unfixed code that stays RED after the
  fix (fix miss).
- A deflect_q / refusal / dlg:doubt / agency-closer / warn_you dry
  hit on the panel (landed-fix regression).
- A fresh-favor phantom re-ask on the panel (r191 fix regression).
- A nod-loop repeat (r132 fix regression).
- A NEW dry line on an unpooled surface (the next fix item).
- A C3c stale-want resume opener (the r216 watch, first sighting).
- A second recap-after-favor-commit "Nothing important" (r216
  follow-up, promotes to fix item).
- A second Maya-style recap splice (promotes to fix item).
- Any MANTLE-FINE miss on the fresh band (regression).
- Smoke at-death snapshot moving off d6/11/1/21 on the current base
  without an RNG explanation (base-drift investigation).

## Metric review (carried)

- r202's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in its run note, carried through r209). This run runs
  telemetry-check against the succession baseline and reports LOUD
  lines; it does NOT roll the baseline forward until the mismatch
  is resolved.
- DRY CENSUS amendment adopted (see Q5): the analyzer fails on any
  dry hit; the prereg now states that explicitly.
- Proof refresh rounds 11 + 12 remain owed (carried from r209;
  more keys stale after this landing — hierarchy.js changed,
  per r216).
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: twelfth straight panel watch.
