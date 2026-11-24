# sim-ragecarry-b — CONFIRM (12-seed fresh band)

**Arm:** sim-ragecarry-b · **Loop B run:** fleshout-loop-b-20261124T1630Z
(confirm worker; pilot ran under fleshout-loop-b-20261124T1430Z,
adopted by the 1630Z worker).
**Type:** LEVER — the damage-multiplier carrier in launched parties
(finding #2544 / fightcap-a §10 candidate (a)).
**Prereg (frozen):** `evidence/2026-11-24/sim-ragecarry-b-prereg.md`
(frozen 2026-11-24 ~15:30 UTC, before any judged sim). **Pilot
evidence:** `evidence/2026-11-24/sim-ragecarry-b.md` — GO on the
frozen bars, BUT arm pool n=2 (kill share 1/2 on ONE kill, Diana vs
The Algorithm, seed 107804), damage/round arm 123.4 vs ctl 31.4,
mechanism 2/2, cost bars pass with ZERO margin on community loss
(0.500 vs 0.500 ceiling), §15 panel `review_required` (village
deaths +4.9/run, community loss +0.125, `regression_watch`).
**Branch:** `sim-ragecarry-b`. **Base master at confirm start:**
`095bd33c3` (sibling tbrefuse arm landed while the confirm ran;
see §9).
**Implementation commit:** `2f4ac597d` (stacked carrier, env-gated).
**Proof test:** `scripts/test-ragecarry-b.js`, 63/63 GREEN on the
pilot tip; re-run green after the confirm rebase (see §9).
**Confirm:** 12 seeds 107901–107912, 150d death-aware, competent
verbatim (policy sha `1884c8852d38`, matches prereg), substrate
both legs `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
FIGHTALLY2=1`. Ctl = carrier flags unset; arm =
`FIELDCAPDMG=1 RAGEFREE=1 FREESTRIKE=1`. Legs differ ONLY by env —
no code revert between legs. Corpora:
`evidence/2026-11-24/perseed-ragecarry-b-confirm-{ctl,arm}/`
(12/12 seeds each, instrument errors 0 on all files).
Analysis: `evidence/2026-11-24/ragecarry-b-confirm-analysis.json`
(analyzer `--selftest` 17/17 green). Panel:
`evidence/2026-11-24/ragecarry-b-confirm-panel.{json,md}`
(§15 compare, decision `review_required` — see §7).

## 0. Confirm band freshness check (skill local_seed_band_freshness)

**Chosen band: 107901–107912 (12 seeds).** Checked 2026-11-24
~17:30 UTC, before any confirm sim:

- `git grep -l -E "10790[1-9]|10791[0-2]" -- 'evidence/*/sim-*.md'` —
  0 hits (exit 1). Covers every dated sim note + prereg.
- `git grep -l -E "1079[0-9][0-9]" -- 'evidence/*/sim-*.md'` — 0
  hits: no 1079xx seed is named in any sim note at all.
- `git grep -l -E "10790[1-9]|10791[0-2]" -- 'evidence/*/sim-*-prereg.md'`
  — 0 hits.
- `git grep -l -E "10790[1-9]|10791[0-2]" -- 'evidence/*.md'
  'evidence/*/*.md'` — 0 files listed.
- Goal `hidden_files/*.md` grep for the candidate seeds — 0 hits.
- `scripts/` grep for `10790|10791` — 0 hits.
- Non-perseed `evidence/` git grep found only non-seed substrings:
  `pantryFreshAfter: 107911` (a pantry kcal value in an Oct 16
  census JSON) and `fd` float fragments — not seed reservations.
- Collisions recorded so the next worker does not repeat them:
  pilot band 107801–107808 (spent); 107401–107408 (launchfield);
  1075xx, 1076xx, 1073xx heavily named in preregs; 106151–106158
  (designated holder-rich band, deliberately not used — see prereg).
- Two unscoped filesystem greps over all of `evidence/` were
  abandoned (one killed after ~5 min, one killed after the service
  restarted mid-run): they were chewing through the giant per-seed
  JSON corpora, which are data, not reservations. The scoped
  `git grep` checks above cover the skill's required scope
  (preregs, screens, extension bands, forbidden/contaminated
  lists) and all returned zero hits.
- No standalone forbidden-band list file exists in goal
  `hidden_files/` (checked by name: no `band`/`forbid`/`seed`
  list file; only per-run logs).

**Result: band 107901–107912 is FRESH — unused across all prior
preregs, sim notes, forbidden/contaminated lists, hidden files,
and scripts.**

## 1. Verdict — NO-GO (powered, not thin-pool)

**NO-GO, judged ONLY on the frozen prereg bars.** The pool floor
is met on BOTH legs this time (ctl n=13, arm n=12), the mechanism
fires on 10/12 arm meetings — and the arm still kills nothing.
The pilot's GO does NOT survive the powered band. This is a
capability NO-GO, not a staging null and not a thin pool: the
carrier stages, fires, and does not turn launched parties into
winners.

| Bar (frozen) | Ctl | Arm | Threshold | Pass |
|---|---|---|---|---|
| Pool floor (pair-inclusive engaged launched w4 meetings) | n=13 | n=12 | ctl n ≥ 10 | ✅ met |
| Kill share (pair-inclusive) | 0.077 (1/13) | **0.000 (0/12)** | arm ≥ 0.25 | ❌ |
| Damage/round (pair-inclusive, mDealt/rounds) | 47.8 | **51.3** | arm ≥ 70 | ❌ |
| Community loss (share) | 7/12 = 0.583 | 7/12 = 0.583 | arm ≤ ctl + 0.125 | ✅ (margin 0.125 — full) |
| Starvation (total / villager-only) | 3 / 2 | 4 / 2 | arm ≤ ctl + 2 | ✅ (margin 1 total, 2 villager) |
| Median survival | 130.5d | 148d (1.13×) | arm ≥ 0.8× ctl | ✅ |
| Instrument errors | 0 | 0 | 0 | ✅ |
| Mechanism: Rage-family fire on arm pair meetings | — | 10/12 = 0.83 | ≥ 0.50 | ✅ |
| Ctl carrier fires (instrument check) | 0 | — | 0 | ✅ |

**Arm pool n = 12** (vs the pilot's n=2). The pilot's
metric-review proposal (an arm-pool floor n ≥ 5 for GO) is moot
here — the arm pool is healthy, and the verdict is NO-GO on the
frozen bars regardless. The coordinator's landing decision is
straightforward: do not land; the carrier family is exhausted as
a kill-share lever on this evidence (see §8).

**What changed vs the pilot:** the pilot's 123.4 damage/round
was two meetings, one of them Diana's 139.5/round kill. On a
powered band the arm's damage/round is 51.3 — barely above the
control's 47.8 and far below the 70 bar, let alone the ~111 of
the winning shape. The carrier doubles strikes, but on this band
the launched fighters' base strikes are ~12–19 damage, so a
doubled strike is ~30–38. Doubling a weak strike does not make a
strong party. The one control kill (Valeria, §3) came from a
fighter striking 144–150/round with no Rage at all — base damage,
not the multiplier, is what kills wave-4 monsters.

**Cost bars, margins stated exactly:** community loss arm share
0.583 vs the 0.708 ceiling (ctl 0.583 + 0.125) — margin 0.125,
the full allowance, a comfortable pass (the pilot's zero-margin
pass is gone). Starvation arm 4 vs ceiling 5 (margin 1 total),
villager-only 2 vs ceiling 4 (margin 2). Median survival arm
148d vs the 104.4d floor (0.8 × 130.5) — passes by 43.6 days.
The §15 panel agrees: village deaths/run −3.6
(`no_material_signal`), community loss delta 0
(`no_material_signal`) — the pilot's `regression_watch` flags
are gone. The carrier costs nothing measurable on this band; it
just does not win fights.

## 2. Staged carriers per seed — BEFORE the kill-share judgement

(The bowopen lesson: verify the carrier actually stages before
judging. Counts are engine-side, over ALL wave-4+ encounters in
the seed's corpus — held = a launched holder counted as holding
Rage; fired = the injected Rage actually went off.)

| Seed | Arm encounters (w4+) | Carrier held | Carrier fired | Real-Rage fired |
|---|---|---|---|---|
| 107901 | 24 | 2 | 0 | 0 |
| 107902 | 11 | 1 | 0 | 0 |
| 107903 | 10 | 6 | 3 | 5 |
| 107904 | 15 | 1 | 1 | 1 |
| 107905 | 25 | 4 | 3 | 4 |
| 107906 | 0 | 0 | 0 | 0 |
| 107907 | 12 | 0 | 0 | 0 |
| 107908 | 7 | 0 | 0 | 0 |
| 107909 | 24 | 0 | 0 | 0 |
| 107910 | 17 | 2 | 1 | 1 |
| 107911 | 11 | 2 | 1 | 2 |
| 107912 | 31 | 1 | 1 | 1 |
| **Total** | **187** | **19** | **10** | **14** |

The carrier staged (19 held) and fired (10) on the arm leg.
Ctl: 0 held, 0 fired, 5 real-Rage fires — the instrument is
clean. Seed 107906 is a clean null on both legs: the village
died on day 60 with 0 wave-4 encounters, and ctl/arm
trajectories are byte-identical (same days, deaths, standing) —
the flags change nothing when nothing stages. Seeds 107907,
107908, 107909 never staged the carrier either (held 0) despite
12/7/24 encounters — the launch funnel, not the carrier, gates
staging there.

**All ten arm carrier fires** (engine-side `carrierRage`):

| Seed/day | Fighter | Monster | Origin | Outcome | Rounds | Damage |
|---|---|---|---|---|---|---|
| 107903 d41 | Elif Demir | Eater | expedition | vFlee | 8 | 623 |
| 107903 d124 | Ruby Callaghan | Reunion | expedition | vFlee | 8 | 531 |
| 107904 d124 | app_mgpspki5423 | Reunion | expedition | vDie | 4 | 91 |
| 107905 d119 | Stan Kowalski | Eulogy | expedition | vFlee | 4 | 419 |
| 107905 d121 | Stan Kowalski | Eater | expedition | vFlee | 2 | 192 |
| 107910 d77 | gen_3udg2xv | Eulogy | expedition | vFlee | 4 | 261 |
| 107912 d103 | app_mgpsphr5150 | Eulogy | expedition | vFlee | 4 | 168 |
| (+3 fires outside the judged pair population — see below) | | | | | | |

Seven of the ten fires are in the judged pair population (the
table above); the other three are world-tick/visitor fires
outside it. Carrier-fire cut on the judged population: arm 0/7
kills. Real-Rage-only fires on pair meetings: 3 more (107903
d36, d39; 107905 d47), also 0 kills. Rage-family fire cut on the
judged population: 0/10 kills. Against freestrike-b's 0/19 and
the pilot's 1/2, the powered reading is 0/10 — the mechanism
fires and the fights are still lost.

## 3. The judged meetings (transcripts read — sense test)

**The best arm meeting — 107903 d41, Elif Demir vs The Eater,
8 rounds, 623 damage, vFlee.** R1: "Elif's eyes go red. Next 3
strikes hit twice as hard. (Rage)" — three doubled strikes at
30 / 35 / 38 (x2.5: Rage x2 on a Stalker opening), then normal
strikes of 19–48 as Carlos and Miriam charge in on her shouts,
field medicine mid-fight (+20 HP), and the party flees after 8
rounds with the monster at ~375 HP. The burst is real (~103
damage in round 1) but the sustained rate is 77.9/round and the
monster has 998 HP. The carrier lifts the opening, not the
fight. Elif's base strike is ~12 — doubled is 30. Coherent, and
it bounds the claim precisely: the carrier doubles what the
fighter already has, and what launched fighters have is not
enough.

**The control kill — 107901 d96, Valeria Quispe vs The
Algorithm, 8 rounds, 1245 damage, vKill.** NO Rage in the party
at all: Valeria strikes for 150 / 144 / 145 / 145 / 146 —
"stalker's opening +4", "blood trail +2" — while Desmond and
Hassan charge in on her shouts. 155.6 damage/round from one
fighter. This is the only kill on either leg of the confirm, and
it needed no carrier: a naturally strong fighter with a bow
opening and ~145-damage strikes. It also shows what the arm leg
never got — no arm meeting had a fighter striking above ~48
after the burst. Kill share on this band is fighter-dependent,
and the carrier cannot manufacture a strong fighter.

**The one-round death — 107902 d66, Alberto vs The Suburb,
1 round, 0 damage, vDie.** "Alberto walks straight into The
Suburb. No avoiding it. Alberto has Sling but no stones — the
pouch hangs empty. Alberto's gear absorbs 14. R1: HOA Fine hits
Alberto for 14 (0 left)." Alberto entered a wave-4 fight at ~14
HP with an unloaded sling and died to the first hit. Coherent as
tragedy, and it flags the launch side, not the carrier: parties
launch members who are nearly dead (see §8). The arm lost 4
pair meetings outright (vDie) vs the control's 1 — two of the
four arm deaths had a Rage-family fire (107903 d36 real Rage,
107904 d124 carrier). The cost bars still pass (community loss
equal, median survival better on arm), so this is a watch item,
not a verdict-changer: the burst may keep parties in losing
fights a round longer, but it does not cost villages.

**Naming quirk (noted, not chased):** the pilot's Algorithm
display-name variance ("Loud-Eyes" vs "Big Big") did not recur
in the confirm transcripts read.

## 4. Before/after on identical seeds (pair-inclusive population)

| | Ctl (n=13) | Arm (n=12) |
|---|---|---|
| Kill share | 0.077 (1/13) | 0.000 (0/12) |
| Win share (vKill + mFlee) | 0.077 (1/13) | 0.000 (0/12) |
| Damage/round | 47.8 | 51.3 |
| Damage share of monster HP (mean) | 0.159 | 0.223 |
| Mean rounds | 5.0 | 4.25 |
| Mean damage taken | 59.9 | 55.4 |
| Mean party size | 3.0 | 3.0 |
| Mean min armorP | ~21.1* | ~13.8* |
| Mean abilities/member | ~1.5* | ~1.9* |
| Monster mix (win/loss) | algorithm 1/0, reunion 0/3, network_note 0/2, editor 0/1, eater 0/1, rerun 0/1, strike 0/1, influencer 0/1, congregation 0/1, suburb 0/1 | suburb 0/2, congregation 0/1, eater 0/3, reunion 0/3, eulogy 0/3 |

(* min armorP / abilities means computed from the by-outcome
decomposition: ctl vDie 24 / vKill 17 / vFlee 21.2; arm vDie
10.5 / vFlee 15.5. The arm's dying parties were the worst-geared
— three of the four arm vDie meetings had min armorP 7.)

**Trio+ population** (size ≥ 3, present, engaged — beside the
primary, never substituted): ctl 7 meetings, 1 kill (the same
Valeria fight), win share 0.143, damage share 0.236; arm 4
meetings, 0 kills, win share 0.0, damage share 0.211.

**Gate question:** among pair losses, gate `avoid` 0 on both
legs (ctl 12 losses: 11 null, 1 seek; arm 12 losses: all null).
The gate still measures size+gear, never damage — 0 avoids
across 24 losses. The gate arm stays the named next step after a
carrier GO, per the finding; there is no carrier GO, so the gate
arm's premise (a damage proxy worth demanding) is unproven too.

**Funnel (why the pools are what they are):** ctl
expedition-joined encounters 37 → pairLaunch 21 (trio cut: 7
meetings) → party-absent 5 → evade-excluded 16 → 13 meetings.
Arm: 37 → 27 → absent 2 → evade 19 → 12 meetings. Unlike the
pilot, the arm leg delivered a healthy pool this time (12 vs
13) — the pilot's collapse did not recur, which is exactly why
this NO-GO is powered rather than thin-pool. Seed 107906
contributed nothing on either leg (village dead day 60, 0
wave-4 encounters).

## 5. Reachability verdict

- **Wave 4:** reached on 12/12 ctl seeds, 12/12 arm seeds.
  **Wave 5:** 4/12 ctl, 2/12 arm. **National:** 0/12 both legs.
  **Table:** not instrumented by this driver — reported null,
  never faked. **Wins (full seat):** 0/12 both legs.
- The carrier opens nothing downstream: no village reached
  national, none took the seat, none won, on either leg. The
  control leg's single kill did not convert into a veteran, a
  readiness release, or a wave-5 facing on its seed either —
  107901 ctl survived to 150 at standing 370, regional.
  Reachability of the win is unchanged by this confirm; the wall
  is still the scale on-ramp plus base fighter damage, not the
  multiplier in the meeting.

## 6. Scale-wall numbers (every run)

| | Ctl | Arm |
|---|---|---|
| National | 0/12 | 0/12 |
| Table | null (not instrumented) | null |
| Wins (full seat) | 0/12 | 0/12 |
| Wave-4 unlock | 12/12 | 12/12 |
| Wave-5 unlock | 4/12 | 2/12 |
| Median survival | 130.5d | 148d |
| Village-lost | 7/12 | 7/12 |
| Total village deaths | 1143 | 1100 |
| Starvation deaths (total / villager) | 3 / 2 | 4 / 2 |
| Max standing (any seed) | 520 (107909) | 600 (107909) |

The standing-199 stall is visible on both legs again: seeds
107904, 107905, 107910, 107912 sit at exactly 199 on the
control leg; 107903, 107904, 107905, 107910, 107912 on the arm
leg. No seed on either leg reached national (all 24
scaleRank regional except one village-rank ctl seed, 107906).

## 7. Village assessment (plain words)

Twelve villages a side, and the stories rhyme again: seven of
twelve villages lost on each leg, eaten by the same slow grind —
too many deaths (48–150 per village), empty pantries at the end
(seven of twelve arm villages ended at 0 kcal), and wave-4
monsters the village could meet but not kill. The survivors sit
at standing 199, regional, alive but stalled, with the wave-5
door still shut.

The carrier changed the shape of the fights without changing
their endings. Parties now open with red eyes and doubled
strikes — and then settle back to 19–48 damage a round against
monsters with a thousand hit points, and run. One control
village showed what actually kills a wave-4 monster: a single
fighter hitting for 145 a round, no magic needed. The arm's
parties never had that fighter. Villagers still act like people
in the fights — they shout, allies charge in, they bind wounds
mid-fight, they walk into hopeless fights with empty slings —
the sense-test reads true. What is missing is not courage or a
multiplier but base damage and launches: the carrier fixes
neither, and nothing in this arm fixes the second (three seeds
never staged the carrier at all).

## 8. Blanks filled / documented, and metric review

**Filled:** the stacked carrier is now measured on a powered
band — the first powered carrier measurement on the sense
substrate, with a healthy arm pool (n=12). The mechanism is
proven to fire in real launched meetings (10 carrier fires, 7
in the judged population, Rage-family fire on 10/12 meetings)
and proven NOT to turn launched parties into winners (0/12
kills, 51.3 damage/round). Per the prereg, if this arm NO-GOs,
the carrier family is exhausted as a kill-share lever — that
condition is now met, on a powered band.

**Documented (not fixed here):**
- Base fighter damage is the binding constraint in the meeting,
  not the multiplier: doubled ~12-damage strikes are ~30. The
  next arm per the prereg is the damage question
  carriersetup-b named (what lifts a launched party from
  ~38–51/round toward ~111) — the carrier half is answered;
  the damage half is now the open question, and it is a
  fighter-strength question, not a multiplier question.
- The gate still never avoids (0/24 losses) — the damage-proxy
  gate arm's premise (a damage proxy worth demanding) is
  unproven while no lever has produced the damage.
- Arm pair vDie 4/12 vs ctl 1/13 — watch item (see §3); cost
  bars still pass, median survival favors the arm.
- Launch fitness: parties launch members at ~14 HP with
  unloaded weapons (Alberto, 107902 d66). A launch-side
  fitness check is a candidate arm, separate from damage.
- The pilot's zero-margin community-loss pass is resolved: the
  confirm passes with the full 0.125 margin and the panel's
  `regression_watch` flags are gone.

**Metric review (frozen bars NOT re-scored; proposal for the NEXT
run):** the bars held up well on a powered band — the pool floor
(ctl n ≥ 10) was met with room (13), the mechanism check (0.83)
cleanly separated a working mechanism from a failed outcome, and
the arm pool (n=12) made the kill-share estimate meaningful
(0/12 is a real zero, not a coin flip). The pilot's proposed
arm-pool floor (n ≥ 5 for GO) is now moot as a verdict-changer
here, but it remains a sound standing rule for future pilots:
no GO should rest on an arm pool below 5. One refinement
proposed: the damage/round bar (≥70) is a mean over meetings,
and a single strong-fighter meeting can lift it while the
typical meeting stays weak — a future arm should report the
median meeting damage/round beside the mean. No re-scoring was
done; the verdict stands on the frozen bars.

## 9. Method note

- Adoption: the pilot (1430Z) built the stack and instruments;
  the 1630Z worker ran the pilot; this confirm worker ran the
  12-seed confirm on the same frozen bars and the same code.
  DO NOT modify src/js — the implementation is already
  committed; this run is the confirm only.
- Heartbeats landed 17:25:22Z and 17:36:21Z (registry lock slow
  today; first attempt landed on retry per the task brief).
- Legs: ctl ~8.3 min, arm ~4.8 min (150d, death-aware, 12 seeds
  each). Both exit 0, 12/12 files, instrument errors 0.
- Panel compare: `node scripts/balance-panel.js compare`
  decision `review_required` (exit 0; the pilot recorded exit 2
  as the tool's signal for a non-clean decision — this run's
  exit was 0 with `review_required` on stdout). Intervention
  flags FIELDCAPDMG, RAGEFREE, FREESTRIKE declared. The panel
  is the instrument; the frozen prereg bars are the judge.
  Panel deltas: village deaths/run −3.5833
  (`no_material_signal`), deaths/100d +1.921
  (`regression_watch`), community loss 0.0
  (`no_material_signal`), national 0→0, wins 0→0.
- Telemetry deviation check: `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-24/perseed-ragecarry-b-confirm-<leg>/*.json'
  --metrics national,table,wins,exiled --allow-recorder-corpus`
  (run per leg; the tool's glob supports `*` in the basename
  only, so the brace form fails with ENOENT scandir) — fires
  LOUD "national/table/wins disappeared" (baseline 12/16/16 →
  current 0/12) on BOTH legs. That is the documented regime
  artifact, not a deviation: the baseline's own `_regime` note
  says "DO NOT compare pre-seat / courtship / readiness
  substrates against this baseline — wins are structurally ~0
  there and telemetry-check will fire a spurious LOUD 'wins
  disappeared'." This confirm runs on the readiness substrate;
  national 0/12 and wins 0/12 on both legs is the scale wall,
  unchanged between legs. No same-run investigation item: the
  before/after contrast is carried by the §15 panel (§7), which
  is the correct instrument here.
- Rebase: rebased cleanly onto master tip `83b4e2a82` at closeout
  (Loop A bowopen-recheck-a evidence; no stop-at-pick quirk this
  time — all 5 picks applied in one pass). Post-rebase hashes:
  prereg `c631bd523`, implementation `bd389459d`, pilot evidence
  `b41d15d3f`, closeout `4f575def8`, confirm evidence `822ecbdbb`.
  Proof test re-run green on the rebased tip (63/63, see §10).

## 10. Closeout state

- Branch `sim-ragecarry-b`, HEAD `822ecbdbb` (confirm evidence;
  pre-rebase `b2fa6aec3`), on master tip `83b4e2a82`. All 5
  commits landed exactly once after the rebase (see §9 for the
  post-rebase hashes).
- Worktree contains ONLY committed work at closeout
  (`git status --short` empty on a completed run, `git diff HEAD`
  empty).
- Proof test green on the rebased tip (63/63).
- **Ready to merge, pending ship.** Do NOT push, do NOT bump
  versions — the ship loop owns deploys.
- Verdict for the coordinator: **NO-GO (powered)** — do not land
  the stacked carrier. The carrier family is exhausted as a
  kill-share lever on this evidence; the next arm is the damage
  question (base fighter damage), not another carrier variant.
  The pilot's GO is overturned by the confirm.
