# sim-reseedexpiry-b — the EXPIRY HALF of the #2626 re-seed lever

**Verdict: NO-GO — kind RESEED. The expiry fires in live play, with its
fireside beat, but the follow-through bar misses by one holder.** Two
expiries on 16 armed seeds, both on band A; one holder re-seeded within
7 days, the other took 14. The re-seed half works — just slower than
the frozen 7-day bar for one holder out of two. The guardrail passes
on both bands. This is not a re-score: the bars were frozen, the miss
stands, and the denominator (n=2) is stated with every share.

**The answer in one paragraph.** The reseed arm (1830Z) proved the
re-seed works but never saw an expiry — 0 expiries in 12 seeds, so
the expiry half had no denominator and the arm went METRIC-BROKEN.
This arm went looking for the condition where expiries occur: a
rumor-poor window right after a village's first wave-3 kill, before
a second distinct wave-3+ type has been fought alive. It found the
condition twice on band A and never on band B. Both expiries fired
exactly as designed — the holder's plan target was already put down,
the rumor pool was empty (pool 0), and the fire called the hunt off
in words ("Lorenzo was ready to hunt The Redactor — but the fire
says that kind is already put down, and no one has seen another
trail. The hunt is called off."). Both holders fought again within
14 days; only one re-seeded within 7. The bar needs ≥ 2/3; 1/2 is
not 2/3.

## 1. The two expiries

| | 106301 d43 | 106307 d36 |
|---|---|---|
| Holder | Lorenzo (`gen_4s847jb`) | Emmett (`gen_p1wn71v`) |
| Plan target (dead) | redactor, wave 3 | terms_of_service, wave 3 |
| Rumor pool at the commit | 0 — empty | 0 — empty |
| Beat | "…the fire says that kind is already put down, and no one has seen another trail. The hunt is called off." | Same beat, for The Terms of Service |
| `planExpiries` cross-check | 1 | 1 |
| Re-seeded within 7d | **No** — re-seeded d57 (14d later), null → eulogy, when a rumor arrived | **Yes** — d42 (6d later), null → callback |
| Fought a wave-3+ beast within 14d | **Yes** — within 14d, via reseed-launch | **Yes** — within 6d, via reseed-launch |
| Post-expiry hold fired | — | d38 (one hold row) |

The 106301 holder is the whole miss: he sat targetless for two
weeks, then a eulogy rumor arrived and he re-seeded and fought. The
mechanism did not fail him — the rumor supply did, and the 7-day
bar measures the supply's timing, not the mechanism. With n=2, one
more fast re-seed anywhere would have flipped the bar (2/3 =
0.667); band B contributed 0 expiries, so there was nowhere for
that third expiry to come from.

## 2. Judged numbers — the frozen bars (pooled across both bands)

| Bar | Frozen bar (prereg) | Observed | Verdict |
|---|---|---|---|
| Instrument (pooled) | 0 errors; all band dirs 8 files | 0 errors; 4 dirs × 8 files | **PASS** |
| Gate (pooled) | 0 missing, 0 mismatch, classified ok | 0 / 0 / ok | **PASS** |
| Expiry-rule (pooled) | 0 mismatches | 0 | **PASS** |
| Pool-agreement (pooled) | 0 replica-vs-real disagreements | 0 | **PASS** |
| Dead-commits (pooled) | > 0 | 10 pooled | **PASS** |
| Post-expiry targetless (pooled) | 0 | 0 | **PASS** |
| Re-seed within 7d (pooled) | ≥ 2/3 of expired holders | **1/2 = 0.500** | **FAIL** |
| Fight again within 14d (pooled) | ≥ 2/3 of expired holders | **2/2 = 1.000** | **PASS** |
| Guardrail band A | survived ≥ ctl−1, median ≥ ctl−5d, starvation ≤ ctl+1 | 6 vs 5; 151 vs 150.5d; 3 vs 2 | **PASS** |
| Guardrail band B | survived ≥ ctl−1, median ≥ ctl−5d, starvation ≤ ctl+1 | 4 vs 4; 147.5 vs 147.5d; 3 vs 4 | **PASS** |

**GO requires every bar. The re-seed share misses → verdict NO-GO,
kind RESEED.** Per-band: band A NO-GO RESEED (2 expiries, 1/2);
band B NO-GO UNREACHABLE (0 expiries, pool floor min 1 — rumors
never ran out).

## 3. The survey — the rumor-pool floor

The survey's primary measurement, reported whether or not an expiry
fires:

| | Band A (106301–106308) | Band B (106401–106408) |
|---|---|---|
| Dead-target commits (armed) | 7 | 3 |
| Pool floor (min poolN) | **0** (2 commits) | **1** (1 commit) |
| Pool median | 6 | 3 |
| Pool distribution | {0: 2, 3: 1, 6: 1, 7: 2, 10: 1} | {1: 1, 3: 1, 4: 1} |
| Expiries | 2 | 0 |
| Launches (armed) | 14 (dead 0, live 9, unknown 5) | 15 (dead 0, live 15) |
| Re-seed commits (armed) | 7 | — |

Band B's nearest miss: 106408 d116, ingrid_vik, target strike
(wave 4), pool 1 — a single herald rumor — launched on it. The
pool empties only in the first-days-after-first-kill window, and
only when the village has fought exactly one wave-3+ type. Most
villages hear a second type within days; the window is real but
narrow — 2 expiries in 16 armed seeds, 10 dead-target commits
pooled, and the pool was non-empty on the other 8.

## 4. Wall numbers

| | Band A control | Band A armed | Band B control | Band B armed |
|---|---|---|---|---|
| wins | 0 | 0 | 0 | 0 |
| national | 0 | 0 | 0 | 0 |
| table | 0 | 0 | 0 | 0 |
| wave 5 unlocked | 4/8 | 3/8 | 3/8 | 2/8 |
| wave 4 unlocked | 8/8 | 8/8 | 8/8 | 8/8 |
| standing ≥ 200 | 4 | 3 | 3 | 2 |
| survived 150d | 5/8 | 6/8 | 4/8 | 4/8 |
| median survival (gameDays) | 150.5d | 151d | 147.5d | 147.5d |
| starvation deaths | 2 | 3 | 4 | 3 |

Balanced panels: both bands review_required, 8 paired cases, no
material signal on any observed metric (band A village deaths
paired delta −1.125, interval −4 to 1.75; band B −1.125, interval
−5.25 to 1.875; community loss 0.25 → 0.25 band A, 0.5 → 0.5 band
B; wins/national 0/0 both). The lever touches 2 plans in 16 seeds;
no wall claim is made.

## 5. Metric review

- **The 7-day bar with n=2 is a knife-edge, and the prereg knew
  it.** "When n = 1 the shares are 1/1 or 0/1 and are reported as
  such, not rounded into a pass by silence." At n=2, 1/2 fails a
  2/3 bar by half a holder. The bar was frozen and the miss stands
  — but the next run on this question should either widen the band
  (more seeds buys more expiries at ~1 per 8) or judge the
  follow-through on a longer window (the 14-day fight bar passed
  2/2; a 14-day re-seed bar would have passed 2/2 as well). The
  revision belongs to the next prereg, not this verdict.
- **The expiry condition is genuinely rare, and now measured.**
  The reseed arm's 0/12 and this arm's 2/16 put the rate at ~1
  expiry per 8–14 armed seeds on fresh bands. Any future expiry
  measurement needs a rumor-poor band by construction or a wide
  screen; a single 8-seed band will usually return 0–1 expiries.
- **Band B is not a failure of the instrument.** Its pool floor
  (min 1) is a clean measurement: the village heard a second rumor
  before any plan could expire. The UNREACHABLE per-band verdict
  is the honest label for a band where the condition never arose.
- **Guardrail band A sits exactly on the starvation bound** (3 vs
  2, bar ≤ 3). One more armed starvation death would have missed
  it. Reported, not adjudicated — the bar passed as frozen.
- **The re-seed half is NOT re-judged here** (prereg), but its
  counts are reported for continuity: 7 re-seed commits on band A
  armed, dead-target launches 0 on both armed legs (band A 0 dead /
  9 live / 5 unknown of 14 launches; band B 0 dead / 15 live of
  15). The re-seed's dead-0 holds on both new bands.

## 6. Instrument, proof, and notes

- **Prereg:** `evidence/2026-11-20/sim-reseedexpiry-b-prereg.md`
  (commit `28d98846c`), frozen before any judged sim. Base: the
  HELD branch `sim-reseed-b` at tip `0f34690b7` — NOT master, by
  design (this arm does not re-judge the re-seed half and does not
  merge the held fix). Bands A 106301–106308 and B 106401–106408,
  fresh; policy `1884c8852d38`; substrate SENSEEXPED=1 PARTYSIZE4=1
  VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1; 150d death-aware.
- **Instrument:** driver `scripts/reseedexpiry-driver-b.js` (ported
  from the reseed driver + rumor-pool snapshot) + analyzer
  `scripts/analyze-reseedexpiry-b.js` (ported + pool-floor counting
  + pooled judge) + panel builder
  `scripts/build-reseedexpiry-b-panels.js`. Proof test
  `scripts/test-reseedexpiry-b.js` **58/58**; analyzer selftest
  **52/52** (incl. §G pooled judge: UNREACHABLE, DIAG-GO,
  INSTRUMENT, METRIC-BROKEN). Instrument corrections 1+2 in
  `d33f076ac` (stale-twin expiry exclusion, expired-plan re-seed
  counting + expiredStamp snapshot; the band-A probe found 2
  expiries, 0 rule match before the fix).
- **Legs:** band A armed by the round's worker (8 seeds, exit 0);
  band A control (2 seeds by the worker, 6 by the adoption),
  band B armed + band B control (8 seeds each, by the adoption) —
  all exit 0, 0 instrument errors on all 32 files, anchor
  `d33f076ac` on every file. The worker died mid-control-leg
  (heartbeat 23:04:29Z, last file write 23:31Z, no live process);
  the adoption completed Stage 1 per the frozen prereg in its own
  detached run (legs log:
  `hidden_files/reseedexpiry-b-legs.log`).
- **Balanced panels:** `reseedexpiry-b-panel-106301.md` and
  `reseedexpiry-b-panel-106401.md` — both review_required, 8 paired
  cases, no material signal (see §4).
- **Telemetry check:** `telemetry-check.js` with the absolute
  baseline path refused recorder-corpus input with exit 2 (designed
  refusal, same as the 1705Z/1830Z/2015Z adoptions); no LOUD lines,
  baseline NOT rolled.
- **No check.js --quick on this branch:** two sibling gates were
  running at closeout (journey-endgame-r259 and
  journey-establishment-r246); the discipline forbids a third
  concurrent run. The arm's own gates (proof 58/58, analyzer
  selftest 52/52, all legs 0 instrument errors) all pass, and the
  branch carries no src/js changes.

## 7. Blanks and findings notes for the coordinator

- **JUDGED VERDICT: NO-GO, kind RESEED** — the expiry fires in
  live play with its beat (2 expiries, both band A), both holders
  fought again within 14 days, post-expiry targetless launches 0,
  guardrail passes both bands — but only 1/2 re-seeded within 7
  days against the frozen ≥ 2/3 bar.
- **Finding #2626 stays OPEN.** The expiry half is now MEASURED
  rather than unproven: it fires (~1 per 8 armed seeds), it speaks
  its beat, it holds later days (1 hold row), and its holders come
  back to fight. What is unproven is the 7-day follow-through at
  n=2. The coordinator call the reseed arm left open still stands:
  judge the combined fix on the re-seed half (dead-0 on both new
  bands, 7 re-seed commits band A) + guardrail (passes both bands)
  — or run a wider band / longer window for the expiry follow
  bars. Either way the fix stays HELD and unmerged on this verdict.
- **Branch:** `sim-reseedexpiry-b`, evidence commit `f7e68d418`
  (instrument `28d98846c` + `d33f076ac`
  below it; base held `sim-reseed-b` `0f34690b7`). HELD unmerged by
  the 2130Z adoption: the verdict is NO-GO and the branch sits on
  the held reseed lever, which this arm does not re-judge or merge.
