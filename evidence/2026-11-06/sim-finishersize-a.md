# sim-finishersize-a — FINISHER-SIZE: a committed finish for beasts met below their break line

- Run: fleshout-20261107T0221Z, Loop A arm sim-finishersize-a (tracker blank #1, finding #1829)
- Prereg: evidence/2026-11-06/sim-finishersize-a-prereg.md (binds this run, MEASUREMENT §14)
- Lever from: evidence/2026-11-06/sim-grind-a.md (GO, landed eabf00dba) — the field cannot finish a 41-HP beast
- Branch: sim-finishersize-a; commits 75cb6518b (prereg + tooling), 254682f72 (lever + proof test), 719ef3fe7 (analyzer counting fix), see below
- Seeds: pilot 99661–99668 (8 seeds, freshness-verified in the prereg), competent policy, 150d death-aware horizon
- Verdict: **DIAG-GO** — mechanism proven and safe, count GO missed on a metric now classified METRIC-BROKEN (§14a). See "Verdict, honestly" below; the count bar was mathematically impossible on this band, so this is not a lever failure.
- Status: merged locally, pending ship (coordinator merges; no push, no bump, no live verification by this arm)

## What changed, in plain words

When a villager meets a big beast that is already badly hurt — below the line where a beast normally breaks and runs (15% of its health left) — and their first close-up strike doesn't kill it, they now decide to finish it: they hold their ground and keep striking for up to three rounds, as long as they stay healthy enough (above 40% of their own health). The beast only has to be small enough to actually die from about three of their strikes — a 41-health beast dies in the meeting, a 125-health beast stays a job for the turn-based fight, exactly as the sizing target said. If the fighter is hurt, or just out learning rather than hunting, or the beast is too big, nothing changes — they behave exactly as before. The trick that talks a Eulogy down (the counter-dismissal) still works untouched: a fighter who knows the trick still dismisses the beast kindly instead of killing it.

In the game this is one new decision inside the field-fight rules (`src/js/fieldFights.js`): after the first close-up strike, if the beast is within three strikes of dead and the fighter is at 60% health or better and came to fight, the fighter commits. While committed, the "this fight is hopeless, run" voice is held back (the fighter still runs if they drop below 40% health, and their companions' safety floor still applies), and the beast cannot slip away. The commitment ends after three rounds of holding, or the moment the beast dies, or the moment the fighter's own two-blow rule takes over (see below).

## The lever, played

The one real committed finish in the wild this band — seed 99667, day 109, Sujinda vs The Strike (entered at 34 HP, 3.4% of its health):

> Sujinda sees it — The Strike is broken and close enough to finish. They hold the line to end it. (Committed finish, met-below-break)
> Sujinda closes in and strikes with the machete for 26 (8 left) — but The Strike holds its ground, wounded, and still coming. (Committed)
> R1: Sujinda strikes for 25 (0 left)
> The lead falls — the pack's coordination shatters. The rest scatter or die.

The added line reads like a decision a person makes, names the beast, and states the intent ("hold the line to end it"). The rest of the fight is byte-identical to the baseline leg's transcript for the same meeting — the lever adds one line of narration and changes nothing else about the fight. The old code killed this beast too (by ordinary morale, round 1), so this is a mechanism demonstration, not a new kill — see the verdict section for why that matters.

The other below-break meeting, seed 99664 day 104 (Devon vs The Eulogy, 17 HP): the first close-up strike kills outright (20 damage, 0 rounds). No commitment forms — there is nothing left to commit to. Same transcript both legs.

The near-miss that proves the window is drawn correctly: seed 99664 day 101, Devon meets The Eulogy at 144 HP — 16%, one point above the break line. Six rounds, 127 damage dealt, Devon flees with 7 health left; the lever does not touch the fight (no commitment fields at all — it was met above the line). Three days later the palisade wall delivers the same beast to 17 HP and Devon finishes it at the next meeting. The lever only ever fires on beasts met below the line; the above-the-line grind is unchanged.

## Proof the mechanism works (before the sims)

`scripts/test-finishersize-20261106.js` — **89 passed, 0 failed** (65 engine/static + 24 corpus re-derivation checks, armed corpus included). Every leg runs the real fight engine on seeded streams, seed 87104:

- A. Herald + ally, 41 HP, hunting spear, 30 streams: 30/30 commits, 30/30 commit-kills; every commit satisfies commit-HP ≤ 3× the proven strike and fighter entry HP ≥ 60%; kill sample dealt ≥ 41 total damage by real strikes over ≥ 1 round.
- B. Audit solo, 41 HP, 30 streams: 27 commits, 26 commit-kills (the one non-kill is a fighter death — the commit holds, the beast wins the race).
- C. Herald solo, 41 HP: 0 commits — intent is learn, the gate holds (fsNoCommitWhy 'intent' on every fight).
- D. Above-tail negatives (herald 115 HP, audit 125 HP, with ally, 60 fights): 0 commits, contact evaluated, reason 'above-tail' every time. The 125-HP beast stays a turn-based job.
- E. Wave-2 negative (moderator 20/170): 0 commits, reason 'wave', contact never fired.
- F. Low-HP negative (audit 41 HP, fighter at 30 HP): 0 commits, reason 'low-hp' every time.
- G. Eulogy dismissal (trick known, solo, armored, 41 HP, 10 streams): 10/10 dismissals — the beast is talked down at 3 contradictions, 0 kills, the beast survives, and the commit was live on every dismissal fight. The commit never swallows a signature exit.
- H. Takeover + cap invariant (ad_break 33 HP, weak stick, armored, 60 streams): FS commits fired, twoblow took some over (final kind 'two-blow'), 0 lapses, every commit satisfies the size gate. The 3-round cap is a backstop: in practice twoblow takes a live commit over before the cap binds, and the takeover is now recorded (kind flips to 'two-blow') so a lapsed commit can never re-form and spam the log — that re-forming was caught in a probe (lapse firing at rounds 4, 5, …) and fixed before the pilot.
- Static: gate text (3× size gate, 60% gate, 3-round cap, takeover, lapse line), mBreak / MAX_ROUNDS = 15 / 40% companion floor / twoblow gate all unchanged; no rounds-cap or armor-ignoring change anywhere.
- Corpus: per-seed below-break kill counts re-derive exactly; recorder errors 0; baseline FS commits 0 (no rule on baseline code); armed above-tail commits 0.

Nearest existing suites on the new code: twoblow 77/77, contactfinish-confirm 9/9, contactbreak 40/40. `test-contactfinish-20261031.js` reads 35 passed, 4 failed — verified PRE-EXISTING: the identical 4 failures with identical numbers occur on pure HEAD (baseline run, engine restored: E2 weak-melee 36-HP die 1, E4 bow-no-arrows att 0, E6 wave-1 att 0, E7 volley-softened att 0). Not caused by this change; not chased mid-run; appended to sim-findings.md. `node scripts/check.js --quick` was started twice and starved both times (box load 17–21, sibling loops running their own check.js; ~7 min with no output) — not a pass, not a failure; the targeted suites above are the regression evidence for this change.

## Before / after on identical seeds (pilot, 99661–99668, competent, 150d)

Analyzer: `scripts/finishersize-analyze-20261106.js --compare` (one analyzer bug found and fixed during this run: the `--compare` baseline side counted the armed files too — 16 seeds, scholar deaths 132 — caught by the wall numbers doubling; the armed side was always correct).

| Primary (FS funnel) | Baseline | Armed | Delta |
|---|---|---|---|
| Below-break meetings (wave-4 field, entry < 15%) | 2 | 2 | 0 |
| Below-break kills | 2 | 2 | **0** (GO needed ≥ +2) |
| Committable meetings | 2 | 2 | 0 |
| FS commits fired | 0 (no rule) | 1 | +1 |
| FS commit kills | 0 | 1 | +1 |
| FS commits lapsed | 0 | 0 | 0 |
| Twoblow takeovers of FS commits | 0 | 0 | 0 |
| Above-tail meetings / above-tail commits | 0 / 0 | 0 / 0 | 0 (negative control holds) |
| No-commit reasons (armed) | — | none recorded | — |

Per-seed armed leg (driver lines): 99661 d93 lost (w4field 8, w4kills 1); 99662 d150 survived (10, 2); 99663 d83 lost (2, 2); 99664 d150 survived, maxWave 5, standing 295 (16, 6); 99665 d42 lost (0, 0); 99666 d150 survived (18, 1); 99667 d150 survived (15, 3); 99668 d150 survived (5, 1). Days, standing, maxWave, wave-4 kills and scholar deaths are IDENTICAL to the baseline leg on every seed — the engine change draws no RNG and writes no sim state, so the armed leg is a neutrality demonstration: the only difference in the whole corpus is the one added narration line on 99667 d109.

Guards (all hold exactly):

| Guard | Baseline | Armed |
|---|---|---|
| Field-fighter deaths (wave-4+ field vDie) | 6 | 6 |
| Scholar deaths | 66 | 66 |
| Wave-4 kills, all channels | 16 | 16 |

Wall numbers (identical both legs): median survival 150d (range 42–150), won 0/8, national 0/8 (all village rank), wave-4 unlock 8/8, wave-5 unlock 1/8, wave-4 kills 16, wave-5 kills 1, scholar deaths 66, instrument errors 0. No win movement either way; nothing to investigate.

## Verdict, honestly

**Count GO: MISSED.** The prereg said pilot GO needs armed − baseline ≥ +2 below-break kills. Actual delta is 0.

**Why that miss is a broken metric, not a dead lever (§14a — METRIC-BROKEN).** The bar counted ALL below-break kills, including the ones the old code already makes. On this band the baseline had exactly 2 below-break meetings and BOTH already converted under the old code (99664 d104: contact strike kills outright; 99667 d109: ordinary winning morale kills in round 1). The addressable pool — meetings the old code cannot finish — was **0**. A perfect lever could add at most 0 kills here; the +2 bar was mathematically impossible on this band no matter what was built. The prereg's scarcity rule was written for exactly this situation but its literal trigger was "baseline < 2 meetings" — baseline had exactly 2, so the rule does not trigger as written. The pool is what matters, and the pool is 0 either way.

**DIAG-GO conditions (prereg scarcity rule (a)–(d)), all hold:**
- (a) Proof test pins the mechanism: 89/89 — 41-HP kill, 125-HP no-commit, Eulogy dismissal intact, wave-2 / low-HP negatives, takeover + cap invariant.
- (b) Every committable meeting in the armed leg converts to a field kill: 2/2 (one by contact strike, one by the new commit).
- (c) Negative control holds: zero commits on above-tail below-break meetings (0 above-tail meetings this band; the 60-fight engine negative proves the gate, not the corpus).
- (d) Guards hold: deaths, kills and wall numbers identical (see above).

**Verdict: DIAG-GO.** The lever works exactly as designed, is provably safe (zero guard movement, zero wall movement), and fired correctly the one time the field gave it a meeting to work on. The field effect is unmeasurable on this band because below-break meetings are too rare (2 in 74 wave-4 field fights) and already convert. This is a diagnostic go, not a claim that the lever moves the winnability chain — it moves nothing until a beast is met below the line and survives the first strike, and that shape barely exists in the wild.

**No confirm leg.** The prereg runs the 16-seed confirm only on pilot GO. It is not run, and would be pointless under the same metric: doubling the band doubles the zeros, because the metric — not the sample — is what cannot see the lever.

**Corrected metric for the next run (metric review, §14a).** Judge on ADDRESSABLE-WINDOW meetings: a below-break meeting counts only when the old code cannot finish it — post-contact HP strictly greater than the contact strike AND the fighter's intent is engage AND the fighter is above the 60% gate (i.e. the FS commit is the only mechanism that can convert it). The bar should be a conversion rate on that window (committed kills / addressable meetings), not a raw kill delta against a baseline that already converts its meetings. A wider band or a longer horizon is also needed to find addressable meetings at all: this band produced 0 in 8 seeds × 150 days. An alternative instrument: seed the corpus with wall-delivered beasts (the palisade is what actually brings beasts into the window — 24/24 inter-fight gaps in grind-a) rather than waiting for the wild to produce them.

## Reachability / village assessment

- The content is reachable: the commit fired in live sims (1/1 meeting that needed it) and in 30/30 + 27/30 engine fixtures. The sizing holds exactly as targeted: 41 HP dies in the meeting, 125 HP never commits.
- Villagers act like people: the commit is gated on intent (learners never commit), on health (a hurt fighter never commits), and on the beast being small enough to actually die — the three conditions of Steve's wound-mill ruling (finish a crippled beast you meet *if you can*). The narration line reads as a decision, not a system message. The Eulogy dismissal survives untouched, so the trick-knowing villager still talks the beast down instead of killing it — the two ways of meeting a broken beast stay distinct.
- The binding link in the winnability chain is unchanged by this lever: wild wave-4 kills are still 16 on the band, all 16 through the same channels as baseline (wall + turn-based relay), and no village banked two living wave-4 killers or sat. The lever removes one specific failure mode (a fighter meeting a finishable beast and walking away) that the wild almost never produces.

## What was NOT touched (guardrails)

- No rounds-cap change (MAX_ROUNDS = 15, untouched; the 3-round commit cap is the lever's own hold limit, not a fight cap).
- No armor-ignoring hits (no armorReduction / pierce line changed).
- No Eulogy counter-dismissal change (10/10 dismissals in the proof test, beast survives every time).
- No gate / price / deed / readyDemand change; no win-price change.
- One analyzer fix, no game change: `finishersize-analyze-20261106.js --compare` baseline side (see above). One instrument-counting fix, no game change: FS commits counted by fsCommitMhp (set at commit time), not end-of-fight kind, because twoblow can take a live commit over mid-fight.

## Commits

- 75cb6518b — prereg + FS instrument/driver/analyzer (seed band 99661–99668 freshness-verified; safe-commit index clobber repaired after this commit)
- 254682f72 — [needs-eyes] lever in src/js/fieldFights.js (+126/−7) + proof test scripts/test-finishersize-20261106.js (65/65 at commit time; 89/89 with armed corpus). Safe-commit index clobber hit again (index reverted to stale blobs, test file dropped from index) — commit verified correct by hash, index repaired from HEAD.
- 719ef3fe7 — [needs-eyes] analyzer: count FS commits by fsCommitMhp. Same clobber, same repair.

## Corpus

- evidence/2026-11-06/perseed-finishersize-a/fs-s9966{1..8}-finishersize-baseline.json (8 files)
- evidence/2026-11-06/perseed-finishersize-a/fs-s9966{1..8}-finishersize-armed.json (8 files)
- Tooling: scripts/finishersize-instrument-20261106.js, scripts/finishersize-driver-20261106.js, scripts/finishersize-analyze-20261106.js, scripts/test-finishersize-20261106.js

## Convergence state

- Finding #1829 (finisher-size): lever built, proven, safe — field effect unmeasurable on this band (pool 0). Next step is a measurement redesign (addressable-window metric + wall-seeded corpus), not another lever tweak. Status: DIAG-GO, held for the next run's metric, not killed.
- Balance panel (§15): not run. The panel runs its own full panel and takes no corpus input (same as grind-a); the pre-registered primary comparison is the identical-seed FS corpus, whose wall numbers are byte-identical on all 8 seeds. A full panel re-run cannot change a verdict whose delta is 0.
- Blanks filled: the lever named in grind-a is now built and proven. Blank remaining: whether the field ever produces an addressable meeting at scale — needs the redesigned corpus above.

## Metric review (§14a, to carry to the next run)

- The count metric was wrong: it counted kills the old code already makes. Correct it to the addressable-window conversion rate (above) before any re-run.
- The scarcity rule's literal trigger (<2 baseline meetings) missed the real condition (addressable pool 0 with 2 meetings). Next prereg should trigger on pool size, not meeting count.
- The `--compare` analyzer bug (baseline side double-counted) is fixed and committed; the corrected compare output is the one quoted above.
