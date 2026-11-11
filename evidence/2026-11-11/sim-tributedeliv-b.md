# sim-tributedeliv-b — tribute-delivery diag (Loop B, arm 2 of 3)

- **Run:** fleshout-loop-b-20261111T1830Z, arm sim-tributedeliv-b
- **Prereg:** `evidence/2026-11-11/sim-tributedeliv-b-prereg.md` (committed
  `b110c4fb9`, after rebase onto explicit master `3eec28a81`, before any
  judged sim; freshness re-check recorded in the prereg itself)
- **Base:** local master `3eec28a81` (Loop A sim-siegedesign-a) + this
  arm's instrument files only. **ZERO src/js changes.** Sims ran at
  anchor `31e30087b` (instrument commit) on top of `3eec28a81`.
- **Instrument / driver / analyzer / proof:** `scripts/tributedeliv-instrument-20261111.js`,
  `scripts/tributedeliv-driver-20261111.js`, `scripts/tributedeliv-analyze-20261111.js`,
  `scripts/test-tributedeliv-b.js` (committed `31e30087b`, **55/55 green**)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max);
  re-trace 190393, 190397 + fresh band 190411–190418; competent verbatim
- **Seed band:** 190411–190418 verified FRESH per the seed-band skill
  (zero hits in all dated preregs, all dated evidence `.md`; 7 goal
  `hidden_files/` hits all proven false positives — digit strings inside
  longer floats, never seed reservations; see prereg)
- **Canon note:** no `docs/` file covers the military tribute.
  `docs/CANON.md` and `docs/MONSTER-WAVES.md` were read first; the
  veteran-bar rule comes from MONSTER-WAVES.md design call #4 and Steve's
  2026-11-10 scholar-counts ruling. The tribute rule is read from code
  only (`src/js/ladder.js`, `src/js/table.js`, `src/js/app.js` panelHaven)
  — nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-tributedeliv-b/` — 10 per-seed
  JSONs (2 re-trace + 8 band); summary
  `evidence/2026-11-11/tributedeliv-b-summary.json`
- **Run notes (infrastructure):** the runtime restarted ~19:37Z before
  this arm's work resumed; the coordinator verified the tree held only
  the untracked prereg, no commits, no sims run. Recovery: prereg
  committed first (`8897a2fcf`, rebased to `b110c4fb9` onto explicit
  master `3eec28a81`), then the brief resumed. The `safe-commit.sh`
  index-clobber quirk struck on BOTH commits (files showed as deleted
  in the main index after a correct commit); repaired both times with
  the `git ls-tree HEAD | git update-index --add --index-info` pipe and
  verified `git status --short` empty + `git show --stat` correct before
  proceeding. No work lost.

## Verdict: DIAG-GO

The analyzer (`scripts/tributedeliv-analyze-20261111.js`, exit 0)
classifies **9/9 ready days, 0 UNCLASSIFIED**. Every ready day is the
same named condition:

| Code | Ready-days | Meaning |
|---|---|---|
| `PAYABLE_SHORT` | 9/9 | ready (veterans 2) with payable 1 — scholar + 1 villager; delivery would refuse `veterans-short` |
| `DELIVERABLE_NO_ATTEMPT` | 0 | the payable pair (≥2) never stood on any day |
| `ATTEMPT_REFUSED_*` | 0 | no delivery was ever attempted |
| `DELIVERED` | 0 | no delivery ever fired |
| `UNCLASSIFIED` | 0 | — |

- **Deliverable-pair days (payable ≥ 2): 0** band-wide, 0 across all
  10 seeds. **Delivery attempts: 0.** Deliveries: 0.
- Ready-days split by (veterans, payable): `2/1`: 9 — all nine are the
  scholar+1 shape; `scholarIsVeteran` true on all nine.
- Day distribution over all 1,146 snapshot-days: `0/0`: 976, `1/0`:
  117, `1/1`: 44, `2/1`: 9. Max payable on ANY seed: 1. The pair the
  delivery needs never existed, on any day, on any seed.

## §1 The named blocking condition: PAYABLE_SHORT (scholar+1)

The prime suspect, read in code before the sims and confirmed on every
ready day observed: **readiness counts the scholar, delivery needs 2
PAYABLE — ready can hold with payable = 1, and on this corpus it always
did.** All 9 ready days are `veterans 2 / payable 1 / scholarIsVeteran
true`. The delivery gate's own replicated `seen` count agrees exactly
(1 on all 9 days) — no roster-vs-`vp.dead` divergence; the two counts
never disagree anywhere in the corpus.

The second branch is confirmed as the standing condition, not just a
code reading: **0 delivery attempts in 1,146 days.** The wrap on
`ladderDeliverCapstone` logged nothing, on any seed, on any day — the
competent policy never calls the Haven entry point, and no other caller
fires in sim. But note the asymmetry (§7): the
`DELIVERABLE_NO_ATTEMPT` shape (pair stands, nobody attempts) was never
observed in the wild — only in the fixture. The pair never stood, so
the policy-attempt question is still untested on a live pair.

## §2 The 9 ready days — seed 190416, d103–d111

The whole ready corpus is one window on one seed:

| Day | veterans | payable | scholar | payable veteran (delivery `seen`) |
|---|---|---|---|---|
| d103–d111 | 2 | 1 | hannah_kim (w4 kill d102, via player) | Raúl, visjoin_87 (w4 kill d95, via aid-crisis) |

- The window opens the day after the scholar's wave-4 kill (d102) and
  holds 9 days. Raúl, a wild-join villager, made the other wave-4 kill
  answering an aid call on d95.
- **The window closes by succession, not by combat.** On d111 the
  scholar hannah_kim dies of **starvation** (player death). On d113
  the new scholar is **visjoin_87 — Raúl himself**: the village's only
  payable veteran inherited the scholar's chair. Read: `veterans 1 /
  payable 0`, delivery `seen` 0. The tribute's payment walked into the
  job that cannot pay it. (d112 has no snapshot — the succession day
  itself produced no daily snapshot; the day before and after bracket
  it. Recorded, not smoothed over.)
- The other seeds never got close: max veterans 1 on 7 of 8 band seeds
  (190417 max 0), max payable 1 on 4 of 8. The tribute was never ready
  anywhere else.

## §3 Re-trace: MISMATCH — trajectories diverged, master moved (not an instrument failure)

Both re-trace seeds **did not reproduce** the vetphantom fix leg:

| Seed | Vetphantom fix leg (anchor `7d93e418a`) | This run (base `3eec28a81`) |
|---|---|---|
| 190393 | survived 150d, tribute ready 2/1 | village-lost d149, maxWave 4, tribute 0/0, 0 ready days |
| 190397 | survived 150d, tribute ready 2/1 | village-lost d142, maxWave 5, tribute 0/0, 0 ready days |

Cause, verified: **master moved underneath the re-trace.** Between
the vetphantom anchor and `3eec28a81`, `src/js/` changed by **4,677
insertions across 22 files** (villager-brain.js +1,061,
villager-objectives.js +613, godverbs +587, titans +427, …), and the
reconcile branch `743e07d87` **is an ancestor** of `3eec28a81`
(`git merge-base --is-ancestor` — the reconcile merge, with Cursor's
dawn scorer, is in this base). The same seed on different game code is
a different village; reproduction was never possible on this base. The
instrument is exonerated: 0 instrument errors, 1,146 snapshots, the
driver's built-in re-trace check reported the mismatch loudly instead
of silently re-labeling it. The re-trace leg is therefore VOID for
ready-day classification — the verdict rides on the fresh band, which
was run on the same base as the verdict. A future re-trace needs the
vetphantom anchor code, not just the vetphantom seeds.

## §4 Wall numbers — survival collapsed on current master

| Seed | Days | End | Standing | Scale | MaxWave | Tribute end | Ready days | Deaths |
|---|---|---|---|---|---|---|---|---|
| 190393 | 149 | village-lost | 199 | regional | 4 | 0/0 | 0 | 80 |
| 190397 | 142 | village-lost | 370 | regional | 5 | 0/0 | 0 | 87 |
| 190411 | 94 | village-lost | 175 | regional | 4 | 1/0 | 0 | 101 |
| 190412 | 131 | village-lost | 199 | regional | 4 | 0/0 | 0 | 80 |
| 190413 | 70 | village-lost | 199 | regional | 4 | 0/0 | 0 | 57 |
| 190414 | 132 | village-lost | 199 | regional | 4 | 0/0 | 0 | 60 |
| 190415 | 89 | village-lost | 175 | regional | 4 | 1/0 | 0 | 110 |
| 190416 | 130 | village-lost | 250 | regional | 5 | 1/0 | 9 | 74 |
| 190417 | 74 | village-lost | 150 | regional | 4 | 0/0 | 0 | 49 |
| 190418 | 150 | survived | 199 | regional | 4 | 1/1 | 0 | 59 |
| **band (8)** | **median 130d** | **1 survived / 7 lost** | **150–250** | **regional 8/8** | **5 on 1/8** | — | **9** | **637** |
| **all 10** | **median 131d** | **1 survived / 9 lost** | **150–370** | **regional 10/10** | **5 on 2/10** | — | **9** | **737** |

- **National 0/10, table 0/10, wins 0/10.** Wave-4 unlocks 10/10,
  wave-5 unlocks 2/10.
- Against the vetphantom band on the old base (6/8 survived, median
  150d): **survival collapsed to 1/8 on the fresh band, median 130d.**
  Nine of ten villages are lost. This is the loudest wall number in
  the arm — the current master (post-reconcile) loses villages far
  earlier than the base the vetphantom band was measured on. Whether
  the reconcile merge itself did this is NOT proven by this arm (no
  control leg on the old code was run); it is flagged here as the
  prime suspect for a follow-up, with the numbers attached.
- Death causes (737 deaths, all 10 seeds): villager combat 340,
  combat 106, expedition 145, the wild 104 — villages die fighting,
  not hungry (starvation 4, sickness 5, thirst 1). The one starvation
  that matters is the scholar's (190416 d111), because it closed the
  only ready window in the corpus.

## §5 Sense test — the military tribute is voiceless

The say-capture (`/tribute/i`, 181 lines across 10 seeds) mentions the
military tribute **zero times**. Every line is the food/link tribute:

> 🌾 Tribute wagons from The Hungry Road II turn at the gate — our shelves are full past tomorrow. "Eat well," we send back. "That IS your tribute this week." (Trust +1.) (190416 d49, d56, d63, d70, d77, d84 — byte-identical each week)
> ⛓️ Jesse brings it home: The Hungry Road II bows to Haven — one organization, us primary. Tribute: 4,000 kcal/week. (190416 d48)
> 🧳 The trader lowers their voice. "And further still — FOUR fires under one head. They call it a REALM. Tribute flows uphill like a river; I saw the grain carts with my own eyes." (190416 d54)

On 190416, during the 9 ready days (d103–d111), **no line mentions
the tribute deed, the veterans, the table, or the seat at all** — the
ready window passes in complete silence while the weekly food-tribute
wagons keep rolling. A player sitting on a ready tribute would never
know from the narration: the word "tribute" in this game means grain,
and the deed that costs two fighters has no voice. (Caveat: the
capture is `/tribute/i` on `Game.say`; a line that names the deed
without the word "tribute" cannot be ruled out — but the deed's own
delivery lines, which DO say "THE TRIBUTE", never fired, so there was
nothing to hear.)

## §6 Village assessment, in plain words

Ten villages, and nine of them die. They don't starve — they get
killed, in fights and on the road, usually before day 130. One village
in ten makes it to day 150, and it ends with a single living veteran
who can't pay the tribute alone. The tribute itself is the strangest
thing in the game: twice now it has been ready — two living wave-4
veterans, the table's price — and both times one of the two was the
scholar, the one person who can never be paid. On the one seed where
it was ready this run, the village held it for nine days while nobody
said a word about it, and then the scholar starved and her only
fighting companion inherited her chair, which erased the payment
entirely. The village didn't refuse the tribute and didn't fail to
reach it — it never had two people to send, and the one time it came
close, the game promoted the payment away. The tribute isn't blocked
by a broken button. It's blocked because living wave-4 veterans are so
rare that the second one is almost always the player character, and
because villages die before they can bank a spare.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — ready-days classified / ready-days total: DIAG-GO
  (9/9, 0 UNCLASSIFIED).** The analyzer is the judge; it exits 0.
- **Secondary — deliverable-pair days: 0.** Ready-days split:
  `2/1`: 9. Attempts: 0 + outcomes: none. All as reported, none
  re-scored.
- **Re-trace leg — VOID, recorded as MISMATCH (§3).** The prereg
  assumed the vetphantom trajectories would reproduce; master moved
  (reconcile merge + 4,677 src/js insertions) and they did not. The
  verdict does not depend on the re-trace: the fresh band alone
  supplies the 9 ready days and the DIAG-GO. A re-trace against the
  vetphantom anchor code is the named next step if anyone wants the
  two known-ready seeds back.
- **What this diag did NOT observe:** `DELIVERABLE_NO_ATTEMPT` never
  occurred in the wild (only in the fixture) — the pair never stood,
  so the "pair stands, nobody attempts" shape is still unmeasured
  live. The proof test covers the shape; the wild does not. Any claim
  about policy behavior on a live pair would be extrapolation.
- **Panel (§15):** N/A — instrument-only diag, no code change, no
  before/after to compare; the analyzer is the instrument and the
  judge. **Telemetry check:** attempted and REFUSED by the tool itself
  — same refusal class as vetphantom-b ("recorder-corpus input ...
  compared with sweep-compare tables, never against a run baseline").
  Recorded, not waived.
- **Proof:** `scripts/test-tributedeliv-b.js` 55/55 green before any
  judged sim (classifier separates all four codes on synthetic states;
  live refusal at payable 1 with `veterans-short`, live success at
  payable 2 with both names; analyzer DIAG-GO on a known corpus
  covering all four codes). The fixture also proves the delivery
  itself works when the pair stands — the game code is not broken;
  the pair is what never stands.

## §8 Findings #2255 — disposition (coordinator updates sim-findings.md)

- **Prime suspect CONFIRMED as the binding condition on every ready
  day observed:** `PAYABLE_SHORT`, scholar+1, 9/9 ready days; the
  readiness/delivery split (Steve RULED 2026-11-10) is doing exactly
  what the code comments say it does.
- **Second branch CONFIRMED as the standing condition:** 0 delivery
  attempts in 1,146 days — delivery is a Haven-panel player act the
  competent policy never performs.
- **Deeper finding, new:** the pair (payable ≥ 2) NEVER stood on any
  day of any seed (max payable 1 everywhere). The blocker is upstream
  of both branches — villages die before banking two living payable
  veterans, and the second veteran is usually the scholar. Plus the
  succession trap (190416): the only payable veteran can inherit the
  scholar's chair and erase the payment.
- **Still open (steve-call):** what the scholar pays, if anything,
  when the pair is scholar+1 — this arm does not invent a scholar
  payment. **Still open:** the voiceless tribute (§5) — no line ever
  names the deed, even while ready. **New, loud:** survival collapse
  on current master (1/8 band survived vs 6/8 vetphantom; §4) —
  needs a control leg before anyone blames the reconcile merge.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/tributedeliv-instrument-20261111.js` — daily
  snapshot (engine tribute read + verbatim delivery-`seen`
  replication + scholar flag + delivered state) + `ladderDeliverCapstone`
  attempt wrap + `/tribute/i` say capture. Pure `classifyDay` shared
  by instrument, analyzer, and proof test (defined once).
- **Driver:** `scripts/tributedeliv-driver-20261111.js` (competent
  verbatim, 150d; built-in re-trace check against the vetphantom fix-leg
  end reads; writeRobust per-seed files; refuses overwrite).
- **Analyzer:** `scripts/tributedeliv-analyze-20261111.js` (exit 0 on
  DIAG-GO; writes `evidence/2026-11-11/tributedeliv-b-summary.json`).
- **Proof:** `scripts/test-tributedeliv-b.js`, 55/55 green.
- **Corpus:** `evidence/2026-11-11/perseed-tributedeliv-b/tributedeliv-s19039{3,7}-tributedeliv-retrace.json`
  (2 files), `tributedeliv-s19041{1..8}-tributedeliv-band.json`
  (8 files). Summary: `evidence/2026-11-11/tributedeliv-b-summary.json`.
- **Files in this arm:** this evidence file, the summary JSON, the 10
  per-seed JSONs. Prereg (`b110c4fb9`) and fixture/driver/analyzer/proof
  (`31e30087b`) were committed earlier in this arm.
- **No src/js change by this arm.** Ready to merge, pending ship
  (coordinator merges; no push, no bump, no live verification by this arm).
