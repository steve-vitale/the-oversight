# sim-w4abstain-a — villager-only wave-4 kill conversion under player abstention

Run: fleshout-20261027T2147Z, axis scale-onramp. Worker arm: `sim-w4abstain-a`.
Prereg: `evidence/2026-10-27/sim-w4abstain-a-prereg.md` (written before any judged sweep).
Corpus: `evidence/2026-10-27/perseed-w4abstain-a/` — 8 rows (`s75101.json`–`s75108.json`),
`summary.json`, `analysis.json`, `detgate.json`, `sense-75101.txt`, `sense-75101-w4window.txt`.
Instruments: `scripts/policies/w4abstain.js`, `scripts/test-w4abstain-a-policy.js`,
`scripts/test-w4abstain-a-sweep.js`, `scripts/test-w4abstain-a.js` (validator/analyzer),
`scripts/test-w4abstain-a-sense.js`. Zero `src/js` game changes, zero default flips.

## Verdict (plain words first)

**DIAG-GO — villager conversion zero on this band under abstention.**

The player never lifted a sword against a wave-4 monster on any of the 8 villages —
no player strikes in wave-4 fights, no player wave-4 kills — and the villagers,
left to face wave-4 monsters on their own, killed none. Across the whole band
villagers fought wave-4 monsters 7 times and killed 0 of them. Four of those
fights ended with the villager dead, three with the villager running. Twenty
wave-4 monsters arrived in the world; all 20 are accounted for (15 still
wandering at the end, 3 dissolved after a fled player fight, 2 wandered off).
The band produced 6 lesser-seat wins and 0 full-seat wins, and 0 wave-5 unlocks.

This is this band's verdict only. It does NOT by itself prove the scholar's sword
is what gates wave-4 kills — that conclusion needs the paired sibling arm
(`sim-w4channel-a`, same seeds, player fighting), and drawing it is the
coordinator's job at round-up, not this arm's.

## GO rule legs (judged only against the prereg)

- (a) 8/8 configs valid: TRUE. 8 rows, days > 0, every gate + deed + fate field
  present, recorder errors 0, strike counter installed on all rows.
- (b) Activation gate passes: TRUE. Player wave-4 strikes landed = 0 (strike
  calls in wave-4 fights = 0), player wave-4 kills = 0. See "activation gate"
  below for the cross-checks behind the zero.
- (c) ≥95% of wave-4 arrivals classified: TRUE. 20/20 = 100.0%. Untagged 0,
  vanished-unrecorded 0, unclassified removals 0, pending-in-fight at end 0.
- (d) Villager kill/fight counts with killer identities + SENSE read: TRUE.
  Kill count is 0, so there are no killer identities to list — that absence is
  the finding, stated, not hidden. SENSE read below.

Validator hard gates G1–G10: all PASS (validator exit 0). Verdict legs (a)–(d)
all true, so the verdict is DIAG-GO, not DIAG-NO-GO.

## Activation gate (the binding check, before any judging)

The abstention held on every channel the policy layer can express:

- Player strikes in wave-4 turn-based fights: 0 landed, 0 called. Band-wide the
  player struck 285 times in total — all in wave 1–3 fights.
- Player wave-4 kills (`waveKillLog` w == 4, `by` == scholar): 0.
- Wave-4 turn-based fights fled whole: 6 (3 on seed 75101, 3 on seed 75104).
  19 abstention turns: 6 flee steps toward the edge, 13 barrier pushes,
  10 held turns where the push was refused and the player waited the turn out.
  No player strike and no player ability was ever used in a wave-4 fight.
- Feast draws: 0 drive-offs, 0 pending encounters seen by the pending hook.
  This confirms the prereg's timing finding in the wild: feast draws are faced
  inside the upkeep step before any policy hook runs, so the pending hook never
  sees a wave-4 draw still pending — all abstention went through the fight hook.
- Unknown-wave turns: 7 (seed 75102: 1, seed 75104: 1, seed 75108: 5). On these
  turns the policy could not resolve some fighter's wave and — by the
  never-treat-unknown-as-wave-4 rule — delegated to the substrate instead of
  fleeing. They are counted separately, never folded into the abstention count.
- Orphan strikes (strike records with no resolvable fight ID or waves): 47
  band-wide. Cross-check: none falls on a wave-4 fight day. Seed 75101's 10
  orphans fall on days 30–142, disjoint from its wave-4 fights (days 126, 129,
  131); seed 75104, the other wave-4-fight seed, has zero orphans; the other six
  seeds have no wave-4 turn-based fights at all. No orphan can be tied to a
  wave-4 fight by day or by fight ID. The residual caveat is stated, not hidden:
  orphan strikes carry no resolvable monster wave, so the gate rests on the two
  primary joins (strike waves, kill log) plus this day-level cross-check.
- Det-gate (pre-sweep STOP gate): PASS. Seed 75101 run twice, recorders +
  strike counter ON vs OFF — headlines identical (days 152, won 1, wave 4,
  national ever/final 1/1, table 1, entered 1, wave-4 kills 0, courtship 26).
  Kept as `detgate.json` only; det-gate runs are not judged rows.

## Wall numbers (band of 8, 180-day death-aware horizon)

- Won: 6/8 — all 6 lesser seat, 0 full seat.
- Median survival: 152 days by the validator's upper-median convention
  (sorted days 34, 90, 96, 145, 152, 168, 169, 180; conventional median 148.5).
- National standing: ever 7/8, final 6/8. Table: invited 6/8, entered 6/8.
- Wave reached: wave 4 on 3 seeds (75101, 75103, 75104), wave 3 on 4, wave 1 on 1.
  Wave-5 unlocks: 0/8.
- Starvation deaths: 1 (seed 75105, the day-34 village loss).
- Death-cause shares (223 deaths band-wide): villager combat 90 (40.4%),
  villager-vs-villager combat 65 (29.1%), expedition 18 (8.1%), player arena 16
  (7.2%), ambush 7 (3.1%), monster 6 (2.7%), wound that wouldn't close 4 (1.8%),
  player contest 3 (1.3%), sickness 3 (1.3%), Choir Toad 2 (0.9%), thirst 2
  (0.9%), and 1 each (0.4%) for The Landlord, dehydration, war-drum toad,
  The Ugly Beast, player sickness, starvation, tick. Combat in all its forms
  is 173/223 (77.6%) of all deaths; no death cause is wave-4-specific in the
  ledger's language (villager monster deaths, 6, are not wave-split).

## Per-seed gate table

| seed | days | end | wave | nat ever/final | table/entered | seat | won | gated | rd5 (arm/armd/trk/vet) | rd4 (arm/armd/trk/vet) | w4 faced | w4 kills | abstain fights |
|------|------|-----|------|----------------|---------------|------|-----|-------|------------------------|------------------------|----------|----------|----------------|
| 75101 | 152 | over-other | 4 | 1/1 | 1/1 | lesser | 1 | 199 | 3/7/24/0 | 4/7/24/0 | 3 | 0 | 3 |
| 75102 | 90 | over-other | 3 | 1/1 | 1/1 | lesser | 1 | 99 | 1/9/18/0 | 2/9/18/1 | 0 | 0 | 0 |
| 75103 | 168 | over-other | 4 | 1/1 | 1/1 | lesser | 1 | 167 | 5/8/19/0 | 5/8/19/1 | 0 | 0 | 0 |
| 75104 | 180 | survived | 4 | 1/0 | 0/0 | — | 0 | 120 | 3/5/22/0 | 3/5/22/1 | 3 | 0 | 3 |
| 75105 | 34 | village-lost | 1 | 0/0 | 0/0 | — | 0 | 0 | 3/8/6/0 | 4/8/6/0 | 0 | 0 | 0 |
| 75106 | 96 | over-other | 3 | 1/1 | 1/1 | lesser | 1 | 99 | 2/8/21/0 | 5/8/21/0 | 0 | 0 | 0 |
| 75107 | 145 | over-other | 3 | 1/1 | 1/1 | lesser | 1 | 99 | 4/10/22/0 | 5/10/22/0 | 0 | 0 | 0 |
| 75108 | 169 | over-other | 3 | 1/1 | 1/1 | lesser | 1 | 99 | 6/8/24/0 | 6/8/24/0 | 0 | 0 | 0 |

Demand (live code, all seeds): wave-5 needs 4 armored @ P≥15 / 6 armed / 3 tricks /
2 living wave-4+ killers; wave-4 needs 3 armored @ P≥10 / 5 armed / 3 tricks /
1 living wave-3+ killer. No seed met the wave-5 bar; the binding miss everywhere
is the veterans bar (0 living wave-4+ killers at end on all 8 seeds).

Notes: seed 75103 reached wave 4 (unlocked) but faced 0 wave-4 monster types —
unlocking a wave is not the same as meeting its monsters. Seed 75105 died on
day 34 before any courtship activity (combined 0); the substrate gate still
passes at 7/8 active seeds (see below). Seed 75104 is the only non-win: it
survived the full 180 days at wave 4 without ever entering the table.

## Wave-4 kills by channel (the verdict's numbers)

- Villager kills: 0. Killer identities: none. Living-at-end: none.
- Player kills: 0. Not-counted kills (`by == null`): 0.
- Villager wave-4 fights: 7, all on seed 75104, all field context, all against
  the Suburb except one against the Eater:
  - day 115, ethan_hunt vs Suburb: fled (dealt 38, took 73), then died the same
    day in a second resolve row (dealt 13, took 42).
  - day 119, app_mgpspiti360 vs Suburb: fled (dealt 22, took 66).
  - day 121, app_mgpspiti360 vs Suburb: died (dealt 0, took 88).
  - day 137, somchai_prasert vs Suburb: fled (dealt 0, took 73), then died
    (dealt 0, took 77).
  - day 180, visjoin_175 vs Eater: died (dealt 29, took 106).
  - Outcomes: 3 fled, 4 died. Conversion: **0 kills / 7 villager fights = 0%**;
    0 kills / 20 arrivals; 0 kills / 8 seeds; 0 kills / 2 seeds that faced wave 4.
- The same band's villagers did fight and die against wave-4 monsters — the
  zero is not "villagers never met them." It is "villagers met them, fought
  them, and killed none of them."

## Wave-4 arrivals (20, 100% classified, funnel classes)

| seed | monster | birth day | source | outcome |
|------|---------|-----------|--------|---------|
| 75101 | eulogy | 119 | tile-entry | melted (after fled player fight) |
| 75101 | eulogy | 126 | tile-entry | still-present |
| 75101 | influencer | 127 | tile-entry | still-present |
| 75101 | reunion | 128 | tile-entry | melted (after fled player fight) |
| 75101 | herald | 131 | scripted-titan | still-present |
| 75101 | influencer | 131 | tile-entry | departed (lost trail) |
| 75101 | reunion | 138 | tile-entry | still-present |
| 75101 | reunion | 144 | tile-entry | still-present |
| 75103 | herald | 119 | scripted-titan | still-present |
| 75104 | suburb | 95 | tile-entry | still-present (fought 4x) |
| 75104 | herald | 105 | scripted-titan | still-present |
| 75104 | eater | 105 | tile-entry | still-present (fought 1x) |
| 75104 | suburb | 115 | tile-entry | melted (after fled player fight) |
| 75104 | suburb | 131 | tile-entry | departed (lost trail) |
| 75104 | algorithm | 138 | tile-entry | still-present |
| 75104 | influencer | 140 | tile-entry | still-present |
| 75104 | reunion | 144 | tile-entry | still-present |
| 75104 | reunion | 156 | tile-entry | still-present |
| 75104 | eulogy | 171 | tile-entry | still-present |
| 75104 | suburb | 180 | tile-entry | still-present |

Totals: still-present 15, melted 3, departed 2, killed 0. "Melted" here means the
monster dissolved after a turn-based fight the player fled (zero strikes) — the
funnel vocabulary tags it by the fight channel, not by a kill; no kill was
scored for any melt. The three melts are the only arrivals that left the world
through a player-channel fight, and none of them died by the player's hand.

Raid drafts are not births and are not counted here; a fled-recovery re-entry
would count as a new arrival, but none occurred on this band.

## Wave-4 turn-based fights by door (6, all fled, 0 strikes)

| seed | day | monster | door | origin | end result | strikes |
|------|-----|---------|------|--------|-----------|---------|
| 75101 | 126 | suburb | feast-draw | world-origin-mismatch | fled | 0 |
| 75101 | 129 | reunion | world-bump | world-origin | lost | 0 |
| 75101 | 131 | eulogy | world-bump | world-origin | routed | 0 |
| 75104 | 108 | algorithm | contest-arena | world-origin-mismatch | lost | 0 |
| 75104 | 140 | suburb | world-bump | world-origin | fled | 0 |
| 75104 | 143 | suburb | world-bump | world-origin | fled | 0 |

Doors: feast-draw 1, world-bump 4, contest-arena 1. "Lost" and "routed" are the
engine's end results for fights the player left without striking; "fled" is a
clean barrier exit. Every one of the six is an abstention held, not a gate
failure — fights started-but-fled with zero strikes are abstention held by
the prereg's own definition.

Abstain counters (band totals): turns 19, fights 6, flee steps 6, barrier
pushes 13, held turns 10, unknown-wave turns 7, drive-offs 0, pending-seen 0.
Seed 75104's three fights account for 10 of the 13 barrier pushes and 8 of the
10 held turns — its arena fight and its suburb fights repeatedly refused the
barrier before the player got out or waited the fight out.

## Readiness peaks vs ends (veterans bar — the binding miss)

| seed | rd4 peak | rd4 end | rd5 peak | rd5 end |
|------|----------|---------|----------|---------|
| 75101 | 1 | 0 | 0 | 0 |
| 75102 | 1 | 1 | 0 | 0 |
| 75103 | 1 | 1 | 0 | 0 |
| 75104 | 2 | 1 | 0 | 0 |
| 75105 | 0 | 0 | 0 | 0 |
| 75106 | 0 | 0 | 0 | 0 |
| 75107 | 0 | 0 | 0 | 0 |
| 75108 | 0 | 0 | 0 | 0 |

The wave-4 veterans bar (living wave-3+ killers) peaked at 2 only on 75104 and
ended at 1 there; the wave-5 veterans bar (living wave-4+ killers) never rose
above 0 on any seed at any point. The wave-5 door did not just stay shut at
the end — it was never open, because no village ever held a living wave-4
killer at all.

## Substrate gate

Combined courtship activity (courtCounters + courtAccords + courtNational +
courtGlobal + tended + defenseCalls + proposedLead, summed over the band):
102, across 7/8 seeds with non-zero activity (only seed 75105, dead day 34,
at 0). Gate requires > 0 combined AND ≥6/8 active seeds: PASS. The sweep ran
on the intended substrate, not a dead one.

## SENSE read (seed 75101, plain words)

Seed rule: lowest seed with a villager wave-4 kill; there is none, so the
fallback rule applies — highest gated standing at end (75101, gated 199).
Two non-measured replays were read; replay text never enters any count, and
replay trajectories can shift from the judged run, so beats below are the
village's story in words, not day-exact claims about the judged run.

What the village did about the wave-4 monsters it met: it named them, argued
about them, watched them circle the cookfire, and never killed one. The
Suburb comes drawn by the feast's smell — "circling the edge of the light" —
and the villagers argue over what to call it; Morena calls it "Big Loud" and
the name is up for grabs. When the player meets it, the barrier refuses twice
— "You hurl yourself at the barrier — no escape that way. The fight
continues here" — and the player waits it out instead of striking. The
Influencer stops at the treeline, "pacing, unwilling. The walls end the
argument. It's still out there." The Herald raids allied villages at night
while the coalition talks, and the coalition notices (trust −5). Night after
night the same refrain: "Big Loud and The Glow Stag... own the dark."

Do the villagers act like people here? Yes, in the narrow sense that matters
for this arm: they treat the monsters as named neighbors with habits — drawn
by feasts, circling light, pacing at treelines — not as faceless numbers, and
the village keeps living its life (sowing burdock, tending beds, receiving
envoys as the Indispensable) while the monsters stay out there. But nobody
finishes anything: the monsters melt, wander off, or stay, and the village's
answer to a wave-4 monster is always the same — endure it, name it, and let
it stay. The ending read (days 150–152) closes the same way: the village sits
the lesser seat, the audit counts "3 wave-4 fought" and "faced Big Loud twice
and lived," and the fifth draft still waits on armor (3 of 4) and veterans
(0 of 2). The abstention reads as a lived choice — fleeing, being refused
the barrier, waiting — not as a silence.

## Comparison only (never re-scored)

- This band: 0 wave-4 kills / 8 villages, killer the scholar in 0 cases,
  villagers the killer in 0 cases.
- Prior vetsurvive band (seeds 74801–74808, same substrate family): exactly
  1 wave-4 kill, killer the scholar, alive at end. Villagers faced wave 4
  repeatedly there and killed nothing — the same zero this band reproduces
  with the scholar's sword removed.
- Census family to date (coordinator's round-2036 note): 7 wave-4 kills /
  24 villages, scholar the only recorded killer identity. This band adds
  0 kills to that family; it does not change the family's killer picture.
- The paired comparison (this band vs `sim-w4channel-a` on identical seeds)
  is the coordinator's at round-up. Nothing here claims it.

## Metric review (mandatory, §14)

No metric was re-scored mid-run. The verdict uses exactly the prereg's
definitions (FACED = deed count, ENGAGED = fight rows, KILLED = `waveKillLog`
w == 4 by channel) and the prereg's GO rule. Doubts recorded for the NEXT run,
not applied here:

1. **Sense window.** The sense script windows on the horizon's last 30 days
   (DAYS − 30), so a run ending early leaves the wave-4 thread outside the
   window — the first replay (DAYS=180) covered only days 150–152. A second,
   non-measured replay (DAYS=150, window days 120–150) was run to read the
   actual thread; both files are kept. Next run: window the replay on the
   seed's wave-4 window (e.g., first wave-4 arrival ± 30 days) instead of the
   horizon tail.
2. **Orphan strikes.** 47 strike records carry no resolvable fight ID or
   waves. The gate survives them (day-level cross-check, see above), but a
   strike counter that cannot name its fight is a measurement blind spot:
   next run should resolve the fight ID at strike time or drop the record
   into a named unknown-fight bucket instead of a null one.
3. **"Melted" naming.** The funnel vocabulary tags post-fled-fight
   dissolutions as `player-fight-melt`, which reads like a player kill. It
   is not — zero strikes, zero kill-log entries. Next run: rename the class
   or annotate it wherever it is reported, so a reader cannot mistake a
   melt for a kill.
4. **Median convention.** The validator reports the upper median (index
   floor(n/2)); the conventional median of this band's days is 148.5, not
   152. Both are stated above; the next validator should pick one
   convention and label it.
5. **Pending-hook contribution.** The pending hook contributed nothing on
   this band (0 drive-offs, 0 pending-seen) because feast draws are faced
   inside upkeep. That is a confirmed timing fact, not a broken hook — but
   it means the pending layer is currently untestable by this census design,
   and any future claim about drive-offs needs a design that can actually
   observe a pending wave-4 draw.

## Telemetry deviation check

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline ~/workspace/goals/
the-scattering-roguelite-survival-game/hidden_files/
telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/perseed-w4abstain-a/*.json' --metrics
national,table,wins,exiled` -> 3 LOUD lines (national 12->0, table
-62% 16->6, wins 16->0, n=11 files). Verdict: KNOWN ARTIFACT, no
investigation, baseline NOT rolled. Two independent reasons, both
documented (same as w5seq/w5twokey/vetsurvive): (a) the baseline's own
_regime note forbids this comparison (a ~100%-win winseat suite vs a
tableseat-nowait census substrate — wins are structurally lower
here); (b) the field-shape artifact repeats (per-seed rows carry
nationalEver/entered/won, not top-level national/table/wins paths;
summary.json, analysis.json, and detgate.json are the extra files).
The corpus's real wall numbers are nationalEver 7/8, table entered
6/8, wins 6/8. No exiled LOUD line. (Filled by adoption worker
2026-10-28T00:03Z; baseline roll is the coordinator's call, only
after this verdict is judged.)

## Infrastructure notes

- Sweep launches: the first background-flagged launch died with its session
  (0-byte log, no rows); a second launch was killed by a service restart; a
  third hit a dispatch timeout. The judged sweep that produced this corpus
  was launched detached via nohup (PID 2801) and completed with 8/8 rows +
  summary. No partial row was ever written by a failed launch, so no
  recovery or re-run of a partial seed was needed.
- Sweep + validator + sense all ran on the worktree branch `sim-w4abstain-a`,
  never the main tree. No `src/js` file was touched; no game default was
  flipped.
- Balance panel: attempted per MEASUREMENT §15 (45-second bounded run,
  `--out` to scratch, scratch deleted after). The tool produced no output in
  the window and has no corpus-ingest mode (0 hits for ingest/corpus in
  `scripts/balance-panel.js`; it builds panels from live roots, not from a
  census corpus). Standing exception recorded honestly, same as the
  vetsurvive corpus: no panel artifact is claimed or faked.
- Policy unit proof: 35/35 PASS (`node scripts/test-w4abstain-a-policy.js`).
  Validator: hard gates G1–G10 PASS, exit 0. Det-gate: PASS.
- Safe-commit index clobber (known class): checked after every commit in
  this run via `git show --stat HEAD` + `git status --short`, repaired via
  HEAD-blob cacheinfo where it appeared. No EPERM flap blocked this run's
  writes.

## Findings for backlog (not verdict items)

- Villagers fight wave-4 monsters in the field and lose: 7 fights, 4 deaths,
  0 kills, with damage dealt mostly 0–38 against 42–106 taken. If the
  tackle-all work ever asks why villagers cannot convert a meeting into a
  kill, this band's field-fight rows are the exhibit — but that question is
  outside this arm's verdict.
- Seed 75103 shows unlock ≠ meeting: wave 4 unlocked, 0 wave-4 types faced,
  1 scripted herald still present at end. Any future "wave-4 reached" count
  should say which of unlocked / faced / fought it means.
- The pending-hook timing finding is now confirmed in the wild (0 drive-offs
  across 8 villages): feast draws never sit pending at `driveContests` time.
  A future abstain-style policy that wants to decline draws needs a hook
  inside upkeep, not at the pending layer.
