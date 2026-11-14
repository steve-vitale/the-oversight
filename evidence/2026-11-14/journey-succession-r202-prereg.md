# Journey succession r202 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r202 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r202: follows crisis r201 (today). Base: master
e500f1956 at run start (H1 transplant round coordinator evidence).
Lock: playtest-loop-2.lock run_id 2026-11-14T14:55:51Z (own, created
at run start; no prior lock present).

## Standing state (why this run plays leg 7 fresh)

r197 succession LANDED 2026-11-13 (adoption final tip 443255263):
MANTLE-FINE PASS, DRY CENSUS PASS (0 dry hits), R192/R193 WILD CHECK
PASS, CONTROLS PASS under the REVISED smoke bar (at-death snapshot
d6 Heinrich→Sofia, alive 11, fallen 1, newTrust 21 + machinery),
CAP-NC INSUFFICIENT-DATA (1/2 eligible; bondedEver streak broke
1/3). Carried items CLOSED in r197: r155 teach-narration dry
(unreproduced on two clean panels), carried agency dry (r193 fix
verified in the wild), mantle 2-day latency owed item (0 latency>=2
across 12 deaths). Day-skips 0 — ninth straight panel.

Since r197's adoption tip, master moved 443255263 → e500f1956.
src/js changes in that range (the reason this panel re-runs):
- conversation.js (+128 lines): r131 HEED fix (warn_you now engages
  the want, 63c051206); r191 stage-0 guard fresh-favor reorder —
  H1 phantom re-ask fix (4c860321d); fusionoffer-b prize-bag gating
  (afa416371); r201 favor-want settle gate (f1871e37b); r132 nod-loop
  fix — repeat nv: gesture thins the sitting (3bffd4752).
- abilityActions.js: rage precheck (e73ee835d) + retribution
  death-line deferral (already in r197's second rebase range).
- contests.js, game.js: small (8/9 lines).
Every one of those conversation.js changes touches a path a
succession sitting runs through (warn_you, favor settle, nod-loop,
fresh-favor). The panel re-verifies the landed fixes hold on the
new base; it does not re-litigate them.

## Questions (r202)

(1) WILD CHECK, r192 F1–F3 + r193 agency fix + r131 HEED + r191
fresh-favor + r201 favor-settle + r132 nod-loop (binding): on a
fresh succession panel, do the ledger-aware pool fixes hold — 0
deflect_q dry-replacements, 0 refusal dry-replacements, 0 dlg:doubt
dry-replacements, 0 agency-closer dry lines, 0 warn_you
dry-replacements, 0 fresh-favor phantom re-asks? Any NEW dry line
on a surface not yet pooled is the next fix item — file it, do not
fix it in this run unless trivially scoped with its own proof test.
(2) MANTLE-FINE (binding, r170 rules): does every bearer death hand
the mantle to a living successor synchronously on the fresh band?
(3) DRY CENSUS (binding, extended per r187 metric review): 0
ask:lately fellBack; 0 warn_you dry-replacements; 0 confront
dry-replacements; 0 deflect_q (F1); 0 dlg:doubt (F3); 0 dry lines on
the carried same-class sites (exh closers, base more); 0 AGENCY-DRY /
TEACH-DRY / OPENER-DRY. Honest nonverbal fallbacks (r81 design) are
listed, not counted.
(4) CONTROLS (binding, r193 REVISED smoke bar): smoke 33998
at-death snapshot d6 Heinrich→Sofia, alive 11, fallen 1, newTrust
21 + machinery (pick rank 1, funeral INCALL true, selfReq 0 on
every seed). If the snapshot differs, investigate BEFORE adopting
(base drift vs fix effect — the fixes spend no RNG, so a move
needs an explanation).
(5) Descriptive: CAP-NC bonded-by-deadline among eligible;
denominator < 3 stays INSUFFICIENT-DATA. bondedEver reported
descriptively.
(6) Watch: day-skips stay at zero (tenth straight panel watch).

## Panel

- Driver: scripts/journey-succession-r202-20261114.js (r197 driver,
  rename only: r197 -> r202; seeds changed below; EVID 2026-11-14).
- Analyzer: scripts/analyze-journey-succession-r202-20261114.js
  (r197 analyzer, rename only; default PREFIX r202).
- Panel runner: scripts/run-journey-succession-r202-panel.sh (r197
  runner, rename only).
- Seeds: FRESH BAND 34261–34264 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34261 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for each seed 34261–34264: 0 hits each. (Comparison: 34251–34254 =
  r197 panel; 34241–34244 = r193 panel; 34231–34234 = r187 panel;
  34221–34224 = r183 panel; 34211–34218 = r181 panel; 34201–34208 =
  r177 panel; 34011–34018 = r169 panel; 33998 = standing smoke
  control.) No forbidden/contaminated band list names 3426x (no band
  list exists in the goal hidden_files).
- Band 34261–34264 is FRESH. The smoke seed 33998 is a re-run of the
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
- R192/R193/R131/R191/R201/R132 WILD CHECK (binding): 0 deflect_q +
  0 refusal + 0 dlg:doubt + 0 agency-closer + 0 warn_you dry hits +
  0 fresh-favor phantom re-asks on the fresh panel (same counts as
  the DRY CENSUS lines above, stated separately because these are
  landed-fix regressions if they fire).
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

- A deflect_q / refusal / dlg:doubt / agency-closer / warn_you dry
  hit on the panel (landed-fix regression — the run's headline
  finding).
- A fresh-favor phantom re-ask on the panel (r191 fix regression).
- A nod-loop repeat (r132 fix regression: a sitting looping on
  repeat nv: gesture).
- The r155 teach-narration dry firing (TEACH-DRY) — the next fix
  item, filed with seed/day/villager/pick/key/sites.
- A NEW dry line on an unpooled surface (the next fix item).
- Any MANTLE-FINE miss on the fresh band (regression — r131/r132/
  r191/r201 all touched conversation paths every sitting runs).
- Smoke at-death snapshot moving off d6/11/1/21 on the current base
  without an RNG explanation (base-drift investigation).
- A seventh straight panel with bondedEver 2/2 on probe-opened pairs
  (capacity signal strengthening while the denominator stays starved).

## Metric review (carried)

- r197's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in its run note). This run runs telemetry-check against
  the succession baseline and reports LOUD lines; it does NOT roll
  the baseline forward until the mismatch is resolved. The mismatch
  itself (baseline stores per-seed means, tool sums current files)
  is a standing item for the next run that touches it — either the
  baseline is re-derived from a current panel or the check compares
  means.
- Proof refresh rounds 11 + 12 remain owed (r192 + r194 + r195 +
  r193 + r131 + r132 + r191 + r201 all changed src/js since b10's
  panel; proofrefresh-b16 closed round 16 on a different manifest
  line — the succession gate's stale receipts are still owed by
  the proof-refresh round). This run does not own that refresh; it
  reports its own gate only.
- CAP-NC: no revision — the denominator stays starved by design
  (longer panel or earlier-arrival band, per r183).
- DRY CENSUS: keep as is; it caught nothing because there was
  nothing to catch, and its machine section is the reason we know
  that rather than guessing.
