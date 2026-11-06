# Wild death channel of first wave-4 killers — Loop B verdict (run fleshout-loop-b-20261106T0730Z, arm sim-killerwild-b)

Axis: scale-onramp / winnability chain (wild ally-join → wave-4 kills →
veterans → readiness-5 release → wave-5 facing → full seat). Policy-side
probe only, zero src/js. NO gate/price/deed/readyDemand change. No
flee-repair (STEVE CALL on scope). No duplication of Loop A's live work
(staging+rally, finishing probe).

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-06/sim-killerwild-b-prereg.md` (commit
efacb3243) + addendum `evidence/2026-11-06/sim-killerwild-b-prereg-addendum.md`
(commit e3ecb0fab, recorded BEFORE any armed sim — there are none).
In short: fresh band 56001–56008 (freshness re-verified: 0 hits in all
dated preregs and all evidence `.md`; confirm band 57001–57016 reserved
and UNSPENT), baseline = tbretreat-refind policy (the current best, NOT
verbatim competent), 150d death-aware horizon. Stage 0: classify every
first wave-4 killer's death by channel and measure retreat-trigger
coverage. Stage 1: build the policy-actionable lever Stage 0 identifies —
leading candidate a killer-aware earlier retreat trigger for fresh
killers, exact thresholds to be frozen in the addendum from Stage 0
evidence. Primary metric (Stage 1 only): first killers alive 14d after
first blood, GO iff armed >= baseline + 2 (8 seeds); guards wave-4 kills
armed >= 1/2 baseline, median survival armed >= 0.8x baseline.

## Verdict — DIAG (no Stage 1 build)

Stage 0 answers the question, and the answer kills the leading candidate:
**first wave-4 killers do not die in the wild. They die at home.** Of the
5 first killers blooded on this band, 4 died in turn-based fights AT
HAVEN (in combat, map (4,4)) and 1 in a companion record disagreement
(see below); ZERO died TB-wild, ZERO in the field, ZERO in the arena,
ZERO on expedition. A retreat trigger cannot save a fighter who is
already standing at home — at haven the flee direction is null, so the
trigger HOLDs at any threshold, and the one fired TB-home death proves
it: the trigger fired at scholar 69% HP / monster 76% HP (Audit) and the fighter
held and died where he stood. The no-fire deaths cannot be saved by
firing either: their fatal fights were at haven (no barrier-crossing
line on any of the four fatal death days; the same days carry haven-hold
fires by party members), so a fire would have held. The killer-aware
trigger's expected effect on this band's evidence is zero. No different
policy-actionable lever was identified (see "Stage 1 decision" below).
Per the prereg's staged design the run ends DIAG with the census as
deliverable. No armed pilot runs, no confirm band spent, the Stage 1
primary is not judged against any armed leg — there is none.

## Proof

`scripts/test-killerwild-20261106.js` — 20/20 PASS (15 fixture tests:
channel branches TB-wild/TB-home/arena/expedition/field/wild-residual;
coverage branches fired-exited/haven-hold/died-mid-retreat/no-fire/
no-fire-other-fighter/no-tb-fight-near-death/npc-policy-blind; alive-14d
boundary 14-vs-15; determinism; judge GO / NO-GO-diff-1 /
NO-GO-kill-guard on mini-corpora; live harness smoke 150d seed 56001
baseline to /tmp, 0 instrument errors; off/on neutrality leg 150d seed
56001: identical days, endReason, wave-4 kill count). Proof re-run green
after the judged sims (same 20/20, no file changed since the prereg
commit). Judged corpus: 8 files, instrumentErrors 0 on every file.
Instrument: `scripts/killerdeath-instrument-20261105.js` (reused as-is;
proven neutral by sim-killerdeath-b). Driver:
`scripts/killerwild-driver-20261106.js`. Analyzer:
`scripts/killerwild-analyze-20261106.js` (frozen in the prereg commit;
NOT changed after the judged sims). Anchor: prereg commit efacb3243;
worktree HEAD at verdict time e3ecb0fab (addendum). Telemetry deviation
check (§10 loop-body step): the tool REFUSES recorder corpora by design
(`telemetry-check.js`: sweep recorder rows, not runs — same refusal the
killerdeath and tbretreat-refind-confirm arms recorded). No LOUD line
exists to investigate; wall numbers are reported directly below instead
of via a forced flag. Balanced panel (§15): INAPPLICABLE, stated in the
prereg — policy-side probe, no Game-root change to compare.

## THE STAGE 0 ANSWER (plain words)

Picture eight villages playing with the best retreat policy yet built.
Every one of them meets the fourth draft — 77 wave-4 fights between
them — and every one of them loses its village before the season ends.
Five villages blood a first killer. None of those killers dies out in
the world the way the arm's name assumes. They die at the fire, in
fights the monsters bring to Haven itself: one scholar after another
stands on the haven node, hurt, facing a nearly whole beast — and the
retreat that saves fighters out in the wild has nowhere to take them.
On the worst days the mantle passes two or three times in a single day,
each new scholar walking into the same fight at home and dying in it.
The one fighter who did get out (Mara, day 110) bought exactly one day
before the next beast at home took her. The village that came closest —
standing 250, the fifth draft unlocked — lost its two day-110 killers
within two days, both at home, and never faced wave 5 at all. The wild
is not where first killers die. Home is.

## Per-seed table — baseline (tbretreat-refind)

| seed | days | end | w4 fights (TB/field) | w4 kills | killers ever | firstAlive14 | class | peak gated | maxWave |
|------|------|-----|----------------------|----------|--------------|--------------|-------|------------|---------|
| 56001 | 71 | lost | 2 (2/0) | 1 | 1 | YES* | KILLED-LIVING-SHORT | 199 | 4 |
| 56002 | 108 | lost | 10 (6/4) | 0 | 0 | no | FACED-NO-KILL | 175 | 4 |
| 56003 | 74 | lost | 13 (9/4) | 1 | 1 | no | KILLED-DEAD-KILLER | 199 | 4 |
| 56004 | 113 | lost | 14 (11/3) | 3 | 3 | YES | KILLED-DEAD-KILLER | 250 | 5 |
| 56005 | 86 | lost | 7 (5/2) | 0 | 0 | no | FACED-NO-KILL | 185 | 4 |
| 56006 | 83 | lost | 12 (7/5) | 1 | 1 | no | KILLED-DEAD-KILLER | 125 | 4 |
| 56007 | 89 | lost | 11 (10/1) | 0 | 0 | no | FACED-NO-KILL | 160 | 4 |
| 56008 | 121 | lost | 8 (7/1) | 1 | 1 | no | KILLED-DEAD-KILLER | 199 | 4 |

\* 56001's YES rests on the Tumelo record disagreement (see "Killer
ledger" and "Blanks"): the engine's own readiness count credits him as
a living veteran through the horizon, while his fallen entry says he
died in the day-60 wipe. Excluding that seed, the baseline primary is
1/8. The prereg's deadMap rule is kept for the count; the disagreement
is disclosed, not resolved here.

Baseline primary (prereg rule): first killers alive 14d after first
blood = 2/8. Total wave-4 kills 7. Median survival 87.5d. No seed
survived the horizon; no living pair (snapshot or reconstructed);
readiness-5-ready days 0/8 seeds.

## Killer ledger (wave-4+ kills only)

| seed | killer | kills (days, monsters) | channel | death day (channel) | kill→death | trigger coverage |
|------|--------|------------------------|---------|---------------------|------------|------------------|
| 56001 | gen_xpefuez (Tumelo) | 1 (d59, influencer) | companion | d60 (other:combat)* | 1d | npc-policy-blind* |
| 56003 | ursula_weber | 1 (d60, —) | player | d69 (TB-home) | 9d | no-fire (other-fighter-fire-same-day) |
| 56004 | dale_hoffman | 1 (d56, —) | player | d75 (TB-home) | 19d | haven-hold |
| 56004 | gen_3bxuqsc (Regina) | 1 (d110, algorithm) | player | d110 (TB-home) | 0d | haven-hold |
| 56004 | gen_dk4spzf (Salman) | 1 (d110, —) | player | d112 (TB-home) | 2d | haven-hold |
| 56006 | gen_gebt24d | 1 (d72, —) | player | d82 (TB-home) | 10d | no-fire |
| 56008 | jorge_silva | 1 (d116, —) | player | d116 (TB-home) | 0d | no-fire |

\* Tumelo killed as a COMPANION (via 'companion' in the scholar Dmitri's
fight), not as scholar; his death record is the disagreement in the next
section. Kill mids marked '—' are waveKillLog rows whose mid was not
recovered in the ledger print (the analyzer records them; the channel and
coverage are the judged fields).

Kill-to-death median: 5.5d (n=6 dead killers with a death day; Tumelo
included at 1d — small n, reported with its n, not as a band estimate).

## Death channels and trigger coverage (Stage 0, judged)

Channel shares over dead first killers (n=5): TB-home 4, other:combat 1,
TB-wild 0, field 0, arena 0, expedition 0, contest 0. Over ALL dead
wave-4 killers (n=7, counting Tumelo + the two extra 56004 killers):
TB-home 6, other:combat 1. UNSPLIT RESIDUAL: 0 — no dead killer's only
evidence is a bare 'the wild'.

Trigger coverage over the 4 TB-home first-killer deaths: haven-hold 1,
no-fire 2, no-fire-other-fighter 1. Over all 6 TB-home killer deaths:
haven-hold 3, no-fire 2, no-fire-other-fighter 1.

The scholars' own death record sharpens the picture: across all 8 seeds
there are 84 scholar deaths (playerDeath wrap) — 81 at haven, 3 away;
81 in combat, 3 not. The three away deaths are on 56003 (1) and 56007
(2); no first killer is among them. The 56007 away deaths are the only
seed with genuine wild retreats: an exit (d86), a consumed-worldEdge
(d87), and an open death (d89) — and 56007 blooded NO killer in 11
wave-4 fights. The wild retreat works where it can run; the kills do
not happen there.

Refind fires on the band: 15 total — 10 haven-holds, 2 exits, 1
consumed-worldEdge, 2 open (died mid-retreat). Suppressions 0 on every
seed (no sealed/arena/noFlee fight ever gated the first fire). Wave-4
fight census by monster: Eulogy 27, Reunion 25, Influencer 11, Algorithm
6, Strike 3, Eater 2, Audit 2, Suburb 1 (77 total). Wave-4 kill census:
Influencer 3, Audit 1, Algorithm 1, Reunion 1, Strike 1 (7 total).

## Closest seeds

- 56004 (the pair near-miss, twice over): standing 250, wave 5
  UNLOCKED (maxWave 5) — the only seed to open the door — yet wave 5
  never faced and readiness-5-ready days 0, because the veterans bar
  never held 2 living killers. Dale blooded d56 and died d75 at home
  (Audit, haven-hold, k2d 19 — the only first killer to clear 14d on
  clean records). Then day 110: Regina killed an Algorithm as scholar
  and died the same day to a Reunion (haven-hold); Salman blooded the
  same day and died d112 to a Reunion (haven-hold). Two killers blooded
  one day, both dead within two days, both at home. The pair needed them
  alive together; the house took them one after another.
- 56001 (the record disagreement): the day-60 party wipe killed the
  scholar Dmitri plus Morena and Onni ("the wild", at haven, in combat)
  and left fallen entries for two companions (Yuting and Tumelo, cause
  'combat'). Tumelo then SPEAKS at the grave the same day ("At the
  grave, Tumelo speaks for Morena"), his data dead-flag says not-dead,
  and the engine's readiness5.veterans stays 1 through the horizon — the
  engine credits him as a living veteran — while his fallen entry and
  health 0 say he fell. Yuting's identical-shaped fallen entry agrees
  with her dead-flag (dead). One companion's records disagree; the
  other's do not. The analyzer follows the prereg's deadMap rule
  (alive), which agrees with the engine's readiness count; the fallen
  record is the dissenter. This is filed as a follow-up question (see
  "Blanks"), not resolved by fiat — and it is why the baseline primary
  is reported as 2/8 by rule and 1/8 excluding the seed.
- 56003 day 69 (the cascade): THREE scholars died the same day (Ivy,
  Itsuki, Ursula), all "the wild", at haven, in combat, across three
  wave-4 fights (Algorithm, Reunion, Eulogy). Itsuki's Reunion fight
  fired the trigger (s0.44/m0.871) and held; Ursula — the first killer,
  blooded d60 — died in her own fight with no fire. The mantle passed
  twice inside one day, each bearer walking into the same home fight.

## Wall numbers (baseline; secondary, never re-scored)

| Measure | Baseline (tbretreat-refind) |
|---|---|
| Wins | 0/8 |
| National / global | 0/8 |
| Table | 0/8 |
| Wave-4 unlocks | 8/8 |
| Wave-4 faced | 8/8 |
| Wave-5 unlocks | 1/8 |
| Wave-5 faced | 0/8 |
| Readiness-5-ready days | 0/8 seeds |
| Living pair (snapshot / reconstructed) | 0 / 0 |
| Median survival | 87.5d |
| Survived the 150d horizon | 0/8 |

Wave 4 is now universally reached and faced (8/8 — the unlock is no
longer the wall on this band); the wall sits past it: no pair, no ready
force, no wave-5 facing, no win. The one wave-5 unlock (56004) died at
the veterans bar, not at standing.

## Village assessment (plain words)

Eight villages, all playing with the best retreat policy yet built, all
dead before the season ends (median 87 days). Three never blood a killer
at all, though they fight the fourth draft seven to eleven times each —
the beasts come, the village swings, nothing falls. Five blood one
fighter, sometimes two, and the arithmetic is the same every time: the
killer dies at home within days, most within ten, two the very day they
blood. The fights that kill them are not ambushes out in the wilds.
They are stands at the fire, against beasts that came to the village —
the Reunion bringing the dead with it, the Audit grading the build —
while the fighter's escape route does not exist because home is where
they already are. The retreat that saves a fighter in the wild is a
door that only opens away from home; at home there is no door. One
village (56004) earns the fifth draft on paper and still never meets it,
because its killers keep dying at home faster than a second can stand
beside the first.

## Sense-testing (read, not just counted)

- 56004 days 110–112 — the cascade, in order. Day 110: "Another face
  surfaces — someone you brought, or someone who brought you. 'You
  didn't think we'd come alone?' The dead gather. (Allied monsters +4
  damage, 2 turns.)" — the Reunion's trick, naming the dead as allies.
  Then Regina's grave ritual, then Mara's exit ("BARRIER CROSSED — you
  crash through into Haven. The gate shuts behind you. The wild goes
  quiet.") — the one clean escape in the corpus — and her death the next
  day, then Olivia's, then Salman's ("Salman is gone — dead. The errand
  dies with them; nobody's waiting on those dandelions now."). The
  fiction reads as a siege of the fire itself: the same beast, or its
  kind, returning each dawn to the same node while the mantle passes
  hand to hand. Coherent, consequential, grim — and it is the mechanism
  the numbers describe: the village does not lose its killers out in
  the world. It loses them at home, one dawn at a time.
- 56001 day 60 — the wipe. "🕯️ Dmitri Sokolov is dead — the wild. The
  village stops. Somebody screams. Somebody else starts digging." Then
  the same line for Morena, then Onni, then the grave ritual three times
  over, and Tumelo — whose fallen entry says he fell in the same fight —
  speaking at the grave. The death narration is honest about the scale
  (a party wiped at home) and dishonest in exactly one place: the record
  cannot agree whether Tumelo lived. The fiction says he did (he
  speaks); the fallen says he didn't. That disagreement is the one
  loose thread in an otherwise coherent record.
- 56003 day 69 — three graves, one day. The death lines repeat the same
  ritual three times ("Somebody screams. Somebody else starts
  digging.") while the Codex pages turn for Ivy, Itsuki, Ursula in
  sequence. It reads as a village burying its bearers faster than it
  can name them — and the Reunion's "dead gather" line arriving the
  same day ties the fiction to the mechanism: the dead are the weapon.
- Terminology collision, re-confirmed (third arm to note it): the
  System voice celebrates "veteran" kills for monster-veterans while the
  readiness bar means living villager-veterans; nothing in this corpus
  changes that, and no readiness number in this file counts a
  monster-veteran kill.

## Stage 1 decision (from the addendum; the judged reasoning)

No build. (1) The killer-aware trigger is falsified on this band: its
deaths are TB-home, where the trigger holds at any threshold — proven
by the fired hold (56004 dale, s0.69/m0.763 vs an Audit) and by the no-fire deaths'
haven locations (no barrier line on any fatal death day). (2) The
alternatives were examined, not ignored: last-stand/fight-harder has no
identified gap (competent.fight already presses combat abilities once
per turn and attempts counter-tricks; the corpus carries no per-turn
fight trace showing a missing action); avoid-haven is not a defined
policy mechanism (the scholar must sleep at haven; the monsters come
there); party/ally levers belong to Loop A's live staging+rally arm;
NPC companions are engine-driven. (3) The production half is out of
reach too: 3/8 seeds never blooded a killer in 7–11 fights each — a
retreat lever cannot conjure a first killer. What would change the
decision: a per-turn fight trace showing no-fire deaths began AWAY from
haven; a haven-fight mechanism a policy can touch; or a band where first
killers die TB-wild.

## Metric review (§14 — for the NEXT run, not a re-score of this one)

- The 14d-alive primary behaved mechanically (analyzer boundary tested:
  death at +14 does not count, +15 does), but on this band it mostly
  measures the haven-death rate, not retreat quality: 4 of 5 first
  killers died at home where no threshold applies. A future killer-aware
  probe wants a band (or a trace) that first establishes fatal fights
  begin away from haven — otherwise the metric is answered before the
  sims run.
- The deadMap-vs-fallen rule matters now: one of two baseline alive-14d
  counts rests on a companion whose records disagree. The analyzer's
  rule (deadMap wins, per killerdeath) agrees with the engine's own
  readiness count here, which is the best available tie-break — but a
  future arm should add an explicit deadMap/fallen-agreement check to
  its proof test so the next such seed is flagged at analysis time,
  not at write-up time.
- The day+fighterVid join held: the one same-day multi-fire case (56003
  d69) was correctly attributed to Itsuki, not Ursula, and the
  no-fire-other-fighter label says so in the corpus. The join's known
  gap (fights rows carry no fighter vid) did not bite here.
- Baseline killer scarcity thinned the primary again (7 killers ever on
  8 seeds; 3 seeds killerless), as killerdeath's metric review warned.
  The pair metric is still the right primary (it is the bar), but the
  binding shortfall on this band is split: production (3 seeds with zero
  kills in 7–11 fights) AND haven deaths (4 of 5 first killers). A
  retention-style or trigger-style probe on a band this killer-poor
  mostly measures production and home exposure, not the lever.
- Tracker limitation carried forward from killerdeath: killer-track
  health reads the village health map, not scholar health — no scholar
  last-days health claim is made here. The Tumelo health-0 reading is
  cited only as part of the record disagreement, never as a health
  claim about his last days.

## Blanks filled or documented

- FILLED (instrument): the death-channel + trigger-coverage analyzer
  (`scripts/killerwild-analyze-20261106.js`) is committed for reuse —
  channel taxonomy (TB-wild/TB-home/field/arena/expedition/contest/
  other/unsplit-residual) and coverage taxonomy (fired-exited/
  haven-hold/died-mid-retreat/no-fire/no-tb-fight-near-death/
  npc-policy-blind), proven on fixtures + the judged corpus (20/20).
  Future arms can cite split channels + coverage instead of the
  wildbucket's single bucket.
- DOCUMENTED (finding, not a fix): first killers die at home, not in the
  wild — the killer-aware retreat trigger is falsified on this band, and
  no policy-actionable lever replaces it on this evidence. The next lever
  for the veterans bar is either second-killer PRODUCTION (3/8 seeds
  never blood one) or a haven-fight mechanism (game-code or a
  policy hook a future arm identifies with per-turn traces) — not a
  retreat threshold.
- DOCUMENTED (follow-ups, not verdicts): (1) the Tumelo record
  disagreement — a companion with a fallen 'combat' entry and health 0
  whose data dead-flag says alive, who speaks at the grave, and whom the
  engine credits as a living veteran: needs a code read of how companion
  TB deaths set vp.dead vs fallen (and whether second-wind/phoenix
  revival leaves health 0); (2) the Reunion's home siege — wave-4
  fights concentrate at haven (81/84 scholar deaths there); whether
  monsters raid haven by design or encounters trigger at the scholar's
  location needs a code read before anyone explains the haven
  concentration; (3) the no-fire mechanism — 56006 never fired the
  trigger in 12 wave-4 fights (suppressions 0): whether scholars burst
  from >=75% HP or party damage drops monsters below 75% first needs a
  per-turn fight trace.

## Infrastructure notes (loud, as required)

- EPERM flap tonight: no blocked write hit this arm's commits. The
  safe-commit index-clobber pattern (third-sighting class) hit BOTH
  commits so far (prereg efacb3243, addendum e3ecb0fab): after each
  safe-commit the main index showed the committed files
  staged-as-deleted; repaired the same way each time
  (`git update-index --add --cacheinfo` from HEAD blobs), verified
  `git status` clean (except intended untracked corpus) + `git diff HEAD`
  empty + hash-object matches before proceeding. Both commits are
  intact (verified with `git show --stat`).
- Worktree heartbeats landed promptly (07:51Z, 08:09Z). No heartbeat
  failure.
- Smoke seed 56001 reproduced byte-identical judged numbers between the
  pre-prereg smoke (71d, village-lost, 1 w4 kill, 1 haven-hold fire)
  and the judged baseline run — the driver is deterministic on this
  seed, not re-picked.
- No other run's worktree, branch, claim, or lock was touched. Loop A
  0730Z (staging+rally, finishing probe), the held flee-repair arm, and
  the main-session ability-use arm were not duplicated or rebuilt.
  Confirm band 57001–57016 stays fresh (unspent).

## Corpus

Per-seed JSON (8 files): `evidence/2026-11-06/perseed-killerwild-b/`
(`killerwild-s<seed>-killerwild-baseline.json`). Smoke corpus (2 runs,
NOT judged) was written to /tmp and deleted after the read; the proof
test's live legs likewise ran to /tmp and were removed.
