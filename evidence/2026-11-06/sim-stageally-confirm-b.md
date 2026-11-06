# sim-stageally-confirm-b — stageally GO confirm on a fresh band: NO-GO

**Arm:** sim-stageally-confirm-b (run fleshout-loop-b-20261106T0930Z, axis
scale-onramp / winnability chain) · **Confirm duty: re-run Loop A's landed
stageally GO on a fresh reserved band on current master.** Policy-only
measurement, zero edits to the policy, zero src/js, no gate/price/deed
change.
**Verdict: NO-GO** — by the preregged bar (same bar as the 0615Z prereg):
living-pair seeds armed 0/8 (bar ≥ 1) and post-first-blood wave-4 kills
armed 1 (bar ≥ 3); baseline post-blood kills 4 — the baseline beat the
armed leg on the alternative route. Guard holds (armed median survival
111.5d vs baseline 108d, +3.5d). THIN checks clear first (T1 rally fires
27 ≥ 8; T2 ally presence 73.0% ≥ 40% with 37 fights) — the lever engaged
and still missed. This is a real NO-GO, not an unmeasured lever.
**Band:** 53001–53008 (8 seeds, re-verified fresh — see prereg) ·
**Horizon:** 150d death-aware · **Legs:** competent-verbatim baseline vs
staged on identical seeds · **Corpus:**
`evidence/2026-11-06/perseed-stageally-confirm-b/` (16 files) · **Prereg:**
`evidence/2026-11-06/sim-stageally-confirm-b-prereg.md` (committed before
any judged sim, 2ff11cbf) · **Proof:**
`scripts/test-stageally-20261106.js` 45/45 green on this worktree.

**The one-line result, plainly:** the staging mechanism reproduces — the
scholar walks into wave-4 fights with friends beside them far more often
(allies present 44% → 73% of wave-4 turn-based fights, party present 9% →
57%, 36 invites, 18 accepted, party-days with two members 16 → 141) — but
the kills do not. The armed leg killed FEWER wave-4 monsters than the
baseline (3 vs 9), won fewer turn-based fights (3 vs 8), and the scholar
died in more of them (survived 13.5% vs 29.4%). The pilot's GO rested on
one seed, 55007; on a fresh band there is no 55007. The pooled n=16 still
reads GO — but only because the pilot's one seed carries it (see below).
Read the verdict as "the lever's company reproduces; its kill effect does
not."

## Before / after (identical seeds, 8 + 8)

| Metric | Baseline | Armed | Change |
|---|---|---|---|
| Wave-4 kills | 9 | 3 | ×0.33 (kill rate 16.7% → 4.8% of w4 fights) |
| Wave-4 fights (all) / TB fights | 54 / 34 | 63 / 37 | more fights reached, more TB |
| Ally presence in w4 TB fights | 44.1% (15/34) | 73.0% (27/37) | +28.9 pts — the mechanism, moved |
| Party presence in w4 TB fights | 8.8% (3/34) | 56.8% (21/37) | the staged party is in the fight |
| TB survival, fight level (scholar lives) | 29.4% (10/34) | 13.5% (5/37) | WORSE with company |
| TB outcomes (won / lost / routed / unfinished) | 8 / 24 / 1 / 1 | 3 / 32 / 1 / 1 | |
| Rally fires (ok) | 0 | 27 (27) | rally half fully measured — T1 clear |
| Post-first-blood w4 kills (rate) | 4 / 31 (12.9%) | 1 / 19 (5.3%) | second-killer production, DOWN |
| Living pair (≥1 day, 2 living w4 killers) | 0 seeds | 0 seeds | GO route 1 missed |
| First-killer survival, median | 9d | 9.5d | no movement toward the 19d bar |
| Party days (≥1 / ≥2 members) | 130 / 16 | 320 / 141 | |
| Invites attempted / accepted / declined / not-offered | — | 36 / 18 / 13 / 5 | 50% accept; 13 questions answered in sittings |
| Median survival (guard) | 108d | 111.5d | +3.5d — guard holds |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | no win either leg |
| Wave 4 unlocks / faced | 6 / 6 | 6 / 6 | |
| Wave 5 unlocks / faced / kills | 0 / 0 / 0 | 0 / 0 / 0 | the door never opened |
| Readiness-5-ready days | 0 | 0 | |
| Instrument errors | 0 | 0 | |

## Per-seed table

| Seed | Baseline (days, end, w4k) | Armed (days, end, w4k) | Armed rally | Armed invites acc. | Armed party-days ≥2 |
|---|---|---|---|---|---|
| 53001 | 75, lost, 0 | 51, lost, 0 | 6 | 2 / 2 | 4 |
| 53002 | 150, survived, 1 | 150, survived, 0 | 2 | 5 / 13 | 24 |
| 53003 | 111, lost, 0 | 111, lost, 0 | 0 | 0 / 0 | 0 |
| 53004 | 105, lost, 2 | 150, survived, 1 | 7 | 2 / 3 | 22 |
| 53005 | 122, lost, 1 | 90, lost, 0 | 3 | 3 / 4 | 11 |
| 53006 | 105, lost, 3 | 150, survived, 2 | 5 | 4 / 8 | 70 |
| 53007 | 38, lost, 0 | 38, lost, 0 | 0 | 0 / 0 | 0 |
| 53008 | 132, lost, 2 | 112, lost, 0 | 4 | 2 / 6 | 10 |

Notes on the table: 53003 never reached wave 4 on either leg (maxWave 3
both); 53007 died day 38 on both legs (maxWave 3, standing 0) — two seeds
never test the lever at all. 53002, 53005, and 53008 went BACKWARDS on
kills armed vs baseline (1→0, 1→0, 2→0) despite rallies firing and parties
formed; 53006 went backwards too on the count that matters (3→2) while
surviving longer. Only 53004's armed leg outlived its baseline on kills
in no case — no seed killed more armed than baseline. The lever's effect
is seed-volatile, and on this band the volatility ran the wrong way.

## The mechanism, as measured

**Rally (bankkiller verbatim):** fired 27/27 times when its condition held
(live wave-4+ monster + living ally on the scholar's first turn), 0
failures. THIN T1 (fires < 8) is clear; THIN T2 (ally presence < 40%
with ≥10 fights) is clear at 73.0%. The bankkiller bottleneck — allies
beside the scholar in wave-4 TB fights — moved again: 44.1% → 73.0%
(this band's baseline was already higher than the pilot's 27.5%).

**Staging:** 36 invite attempts across the leg, 18 accepted (50%), 13
declined, 5 not-offered. The scholar answered 13 of the villagers'
questions inside the sittings to reach the ask (the answer-then-ask
conduct). Party-days ≥2 rose 16 → 141. The ask itself is honest: it lands
in conversation, villagers refuse for character reasons, and accepts read
like people saying yes (sense test below) — but the accept lines repeat
verbatim across seeds (see sense test).

**Kill channel mix (wave-4 kills):** baseline 9: 6 by the scholar
(`via: player`), 2 by companions (`via: companion`, both Algorithm kills
with the scholar NOT in the fight — scholarChannel False), 1 wild
(`via: wild`, scholar not in the fight at all). Armed 3: ALL by the
scholar (`via: player`), ALL scholar-channel. Zero companion kills on
the armed leg (pilot: 4 of 8 by companions). All 3 armed kills happened
in turn-based fights the scholar was in; field fights killed 0 wave-4
monsters on EITHER leg (the untouched control channel, still 0).

## Killer ledger (armed leg, all 3 kills)

| Day | Monster (wave) | Killed by | Via | Fight (allies / party, outcome) |
|---|---|---|---|---|
| 78 | Eulogy (4) | gen_16cjvkx (scholar) | player | TB, 1 / 1, won, 2 rounds — FIRST BLOOD, 53004 |
| 89 | Strike (4) | Olivia Bennett (scholar) | player | TB, 5 / 1, won, 10 rounds — FIRST BLOOD, 53006 |
| 149 | Congregation (4) | gen_y8hmuwz (scholar) | player | TB, 0 / 0, won, 1 round — 53006, SOLO, post-first-blood |

53006's day-149 kill is the leg's only post-first-blood kill — and it is a
solo kill with no ally and no party member in the fight, in ONE round,
the scholar ending at 76.4% HP. A wave-4 monster carries 850–1500 HP
(MONSTER-WAVES.md); one round ending it, alone, is unexplained by the
fight row — either the monster entered already wounded or something
one-shot it. Flagged in the findings backlog; the instrument records no
damage trace to explain it.

Baseline kills for comparison: 53002 day 143, Influencer, by Wanjiru
Kamau (`via: wild` — no scholar in the fight); 53004 day 64,
Congregation, and day 70, Strike, both by gen_93bg7ex (scholar, TB);
53005 day 85, Strike, by gen_qz719sh (scholar, TB); 53006 day 81,
Congregation, and day 83, Suburb, both by gen_76n8yer (scholar, TB),
and day 91, Algorithm, by gen_cowc2ja (`via: companion`, scholar Adaeze
not in the fight); 53008 day 92, Strike, by Ella Johnson (scholar, TB),
and day 109, Algorithm, by Elena Petrova (`via: companion`, scholar not
in the fight). The baseline produced two non-scholar-channel kills and
one wild kill; the armed leg produced none. Company did not buy a second
killer here — the baseline's second killers came without it.

**The 53006 trajectory (the closest seed, no pair):** the scholar asked
Adaeze to join on day 62 (accepted); Ella joined day 89, Desmond day 109,
Leo day 122. First blood day 89: Olivia Bennett killed the Strike with
five allies beside her and Adaeze in the party, rally fired, 10 rounds,
won, scholar HP 100% at the end — the staged fight, working exactly as
designed. Olivia died day 96, seven days after first blood — the first
killer still dies fast. The second kill did not come until day 149, by
gen_y8hmuwz (after succession), solo, one round — sixty days after the
first killer's death, with no overlap. Max simultaneous living killers: 1.
The pair never forms because the second killer arrives two months after
the first one dies.

**The 53004 trajectory:** the scholar asked Fatima (day 54) and Wei
(day 55) to join; the same Eulogy was rallied against on days 74, 76, 77,
and 78, and killed on day 78 in 2 rounds with Chen Wei (party) beside
the scholar, scholar HP 100%. The killer gen_16cjvkx lived 13 days after
the kill (died day 91) — the longest first-killer survival on the armed
leg — but no second killer ever appeared on the seed. One killer, alone,
is not a pair.

## Pooled n=16 (pilot 55001–55008 + confirm 53001–53008)

Same analyzer run over the combined 32-file corpus
(`/tmp/stageally-pooled/`, pilot corpus untouched in place):

| Metric (pooled) | Baseline | Armed | Change |
|---|---|---|---|
| Wave-4 kills | 11 | 11 | even |
| Ally presence in w4 TB fights | 35.1% (26/74) | 70.8% (63/89) | +35.7 pts |
| Post-first-blood w4 kills | 4 | 6 | the pilot's 5 + this band's 1 |
| Living pair (≥1 day, 2 living w4 killers) | 0 seeds | 1 seed (55007, 20 days) | pilot only |
| TB survival, fight level | 18.9% (14/74) | 15.7% (14/89) | worse armed |
| Median survival | 105d | 110d | +5d — guard holds |
| Wave 5 unlocks / faced / kills | 0 / 0 / 0 | 1 / 1 / 1 | pilot 55007 only |
| Readiness-5-ready days | 0 | 18 | pilot 55007 only |

The pooled analyzer verdict is GO — but it is the pilot's 55007 doing all
of it: the living pair, 5 of the 6 post-first-blood kills, the wave-5
unlock/face/kill, all 18 readiness-5-ready days. The confirm band
contributed 0 pair seeds, 1 post-blood kill, 0 wave-5 anything. Per the
prereg, the pooled numbers are reported alongside the band verdict, never
in place of it: **the band verdict is NO-GO, and the pooled GO is a
one-seed headline, not a confirmation.** Across 16 seeds the armed leg
killed exactly as many wave-4 monsters as the baseline (11 vs 11) while
losing more turn-based fights.

## Village assessment (plain words)

A village that walks into the fourth wave with friends beside it still
mostly dies there. On this band the friends showed up — more of them, more
often, rallied on entry, saying yes in conversation like people — and the
village killed less than it did alone. The one staged fight that worked
perfectly (five allies, a rally, a ten-round win, the scholar untouched)
still left its killer dead a week later, and the second kill came two
months after, alone, in a single round nobody can explain. The lever fixes
"alone in the fight." The fight itself is still a slaughter — the scholar
dies in 6 of every 7 wave-4 turn-based fights even with friends beside
them, worse than the 5 in 7 they died without them. The next blank is not
company. It is what happens inside the fight once the company is there:
damage, staying, and finishing — the same blank the pilot named, now with
a second band saying so louder.

## Sense-test read (armed leg, seeds 53004 / 53006 / 53001)

**One wave-4 fight — day 78, the Eulogy, first blood (53004).** The rally
line reads like a person taking charge, not a button: *"You plant your
feet and ROAR the line back together — 'ON ME! ON ME!' Fear drains out
of their faces. 'THE EULOGY — TOGETHER!' They turn as one."* It fired four
times against the same monster across five days (days 74, 76, 77, 78) and
the kill came on the fourth, in 2 rounds, with Chen Wei beside the
scholar, the scholar at full health. The fiction coheres: a called-
together line, a kill with a friend standing in it. It reads as the game
working as designed — and then the killer died thirteen days later with
no second killer ever coming, which is also the game working as designed.
The fight is honest; the chain after it is not there.

**One party invite — day 62, Adaeze (53006).** *"🤝 Adaeze joins your
party. 'Okay. Yeah. I trust you.'"* And day 40, Nino (53001): *"🤝 Nino
joins your party. 'Finally. I was wondering when you'd see my value.'"*
Day 55, Wei (53004): *"'Someone should watch your back. Might as well
be me.'"* Day 78, Yuki (53002): *"'...Fine. This had better be worth
it.'"* Each reads as a person with character saying yes — eager, wary,
practical, reluctant. The problem is the pool, not any one line: the SAME
sentences recur verbatim across different people and different seeds —
Nino's "Finally..." on both 53001 and 53002, "...Fine. This had better
be worth it." on 53002, 53004, and 53005, "Okay. Yeah. I trust you." on
53001 and 53006, "Someone should watch your back..." on 53002, 53004,
and 53006. Five accept lines, shared by everyone. A player meeting two
villagers who say the identical sentence will hear the menu, not the
person. Flagged in the findings backlog.

**Fiction findings (backlog, not this arm's business):**
- The System announces "a veteran kill" for kills that are not wave-4
  kills — reproducing the pilot's finding. 53006: day 34 "Brian just put
  down Spool", day 54 "Olivia just put down Big Big", day 61 "Rosa just
  put down Ad Break", day 62 "Rosa just put down The Callback", day 68
  "Brian just put down The Terms of Service" — all announced as veteran
  kills on camera; none is a wave-4 kill in the log. Either the
  announcement fires for lower-wave kills too, or kills go unlogged.
- The trust-too-low refusal floods the transcript: days 1–2 on every
  seed, the line *"Ask someone who trusts you. (Trust too low.)"* repeats
  10+ times in a day, identical, from unnamed villagers. The menu's own
  refusal (effective trust/mood on top of the policy's raw-trust floor) —
  log noise, not a fiction break, but it reads as a stutter.
- The same Eulogy rallied four times in five days (53004, days 74–78):
  one monster re-encountered, or several Eulogies — the transcript can't
  tell which. Same class as the pilot's "Choir Toad ×4" stutter.
- The Bloodied split/raid lines repeat heavily (raids every 2–4 days on
  53004/53006, the same sentence each time) — log noise, not a fiction
  break, same as the pilot's SHUTDOWN flood note.

## Metric review

Pre-registered metrics bind this run (prereg 2ff11cbf). Primary: GO iff
armed leg banks a living pair (≥1 day with 2 living wave-4 killers) on
≥1 seed, OR post-first-blood wave-4 kills ≥3 on the armed leg. BOTH
missed: pair seeds 0/8; post-blood kills 1 (53006 day 149, solo). Guards:
median survival armed 111.5d vs baseline 108d — not worse by more than
10d; it is better by 3.5d. THIN checks run BEFORE GO/NO-GO: T1 rally
fires 27 ≥ 8 (clear); T2 ally presence 73.0% ≥ 40% with 37 fights
(clear). Verdict NO-GO per the preregged rule.
- No metric was swapped, re-cut, or re-thresholded after the run. The
  Stage-0 smoke (53001–53002, 60d, /tmp) is the same two seeds in the
  judged band — the smoke was unjudged Stage-0 verification, and the
  judged legs re-ran them from scratch with the frozen policy. The smoke
  engaged without re-baselining (53001: invites 2/2 accepted, rally 6,
  partyDays2 4; 53002's gate never opened in 60d — standing 45, wave 3 —
  which is the gate working as designed, not a failure).
- The pooled n=16 analysis is reported above alongside the band verdict,
  per the prereg; it does not change the verdict. The pooled GO is the
  pilot's 55007 (pair + 5 post-blood kills + the only wave-5 kill).
- Instrument notes: `pendingW4` = 0 on both legs — the pending hook never
  saw a wave-4 pending encounter, so the staged-pending share is
  unmeasured (null), not zero; the harness faces fights directly and
  pendings did not occur on this band either. The `tbFights` rows carry
  the fight-level TB survival (13.5% armed); the old day-join secondary
  is retained under `tbSurvivalDayJoin` and is NOT cited.
- What the reversal shows, honestly: the mechanism reproduces and the
  kill effect does not. Two readings are both live and the run cannot
  separate them: (a) the pilot's armed leg was a strong-band draw as
  much as a lever effect — this band's BASELINE killed 9, more than the
  pilot's armed 8; (b) the rally's round-1 strike cost bites harder when
  the fights are this fragile (finishprobe's arithmetic: survival ×
  damage vs entry HP). Either way a third band, or the fight-interior
  lever, is the next decision — a loop call, not this arm's.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: `--help` refuses with the pilot's error
  (`Error: --out <panel-directory> required`). The `--out` form was
  started and then killed by this worker after ~5 min with no output: it
  runs its own full panel (default 16 seeds × 4 policies × 150d, policies
  capable/risk-aware/socialite/winseek) and takes no corpus input, so it
  cannot compare competent vs stageally on identical seeds. No Game-root
  change exists in this arm (policy A/B on identical seeds is the
  comparison), so no compare `.md` is fabricated — same outcome as the
  pilot. The matched-seed paired comparison is the analyzer output above
  (identical seeds, both legs, same instrument).
- `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-06/perseed-stageally-confirm-b/*.json' --metrics
  national,table,wins,exiled`: REFUSED — "refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit, so they are
  sweep recorder rows, not runs." Recorded as the result, same as every
  prior killer-chain arm. No telemetry deviation check was possible on
  this corpus; the wall numbers above are the instrument's own. The
  WINSEAT baseline regime note was checked first: no pre-seat comparison
  is claimed anywhere here.

## What this arm does NOT claim

- Not a kill of the pilot GO: the pilot verdict stands as measured on its
  base (55001–55008, GO by both routes). This confirm says the GO does
  not reproduce on a fresh band on current master — the lever is
  band-fragile, not disproven everywhere.
- Not a win: 0 wins either leg; no wave-5 anything on this band.
- Not first-killer survival fixed: median 9.5d armed vs the 19d bar; the
  first killer on 53006 died 7 days after first blood, on 53004 after 13.
- Not a field-fight fix: field fights killed 0 wave-4 monsters on both
  legs; every armed kill came from a turn-based fight with the scholar in
  it.
- Not a rally failure: rally fired 27/27 when its condition held. The
  rally works; the fight after it does not.
- Not a staging failure: invites 36, accepted 18 (50%), party-days ≥2
  16 → 141. The party forms; the party does not kill.
- The Stage-0 smoke and the proof legs are not evidence; only the judged
  8+8 legs above are.

## Next blanks (for the loop, not this arm)

1. **Fight interior, now that company is there and still loses** — TB
   survival fell armed vs baseline (13.5% vs 29.4%) while allies were
   present in 73% of fights. Damage, staying, and finishing inside the
   fight are the next instruments (secondkiller's finishing bind, still
   open: 32 of 37 armed TB fights lost). The rally's round-1 strike cost
   is a live suspect, not a proven cause.
2. **First-killer survival** — median 9.5d armed vs the 19d bar; the pair
   forms only when the second killer arrives before the first dies. On
   53006 the second kill came 60 days after the first killer's death.
   The rest-killer lever was killed at pilot; retreat-and-refind is
   policy-only and unconfirmed.
3. **Why this band's baseline killed 9** — the pilot baseline killed 2.
   Baseline 53006 alone killed 3, including two non-scholar-channel kills
   (a companion Algorithm kill and a wild Influencer kill). Whether
   non-scholar kills are luck or a channel the armed policy crowds out
   (the armed scholar is always in the fight; the baseline's killers
   sometimes are not) is worth a look before a third band.
4. **The 1-round solo Congregation kill (53006 day 149)** — needs a
   damage trace to explain; the instrument records no per-turn damage.
5. **Party persistence across succession** — the staged party is tied to
   the scholar; after succession the new scholar starts party-less
   (53006's party was rebuilt by day 122, but only after the first killer
   was already dead). Whether a party should persist across succession
   is a design question, not a measurement one.
6. **Pending encounters** — the pending hook recorded 0 wave-4 pendings
   on 16 runs; the "wait for a companion at the door" question stays
   unmeasurable this way (the NO WAIT finding stands).

## Proof and commits

- Proof `scripts/test-stageally-20261106.js`: 45/45 green on this
  worktree before the judged run (fixtures + live legs; the live-invite
  leg asserts engagement, not acceptance). No proof change was needed —
  the 55002/60d smoke baseline from the 0615Z coordinator re-baseline
  still engages.
- Prereg committed 2ff11cbf before any judged sim. The safe-commit index
  clobber hit on that commit (file shown staged-as-deleted after a
  correct commit); repaired with HEAD-blob cacheinfo, verified `git
  status` empty + `git diff HEAD` empty + hash-object matches.
- Judged corpus: `evidence/2026-11-06/perseed-stageally-confirm-b/` (16
  files, 8 baseline + 8 staged), all with 0 instrument errors. Analyzer
  output (band + pooled) saved at `/tmp/stageally-confirm-analysis.json`
  and `/tmp/stageally-pooled-analysis.json` (working copies; the evidence
  file above is the record).
- Stage-0 smoke: 53001–53002 staged 60d to /tmp (invites 2/2 on 53001,
  rally 6, 0 errors) — unjudged, not evidence.

## Convergence

**scale-onramp: converging, NOT converged.** The stageally GO is NOT
confirmed: its mechanism reproduces on a fresh band (allies beside the
fighter 44% → 73%, party-days ≥2 16 → 141) while its kill effect reverses
(kills 9 → 3, TB survival 29.4% → 13.5%, post-blood kills 4 → 1). The
pooled n=16 still reads GO only because the pilot's single seed 55007
carries every headline number in it. The binding constraint is now
sharper: company works when it catches, and on this band it caught and
still lost — the fight interior (damage, staying, finishing with company
present) is the open problem, not the staging. Next run: the
fight-interior lever, or a third band as a tie-break — a loop call.
