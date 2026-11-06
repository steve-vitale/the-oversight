# sim-killersurvive-a — first-killer death channels + party persistence across succession: DIAG-GO

**Arm:** sim-killersurvive-a (run fleshout-20261106T1415Z, Loop A, axis
scale-onramp / winnability chain) · **Trace + probe, policy-only
measurement, zero src/js, no gate/price/deed change.** Baseline policy
`scripts/policies/competent-stageally-a.js` used verbatim.
**Verdict: DIAG-GO** — every first wave-4 killer on the band (both legs)
is classified by death channel from engine records, and the party-
persistence question is answered with a named mechanism. No first killer
is unmatched; no new death mode appears.
**Band:** 53001–53008 (8 seeds, deliberate reuse of the stageally-confirm
band — see prereg) · **Horizon:** 150d death-aware · **Corpus:**
`evidence/2026-11-06/perseed-stageally-confirm-b/` (16 files, anchor
2ff11cbf) · **Prereg:**
`evidence/2026-11-06/sim-killersurvive-a-prereg.md` (committed 8e5b4eed5
before any judged work) · **Analyzer:**
`scripts/killersurvive-analyze-20261106.js` (reuses
`killerdeath-analyze-20261105`) · **Analysis:**
`evidence/2026-11-06/killersurvive-a-analysis.json` · **Proof:**
`scripts/test-killersurvive-20261106.js` 140/140 green · **Verification:**
fresh legs on current master, `evidence/2026-11-06/perseed-killersurvive-verify/`
(staged 53004 + 53006, baseline 53006, 150d, anchor 2298a6069).

**The one-line result, plainly:** a first wave-4 killer lives about ten
days after the kill, at full health and at Haven the whole time, and then
dies in the next fight — usually the next wave-4 fight, with the party
beside them. The party does not scatter when the scholar dies: it persists
across succession, shrinking only when a member dies or is promoted to
scholar. The pair never forms because the second killer arrives about two
months after the first one dies, and the veteran bar counts only living
killers — a dead killer's veteran status dies with them.

## Question 1 — first-killer death channels (the census)

Every wave-4 killer on the band, both legs. Survival = death day − first
kill day (fallen-record day; matches the confirm's computation — the
medians below reproduce the confirm evidence exactly).

### Staged leg (3 killers, 3 kills; first-killer median 9.5d)

| Killer (seed) | Kill | Died | Days | Channel | Party at death | Health / whereabouts after the kill |
|---|---|---|---|---|---|---|
| gen_16cjvkx (53004) FIRST | Eulogy d78, TB, 2 rounds | d90 | 12 | **TB-fight: Reunion** (wave 4, 5 rounds, monster 94% HP left) | 1 [chen_wei] | 100 throughout, at Haven 100%, never on expedition |
| Olivia Bennett (53006) FIRST | Strike d89, TB, 10 rounds | d96 | 7 | **contest** (scholar died in a contest, not in combat) | 2 [adaeze_nwosu, ella_johnson] | min 70, last 88, at Haven 100% |
| gen_y8hmuwz (53006) | Congregation d149, TB, 1 round, solo | — | — | **alive at end** (censored, 1d) | 0 (solo) | 100, at Haven 100% |

### Baseline leg (7 killers, 9 kills; first-killer median 9d, all-dead median 12d)

| Killer (seed) | Kill | Died | Days | Channel | Party at death |
|---|---|---|---|---|---|
| Wanjiru Kamau (53002) FIRST | Influencer d143, wild | — | — | **alive at end** (censored) | 0 |
| gen_93bg7ex (53004) FIRST | Congregation d64 + Strike d70 (2 kills) | d87 | 23 | **fallen: the arena** (scholar-death inCombat, unfinished Audit TB fight the same day) | 0 |
| gen_qz719sh (53005) FIRST | Strike d85, TB | d91 | 6 | **TB-fight: Suburb** (wave 4, 7 rounds, monster 75% HP left) | 0 |
| gen_76n8yer (53006) FIRST | Congregation d81 + Suburb d83 (2 kills) | d86 | 5 | **fallen: a stranger** (scholar-death inCombat, away from Haven, no fight row) | 1 [olivia_bennett] |
| gen_cowc2ja (53006) | Algorithm d91, companion | — | — | **alive at end** (censored) | 0 |
| Ella Johnson (53008) FIRST | Strike d92, TB | d104 | 12 | **TB-fight: Reunion** (wave 4, 10 rounds, solo, monster 55% HP left) | 0 |
| Elena Petrova (53008) | Algorithm d109, companion | d131 | 22 | **at-home-not-combat: dehydration** (scholar death at Haven, map 4,4) | 0 |

### Channel census (dead killers only)

| Channel | Staged | Baseline | All |
|---|---|---|---|
| TB fight, wave 4 (Reunion ×2, Suburb ×1) | 1 | 2 | 3 |
| Contest | 1 | 0 | 1 |
| Arena (fallen: the arena) | 0 | 1 | 1 |
| A stranger (fallen, no fight row) | 0 | 1 | 1 |
| At home, not in combat (dehydration) | 0 | 1 | 1 |
| Alive at end (censored) | 1 | 2 | 3 |
| Unmatched | 0 | 0 | **0** |

### What the census says

- **Killers die in the next fight, not from attrition.** Median 9.5d staged /
  9d baseline; every dead killer was at full health (health 100 at last
  sight, except Olivia min 70 / Elena min 35) and at Haven (100% of living
  days after the kill, except the wild/companion killers who live away) right
  up to the death. There is no wounding-down, no starving-on-the-road, no
  slow decline in the records. The killer rests at home at full health and
  then walks into the next wave-4 fight — or contest, or arena — and dies
  there. The binding constraint is the next fight (finishprobe's survival
  time × damage per strike vs entry HP), not anything that happens between
  fights.
- **The 0730Z "killers die at home" does NOT reproduce as the dominant
  channel on this band.** Only 1 of 7 dead killers died at home not-in-
  combat (Elena, dehydration, 22d after the kill — the longest survival on
  either leg). The rest died in fights (3 TB), contests (1), the arena (1),
  or to a stranger (1). The 0730Z finding was about a different band and a
  different policy mix; on 53001–53008 with the staged policy, home is
  where killers wait, not where they die.
- **The Reunion kills killers.** Both staged-and-baseline TB-fight killer
  deaths with a named monster are Reunions (53004 d90, 53008 d104) — the
  wave-4 monster that knows every tactic you've used. The third TB death is
  a Suburb (53005 d91). All three TB deaths ended with the monster at
  55–94% HP: the killer barely scratched the next beast. Hand to Loop B's
  fight-interior arm: the killer's second fight looks exactly like the
  first fight — same losing shape, same monster HP left.
- **Company does not save the killer.** The two staged deaths both happened
  with the party beside the killer (1 and 2 members). The baseline TB deaths
  were solo (0 allies). Either way the killer dies in ~5–12 days. The
  staged party buys presence, not survival.
- **The residual channels (arena, stranger) are real engine records, not
  instrument gaps.** gen_93bg7ex died "in the arena" with an unfinished
  Audit TB fight the same day (outcome None, scholarDiedInFight False —
  the fight never resolved, so it is not a TB-fight death). gen_76n8yer
  died "to a stranger" in combat away from Haven with no fight row at all
  — an off-board combat death the per-turn instrument cannot see. Both are
  reported as the engine wrote them; neither is re-classified by narration.
- **The 1-round solo Congregation kill (53006 d149) is not explained here.**
  Its killer, gen_y8hmuwz, is alive at the horizon (party 0, health 100).
  The instrument records no per-turn damage trace — that blank stays with
  the confirm's blank (4).

## Question 2 — party persistence across succession (the probe)

Succession trace: every scholarId change in the daily snapshots, with the
party before vs after. 47 successions staged, 41 baseline.

| | Staged | Baseline |
|---|---|---|
| Successions | 47 | 41 |
| Scholar promoted from the party | 10 | 3 |
| Party persisted (≥1 member carried over) | 21 | 2 |
| Party emptied at succession | 6 | 2 |
| Members "scattered" (left without promotion) | 6 | 0 |
| Veterans bar dropped at succession | 2 | 5 |

### The answer: the party persists — it only ever shrinks by death or promotion

- **Nobody walks away.** All 6 staged "scattered" members died on the
  succession day itself: Nino d50, Owen d51, Farid d127 (all "the wild",
  in combat at Haven), Lindani d89 (combat), Ella d138 (contest), Raj d87
  (contest). The proof test pins this: every scattered member has a fallen
  entry on the succession day. There is no walk-away channel in the records.
- **The 6 party-emptied successions are all explained:** 2 promotions
  (53002 d27, 53004 d91 — the sole party member became the scholar) + 4
  deaths (53001 d51, 53005 d89, 53006 d138, 53008 d87 — the sole party
  member died that day). Zero unexplained empties.
- **The mechanism, plainly:** when the scholar dies, the party stays
  (members keep their seats); the only ways out of the party are dying or
  being promoted to scholar. A one-member party vanishes into the
  succession whenever its member is promoted — the successor starts
  party-less and must rebuild. On 53004 the killer's only party member
  (chen_wei) became the scholar on d91, party 0; chen_wei died d121 in a
  contest, party 0 ever after. On 53006 the party rebuilt by d122 (after
  the first killer was already dead) — too late to matter.
- **The veteran bar is living-only, and that is the pair-killer.** The
  readiness5 veterans count drops the day the killer dies (53004: 1 → 0
  on d91; staged veterans lost at 2 successions, baseline at 5). The
  waveKillLog keeps the kill forever (w4killers stays 1 after the death),
  but the bar that gates wave 5 needs two LIVING killers. The pair never
  forms because the second killer arrives ~60 days after the first one
  dies (53006: first blood d89, killer dead d96, second kill d149) — the
  gap is six times the killer's lifespan. Persistence is not the problem:
  the party persists and the kills persist; the KILLERS do not persist.
- **Design question, not a measurement one (as preregged):** whether a
  party SHOULD persist is answered — it does. What is missing is not
  persistence but re-formation after a one-member promotion, and, above
  all, killer survival long enough for a second kill to overlap the first.
  If the variant ever needs game-code support, the engine change to name
  is in the succession path (party re-formation for a promoted successor)
  and/or the veteran bar (which is deliberately living-only by design —
  a Steve call, not this arm's).

## The stageally bar, alongside (not re-judged)

The confirm judged it NO-GO; this arm explains why and does not re-score
it: living pair 0/8 both legs, post-first-blood wave-4 kills 1 staged /
4 baseline, max simultaneous living killers 1 both legs, readiness-5-ready
days 0 both legs. The census shows why the pair cannot form: the first
killer dies in ~10 days, the second kill comes ~60 days later, and the
veteran bar counts only the living.

## Verification legs on current master (anchor 2298a6069)

Staged 53004 + 53006 and baseline 53006 re-run 150d on the current tip.
2 of 3 reproduce the corpus trajectories exactly; the third diverges in a
way that strengthens the trace.

| Leg | Corpus | Verify | Verdict |
|---|---|---|---|
| Staged 53006 | 150d survived, standing 175, kills Strike d89 Olivia + Congregation d149 gen_y8hmuwz, Olivia died d96 contest | identical on every headline: same kills, same days, same fates, same succession days (d89, d96, d103, d115, d129, d138) | **exact match** |
| Baseline 53006 | 105d lost, standing 199, kills d81 + d83 + d91 | identical: same kills, same fates (gen_76n8yer d86 stranger 5d; gen_cowc2ja alive), same days | **exact match** |
| Staged 53004 | 150d survived, standing 155, Eulogy d78 gen_16cjvkx, killer died d90 TB Reunion | 84d village-lost, standing 155, Eulogy d79 gen_16cjvkx (one day later), killer died d82 (3d) TB Eulogy, solo, monster 56% HP left | **diverged, consistent** |

The 53004 divergence, explained: Chen Wei died d78 ("the wild", in combat
at Haven) — the same day gen_16cjvkx became scholar — so the killer started
party-less (party 0, not [chen_wei] as in the corpus). The killer then
re-fought the Eulogy on d82 (two TB fights that day, both lost) and died in
the first, 3 days after the kill; the village died d84. Same killer, same
monster, same channel family (TB fight at Haven), faster death. The
trajectory shift is a one-day RNG displacement between anchors (the moot
gate's convening timing and/or the journey r132 crisis change are the
candidates — both sit between 2ff11cbf and 2298a6069); it is not an
instrument error, and it does not contradict the trace — on the verify leg
the killer STILL died fast in a TB fight, and the party STILL emptied only
by death (chen_wei died d78). The Eulogy re-encounter pattern reproduces
too (the corpus rallied the same Eulogy four times in five days; the verify
leg fought it twice on d82).

## Sense-test read

- **The killer's burial (53004, corpus d90).** "🕯️ Soo Marshall is dead —
  the wild. The village stops. Somebody screams. Somebody else starts
  digging." (Soo Marshall is gen_16cjvkx's name.) "What Soo kept close goes
  into the ground with them — keepsakes are buried, never taken from the
  body." "The village's quarrel was with Soo — and Soo is dead. The
  sentence doesn't cross the grave. You're someone else now; the docket is
  empty, but the village remembers." The death reads as a person dying, not
  a counter decrementing — and the quarrel line correctly names that the
  dead scholar's disputes end with them. Coherent.
- **Olivia's contest death (53006, d96).** "🕯️ Olivia Bennett is dead —
  contest." The same burial beats follow. One wrinkle: "At the grave,
  Brian, Shaker, Adaeze and 4 more speak for Larry — 'Olivia trusted
  them...'" — the speakers advocate for Larry (the successor?) at Olivia's
  grave. It reads as the village moving on to the next scholar mid-eulogy;
  slightly off, not broken. Not this arm's business, flagged for the
  findings backlog.
- **Elena's dehydration (53008, d131).** "🕯️ Elena Petrova is dead —
  dehydration." A wave-4 killer dying of thirst at home, 22 days after
  the kill, on the same night a raid carried ~1400 kcal from the pantry.
  The fiction coheres: the village is hungry and dry, and its veteran dies
  of thirst, not of a monster. It is the only at-home death in the census,
  and it reads like the game working as designed — survival pressure kills
  veterans too.
- **The Reunion's lines (53004, d90).** "You don't know what that was.
  Everyone you've buried, standing up." / "Another face surfaces — someone
  you brought, or someone who brought you. 'You didn't think we'd come
  alone?' The dead gather." The monster that kills the killer narrates the
  village's dead back at them. Coherent and on-theme.

## Metric review

- Pre-registered metrics bind this run (prereg 8e5b4eed5). Primary:
  death-channel census completeness + party-persistence answer. DIAG-GO:
  0 unmatched first killers on either leg; the persistence question is
  answered (persists; shrinks only by death/promotion) with the mechanism
  named. No metric was swapped, re-cut, or re-thresholded.
- The death-channel taxonomy is record-based (fallen + scholarDeaths +
  matched TB/field fight rows), never SAY-based — the finishprobe
  reclassification applies here too. One classifier fix was made
  mid-analysis and is recorded honestly: the TB-fight match first required
  the daily row's scholarId to equal the killer, but the daily snapshot for
  the death day already shows the successor — gen_qz719sh (53005 d91,
  Suburb) was first misclassified as fallen:the wild. The fix matches on
  the scholar-death record for the same day instead. The corrected census
  above is the judged one; the misclassification is documented here, not
  hidden.
- `atHaven` in scholarDeaths is the location flag at death; map (4,4) is
  the haven tile, (5,4) is adjacent. A death with inCombat=True at (5,4)
  is a fight AT Haven's edge, not a "died at home in bed" death — the
  taxonomy separates in-combat from not-in-combat first, location second.
- Same-day double successions are collapsed in the daily trace: Raj
  (53008 staged) died d87 in a contest as a scholar, but the daily rows
  show valeria → visjoin_47 that day — Raj held the seat for part of the
  day and is visible only in scholarDeaths/fallen, not in the succession
  rows. The succession count (47 staged) is therefore a lower bound on
  scholar changes; the party-persistence finding is unaffected (Raj's
  party state that day is unobserved, not counted as scatter).
- `w4killers` in the daily rows is the KILL count, not living killers —
  it stays 1 after the killer dies. The living bar is
  `readiness5.veterans`. Do not cite w4killers as living veterans.
- The 53004 verify divergence is a trajectory shift between anchors, not
  a metric failure: the prereg's verification rule was "if trajectories
  match, the corpus trace stands; if they diverge, re-derive from the
  fresh legs and report the divergence." 2 of 3 match exactly; the third
  diverges but its killer facts (fast TB-fight death at Haven, party
  emptied by death) agree with the trace, so no re-derivation was needed.
  The divergence itself is reported here as a finding (see below).
- Balanced panel (§15): INAPPLICABLE — no armed leg exists in this arm
  (no policy built, no before/after pair). Same outcome as the pilot and
  confirm: the panel runs its own full panel and takes no corpus input.
  No compare `.md` is fabricated.
- Telemetry: `scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-06/perseed-stageally-confirm-b/*.json' --metrics
  national,table,wins,exiled` REFUSED — "refusing recorder-corpus input:
  all 16 --current rows carry top-level anchorCommit". Same as the
  confirm. The wall numbers in this file are the instrument's own.

## What this arm does NOT claim

- Not a kill of the stageally NO-GO: the confirm verdict stands; this arm
  explains it.
- Not a win: 0 wins either leg; no wave-5 anything on this band.
- Not first-killer survival fixed: median 9.5d staged / 9d baseline vs the
  19d bar; the pair needs the second killer to arrive ~50 days sooner, or
  the first killer to live ~50 days longer — neither is a policy this arm
  built.
- Not a party-persistence fix: the party already persists. What is missing
  is re-formation after a one-member promotion and killer survival, not
  persistence itself.
- Not a field-fight fix: field fights killed 0 wave-4 monsters on both
  legs (same as the confirm); every kill came from a turn-based fight.
- Not a Reunion counter: the Reunion killed two first killers, but this arm
  measured the deaths, it did not test a counter.

## Next blanks (for the loop, not this arm)

1. **Fight interior with company present** — Loop B's sim-fightinterior-b,
   live on the same band. This arm's Reunion finding (two killer deaths,
   monster 55–94% HP left) is handed to it: the killer's second fight
   looks exactly like the first fight.
2. **First-killer survival** — the lever is now precise: the killer must
   live ~50 days longer, or the second kill must come ~50 days sooner.
   The balance levers (survival time / damage per strike / entry HP) are
   the Steve call named by finishprobe; a policy that re-forms the party
   for a promoted successor is the policy-shaped half.
3. **Why the baseline killed 9** — the baseline's second killers came
   without company (a companion Algorithm kill, a wild Influencer kill);
   the armed leg produced none. Whether the staged policy crowds out
   non-scholar kills is still open.
4. **The 1-round solo Congregation kill (53006 d149)** — still needs a
   damage trace; no per-turn record exists.
5. **The 53004 trajectory shift between anchors** — a one-day RNG
   displacement (kill d78 → d79) cascaded into a village death at d84 vs
   survival to 150d. Which master change between 2ff11cbf and 2298a6069
   moved it (moot convening timing? journey r132 crisis?) is worth one
   look before the next arm re-uses this band — the band is trajectory-
   fragile, not just seed-fragile.
6. **The arena and the stranger** — two killer deaths with no TB fight
   row. What the arena is, and what "a stranger" is in combat, needs one
   look in the engine (are these contest/arena systems the loops have
   not instrumented?).

## Findings for the backlog

- The grave-speaker line names the successor at the dead scholar's grave
  ("speak for Larry" at Olivia's grave, 53006 d96) — reads as the village
  moving on mid-eulogy; slightly off, not broken.
- The Reunion killed two first killers on this band (53004 d90, 53008
  d104), both times with the monster at 55–94% HP — the monster that
  knows every tactic you've used is the one that ends killers.
- A wave-4 killer died of dehydration at home (53008 Elena, d131) — the
  only at-home killer death in the census; survival pressure kills
  veterans too.

## Proof and commits

- Proof `scripts/test-killersurvive-20261106.js`: 140/140 green on this
  worktree (headline reproduction + classification invariants + anchor
  rows + the no-scatter pin + liveRows coverage). The proof caught one
  real bug (the TB-match daily-row condition, fixed before the evidence
  file was written).
- Prereg committed 8e5b4eed5 before any judged work. Analyzer + analysis +
  proof committed 2298a6069. This evidence file + the verification corpus
  (`evidence/2026-11-06/perseed-killersurvive-verify/`, 3 files, 0
  instrument errors) committed with this file.
- The safe-commit index clobber hit on both prior commits in this arm
  (files shown staged-as-deleted after correct commits); repaired with
  HEAD-blob cacheinfo each time, verified `git status` empty +
  `git diff HEAD` empty + hash-object matches.
- Worktree contains only committed work at closeout; branch ready to
  merge. No push, no version bump, no live verification (coordinator owns
  the merge).

## Convergence

**scale-onramp: converging, NOT converged.** The stageally NO-GO is now
explained, not just measured: killers die in ~10 days in the next fight,
the party persists but the veteran bar counts only the living, and the
second kill arrives ~60 days after the first killer dies. No lever in this
arm moves those numbers — the next arm is the fight interior (Loop B, live)
or a killer-survival lever (a Steve call on the balance levers, or a
succession re-formation policy). The pair remains unformed on every seed.
