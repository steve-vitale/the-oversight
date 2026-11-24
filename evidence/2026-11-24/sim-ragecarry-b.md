# sim-ragecarry-b — stacked damage-multiplier carrier in launched parties

**Arm:** sim-ragecarry-b · **Loop B run:** fleshout-loop-b-20261124T1430Z
(adopted by the 1630Z worker after the 1430Z round timed out)
**Type:** LEVER — the damage-multiplier carrier in launched parties
(finding #2544 / fightcap-a §10 candidate (a)).
**Prereg:** `evidence/2026-11-24/sim-ragecarry-b-prereg.md` (frozen
2026-11-24 ~15:30 UTC, before any judged sim). **Branch:**
`sim-ragecarry-b`. **Base master:** `003f86c9f`.
**Implementation commit:** `e87eccf5c` (stacked carrier, env-gated).
**Proof test:** `scripts/test-ragecarry-b.js`, 63/63 GREEN before the
pilot and re-run green after the rebase (see §9).
**Pilot:** 8 seeds 107801–107808, 150d death-aware, competent verbatim
(policy sha `1884c8852d38`, matches prereg), substrate both legs
`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`.
Ctl = carrier flags unset; arm = `FIELDCAPDMG=1 RAGEFREE=1
FREESTRIKE=1`. Legs differ ONLY by env — no code revert between legs.
Corpora: `evidence/2026-11-24/perseed-ragecarry-b-{ctl,arm}/`
(8/8 seeds each, instrument errors 0 on all files).
Analysis: `evidence/2026-11-24/ragecarry-b-analysis.json` (analyzer
`--selftest` 17/17 green). Panel: `evidence/2026-11-24/ragecarry-b-panel.{json,md}`
(§15 compare, decision `review_required` — see §7).

## 1. Verdict — GO (pilot bar), with a thin-arm-pool caveat

**GO, judged ONLY on the frozen prereg bars.** Every bar passes —
but the arm pool is n=2, so the GO rests on ONE kill. The verdict
below is the pilot verdict; a 12–16 seed confirm on a fresh band is
required before landing (coordinator's call — see §8).

| Bar (frozen) | Ctl | Arm | Threshold | Pass |
|---|---|---|---|---|
| Pool floor (pair-inclusive engaged launched w4 meetings) | n=10 | n=2 | ctl n ≥ 10 | ✅ met exactly |
| Kill share (pair-inclusive) | 0.000 (0/10) | **0.500 (1/2)** | arm ≥ 0.25 | ✅ |
| Damage/round (pair-inclusive, mDealt/rounds) | 31.4 | **123.4** | arm ≥ 70 | ✅ |
| Community loss (share) | 3/8 = 0.375 | 4/8 = 0.500 | arm ≤ ctl + 0.125 | ✅ (zero margin) |
| Starvation (total / villager-only) | 4 / 4 | 2 / 2 | arm ≤ ctl + 2 | ✅ |
| Median survival | 150d | 139d (0.93×) | arm ≥ 0.8× ctl | ✅ |
| Instrument errors | 0 | 0 | 0 | ✅ |
| Mechanism: Rage-family fire on arm pair meetings | — | 2/2 = 1.00 | ≥ 0.50 | ✅ |
| Ctl carrier fires (instrument check) | 0 | — | 0 | ✅ |

The carrier, stacked (injected Rage + free action + strike ordered
first), turned the only two launched parties that reached a judged
wave-4 meeting into one kill and one hard-fought flee — at 123
damage/round, roughly four times the control rate and above the
~111/round of the winning shape fightcap-a found. The mechanism
fired on both meetings. That is what the frozen ladder calls GO.

**The caveat, stated plainly:** the arm leg delivered only 2
pair-inclusive meetings against the control's 10. The kill share
1/2 is one fight — Diana's kill on seed 107804 (see §3). A single
meeting flipping would move the share from 0.50 to 0.00 or 1.00.
The community-loss cost bar also passes with zero margin (arm 0.500
vs the 0.500 ceiling), and the §15 panel independently flags
`regression_watch` on village deaths (+4.9/run) and community loss
(+0.125). This GO is a pilot signal to confirm, not a landing
certificate.

## 2. Staged carriers per seed — BEFORE the kill-share judgement

(The bowopen lesson: verify the carrier actually stages before
judging. Counts are engine-side, over ALL wave-4+ encounters in the
seed's corpus — held = a launched holder counted as holding Rage;
fired = the injected Rage actually went off.)

| Seed | Arm encounters (w4+) | Carrier held | Carrier fired | Real-Rage fired |
|---|---|---|---|---|
| 107801 | 17 | 4 | 1 | 1 |
| 107802 | 4 | 0 | 0 | 0 |
| 107803 | 17 | 2 | 0 | 0 |
| 107804 | 20 | 5 | 2 | 2 |
| 107805 | 7 | 2 | 1 | 1 |
| 107806 | 23 | 0 | 0 | 1 |
| 107807 | 1 | 1 | 0 | 0 |
| 107808 | 25 | 3 | 1 | 1 |
| **Total** | **114** | **17** | **5** | **5** |

The carrier staged (17 held) and fired (5) on the arm leg. Ctl:
0 held, 0 fired — the instrument is clean. Seed 107802 is a clean
null: the carrier never staged there (held 0), and the ctl and arm
trajectories are byte-identical (same days, deaths, standing,
v4 counts) — the flags change nothing when nothing stages.

**All five arm carrier fires** (engine-side `carrierRage`):

| Seed/day | Fighter | Monster | Origin | Outcome | Rounds | Damage |
|---|---|---|---|---|---|---|
| 107801 d45 | Theo Lindqvist | Eulogy | expedition | vFlee | 4 | 429 |
| 107804 d48 | Diana Osei | Influencer | expedition | vFlee | 8 | 676 |
| 107804 d115 | Diana Osei | Algorithm | expedition | **vKill** | 8 | 1116 |
| 107805 d150 | Brian Otieno | Congregation | world-tick | vFlee | 1 | 58 |
| 107808 d121 | visjoin_119 | Herald | world-tick | vFlee | 10 | 285 |

Two of the five fires are in the judged pair population (d45, d115);
d48 Diana/Influencer is expedition-origin with a gate row, but the
launched party member (gen_b9rmx31) never arrived — Diana fought
with Colleen and Mason, who answered her shouts — so the frozen
corrected-arrival rule correctly excludes it from the judged
population. The two world-tick fires are visitors/wanderers, not
launched parties. One further real-Rage-only fire (arm 107806 d56,
Theo vs Eulogy, world-tick, 198 dmg, fled) and one ctl real-Rage
fire (107801 d66, 281 dmg, fled) sit outside the judged population
on both legs. Carrier-fire cut on the judged population: arm 1/2
kills; ctl 0 fires. Against freestrike-b's 0/19 on the same cut,
this is the first carrier-fire kill share above zero — on n=2.

## 3. The two judged arm meetings (transcripts read — sense test)

**The kill — 107804 d115, Diana Osei vs The Algorithm (Loud-Eyes),
8 rounds, 1116 damage, vKill.** Bow opening 29 + 31, then R1:
"Diana's eyes go red. Next 3 strikes hit twice as hard. (Rage)"
— two strikes at 93 and 95 (x2.5: Rage x2 on a Stalker opening),
a third Rage strike R2 at 93. Diana shouts, Aria charges in R2,
Mario R3; the monster dies in round 8. The fight reads coherently:
the burst does ~281 damage in the first two rounds, allies arrive
on shouts, the party finishes it. Diana holds no Rage herself
(beast_calm, lucky_rock, green_whisper, trophy_room, bloodhound,
bird_whisperer) — the Rage she fired was the injected carrier Rage.
Party: Diana (P39), Aria (P21), gen_fe7du71 (P37, holds real Rage);
min armorP 21, mean 32.3. Damage/round 139.5 — the only launched
party in this pilot to beat the ~111/round winning shape.

**The flee — 107801 d45, Theo Lindqvist vs The Eulogy, 4 rounds,
429 damage, vFlee.** Same burst shape: R1 Rage, strikes 93 / 95 /
93, 429 damage in 4 rounds (107/round), then the party runs at 529
HP remaining. The burst alone does not finish a ~960-HP monster;
the party still needs the rest of the fight, and this one ran out
of holding power. Coherent, and it bounds the claim: the carrier
makes launched parties dangerous, not invincible.

**Control contrast — 107801 d42, Emma Larsen vs The Congregation,
8 rounds, 715 damage, vFlee.** No Rage in the party's future at
all: Emma strikes 69 / 63 / 64 with a bow opening, the party holds
for 8 rounds and flees at 331 HP remaining — 89 damage/round over a
long fight, the best control meeting, and still a flee. The
control's pair damage shares average 0.147 of monster HP; the
arm's two meetings average 0.448. The gap is the burst.

**Naming quirk (noted, not chased):** the Algorithm is called
"Loud-Eyes" in Diana's log but "Big Big" in Giulia's (ctl 107808) —
display names vary per instance. No sense failure; the fights
themselves narrate consistently (shouts answered, gear absorbing,
fleeing "while running still works").

## 4. Before/after on identical seeds (pair-inclusive population)

| | Ctl (n=10) | Arm (n=2) |
|---|---|---|
| Kill share | 0.000 (0/10) | 0.500 (1/2) |
| Win share (vKill + mFlee) | 0.200 (2/10) | 0.500 (1/2) |
| Damage/round | 31.4 | 123.4 |
| Damage share of monster HP (mean) | 0.147 | 0.448 |
| Mean rounds | 3.7 | 6.0 |
| Mean damage taken | 67.2 | 57.0 |
| Mean party size | 3.0 | 3.0 |
| Mean min armorP | 13.1 | 14.0 |
| Mean abilities/member | 1.57 | 2.33 |
| Monster mix | congregation 0/3, eulogy 1/1*, audit 1/0*, network_note 0/1, editor 0/1, reunion 0/1, algorithm 0/1 | eulogy 0/1, algorithm 1/0 |

(* eulogy/audit ctl "wins" are mFlee — the monster left, not a kill.
No ctl pair meeting killed anything.)

**Trio+ population** (size ≥ 3, present, engaged — beside the
primary, never substituted): ctl 7 meetings, 0 kills, win share
0.143; arm 1 meeting, 1 kill (the same Diana fight), win share 1.0.

**Gate question:** among pair losses, gate `avoid` 0 on both legs
(ctl 8 losses: 7 null, 1 seek; arm 1 loss: null). The gate still
measures size+gear, never damage — 0 avoids across 9 losses. The
gate arm stays deferred until after a carrier GO, per the finding;
this pilot does not touch the gate.

**Funnel (why the arm pool is 2):** ctl expedition-joined
encounters 44 → pairLaunch 15 → party-absent 13 → evade-excluded
20 → 10 meetings. Arm: 10 → 8 → absent 2 → evade 5 → 2 meetings.
The arm leg had MORE raw wave-4+ encounters (114 vs 85) but far
fewer that joined to a gate row with a launched party present
(arm v4gates 28 vs ctl 66). The carrier changes fight outcomes,
which changes who lives and what gets launched — trajectories
diverge from the shared seed, and on this band the divergence
shrunk the arm's launched-meeting delivery. Seed 107806 arm is
the extreme: 23 wave-4 encounters, 0 gate rows, 0 launches
(dawnbidStarts 0) despite a companion pool of 58. The pool floor
is judged on ctl delivery by the frozen ladder, and ctl delivered
exactly 10 — but the arm's own thin delivery is the pilot's
central fragility (see §8 metric review).

## 5. Reachability verdict

- **Wave 4:** reached on 7/8 ctl seeds, 8/8 arm seeds. **Wave 5:**
  3/8 ctl, 2/8 arm. **National:** 0/8 both legs. **Table:** not
  instrumented by this driver — reported null, never faked.
  **Wins (full seat):** 0/8 both legs.
- The carrier opens the wave-4 kill door a crack (1 kill where the
  control had 0 in 10), but nothing downstream moved: no village
  reached national, none took the seat, none won. The kill did not
  convert into a veteran, a readiness release, or a wave-5 facing
  on its seed — 107804 arm died village-lost on day 126, where its
  ctl twin survived to 150. Reachability of the win is unchanged
  by this pilot; the wall is still the scale on-ramp plus the
  launch funnel, not the damage in the meeting.

## 6. Scale-wall numbers (every run)

| | Ctl | Arm |
|---|---|---|
| National | 0/8 | 0/8 |
| Table | null (not instrumented) | null |
| Wins (full seat) | 0/8 | 0/8 |
| Wave-4 unlock | 7/8 | 8/8 |
| Wave-5 unlock | 3/8 | 2/8 |
| Median survival | 150d | 139d |
| Village-lost | 3/8 (d107, d95, d69) | 4/8 (d124, d95, d128, d126) |
| Total village deaths | 701 | 740 |
| Starvation deaths (total / villager) | 4 / 4 | 2 / 2 |
| Max standing (any seed) | 570 (107807) | 570 (107807) |

The standing-199 stall is visible on both legs: seeds 107803,
107805, 107808 sit at exactly 199 on both legs (107804 arm: 350;
107801 ctl: 385) — the readiness-5 door held at 199 while the
village survived to day 150. No seed on either leg reached national
(all 16 scaleRank regional).

## 7. Village assessment (plain words)

Eight villages, eight stories that mostly rhyme. Three control
villages and four arm villages were lost before day 150 — eaten by
the same slow grind: too many deaths (48–131 per village), empty
pantries at the end (five of eight arm villages ended at 0 kcal),
and wave-4 monsters that the village could meet but not kill. The
survivors are not thriving: they sit at standing 199, regional,
alive but stalled, with the wave-5 door still shut.

The one village that broke the pattern, briefly, was 107804 arm.
Diana's party killed an Algorithm on day 115 — the first launched
wave-4 kill this arm has ever produced — and then the village
still died on day 126, eleven days later, village-lost. A kill is
not a rescue. The carrier gives a launched party a real punch, but
one punch in 150 days does not change a village's fate; the village
still starves, still loses people faster than it replaces them,
and still never reaches national.

What the villages looked like, concretely: parties launch
under-geared more often than not (min armorP 8–12 on several
control meetings vs the wave-4 readiness demand of P≥10 for three
fighters — met on paper, thin in practice); fighters strike for
13–26 damage against 850–1500 HP monsters, so a fight is a
four-round countdown to fleeing; villagers do act like people in
the fights — they shout, allies charge in, they bind wounds
mid-fight, they argue theology with the Congregation and recite
poems at the Reunion, they run "while running still works" — the
sense-test reads true. What is missing is not courage but damage
and launches: the carrier fixes the first only when it stages
(17 held of 114 encounters), and nothing in this arm fixes the
second (arm launches collapsed to 2 judged meetings).

## 8. Blanks filled / documented, and metric review

**Filled:** the stacked carrier is built, proof-tested (63/63),
and measured on the fightcap population for the first time — the
first powered carrier measurement on the sense substrate. The
mechanism is proven to fire in real launched meetings (5 fires,
2 in the judged population) and to produce the first launched
wave-4 kill on this population at 139.5 damage/round.

**Documented (not fixed here):**
- The arm's launched-meeting delivery collapsed (2 vs 10) — the
  launch funnel, not damage, is now the binding constraint on
  measuring (and on winning). Next arm per the prereg: the damage
  question carriersetup-b named is answered in the meeting; the
  open question is launch delivery.
- The gate still never avoids (0/9 losses) — the damage-proxy
  gate arm remains the named next step after a carrier GO.
- Community loss sits exactly on the cost bar (0.500 vs 0.500
  ceiling) and the panel flags regression_watch on deaths and
  community loss — the carrier's extra fighting may cost lives
  even as it wins one fight. A confirm must watch this, not just
  the kill share.
- Display-name variance for the Algorithm ("Loud-Eyes" vs "Big
  Big") — cosmetic, noted only.

**Metric review (frozen bars NOT re-scored; proposal for the NEXT
run):** the pool floor is judged on ctl delivery only, and ctl
delivered exactly 10 — but the arm's own pool (n=2) makes the
kill-share estimate a coin flip on one fight. The ladder as frozen
returns GO on 1/2, which overstates what a pilot with an arm n=2
has proven. Proposed revision: a GO additionally requires an
arm pair pool n ≥ 5; below that, the verdict is GO-THIN-ARM
(mechanism proven, kill share unproven) and a confirm on a fresh
12–16 seed band is mandatory before landing. Also proposed: the
community-loss bar's zero-margin pass should be reported as a
watch item in the verdict line, not only in the cost table. The
confirm, if run, should use a fresh band (107801–107808 is spent)
and pre-register the same bars plus the arm-pool floor.

## 9. Method note

- Adoption: the 1430Z round's worker built the stack and the
  instruments and timed out before the pilot; the 1630Z worker
  (this run) verified the tree (HEAD `ebf52fdab`, prereg only),
  deleted the two smoke `.tmp` dirs (never persisted, not judged
  data), re-ran the proof test green (63/63), committed the
  implementation + scripts as `e87eccf5c` (safe-commit with
  coordinator-approved `--force-delete` for the `fieldFights.js`
  104-line deletion — the documented villager-strike closure
  extraction, content preserved), repaired the safe-commit index
  clobber (files staged-as-deleted after a correct commit; repaired
  via `git ls-tree HEAD -r | git update-index --add --index-info`,
  verified with completed `git status --short` + empty
  `git diff HEAD`), then ran the pilot.
- `docs/ONTOLOGY.md` was 0-byte flap debris in this tree; the
  coordinator restored it from HEAD before adoption. Verified no
  ONTOLOGY.md diff before committing; none committed.
- Heartbeats landed 16:43:53Z and 16:44:56Z (registry lock slow
  today; second attempt fast).
- Rebase: rebased onto master tip at closeout (see §10); proof
  test re-run green on the rebased tip.
- Panel compare: `node scripts/balance-panel.js compare`
  decision `review_required` (exit 2 is the tool's signal for a
  non-clean decision, not a failure). Intervention flags
  FIELDCAPDMG, RAGEFREE, FREESTRIKE declared. The panel is the
  instrument; the frozen prereg bars are the judge. Panel deltas:
  village deaths/run +4.875 (regression_watch), community loss
  +0.125 (regression_watch), national 0→0, wins 0→0.
- Telemetry deviation check: `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-24/perseed-ragecarry-b-{ctl,arm}/*.json'
  --metrics national,table,wins,exiled` — the tool refuses
  recorder-corpus input by default; with `--allow-recorder-corpus`
  it fires LOUD "national/table/wins disappeared" (baseline 12/16/16
  → current 0/8) on BOTH legs. That is the documented regime
  artifact, not a deviation: the baseline's own `_regime` note says
  "DO NOT compare pre-seat / courtship / readiness substrates
  against this baseline — wins are structurally ~0 there and
  telemetry-check will fire a spurious LOUD 'wins disappeared'."
  This pilot runs on the readiness substrate; national 0/8 and wins
  0/8 on both legs is the scale wall, unchanged between legs. No
  same-run investigation item: the before/after contrast is carried
  by the §15 panel (§7), which is the correct instrument here.

## 10. Closeout state

- Branch `sim-ragecarry-b`, implementation commit `2f4ac597d`
  (pre-rebase `e87eccf5c`, content identical), evidence + corpus
  commit `2411fbc57` (pre-rebase `61f9ade19`), on master tip
  `8616c6b2f`. Rebase hit the documented stop-at-pick quirk on the
  implementation pick (appeared in both done and todo lists, tree
  clean, pick unapplied — verified with `git diff <pick>`); recovered
  with `git rebase --continue` per AGENTS.md; all three commits
  landed exactly once.
- Worktree contains ONLY committed work at closeout
  (`git status --short` empty on a completed run).
- Proof test green on the rebased tip (63/63). **Ready to merge,
  pending ship.** Do NOT push, do NOT bump versions — the ship
  loop owns deploys.
- Verdict for the coordinator: **GO (pilot bar) — confirm on a
  fresh 12–16 seed band before landing** (arm pool n=2; see §1, §8).
