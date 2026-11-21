# sim-leadside-a — LEADSIDE lead-weighted redirect: NO-GO PARTICIPATION

- **Verdict: NO-GO, kind PARTICIPATION** (frozen bars §5 of the prereg; judged on the frozen judge, never re-scored)
- **Arm:** sim-leadside-a · **Loop A run:** fleshout-20261121T0437Z (closed out by adoption worker, run fleshout-20261121T0615Z) · **Axis:** scale-onramp
- **Findings:** #2628 (lend pool empty) / #2599 (searcaster that can never fire) / #2635 (granted gun vanishes when its holder dies — STAYS OPEN, see §4)
- **Base master:** `b5514461c` · **Band:** 107141–107148 (verified fresh in the prereg) · **Anchor commit:** `a53ad393a` (LEADSIDE lever + instrument, proof 40/40 pre-revert)
- **Revert commit:** `d0619c33e` (LEADSIDE game code reverted; src/js hash-identical to master — see §9)
- **Evidence commit:** `92844e1c5` (rebased tip before the hash-update commit; see §10)
- **Prereg:** `evidence/2026-11-21/sim-leadside-a-prereg.md` (commit `5bf069833`)
- **Horizon:** 150d death-aware (dead villages stop; +10d tail max). **Seeds:** 8 ctl + 8 arm, identical seeds, balanced panel.
- **Substrate (both legs):** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`, LEND OFF. Legs differ ONLY by the redirect rule (ctl: LEADSIDE unset; arm: LEADSIDE=1).

## 1. What the lever was (frozen design, prereg §2)

LEADSIDE put the contest-prize gun in the hands of the villagers who already
lead wave-4+ fights, so an armed volley could finally fire. Two pieces, both
env-gated on `LEADSIDE=1`:

1. **Recorder** — in `Game.resolveWildMonsterEncounter`: a wave-4+ fight that
   resolves to a real fight outcome (`vKill`/`mFlee`/`vFlee`/`vDie`), non-raid,
   led by a roster villager other than the scholar, increments
   `state.wave4Leads[vid]` by 1. Zero `Math.random()` draws. Stored outside
   `notability` on purpose (notability feeds contest casting weights).
2. **Term** — in `G._gunRateFighter`: `score += Math.min(wave4Leads * 4, 12)`
   (+4 per wave-4+ launch led, capped +12), augmenting the expedition term.

NOT built: shape 2 (draft-armed-holder-as-lead, a launch rule — a bigger
design call, named as the next lever in §6).

## 2. Judged numbers — the frozen bars

| Bar | Metric (arm leg) | Floor | Arm | Ctl | Result |
|---|---|---|---|---|---|
| 1 | Searcaster-holder-days | ≥ 40 | 102 | 102 | PASS |
| 2 | **Armed leads** (wave-4+ entry, lead holds searcaster + ≥1 cell) | ≥ 2 | **0** | 0 | **FAIL — the discriminating bar** |
| 3 | Armed volleys fired (lead holds searcaster, shots > 0) | ≥ 1 | **0** | 0 | **FAIL** |
| 4 | Armed-holder entries (wave-4+ entry, searcaster + ≥1 cell, any participant) | ≥ 3 | 21 | 21 | PASS |
| 5 | Guardrail, separated: deaths per engaged meeting ≤ 1.10× ctl; median survival ≥ 0.80× ctl; villager starvation deaths ≤ ctl + 2 | all three | 5.97 vs 5.97; 150d vs 150d; 0 vs 0 | — | PASS |

Full judge output: `evidence/2026-11-21/leadside-a-analysis.json`
(`verdict NO-GO, kind PARTICIPATION`; per-leg diagnostics
`leadside-a-analysis-ctl.json` / `leadside-a-analysis-arm.json`).

The two legs are **identical on every participation number** — not just the
bars. Meetings 183, engaged 142, flees 97, deaths 848, deaths per engaged
meeting 5.97, armed entries 21, armed flees 11, armed meetings 21, lead
attribution (expedition-holder 58, aid 65, world-tick 60), flee causes
(hopeless-after-help 76, floor-hp 15, learn-withdrawal 1, wise-leave 5).
The redirect changed literally nothing observable in 8 paired villages.

## 3. Why it changed nothing — the near-miss breakdown (both legs identical)

- **Launches:** 111 wave-4+ launches. **Armed earshot:** 14 (a holder was
  within earshot). **Eligible earshot:** 0 — no launch ever had an armed
  holder who could be drafted as lead. **No living holder:** 95 of 111
  launches (85.6%) had no living gun-holder at all.
- **Pool presence:** 9,944 pool ticks; holder present 442 (4.4%), holder led
  0, pool draft misses 14, pool fights 233.
- **Lends:** 0 on both legs (LEND off, as designed; `v4lends` 0, `v4lendPool` 0).
- **Leadership exists — armed leadership does not.** Villagers do lead
  wave-4+ fights (183 lead-attributed meetings), and armed holders do enter
  them (21 armed entries) — but an armed holder never leads one, and 11 of
  those 21 armed entries end in a flee. The gun arrives at the fight as a
  passenger, never as the leader.
- **The prereg's falsifier fired exactly as written:** "if armed leads stay 0
  on the arm leg despite the term … the redirect is not the binding
  constraint — the binding constraint is that holders never REACH a fight
  as leads at all (sheltered / not on the tile / not drafted), and the next
  lever is shape 2 (draft-armed-holder-as-lead), not a stronger redirect
  weight." A stronger weight (+8/lead, uncapped) is NOT re-tried without a
  design call: if 0-lead recipients still win the pick, the weight is not
  the problem — and here the pick never even had a proven leader to choose.

## 4. Finding #2635 — gun-vanish sink census (STAYS OPEN)

The driver instruments every searcaster holder change with attribution
(grant-* → kill-loot → corpse-take → drop → holder-died → unexplained).
Census, **identical on both legs** (7 events each):

| Kind × attribution | Count |
|---|---|
| new-holder:unexplained | 3 |
| vanish:unexplained | 2 |
| holder-died:holder-died | 1 |
| new-holder:grant-contest-prize | 1 |
| **Total / unexplained** | **7 / 5 (71.4%)** |
| transfers | 0 |
| dropEvents | 0 |

Detail (ctl = arm): seed 107144 — new holder `gen_glnvgji` day 55
(unexplained), gun vanishes day 70 (unexplained); seed 107146 —
`xavier_dubois` day 60 (unexplained), holder dies day 67, new holder
`gen_cl8qjxk` day 115 (grant-contest-prize), gun vanishes day 117
(unexplained); seed 107147 — `gen_824pdhl` day 71 (unexplained).

The gun still vanishes with no recorded cause in 5 of 7 holder changes.
No fix was built in this arm (instrument only, per the prereg). #2635
stays OPEN: the next work on it needs a cause for the unexplained
vanishes (the drop recorder caught 0 drops, the holder-died attribution
caught only the death it could see), not another census.

## 5. What it means, in plain words

Giving the gun to the villagers who already lead the hard fights changed
nothing, because on this band no armed holder ever led a wave-4+ fight on
either leg — the redirect had nobody to redirect to. The gun shows up, the
cells survive, the holder walks into the fight — and someone else leads it,
or the holder runs away. The leadership wall is upstream of the gun, in who
leads at all: most launches have no living holder anywhere near them, and
the launches that do never have one who can be drafted as lead. Steering
the prize toward proven leaders cannot work until a proven leader is
holding the gun at the moment a fight is launched — that is a launch/draft
problem, not a prize-pick problem.

## 6. Next lever (named, not built here)

**Shape 2 from the brief: draft-armed-holder-as-lead** — a launch rule that
puts an armed holder in front of a wave-4+ fight (bigger design call, to be
weighed after shape 1 is measured; shape 1 is now measured NO-GO). Do not
re-try a stronger redirect weight first: the falsifier rules it out.

## 7. Reachability verdict + village assessment

**Reachability (this band, both legs identical):** wave 4 unlocked 8/8,
wave 5 unlocked 4/8 (seeds 107144, 107146, 107147, 107148). Regional scale
7/8, village scale 1/8 (seed 107148, standing 515 — high standing, still
village scale). **National 0/8, table 0/8, wins 0/8.** Wave-5 readiness met
on 2/8 (107146, 107147); wave-4 readiness met on 5/8. The content past
wave 4 is reachable; the scale wall past regional is not moved by this
lever — the ladder is untouched, as expected for a participation lever.

**Wall numbers:** national 0, table 0, wins 0, wave-4 unlocks 8/8, wave-5
unlocks 4/8, median survival 150d (5/8 survived to the 150d horizon;
3 villages lost: 107141 day 109, 107143 day 68, 107144 day 118).

**The village, in plain words:** eight villages, same story on both legs.
Five hold on to day 150 with standing between 125 and 535; three fall
apart before then — one early (day 68), two in the second half of the run.
Every village reaches wave 4; half reach wave 5. Nobody starves (0
starvation deaths on either leg). The villages that survive are armed and
armored (6–8 armed, 6–8 armored on the survivors) and know the monsters'
tricks (24–39 tricks) — but they are short of wave-5 veterans (0–3 living
wave-4 veterans where 2 are needed), and the gun that could turn a fight
never gets fired by the person leading it. The people are surviving; the
leaders are not the ones holding the best weapon.

**Balanced panel:** `evidence/2026-11-21/leadside-a-panel.md` (+
`leadside-a-panel.json`, `leadside-a-panel-before.json.gz`,
`leadside-a-panel-after.json.gz`) — decision `review_required`, 8 paired
cases, no material signal on any metric (deaths 106 vs 106, national 0 vs
0, table win rate 0 vs 0, community loss 0.375 vs 0.375). The panel is the
instrument; the frozen bars above are the judge.

**Sense-testing note:** no transcript/dialogue sample was taken in this
adoption closeout — the judged sweeps were run by the timed-out 0437Z run
and are not re-run here. Villager-behavior sampling is owed by the next
arm that touches launches/drafting (shape 2), where lead choice is the
thing being watched.

## 8. Metric review

- The frozen bars judged the mechanism end-to-end (grant → proven leader
  holds → armed lead → volley → entries) and the guardrail stayed
  separated. Bar 2 (armed leads ≥ 2) did its job as the discriminating
  bar: it failed 0 vs 0, and the near-miss breakdown says why.
- **Known gap, stated in the prereg §8(a): grants-by-lead-count was not
  computed.** The analyzer reports holder-days, entries, leads and
  volleys, but not how many grants landed on 0-lead vs 2+-lead recipients.
  It would not change this verdict — the falsifier fired on the
  discriminating bar with identical corpora — but the next arm (shape 2)
  should report grants-by-lead-count so a future redirect re-test can
  tell "grants missed the leaders" from "leaders never got the chance."
- **Scope limit, stated in prereg §8(b):** recorder and judge share the
  `resolveWildMonsterEncounter` choke point by design. Patrol-led wave-4+
  fights count for neither. No evidence in this corpus suggests patrol
  fights are numerous enough to matter here (lead attribution covers all
  183 meetings with 0 unclassified), but the scope limit stands.
- Bar 4 (entries ≥ 3) passed comfortably (21) while bar 2 failed — the
  shape the prereg anticipated: entries without leads. The bars
  distinguished the shapes correctly; no revision proposed. Bar 1
  (holder-days 102 vs floor 40) is a coverage floor, not proof the gun was
  used — it should never be read as one.
- **Convergence:** this axis (scale-onramp) is NOT converged by this run.
  The lever is killed at the judged stage (not at pilot — the pilot and
  the full 8-seed sweep both ran clean, errors 0, coverage complete on
  all 8 seeds per leg). The chain's next step is shape 2.

## 9. Infrastructure + adoption notes

- **Timeout adoption:** the 0437Z run timed out after the judged sweeps
  were complete on disk; this closeout verified (not re-ran) the corpora,
  analysis, panel, smoke + sweep logs (all legs errors 0, anchor
  `b12018cfc`), then wrote this evidence, finished the revert, and
  committed. No judged sweep was re-run.
- **Staged revert found as left:** the LEADSIDE revert was already staged
  in the worktree (`src/js/contests.js` −9 lines, `src/js/game.js` −18
  lines; worktree src files already equal to base). Verified before
  committing: `git diff b5514461c -- src/js/contests.js src/js/game.js`
  empty pre-commit; committed as `62c16da73` (rebased as `d0619c33e`);
  verified after: `git hash-object` of both files equals the base blobs
  (`contests.js 302d0d61…`, `game.js 97956402…`); final `git diff
  b5514461c -- src/js/` empty pre-rebase, and `git diff master -- src/js/`
  empty post-rebase (both files hash-identical to master `b20328ad9`).
  **0 src/js delta vs master.**
- **Proof test post-revert:** `node scripts/test-leadside-a.js` →
  **30/40, 10 fail BY DESIGN** (run twice, same 10 fails, deterministic).
  The 10 failing legs are exactly the LEADSIDE-specific ones — recorder
  counts (3: one lead counts 1, second fight counts 2, evade holds the
  count at 2), term weights (4: 2 leads beat 1 launch, 3 leads beat the
  expedition holder, 2-lead tie resolves by roster order, 1 lead beats a
  plain villager), term restored (1), redirect to the leader (2:
  searcaster lands on the 3-lead villager, +2 cells bundled). All
  substrate legs pass: gate hold/fire under LEADSIDE=1, draw-neutrality,
  term-off pick, dead-leader skip, scholar never picked, and the analyzer
  selftest 94/94. The test was NOT edited to hide the by-design failures
  (holdersupply precedent: 24/26, 2 fail by design).
- **Instrument tweaks committed with the evidence:** `scripts/analyze-
  leadside-a.js` +1 line (adds `sinkCensus` to the analyzer output — the
  `leadside-a-analysis.json` on disk already includes it, so this tweak
  produced the judged output) and `scripts/leadside-driver-a.js` comment
  correction (bundle-size wording → redirect-rule wording). Both small
  and safe. Instrument files `scripts/test-leadside-a.js`,
  `scripts/analyze-leadside-a.js`, `scripts/leadside-driver-a.js`,
  `scripts/build-leadside-panels-a.js` remain in the tree for the next arm.
- **Scratch deleted, not committed:** `scripts/leadside-mechanism-
  scratch.js` and `scripts/leadside-mechanism-scratch2.js` (untracked
  mechanism scratch from the 0437Z run) were removed from the worktree;
  they are not part of the judged work.
- **Smoke corpus:** `evidence/2026-11-21/perseed-leadside-a-smoke/`
  (seed 107141, both legs, errors 0, identical outcomes: village-lost
  day 109, maxWave 4, standing 150).
- **Write flap:** fresh-file write probe OK before the revert commit; no
  EPERM / lock-write failure struck during this closeout. (One
  infrastructure note: a `git log + git status` read in the main tree
  hung for 2+ minutes at ~06:50Z and was killed — `git log` itself had
  already printed; the slow step was the `git status` half. No work was
  lost; the main-tree tip `b20328ad9` was confirmed from the log output.)
- **Rebase:** rebased onto current master `b20328ad9` (ship bump,
  06:15Z), clean, no conflicts. Proof re-run post-rebase: 30/40, same
  10 by-design fails (see §9). Hash block in §10 updated after the
  rebase; tip before the hash-update commit: `92844e1c5`.
- **No push, no bump, no live verification.** Merged locally, pending
  ship — the ship loop owns deploys. Readiness reported to the
  coordinator; the coordinator merges.

## 10. Commits (this branch)

- `5bf069833` — prereg (band 107141–107148 verified fresh)
- `a53ad393a` — LEADSIDE lever (wave4Lead term + recorder) + instrument
  (driver/analyzer/panel builder, proof 40/40)
- `d0619c33e` — REVERT LEADSIDE game code (NO-GO; src/js hash-identical
  to master `b20328ad9`)
- `92844e1c5` — evidence + instrument + corpus + analysis + panel
- (hash-update commit — this file's §1/§9/§10, after the rebase; hash in
  the coordinator's closeout note)
