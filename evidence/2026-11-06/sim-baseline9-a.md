# sim-baseline9-a — why the stageally-confirm baseline killed 9 wave-4 monsters while the staged leg killed 3 — DIAG-GO

**Arm:** sim-baseline9-a (run fleshout-20261106T1515Z, Loop A, axis
scale-onramp / winnability chain) · **DIAG-only, instrument-only, zero
src/js.** No gate/price/deed/readyDemand change. No new seed band — a
follow-up trace on 53001–53008.
**Verdict: DIAG-GO** — by the preregged rule: every wave-4 kill on the band
(both legs, 12 total) is classified by channel with a matched fight row,
and the channel question is answered with numbers. The leading explanation
is NOT channel crowd-out: the channels that produced the baseline's extra
kills were all available on the armed leg and simply did not convert there.
The gap is a fight-conversion gap (scholar-TB 6 vs 3, grind conversion
2/3 groups vs 1/7), with band draw setting the sign across bands (pooled
n=16: 11 vs 11).
**Band:** 53001–53008 (8 seeds, deliberate reuse of the stageally-confirm
band) · **Horizon:** 150d death-aware · **Legs:** competent-verbatim
baseline vs staged on identical seeds · **Corpus:**
`evidence/2026-11-06/perseed-stageally-confirm-b/` (16 files, anchor
2ff11cbf) · **Prereg:**
`evidence/2026-11-06/sim-baseline9-a-prereg.md` (committed 307b9d66d
before any judged analysis) · **Proof:**
`scripts/test-baseline9-20261106.js` 23/23 green · **Analyzer:**
`scripts/baseline9-analyze-20261106.js` (analysis
`/tmp/baseline9-analysis.json`, working copy; this file is the record).

**The one-line result, plainly:** the baseline did not win on a channel
the armed policy took away. Both of its companion kills happened with the
scholar standing in the fight, alive, while the companion landed the last
blow — the exact shape the staged policy is built to produce — and the
armed leg had more of those fights (27 ally-present vs 15) and converted
none of them. The wild kill came from a field fight, and the armed leg
had more field fights too (26 vs 20) and converted none. The baseline
killed more because it won more of the fights it entered (8 of 34
turn-based fights vs 3 of 37), not because it had a private road to
kills. The company was there on the armed leg; it just did not win.

## Correction to the confirm evidence (read first, then corrected)

Two glosses in `sim-stageally-confirm-b.md` do not survive a read of the
records, and both matter to the channel question:

1. **"Both Algorithm kills with the scholar NOT in the fight —
   scholarChannel False."** Wrong. `scholarChannel` is defined in the
   instrument (`killerdeath-instrument-20261105.js`) as
   `scholarAtKill === killerVid` — true iff the KILLER is the scholar. It
   says nothing about whether the scholar was in the fight. Both
   companion kills match a WON turn-based row with the scholar alive at
   the end (53006 d91: scholar HP 0.31; 53008 d109: scholar HP 0.36), the
   killer standing in the fight as an ally. The scholar was in both
   fights. (The `via: companion` tag itself is the TRICKTAG attribution:
   a companion landing the killing blow in the scholar's own TB fight,
   `src/js/game.js` ~45850.)
2. **"Field fights killed 0 wave-4 monsters on EITHER leg."** Wrong as
   stated. The wild kill (53002 d143, Influencer, Wanjiru Kamau) IS a
   field-fight kill: the wild path calls `fieldFight` and records
   `recordWaveKill(..., 'wild', ...)` on a `vKill` (`game.js` ~20607), and
   the corpus carries its field row (fighter wanjiru_kamau, outcome
   vKill, no TB row that day). Field fights killed 1 wave-4 monster on
   the baseline leg and 0 on the armed leg. (The confirm's per-seed table
   and its 9-kill total already count the kill; only the "field fights
   killed 0" sentence is wrong.)

Neither correction changes the confirm verdict (NO-GO stands, judged on
its band). They change what the 9-vs-3 split means — which is this arm's
job.

## Before / after (identical seeds, 8 + 8 — reproduced, not re-judged)

| Metric | Baseline | Armed | Change |
|---|---|---|---|
| Wave-4 kills | 9 | 3 | gap 6 |
| Wave-4 TB fights / won | 34 / 8 (+1 rout, no kill) | 37 / 3 (+1 rout, no kill) | more fights, fewer wins |
| TB survival, fight level (scholar lives) | 29.4% (10/34) | 13.5% (5/37) | reproduced |
| Ally presence in w4 TB fights | 44.1% (15/34) | 73.0% (27/37) | reproduced |
| Party presence in w4 TB fights | 8.8% (3/34) | 56.8% (21/37) | reproduced |
| Median rounds survived (lost fights) | 6.5 | 5 | armed dies a round sooner |
| Beast HP at end, lost fights (median frac) | 0.592 | 0.438 | armed bites deeper, still loses |
| Scholar HP at end, won fights (median frac) | 0.84 | 1.0 | |
| Field w4 fights / kills | 20 / 1 | 26 / 0 | more field fights, no kills |
| Field outcomes (vKill / vFlee / vDie) | 1 / 11 / 7 (+1 mFlee) | 0 / 12 / 14 | armed villagers die more in the wild |
| Median survival (guard) | 108d | 111.5d | reproduced, guard holds |
| Instrument errors | 0 | 0 | |

## The kill ledger (all 12 classified, 0 unmatched, 0 pyrrhic)

| Leg | Seed | Day | Monster | Killed by | Channel | Fight (rounds, allies / party, scholar HP end) |
|---|---|---|---|---|---|---|
| baseline | 53004 | 64 | Congregation | gen_93bg7ex (scholar) | scholar-TB | 11 rounds, 1 / 0, 0.82 |
| baseline | 53004 | 70 | Strike | gen_93bg7ex (scholar) | scholar-TB | 7 rounds, 1 / 0, 1.00 |
| baseline | 53005 | 85 | Strike | gen_qz719sh (scholar) | scholar-TB | 20 rounds, 0 / 0, 0.84 |
| baseline | 53006 | 81 | Congregation | gen_76n8yer (scholar) | scholar-TB | 10 rounds, 1 / 1, 0.98 |
| baseline | 53006 | 83 | Suburb | gen_76n8yer (scholar) | scholar-TB | 9 rounds, 1 / 1, 0.69 |
| baseline | 53006 | 91 | Algorithm | gen_cowc2ja (companion) | companion-TB, scholar present | 3 rounds, 2 / 0, 0.31 — grind finish |
| baseline | 53008 | 92 | Strike | ella_johnson (scholar) | scholar-TB | 9 rounds, 0 / 0, 0.95 |
| baseline | 53008 | 109 | Algorithm | elena_petrova (companion) | companion-TB, scholar present | 7 rounds, 2 / 0, 0.36 — grind finish |
| baseline | 53002 | 143 | Influencer | wanjiru_kamau | wild-field | field vKill, no TB row that day |
| armed | 53004 | 78 | Eulogy | gen_16cjvkx (scholar) | scholar-TB | 2 rounds, 1 / 1, 1.00 — grind finish |
| armed | 53006 | 89 | Strike | olivia_bennett (scholar) | scholar-TB | 10 rounds, 5 / 1, 1.00 |
| armed | 53006 | 149 | Congregation | gen_y8hmuwz (scholar) | scholar-TB | 1 round, 0 / 0, 0.764 — unexplained (see below) |

Gap decomposition (baseline minus armed): **scholar-TB +3, companion-TB
+2, wild-field +1 = 6.** Only half the gap (3 of 6) is the non-scholar
channels the confirm named. The other half is scholar-TB conversion:
the baseline's scholars won 6 TB fights to the armed leg's 3.

## The three candidates, ruled with numbers

**1. Channel crowd-out — REFUTED as the leading explanation.** The
hypothesis was that the armed policy crowds out the channels the
baseline's extra kills came through (the armed scholar is always in the
fight; the baseline's killers sometimes are not). Every part of it fails
on the records:
- Companion channel: the two baseline companion kills happened WITH the
  scholar in the fight (the staged fight's own shape). The armed leg had
  MORE ally-present TB fights (27 vs 15) and MORE party-present fights
  (21 vs 3) — the channel was not crowded out, it was oversupplied — and
  produced 0 companion kills. Per ally-present fight, companion-kill
  conversion was 2/15 baseline vs 0/27 armed.
- Wild channel: the armed policy does not touch villager field fights at
  all (they are engine-driven, scholar absent by definition). The armed
  leg had MORE field wave-4 fights (26 vs 20) and converted 0 to kills
  vs the baseline's 1. Opportunity existed; conversion failed.
- The same staged policy produced 4 companion kills on the pilot band
  (see pooled, below) — the channel is not structurally closed to it.

**2. Luck / band draw — REAL across bands, NOT the within-band story.**
Per-seed kill deltas (baseline minus armed): 53001: 0, 53002: +1, 53003:
0, 53004: +1, 53005: +1, 53006: +1, 53007: 0, 53008: +2. The baseline is
ahead on 5 seeds, the armed leg on 0 — a consistent direction, not a
coin flip on one or two kills — and the TB win-rate gap behind it is
real (23.5% vs 8.1% of fights won). But across bands the sign flips:
the pilot band read armed 8, baseline 2 (armed ahead by 6), this band
reads the reverse (baseline ahead by 6), and the pooled n=16 is exactly
11 vs 11. Band draw dominates the pooled picture; within this band the
split is a systematic conversion gap. Both halves belong in the report:
the lever's kill effect is band-fragile, AND on this band the baseline
out-converted the armed leg fight by fight.

**3. Rally cost — RULED OUT as the leading explanation (fresh-band
measurement; this corpus cannot re-measure it).** The corpus carries no
per-round damage trace, so round-1 scholar strikes are not observable
here — the rallied-day proxy is the only read available, and it is
uninformative: rallied fights won 2/30 (6.7%) vs non-rallied 1/7
(14.3%); ally-restricted, 2/25 (8.0%) vs 0/2 — the comparison cell has
n=2, and 27 rally calls over-match to 30 rows (grind groups share a
rally's day+mid). No penalty is visible, and none can be separated from
the noise. The decisive measurement is fightinterior-b's recorder on a
fresh band (51001–51008, 59 fights): scholar round-1 damage is 0 with
and without a rally, 0 round-1 scholar strikes on either leg — round 1
is a closing round, the rally displaces a move, not a strike. Nothing on
this band contradicts it: rallied fights last as long (median 6 rounds
vs 4) and end with the beast no healthier (median 0.44 vs 0.35) than
non-rallied ones. The rally costs nothing; the fight after it is what
loses.

## The grind: how the baseline's companion kills actually happened

Both companion kills are the last blow of a same-day grind, not a
companion going out alone against a fresh beast:

- **53006 d91, Algorithm.** Three TB fights the same day. The scholar
  fought, died, was succeeded, fought again, died again — then the third
  fight (adaeze, the new scholar) won in 3 rounds with gen_cowc2ja and
  ella_johnson beside her, scholar at 31% HP. The wound trail reads as
  the same beast ground down across the day: monster HP at fight end
  0.667 → 0.138 → 0. (Instance identity is not recorded, so this is a
  trail reading: a fresh 850–1500 HP beast does not die in 3 rounds to
  a 31%-HP scholar, but a beast at 14% does.)
- **53008 d109, Algorithm.** Five TB fights the same day, four scholar
  deaths (valeria, nikolai, raj, victor), then the fifth won in 7 rounds
  with elena_petrova landing the kill, scholar olivia at 36% HP. Wound
  trail 0.705 → 0.409 → 0.381 → 0.26 → 0. Olivia then died the same day
  in a Suburb fight — five scholar deaths on one day, one kill. The
  transcript says it plainly (sense test below).
- **The armed leg ground too — and converted less.** Same-day same-mid
  grind groups: baseline 3 groups (2 won, 11 scholar deaths), armed 7
  groups (1 won, 16 scholar deaths). The armed leg's one grind conversion
  is the 53004 d78 Eulogy kill (prior fight left the beast at 5.3% HP;
  kill fight 2 rounds). Its other six grind groups all ended in losses,
  including a three-day Reunion grind on 53001 (d50–52, 8 scholar deaths,
  no kill) and a five-fight Reunion grind on 53004 d104 that cost five
  scholar deaths on the baseline leg and no kill. Grinding is how
  wave-4 kills happen on both legs; the baseline's grinds converted and
  the armed leg's mostly did not.

## Company helps on the baseline and does not on the armed leg

TB win rate split by company at entry — the sharpest secondary split in
the corpus:

| Leg | Ally present | No ally | Party present | No party |
|---|---|---|---|---|
| Baseline | 6/15 won (40.0%) | 2/19 (10.5%) | 2/3 (66.7%) | 6/31 (19.4%) |
| Armed | 2/27 won (7.4%) | 1/10 (10.0%) | 2/21 (9.5%) | 1/16 (6.3%) |

On the baseline, company is worth roughly fourfold (40% vs 10.5% with
an ally). On the armed leg, company is worth nothing (7.4% with an ally
vs 10.0% without; party 9.5% vs 6.3%). The staged party walks into the
same fights and does not convert them. The likely reading is selection,
not a party debuff: on the baseline, allies are beside the scholar in
fights the scholar can win (or in grinds that finish); on the armed leg
the policy stages the party into every wave-4 fight, including the
unwinnable ones — the company is there, the fight is still a slaughter.
Small-n caveat: the baseline party split is n=3 (2/3), so read the
ally split (15 vs 27 fights) as the solid number and the party split as
suggestive. No party-debuff mechanism is claimed; the next lever's pilot
should record who the party members are (gear, HP, skills) — the
staged party may be weaker people than the baseline's self-selected
allies.

## The 53006 day-149 kill: wounded-entry REFUTED, mechanism still unknown

The 1-round solo Congregation kill (armed, gen_y8hmuwz, scholar ends at
76.4% HP) is classified scholar-TB — its channel is not in doubt. Its
MECHANISM is still unexplained, and this arm closes one door on it: the
wounded-entry hypothesis is refuted for this instance. The complete
fight record for that leg contains exactly ONE Congregation fight of any
kind (the d149 TB fight itself) — no prior field fight, no prior TB
fight, no same-day field fight before it. Fightinterior-b's nearest
shape (a beast entering at 123 HP after a field grind) does not apply
here: there was no grind. A fresh 850–1500 HP Congregation died in one
round to a solo scholar, and the transcript never mentions it (no
Congregation line anywhere on the leg; no veteran-kill announcement for
either armed kill on the leg). What one-shots it is unrecorded — a
counter execution, an ability, or something else entirely; the corpus
has no per-turn damage trace to say. This stays open as confirm blank 4
(backlog updated with the refutation); the way to answer it is a
per-turn damage recorder re-run on 53006 staged, not another reading of
this corpus.

## Sense-test read (the 9 baseline kills)

**One grind day — 53008 d109, the Algorithm.** The transcript is honest
about the price. Five Codex death pages and five burial beats in one
day — *"Valeria Quispe is dead — the wild. The village stops. Somebody
screams. Somebody else starts digging."* — repeated for valeria,
nikolai, raj, victor, then the System's camera line: *"Elena just put
down The Algorithm... on CAMERA. That's a veteran kill, folks. REMEMBER
the name."* Then Olivia dies in the Suburb fight and the grave-speaking
beat passes the fire to Elena. The fiction coheres: the kill cost five
scholars in a day and the game says so, death by death. One wrinkle:
the grave line for Olivia says *"Victor trusted them"* — Victor died
the same day, hours earlier; a dead person's trust spoken at the next
grave reads slightly off, though it stays inside the succession-beat
logic.

**One grind finish — 53006 d91, the Algorithm.** Two deaths (Olivia,
Lena), then *"Shaker just put down The Algorithm... on CAMERA."*
"Shaker" is gen_cowc2ja — a nickname the transcript never introduces
elsewhere in the run, so a reader meets a stranger's name at the moment
of the kill. Small coherence nick, not a break.

**The veteran-kill announcement, sharpened.** Of the 10 wave-4 kills
whose announcement status is observable (2 are not — see below), only
2 got the *"That's a veteran kill, folks"* line — and both are the
companion kills. Scholar-TB kills: 0 of 8 announced. Meanwhile the same
files announce veteran kills for lower-wave kills on camera (53002:
Ugly-Eyes d58/d75/d94, Chorus Line d89; 53006 staged: Spool d34, Big Big
d54 ×2, Ad Break d61, The Callback d62, Terms of Service d68). The
System celebrates wave-3 kills and ignores wave-4 scholar kills. The
two unobservable kills are 53002 d143 (wild Influencer — deathSays hit
its 400-line cap at day 135, so the day-143 lines were never captured)
and 53005 d85 (Strike — deathSays capped at day 74); their announcement
status is unobservable, NOT silent, and this arm does not claim either
way. The cap also truncates fightLines (200) on most files — transcript
absence past the cap proves nothing.

## Pooled n=16 (pilot 55001–55008 + confirm 53001–53008)

Same analyzer run over the pilot corpus
(`evidence/2026-11-06/perseed-stageally-a/`, 16 files):

| Metric (pooled) | Baseline | Armed | Change |
|---|---|---|---|
| Wave-4 kills | 11 | 11 | even |
| Scholar-TB kills | 8 | 7 | |
| Companion-TB kills (scholar present) | 2 | 4 | the pilot's armed leg did it |
| Wild-field kills | 1 | 0 | |
| TB survival, fight level | pilot 10.0% / confirm 29.4% | pilot 17.3% / confirm 13.5% | sign flips by band |

The pilot's armed leg killed 8 (4 scholar + 4 companion, one seed —
55007 — carrying 6 of them); the confirm's armed leg killed 3. The
pooled 11–11 says the lever does not move kills; the band swing says any
single band's verdict is fragile. Reported alongside the band verdict,
never in place of it.

## Village assessment (plain words)

Eight villages, six reached the fourth wave on each leg, none won, none
opened the fifth wave's door. On the baseline the villages killed nine
beasts, and the way they did it was grim and human: they threw person
after person at the same wounded beast until it fell — five scholars in
a day on 53008, two on 53006 — and the friend standing beside the last
one landed the killing blow. On the armed leg the villages did the same
thing more often, with more friends beside them, and it mostly did not
work: seven grinds, one kill, sixteen scholars dead in them. The friends
show up, the rally fires, the line holds — and the beast still stands at
half health when the scholar falls. The difference between the legs is
not who is in the fight. It is what the fight does once everyone is
there — and on this band, what it did was lose more often with company
than without it. The next blank is still the fight interior, now with a
sharper edge: company that wins fights on the baseline does not win
them staged, and nobody has yet measured why.

## Metric review

Pre-registered metrics bind this run (prereg 307b9d66d). Primary:
DIAG-GO iff every wave-4 kill on the band (both legs) is classified by
channel with fighter, monster, rounds, allies/party at entry, and entry
HP where observable, AND the channel question is answered with numbers
(channel crowd-out vs luck vs rally-cost). Both hold: 12/12 classified
with matched fight rows (0 unmatched, 0 ambiguous, 0 pyrrhic), gap
decomposed 3+2+1, and each candidate ruled with numbers above
(crowd-out refuted, luck quantified across bands, rally-cost ruled out
by the fresh-band recorder with the corpus proxy reported as
uninformative). Guards: median survival armed 111.5d vs baseline 108d
(reproduced); no new death mode (instrument records only — no game
behavior changed, no sims re-run for the verdict).
- No metric was swapped, re-cut, or re-thresholded after the run. One
  analyzer fix mid-run (verdict rule: the 12-kill count is confirm-
  specific, so the rule now requires "all kills classified" rather than
  "12 kills" — the proof still asserts 12 on the confirm corpus; the
  pilot run then classifies 10/10 instead of failing on the count).
  The fix changes no judged number.
- "Entry HP where observable": entry HP is NOT in the confirm corpus
  (no per-turn damage trace — the fightinterior recorder was built for
  the fresh band, not this one). The verdict did not turn on it: the
  wound trail (prior fights' end-HP) supplies the entry-HP evidence the
  grind finding needs, and the one kill whose mechanism turns on entry
  HP (53006 d149) is reported as unexplained, not forced into an
  answer. A recorder re-run was not needed for the verdict (method step
  2: only if a candidate explanation turns on it — none does).
- No fresh verification legs were run (method step 3: only if the trace
  needs re-derivation). The trace is complete from the committed records
  (0 unmatched, 0 pyrrhic), and the channel semantics the classification
  rests on (`via` values, TRICKTAG, pyrrhic path) were verified by
  reading the call sites in `src/js/game.js` at this worktree's base;
  they are re-checked on the rebase tip before the evidence is committed
  (see Proof and commits).
- The stageally bar is reported as context only, never re-judged: living
  pair 0/8 armed (confirm), post-first-blood kills 1 armed / 4 baseline.
  This arm explains why; it does not re-score the bar.
- Instrument notes: `waveKillLog` carries the wave as `w`, not `wave`
  (the first analyzer read filtered on `wave` and found 0 — caught by
  the fixture A6); `killsLive` matches the log exactly on this band
  (12 = 12, 0 pyrrhic), so the pyrrhic bypass did not bite here;
  `scholarChannel` means killer-is-scholar, not scholar-in-fight (see
  the correction above); rally-call matching is by day+mid with no fight
  seq, so 27 calls over-match to 30 rows — the proxy is reported with
  its over-match, never as a per-fight rally census.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: INAPPLICABLE — no armed leg exists in this
  arm (no policy built, no before/after pair). Same outcome as the pilot,
  the confirm, killersurvive-a, and fightinterior-b: the panel runs its
  own full panel and takes no corpus input, so it cannot compare
  competent vs staged on identical seeds. No compare `.md` is fabricated.
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

- Not a kill of the stageally NO-GO: the confirm verdict stands as
  measured on its band. This arm explains the 9-vs-3 split; on a fresh
  band the split ran the other way (armed 8, baseline 2), and pooled it
  is 11–11.
- Not a crowd-out proof in either direction for the wild channel's
  future: one wild kill on the baseline, zero on the armed leg, across
  46 field fights — the sample is one kill, and the claim is only that
  the opportunity existed on the armed leg.
- Not a rally-cost measurement: this corpus has no per-round trace. The
  rally-cost ruling rests on fightinterior-b's fresh-band recorder, and
  this arm's proxy is reported as uninformative, not as evidence.
- Not an explanation of the 53006-day-149 kill: its channel is
  scholar-TB, its mechanism is unknown, and the wounded-entry
  hypothesis is refuted for this instance. A damage recorder re-run is
  the way to answer it.
- Not a party-debuff claim: the party split (company wins on baseline,
  not on armed) is measured, with a selection reading offered as a
  hypothesis and a small-n caveat on the baseline party cell (n=3). The
  next pilot should record party-member strength.
- Not a win: 0 wins either leg; no wave-5 anything on this band.

## Next blanks (for the loop, not this arm)

1. **Fight interior, with the party split as the new edge** — company
   wins fights on the baseline (ally-present 40%) and not staged
   (7.4%). The next lever's pilot should record party-member strength
   (gear, HP, skills) and test whether the staged party is weaker people
   than the baseline's self-selected allies, or whether staging drags
   the party into unwinnable fights. The damage-race sizing from
   fightinterior-b (ceiling 35%) still stands as the lever shape.
2. **The 53006-day-149 one-round kill** — needs a per-turn damage
   recorder re-run on 53006 staged. Wounded-entry is now refuted for
   this instance; the remaining candidates are a counter execution, an
   ability one-shot, or an unrecorded mechanic.
3. **The veteran-kill announcement** — it fires for companion kills
   (2/2) and lower-wave kills, and misses scholar wave-4 kills (0/8
   observable). Whether "veteran" is loose show language or a real
   narration/gate mismatch is a design question (backlog, updated).
4. **The 159-round rout** — 53001 d41 Congregation, both legs, 159
   rounds, scholar untouched, beast at ~59%: a fight neither side can
   finish. Backlog (new).
5. **Grind economics** — the village pays 2–5 scholar deaths per grind
   kill. Whether same-day re-fighting of a wounded beast is the intended
   road to wave-4 kills, and whether the price is legible to the player,
   is a design question (backlog, new).

## Proof and commits

- Proof `scripts/test-baseline9-20261106.js`: 23/23 green on this
  worktree before the evidence file was written (fixtures + corpus
  reproduction + channel answer + pooled context). One real failure
  during development (C6: the analyzer did not return the ally-count
  fields) fixed in the analyzer, proof re-run green.
- Analyzer `scripts/baseline9-analyze-20261106.js`: pure function over
  the committed corpus; no game reads, no re-scoring. Analyzer output
  saved at `/tmp/baseline9-analysis.json` and
  `/tmp/baseline9-pooled-pilot.json` (working copies; the evidence file
  above is the record).
- Prereg committed 307b9d66d before any judged analysis. The safe-commit
  index clobber hit on the prereg commit and the scripts commit (files
  shown staged-as-deleted after correct commits); repaired with
  HEAD-blob cacheinfo each time, verified `git status` empty +
  `git diff HEAD` empty + hash-object matches.
- Judged corpus: `evidence/2026-11-06/perseed-stageally-confirm-b/` (16
  files, 8 baseline + 8 staged), all with 0 instrument errors. No fresh
  verification legs: the trace is complete from the records, and the
  channel semantics were read from the call sites, re-checked on the
  rebase tip (see below).
- No fresh sims were run in this arm: the verdict is a reading of the
  committed corpus plus a pooled re-read of the pilot corpus
  (`evidence/2026-11-06/perseed-stageally-a/`). No new seeds consumed.

## Convergence

**scale-onramp: converging, NOT converged.** The 9-vs-3 split is now
explained, and the explanation is not the one the confirm hypothesized:
no channel was crowded out — the baseline's extra kills came through
channels the armed leg had in greater supply, and the gap is a
fight-conversion gap (scholar-TB 6 vs 3, grind conversion 2/3 vs 1/7)
under a band draw that flips sign between bands (pooled 11–11). The
binding constraint stays where the last three arms put it: the fight
interior with company present — now with the sharper edge that company
itself wins on the baseline and does not staged. Next run: the
fight-interior lever (party damage per round, ceiling 35%), or a third
band as a tie-break — a loop call.
