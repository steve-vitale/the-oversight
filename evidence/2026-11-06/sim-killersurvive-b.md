# sim-killersurvive-b — every wave-4 killer's death, all killers, three corpora — DIAG-GO

**Arm:** sim-killersurvive-b (run fleshout-20261107T0221Z, Loop A, axis
scale-onramp / winnability chain, tracker blank #3: killer survivorship).
**Diagnosis only, zero src/js, no gate/price/deed/readyDemand change.**
Baseline policy `scripts/policies/competent-stageally-a.js` used verbatim
(via the grind driver, which wraps `competent` verbatim).
**Verdict: DIAG-GO** — every dead wave-4 killer on all three corpora is
classified by death channel with 0 unmatched, a dominant death context
is identified with counts, and a named, sized lever follows from it.
**Band:** fresh pilot 99681–99688 + confirm extension 99689–99696
(16 seeds, 150d death-aware, competent verbatim) · **Mined corpora:**
grind 99641–99648 (`evidence/2026-11-06/perseed-grind-a/`, 8 files) +
drive64 panel shards (branch `sim-drive64-measure`, aggregates only) ·
**Prereg:** `evidence/2026-11-06/sim-killersurvive-b-prereg.md`
(committed 7c68449f4 before any judged work) · **Analyzer:**
`scripts/killersurvive-b-analyze-20261106.js` (reuses
`killerdeath-analyze-20261105` fates + `killersurvive-analyze-20261106`
deathChannel; adds fought-again, same-chain linkage, partner-alive) ·
**Analyses:** `evidence/2026-11-06/killersurvive-b-grind-analysis.json`,
`evidence/2026-11-06/killersurvive-b-pilot16-analysis.json` ·
**Proof:** `scripts/test-killersurvive-b-20261106.js` **91/91 green**.

## The one-line result, plainly

A wave-4 killer lives about a week after the kill — median 7 days across
31 dead killers on 24 villages — and then dies in the next turn-based
fight, alone, against a fresh beast, after biting about two-thirds of
the way through it. They do not die to the beast that made them, they do
not die at home, and they almost never die with a partner alive beside
them. The pair never forms because the first killer is already dead by
the time the second kill lands — and the second killer then dies the same
way, about a week later, in the next fight.

## The census (pooled: 24 seeds, 37 killers, 31 dead, 6 living)

| Corpus | Seeds | Killers | Dead | Median kill→death | Living at end |
|---|---|---|---|---|---|
| Grind 99641–99648 (mined) | 8 | 15 | 11 | 6d | 4 |
| Pilot 99681–99688 (fresh) | 8 | 12 | 10 | 9.5d | 2 |
| Confirm 99689–99696 (fresh) | 8 | 10 | 10 | 5.5d | 0 |
| **Pooled** | **24** | **37** | **31** | **7d** | **6** |

Kill-to-death days, pooled (31): 0, 1×7, 2×2, 3, 4, 5, 6×2, 7, 8, 9×3,
10, 12, 13, 17, 18×2, 20, 22×2, 27, 28. One same-day death (gen_iewoeql,
99641: killed a Eulogy, died hours later to a Timeslot). Longest life
after a kill: 28d (hassan_ali, 99686).

### Death context (the dominant share — prereg bar (b))

| Context | Grind | Pilot | Confirm | Pooled | Share |
|---|---|---|---|---|---|
| **TB fight** | 7 | 8 | 9 | **24** | **77.4%** |
| Fallen, other (a stranger) | 2 | 1 | 1 | 4 | 12.9% |
| Contest | 2 | 0 | 1 | 3 | 9.7% |
| At home, not in combat | 0 | 1 | 0 | 1 | 3.2% |
| Unmatched | 0 | 0 | 0 | **0** | — |

TB-fight deaths by monster: Reunion 8, Eulogy 6, Algorithm 4, Timeslot 2,
Editor 1, Eater 1, Influencer 1, Buffering 1. The Reunion — the monster
that knows every tactic you have used — is the single commonest killer
of killers. Two of the 24 TB deaths carry
causeArg 'the arena' (ingrid_vik d103, benoit_lambert d124): arena-bout
TB fights, same shape, not a separate channel.

### Death cause (causeArg level — see metric review)

| Cause | Grind | Pilot | Confirm | Pooled | Share |
|---|---|---|---|---|---|
| **the wild (in combat)** | 7 | 8 | 6 | **21** | **67.7%** |
| a stranger | 2 | 1 | 1 | 4 | 12.9% |
| contest | 2 | 0 | 1 | 3 | 9.7% |
| the arena | 0 | 0 | 2 | 2 | 6.5% |
| the night | 0 | 1 | 0 | 1 | 3.2% |

The dominant cause and the dominant context are the same seven-to-eight
deaths on every corpus: the killer dies in a turn-based fight, and the
engine's cause for it is 'the wild' in combat at Haven. The context is
precise where the cause label is generic — the channel names the monster,
the rounds, and the HP left.

### The death fight, sized (24 TB deaths)

- **Rounds:** median 9.5 (range 5–96; one 49-round Editor marathon,
  one 96-round fight — the stall shape again, see backlog).
- **Monster HP left when the killer dies:** median 33% (range 10–100%).
  The killer bites two-thirds through the beast and still loses. One
  fight ended at 100% (hassan_ali, 8 rounds, 0 damage dealt — a whiff
  fight, not a damage race).
- **Company at entry:** allies 0 in 21 of 24 death fights; the three
  with an ally (visjoin_75, gen_9hzjnj2, boris_kowalski 99688 — the
  latter two also had party 1) still died. Company does not save the
  killer; the fight is lost on damage, not on numbers.

### The three questions from the brief

**Died in the same chain that made them? NO — 0 of 31.** Same-chain
deaths (linked by instance id, exact-HP trail, or same-day group): 0 on
all three corpora. Same-mid deaths: 1 of 31 (boris_kowalski, 99688:
killed a Eulogy d102, died d103 to a *fresh* Eulogy — same type, no
link). Killers do not die grinding the beast they killed. They die to
the next fresh beast that finds them.

**Ever fought again after the kill? 17 of 31 (55%).** The other 14 died
in their first fight after the kill — no recorded refight before the
fatal one (for the 'stranger' deaths the death fight itself is off-board
and unrecorded, so "no refight" there means "no *recorded* fight", not
"sat at home"). The longest-lived killer, hassan_ali (28d), fought twice
more; gen_hyo06cw (20d) fought 7 times more, including a 49-round Editor
fight, before dying to it. Fighting again does not save them either — it
just postpones the same ending by days.

**Partner alive at their death? 6 of 31 (19%).** The pair is almost
never alive together at the moment that matters. The three pooled
partner-alive cases: luis_fernandez d128 (vasyl alive), gen_iewoeql
d142 (vasyl + pavel alive — the 99641 endgame pair), app_mgpspio937
d94 (visjoin_75 killed a Congregation that same day). Only 99641 ever
held two living killers at the horizon, and they never sat: standing
400, readiness-5 ready 22 days, still village rank.

### Health / whereabouts after the kill (arm A's shape holds)

Every dead killer's last tracked state is full health at Haven — the
killerTrack rows show health 100 and atHaven through the post-kill
days (arm A measured this on 53001–53008; this arm's analyzer records
the same fields and the pooled rows agree: no wounding-down, no
starving-on-the-road, no slow decline). The killer rests at home at
full health and then walks into the next wave-4 fight and dies there.
The binding constraint is the next fight, not anything between fights.

## drive64 aggregates (branch sim-drive64-measure, cited not re-derived)

The 8 panel shards carry aggregates only — no per-killer records exist
there, so no per-killer census is possible; the shard extras reproduce
the published pooled numbers exactly (recomputed from the shards this
run): OFF 25 kills / 21 killers / 0 pairs / 4 living at end;
ON 25 / 23 / 4 pairs / 3 living. The round-0059 pair finding stands as
already-measured: all 8 pair killers dead within 22 days of their kill,
6 within 9. The drive64 killers die on the same clock as this arm's
census (pooled median 7d); the drive changes who kills second, not how
long killers live.

## NEXT-FIGHT SURVIVAL — the named lever (prereg bar (c))

**The lever:** the first turn-based fight a wave-4 killer enters after
their kill must be survivable. That is the whole lever: not rest, not
food, not party size — the next fight's damage race.

**Sizing, from the measured death fights:** the median death fight lasts
9.5 rounds and ends with the beast at 33% HP. The killer's side deals
~67% of a wave-4 beast's HP in ~9.5 rounds (~7% per round) and then the
killer dies. To flip the median death fight the killer's side needs
either **~50% more damage per round** (33% remaining ÷ 67% dealt), or
**~5 more rounds of survival at the same damage rate** (33% ÷ 7% per
round). Either number is the sizing target for the next arm's pilot;
both are measured, not guessed.

**Candidate shapes (for the next arm, NOT built here):**
1. **Fight-interior damage race** — Loop B's live fight-interior arm
   (party damage per round, ceiling 35%) is already pointed at this
   exact shape; this census is its kill-side evidence. If that arm
   lands, re-measure the kill→death median on a fresh band — the
   verdict bar is median ≥ 14d (double the pooled 7d) with the TB-fight
   share falling below 50%.
2. **Veteran's edge in the next fight** — a killer entering their next
   wave-4 TB fight brings something the first fight did not: the
   measured gap is damage, not company (death fights are already
   mostly solo, and the three with company died anyway), so the edge
   must be damage or staying power, not another warm body.
3. **Readiness-gated re-entry** — the village does not send the killer
   back into a wave-4 TB fight until the party damage race clears the
   bar; the killer's next fight is deferred, not fed to the beast.

**Guardrail:** if the sizing touches rounds-capping or armor-ignoring
hits, that half belongs to Loop B's bypass family — do not build it
here (same guardrail as FINISHER-SIZE). Win prices, deed gates, and
readiness bars untouched. A Steve call is needed before any lever that
makes the *first* kill easier — this census is about the *second*
fight, and the lever must not cheapen the first kill to buy the second.

## Wall numbers (national / table / wins, wave 4–5, median survival)

| Corpus | Seeds | Days median | End | W4 kills | W5 kills | W4 unlock | W5 unlock | National | Table | Wins |
|---|---|---|---|---|---|---|---|---|---|---|
| Grind | 8 | 128.5d | 7/8 lost | 16 | 2 | 8/8 | 1/8 | 0 | 0 | 0 |
| Pilot | 8 | 91.5d | — | 16 | 1 | 7/8 | 1/8 | 0 | 0 | 0 |
| Confirm | 8 | 112d | 7/8 lost | 11 | 0 | 8/8 | 0/8 | 0 | 0 | 0 |
| **Pooled fresh (16)** | **16** | **105.5d** | — | **27** | **1** | **15/16** | **1/16** | **0** | **0** | **0** |
| **Pooled all (24)** | **24** | **112.5d** | — | **43** | **3** | **23/24** | **2/24** | **0** | **0** | **0** |

No village banks two living wave-4 killers and sits — same wall as every
run. 99641 remains the furthest the chain has run (7 wave-4 kills, 2
wave-5 kills, 2 living killers, 22 readiness-5-ready days, standing 400,
survived 150d — and still village rank, no road to the table).

## Sense-test read

**Kurt Marshall (gen_9tnpaxm, 99685 d69) — the at-home death.** Killed a
Congregation d68, died "the night" d69 at Haven (map 5,4, the tile
beside home) while Stonebridge raided the pantry the same night
(~1600 kcal carried off). The burial beats run in full — keepsakes
buried, the quarrel ending with him, grave speakers advocating for
Amelia, who then dies the next day "the wild". It reads as a person
dying on a hard night at home, one day after becoming a killer. The
fiction never says he killed a Congregation yesterday. Coherent, and
the succession churn (Amelia dead the next day) is grimly legible.

**Dante Grabowski (gen_hyo06cw, 99686 d125) — the marathon.** Fought 7
times after his kill, lived 20 days, died in a 49-round Editor fight
away from Haven with the beast at 19% HP. The deathSays carry NO fight
narration for the Editor fight — just the burial beats and a "LEARNED:
Ritual & Meaning" line at the grave. A two-hour duel with a wave-5
Producer ends as a generic "died in the wild" burial. The death reads
as a meaningful consequence; the fight that caused it is invisible —
the same grind-invisibility blank grind-a found (deaths never name the
beast or the grind).

**Boris Kowalski (99688 d103) — the same-mid death.** Killed a Eulogy
d102, died d103 to another Eulogy. The fiction says neither. The burial
beats are identical boilerplate for every death ("Somebody screams.
Somebody else starts digging.") — and the successor Kennedy dies the
next day, d104, the same way. Nothing marks that a wave-4 killer just
died, nothing remembers the kill. The System's camera line DOES
celebrate kills (Boris's own Suburb kill got one on 99685 d70) but never
marks a killer's death. The killer's story is invisible in both
directions: the kill is celebrated, the death is boilerplate.

## Village assessment (plain words)

Twenty-four villages. Every one of them reached the fourth wave, and
they killed its beasts forty-three times — but the people who did the
killing kept dying about a week later, in the very next big fight, alone,
against a beast they had never met before. They were not worn down and
they were not starving: they sat at home at full health, and then they
walked out and died the way the first killer died, because the second
fight is exactly as hard as the first one and nothing they learned in
the first one helps in the second. Twice a village held two living
killers at once; never for long enough to use them. The strongest
village killed two of the fifth wave's Producers and still could not
climb out of village rank. The chain does not break at the kill. It
breaks at the next fight — and until a killer can survive the next
fight, the village will keep making killers one at a time and burying
them one at a time.

## Metric review (§14)

Pre-registered metrics bind this run (prereg 7c68449f4). Primary:
DIAG-GO iff (a) 0 unmatched dead killers, (b) a dominant cause/context
≥50% pooled, (c) a named, sized lever. All three hold pooled across
grind + pilot16 (24 seeds, 31 dead): (a) 0 unmatched on all three
corpora; (b) TB-fight 24/31 = 77.4%, 'the wild' 21/31 = 67.7%, and the
share holds on EACH corpus separately (grind 63.6%, pilot 80%,
confirm 90%) — not a pooled artifact; (c) NEXT-FIGHT SURVIVAL, sized
+50% damage/round or +5 rounds above.
- **One measurement correction, applied before judging (pilot not yet
  run when it was made, verdict not yet drawn):** the cause counts use
  the causeArg level, not the `scholar-death:` wrapper. Counting the
  wrapper would read 100% 'scholar-death' and prove nothing — the
  wrapper is a record type, not a cause. The prereg's intent was a
  dominant cause; the causeArg is that cause. No threshold moved.
- **One analyzer fix, caught by the proof test before any judged
  analysis:** the TB-trace join key is traces.tbSeq == tbFights.seq
  (traces.seq == tbFights.traceSeq is the reversed numbering). Joining
  on traceSeq silently failed to exclude the death fight from the
  fought-again count (7 instead of the true 5 on the grind band). Fixed
  before the evidence was written; the grind pins in the proof test
  assert the corrected 5.
- **Fought-again definition:** the death fight itself is the endpoint,
  not a refight — it is excluded by identity (trace seq / field row),
  not by day. Same-day refights before the death fight still count.
  Day granularity means same-day fights on the kill day do not count.
- **'The wild' as a cause is generic** — the precision sits in the
  channel (monster, rounds, HP left), reported alongside it, never
  instead of it. The two 'stranger' deaths are off-board combat deaths
  with no fight row by construction; "no refight" for them means "no
  recorded fight".
- Confirm extension: run per the prereg (pilot GO → confirm 99689–
  99696, freshness re-checked: 0 hits for 99689–99695; 99696 appears
  only in this arm's own prereg, which names the extension band as its
  reservation). The confirm strengthened the verdict (TB-fight 90%),
  it did not change it.
- Balanced panel (§15): INAPPLICABLE — no before/after pair exists
  (diagnosis only, competent verbatim). No compare `.md` fabricated.
- Telemetry: `telemetry-check.js` REFUSED the pilot corpus —
  "refusing recorder-corpus input: all 16 rows carry top-level
  anchorCommit". Same as every prior killer-chain arm. Baseline NOT
  rolled. Wall numbers above are the instrument's own.

## What this arm does NOT claim

- Not a fix: no game code changed, no lever built. NEXT-FIGHT SURVIVAL
  is named and sized, not tested.
- Not a first-kill lever: the sizing is for the killer's NEXT fight.
  Nothing here says the first kill should get easier.
- Not a party fix: death fights are already mostly solo, and the three
  with company died anyway. Company is not the missing ingredient;
  damage / staying power is.
- Not a chain-grind finding: same-chain deaths are 0/31 — the chain
  that makes a killer does not kill them. The grind's price (~3 deaths
  per chain kill, grind-a) is a different bill from the killer's own
  death a week later.
- Not a win: 0 wins on all 24 seeds; no wave-5 anything beyond 3 kills
  on 2 seeds.
- Not a Reunion counter: the Reunion killed 7 killers, but this arm
  measured the deaths, it did not test a counter.

## Findings for the backlog

- NEXT-FIGHT SURVIVAL (named lever, this arm's GO deliverable): the
  first TB fight after a wave-4 kill must be survivable — sized +50%
  damage/round or +5 rounds at the same output. Judge the next arm on
  median kill→death ≥ 14d with the TB-fight share below 50%.
- 96-round death fight (open): a killer's death fight ran 96 rounds
  (pooled rounds list max; confirm corpus) — the TB stall shape again
  (grind-a's 121-round Algorithm, baseline9-a's 159-round rout). Fights
  neither side can finish are still being entered by killers.
- Killer-death invisibility (open): nothing in the fiction marks that a
  wave-4 killer died — no line names the beast, the kill, or that a
  veteran is gone. The kill gets the camera line; the death gets
  boilerplate. Same invisibility blank as grind-a's grind.
- 'The arena' as a death venue (open, small): 2 killers died in arena
  TB bouts (causeArg 'the arena' with a matched TB row). Whether arena
  bouts should be a distinct channel from haven TB fights is a taxonomy
  question for the next census, not a finding here.
- (Not re-filed: grave-speaker line names the successor at the dead
  scholar's grave — arm A holds it; the veteran-kill announcement
  mismatch — baseline9-a holds it.)

## Proof and commits

- Proof `scripts/test-killersurvive-b-20261106.js`: **91/91 green**
  (fixtures F1–F13 + grind-band pins C1–C26 + pilot16 pins P1–P23).
  The proof caught one real bug (the tbSeq/traceSeq join, fixed before
  the evidence file was written).
- Prereg committed 7c68449f4 before any judged work (safe-commit index
  clobber hit; repaired via HEAD-blob cacheinfo, hashes verified).
- Analyzer + proof + analyses + corpora (16 files, 0 instrument errors)
  committed with this evidence file.
- `node scripts/check.js --quick`: first run 278 passed / 12 failed under
  heavy sibling load (load avg 20+; three tests hit the 120s cap) — a
  clean re-run reproduces the standing profile EXACTLY: **282 passed,
  8 failed** (godpath test-measurement-proof-update,
  test-measurement-workflow, test-mobile-combat-cadence,
  test-occupation-panels, test-phone-frame-proof,
  test-trust-observer-neutrality [120s timeout],
  test-capable-bot-20261014 [food-deed assertion — already filed as a
  pre-existing failure in sim-findings.md],
  test-establishment-r20-fixes-20261020). All 8 are pre-existing on the
  master line; none touches this arm's files, and this arm's own test
  passed inside both runs. This arm changed zero src/js and zero
  green-list files.
- Worktree contains only committed work at closeout; branch ready to
  merge. No push, no version bump, no live verification (coordinator
  owns the merge).

## Convergence

**scale-onramp: converging, NOT converged.** The killer-survivorship
blank is now measured on 24 villages, not hypothesized: killers live a
median 7 days and die in the next TB fight (77%), to a fresh beast, at
33% HP left, usually alone. The pair cannot form because the first
killer is dead before the second kill lands — and the lever is now
precise (the next fight's damage race, +50% damage or +5 rounds), not
"killers die too fast". The next arm is the fight interior (Loop B,
live) or a NEXT-FIGHT SURVIVAL pilot judged on median kill→death.
No village banks two living wave-4 killers and sits; the full seat is
still unreached; wins are 0 everywhere on judged corpora.
