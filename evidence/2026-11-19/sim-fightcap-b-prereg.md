# sim-fightcap-b — FROZEN prereg (Loop B 0830Z run, arm sim-fightcap-b)

**Frozen:** 2026-11-19 09:32 UTC, BEFORE any judged sim. Base master
`eccc08af2` (journey-endgame r246) + ported ALLYSLOT3 slot (cherry-pick
of `7efbf26a8` from held branch `sim-allyslot3-b`, conflict resolved
comment-only in `src/js/party-wiring.js`, sequencer cleared with
`git cherry-pick --quit`; the staged changes were committed on this
branch via the worktree's own `scripts/safe-commit.sh`). Branch
`sim-fightcap-b`.
**Lever:** the 3rd-ally slot (ALLYSLOT3=1, env-gated, default OFF).
`villagerFightAllies` returns a 3rd launch companion only for a
launched quad, `fieldFights` gains a third ally body (own HP/gear/
strikes/wound settlement, third shout), the wild router carries 3.
Non-launched meetings stay capped at 2 allies everywhere. No other
lever is judged here.

## Substrate (rides along, NEVER re-judged)

- SENSEEXPED (sim-senseexped-b, finding #2583, ON MASTER at
  `97e78670d`): the expedition-sourced launch-party sense — the
  fighter's current expedition companions answer first, in
  expedition-start order; membership from `agencyState().exped`,
  NOT the mutable `winPlan[vid].party`. Verified present in this
  worktree (`git merge-base --is-ancestor 97e78670d HEAD`). The old
  HELD LAUNCHPARTY sense fix is NOT re-applied: `LAUNCHPARTY`
  appears nowhere in current `src/js/party-wiring.js` or
  `src/js/villager-brain.js` (the flag is dead). The slot's sense
  code reads the same `launch` list the SENSEEXPED sense builds, so
  the port meshes with no duplication.
- PARTYSIZE4 (sim-partysize4-b): wave-4+ launches go out as quads;
  partyQuads counter on both launch paths. ON master, env-gated
  `PARTYSIZE4=1`, default OFF.
- Shared flags on BOTH legs: SENSEEXPED=1, PARTYSIZE4=1,
  VETREENGAGE=1, FLEEREPAIR2=1, **FIGHTALLY2=1**. The fifth flag is
  a deliberate, documented substrate addition, not a re-judgement:
  the 3rd ally can only join after the 2nd (the hopeless-shout
  chain is ally1 → ally2 → ally3), so without FIGHTALLY2 the slot
  could never fire and the pilot would measure nothing. Both legs
  carry it, so the ONLY difference between legs is ALLYSLOT3.
- The sibling arm sim-freestrike-b touches `fieldFights.js` in a
  different section (turn-verb ordering) and lands first; this
  branch will be rebased onto its merge by the coordinator. This
  arm's fieldFights changes are the ally3 slot only.

## Join decision — finding #2564 (decided, NOT re-litigated)

The LOOSE join from sim-allyslot3-rerun-b (analyzer fix `6f3139b18`
+ commit `8715eb5b3`): the target==mid rule is DROPPED. Keep the
21-day window + launch-party membership; count off-target meetings.
The d133 Reunion row is the regression test: under the loose join
it counts as 1/1 fielded (`scripts/test-fightcap-b.js` §A +
`scripts/analyze-fightcap-b.js --selftest`, 28/28). Do NOT re-score
the old pilot with the strict join.

## Join refinement — finding #2570 (inherited, already on master)

The analyzer on this tip already joins fighter-anchored best-match
(`scripts/analyze-allyslot3-b.js` as fixed by sim-sensecotravel-b:
fighter must belong to the joined launch; most sensed allies wins;
most recent on ties). `scripts/analyze-fightcap-b.js` inherits it
unchanged. The d117 editor row is the test case: under the revised
join it counts as fielded (selftest). The rerun's first-match
sensitivity (4/6 = 0.67) is reproduced exactly by this analyzer on
the frozen rerun corpora (see §B of `test-fightcap-b.js`).

## Band choice + measured pool (finding #2566 — floor from measured rate)

**Seed-band freshness:** band 104770–104777 checked fresh — no
`evidence/**/*.md` names any 10477x seed, no filename contains
10477, no commit message or branch names 10477, and no exact seed
104770–104777 appears in any prereg. Collisions recorded so the
next worker does not repeat them: 104730–104737 taken by
sim-partysize4-confirm-b (band 104730–104745); 104750–104757 taken
by sim-sense-guard-diag-a (survey band); 104760–104767 taken by
sim-senseexped-b; 10480x named in journey-deepening-r238 prereg +
evidence. (Adjacent band 104720–104727 was the allyslot3 rerun
band; it does not overlap.)

**Survey (control-only quick pass, NOT a judged sweep):** the driver
ran MODE=ctl on 104770–104777, 150d, competent, substrate flags,
before this prereg was frozen. Corpus:
`evidence/2026-11-19/perseed-fightcap-b-survey-ctl/` (8 files, 0
instrument errors; DRIVER_EXIT=0, ~7 min). Measured pool:

| | Survey (ctl, 8 seeds) |
| --- | --- |
| Launches (wave-4+; analyzer `launches`) | 15 |
| Trio launches / quad launches | 13 / 10 (partyQuads 10/10) |
| Joined quad meetings (corrected loose join) | 9 |
| Field-4 denominator (ally2-joined) | 6 |
| Quad kills / talk-downs | 0 / 0 |
| Median survival | 142.5d |
| Wall: wins / national / wave 5 / wave 4 / standing ≥200 / survived | 0 / 0 / 3 / 8 / 3 / 3 |
| Community loss (share) | 5/8 = 0.625 |
| Starvation (total / villager) | 3 / 2 |

Per-seed launches: 104770 0, 104771 10 (6 quads), 104772 1, 104773 1,
104774 1 (0 quads), 104775 1, 104776 1, 104777 0. Launches
concentrate on one seed (104771 holds 10/15); 2 seeds launch
nothing. The control sense rate reads 0/9 by construction (the
sense caps at 2 without the slot — `senseIsFull` needs 3 sensed);
the arm leg is where the sense is measured.

**Pool floor (set FROM this measured rate, not above it):** ≥6
launches/leg (measured 15 — floor is 40% of measured) and ≥4
joined quad meetings on the arm leg (measured 9 — floor below
measured with 5 of slack for delivery variance). The old pilot's
floor failed because it was set at ≥6 on a band measured at 4;
this band measures 3.75× richer on launches and delivers a
denominator at all. The rerun band measured 10 arm meetings
under the corrected join (9 by this analyzer's count on the frozen
rerun corpora) — this band's 9 ctl meetings are the same order.

## Primary metrics (BINDING, §14)

**1. 4th-member damage share (finding #2567).** Pooled share =
sum(ally3Dealt) / sum(mDealt) across fielded quad fights on the arm
leg (a fight where the third ally joined AND is a launch-party
member, under the corrected loose join). The pooled share — not
the mean of per-fight shares — so a 20-damage fight cannot weigh
the same as a 1300-damage fight. **GO bar: share ≥ 0.10.**
Justification: the only prior measurement is the rerun's 0.125
(81/647 over the two damage-dealing fielded fights, n=2); the
pooled share over all four fielded fights on the same corpora is
0.081 (98/1206 — this analyzer reproduces it, `test-fightcap-b.js`
§B). The 0.10 bar sits between the two readings: above the pooled
point estimate, below the damage-dealing-only estimate. It says
"the 4th member deals at least a tenth of the party's damage" —
a real contribution, not a rounding error. mDealt is the
recorder's fight-record total, never parsed log lines (the
encounter log caps at ~20 lines, fightcap-a §11).

**2. Kill share on joined quad meetings.** vKill / joined quad
meetings (corrected loose join, fought expedition encounters) on
the arm leg. **GO bar: kill share ≥ 0.20.** Justification: judged
against the fightcap-a combined baseline — 0.059 (2 kills / 34
pair-inclusive meetings) — the bar is ~3.4× that baseline, and
against the quad-specific record, which is 0 kills everywhere so
far (fightcap-a trio+ 0/3, fightcap-dmg-a trio+ 0/1, allyslot3
rerun 0/9 arm meetings by this analyzer). 0.20 on a pool of ~9–10
meetings means 2 kills: a single lucky kill cannot pass it, and
two kills is a real change from zero. Talk-downs (mFlee) are
counted separately and are NEVER kills: a 1-round Peacemaker
stand-down must not pass as a fight kill.

**GO requires BOTH primaries + all cost bars + the pool floor.**
If the damage share passes but kills stay at 0, the verdict is
NO-GO: the cap lifts but quads still do not kill — that IS the
#2559 answer (the cap is not the binding link), and it is a
finding, not a failure to measure. The field-4 rate is REPORTED
(not binding): the slot fielding is the mechanism check, and the
sense is now 0.892 (senseexped-b GO) against the rerun's 0.50, so
a field-4 rate below 0.50 would mean the sense starved the slot
and belongs in the metric review, not a re-score.

**Pool floor (binding precondition):** ≥6 launches/leg AND ≥4
joined quad meetings on the arm leg. If the arm leg has fewer
than 4 meetings, the pilot is NO-GO, kind METRIC-BROKEN (the band
delivered too thin a pool to judge the share); if it has 0, kind
NO-QUAD-POOL. If launches fall below 6 on either leg, kind
METRIC-BROKEN. The rerun's failed 0.80 field-4 bar is NOT copied
here: the rerun pilot failed it at 0.43, and this arm judges
damage + kills, not the fielding rate.

**Damage/round ladder (REPORTED, judged against fightcap-a):**
typical party ~40–60/round, winning shape ~111/round, canon
godhood ~220/round. The analyzer reports the ladder by outcome
on joined quad meetings, arm vs ctl. No binding threshold: the
ladder explains the kill share, it does not replace it.

## Secondary (REPORTED, not binding)

- Field-4 rate (ally2-joined denominator) + sense rate, arm vs ctl.
- Raw field-4 rate over ALL joined quad meetings.
- Size-4 damage share (mDealt / mHpStart on joined quad meetings,
  arm vs ctl, corrected join).
- Per-seed launch/quad/meeting table.
- Sense-miss classification (finding #2571 classes) on the arm leg.

## Cost bars (BINDING guardrails, §14 — a GO with a breached guardrail is NO-GO)

- Community loss: arm share ≤ ctl share + 0.125 (share of seeds
  ending village-lost / village-dead / pop-zero).
- Starvation: arm total ≤ ctl total + 2 (and villager likewise).
- Median survival: arm ≥ 0.8 × ctl.
- Instrument: 0 errors on both legs; 8/8 per-seed files per leg;
  frozen seeds 104770–104777 on both legs; driver determinism
  (proof test `test-fightcap-b.js` §C: one 30d control seed in a
  subprocess, exit 0, flags self-describing, 0 errors).

## Design

- Horizon: 150d, death-aware (never fixed 200d). Reachability lever
  (waves 4–5, national, table, wins) — 150d is the §10 guide for
  the wave-4/5 window, and the measured band's median survival
  sits at 142.5d (survey).
- Seeds: 104770, 104771, 104772, 104773, 104774, 104775, 104776,
  104777 (8, pilot gate). Policies: competent verbatim only — the
  pilot's question is a mechanism question (does the 4th member's
  damage turn quads into killers), not a playstyle question; the
  balanced panel runs the same policy on both legs.
- Legs: ctl = substrate flags, ALLYSLOT3 unset; arm = substrate
  flags + ALLYSLOT3=1. Same branch code both legs.
- Panel: `scripts/balance-panel.js` compare (instrument, not judge)
  via `scripts/build-fightcap-b-panels.js`.
- Proof: `scripts/test-allyslot3-b.js` 18/18 (slot proof, adapted
  to SENSEEXPED), `scripts/test-fightcap-b.js` 13/13 (measurement
  proof: d133 regression + rerun-corpus reproduction + driver
  smoke), `scripts/analyze-fightcap-b.js --selftest` 28/28.

## Fixture (encounter-gear rule, Steve 2026-11-13)

The staged proof fixtures stage a geared wave-4 hunting party as
the launch leaves them (holder + 3 launch companions, armed, on
one shared target) — the average gear/party a player has when
they reach wave-4 content — never a fresh un-geared solo scholar.
The pilot's driver stages the geared fight through the competent
policy.

## Metric review

- The primary denominator (joined quad meetings, corrected loose
  join) is pre-registered here, before any numbers are seen, with
  the reason stated (off-target meetings count; the fighter must
  belong — a trio-expedition fight joined via a shared ally never
  enters). The raw field-4 rate and the per-fight fourth-share
  rows are reported alongside so a later reader can see the
  exclusions' size.
- The damage-share bar (0.10) is set between the rerun's two
  readings (0.125 damage-dealing-only, 0.081 pooled over all
  fielded fights) — the pooled definition is the judged one, and
  the choice is frozen here, not adjusted after the pilot.
- The kill-share bar (0.20) is set against the fightcap-a
  combined baseline (0.059) and the quad-specific zero record —
  it requires 2 kills on a typical pool, so one lucky kill cannot
  pass it. If the pool delivers fewer than ~9 meetings, 0.20
  means 1 kill in 5 — the prereg notes this edge: the verdict
  still stands as written (the bar is a share, not a count), and
  the evidence will name the meeting count beside the share.
- The survey is a pool measurement, not a judged sweep: it ran
  control-only, before freezing, and its numbers set the floor.
  No metric was re-scored: this file is frozen before the lever
  legs run and before any judged sim.
