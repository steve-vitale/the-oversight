# sim-oneshotcap-a — wave-4 one-shot cap for field fights (axis scale-onramp)

Run: fleshout-20261025T0730Z. Arm sim-oneshotcap-a. ALTERNATIVE to
sim-fieldguard-a — at most one lands this run; the coordinator picks.

## PRE-REGISTRATION (binding — judged only against this)

- Axis: scale-onramp. Lever: FIELD-fight one-shot cap (wave-4+ only).
- Substrate (shared): tableseat-nowait — leanlinkrescue courtship
  (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1), no wait leg.
  Seeds 73671–73678, 180d death-aware horizon (dead villages stop, +10d
  tail max). The recorder (deathcensus-diag, DEATHCENSUS=1) runs on BOTH
  configs, so the only control/armed delta is the game-code cap.
- Control replication gate: the control re-run must match the published
  0644Z controls (national-ever 8/8, final 7/8, table entered 4/8, wins
  4/8 lesser seat only, wave-4 5/8, wave-5 0/8, kind-filtered villager
  deaths 27: field 12, other 12, raid 1, arena 1, tb 1; wins-excluded
  median 180d, all-runs median 150d). Mismatch = STOP, do not judge.
- THE CAP (exact numbers): in `Game.fieldFight`, when the monster's wave
  is >= 4 AND the fight is not a raid (opts.raid, now forwarded through
  `resolveWildMonsterEncounter`, which previously dropped it) AND not a
  sealed arena (opts.noFlee), the villager's total damage taken in any
  single round is capped at floor((maxHp - 1) / 2) — for the standard
  100 max HP, 49. A villager entering at >= 50% HP therefore cannot die
  in round 1 (50 - 49 >= 1). The cap is applied at the single villager
  damage-application point, AFTER armor, worn avoidance, and ability
  reductions, and it accumulates across pack members within the round
  (abRoundTaken). It does not touch raid fights, arena fights, tb
  fights, the break line, or entry rules. It does not gate who fights.
  Scope justification: wave-4+ only because the 0644Z one-shots are all
  wave-4 (eater 103, suburb 87, suburb 69); wave-1/2 are NOT softened by
  default, and the nearly-dead-entry deaths (6–11% HP) are a separate
  arm's mechanism, never bundled here.
- COUNTING (exact): PRIMARY = attributed combat-death detail rows
  (deathcensus analysis) with context 'field', rounds == 1, and
  vHpStartFrac >= 0.50. Deaths are KIND-FILTERED (kind person/villager,
  non-scholar); mixed harness death-tele totals are never used for cost
  bars. Baseline recount must be 3.
- GO requires ALL of:
  - PRIMARY: one-round field villager deaths at >=50% entry HP = 0
    (baseline 3).
  - Kind-filtered field villager deaths <= 9 (baseline 12, >=25% cut).
  - Cost: wins-excluded median >= 180d (all-runs median alongside),
    national-ever >= 6/8, wave-4-or-win >= 5/8, kind-filtered raid
    villager deaths <= 2 (baseline 1).
  - No stall side-effect (sense check, reported not thresholded unless
    egregious): field fights won/lost + villager monster kills.
  - Directed probe: scripted field meeting, >=50% HP villager vs wave-4
    monster dealing would-be one-shot damage, shows the cap firing and
    the villager surviving round 1. Probe failure = NO-GO even if band
    numbers move.
- If pilot GO: confirm on 12 fresh seeds 73679–73690, same policy /
  horizon, pro-rata legs: one-round >=50% deaths = 0, field deaths
  <= 13, wins-excluded median >= 180d, national-ever >= 9/12,
  wave-4-or-win >= 8/12, raid villager deaths <= 3. The confirm control
  runs on the same fresh seeds (game code stashed, then restored) —
  never judged against the pilot baseline.
- If KILLED at pilot: revert ALL game-code changes, do NOT land, report
  the kill with numbers.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  waves 4–5 are escalation on deeds + standing, never pure calendar;
  wave-4 gate is wave-3 rung + standing >= t4(100)), docs/CONTESTS.md
  (arena = opts.noFlee sealed fights). No combat/field-fight canon doc
  exists beyond the fieldFights.js header (Steve 2026-10-08: fights are
  blow-by-blow, never a table) — the cap preserves that: it trims a
  round's damage, it never replaces a fight with a roll.
- Balanced panel (§15): per-seed recorder corpora are not panel pairs
  (the known error class established 0535Z/0644Z); the sweep-compare
  table on identical seeds below IS the comparison. No panel file is
  attached for that reason, not as a verdict input.

## VERDICT: KILLED at pilot (NO-GO) — game code reverted, nothing to land

The mechanism works exactly as designed and the primary leg passes with
room to spare — but the field-death leg it was supposed to move fails
outright, and the binding pre-registration requires ALL legs. Per §14,
a miss is NO-GO, never re-scored against a friendlier metric mid-run.
No confirm run was spent (confirm is pilot-GO-only). The game-code
change (fieldFights.js cap + game.js raid-flag forwarding) is FULLY
REVERTED in this tree — `git diff` empty, both files node-checked
after revert. What remains committed is the measurement record only:
this evidence file, scripts/test-oneshotcap-sweep.js, and the 16-row
corpus. The alternative arm sim-fieldguard-a is UNBLOCKED by this kill
(at most one lands; this one does not).

## CONTROL REPLICATION (gate: PASS, zero mismatch)

The control re-run (recorder-armed tableseat-nowait, seeds 73671–73678,
before any game edit) matches the published 0644Z controls EXACTLY:

| Headline | Published 0644Z | This control |
|---|---|---|
| won | 4/8 | 4/8 |
| national-ever / final | 8/8 / 7/8 | 8/8 / 7/8 |
| table invited / entered | 5 / 4 | 5 / 4 |
| wave-4 / wave-5 | 5/8 / 0/8 | 5/8 / 0/8 |
| median all / wins-excluded | 150d / 180d | 150d / 180d |
| villager deaths (kind-filtered) | 27 (field 12, other 12, raid 1, arena 1, tb 1) | 27, same split |
| one-round >=50% field deaths | 3 (eater 103, suburb 87, suburb 69) | 3, same trio |
| raid fights / vDie / vKill | 342 / 1 / 20 | 342 / 1 / 20 |
| death teles (mixed) / starvation | 261 / 3 | 261 / 3 |
| recorder errors / orphan evidence | 0 / 0 | 0 / 0 |

The control was judged, then the game edit applied, then the armed run
— never the reverse. One infrastructure note: the first control
invocation died with the agent service restart after seed 73671 (the
row survived — corpus lives in the worktree evidence dir, never /tmp,
precisely for this wipe class); the sweep resumed at 73672 and
completed. The 73671 row was verified against the 0644Z census before
resuming (ursula_weber vs eater, d89, 0.87, 103 — exact).

## PILOT RESULTS (identical seeds, control vs armed)

Sweep-compare table (the §15 comparison — see Instrument notes for why
no panel file is attached):

| Leg (pre-registered) | Bar | Control | Armed | Verdict |
|---|---|---|---|---|
| PRIMARY: one-round field deaths at >=50% entry HP | 0 (base 3) | 3 | 0 | PASS |
| Kind-filtered field villager deaths | <= 9 (base 12) | 12 | 13 | FAIL |
| Wins-excluded median | >= 180d | 180d | 180d | PASS |
| All-runs median (alongside) | — | 150d | 172d | — |
| National-ever | >= 6/8 | 8/8 | 8/8 | PASS |
| Wave-4-or-win | >= 5/8 | 6/8 | 6/8 | PASS |
| Kind-filtered raid villager deaths | <= 2 (base 1) | 1 | 1 | PASS |
| Stall sense check | no mass stall | — | no stall (below) | PASS (sense) |
| Directed probe | cap fires + survive R1 | — | PASS (below) | PASS |
| Wins / table entered / national-final | — | 4/8 / 4 / 7/8 | 3/8 / 3 / 5/8 | reported |

Per-seed armed vs control (days / won / field deaths):
73671: 129/0/0 vs 93/0/1 — the eater one-shot is gone; village lived
36 days longer but did not finish national (final 1→0).
73672: 106/1/2 vs 106/1/2 — identical trajectory; cap never fired.
73673: 180/0/4 vs 134/1/2 — the seed that kills the arm (below).
73674: 180/0/1 vs 180/0/1 — identical.
73675: 180/0/2 vs 180/0/2 — identical (incl. the arena hummice death).
73676: 172/0/2 vs 174/0/2 — same field count, changed composition
(suburb one-shot 0.52/87 → suburb death at 0.03 entry HP, 49 taken:
the capped round, but the villager entered nearly dead — the other
arm's problem, not this one's), plus one extra arena death.
73677: 98/1/2 vs 98/1/2 — identical (belltoad pair).
73678: 150/1/0 vs 150/1/0 — identical.

THE SEED THAT KILLS THE ARM — 73673: in control this village WON at
day 134 (entered the table, lesser seat). Armed, the suburb one-shot
that killed a villager at 0.52 HP on day 107 is gone — and the village
does NOT win: it runs to 180 days, never enters the table, and takes
three algorithm deaths instead (0.98 entry, 2 rounds, 98 taken = two
capped 49 rounds; 0.34 entry, 1 round, 49; 0.33 entry, 1 round, 44).
The cap did not kill anyone on this seed — no capped round killed a
>=50% entrant in round 1 (primary = 0 proves that) — but saving the
day-107 villager changed everything downstream, and the new trajectory
walked into more wave-4 meetings (armed wave-4+ field fights: 13 vs
control 5) and lost the win. Field deaths on the seed: 2 → 4. Net band
effect: the three one-shots removed, ~four trajectory-divergence
deaths added, field deaths 12 → 13 instead of the required <= 9.

THE BOUGHT ROUND, MEASURED: the cap buys rounds, not life, unless the
villager uses the round. Wave-4+ field fights: control 5 (vDie 3, vFlee
1, evade 1) vs armed 13 (vDie 4, vFlee 8, evade 1, vKill 0, mFlee 0).
No capped fight stalled (max 2 rounds in the armed set); villagers
either fled (vFlee 1 → 8) or died in round 2 (the 73673 algorithm
0.98/98 case: 49 + 49). Villagers still never kill a wave-4+ monster
in the field (vKill 0 both arms; band field vKill identical at 71,
all wave-1/2). The cap makes wave-4 meetings survivable-or-fleeable;
it does not make them winnable, and a villager who cannot flee or kill
in the bought round still dies — one round later.

RAID DEFENSE, UNBROKEN (the must-not-break guard, measured twice):
raid fights 342 both arms, raid vDie 1 both, raid vKill 20 both,
raid mFlee 299 → 298 (one fight's outcome moved with its trajectory;
the defense record is intact). The raid-flag forwarding works: raid
fights took 103 damage in the armed run (73676 audit, 2 rounds,
unchanged from control) — full-strength raid damage, no cap applied.
Arena fights are likewise untouched by design (opts.noFlee skips the
cap); the armed run's extra arena death is trajectory divergence, not
cap action — arena damage is not capped and the hummice numbers match
control's (58 over 4 rounds) where trajectories coincide.

## CONFIRM RESULTS

None — confirm is pilot-GO-only, and the pilot is KILLED. No fresh
seeds were spent.

## VILLAGE ASSESSMENT (plain words)

The cap does what it says on the tin: nobody healthy gets flattened in
a single blow anymore. A villager who meets the Eater at full health
and would have taken 160 damage in the first round now takes 49, lives,
and — in the probe — runs. In the villages, that means the three
deaths that used to arrive as a single number (103, 87, 69) stop
arriving that way. But the villages do not end up with fewer field
deaths, because saving a villager does not save the village's story —
it changes it. The village that used to win on seed 73673, with a
villager dying to a suburb on day 107, now keeps that villager and
loses the win entirely, wandering into algorithm fights until day 180.
Villagers still never kill a wave-4 monster out in the field; the cap
turns "die instantly" into "flee, or die one round later," and fleeing
is the only new outcome it reliably buys. The raid wall holds exactly
as before — 342 fights, one death — which is the one reassuring
number in the run: the protection was aimed at the field and it stayed
there. As a companion, this cap is a good tourniquet and a bad cure:
it stops the specific bleeding it was built for, but the village still
bleeds at the same rate through the next wound, because the next wound
is "a healthy villager meets a wave-4 monster and cannot win or get
away" — and capping the first round does not answer that.

## SENSE-TESTING (probe transcript + corpus read)

Directed probe (scripted, real engine, real eater def, max-roll RNG —
not a sim trajectory, stated as such): a 100-HP villager meets the
Eater. Round 1 uncapped damage parses to 160 (base blow + sigW4 gorge
bonus at maxima); capped round-1 damage is exactly 49; the cap fired
twice across the fight (237 total damage trimmed); the single biggest
capped blow was 175, trimmed into its round's 49 budget; the villager survived
round 1 and fled in round 2 (vFlee, 98 taken over 2 rounds). Read as a
story: the villager takes a hit that should have killed them twice
over, staggers, and runs while running still works. That is the cap
working as a story beat, not just a number — the bought round buys a
flee. (The probe's cap log line reads: "The Eater's blow would have
taken 175 — but no single round takes half a villager's health in the
wild. Capped to 49. (One-shot cap)" — honest narration of the
intervention, in the fight log where the village can see it.)

Corpus sense read, against the probe: the probe's flee is the common
armed outcome (wave-4+ vFlee 1 → 8), but the corpus also shows the
probe's happy case is not guaranteed — the 73673 algorithm villager
at 0.98 HP took 49 + 49 and died in round 2, having neither fled nor
killed. A bought round is only worth what the villager does with it,
and the morale/flee logic does not always spend it on flight. No
capped fight in the corpus reads as a stall or a farce (no fight ran
past 2 rounds in the armed wave-4+ set; band field vKill identical at
71, so the cap did not manufacture kills either).

Narration replays were NOT used for sense quotes here (0644Z: they
diverge from census trajectories 4/4) — the probe transcript and the
corpus fight rows are the sense surface, both on exact trajectories.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- The field-death leg, as written, prices trajectory divergence, not
  just the mechanism. The mechanism's own metric (primary: one-round
  >=50% deaths) went 3 → 0 — a clean kill of the target — while the
  aggregate field-death count went 12 → 13 on one seed's diverged
  trajectory (73673: win → no-win). A future arm that saves lives
  mid-trajectory should pre-register a mechanism metric (like the
  primary here) AND a divergence-tolerant aggregate (e.g., field
  deaths per 100 field fights, or a per-seed paired comparison that
  follows the saved villager) — or accept that any life-saving lever
  can fail an aggregate count bar through divergence alone. This
  run's verdict is NOT re-scored under that revision: the bar as
  written was missed, and the kill stands.
- The bought-round finding belongs in the NEXT companion design, not
  in this verdict: a cap that buys a round needs the bought round to
  be spendable (a flee window a hurt villager actually takes). The
  73673 algorithm death (0.98 → 49 + 49 → dead in round 2) is the
  case that design must answer. Whether that is a morale-tuning fix
  or a second mechanism is a coordinator/Steve call — it is NOT
  bundled here, and this arm does not get a second bite in this run.
- Wins moved 4 → 3 and table-entered 4 → 3 on the armed run, driven by
  the same 73673 divergence. Wins are not a pre-registered cost leg
  here (national-ever, wave-4-or-win, and the medians are), so they
  are reported, not judged — but a future arm should note that a
  life-saving lever can cost a win through divergence, and pre-register
  how win movement is judged before running.
- Metrics held otherwise: the control replicated exactly; the primary
  counting (attributed detail rows, field + rounds == 1 + frac >= 0.50)
  reproduced the 0644Z trio exactly on the control; kind-filtering held
  (mixed death teles 261 → 270 reported separately, never used as a
  cost bar); no threshold moved mid-run.

## INSTRUMENT NOTES

- New: scripts/test-oneshotcap-sweep.js (sweep + probe + read-only
  summarize modes; per-seed corpus via the shared writer with the same
  retry discipline as the deathcensus sweep). Corpus:
  evidence/2026-10-25/perseed-oneshotcap-a/ (16 rows: 8 control + 8
  armed; never /tmp). Run logs were deleted before commit (they
  duplicate the corpus JSONs).
- Game change (REVERTED — not in this tree): src/js/fieldFights.js
  (cap: 11 added lines + 7-line comment block) + src/js/game.js
  (raid-flag forwarding: 2 lines + comment). The revert was verified
  (`git diff` empty, both files node-checked). The raid-flag
  forwarding is arguably worth landing on its own as instrumentation
  hygiene (it closes the gap deathcensus-diag documented) — but it was
  part of this arm's change, so it went out with the arm; a future
  arm can re-propose it separately. It is NOT smuggled in here.
- Balanced panel (§15): NOT attached, for the established reason —
  per-seed recorder corpora are not panel pairs (the known error class
  from 0535Z/0644Z; balance-panel.js compare requires panel pairs).
  The sweep-compare table above, on identical seeds with the recorder
  on both configs, IS the comparison. No panel failure is hidden: the
  tool was not run because its input contract does not accept this
  corpus shape, as established twice before.
- Targeted suites: the fieldfight check script itself
  (test-break-monsters3-fieldfights-20261008.js) passes standalone
  (26 passed, 0 failed) but takes 2m25s, exceeding check.js's 120s
  wrapper timeout — the wrapper reports "1 failed" for the timeout,
  not for an assertion. The script fights wave-1 hushwolves only, so
  the wave-4+ cap cannot affect it; the timeout is a pre-existing
  slow-script artifact on this box, not a regression. (0644Z's "2
  passed" for --only fieldfight reflects a different match set or
  faster timing; the underlying script is green here when run
  directly.)
- What the recorder cannot see (carried from 0644Z): cap-fire counts
  per sim fight are NOT in the corpus — the recorder stores fight
  rows, not the rec's oneShotCapFires field, so armed cap fires are
  proven by the probe, not counted across sims. A future cap-style arm
  should record rec.oneShotCapFires into the fight row if it needs a
  band-wide fire count.

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. sim-fieldguard-a (the alternative arm) is now the unblocked
   candidate for the nearly-dead-entry mechanism — this arm's kill
   does not block it, and the two must still never stack.
2. The bought-round problem (73673 algorithm death): a survivability
   companion that buys a round must make the round spendable — flee
   logic for a villager at 1 HP after a capped round, or a second
   mechanism. Needs its own pre-registration; do not bolt it onto
   this killed cap.
3. Raid-flag forwarding as standalone instrumentation hygiene
   (re-propose separately from any lever).
4. Field deaths per exposure (metric revision for the NEXT run):
   field deaths per 100 field fights would have read control 12/985
   vs armed 13/994 — still no improvement, but it separates exposure
   growth (longer-lived villages meet more monsters) from mechanism
   failure. Proposed for the next pre-registration, not applied here.

## INSTRUMENT NOTES

- New: scripts/test-oneshotcap-sweep.js (sweep + probe + read-only
  summarize modes; per-seed corpus via the shared writer with the same
  retry discipline as the deathcensus sweep). Corpus:
  evidence/2026-10-25/perseed-oneshotcap-a/ (never /tmp).
- Game change (if landed): src/js/fieldFights.js (cap) +
  src/js/game.js (raid-flag forwarding in resolveWildMonsterEncounter).
- The recorder's vHpStartFrac is the census definition of entry HP
  (village health / max at fight start); the cap's basis is fieldFight's
  vHpMax (floor 100). The two agree at the 50% boundary for every
  census one-shot (0.52–0.87 entry).

## NEXT BLANKS

- (pending)
