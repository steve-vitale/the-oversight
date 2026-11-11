# Justice + moots — first numbers: pilot results (arm sim-justicefirst-a)

Run fleshout-20261111T1115Z, Loop A (adopted from the dead 1315Z run).
Coverage Program Tier 2 (Steve 2026-11-10 "Measure all").
Prereg: `evidence/2026-11-11/sim-justicefirst-a-prereg.md` (binding spec — not
rewritten, not re-scored; metric review below proposes revisions for the NEXT run).

## Disclosures (read first)

- **SHARED BAND.** Seeds 190311–190318 are SHARED with dutyfirst-b. Its
  prereg was committed 13:37:53Z, after justice's freshness search during
  the 1115Z run — a cross-loop race, not a justice error. Both arms are
  measurement-only with no game change, and the instrument-validity verdict
  is band-independent. Wall numbers below cover the same 8 villages as
  dutyfirst-b. Judged on the existing corpus; NOT re-run on a fresh band.
- **ANCHOR.** The prereg names base b09cf584e, but the per-seed files record
  `anchorCommit: e825803b7` — the pilot ran on the branch tip (the
  prereg+instrument commit itself), not bare master. The instrument commit
  touches only `scripts/` + `evidence/` — no `src/js` change — so the game
  code the pilot ran is byte-identical to b09cf584e. The prereg's "base
  b09cf584e" is the master base; the run anchor is e825803b7.
- **REBASE.** Rebased onto explicit master SHA 488506a47 before judging
  (read from the main tree; never bare `git rebase master`). No
  `src/js/justice.js` or `src/js/betrayal.js` change in b09cf584e..488506a47,
  and no change to any other wrapped-method file
  (corruption/membership/game/ledger/progression/villager-objectives/
  villager-agency/abilityActions/contests/journal/comms — zero changes;
  only standing.js, convo-wants.js, conversation.js moved, 7–15 lines
  each, unrelated to justice/moot). Per the adoption brief, NO post-rebase
  pilot re-run; the existing corpus is judged, anchor base b09cf584e.
  Proof re-run green post-rebase (61/61).
- **INDEX CLOBBER (process).** On adoption the worktree showed the known
  safe-commit index clobber (5 committed files staged as deleted, present
  as untracked). My first repair ran the documented pipe WITHOUT `-r`
  (`git ls-tree HEAD -- evidence scripts | git update-index --add
  --index-info`), which replaced all 90,232 evidence/ + scripts/ index
  entries with slash-dropped bogus paths — my error, same class the
  2026-11-07 lesson warns about. Recovered with the documented fix
  (`git ls-files -z | grep -zE '^(evidence|scripts)[^/]' | xargs -0 git
  update-index --force-remove`, then the pipe WITH `-r`), verified:
  80,226 evidence + 10,006 scripts entries, 0 bogus, the 5 files'
  `git status --short` empty, `git diff HEAD` empty, hash-object matches
  HEAD for all 5. No work lost; no read-tree used. (The full-repo
  `git status` scans took 15+ min under load and were killed mid-scan;
  verification was done with targeted pathspec status instead.)

## Header (per prereg)

- **Primary metric:** complete first-numbers capture of justice + moots in a
  lived village — every crime classified, every ladder transition counted,
  every case attributed, every moot classified, every verdict/sentence
  counted, every moot-attributed trust move attributed (or explicitly marked
  direct-write), metrics 1–11 counted or explicitly marked unmeasurable.
- **GO threshold:** the prereg GO table (instrument validity + complete
  capture; a GO makes NO landing claim and spends NO confirm band).
- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max). Why:
  justice/moot is a whole-life question (cases open from plots across the
  run, the ladder needs heat to accumulate, exiles/uprisings are late
  events); sibling first-numbers pilots ran 150d with median survival
  122.5–140d. Same horizon as the siblings for comparability.
- **Seeds: 190311–190318 (8 seeds).** See shared-band disclosure above.
- **Policies:** control (competent verbatim, default env, instrument ON —
  the judged leg) + neutral (control policy, instrument OFF; end-of-run
  wall numbers + days + end pantry kcal + deaths only). No other policy
  change. No `src/js` change.

## Verdict: NO-GO (one GO row missed — analyzer classification, not the game)

| GO check | Bar | Result | Verdict |
|---|---|---|---|
| Every recordCrime call classified by type + victim + witnessed, none 'unclassified' | 0 unclassified | 0 / 4 crime events | **GO** |
| Every case attributed by open path + charge, none 'unattributed' | 0 unattributed | 0 / 11 cases | **GO** |
| Every moot classified by caller + quorum + outcome, none 'unclassified' | 0 unclassified | **1 / 10 trials** | **NO-GO** |
| Every wrapped method's call path verified live or marked dead | each wrap live in pilot, or proven live in fixture + marked dead under competent / dead-under-harness | all 34 wraps proven live in the 61/61 proof fixtures; 20 never fired in the pilot, marked dead-under-competent below | **GO** |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds | 8/8 | **GO** |
| Instrument errors | 0 on all seeds, all legs | 0 | **GO** |
| Complete first-numbers capture | per-seed tables for metrics 1–11; sense-test scenes quoted | tables + scenes below; say corpus classified line-by-line (see metric 10) | **GO** |
| Engagement floor | ≥1 case or moot band-wide, else uninterpretable | 21 (11 cases + 10 moots) | **GO** |

The single missed row: **s190318 case_2** — an ambush case whose trial was
held (day 13, 8 present of 12 living, 7 acquit / 1 guilty) but never
finished, because the accused died on day 15, the same day the 2-day
backstop would have fired; the case resolved `accused_died` in the daily
snapshot. The analyzer's `classifyMootRecord` reads only finish/resolve
events, so with no finish event it reports 'no-outcome' / unclassified —
even though the snapshot explains the outcome completely. Per MEASUREMENT.md
§14 this is a NO-GO on the row as pre-registered; it is NOT re-scored
mid-run. The census numbers themselves are complete and valid; the miss is
an analyzer gap (fix proposed in metric review: teach the classifier the
snapshot resolutions, including `accused_died`). No lever, no confirm
spend, no landing claim — this arm is measurement only.

## Wall numbers (metric 11)

| seed | days | end | scale | maxWave | standing | deaths | end pantry kcal |
|---|---|---|---|---|---|---|---|
| 190311 | 132 | village-lost | regional | 5 | 410 | 85 | 21 |
| 190312 | 135 | village-lost | regional | 4 | 199 | 77 | 20 |
| 190313 | 150 | survived | regional | 4 | 199 | 118 | 20,444 |
| 190314 | 150 | survived | regional | 5 | 350 | 102 | 3,200 |
| 190315 | 140 | village-lost | regional | 4 | 199 | 73 | 0 |
| 190316 | 150 | survived | regional | 4 | 199 | 82 | 578 |
| 190317 | 142 | village-lost | regional | 5 | 300 | 109 | 0 |
| 190318 | 123 | village-lost | regional | 4 | 199 | 60 | 1,108 |
| **Band** | **median 141** | **3/8 survived** | **regional 8/8** | **wave 5: 3/8** | **199–410** | **706** | — |

- **National 0/8, table 0, wins 0.** The scale wall stands: every village
  reached regional and stopped there (standing 199–410; national needs far
  more). Wave 5 unlocked on 3/8 seeds — the wave-4/5 door opens, the
  national/table door does not.
- **Median survival 141d** (days sorted: 123, 132, 135, 140, 142, 150, 150,
  150). 1,110 village-days.
- **Deaths 706:** monster 588 (83%), villager 111, person 7. Causes:
  villager combat 301, expedition 156, combat 134, the wild 78, monster 15,
  ambush 4, a stranger 4, the arena 4, contest 3, Gavel 2, sickness 1,
  thirst 1. (The 2 'Gavel' deaths are kills by the Gavel monster — see
  sense-test scene — not justice.)
- **Scholar churn:** 75 successions band-wide (83 scholars total, 4–16 per
  seed). The scholar dies constantly; each new scholar inherits a fresh
  justice state (see metric 2).

## Metric 1 — Crimes

| seed | crimes | by type | witnessed | booked | dropped (NPC villain) | charged |
|---|---|---|---|---|---|---|
| 190311 | 0 | — | — | 0 | 0 | 0 |
| 190312 | 0 | — | — | 0 | 0 | 0 |
| 190313 | 0 | — | — | 0 | 0 | 0 |
| 190314 | 1 | threat ×1 | unwitnessed ×1 | 0 | 1 | 0 |
| 190315 | 0 | — | — | 0 | 0 | 0 |
| 190316 | 0 | — | — | 0 | 0 | 0 |
| 190317 | 0 | — | — | 0 | 0 | 0 |
| 190318 | 3 | theft, threat, assault | witnessed ×2, unwitnessed ×1 | 0 | 3 | 0 |
| **Band** | **4** | **threat ×2, theft ×1, assault ×1** | **witnessed 2, unwitnessed 2** | **0** | **4** | **0** |

- **4 crimes in 1,110 village-days, ALL dropped by the engine.**
  `recordCrime` returns early when the villain is not the player, so
  NPC-villain crimes are never booked: the competent scholar commits no
  crimes, and the engine does not book crimes villagers commit against each
  other. The crime book is player-only by construction.
- s190318: all 3 from `psychoViolenceTick` (corruption.js) — elena_petrova
  as villain (theft d17 unwitnessed, threat d29 witnessed, assault
  witnessed). s190314: threat d30, victim hannah_kim, villain
  `vis_mgpspi8x` (a visitor), from `hostileVisitorTick` (betrayal.js).
- **0 crimes ever reach a caseId.** The NPC-vs-NPC cases (metric 3) come
  from plots, not from the crime book — the book and the docket are
  disconnected for NPCs.

## Metric 2 — The justice ladder

| seed | ticks | 0→1 (cold shoulder) | 1→2 | 2→3 | confronts | responds | demands | uprisings | maxHeat | heat values seen |
|---|---|---|---|---|---|---|---|---|---|---|
| 190311 | 526 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | 0, 10, 25 |
| 190312 | 538 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | 0, 10, 25 |
| 190313 | 600 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | 0, 10, 25 |
| 190314 | 600 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | 0, 10, 25 |
| 190315 | 560 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | 0, 10, 25 |
| 190316 | 600 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | 0, 10, 25 |
| 190317 | 564 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | 0, 10, 25 |
| 190318 | 490 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | 0, 10, 25 |
| **Band** | **4,478** | **32** | **0** | **0** | **0** | **0** | **0** | **0** | **25** | **{0, 10, 25} only** |

Tick transitions band-wide: (0,0) 1,668; (0,1) 32; (1,1) 2,778; **(1,0) 0,
(1,2) 0**.

- **The ladder goes cold-shoulder and stops.** Every seed's scholar reaches
  stage 1 (cold shoulder) 3–5 times; nobody is ever confronted, nobody
  answers, no moot is ever demanded, no uprising ever fires. The
  confrontation needs stage 1 + heat ≥ 50 (justice.js:164); the moot
  demand needs refusal or heat ≥ 70.
- **Why heat caps at 25:** `justiceHeat()` (justice.js:86–114) sums booked
  player-crime heat (murder witnessed 40, attack 20, theft/intimidation 15
  — all zero here, 0 booked crimes) + takes/gives net (net < −15,000 kcal
  → +25; < −5,000 → +10) + low average trust (avg < 5 → +25; < 10 → +15),
  minus amends credit. Under competent the only heat sources are the
  meal ledger and ambient trust, and the observed values are exactly
  {0, 10, 25} — the +25 net term and the +10 net term, never both terms
  together, never the trust term on top. **Heat ≥ 50 is structurally
  unreachable without a booked player crime.**
- **Cooling never happens — succession wipes the ladder instead.** Zero
  (1,0) tick transitions, yet every snapshot stage 1→0 drop (32 band-wide)
  coincides exactly with a bearer change: the cold shoulder dies with the
  scholar, and each successor starts at stage 0 with a fresh takes/gives
  ledger (ledger.js:841–844 resets both at succession). With 3–15
  successions per seed (75 band-wide), the ladder can never accumulate across a run: each
  scholar lives ~10–40 days, builds at most 25 heat from meals, and dies
  before anything can escalate. The ladder is per-scholar, not per-village.
  (Whether that is intended is a design question — the fiction is written
  to "me", the current scholar — but it means the scholar-side ladder is
  unreachable in practice under competent play.)
- The cold-shoulder say line ("Something has shifted. Conversations stop
  when you approach the fire…", justice.js:137) fires 32 times but is
  **absent from the say corpus** — it contains none of the SAY_RE terms
  (see metric 10). The ladder's own voice was never captured.

## Metric 3 — Cases

| seed | cases | by path | by charge | fabricated | open at end | resolved at end |
|---|---|---|---|---|---|---|
| 190311 | 2 | openCase-plot ×2 | murder ×1, ambush ×1 | 0 | 0 | 0 |
| 190312 | 1 | openCase-plot ×1 | murder ×1 | 0 | 0 | 0 |
| 190313 | 0 | — | — | 0 | 0 | 0 |
| 190314 | 0 | — | — | 0 | 0 | 0 |
| 190315 | 2 | openCase-plot ×2 | ambush ×2 | 0 | 0 | 0 |
| 190316 | 1 | openCase-plot ×1 | ambush ×1 | 0 | 0 | 0 |
| 190317 | 2 | openCase-plot ×2 | ambush ×1, murder ×1 | 0 | 0 | 0 |
| 190318 | 3 | openCase-plot ×3 | ambush ×2, murder ×1 | 0 | 0 | 0 |
| **Band** | **11** | **openCase-plot ×11** | **ambush ×7, murder ×4** | **0** | **0** | **0** |

- **All 11 cases open from NPC plots** (`openCase`); zero from
  `considerPlayerAccusation` (1,118 calls band-wide, 122–150 per seed,
  every call returns null) or `forcePlayerAccusation` (0 calls). The
  scholar is considered for accusation every single day and never accused —
  because the scholar commits no crimes and the book is empty.
- **One incident spawns multiple cases.** The same accused trio + target
  opens as 2–3 cases: s190318 case_2 + case_4 are the IDENTICAL ambush
  (accused gen_t9u5l76, gen_5jd2gs4, boris_kowalski; target thabo_maseko),
  opened days 10 and 11; s190317 case_2 (ambush) + case_4 (murder), same
  trio, same target gen_izh87mp; s190315 case_2 + case_4, same target
  petra_novak with overlapping accused. 11 cases come from ~5 underlying
  incidents. Case reconciliation residue is 0 on every seed (opened =
  accounted for), but the count overstates independent crimes.
- Every case is announced (11 accusation lines = 11 cases) and every case
  closes by horizon end (0 open, 0 dormant/advisory at end).
- Accused are always 3 NPCs per case; accuser is null on plot cases (the
  target/victim drives it — e.g. thabo_maseko as target, then as accused
  in the mirror case_6).

## Metric 4 — Moots

| seed | trials | callMoots | quorate | advisory | convene held | wild days | playerVoter trials | player votes | backstop finishes |
|---|---|---|---|---|---|---|---|---|---|
| 190311 | 2 | 2 | 2 | 0 | 0 | 0 | 2 | 0 | 2 |
| 190312 | 1 | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| 190313 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 190314 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 190315 | 2 | 2 | 2 | 0 | 0 | 0 | 2 | 0 | 2 |
| 190316 | 1 | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| 190317 | 2 | 2 | 2 | 0 | 0 | 0 | 1 | 0 | 1 |
| 190318 | 2 | 2 | 1 | 0 | 0 | 0 | 2 | 0 | 1 |
| **Band** | **10** | **10** | **9** | **0** | **0** | **0** | **9** | **0** | **8** |

Per-moot detail (all callers NPC; all trials via `npcMootTick`):

| seed | case | charge | call day | caller | present/living | finish day | guilty/total | resolution |
|---|---|---|---|---|---|---|---|---|
| 190311 | case_2 | murder | 11 | gen_eox4by6 | 10/11 | 13 | 0/6 | acquitted |
| 190311 | case_4 | ambush | 14 | aroha_ngata | 11/11 | 16 | 1/7 | acquitted |
| 190312 | case_2 | murder | 11 | gen_td1rcon | 11/11 | 13 | 0/7 | acquitted |
| 190315 | case_2 | ambush | 13 | petra_novak | 11/12 | 15 | 1/7 | acquitted |
| 190315 | case_4 | ambush | 18 | petra_novak | 12/12 | 20 | 1/8 | acquitted |
| 190316 | case_2 | ambush | 15 | lena_ruiz | 10/12 | 17 | 1/6 | acquitted |
| 190317 | case_2 | ambush | 11 | theo_lindqvist | 9/11 | 11 | 1/6 | acquitted (same day) |
| 190317 | case_4 | murder | 13 | theo_lindqvist | 11/11 | 15 | 0/7 | acquitted |
| 190318 | case_2 | ambush | 13 | thabo_maseko | 12/12 | — | 1/8 (tally only) | **accused_died (day 15)** |
| 190318 | case_6 | murder | 17 | gen_vcdfzu3 | 10/11 | 19 | 0/6 | acquitted |

- **9/9 finished moots quorate, 9/9 acquitted, 0 convicted.** Guilty votes
  are 0–1 per moot; the single guilty vote is usually the target/accuser
  voting guilty (e.g. thabo_maseko, score −73, on s190318 case_2). Nobody
  else votes guilty — ever. With 0 convictions in 10 trials, the sentence
  ladder (exile/weregild/schism/cold_war) is never reached.
- **The scholar never votes** (0 `castPlayerVote` calls; 9/10 trials list
  the scholar as a voter and wait for a vote that never comes). 8 of the 9
  finished moots resolve via the 2-day backstop (`trialVoteTick`), exactly
  call-day + 2. The 9th (s190317 case_2) finished the SAME day it was
  called — its trial had `playerVoter: false`, so no wait was needed. That
  is coherent, not a bug: the wait exists only for the scholar's vote.
- **s190318 case_2** is the NO-GO row: trial held day 13, tally 7 acquit /
  1 guilty, awaiting the scholar's vote — then the accused died day 15,
  the same day the backstop would have fired, and the case resolved
  `accused_died`. The fiction voices it (see sense-test scene). The
  analyzer marks it unclassified because no finish event fired; the
  snapshot resolution is the true outcome.
- **Moots barely fire, and only on 6/8 seeds** (190313, 190314: zero cases,
  zero moots). This speaks to the open backlog line "MOOTS BARELY FIRE
  (1/4 villages, 378 village-days)" — on this band it is 10 moots in 1,110
  village-days, i.e. one moot per ~111 village-days, and 2/8 villages see
  none at all in a full life.
- Quorum is never in doubt: quorum reads show 9–12 present of 11–12
  living (quorum needs more than half); tally voters run 6–8. 0 advisory moots.
  `mootConveneHeld` reads 2/seed on moot seeds but never holds (0) — the
  scholar is at Haven when moots are called.
- **Arrival-moots are never called.** The visitor flow offers a moot 10
  times band-wide ("They're named, every one: … call a MOOT on it, or turn
  them away") and the competent policy never takes it — 10× "They waited
  three days at the edge of your fire. Nobody called the moot."

## Metric 5 — Verdicts + sentences

| seed | finishTrials | convicted | acquitted | sentences | resolves | exiles | weregild | schism | cold_war |
|---|---|---|---|---|---|---|---|---|---|
| Band | 9 | 0 | 9 | 0 | 0 | 0 | 0 | 0 | 0 |

- **9 acquittals, 0 convictions, 0 sentences, 0 resolves.** `sentenceCase`
  and `resolveCase` never fire (8/8 seeds never-live) — they only run on
  conviction, and nothing is ever convicted. The entire sentence ladder is
  unexercised in a lived village: no exile, no weregild payment, no schism
  feud, no cold war. `mootAccuserAftermath` never fires (0 calls) — the
  accuser's standing never moves on a verdict, weak case or held.
- Average belief at sentence: no data (no sentences).
- The 9 acquittals should each write a direct −8 trust (finishTrial
  acquittal, per prereg) — see metric 6: unisolable in the reconciler
  noise, but the count is 9.

## Metric 6 — Trust moves from moots

| seed | bumpTrust events | moot-attributed | net moot delta | grievances | vote grievances | aftermath calls | trust-reconcile unexplained / total |
|---|---|---|---|---|---|---|---|
| 190311 | 1,681 | 0 | 0 | 0 | 0 | 0 | 288 / 402 |
| 190312 | 2,553 | 0 | 0 | 0 | 0 | 0 | 320 / 494 |
| 190313 | 2,024 | 0 | 0 | 0 | 0 | 0 | 243 / 341 |
| 190314 | 2,532 | 0 | 0 | 0 | 0 | 0 | 257 / 408 |
| 190315 | 2,425 | 0 | 0 | 0 | 0 | 0 | 357 / 544 |
| 190316 | 1,740 | 0 | 0 | 0 | 0 | 0 | 345 / 466 |
| 190317 | 1,430 | 0 | 0 | 0 | 0 | 0 | 279 / 448 |
| 190318 | 1,457 | 0 | 0 | 1 | 0 | 0 | 274 / 413 |
| **Band** | **15,842** | **0** | **0** | **1** | **0** | **0** | **2,363 / 3,516** |

- **Quorate moots move ZERO trust under competent — confirmed on an
  independent band.** 0 of 15,842 `bumpTrust` events carries a moot/justice
  stack; net delta 0. This re-tests and confirms the trustfirst-a finding
  (43 quorate moots, 0 trust moved). The moot is pure theatre for trust:
  villagers vote, the count is taken, the verdict is spoken — and nobody's
  standing in anyone moves a point.
- The single grievance (s190318, thabo_maseko → gen_t9u5l76, kind
  `ambushed`, weight 60) is the ambush itself, not a vote grievance
  (0 vote grievances: nobody records `voted_guilty`/`voted_acquit`).
- **Trust-reconcile honesty:** 2,363/3,516 person-day trust deltas (67%)
  are NOT explained by same-day `bumpTrust` sums. I re-ran the
  reconciliation with ±1-day lags (lag 0 is best: 2,363; lag +1: 2,656;
  lag −1: 2,896) and with succession-day attribution (only 240/2,363 fall
  on succession days). The residue is real: trust is written directly all
  over the engine — betrayal.js:1105 (ambush grievance −8 direct write),
  abilityActions.js:1670/2108/2197–2198 (theft −5/−15, progressive gains),
  contests.js:6042–6044 (direct ±), game.js:2574/2579 (trust re-seeded
  5–20 on succession). `bumpTrust` is one channel among many, so the
  snapshot-vs-bump reconciler cannot attribute direct writes at this
  resolution — including the 9 acquittal −8s, which are unisolable in the
  noise. The stack-attribution verdict (0 moot-attributed) is the solid
  number; the reconciler is recorded as unfit for purpose (metric review).

## Metric 7 — Bribery

| seed | bribeVoter | exposeBribery | investigateBribery | bought votes in tallies |
|---|---|---|---|---|
| Band (8 seeds) | 0 | 0 | 0 | 0 |

- Zero across the band, as pre-registered (competent never calls the
  player-initiated bribery verbs). No bought vote appears in any tally
  without a `bribeVoter` call — no unclassified bribery event.
- Note: the say corpus contains 16 "COUNTER LEARNED — … A bribe is cheaper
  than a chase" lines (the raccoon/Lockpick monster counter). Those match
  the SAY_RE on the word "bribe" but are monster-fight advice, not moot
  bribery — false positives for this metric's say check (metric 10).

## Metric 8 — Exile life

| seed | exilePlayer | NPC exiled (removeVillager 'exiled') | exileColdResolve | exileCutsTalk calls | cuts |
|---|---|---|---|---|---|
| Band (8 seeds) | 0 | 0 | 0 | 408 | 0 |

- **No exile exists in the band.** 0 player exiles, 0 NPC exiles, 0
  cold-resolve outcomes, 0 defied-exile uprisings, 0 uprising aftermaths.
  Exile life is unmeasured because exile never happens (it needs a
  conviction, metric 5: 0).
- `justiceExileCutsTalk` is called 408 times (36–75/seed) and cuts 0
  times. The call site is `villagerInitiative` (game.js:19080) on ordinary
  talk attempts — a speculative check that returns false when nobody is
  exiled. It is a heartbeat, not exile life; counting it as exile activity
  would be wrong.
- Removals band-wide: 116 (`killed` 112, `ambushed` 4) — all deaths, no
  exiles, no fled, no splinter.

## Metric 9 — Theft

| seed | stealFrom calls | steal ok | theftConfrontations | recordCrime theft booked |
|---|---|---|---|---|
| 190311 | 0 | 0 | 350 | 0 |
| 190312 | 0 | 0 | 265 | 0 |
| 190313 | 0 | 0 | 141 | 0 |
| 190314 | 0 | 0 | 439 | 0 |
| 190315 | 0 | 0 | 110 | 0 |
| 190316 | 0 | 0 | 346 | 0 |
| 190317 | 0 | 0 | 138 | 0 |
| 190318 | 0 | 0 | 155 | 0 |
| **Band** | **0** | **0** | **1,944** | **0** |

- `stealFrom`: 0 calls, as pre-registered (competent never steals).
- `theftConfrontation`: 1,944 calls (110–439/seed), totalKcal 12–500 per
  call, sum 374,941 kcal. The call site is `takeFromPantry` (game.js:16827)
  via the competent doorstep step — it is the freeloader ledger check on
  every pantry take, not a confrontation the player experiences: it feeds
  the takes/gives net that produces the +10/+25 heat (metric 2) and nothing
  else. No take ever becomes a booked theft crime, no confrontation is ever
  spoken, no restitution is ever owed. The name overpromises the event.

## Metric 10 — Say-line coherence

The driver captured 197 lines (cap 200/seed, never hit — max 46/seed).
Classified line-by-line:

| bucket | count | verdict |
|---|---|---|
| True moot-trial lines (accusation 11, called 19, vote ask 9, backstop 8, count 9, count result 9, verdict 9, accused-died 1) | 75 | coherent; see checks below |
| Arrival-moot offer + not-called | 20 | coherent; offer never taken |
| **False positives (regex leak)** | **102** | instrument gap, see below |
| — Lucky Coin ("Worn smooth" — "smooth" contains "moot") | 29 | FP |
| — Counter-learned ("A bribe is cheaper than a chase") | 16 | FP (matched "bribe") |
| — Plant IDs ("Smooth stalks…") | 10 | FP |
| — Stag "Confrontation!" ability | 10 | FP (matched "confront") |
| — Other "smooth" lines (teaching, looks, "Too smooth. Too… practiced?") | 11 | FP |
| — Emberhold bond ("grief delays the verdict") | 5 | FP (matched "verdict") |
| — Food-tasting ("The fire's verdict: food, carefully") | 4 | FP |
| — Trail ("worn smooth as an old coin") | 4 | FP |
| — Scroll monster ("The ruling seats…", ⚖) | 2 | FP (matched ⚖) |
| — Gavel monster lines | 3 | FP (monster, not moot) |
| — SYSTEM lie line ("That's not justice, that's a CHECKMATE!") | 1 | FP |

- **The regex leak is the big instrument finding:** SAY_RE uses bare
  `/moot/i`, and "smooth" contains "moot" as a substring — every "smooth"
  line in the game matches. 29 Lucky Coin lines alone (22 consecutive days
  on s190317, d118–d139, the same line every day) are one item's daily
  reminder, not justice. The corpus is 52% noise by line count. Fix for
  the next run: `\bmoot\b` + drop or bound the loose terms ("bribe" only
  inside moot context; "verdict" only with moot/accused nearby).
- **Vote-count coherence: 9/9 exact.** Every finished moot's spoken count
  matches its live tally: "0 for guilty. 6 against" ↔ 0/6; "1 for guilty.
  6 against" ↔ 1/7; "0 for guilty. 7 against" ↔ 0/7; "1 for guilty. 7
  against" ↔ 1/8; "1 for guilty. 5 against" ↔ 1/6. No number in the
  fiction contradicts the live state it describes.
- **No verbatim-repeat defect in the moot script itself** — but the script
  is FIXED: all 9 finished moots run the identical 7-line sequence
  ("Word reaches you, days late: X stands accused over what happened to
  Y" → "Z has been talking at the fires" → "Z calls the moot" → "The moot
  turns to you" → "The moot doesn't wait forever" → "The fire is built
  high" → "W counts on their fingers… 'N for guilty. M against'" →
  "Not guilty — this time."). Only names and counts vary; charge, accused
  count (always 3), and verdict never change the words. A moot about a
  murder reads exactly like a moot about an ambush. That is the r29/r41b
  repeat-fix working as designed (no accidental duplication) — and a
  variety gap: the moot has one voice.
- **Accusation announcements: 11/11, one per case, no duplicates.** The
  apparent s190318 d011/d012 repeat ("Rodrigo stands accused…") is two
  different cases (case_2 announced d011, duplicate case_4 announced d012)
  — see metric 3.
- **The one line that breaks the template is the best line in the corpus:**
  s190318 d014, on the accused dying mid-trial: "Rodrigo is gone — the
  moot doesn't try the dead. The cases die with the accused; the fire
  remembers the rest." The system knows the case died and says so
  plainly, the day it happens. Coherent and human.
- **Emberhold bond line repeats verbatim 5×** ("Emberhold watches to see
  if Haven holds without its dead… (Trust −8.)", s190311 d049, s190313
  d046, s190315 d049 + d061, s190318 d065) — twice on s190315 (d049, d061).
  It is a bond-test line, not a moot line; the repetition is a variety gap
  in the bond system, surfaced here because it matched "verdict".

## Sense-test scenes (quoted)

**Scene 1 — a full moot, s190311 d010–d016 (murder case, then ambush case).**
Day 10: "Word reaches you, days late: Sofia stands accused over what
happened to Yara. There's going to be a moot. People are choosing sides."
Day 11: "Hans has been talking at the fires. Enough voices — tonight they
call a moot. Sofia answers for what happened to Yara." / "Hans calls the
moot. The fire gets built up — word travels fast, and almost everyone
comes." / "The moot turns to you. Your vote matters here — and everyone
will remember it." Day 13: "The moot doesn't wait forever. Two days of
silence from the fire's edge — the count is taken without you." / "The fire
is built high. Nobody speaks while the count is taken — you can hear the
wind past the edge of the light." / "Hans counts on their fingers, twice,
like they don't trust the first number. Then, to the fire: '0 for guilty.
6 against.'" / "A long exhale moves around the fire like weather. 'Not
guilty — this time.'" Two days later the same script runs for Lena/Aroha
with "1 for guilty. 6 against." It reads well. It also reads the same
every time — and note the fiction's promise: "Your vote matters here — and
everyone will remember it." The scholar never votes, the count is taken
without them, and (metric 6) nobody remembers anything in trust terms.
The line is a lie the system tells every moot.

**Scene 2 — the trial that died with its accused, s190318 d011–d019.**
"Rodrigo stands accused over what happened to Thabo." Moot called d013.
Then d014: "Rodrigo is gone — the moot doesn't try the dead. The cases die
with the accused; the fire remembers the rest." The next day the mirror
case opens: "Thabo stands accused over what happened to Rodrigo." The
village tries the survivor of the same ambush and acquits him 0–6 on d019.
This is the most human sequence in the corpus: accusation, death, a spoken
acknowledgment, a counter-accusation, an acquittal. It is also the sequence
the analyzer failed to classify — the system's own voice understood the
outcome and the classifier did not.

**Scene 3 — the offer nobody takes, s190313 d027–d030 (×10 band-wide).**
"They're named, every one: Malik Kowalski, Ellis Khan. Your move — ask
them questions (up to three), call a MOOT on it, or turn them away at the
edge of the firelight." Three days later: "They waited three days at the
edge of your fire. Nobody called the moot. Malik nods — not angry, just
done — and they walk." The arrival moot is offered as a real choice and
taken zero times in ten offers. The strangers walk away; the village never
learns what it turned away. (Competent never calls it — a player-side
choice, but the census says the option is dead weight under the default
policy.)

**Scene 4 — the cold shoulder nobody hears, all seeds.** The ladder's
stage-1 line ("Something has shifted. Conversations stop when you approach
the fire. Nobody meets your eyes for long.") fires 32 times and appears
ZERO times in the say corpus, because the capture regex has no term for
it. The one moment the village actually judges the scholar is invisible to
the instrument built to watch it.

## Village assessment (plain words)

Eight villages, eight full lives, and the justice system mostly watches
from the sidelines. Villagers do accuse each other — ambushes and murders
between villagers open cases, moots are called, the fire is built, votes
are counted, and everyone is acquitted, every single time. The moot is a
ritual that cannot convict: the only guilty votes ever cast are the
accusers voting for their own case. Nobody is exiled, nobody pays
weregild, no feud splits the village, no cold war freezes anyone out. And
the scholar — you — is never accused, never confronted, never asked to
answer for anything, because the only crimes the book can hold are yours
and you commit none. The village goes quiet around you a few times
(heat from eating more than you give), and then you die and the next
scholar starts clean, the slate wiped by succession. The moot's words are
good words — "the fire remembers the rest" is a real line — but the moot
has one voice, one script, and no consequences: after the verdict, trust
does not move a point, and life goes on exactly as before. The system is
not broken. It is a courtroom that only ever acquits, for defendants the
player never meets, in a village that forgets the trial the moment the
fire dies.

## Metric review (§14 — for the NEXT run, never re-scored here)

1. **Moot classifier must read snapshot resolutions.** The NO-GO row's fix:
   `classifyMootRecord` should consult the case's final snapshot status/
   resolution (`accused_died`, `acquitted`, `open-at-end`) when no finish
   event exists. Add `accused_died` (and any other snapshot resolution) to
   the outcome set. Expected effect: the s190318 case_2 row becomes
   classified; the GO bar stays 0 unclassified.
2. **SAY_RE needs word boundaries + context.** `/moot/i` matches "smooth"
   (52% of the corpus is noise). Use `\bmoot\b`; bound "bribe"/"verdict"/
   "confront" to moot-adjacent lines; ADD the cold-shoulder line's terms
   ("conversations stop", "Something has shifted") so the ladder's own
   voice is captured. The 200-line cap never bound (max 46/seed), so the
   fix is precision, not capacity.
3. **Trust reconciler is unfit for direct-write attribution.** It compares
   one channel (`bumpTrust`) against a map written directly in at least
   five places (betrayal.js:1105, abilityActions, contests, succession
   re-seed). Either instrument the direct writes (wrap the assignment
   sites — expensive) or drop the reconciler and judge moot-trust purely
   on stack attribution + aftermath/grievance counts, which is what this
   evidence does. The reconciler numbers (2,363/3,516 unexplained) are
   reported honestly but are not a finding about moots.
4. **Case counting should de-duplicate incidents.** 11 cases / ~5
   incidents: the next census should group cases by (accused-set, target,
   charge-window) and report incidents alongside cases, so a duplicate
   filing does not read as two crimes.
5. **The engagement floor held, but the pool is thin.** 21 cases+moots
   clears the ≥1 floor easily; the binding constraint is not count but
   outcome variety (0 convictions). A future run that wants sentence data
   needs a policy that convicts (e.g. a player-crime policy) or a fixture
   census — competent play will never produce a sentence.
6. **Metric 2's "cooling" needs a succession-aware definition.** Stage
   relaxes 1→0 only via succession in this corpus; the tick-level cooling
   branch (heat < 20) never fired. Report cooling and succession-reset as
   separate rows next time.

## Findings (new sim-findings.md lines for the coordinator to append)

- [open] 2026-11-11 — justice / ladder — SCHOLAR LADDER UNREACHABLE UNDER COMPETENT: heat caps at 25 (takes/gives net only, 0 booked player crimes), confrontation needs 50, moot demand 70 — 0 confrontations / 0 demands / 0 uprisings in 1,110 village-days, 4,478 ticks (sim-justicefirst-a).
- [open] 2026-11-11 — justice / ladder — SUCCESSION WIPES THE LADDER: all 32 stage 1→0 drops coincide with a bearer change; zero genuine cooling events; the cold shoulder dies with the scholar (sim-justicefirst-a).
- [open] 2026-11-11 — justice / cases — ONE INCIDENT, MULTIPLE CASES: the same accused trio + target opens as 2–3 cases (s190318 case_2 + case_4 identical ambush; s190317 ambush + murder same trio) — 11 cases from ~5 incidents (sim-justicefirst-a).
- [open] 2026-11-11 — justice / moots — MOOTS NEVER CONVICT: 9/9 finished moots acquitted, 0–1 guilty votes each (the accuser voting for their own case); sentence ladder (exile/weregild/schism/cold_war) never reached in a lived village (sim-justicefirst-a).
- [open] 2026-11-11 — justice / moots — MOOTS MOVE ZERO TRUST: 0/15,842 bumpTrust events moot-attributed, net 0 — confirms trustfirst-a on an independent band; "Your vote matters… everyone will remember it" is fiction the numbers contradict (sim-justicefirst-a).
- [open] 2026-11-11 — justice / moots — MOOT HAS ONE VOICE: all 9 finished moots run the identical 7-line script; charge and accused count never change the words (sim-justicefirst-a).
- [open] 2026-11-11 — justice / moots — ARRIVAL MOOT NEVER CALLED: 10 offers, 0 taken under competent; strangers wait 3 days and walk (sim-justicefirst-a).
- [open] 2026-11-11 — justice / crimes — NPC CRIMES NEVER BOOKED: recordCrime drops all NPC-villain crimes (4/4 in band); the crime book is player-only, so NPC-vs-NPC cases come from plots, never from the book (sim-justicefirst-a).
- [open] 2026-11-11 — justice / instrument — SAY_RE "smooth" LEAK: bare /moot/i matches "smooth" — 102/197 captured say lines are false positives (29 Lucky Coin alone); cold-shoulder line never captured (sim-justicefirst-a).
- [open] 2026-11-11 — scale wall — NATIONAL STILL 0: 8/8 regional, 0 national, 0 table, 0 wins; wave 5 unlocked 3/8; median survival 141d; 706 deaths, 83% monster (sim-justicefirst-a, same 8 villages as dutyfirst-b).

## Backlog lines spoken to

- [open] 2026-11-09 — social / moots — MOOTS BARELY FIRE (1/4 villages,
  378 village-days): this census speaks to it — 10 moots in 1,110
  village-days (one per ~111 village-days), 2/8 villages with zero moots
  in a full life. The line stays open; the rate is now measured.
- [open] 2026-11-11 — moot — moot vote trust moves (±6) are player-gated;
  43 quorate moots move 0 trust (sim-trustfirst-a): CONFIRMED on this
  band — 9 quorate moots, 0 trust moved. The line stays open; the
  confirmation is now second-band.

## Files

- Prereg: `evidence/2026-11-11/sim-justicefirst-a-prereg.md` (commit
  e825803b7; base b09cf584e; run anchor e825803b7)
- Evidence: `evidence/2026-11-11/sim-justicefirst-a.md` (this file)
- Summary: `evidence/2026-11-11/justicefirst-summary-justicefirst-pilot.json`
- Per-seed corpus: `evidence/2026-11-11/perseed-justicefirst-a/` (16 files,
  8 seeds × control + neutral)
- Instrument: `scripts/justicefirst-instrument-20261111.js`
- Driver: `scripts/justicefirst-driver-20261111.js`
- Analyzer: `scripts/justicefirst-analyze-20261111.js`
- Proof: `scripts/test-justicefirst-a.js` (61/61 green, pre- and
  post-rebase)

## Convergence

- Convergence state: **NO-GO on one instrument row (moots unclassified
  1/10)** — analyzer classification gap, fully explained in-corpus.
  Census complete; no lever; no confirm spend.
- Balanced panel (§15): none — measurement arm with no lever change and no
  before/after arms; control/neutral legs are the neutrality proof (same
  position as sim-trustfirst-a). No panel metric for justice/moot exists;
  this arm supplies its first-numbers analogue (metrics 1–10).
