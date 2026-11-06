# sim-stageally-a — "Never fight wave 4 alone": companion-staging + rally

**Arm:** sim-stageally-a (run fleshout-20261106T0615Z, axis scale-onramp /
winnability chain) · **Policy-only, zero src/js, no gate/price/deed change.**
**Verdict: GO** — by BOTH preregged routes (living pair on 1 seed AND
post-first-blood kills 5 ≥ 3). Guard holds (armed median survival 109d vs
baseline 92.5d).
**Band:** 55001–55008 (8 seeds, verified fresh — see prereg) · **Horizon:**
150d death-aware · **Legs:** competent-verbatim baseline vs staged on
identical seeds · **Corpus:** `evidence/2026-11-06/perseed-stageally-a/`
(16 files) · **Prereg:** `evidence/2026-11-06/sim-stageally-a-prereg.md`
(committed before any judged sim, 35e8b3d) · **Proof:**
`scripts/test-stageally-20261106.js` 45/45 green.

**The one-line result, plainly:** when the scholar walks into a wave-4
fight with a companion beside them and rallies on entry, the village
starts killing wave-4 monsters — 8 kills against the baseline's 2, a
living pair of wave-4 killers banked for 20 days, the wave-5 door opened,
faced, and a wave-5 monster killed. **But the whole GO rests on one
seed (55007).** The other seven seeds produced 2 kills between them and
no pair. Read the verdict as "the lever works when it catches" — not
"the lever works everywhere."

## Before / after (identical seeds, 8 + 8)

| Metric | Baseline | Armed | Change |
|---|---|---|---|
| Wave-4 kills | 2 | 8 | ×4 (kill rate 3.5% → 9.3% of w4 fights) |
| Wave-4 fights (all) / TB fights | 57 / 40 | 86 / 52 | more fights reached, more TB |
| Ally presence in w4 TB fights | 27.5% (11/40) | 69.2% (36/52) | +41.7 pts — the bankkiller bottleneck, moved |
| Party presence in w4 TB fights | 0% (0/40) | 55.8% (29/52) | the staged party is in the fight |
| TB survival, fight level (scholar lives) | 10.0% (4/40) | 17.3% (9/52) | better, still terrible |
| TB outcomes (won / lost / other) | 2 / 36 / 2 unfinished | 8 / 43 / 1 routed | |
| Rally fires (ok) | 0 | 36 (36) | rally half fully measured — T1 clear |
| Post-first-blood w4 kills (rate) | 0 / 11 (0%) | 5 / 18 (27.8%) | second-killer production, moved |
| Living pair (≥1 day, 2 living w4 killers) | 0 seeds | 1 seed (55007, 20 days) | GO route 1 |
| First-killer survival, median | 2d | 5d | better, far short of the 19d bar |
| Party days (≥1 / ≥2 members) | 211 / 40 | 427 / 191 | |
| Invites attempted / accepted / declined / not-offered | — | 60 / 18 / 24 / 18 | 30% accept; 23 questions answered in sittings |
| Median survival (guard) | 92.5d | 109d | +16.5d — guard holds |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | no win either leg |
| Wave 4 unlocks / faced | 6 / 6 | 8 / 8 | |
| Wave 5 unlocks / faced / kills | 0 / 0 / 0 | 1 / 1 / 1 | first wave-5 kill in this line of work |
| Readiness-5-ready days | 0 | 18 | all on 55007 |
| Instrument errors | 0 | 0 | |

## Per-seed table

| Seed | Baseline (days, end, w4k) | Armed (days, end, w4k) | Armed rally | Armed invites acc. | Armed party-days ≥2 |
|---|---|---|---|---|---|
| 55001 | 57, lost, 0 | 69, lost, 0 | 1 | 1 / 8 | 0 |
| 55002 | 123, lost, 0 | 108, lost, 1 | 4 | 2 / 5 | 41 |
| 55003 | 95, lost, 0 | 80, lost, 0 | 3 | 2 / 3 | 8 |
| 55004 | 90, lost, 0 | 126, lost, 0 | 3 | 2 / 9 | 22 |
| 55005 | 150, survived, 1 | 110, lost, 0 | 8 | 3 / 10 | 36 |
| 55006 | 130, lost, 1 | 136, lost, 0 | 4 | 6 / 18 | 24 |
| 55007 | 81, lost, 0 | 110, lost, 6 | 12 | 2 / 5 | 60 |
| 55008 | 83, lost, 0 | 98, lost, 1 | 1 | 0 / 2 | 0 |

Notes on the table: 55005 and 55006 went BACKWARDS on kills (1 each on
baseline, 0 each armed, despite 12 and 8 TB wave-4 fights) — the lever's
effect is seed-volatile, not uniform. 55003 never reached wave 4 on
baseline (maxWave 3) but did armed. 55008 never reached wave 4 on
baseline but armed reached it and killed one. Baseline 55007's 40
party-days ≥2 came entirely from auto-enrolled followers (no invites) —
and produced zero kills; the armed leg's kills on 55007 came after the
STAGED pair formed (see below), so auto-enrollment alone is not the
mechanism.

## The mechanism, as measured

**Rally (bankkiller verbatim):** fired 36/36 times when its condition
held (live wave-4+ monster + living ally on the scholar's first turn),
0 failures. THIN T1 (fires < 8) is clear; THIN T2 (ally presence < 40%
with ≥10 fights) is clear at 69.2%. The bankkiller bottleneck — allies
beside the scholar in only 28% of wave-4 TB fights — is the thing that
moved: 27.5% → 69.2%.

**Staging (the new half):** 60 invite attempts across the leg, 18
accepted (30%), 24 declined, 18 not-offered. The scholar answered 23
of the villagers' questions inside the sittings to reach the ask (the
answer-then-ask conduct — see prereg smoke note). Party-days ≥2 rose
40 → 191. The ask itself is honest: it lands in conversation, villagers
refuse for character reasons (the alone-goal villagers on 55001 said
"I work alone" four times), and accepts read like people saying yes
(sense test below).

**Kill channel mix (wave-4 kills):** baseline 2, both by the scholar
alone (`via: player`). Armed 8: 4 by the scholar, 4 by companions
(`via: companion`). All 8 armed kills happened in turn-based fights the
scholar was in; field fights killed 0 wave-4 monsters on EITHER leg
(17 baseline field w4 fights, 34 armed — the untouched control channel,
still 0, matching secondkiller's 0/30).

## Killer ledger (armed leg, all 8 kills)

| Day | Monster (wave) | Killed by | Via | Fight (allies / party, outcome) |
|---|---|---|---|---|
| 78 | Strike (4) | gen_bpv3697 (scholar) | player | TB, 2 / 2, won, 10 rounds — FIRST BLOOD, 55007 |
| 80 | Congregation (4) | visjoin_77 | companion | TB, 3 / 2, won, 10 rounds — 55007 |
| 81 | Strike (4) | miguel_santos | companion | TB, 2 / 2, won, 33 rounds — 55007 |
| 84 | Strike (4) | visjoin_77 | companion | TB, 2 / 1, won, 8 rounds — 55007 |
| 90 | Influencer (4) | jorge_silva (scholar) | player | TB, 0 / 0, won — 55008, solo |
| 92 | Eulogy (4) | gen_njfmmj8 (scholar) | player | TB, 3 / 0, won — FIRST BLOOD, 55002 |
| 99 | Eater (4) | nikolai_volkov (scholar) | player | TB, 1 / 1, won, 2 rounds — 55007 |
| 100 | Editor (5) | visjoin_77 | companion | TB, 2 / 0, won, 18 rounds — 55007, FIRST WAVE-5 KILL |

55008's kill, in detail: day 90, Influencer (wave 4), by Jorge Silva (the
scholar, `via: player`), in a TB fight with 0 allies and 0 party
members — a solo kill, not a staged one. The armed leg's staged-party
kills are the 55007 and 55002 rows; 55008's is the exception that shows
the scholar can still kill alone, rarely.

Baseline kills for comparison: 55005 day 121, Strike, by Carlos Diaz
(scholar, TB, 0 allies, won); 55006 day 113, Strike, by Nina Petrova
(scholar, TB, 0 allies, won) — both solo first-blood kills whose
killers died within 2 days (median first-killer survival 2d). Note the
pattern: every baseline kill was a lone scholar with no ally beside
them; every armed kill except 55008's had allies present.

**The 55007 trajectory (the seed that carries the GO):** an
auto-enrolled pair held days 8–47 (before wave 4 arrived — never fought
wave 4 together). The scholar asked Raj Patel to join on day 56
(accepted) and Miguel Santos on day 62 (accepted) — the staged pair.
First blood day 78: the scholar killed the Strike with both party
members beside them, rally fired, 10 rounds, won. Day 80 visjoin_77
killed the Congregation (second killer); day 81 Miguel killed the Strike
(third killer). Readiness-5 veterans ≥ 2 for 20 straight days (80–99):
the living pair banked. The scholar (gen_bpv3697) died day 82, four days
after first blood — the first killer still dies fast — but visjoin_77 and
Miguel lived on, so the pair held. Wave 5 was faced day 87 (Network
Note, lost), day 99 (Spoiler and Editor, lost), and day 100 visjoin_77
killed the Editor — a wave-5 monster, dead, in a turn-based fight the
scholar (by then Nikolai Volkov, after succession) survived. The village
still died day 110 (a wave-5 Rerun with no allies beside the scholar,
day 108, lost). The pair opened the door; it did not hold it open.

**What the pair cost:** nothing in survival — the armed leg lived longer
on median (109d vs 92.5d). The rally's round-1 strike cost did not show
up as a survival penalty at this scale.

## Village assessment (plain words)

A village that walks into the fourth wave with a friend beside it
finally kills the monsters that used to kill it. On one seed in eight
the whole chain ran: two people learned to kill the big beasts together,
stayed alive together for twenty days, opened the fifth wave, and killed
one of those too. On the other seven seeds the same lever bought more
companions, more rallies, and more fights — but the kills did not follow,
and on two seeds the village actually killed less than it did without
the lever. The lever is real and it is narrow: it fixes "alone in the
fight" (allies present 28% → 69%), but the fight itself is still a
slaughter — the scholar dies in 5 of every 6 wave-4 turn-based fights
even with friends beside them. The next blank is not company. It is what
happens inside the fight once the company is there: damage, staying,
and finishing.

## Sense-test read (armed leg, seed 55007)

**One wave-4 fight — day 78, the Strike, first blood.** The rally line
reads like a person taking charge, not a button: *"You plant your feet
and ROAR the line back together — 'ON ME! ON ME!' Fear drains out of
their faces. 'THE STRIKE — TOGETHER!' They turn as one."* The fight is
won in 10 rounds with both party members present, the scholar lives.
Then the broadcast: *"Raj, Miguel brought down The Congregation.
Together. (The village watches the broadcast. Nobody blinks.)"* and the
System, on camera: *"Oh — OH. Everybody saw that, right? Hemanth just
put down The Congregation... on CAMERA. That's a veteran kill, folks.
REMEMBER the name."* The fiction coheres: a called-together line, a
kill the whole village watches, a name remembered. It reads as the game
working as designed.

**One party invite — day 56, Raj Patel.** *"Raj joins your party.
'Yes. Absolutely. I've been hoping you'd ask.' (A little too
quickly.)"* And day 62, Miguel Santos: *"'I'd love to. Lead the way.'
(They're already checking your pack.)"* Both read as people with
character saying yes — eager, already practical — not as a menu
confirming. The refusals read as character too ("I work alone").

**Fiction findings (backlog, not this arm's business):**
- Kill credit in the broadcast line names a party member, not the
  killer: day 80 the broadcast says "Raj, Miguel brought down The
  Congregation" while the kill log credits visjoin_77 (the System's own
  line names Hemanth — visjoin_77's display name — so the System credits
  the killer and the broadcast credits the party). Day 84 the same split
  (broadcast "Miguel", log visjoin_77). Worth a check on who the
  broadcast is supposed to name.
- The System announced "a veteran kill" for the Loud Beast on day 82,
  but no wave-4 kill is in the log that day — either the announcement
  fires for lower-wave kills too, or a kill went unlogged. Open question.
- "Miguel brought down Choir Toad, Choir Toad, Choir Toad, Choir Toad"
  (day 90) — one monster named four times, or four toads at once; the
  line can't tell which. Likely a pack kill, but the repetition reads as
  a stutter.
- The picket-line SHUTDOWN line repeats 20+ times in a single day
  (day 81) — one strike event flooding the transcript. Log noise, not a
  fiction break.
- The death-rite line parses correctly once read twice ("Chantal,
  Nikolai, Miguel speak for Luis — 'Raj trusted them'" = Luis speaks
  for the dead Raj). Archaic, not wrong.

## Metric review

Pre-registered metrics bind this run (prereg 35e8b3d). Primary: GO iff
armed leg banks a living pair (≥1 day with 2 living wave-4 killers) on
≥1 seed, OR post-first-blood wave-4 kills ≥3 on the armed leg. BOTH
held: pair on 55007 (20 days, readiness5.veterans ≥ 2, days 80–99);
post-first-blood kills 5 (all on 55007: days 80, 81, 84, 99, 100).
Guards: median survival armed 109d vs baseline 92.5d — not worse by
more than 10d; it is better by 16.5d. THIN checks run BEFORE GO/NO-GO:
T1 rally fires 36 ≥ 8 (clear); T2 ally presence 69.2% ≥ 40% with 52
fights (clear). Verdict GO per the preregged rule.
- No metric was swapped, re-cut, or re-thresholded after the run. The
  two seeds the smoke ran on (55001–55002, /tmp) are the same two seeds
  in the judged band — the smoke was unjudged Stage-0 verification, and
  the judged legs re-ran them from scratch with the frozen policy.
- Instrument notes: `pendingW4` = 0 on both legs — the pending hook
  never saw a wave-4 pending encounter, so the staged-pending share is
  unmeasured (null), not zero; the harness faces fights directly and
  pendings did not occur on this band. The `tbFights` rows carry the
  fight-level TB survival (17.3% armed); the old day-join secondary is
  retained under `tbSurvivalDayJoin` and is NOT cited.
- The analyzer change after the prereg commit (leg-summary aggregation
  of `inviteQuestionsAnswered`) only surfaces an already-recorded
  count; no frozen metric changed.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: attempted; refuses without a panel
  directory (`Error: --out <panel-directory> required`) and takes no
  corpus input. No Game-root change exists in this arm (policy A/B on
  identical seeds is the comparison), so no compare `.md` is fabricated
  — same outcome as bankkiller.
- `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-06/perseed-stageally-a/*.json' --metrics
  national,table,wins,exiled`: REFUSED — "refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit, so they are
  sweep recorder rows, not runs." Recorded as the result, same as every
  prior killer-chain arm. No telemetry deviation check was possible on
  this corpus; the wall numbers above are the instrument's own.

## What this arm does NOT claim

- Not a general fix: the GO rests on 1 seed in 8; 5 of 8 armed seeds
  killed 0 wave-4 monsters, and 2 seeds killed less than their baseline.
  A confirm run on a fresh band is owed before anyone leans on this.
- Not a win: 0 wins either leg; the wave-5 kill did not become a win,
  and the village still died day 110 on the best seed.
- Not first-killer survival fixed: median 5d vs the 19d bar; the first
  killer on 55007 died 4 days after first blood. The pair survived
  because the SECOND and THIRD killers lived, not because the first did.
- Not a field-fight fix: field fights killed 0 wave-4 monsters on both
  legs; every kill came from a turn-based fight with the scholar in it.
- Not a rally proof in the wild beyond this band: rally fired 36/36
  when its condition held, but the condition (ally present) is itself
  the thing staging buys.
- The 40-day proof smoke and the 2-seed Stage-0 smoke are not evidence;
  only the judged 8+8 legs above are.

## Next blanks (for the loop, not this arm)

1. **Confirm on a fresh band** — the GO needs a second band before it
   is trusted; 55007 could be a lucky seed.
2. **Fight interior, now that company is there** — TB survival is still
   17.3% with allies present; damage, staying, and finishing inside the
   fight are the next instruments (secondkiller's finishing bind, still
   open: 43 of 52 armed TB fights lost).
3. **First-killer survival** — median 5d; the pair forms only when later
   killers survive the first one's death. The rest-killer lever was
   killed at pilot; retreat-and-refind is policy-only and unconfirmed.
4. **Why 55005/55006 went backwards** — more fights, more rallies, zero
   kills where baseline killed one each. Worth a look at what differed
   (gear? tricks? the scholar's build?) before the confirm run.
5. **Party vs succession** — the staged party is tied to the scholar;
   after succession the new scholar starts party-less (55007's party
   was 0 by day 100). Whether a party should persist across succession
   is a design question, not a measurement one.
6. **Pending encounters** — the pending hook recorded 0 wave-4 pendings
   on 16 runs; the "wait for a companion at the door" question stays
   unmeasurable this way (the NO WAIT finding stands: no engine verb
   exists for it).

## Proof and commits

- Proof `scripts/test-stageally-20261106.js`: 45/45 green before the
  judged run (fixtures + live legs; the live-invite leg asserts
  engagement, not acceptance — see prereg smoke note).
- Prereg + policy + instrument + driver + analyzer + proof committed
  35e8b3d5076cab804e6d11095eead4ce0363d431 (before any judged sim). The
  safe-commit index clobber hit on that commit (all 6 files shown
  staged-as-deleted after a correct commit); repaired with HEAD-blob
  cacheinfo, verified `git status` empty + `git diff HEAD` empty +
  hash-object matches.
- Analyzer fix after the prereg commit: leg-summary aggregation of
  `inviteQuestionsAnswered` (surfaces an already-recorded count;
  found by running the analyzer on Stage-0 smoke data). Committed with
  the corpus + this evidence.
- Judged corpus: `evidence/2026-11-06/perseed-stageally-a/` (16 files,
  8 baseline + 8 staged), all with 0 instrument errors.
