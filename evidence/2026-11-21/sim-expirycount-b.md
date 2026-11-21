# sim-expirycount-b — the #2633 analyzer fix + the combined fix re-judged under the re-derived 14-day bar

**Verdict: GO (combined) — coordinator call: LAND.** The analyzer
fix counts the one expiry it used to miss (Amina d37 on seed
106705, companion already out) and changes nothing else anywhere
in the corpora. Under the re-derived 14-day bar — taken exactly as
`sim-reseedbeat-b.md` §7 states it, frozen before this arm ran —
the pooled expiry follow-through passes at n=5: re-seeded within
14 days 4/5 = 0.800 against ≥ 2/3, fought again (launch-based) 4/5
= 0.800, post-expiry targetless launches 0, instrument clean. The
combined-fix judgment passes on every leg it has ever been judged
on: dead-target launches 0 on all five armed legs (104 launches),
re-seed commits firing, guardrail passing on all four
control-paired bands. The only shares that still miss are the two
the re-derivation explicitly demoted: the 7-day re-seed share (2/5
— the rumor supply's restock speed, not the mechanism) and the
encounter-based fight share (0/5 — the fight funnel, not the
re-seed). No new sim band was run: pooled n=5 already clears the
frozen n ≥ 3 judge rule, and a third wide band would most likely
return n=2 again.

## 0. Prereg — frozen before any judged count

The bars are not this arm's invention. They are taken exactly as
`evidence/2026-11-21/sim-reseedbeat-b.md` §7 states them (written
by the 0230Z run, before this arm started), and the instrument fix
is specified exactly as finding #2633 states it (same file §4):

1. **Primary — re-seed within 14 days, ≥ 2/3, with the n ≥ 3
   floor (minExpiries 3) kept.** The 14-day window measures the
   mechanism's follow-through (does the holder come back?) while
   the 7-day window measured the rumor supply's restock speed.
   Keep the 7-day share as a reported secondary, not the judge.
2. **"Fought again" split in two.** Keep the launch-based
   re-engagement share as a reported secondary. Do NOT promote
   the encounter-based bar (a fought encounter row, rounds > 0,
   within 14d) to a GO bar: on the extended pool it is 0/5 — no
   holder in five had a blow-by-blow fight with the re-seeded
   target within 14d. That bar measures the fight funnel, not the
   re-seed, and no re-seed lever can pass it. Report it as a
   diagnostic.
3. **Analyzer fix first.** Relax `expiriesOf` path (a) to count an
   expiry when the snapshot shows a dead target + pool 0 + result
   normal, regardless of `companionExped`, with a companion-out
   expiry fixture in the analyzer selftest.

Pooled corpora (all already on disk, no new sims): reseedexpiry
armed bands 106301–106308 + 106401–106408, reseedwide armed bands
106601–106608 + 106609–106616, reseedbeat armed band 106701–106708.
40 armed seeds. Judge: `judgePooled --min-expiries 3
--reseed-days 14`. The combined-fix judgment (dead-0 + guardrail
+ re-seed commits + instrument) is carried from the three prior
arms' frozen evidence and re-stated in §6, not re-run: this arm
changes no game code and runs no new sims.

## 1. The fix — what changed in the analyzer

`scripts/analyze-reseedexpiry-b.js`, `expiriesOf` path (a) only
(commit below). The old rule required `companionExped === false`
on every brain-path expiry row. The companion's expedition state
is irrelevant to whether the holder's plan expired — the commit
check runs and dissolves the plan either way. The new rule:

- **Snapshot present:** count when the snapshot shows a dead
  target (`target` non-null, `deadTarget === true`) + an empty
  pool (`poolN === 0`) + result `normal`, regardless of
  `companionExped`. The holder must still be at home
  (`vidExped === false`). The snapshot's target non-null +
  deadTarget true still excludes the stale twin, whose snapshot
  shows the plan already targetless.
- **No snapshot:** keep the old rule (holder and companion both
  at home). A snapshot-less companion-out row is still the
  stale-commit shape (§E gen d79), and the relaxation does not
  touch it.

The exact row the fix catches (seed 106705, Amina d37, seq 144):
`result normal, winPlanAction party_launch, stage party, target
null, vidExped false, companionExped true, rumorPool {target
spool, deadTarget true, pool [], poolN 0}`, with prior-target
evidence (Amina fled a spool d26). The two same-day hold rows
(seq 145/146, result `hold`) are not expiries.

The analyzer also gained the re-derived bar's counting, so the
judge can apply it instead of hand-tallying:
- `reseededWithin14` / `reseededWithin14Count` /
  `reseededWithin14Share` per dir and per seed (the same
  `reseededWithin` function at 14 days).
- `holdersFoughtEncounter` — encounter-only fought-again within
  14d (a fought `v4encounters` row, `vid == holder`, no launch
  or lived-fight seed source) — the diagnostic, never a GO bar.
- `judgePooled --reseed-days 14` selects the 14-day window for
  the pooled re-seed bar (default stays 7, legacy behavior
  unchanged); the pooled output carries both windows'
  shares plus the encounter diagnostic. Analyses written before
  the 14-day field existed fall back to their 7-day count, so an
  old analysis JSON still judges conservatively.

## 2. Fix verification — before/after on the identical corpora

Baseline (pre-fix analyzer, `/tmp/expirycount-baseline`) vs
after (fixed analyzer, `/tmp/expirycount-after`), same 9 corpus
dirs, same command:

| Dir | Expiries before → after | Mismatch before → after | Other counts changed |
|---|---|---|---|
| 106301-armed | 2 → 2 | 0 → 0 | none |
| 106301-control | 0 → 0 | 0 → 0 | none |
| 106401-armed | 0 → 0 | 0 → 0 | none |
| 106401-control | 0 → 0 | 0 → 0 | none |
| 106601-armed | 1 → 1 | 0 → 0 | none |
| 106601-control | 0 → 0 | 0 → 0 | none |
| 106609-armed | 1 → 1 | 0 → 0 | none |
| 106609-control | 0 → 0 | 0 → 0 | none |
| **106701-armed** | **0 → 1** | **1 → 0** | none |

The fix newly counts exactly the 106705 d37 expiry and changes
no other count on any dir — armed or control. The instrument did
not move under the re-judgment. (Per-dir verdicts under the
legacy 7-day single-leg judge are unchanged in kind: 106301
NO-GO RESEED, 106401 NO-GO UNREACHABLE, 106601 DIAG-GO, 106609
NO-GO RESEED, 106701 NO-GO RESEED — single legs were never the
judge; the pooled verdict is.)

Proofs: analyzer selftest **69/69** (57 + 12 new §I checks:
the 106705 Amina fixture verbatim, the snapshot-less stale twin
still excluded, a live-target companion-out row still excluded,
and the pooled 14-day judge on synthetic bands including the
legacy-default pin); `scripts/test-expirycount-b.js` **31/31**
(integration: the before/after counts above plus both pooled
judgments, re-run from the frozen corpora in-process).
Regression suites re-run green: `test-reseedexpiry-b.js`
**58/58**, `test-reseedwide-b.js` **28/28**,
`test-reseedbeat-b.js` **30/30**, `test-reseed-b.js` **97/97**.
No `src/js` change in this arm, so no game-code gate applies;
no `check.js --quick` (sibling gates running — same discipline
as the prior three arms on this branch).

## 3. The pooled expiry table — five expiries, 40 armed seeds

| Seed | Holder | Expiry | Re-seeded | Days | ≤ 7d | ≤ 14d | Fought again 14d (launch) | Fought encounter 14d |
|---|---|---|---|---|---|---|---|---|
| 106301 | Lorenzo (`gen_4s847jb`) | d43, redactor | d57 → eulogy | 14 | No | **Yes** | Yes | No |
| 106307 | Emmett (`gen_p1wn71v`) | d36, terms_of_service | d42 → callback | 6 | Yes | **Yes** | Yes | No |
| 106603 | Amina Diallo | d28, spool | d31 → buffering | 3 | Yes | **Yes** | Yes | No |
| 106610 | Fernando Vega (`gen_q3stxjy`) | d38, chorus_line | d46 → buffering | 8 | No | **Yes** | Yes | No |
| 106705 | Amina Diallo | d37, spool | d53 → spool | 16 | No | No | No | No |

Pooled: expiries **5**; re-seeded within 14d **4/5 = 0.800**;
re-seeded within 7d 2/5 = 0.400; fought again within 14d
(launch-based) **4/5 = 0.800**; fought encounter within 14d
**0/5**; post-expiry targetless launches **0**; post-expiry
holds 4 (106301: 1, 106609: 3); dead-target commits **40**
pooled; pool floor min **0** (dist {0: 5, 1: 8, 2: 2, 3: 3, 4: 5,
5: 4, 6: 2, 7: 3, 8: 1, 9: 2, 10: 2, 11: 2, 12: 1}).
Analyzer output:
`evidence/2026-11-21/expirycount-b-pooled-analysis.json`.

**Amina's 16 days, in plain words.** She fled a spool d26,
Diana killed the last known spool on camera d27, and the fire
called off her hunt d37 — pool empty, no rumor. A spool was seen
alive again d40 (Diana evaded one on expedition), the rumor pool
offered spool again, and she launched d53 with the launch beat
firing ("Amina is hunting Loud-Eyes now — the fire found a new
trail"). She did not fight again within 14 days by any route:
no encounter rows at all in the window, and her first post-expiry
outing was the d53 launch itself. Sixteen days is the rumor
supply twice over — the pool was empty, then a sighting, then a
launch thirteen days after the sighting. The mechanism did not
fail her; the supply was slow and the launch came late. She is
the one holder in five the 14-day bar does not carry, and the
bar still passes at 4/5.

## 4. Pooled judgment — the re-derived bar

`judgePooled --min-expiries 3 --reseed-days 14` on the five
armed dirs: verdict **DIAG-GO**.

| Bar | Frozen bar (this arm's prereg, §0) | Observed | Verdict |
|---|---|---|---|
| Instrument (pooled) | 0 errors; all band dirs 8 files | 0 errors; 5 dirs × 8 files | **PASS** |
| Gate (pooled) | 0 missing, 0 mismatch, classified ok | 0 / 0 / ok | **PASS** |
| Expiry-rule (pooled) | 0 mismatches | 0 | **PASS** |
| Pool-agreement (pooled) | 0 replica-vs-real disagreements | 0 | **PASS** |
| Dead-commits (pooled) | > 0 | 40 pooled | **PASS** |
| Post-expiry targetless (pooled) | 0 | 0 | **PASS** |
| **Re-seed within 14d (pooled, PRIMARY)** | **≥ 2/3, n ≥ 3** | **4/5 = 0.800** | **PASS** |
| Fought again within 14d, launch-based (pooled, secondary) | ≥ 2/3 reported | 4/5 = 0.800 | passes |
| Fought encounter within 14d (diagnostic) | never a GO bar | 0/5 = 0.000 | diagnostic |
| Re-seed within 7d (reported secondary) | reported | 2/5 = 0.400 | reported |

Control check, for the record: the same pooled judge on the
same five expiries under the frozen 7-day window returns NO-GO
RESEED (2/5 = 0.400). The bar change flips the verdict, not
the data — the 7-day share is unchanged by the fix (2/5 before
and after; Amina's 16 days were never inside it).

## 5. The combined-fix judgment (carried, not re-run)

The combined fix is the re-seed lever (finding #2626) + the
expiry fallback with its fireside beat + the #2632 launch beat +
this arm's analyzer fix. Its judgment, from the three prior
arms' frozen evidence (this arm changes no game code and runs
no new sims):

| Element | Frozen bar | Observed | Verdict |
|---|---|---|---|
| Re-seed half, dead-target launches | 0 on every armed leg | 106301: 0/14, 106401: 0/15, 106601: 0/20, 106609: 0/39, 106701: 0/16 — **0/104** | **PASS** |
| Re-seed commits | reported per leg | 106301: 7, 106601: 3, 106609: 15, 106701: 5 | reported |
| Guardrail reseedexpiry A | survived ≥ ctl−1, median ≥ ctl−5d, starvation ≤ ctl+1 | 6 vs 5; 151 vs 150.5d; 3 vs 2 | **PASS** |
| Guardrail reseedexpiry B | same | 4 vs 4; 147.5 vs 147.5d; 3 vs 4 | **PASS** |
| Guardrail reseedwide A | same | 2 vs 3; 157 vs 155d; 4 vs 6 | **PASS** |
| Guardrail reseedwide B | same | 1 vs 1; 147.5 vs 135d; 2 vs 6 | **PASS** |
| Guardrail reseedbeat band | no control leg | not judged (observation band) | n/a |
| Instrument + survey | clean, dead-commits > 0 | clean, 40 pooled | **PASS** |
| Expiry follow-through (re-derived primary) | re-seed ≤ 14d ≥ 2/3, n ≥ 3 | 4/5 = 0.800, n=5 | **PASS** |

**GO requires the combined-fix judgment plus the re-derived
primary. Both pass → verdict GO (combined).**

## 6. Wall numbers (pooled armed legs, from the prior arms)

| | 106301–106308 armed | 106401–106408 armed | 106601–106608 armed | 106609–106616 armed | 106701–106708 armed |
|---|---|---|---|---|---|
| wins | 0 | 0 | 0 | 0 | 0 |
| national | 0 | 0 | 0 | 0 | 0 |
| table | not observed | not observed | not observed | not observed | not observed |
| wave 5 unlocked | 3/8 | 2/8 | 5/8 | 3/8 | 4/8 |
| wave 4 unlocked | 8/8 | 8/8 | 8/8 | 8/8 | 8/8 |
| standing ≥ 200 | 3 | 2 | 5 | 3 | 4 |
| survived (horizon) | 6/8 (150d) | 4/8 (150d) | 2/8 (180d) | 1/8 (180d) | 6/8 (150d) |
| median survival | 151d | 147.5d | 157d | 147.5d | 150.5d |

No new sim band ran in this arm, so no new wall numbers exist
to report; the wall is unchanged in shape (no wins, no national,
the 199 stall on the reseedwide bands). Balanced panels for the
four control-paired bands already exist
(`reseedexpiry-b-panel-*.md`, `reseedwide-b-panel-*.md` — both
review_required, no material signal); no new panel applies,
because no before/after game-code comparison runs in this arm.
Telemetry check: not applicable — no new sim corpora were
produced; the recorder-corpus input refusal documented by the
prior arms stands.

## 7. Metric review

- **The pooled n is 5, not 3, and the floor did its job.**
  The frozen n ≥ 3 rule kept three arms from judging a 1/2 or
  2/4 share; the fifth expiry (the one the analyzer used to
  miss) is what lifts the pool past the floor. The verdict is
  judged, not reported, because the instrument now sees the
  denominator it was missing.
- **The 14-day bar passes on the same data the 7-day bar
  fails.** 2/5 within 7d vs 4/5 within 14d, same five holders.
  The two holders the 7-day bar drops (Lorenzo at exactly 14d,
  Fernando at 8d) both came back and launched; the bar that
  calls them failures is measuring the rumor supply's restock
  speed. The re-derivation's reasoning holds on the pooled data.
- **The encounter diagnostic is 0/5 and stays a diagnostic.**
  No holder in five had a blow-by-blow fight with the re-seeded
  target within 14 days — Emmett met his and fled d45; the rest
  fled, evaded, or met nothing. That is the fight funnel, and
  the re-seed lever cannot move it. Promoting it to a GO bar
  would fail every re-seed arm by construction. It is reported
  here so the next arm on the fight funnel has its number.
- **The launch-based "fought again" share overstates what it
  measures.** 4/5 launched within 14d, but launching is going
  back out, not closing with the target — Amina (106603) fled
  twice and died d41, Fernando fled or evaded three beasts and
  died d77, neither closed with Buffering on the record. The
  share is kept as a secondary, as the re-derivation orders,
  and the evidence says plainly what it is.
- **The fix's scope is exactly the snapshot rule.** The
  relaxation applies only when a rumorPool snapshot is present
  and shows dead target + pool 0; snapshot-less rows keep the
  old both-at-home rule, and the stale twin is still excluded
  by its targetless snapshot. The before/after table (§2) is
  the proof: one new expiry, zero other changes, on all nine
  dirs including four control legs.
- **No new sim band was needed, and none was run.** Pooled n=5
  already clears the frozen n ≥ 3 rule. A third wide band would
  most likely return n=2 again at the stable ~1-per-8 rate, and
  the task's brief says so explicitly.

## 8. SENSE-TEST — the two beats, sixteen days apart

Amina's d37 call-off and d53 return, as the player hears them:

> d37: "Amina was ready to hunt Loud-Eyes — but the fire says that kind is already put down, and no one has seen another trail. The hunt is called off."
>
> d53: "Amina is hunting Loud-Eyes now — the fire found a new trail."

The pair reads as one story: the hunt was called off, the kind
was seen again, the hunter went back out. The reseedbeat arm
already noted the gap honestly — the d53 line never says the
kind was seen again, so a player who remembers the call-off
could read it as a contradiction — and that wording tweak is
still owed to a future arm, not charged here. The sixteen days
of silence between the lines are honest: she held at Haven with
no trail and no beat, and the game does not pretend she was
doing something.

## 9. Blanks, findings, and the coordinator call

- **COORDINATOR CALL: LAND the combined fix.** The re-seed
  lever + expiry fallback + launch beat + analyzer fix, on
  branch `sim-reseedexpiry-b`, under the re-derived 14-day bar:
  pooled DIAG-GO at 4/5, dead-target launches 0/104, guardrail
  4/4, instrument clean. The expiry follow-through — the last
  unproven half of finding #2626 — is now proven at n=5. The
  two still-missing shares (7-day 2/5, encounter 0/5) measure
  the rumor supply and the fight funnel, not this lever, and
  the re-derivation demotes them explicitly. This arm does not
  merge: the coordinator merges.
- **Finding #2633 — FIXED, pending landing.** The analyzer
  counter now counts companion-out expiries (selftest §I,
  `test-expirycount-b.js` 31/31). It is fixed in code on this
  branch; it lands when the combined fix lands.
- **Finding #2626 — ready to close on landing.** The expiry
  half is now measured at n=5 and passes its re-derived bar;
  the re-seed half is dead-0 on 104 launches; the guardrail
  passes 4/4. Nothing about #2626 remains unmeasured except
  the encounter-based fight share, which is a different lever's
  question (the fight funnel).
- **Finding #2632 — the beat is built, proven, and observed.**
  Unchanged by this arm; it lands with the combined fix.
- **Owed, not charged:** the d53 beat's missing "seen again"
  (reseedbeat §8); the encounter-based fight share as a future
  fight-funnel question, not a re-seed bar.
- **Branch:** `sim-reseedexpiry-b`, HELD unmerged. This arm
  adds the analyzer fix + test + evidence below the 0230Z tip
  `80e79fedc`. No `src/js` changes; no new corpora.
- **Heartbeat note:** the first heartbeat attempt blocked on
  the registry lock (held by the coordinator's in-flight
  registration, as the task anticipated) and was killed after
  ~4 min with no output; retried before the first commit.
