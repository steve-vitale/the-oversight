# Talk-turn confirm — EVIDENCE (arm sim-talkturn-confirm-b)

Run: fleshout-loop-b-20261111T0330Z (Loop B). Axis: scale-onramp /
winnability chain (the polity half of sim-findings #2061).
Confirms the talkturn-a pilot
(evidence/2026-11-10/sim-talkturn-a.md). Policy-side instrument
only, zero src/js. Gates, prices, deeds, and readyDemand
untouched. No default flipped — landing the COMPETENT_TALK
default is a coordinator/Steve call; this run reports the
verdict only.

## Pre-registration (committed before any judged computation)

Full text: `evidence/2026-11-10/sim-talkturn-confirm-b-prereg.md`
(commit a9392bd47). In short: competent policy verbatim, fresh
band 150233–150248 (16 seeds), 150d death-aware horizon, armed
leg `COMPETENT_TALK=1` vs control leg (flag unset) on identical
seeds. Primary (conjunction): (a) armed second links > control
second links AND (b) zero armed seeds stalled at unanswered
counters. Cost bar (REVISED per the pilot's metric review):
deaths per 100 village-days armed <= control + 10%, starvation
armed <= control + 2, arm-only starvation <= 2, median survival
armed >= 0.8x control median. A GO primary with a failing cost
bar is HELD, not landed. Pilot gate: first 8 seeds
(150233–150240) before spending the remaining 8.

Band freshness: 150209–150216 NOT used — stays reserved for
tendexact-a (verified: tendexact-a is GO with its confirm NOT
spent, "the confirm is the next run's work"; no perseed files
for 150209+ exist — the reservation stands, so a fresh band was
required). 150217–150232 spent by counterconfirm-a. Freshness
search for 150233–150248 over all `evidence/*/sim-*-prereg.md`
and `evidence/*/sim-*.md`, all `perseed-*/` filenames,
`hidden_files/*.md` + `lever-claims/*.json`, and the 10 files
naming a forbidden/contaminated band list — ZERO hits anywhere.

## Verdict — NO-GO (primary half B failed; half A confirmed, cost bar passes)

Judged strictly against the prereg; no re-scoring.

- Primary (a): armed **15/16** seeds formed a second link (35
  via raise) vs control **0/16** — PASSES, by a wider margin
  than the pilot (7/8 vs 0/8). The talk flag's effect is
  confirmed on a second, fresh band.
- Primary (b): **FAILS** — armed stalled seeds **[150245,
  150247]**, 2 fresh counters never answered, 18 blocked
  re-knocks, 263 pending-counter days on the armed leg vs 0 on
  control. The prereg anticipated exactly this case: a stall is
  a counter-wall instance, not a talk failure — but under the
  header as written, the conjunction fails, so the verdict is
  NO-GO, with the mechanism named and the remedy being the
  already-confirmed COUNTER_ANSWER lever (GO, a581b3778), not a
  re-score.
- Cost bar: **PASSES** — deaths/100 village-days armed 68.90
  vs control 63.66 (cap 70.03); starvation 1 vs 9; arm-only
  starvation 0; median 149 vs 118.5 (floor 94.8).
- The pilot-gate (first 8 seeds) passed on its own: armed 8/8
  vs control 0/8 second links, zero armed stalled, cost bar
  pass (70.63 vs 70.18 per 100d) — so the confirm spend was
  earned, not assumed. The stalls arrived on the back half
  (150245, 150247), which is why the 16-seed confirm mattered:
  the 8-seed gate alone would have called this GO.

## Grounding verified in code before the judged confirm (not assumed)

Same as the pilot (unchanged instrument, unchanged legs):
`COMPETENT_TALK=1` is a switchable env gate in
`scripts/policies/competent.js` (`talkOn()`); `deepTalk` holds
up to 2 sittings/day, up to 5 real turns each; `pickTalkChoice`
takes `link:accept` as the fallback first live choice;
`talkScore` has NO pending-raise signal; `bondChoices` returns
nothing at commLevel 'none'. Pilot proof re-run on current
master before any judged seed: `scripts/test-talkturn-a.js`
11/11 PASS (flag-ON miniature takes real held turns, flag-OFF
byte-identical to plain competent) — the legs reproduce.

## THE TALK-TURN ANSWER, CONFIRMED — AND THE WALL BEHIND IT (plain words)

Sitting down to talk answers the mail. Again. On sixteen fresh
villages, fifteen grew a second friendship once the scholar
stayed for the conversation instead of walking out of it — most
grew three or four, one grew eight — against zero on the
sixteen twins where the scholar kept walking out. Fourteen of
the sixteen first friendships came from a villager's own ask
being answered, days 7–32, not from the System's grant. Twelve
villages grew into polities, fires under one head, against none
on the control band. The villages live longer (median 149 days
against 118) and stand taller (standing up to 895 against a
control ceiling of 460). They also fight and travel more once
linked — expedition deaths 450 against 253, combat 357 against
167 — at a daily death rate 8% above control, inside the bar,
and they starve less (1 starvation death against 9): the linked
villages eat; the unlinked ones starve. One control village
(150241) died at 53 days with 6 starvation deaths and no link
at all, while its talking twin survived the season with five.

But the confirm caught what the pilot and the gate could not:
on two of the sixteen villages, the conversation hit a second
wall behind the first. A villager asks, the scholar says yes,
and the other village answers "not on those terms" — a counter.
Nobody goes back to the table, because this flag only answers
the ask, it does not answer the counter. On 150247 the counter
came on day 10, the very first ask, and the village never grew
a second link at all in 137 days: seven asks answered yes,
seven counters, one ladder-granted link, and the diplomacy
simply stopped. On 150245 the counter came on day 17 and sat
for 133 of the 150 days — fourteen asks answered yes, thirteen
counters, and the village's second link came from the System's
grant, not from any villager. The talk flag opens the
diplomacy road. The counter is the next gate on it, and it is
already answered by the COUNTER_ANSWER lever — this confirm's
stalls are the exact class that lever closes (counterconfirm-a:
0 stalled on 16 seeds with it on). The pairing is the landing
shape, not the flag alone.

And the seat itself — national, the table, the win — is still
nowhere: 0/16 on both legs. Wave-5 unlocks 15/16 armed against
1/16 control; the road past regional is paved. Nobody has
walked it to the end.

## Per-seed table

| seed | leg | days | end | wave | standing | links | first link | second | stalled | ans acc/ref/exp | deepTurns | deaths (starv) |
|------|-----|------|-----|------|----------|-------|------------|--------|---------|-----------------|-----------|----------------|
| 150233 | armed | 140 | lost | 5 | 710 | 2 | village_0 d10 (raise) | YES viaRaise=0 | no | 1/0/0 | 1208 | 97 (0) |
| 150233 | ctrl | 150 | survived | 4 | 199 | 1 | village_0 d25 (ladder) | no | no | 0/0/12 | 0 | 101 (0) |
| 150234 | armed | 150 | survived | 5 | 555 | 4 | village_2 d13 (raise) | YES viaRaise=3 | no | 4/0/1 | 1353 | 70 (0) |
| 150234 | ctrl | 74 | lost | 4 | 199 | 1 | village_0 d26 (ladder) | no | no | 0/0/11 | 0 | 71 (0) |
| 150235 | armed | 150 | survived | 5 | 545 | 3 | village_0 d14 (raise) | YES viaRaise=1 | no | 2/0/2 | 1298 | 131 (0) |
| 150235 | ctrl | 150 | survived | 4 | 199 | 1 | village_0 d35 (ladder) | no | no | 0/0/11 | 0 | 96 (0) |
| 150236 | armed | 145 | lost | 5 | 420 | 4 | village_1 d23 (ladder) | YES viaRaise=3 | no | 3/0/14 | 1057 | 143 (0) |
| 150236 | ctrl | 115 | lost | 4 | 199 | 1 | village_0 d29 (ladder) | no | no | 0/0/4 | 0 | 99 (1) |
| 150237 | armed | 139 | lost | 4 | 199 | 3 | village_1 d14 (raise) | YES viaRaise=1 | no | 2/0/1 | 1179 | 63 (1) |
| 150237 | ctrl | 150 | survived | 4 | 199 | 1 | village_1 d58 (ladder) | no | no | 0/0/6 | 0 | 64 (1) |
| 150238 | armed | 150 | survived | 5 | 450 | 5 | village_1 d13 (raise) | YES viaRaise=3 | no | 4/0/1 | 1303 | 97 (0) |
| 150238 | ctrl | 128 | lost | 4 | 199 | 1 | village_1 d39 (ladder) | no | no | 0/0/16 | 0 | 84 (0) |
| 150239 | armed | 150 | survived | 5 | 300 | 4 | village_0 d13 (raise) | YES viaRaise=2 | no | 3/0/4 | 1268 | 100 (0) |
| 150239 | ctrl | 77 | lost | 4 | 199 | 1 | village_0 d34 (ladder) | no | no | 0/0/8 | 0 | 77 (0) |
| 150240 | armed | 79 | lost | 5 | 375 | 4 | village_0 d13 (raise) | YES viaRaise=2 | no | 3/0/2 | 680 | 78 (0) |
| 150240 | ctrl | 105 | lost | 4 | 150 | 1 | village_0 d44 (ladder) | no | no | 0/0/1 | 0 | 74 (0) |
| 150241 | armed | 150 | survived | 5 | 485 | 5 | village_spl_25 d32 (raise) | YES viaRaise=3 | no | 4/0/8 | 1248 | 78 (0) |
| 150241 | ctrl | 53 | lost | 4 | 100 | 0 | none | no | no | 0/0/8 | 0 | 46 (6) |
| 150242 | armed | 141 | lost | 5 | 395 | 8 | village_0 d7 (raise) | YES viaRaise=6 | no | 7/0/7 | 1211 | 99 (0) |
| 150242 | ctrl | 121 | lost | 4 | 199 | 1 | village_0 d31 (ladder) | no | no | 0/0/3 | 0 | 87 (0) |
| 150243 | armed | 148 | lost | 5 | 345 | 5 | village_1 d21 (raise) | YES viaRaise=3 | no | 4/0/2 | 1239 | 90 (0) |
| 150243 | ctrl | 116 | lost | 4 | 175 | 1 | village_1 d44 (ladder) | no | no | 0/0/17 | 0 | 55 (0) |
| 150244 | armed | 150 | survived | 5 | 895 | 4 | village_2 d12 (raise) | YES viaRaise=2 | no | 3/0/3 | 1377 | 117 (0) |
| 150244 | ctrl | 123 | lost | 5 | 460 | 1 | village_0 d49 (ladder) | no | no | 0/0/31 | 0 | 69 (0) |
| 150245 | armed | 150 | survived | 5 | 445 | 2 | village_3 d16 (raise) | YES viaRaise=0 | YES | 14/0/17 | 1324 | 104 (0) |
| 150245 | ctrl | 150 | survived | 4 | 199 | 1 | village_0 d38 (ladder) | no | no | 0/0/4 | 0 | 75 (0) |
| 150246 | armed | 90 | lost | 5 | 377 | 5 | village_0 d7 (raise) | YES viaRaise=3 | no | 4/0/6 | 821 | 101 (0) |
| 150246 | ctrl | 101 | lost | 4 | 199 | 1 | village_3 d40 (ladder) | no | no | 0/0/14 | 0 | 65 (0) |
| 150247 | armed | 137 | lost | 5 | 480 | 1 | village_0 d45 (ladder) | no | YES | 7/0/16 | 1179 | 99 (0) |
| 150247 | ctrl | 150 | survived | 4 | 199 | 1 | village_0 d46 (ladder) | no | no | 0/0/12 | 0 | 69 (0) |
| 150248 | armed | 150 | survived | 5 | 400 | 4 | village_1 d13 (raise) | YES viaRaise=3 | no | 4/0/7 | 1307 | 62 (0) |
| 150248 | ctrl | 67 | lost | 3 | 25 | 0 | none | no | no | 0/0/11 | 0 | 33 (1) |

Band: armed 15/16 second links (35 via raise), 161 stagings
(69 accepted / 0 refused / 91 expired / 1 pending-at-end);
control 0/16, 171 stagings (0 / 0 / 169 / 2 pending-at-end).
Second raises alone: armed 132 staged, 51 accepted, 0 refused,
80 expired; control 129 staged, 0 accepted, 0 refused, 127
expired. First-link source: armed 14 raise / 2 ladder; control
14 ladder / 2 none. Talk: armed 6,641 talks, 20,656 turns, 69
link picks, 17 bond picks, 110 talks with a raiser while a raise
was pending, 4,378 held sittings, 19,052 deep turns; control
1,922 talks, 0 turns, 0 link picks, 76 raiser-pending talks (all
walk-outs). Refusals: 0 on both legs — every answered raise was
accepted (69/69), the same picker property the pilot flagged:
`link:decline` is never reached as the fallback pick.

## The two stalled seeds (why half B failed)

**150247 — the counter takes the first ask and the village never
grows.** First propose d10 (village_0) returns 'counter'; 6
blocked re-knocks follow (d15, d19, d29, d37, d88, d127); the
counter sits pending 130 of 137 days. Seven raises answered
yes, zero formed via raise. The seed's only link is the
ladder's grant (village_0 d45) — the counter blocks the raise
path (`proposeLink` guard), not the ladder path
(`_ladderRewardLink` → `_formLink` bypasses propose). The
village dies at day 137 at standing 480, wave 5, with one link
and a 130-day-old unanswered negotiation on the table. This is
the counterconfirm-a stall class exactly (their control seeds
150219–150223), now observed under talk-only legs.

**150245 — the counter sits while the village grows around it.**
First link formed via raise d16 (village_3, Katarina brings
Ashford home); the next day's accepted raise (village_1, d17)
counters, and the counter sits pending 133 of 150 days through
12 blocked re-knocks (d26–d149). Fourteen raises answered yes,
thirteen counters, and the village's second link (village_0)
came from the ladder, not from any villager — the raise path
was dead from day 17. The seed still survives to 150 at
standing 445 with 2 links, so the stall here costs growth, not
the village. Together the two stalls are 2 fresh counters, 18
blocked re-knocks, 263 pending-counter days on the armed leg;
the control leg staged no counters at all (0 fresh, 0 blocked)
because without held conversations no raise is ever accepted
and `proposeLink` is never called — the counter wall only
exists once the talk wall falls.

## Wall numbers (this confirm)

Armed: wins 0/16, national 0/16, table 0/16, wave-4 unlocks
16/16, wave-5 unlocks 15/16, median survival 149d (8 seeds at
the 150d horizon), seasoned links max 4, polities on 12/16
seeds. Control: wins 0/16, national 0/16, table 0/16, wave-4
15/16, wave-5 1/16, median 118.5d (5 at horizon), seasoned
links max 1, polities 0/16. The wall moved at the polity/wave-5
layer and did not move at the national/table/win layer — same
shape as the pilot, on twice the seeds.

## Deaths: what the cost bar actually measured

Starvation: armed 1 vs control 9 — the talk flag costs nothing
in hunger; the unlinked control band starves more. Deaths per
100 village-days: armed 68.90 (1,529 / 2,219) vs control 63.66
(1,165 / 1,830) — +8.2%, inside the +10% cap, but closer than
the pilot's identical rates (0.707 vs 0.708); the armed excess
is expedition (+197) and combat (+190), the same "more living,
more exposure" shape, while villager combat is flat (520 vs
535) and player deaths are flat (134 vs 140). Raw totals (1,529
vs 1,165) would have failed the pilot's old raw-total clause by
364 — the revised per-day bar is what judges this honestly:
the armed villages lived 389 more days in total. Per-seed rates
range 0.42–0.99 on the armed leg, 0.46–0.87 on control; the
highest armed rate is 150240 (78 deaths / 79 days = 0.99),
which died young at wave 5 with 4 links. Median survival armed
149 vs control 118.5 (floor 94.8) — passes. Cause mix, armed:
villager combat 520, expedition 450, combat 357, the wild 104,
monster 39, a stranger 16, sickness 10, contest 7, wound 5,
alien 4, dehydration 3, thirst 2, starvation 1, remainder small.
Control: villager combat 535, expedition 253, combat 167, the
wild 120, monster 29, sickness 11, starvation 9, wound 8,
ambush 8, arena 6, stranger 5, contest 5, remainder small. No
cause moved alarmingly; no exotic killer; the armed leg's
excess is plain expedition + combat.

## Village assessment (plain words)

Picture sixteen villages where the scholar finally sits down —
and this time, on two of them, the conversation runs into a
wall the sitting itself cannot cross. Everywhere else the
picture is the pilot's, louder: by day 7–32 the first
friendship is asked for and granted by a villager's own voice;
by the end most villages hold three or four friendships, one
holds eight, and twelve of the sixteen have grown into
something with a shape — a polity, fires under one head,
seasoned over weeks. The villages live longer and stand taller
and starve less. Two villages tell the other story. On 150247
the very first ask is met with a counter-price, nobody ever
goes back to the table, and the village spends 130 days with a
negotiation sitting open and unanswered while its people keep
asking and being told yes and then no. On 150245 the counter
sits for 133 days while the village grows around it on the
System's grants instead of its own friendships. The road past
regional is paved now, but the seat itself is still unreached,
and the counter is the gate on the road that talking alone
does not open.

## Sense-test

- The answered raise reads like people. 150245, day 16:
  "⛓️ Katarina brings it home: Ashford bows to Haven — one
  organization, us primary. Tribute: 4,000 kcal/week. The
  relationship starts at trust 30. Everything from here is
  earned." A named villager carries the news; the System
  narrates the season it will take. The formation is followed
  by a real exchange, not a number: "You give Stonebridge 1,334
  kcal from Haven's bins — real food, honestly counted. Elena
  weeps, openly. 'The fire network. That's what it's FOR.'
  (Trust +4. They owe you — the ledger remembers.)"
- The ask itself still wears the thin template the pilot
  flagged, now on 299 captured lines across the band: every
  raise is the rumor variant — "I've heard good things about
  Ashford. We should link with them — we'd be stronger
  together." — the same sentence for every village, 10 distinct
  lines that differ only in the village name (Thornfield 52,
  Stonebridge 50, Emberhold 47, Ashford 45, The Hungry Road 30
  and II 27, The Bloodied 18, The Red Table 16). The `how`
  variants ('visit' / 'seen-nearby' / 'told') exist in code but
  never fired on this band either — the lore these villagers
  hold is still all rumor. With 69 raises now answered, the
  repetition is more audible than it was when they all expired.
- The counter stage line ("They won't bow to Haven. But
  they'll TAKE Haven — 5,000 kcal/week, them primary. That's
  the offer.") is NOT in this corpus's captured say-lines: the
  confirm driver copied the pilot's say-wrap regex, which lacks
  the counterconfirm driver's `counter|sweeten|table is set`
  addition — the same gap counterconfirm-a half-fixed (stage
  line yes, sweeten line still no). The stall mechanism is
  proven by the instrument records instead (proposeCalls with
  day, target, outcome + daily pending-counter snapshots) — the
  words were said in the engine (the counterconfirm proof test
  exercises the same `answerCounter` path), but this corpus
  cannot quote them. A future instrument should carry the
  counterconfirm say-wrap.
- The formation line still repeats verbatim per link (40
  quoted, same sentence, same tribute, same trust 30) — the
  template repetition, now more audible at 40 formations. And
  the ladder's grants narrate identically to raise-formed
  links ("Phichit brings it home: Stonebridge bows to Haven"),
  so a reader of the transcript cannot tell which links came
  from a villager's ask and which from the System's grant — the
  analyzer knows (viaRaise split), the words do not.
- No robotic villager behavior was flagged by this arm's corpus
  beyond the template repetition above. The refusals never
  happening (0/69) is a picker fact, not a behavior verdict:
  `link:decline` sits second in the menu and the fallback pick
  takes the first, so the scholar on this band is
  constitutionally incapable of saying no to a link ask.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

1. The primary half (a) held up on a fresh band: 15/16 vs 0/16
   separates cleanly, the mechanism (link picks → accepts →
   formed links) is visible in the corpus, reconciliation went
   0 bad with zero instrument errors on all 32 cells. No bar
   needs lowering or raising.
2. The stall half (b) behaved as designed: it caught a real
   second wall (2 fresh counters, 18 blocked re-knocks, 263
   pending-counter days) that the 8-seed gate could not see.
   But it is worth naming plainly that half (b) is not a
   property of the talk flag — it is a property of the
   negotiation the talk flag unlocks. A future confirm of a
   talk-adjacent lever should either carry the counter lever on
   both legs (as counterconfirm-a did) or pre-register the
   stall half as a diagnostic, not a GO gate — otherwise every
   talk confirm will NO-GO on the counter wall it exposes.
   This run does NOT re-score under that reading; the NO-GO
   stands as judged.
3. The revised cost bar behaved as designed: the per-day form
   passed at +8.2% where the pilot's raw-total clause would
   have failed by 364 deaths. The margin narrowed vs the pilot
   (identical rates then, +8.2% now) — the next run should
   watch whether the expedition/combat excess grows with more
   links, or stays a fixed cost of living longer. Keep the
   per-day form.
4. Instrument notes, both disclosed, neither affecting the
   verdict: (a) the per-seed `ms` timing in the driver log is
   meaningless under the harness frozen clock (negative and
   wild values) — a log-line field only, never in the JSON;
   (b) the talk recorder caps `talkEvents`/`turnEvents` at 200
   per seed (pilot's note, carried — headline counters are
   uncapped and exact); (c) the say-wrap regex gap (sense-test
   above): the counter stage line is not captured — carry the
   counterconfirm regex next time; (d) the analyzer's `wallOf`
   `survivors` field counts `endReason === 'horizon'`, but the
   driver records the end as `'survived'` — the field reads 0
   on both legs while 8 armed / 5 control seeds actually
   reached the 150d horizon; the median and the day counts are
   the honest read, and the field should be fixed or dropped
   next time.
5. The ladder bypasses the counter guard: a pending counter
   blocks `proposeLink` (the raise path) but the ladder's
   `_ladderRewardLink` → `_formLink` grants links directly —
   that is why 150245 still grew a second link and 150247 got
   its only link while stalled. Whether the ladder should also
   wait on an open counter is a design question, not a defect
   claim — recorded here so nobody mistakes "stalled" for
   "no links at all."

## Balanced panel (§15)

Built from this checkout with the harness live on both panels
(competent policy, the 16 confirm seeds 150233–150248, 150d;
before = COMPETENT_TALK unset, after = COMPETENT_TALK=1,
declared as the intervention flag (`--intervention-flags
COMPETENT_TALK`). Compare:
`evidence/2026-11-10/talkturn-confirm-panel-compare.md` —
decision **review_required**; panels:
`evidence/2026-11-10/talkturn-confirm-panel-before.json.gz` and
`talkturn-confirm-panel-after.json.gz` (16 paired cases each, 0
errors). The review_required is carried by TWO
regression_signal rows: village deaths per run 72.81 → 95.56
(+22.75, interval 14.94 to 30.06) and sampled hungry NPCs
0.0155 → 0.0468 (+0.0313, interval 0.0178 to 0.0443). Deaths
per 100 calendar days is regression_watch (+3.71, interval
−10.27 to 15.90). Table win/entry/sitting and national access
all 0 → 0. Per §15 the panel is evidence, not the judge: it
does not override the pre-registered verdict (NO-GO on the
counter half, cost bar pass). The investigation notes: (1) the
deaths-per-run signal is the same longer-life shape the corpus
cost bar reads per-day (+8.2%, inside the cap) — villages live
longer, so they accumulate more deaths per run; the per-day
interval includes 0. (2) The hungry-NPC signal is new: sampled
hunger share triples while starvation deaths fall (1 vs 9 in
the corpus) — a tension, not a contradiction: point-in-time
hunger vs starvation outcome; linked villages may carry more
mouths through lean periods without tipping into deaths. It is
recorded here as an investigation note for a food-economy arm,
not re-scored into this verdict. Positive moves (descriptive /
no-signal): first bearer survives through day 30 0.375 → 0.75;
eligible NPC named-class access 0.157 → 0.288; accepted player
ability events 65.5 → 117.6. Table reach (raw, display only):
invitations 14/16 → 16/16, sittings 0/16 → 0/16.

## Telemetry deviation check (body step 10)

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-10/perseed-talkturn-confirm-b/*.json'
--metrics national,table,wins,exiled` REFUSED the corpus — all
32 per-seed rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs, and the tool compares recorder corpora
with sweep-compare tables, never against a run baseline. Not
forced with --allow-recorder-corpus and the scale-wall baseline
was NOT re-seeded from this corpus (that would corrupt a run
baseline with recorder rows). Same outcome as counterconfirm-a.
The balanced-panel compare above is the §15 instrument for this
arm; no LOUD lines exist to report.

## Pilot gate (first 8 seeds, 150233–150240)

Passed on its own before the remaining 8 were spent: armed
8/8 second links (15 via raise) vs control 0/8; zero armed
stalled; first link via raise 7/8 armed vs 0/8 control;
answered 22/0/25 armed vs 0/0/69 control; deaths/100d 70.63
vs 70.18; starvation 1 vs 2; median 147.5 vs 121.5; wave-5
7/8 vs 0/8; polities 7/8 vs 0/8; cost bar pass. The stalls
arrived on the back half (150245, 150247) — the 16-seed
confirm earned its keep.

## Next blanks, in order

1. **Pair the talk flag with the counter answer (the landing
   shape).** COMPETENT_TALK=1 answers the mail (confirmed on
   two bands: 7/8 + 15/16 vs 0); COUNTER_ANSWER=1 closes the
   negotiation (confirmed GO, a581b3778, 0 stalled on 16 seeds
   with talk on both legs). The landing candidate is the pair
   as the competent default — a coordinator/Steve call, as a
   policy decision, not a src/js change. Do NOT move
   readyDemand numbers or any win price/deed gate on this
   evidence.
2. **Seat the raiser (the 150206 fix, NAMED not built).** The
   pilot's named fix still stands: `talkScore` prefers
   strangers/least-talked-to, so a trusted raiser can still be
   passed over. No 150206-class total failure appeared on this
   band (worst armed seed still answered 1 raise), but the
   mechanism is unchanged.
3. **A picker that can say no.** 69/69 accepts (96/96 across
   pilot + confirm) is a property of the fallback pick, not 96
   considered decisions. If the design wants refusals to be
   possible from the scholar's side, the choice picker needs a
   score-based accept/decline — a design question.
4. **The rumor template.** 299 raise lines, 10 distinct, all
   rumor. The `how` variants exist; the lore is all secondhand.
   Whether raises should sometimes cite a visit or a telling —
   and whether the line pool needs widening now that raises get
   answered — is a voice note for a later pass.
5. **The ladder/counter bypass.** See metric review (5): should
   a ladder grant wait on an open counter? Design question.

## Findings for the coordinator

- **COMPETENT_TALK=1 ANSWERS THE MAIL — CONFIRMED ON A SECOND
  BAND (primary half A 15/16 vs 0/16).** Second links formed
  on 15/16 armed seeds (35 via raise) vs 0/16 control; first
  link via raise on 14/16 armed vs 0/16 control (ladder on
  14/16 control, none on 2); polities on 12/16 armed vs 0/16
  control; wave-5 unlocks 15/16 vs 1/16. (This arm.)
- **CONFIRM NO-GO ON THE COUNTER HALF (primary half B).** Two
  armed seeds stalled at unanswered counters (150245: counter
  d17, 133 pending days, 12 blocked re-knocks; 150247: counter
  d10, 130 pending days, 6 blocked re-knocks, no second link
  at all). Cost bar passes. The stalls are the counter wall,
  already closed by COUNTER_ANSWER (GO a581b3778). (This arm.)
- **COST BAR PASSES UNDER THE REVISED PER-DAY FORM.**
  Deaths/100d 68.90 vs 63.66 (+8.2%, cap +10%); starvation 1
  vs 9; arm-only starvation 0; median 149 vs 118.5. The old
  raw-total clause would have failed by 364. (This arm.)
- **WALL: POLITY/WAVE-5 MOVED, NATIONAL/TABLE/WINS STILL 0.**
  Armed wins 0/16, national 0/16, table 0/16; wave-5 15/16 vs
  1/16; polities 12/16 vs 0/16; median survival 149 vs 118.5.
  (This arm.)
- **THE LADDER BYPASSES THE COUNTER GUARD (mechanism).** A
  pending counter blocks `proposeLink` but the ladder's
  `_ladderRewardLink` → `_formLink` grants links directly —
  150245's second link and 150247's only link came from the
  ladder while stalled. Design question, not a defect claim.
  (This arm.)
- **CONTROL VILLAGES STARVE (observation).** Starvation deaths
  9 control vs 1 armed; 150241 control died at 53d with 6
  starvation deaths and no link while its armed twin survived
  to 150 with 5 links. Linked villages eat; unlinked ones
  starve. Worth a look by a food-economy arm, not this one.
  (This arm.)

## Proof and landing

- Prereg: `evidence/2026-11-10/sim-talkturn-confirm-b-prereg.md`
  (commit a9392bd47).
- Instrument + driver + analyzer + proof:
  `scripts/talkturn-confirm-driver-20261110.js`,
  `scripts/talkturn-confirm-analyze-20261110.js`,
  `scripts/test-talkturn-confirm-b.js` — proof 11/11 PASS
  (commit cc61e53b1). Reuses
  `scripts/secondlink-instrument-20261110.js`,
  `scripts/secondlink-analyze-20261110.js`, and the pilot
  analyzer's `analyzeSeedTalkturn` unchanged.
- Pilot legs reproduction: `scripts/test-talkturn-a.js` re-run
  on current master 11/11 PASS before any judged seed.
- Corpus: `evidence/2026-11-10/perseed-talkturn-confirm-b/`
  (32 files: 16 armed + 16 control), summary
  `evidence/2026-11-10/talkturn-summary-talkturn-confirm.json`.
- Balanced panel (§15): `evidence/2026-11-10/talkturn-confirm-panel-before.json.gz`,
  `talkturn-confirm-panel-after.json.gz`,
  `talkturn-confirm-panel-compare.md` +
  `talkturn-confirm-panel-compare.json` (decision
  review_required; `cases/` caches NOT committed, per §15).
- Gate-8 summary saved at `/tmp/ttc-gate8-summary.json`
  (worktree-external scratch — the numbers are quoted in this
  evidence under "Pilot gate").
- Logs: `/tmp/ttc-smoke-armed.log`, `/tmp/ttc-gate-armed.log`,
  `/tmp/ttc-gate-control.log`, `/tmp/ttc-rest-armed.log`,
  `/tmp/ttc-rest-control.log`, `/tmp/ttc-analyze16.log`
  (worktree-external scratch — not committed).
- Zero src/js changed. Base at spawn ad6a04b27; master moved
  during this run — branch rebased onto the explicit current
  master SHA (read in the main tree immediately before
  rebasing), proof re-run green after the rebase. Commits to be
  merged locally by the coordinator; report 'committed in
  worktree, pending coordinator merge'.
- Infrastructure incident (own goal, recovered): the confirm
  proof's refuse-guard test planted its file on seed 150233 —
  a real corpus cell. On the post-commit proof re-run it
  overwrote then deleted the judged 150233-armed cell. The cell
  was restored byte-identical from the corpus commit
  (4fb33526; verified: seed 150233, armed, 140 days, 2 links,
  0 instrument errors, anchor cc61e53b1e8e) and the test was
  fixed to plant seed 150299, outside the band, so it can never
  collide with a judged cell again. The summary JSON was
  generated before the deletion and still describes the full
  32-cell corpus.

## Convergence state

**NO-GO on the confirm conjunction; the talk lever itself is
confirmed.** Two bands now agree (pilot 7/8, confirm 15/16 vs
0/0) — the talkturn lever is converged as a measurement. The
confirm conjunction fails on the counter half, which is a
different lever's wall. No further talk-only confirm is owed;
the next step is the pairing decision (blank 1), a
coordinator/Steve call.
