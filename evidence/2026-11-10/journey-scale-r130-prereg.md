# journey-scale r130 — PRE-REGISTER (lane A, leg 3 SCALE, trust-drain decomposition + succession voicing)

**Run id:** `playtest-loop-a-20261111T012520Z` (lock run_id `2026-11-11T01:25:20Z`).
**Run:** scheduled Tue 2026-11-10 18:45 CST (2026-11-11 00:45 UTC); this run 01:25Z–.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `ed33b42b8` (r129 landing).
**LOUD — origin/master diverged:** `git pull --ff-only` fails ("Not possible to
fast-forward"); origin/master is 156 commits ahead of local HEAD and local HEAD
is 490 ahead of origin/master (Cursor PRs #120/#121 on origin; months of loop
work local). Known standing condition (r127 noted it too); the ship loop owns
origin sync. This run works on LOCAL master only: no push, no rebase onto
origin, no divergence repair. Flagged here, not fixed here.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**DELIVER OVER MEASURE (2026-11-01):** this run BUILDS the r93 follow-up #1
(the trust-delta decomposition instrument, named 2026-11-03, unbuilt until
now) and FIXES what it finds. It does not re-prove the tend verb (r92/r93
settled), the scholar-counts fix (r127 settled), or the favour-line variety
(r129 — its rotation-vs-hash question goes to the next DEEPENING run).

## Standing context (read before scoring)

- **r93 (2026-11-03) follow-up #1, UNBUILT:** covenant trust-delta
  decomposition instrument. r93's Stonebridge fell 30→14 across five
  "league holds (trust +8)" concessions; same-day arithmetic left ~10 points
  unexplained. Named next step: per-day trust-delta instrument; no wording
  or number change until the drain is attributed.
- **r127 ladder band (97901–97904, Arm A WITH wideduty, base fe45ff679):**
  national 1/4 (97904 trade, d114, answered sign); leadSeasoned max 2 on
  3/4 seeds (one short of 3); tradeSeasoned max 0/1/1/3; lesser seat priced
  4/4; full seat 0/4; 3 villages died d109–d136, 97904 lived to the d180 cap.
- **The r127 trustset logs (on disk, analyzed by this run's analyzer
  BEFORE the panel):** the drain is the succession-crisis cycle. Per seed:
  covenantCrisis −60/−270/−240/−240 (6/27/24/24 events), successionCrisis
  −80/−112/−160/−128 (10/14/21/16), vs concede +40/+184/+168/+192,
  tend +40/+32/0/+56, deed gains +21/+40/+165/+137. Net trust per seed:
  −4/−53/−104/+87. The survivor (97904) outruns the bleed with tends +
  deed gains; the dying villages cannot. Every speaker death shakes every
  peer link −10 (voiced "(Trust -10.)") and every lead link −8
  (UNVOICED — no amount in any say line or book note), and the concede buys
  back +8 (voiced "(Trust +8.)"): net −2 per succession per link.
- **Analyzer:** `scripts/analyze-journey-scale-r130-trustdelta-20261110.js`
  (NEW, this run). Attributes every delta to its first src/js writer frame
  (`fn@file:line`, _trustGain resolved to its caller); chain-walks each
  link's deltas (a break is a link replacement — snapshots show the formed
  day changing — or a GAP); flags drains ≤ −4 with no same-day book note
  naming the amount. On the r127 band it reads: recon OK (zero GAPs) and
  unattributed 0.0% on all 4 seeds; voiced NO-GO with exactly five writers:
  successionCrisis@1951 (8/11/15/13), successionCrisis@1938 (2/1/4/3),
  linkTick@1495 (7, 97903 — arrears −6 / sabotage −4), answerDemand@1617
  (3, 97903 — refuse −15), answerTradeCall@3621 (1, 97904 — refuse −4).
  The r93 words-vs-numbers gap is REAL and located: the succession −8 is
  never named anywhere, while the crisis −10 and concede +8 are both named.
- **Code-read verification of each flagged writer (done in-run, hierarchy.js):**
  - successionCrisis −8 (lines 1938 young-link, 1951 main path): the say
    lines talk about the speaker being installed / tribute moving / "the
    link holds" — no amount anywhere. The notes name no amount. DEFECT.
  - theirLeaderDied −8 (mirror of successionCrisis, other village's speaker
    dies): same shape, say lines name no amount. Same defect family; the
    fix covers it although it never fired on the r127 band.
  - linkTick arrears −6 (line 1280) / sabotage −4 (line 1307): the notes
    name arrears kcal, not the trust amount; the says (40% / 50% of the
    time) name arrears kcal, not the trust amount. DEFECT, same class.
  - answerDemand refuse −15 (line 1617): the say names the resulting trust
    LEVEL ("trust: 48") but not the −15 delta; the note names no amount.
    DEFECT (note only — the say already states the level).
  - answerTradeCall refuse −4 (line 3621): the say DOES name "(Trust -4.)";
    the note names no amount. DEFECT (note only).
  - NOT defects: covenantCrisis −10 (say + note name it), titanEscalate −5
    (say + note name it), _resolveRenegotiation −6 (note names it), pool
    shortfall −4 (note names it), tribute-thin −1 / tribute-none −2 (says
    name them). The r127 tail cases (d109/d137 deltas with no captured note)
    are final-endDay instrument edges, excluded by the analyzer's finalDay
    rule — not game gaps.

## The fix (this run, in the worktree)

VOICING ONLY — no number changes, no thresholds, no bars (gating freeze
intact). Add the trust amount to the say line and the book note in the
existing house pattern ("(Trust -N.)" in says, "(trust -N)" in notes;
cf. covenantCrisis, titanEscalate, answerTradeCall-refuse):
- `src/js/hierarchy.js` successionCrisis: "(Trust -8.)" on the young-link,
  leverage, spent-card, and subordinate-tests say lines; "(trust -8)" on
  the corresponding _linkNote texts (including the SUCCGRACE note).
- `src/js/hierarchy.js` theirLeaderDied: "(Trust -8.)" on its say lines,
  "(trust -8)" on its notes (same −8, same gap; proof-tested directly
  although it never fired on the r127 band).
- `src/js/hierarchy.js` linkTick arrears (1280): "(Trust -6.)" on the say,
  "(trust -6)" on the note. Sabotage (1307): "(Trust -4.)" on the say,
  "(trust -4)" on the note.
- `src/js/hierarchy.js` answerDemand refuse (1617): "(trust -15)" on the
  note only (the say already states the resulting trust level).
- `src/js/hierarchy.js` answerTradeCall refuse (3621): "(trust -4)" on the
  note only (the say already has "(Trust -4.)").
- `src/js/hierarchy.js` answerDefenseCall refuse (3580): "(trust -10)" on
  the note only (the say already has "(Trust -10 across the league.)";
  never fired on the r127 band — book-consistency fix in the same class).
- Proof test: `scripts/test-journey-scale-r130-succession-voicing-20261110.js`
  (RED→GREEN: each fixed writer's say/note names its amount; the numbers
  are unchanged — trust deltas identical before/after).

## The panel (fresh, on the fixed engine)

- **Driver:** `scripts/journey-scale-r130-20261110.js` (r127 driver cloned,
  labels/EVIDIR/seed list + DAYCAP only) + the existing instruments
  (regionalstep, ladder, traderoad, deathcensus, scholarcount). The driver
  is UNCHANGED in policy (scalecourt-traderoad-r113-linkraise-sit) — the
  fix is engine voicing only, so trajectories must be IDENTICAL to a
  control run on the same seeds without the fix (see Q2 guardrail).
- **Seeds: FRESH 131001–131004.** Freshness: 0 mentions in journey
  preregs/run notes/drivers/analyzers (checked in-run). Full-tree check
  completed 02:42Z: 131001 0 mentions anywhere; 131002 6, 131003 5,
  131004 2 mentions — ALL in sweep/panel JSON corpora (tribstreak,
  enddaybeats, proposefirst, neutral-r172social, retagrot, packtail-b,
  stageally-stab, spikechar, screen-tmp-freshband-b), i.e. seed values
  inside other instruments' corpora under different policies, never a
  journey band. These seeds were never played as a journey band.
- **Horizon:** DAYCAP=140 (the leg window d80–140), death-aware stop
  (+10d tail max on a dead village — MEASUREMENT.md §10).
- **Pilot:** seed 131001 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0, 0 trustset
  rows by d60, or 0 national-gate rows → STOP and diagnose (INCOMPLETE,
  not a verdict).

## Questions (binding)

- **Q1 DECOMPOSITION (primary):** on the fresh panel (fixed engine), does
  the analyzer attribute ≥95% of each link's trust movement to named
  writers (unattributed < 5%), with zero chain GAPs, and is the
  succession-crisis cycle the top drain on ≥3/4 seeds? **GO: all three
  hold.** If the top drain differs on ≥2 seeds, Q1 is NO-GO as written —
  report it, do not re-score.
- **Q2 TRAJECTORY IDENTITY (guardrail, part of the verdict):** the fix is
  voicing-only, so the fresh panel's trajectories must match a same-seed
  control run on the UNFIXED engine (driver on base, fix reverted in a
  temp worktree copy — no, simpler: the r127 driver's own before/after
  rule — the panel is run ONCE on the fixed engine and its lived days /
  deaths / end days are compared against the r127 band's shape, NOT
  bit-identity: the seeds differ, so bit-identity is impossible. The
  guardrail is: no seed's lived days / deaths / end day move by more than
  the r127 band's own spread would allow — operationally, the panel's
  lived-days total stays within ±25% of the r127 band's 554, and no seed
  flips alive↔dead vs the r127 band's pattern (3 dead, 1 alive) without an
  attributed cause in the deathcensus. Any larger move stops the run for
  investigation — a voicing change must not move trajectories.
- **Q3 ONE-SHORT:** per seed: max leadSeasoned / covSeasoned /
  tradeSeasoned, national staged? (pendingShape rows), nationalLive?
  Report only (no threshold — the census half of Q1; the r127 band read
  lead 2/3, trade 0–1/3 on 3/4 seeds).
- **Q4 PEOPLE CHECK:** read the fresh panel's d90/d120 transcripts in full
  (r125/r126/r127 Q4 protocol); senseless count 0 for clean. Note whether
  the two carried defects (Baraka unvoiced raise, trap-line invitation
  swallowed) still fire — carried, not this run's to build. ALSO: read one
  succession say + one arrears/sabotage say in the fresh capture and
  confirm the new "(Trust -N.)" lines read as a person speaking, not a
  ledger.
- **Q5 CENSUS:** plain-words village assessment per seed; ladder stage,
  lesser seat, national, full seat; books close on all four seeds;
  unattributed 0.

## Telemetry + checks

- `telemetry-check.js` vs `scale.json` baseline, metrics fightsTotal,
  fightsByWave.4, maxGameDay (same as r125/r126/r127). LOUD lines are
  same-run investigation items (expect the regime-mismatch LOUD; EXPLAINED,
  baseline NOT rolled forward — the re-label is still owed).
- `node scripts/check.js --quick` (the fix touches src/js — mandatory).
  Full `check.js` before merge if the quick gate shows anything beyond
  the known standing failures.

## Metric review

(To fill at closeout — metrics held, or the revision proposed for the
next run. A miss is a miss; never re-score.)

## Carried (not this run's to build)

Baraka unvoiced raise; Stella/Nathan trap-line invitation swallowed by the
raise-answer template; guest-death (Bing) prereg; survival-collapse cause
(combat side); scholar-payment open item (steve-call); scale.json baseline
regime re-label; 1415Z 17-failure gate attribution (still owed); 1890-line
rotation question (r129 — next DEEPENING run); origin/master divergence
(ship loop owns); unfired trust-drain writers not in the fix (bidForPrimacy
flip −10s, court −12s, bargain −5/−3, pool −4 is voiced — code-read
classification only, no measurement on this band).

## ADOPTION ADDENDUM (Lane A 2245Z run, 2026-11-11 ~04:45–06:00Z)

**Stale-lock recovery:** the 0125Z run died after seeds 131001/131002 (last
heartbeat 03:37Z, 66 min stale; lock 3h18m old; no process running). This run
adopted its worktree, registration, and uncommitted work intact — fix,
proof test, driver, analyzer, prereg, and the two finished seeds' corpora.
No work was re-done; seeds 131003/131004 were played fresh on the adopted
engine. Rotation stays 3 until this closeout succeeds, then 3→0.

**Sixth writer found on the fresh band:** the analyzer's band verdict on the
as-adopted corpus was NO-GO — seed 131004 carried exactly one unvoiced
drain, `answerAidBeg@safetynets.js:1177` (d138, −5, no-debt aid-beg refusal).
The say already names "(Trust -5.)"; the book had NO note in that branch,
and the debt branch's note named no amount. Same defect class as the five
fixed writers, never fired on the r127 band (no aid-beg refusal there).
Fix (voicing only, no numbers): the no-debt branch now writes
`REFUSED <village> aid request. (trust -5)`; the debt note now ends
`(trust -10)`. Proof test extended with section 10 (8 assertions, both
branches: delta exact, note names amount, say names amount) — 57/57 green.
Seed 131004 re-run on the fixed engine: trajectory bit-identical (d141,
5 deaths, same causes, same ladder/trade/natGate rows); the ONLY corpus
difference is the one added d138 aid note (verified by file diff).
Analyzer re-run on the fixed engine: **BAND VERDICT GO, 4/4 seeds**
(recon OK, unattributed 0.0%, voiced OK).

**Q1 verdict (final):** GO — the three prereg conditions hold 4/4
(unattributed 0.0% each; zero chain GAPs; succession-crisis cycle the top
drain on 4/4 as a cycle: −68/−136/−56/−72 vs next drains −30/−80/−24/−35).
The analyzer's voiced component is GO on the fixed engine as well.
**Q2 verdict:** GO — band lived-days total 140+97+95+141 = 473 vs the r127
band's 554 (−15%, inside the ±25% guardrail); alive/dead pattern 2 alive /
2 dead matches the r127 band's shape (1 alive / 3 dead) with no flip;
131004's re-run on the fixed engine is trajectory-identical. **Q3:** max
leadSeasoned 2/2 (131003), 2/3 (131004), 1/1 (131001), 2/2 (131002);
tradeSeasoned max 0/2/2/0; national staged never (nat=false all seeds),
nationalLive never. **Q4:** 6 transcripts read in full (d90/d120 where the
village lived), senseless 0; the new "(Trust -8.)" lines read as a person
speaking; neither carried defect fired (Baraka 0 mentions; no trap-line
invitation in any capture). **Q5:** see run note 2026-11-10 (Lane A r130
closeout). Telemetry: 2 LOUD lines, EXPLAINED as stale 646-day baseline
regime (r130 157/109 sits inside the r125–r127 family 166–230 / 93–154);
baseline NOT rolled.

## Metric review (closeout)

- Q1 as written holds, but its "top drain" wording is writer-level
  ambiguous: on 131001 the top single writer is answerDemand (−30) while
  the succession-crisis CYCLE (−68) is the top drain. Next run: say
  "succession-crisis cycle (successionCrisis + covenantCrisis combined)".
- The analyzer's voiced check reads notes only; a say that names the
  amount with no note (the answerAidBeg case) still fails the band. That
  is the intended bar (the book is the player's record) — keep it.
- Q2's "±25% of the r127 band's 554 lived days" worked (473, −15%). Keep,
  but name the control band explicitly next run.
- The quick gate's standing profile on this base is 4 standing + the
  measurement-proof staleness pair + load timeouts (re-run: 292/8; first
  run 290/10, two extra flaky timeouts). All 8 attributed in the run
  note; none touch the changed files' behavior. The measurement-proof
  refresh and the phone-frame receipt refresh remain owed (carried).
