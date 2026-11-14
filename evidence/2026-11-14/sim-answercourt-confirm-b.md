# sim-answercourt-confirm-b — EVIDENCE (CONFIRM of the pilot GO)

Run: fleshout-loop-b-20261114T1945Z (Loop B), arm sim-answercourt-confirm-b.
Adopted and finished by run fleshout-loop-b-20261114T2130Z (see recovery note).
Axis: winnability chain. CONFIRM arm — the pilot's exact lever, judged again
on a FRESH 16-seed band (100201–100216), 150d, 16 seeds × 2 policies.
Prereg: evidence/2026-11-14/sim-answercourt-confirm-b-prereg.md (binding).

## Verdict: NO-GO — on the pre-registered cost bar ONLY

- **G1 INSTRUMENT VALIDITY — GO.** 0 instrument errors both legs; 0
  unattributed diplomacy points AND steps, up and down, both legs; 0
  unclassified links (60 links per leg: 44 seasoned-and-counted,
  14 seasoned-but-no-polity, 1 never-seasoned-trust<10, 1 still-young-at-end);
  answerNationalChoice calls armed 15, baseline 0.
- **G2 THE LEVER — GO, by a wide margin.** NATIONAL EVER armed **13/16**
  vs baseline **0/16** (bar: armed ≥8/16 AND baseline ≤3/16).
  First-national days 62–74 — every one inside the canon window (day 61–90).
  End-state national 8/16 armed vs 0/16 baseline; median held-days 46 armed
  vs 28.5 baseline.
- **G3 LEVER-ONLY — GO.** Zero `src/js` changes in the branch diff; proof
  test `scripts/test-answercourt-confirm-b-20261114.js` green: §1 static
  85/85, §2 game 26/26 (60d smoke on 100201, both policies).
- **COST BAR — FAILS, by one death.** Starvation deaths pooled: armed **6**
  vs baseline **3**; the bar allows armed ≤ baseline + 2 = 5. Miss by one.
  Median survival passes: armed 121.5d vs baseline 124.5d (0.98×, bar ≥0.8×).
  Guardrail: no seed's armed deaths exceed its baseline deaths by >50%
  (worst +34%, seed 100216).

So the pilot GO is **contested on cost, not on efficacy**. The lever works —
it takes villages from 0/16 national to 13/16 on a fresh band twice the
pilot's size — but as staged it starved one villager too many for the bar as
written. Per §14 the bar is not re-scored mid-run; the miss stands, and the
metric review below proposes the revision for the next run. The coordinator /
main session decides whether to accept the cost, widen the bar on a bigger
band, or shape the lever (e.g. a cheaper court when the pantry is thin)
before any landing.

## Stale-lock recovery note (adoption)

The 1945Z coordinator died mid-run (last heartbeat 20:45Z). The 2130Z run
recovered the lock and this arm was adopted from the stranded worktree.
State found and verified before acting: the confirm sweep had run all 32
cells — the sweep log
(evidence/2026-11-14/answercourt-confirm-b-sweep.log) holds one-line JSON
summaries for all 32 — but 12 cells existed only as 0-byte `.tmp-*` files
(write-flap signature: the driver's `writeRobust` retried 480× then fell
back to printing the full JSON to stdout, which the sweep log captured as
`@@FALLBACK` blocks). Seed 100216 had in fact run both policies (the
coordinator's handoff said it had not — its snapshot was stale).

Recovery, in order:
1. **Determinism check FIRST:** re-ran seed 100209, both policies, into a
   scratch dir. Both re-run files were **byte-identical** to the existing
   finals. Determinism confirmed, not assumed.
2. **Filled only the 12 broken cells**, one driver invocation per cell
   (100201 answercourt; 100202–100206 both policies; 100207 scaleclimb).
   No good cell was ever overwritten. After each fill the new file was
   verified to parse as JSON, match its sweep-log summary line, AND match
   the `@@FALLBACK` full JSON in the sweep log **byte for byte** (trailing
   newlines trimmed). All 12 matched.
3. Deleted the 12 zero-byte `.tmp` files only after their finals existed
   and parsed. Final state: exactly **32 final .json files, zero .tmp**.
   (One stray 0-byte `flap-probe2.txt` from the dead run's flap probe
   remains in the per-seed dir, uncommitted — a probe artifact, not a cell.)
4. Ran the analyzer and the panel builder; ran the proof test green;
   wrote this evidence file.

The refilled cells are the original run's own numbers, reproduced exactly —
not new data. Nothing about the sweep was re-run, re-seeded, or re-judged.

## The lever (frozen — the pilot's exact lever)

Baseline `competent-scaleclimb-b` vs armed `competent-answercourt-b`
(scaleclimb verbatim as its courtship core plus ONE addition: answering
every staged national beat — lead feast / conquest mercy / belong swear /
covenant pact / trade sign — at the start of the armed daily). Policies
byte-identical to the pilot branch tip ed6df749e (proof test hashes them).
Zero src/js changes, zero policy edits. Env: defaults (COUNTER_ANSWER,
COMPETENT_FLEE_REPAIR, ANSWERMAIL_DRIVE all unset, as in the pilot).

## Per-seed before/after table

Columns: days survived (150d horizon, death-aware) · end · end scale ·
national ever · first national day · national held days · held days
(diplomacy > 0) · starvation deaths · total deaths · villager combat deaths
· max wave · standing. B = baseline (scaleclimb), A = armed (answercourt).

| seed | days B/A | end B/A | scale B/A | natEver B/A | firstNat A | natHeld A | heldDays B/A | starv B/A | deaths B/A | vCombat B/A | maxWave B/A | standing B/A |
|------|----------|---------|-----------|-------------|-----------|-----------|--------------|-----------|------------|-------------|-------------|--------------|
| 100201 | 124/150 | lost/surv | regional/national | no/yes | 62 | 90 | 83/110 | 1/0 | 68/50 | 55/47 | 4/4 | 199/199 |
| 100202 | 120/120 | lost/lost | regional/regional | no/no | — | 0 | 0/0 | 0/0 | 116/116 | 104/104 | 5/5 | 395/395 |
| 100203 | 135/150 | lost/surv | regional/regional | no/yes | 62 | 28 | 43/48 | 0/1 | 64/76 | 51/68 | 4/5 | 199/350 |
| 100204 | 137/140 | lost/lost | regional/regional | no/yes | 68 | 71 | 62/72 | 0/1 | 99/99 | 85/86 | 4/4 | 175/199 |
| 100205 | 105/68 | lost/lost | regional/national | no/yes | 62 | 7 | 54/27 | 0/0 | 68/56 | 56/43 | 5/4 | 275/199 |
| 100206 | 138/137 | lost/lost | regional/regional | no/yes | 62 | 72 | 21/84 | 0/0 | 82/75 | 61/59 | 4/5 | 199/395 |
| 100207 | 117/103 | lost/lost | regional/national | no/yes | 74 | 30 | 32/31 | 0/1 | 82/67 | 70/62 | 5/4 | 275/199 |
| 100208 | 150/132 | surv/lost | regional/national | no/yes | 64 | 57 | 61/57 | 0/0 | 52/69 | 41/55 | 4/5 | 199/452 |
| 100209 | 91/91 | lost/lost | regional/regional | no/no | — | 0 | 0/0 | 0/0 | 66/66 | 60/60 | 5/5 | 255/255 |
| 100210 | 121/121 | lost/lost | regional/regional | no/no | — | 0 | 0/0 | 0/0 | 66/66 | 57/57 | 4/4 | 199/199 |
| 100211 | 145/150 | lost/surv | regional/national | no/yes | 63 | 68 | 10/69 | 0/0 | 108/91 | 90/74 | 5/4 | 570/199 |
| 100212 | 150/150 | surv/surv | regional/regional | no/yes | 65 | 77 | 64/78 | 0/0 | 55/56 | 46/47 | 4/5 | 199/225 |
| 100213 | 85/104 | lost/lost | regional/national | no/yes | 62 | 43 | 25/44 | 0/0 | 78/87 | 65/76 | 5/5 | 447/597 |
| 100214 | 138/80 | lost/lost | regional/national | no/yes | 62 | 19 | 77/28 | 0/0 | 104/90 | 97/80 | 5/5 | 570/431 |
| 100215 | 125/122 | lost/lost | regional/national | no/yes | 65 | 58 | 25/59 | 0/0 | 74/86 | 69/74 | 4/4 | 199/199 |
| 100216 | 100/105 | lost/lost | regional/regional | no/yes | 63 | 34 | 8/38 | 2/3 | 56/75 | 50/69 | 5/4 | 220/199 |

Medians: survival 124.5d baseline / 121.5d armed; held-days 28.5 / 46;
national held-days 0 / 38.5. Survived the horizon: 2/16 baseline, 4/16
armed. Three seeds are identical on both legs to the death (100202, 100209,
100210 — same days, same deaths): before any national beat stages, the
armed policy plays exactly the scaleclimb core, as designed.

## Verb / shape table (band totals)

| verb (caller) | baseline calls | armed calls | trust moved |
|---------------|----------------|-------------|-------------|
| proposeLink (policy) | 54 | 54 | — |
| _formLink (policy) | 54 | 54 | — |
| answerAccord (policy) | 46 | 46 | +460 |
| tendLink (policy) | 178 | 188 | +1048 |
| tendLink (engine) | 55 | 58 | +440/+464 |
| hostFeast (engine) | 17 | 17 | — |
| answerCounter (policy) | 8 | 8 | — |
| breakLink (engine) | 8 | 4 | — |
| **answerNationalChoice (policy)** | **0** | **15** | — |

Shapes answered (armed): **lead 15, conquest 0, belong 0, covenant 0,
trade 0, unknown 0** — all 15 the lead shape, all the 'feast' answer, all
'sat'. Two seeds staged a second beat and answered it too (100208, 100211 —
2 answers each). No other shape staged on this band, same as the pilot:
the per-shape answers for conquest/belong/covenant/trade remain proven
only by the fake-Game unit tests. Global beats: armed pendingGlobal days
552 — global beats staged and were correctly NOT answered (strict
isolation, as preregistered); baseline global pending days 0 because the
baseline never reaches national at all.
Pending-national days: armed **15** (one day per beat — answered the
morning after staging) vs baseline **823** (beats sat unanswered for
weeks; the defect the lever fixes).

## Wall numbers (every run)

| | baseline | armed |
|---|----------|-------|
| National ever | 0/16 | **13/16** |
| National at end | 0/16 | 8/16 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave 4 reached | 16/16 | 16/16 |
| Wave 5 reached | 8/16 | 8/16 |
| Median survival | 124.5d | 121.5d |
| Survived horizon | 2/16 | 4/16 |
| Wave kills (w1/w2/w3/w4/w5) | 492/312/146/46/14 | 491/319/147/51/10 |
| Total deaths | 1238 | 1225 |
| Villager combat deaths | 1057 | 1061 |
| Starvation deaths | 3 | 6 |

No seed won, no seed reached the table on either leg: national is now
reachable (13/16 armed) but the road past national — standing, the table —
still never fires in 150 days. The scale wall has moved one rung up, not
fallen. Wave-5 facing is unchanged (8/16 both legs); the lever touches
diplomacy only, and the fight numbers barely move (combat deaths 1061 vs
1057, wave kills within a few of each other on every wave).

## The cost-bar miss, in detail

The three extra armed starvation deaths, and what can honestly be said
about each:

- **100216, Elena Petrova, day 98.** The village was already food-stressed:
  the baseline leg starved two villagers on days 33 and 39, and the armed
  leg starved the same two people on the same days (identical play before
  the beat). The armed leg's third death comes 35 days after the day-63
  national feast (5,000 kcal out of the shared granary). The feast is the
  plausible channel here — a hungry village paid for its court in food.
- **100203, a visiting joiner, day 136.** The feast was day 62; the village
  held national 28 days, dissolved day 89, and the death came 47 days
  later. No clean line from feast to death.
- **100204, a visiting joiner, day 140.** Feast day 68, national held 71
  days to the village's last day. Same story: late, after a long hold,
  no clean line.
- The other direction: baseline starved Benoit Lambert on 100201 day 111
  where the armed leg starved nobody.

Net: +3 starvation deaths, of which one (100216) has a credible mechanism
(the feast's 5,000 kcal from a thin pantry) and two are late-horizon
visitor deaths with no visible mechanism. The bar counts totals, and the
totals miss by one. That is the verdict as pre-registered.

## Holding after the court (the pilot's open question)

13 villages reached national; 8 still held it at the end; **5 dissolved**:

- 100203 — held 28 days, dissolved day 89, village survived to day 150.
  **Dissolution now HAS a played line** (the pilot's gap is closed on this
  seed): day 89 the fires drift — "Emberhold's fire is drifting from ours
  — their speaker doesn't linger at the gate the way they used to" — then
  "📡 The world feed goes quiet — the summons dies with the realm that
  earned it. The galaxy watched a fire that is out." and "◈ The realm came
  apart — no polity answers to Haven now, and Haven is a free fire again.
  National no longer describes this village. The climb starts over."
  The village then kept living as a regional fire for 60 more days — it
  did not re-climb.
- 100212 — held 77 days, dissolved ~day 142, village survived to day 150.
  No dissolution line was captured — but the capture caps at 600 link
  lines and this file had already hit the cap before day 140, so the line
  may exist in the engine and simply not have been recorded. Instrument
  limit, not evidence of silence.
- 100204, 100206, 100216 — dissolved 1–9 days before the village itself
  fell (held 71d / 72d / 34d). The polity came apart just ahead of the
  village; whether the dissolution weakened the village or the same
  pressure killed both is not visible in the captured lines.

Dissolution is therefore a live second problem: even when the court is
answered, roughly a third of realms (5/13) come apart inside the horizon,
and two of them come apart while the village lives on and never re-climb.
That belongs in the findings backlog, not in this verdict.

## Sense-testing (SENSE-TESTING LAW)

The First Court reads like a played ceremony, not a silent meter. Seed
100201, days 61–62:

> ◈ SYSTEM: "Four fires. One head. GOVERNANCE LAYER: online — polity
> tribute routing, the court calendar, famine reserves. You built a realm.
> Try not to lose it the way you found it."
>
> 👑 Speakers from Emberhold, Ashford, Stonebridge ride in for the first
> court — and every one of them is measuring you. FEAST them from a shared
> granary (5,000 kcal, no strings), HOST the court at Haven's fire (your
> speaker's time), or write the law in COLD ink (they'll pay more and love
> you less). Or REFUSE the scale itself — stay a free fire at regional,
> whatever that costs.
>
> 🍲 The shared granary opens: 5,000 kcal for every fire of the realm, no
> strings. Emberhold, Ashford, Stonebridge count it — and remember who fed
> them first. (Trust +10 with each.)

And the village reacts the next days — Liam, at the fire: "Speakers rode
in, ate our grain, and called us a realm. A REALM. I keep saying it to hear
how it sounds." The court lands as an event people talk about. The
dissolution lines quoted above are equally voiced when captured. What is
NOT voiced anywhere: why a specific subordinate's trust slid far enough to
break the realm — the drift warnings name the symptom ("their speaker
doesn't linger at the gate") but no villager ever says what Haven did wrong.
That silence is the remaining sense gap in the holding story.

Villager life around the courts is dense and human: the fire accuses Liam
of lying about being a veterinarian ("I wasn't veterinarian. I was farmer.
I'm sorry — I wanted a cleaner story than I had"), Pavel teaches the
sporefall counter at the fire, runners arrive with commons complaints
("Your foragers are stripping our side of the ground. Back off — or we'll
talk with teeth."), tribute wagons turn at a full gate ("Eat well — that IS
your tribute this week."). The early-game "Trust too low" refusals repeat
heavily in the first days, as before — the same line dozens of times — but
they give way to named, specific scenes once trust is earned.

## Balanced panel (§15)

Pseudo-panel compare attached:
evidence/2026-11-14/answercourt-confirm-panel.md (+ -before/-after
.json.gz pair). Decision **review_required** (16 paired cases): National
scale access 0 → 0.5 (paired delta +0.5, 95% interval 0.25–0.75);
village deaths per run −0.81 (no material signal); village deaths per 100
days +2.97 flagged regression_watch, but the interval (−3.44 to +10.41)
spans zero. Table win rate 0 → 0. Per the prereg, the panel compare is
invalid by contract for a policy lever and is built for the record only —
the driver numbers and the pre-registered G2 bar are the judge. The panel
does not overturn anything: it agrees national access moved and nothing
else moved materially.

## Metric review

1. **G2 measured the lever.** National-ever is a clean, binary, engine-read
   signal (scaleRank in the per-day series), and 13/16 vs 0/16 is not a
   borderline read. No metric change owed.
2. **The cost bar proved too tight for rare events.** A ±2 tolerance on
   starvation deaths — an event that happens 3–6 times per 16-seed leg —
   flips the verdict on a single death. The bar did its job as a guardrail
   (it caught a real cost channel on 100216), but as a verdict switch it is
   finer than the noise in the thing it measures. Proposed revision for the
   NEXT run (not this one): judge the starvation cost on the pooled
   24-seed evidence (pilot 8 + confirm 16: armed 7 vs baseline 4) with a
   rate-based tolerance, or widen the band tolerance to baseline + 4 on a
   16-seed band. Either revision must be written into the next prereg
   before the run, never applied to this one.
3. **Held-days and end-state national are the right alongside-reads.**
   They caught the real second problem (5/13 realms dissolve) without
   being allowed to re-score G2. Keep them as alongside reads.
4. **The 600-line linkLines cap is a blind channel for late events.**
   Seed 100212's dissolution (~day 142) left no captured line because the
   cap was already hit. Any future sense claim about late-horizon events
   needs either a higher cap or a targeted capture window. Not a verdict
   issue here — the dissolution itself is recorded in the per-day series.
5. **G1's attribution held.** Zero unattributed diplomacy points in either
   direction across 32 configs, and the episode-based attribution survived
   the flicker cases (100203/100212 dissolving and the two double-answer
   seeds). The instrument is sound.

## Village assessment (plain words)

Picture sixteen villages, all starting the same way: a fire, strangers
learning each other's names, the first hard weeks of foraging and tending.
On the old way of playing — the baseline — none of them ever became a
nation. Their speakers would court the neighbouring fires, tend the links,
watch the trust climb past 40, past 60 — and then the moment would come and
go unanswered. The beat sat there for weeks (823 pending days across the
band) while the village stayed a regional fire and, in fourteen of sixteen
cases, died that way: mostly killed in fights, a few starved, none seated
at any table.

With the court answered, thirteen of sixteen villages became nations. The
court itself is the hinge: speakers ride in, the granary opens, five
thousand meals' worth of food goes out to the realm, and the village hears
itself called a realm out loud. After that, the villages that held on lived
longer as nations than they ever lived as regionals — a median of 38 days
under the national flag. But the crown is heavy: five realms came apart
again, two of them while the village was still alive and healthy, and those
villages never climbed back. And the feast that buys the realm costs real
food — on the hungriest village it cost a life.

Nobody won. Nobody sat at the table. The game is still unwinnable in 150
days from these starts — national is now reachable, but the road from
national to the table never opened once. The wall moved, it didn't fall.

Who thrived: the villages that formed four links early and tended them
every week — 100201 held its realm all 90 days to the horizon; 100212 held
77 days. Who died: the villages that lost their fighters to wave-4 and
wave-5 monsters before the court could matter (100202, 100209, 100210 never
even got a polity to count), and the villages whose realm dissolved just
before the end (100204, 100206, 100216). The binding constraint is no
longer "can a village become a nation" — it is "can it hold the nation,
feed the court, and live long enough after it for the table to matter."

## Files

- Prereg: evidence/2026-11-14/sim-answercourt-confirm-b-prereg.md
- This evidence: evidence/2026-11-14/sim-answercourt-confirm-b.md
- Analysis: evidence/2026-11-14/answercourt-confirm-b-analysis.json
- Panel: evidence/2026-11-14/answercourt-confirm-panel.{json,md},
  answercourt-confirm-panel-before.json.gz,
  answercourt-confirm-panel-after.json.gz
- Per-seed JSON: evidence/2026-11-14/perseed-answercourt-confirm-b/
  (32 files, 16 seeds × 2 policies)
- Sweep log: evidence/2026-11-14/answercourt-confirm-b-sweep.log
  (32 one-line summaries + 12 @@FALLBACK full-JSON blocks from the dead run)
- Proof: scripts/test-answercourt-confirm-b-20261114.js (85/85 static,
  26/26 game)

## Convergence state

CONFIRM — verdict NO-GO on the pre-registered cost bar (starvation 6 vs 3,
bar ≤5); G1 GO, G2 GO (13/16 vs 0/16), G3 GO. The pilot GO is contested on
cost, not efficacy. Next step is a design/steering call, not another
measurement batch: accept the cost, widen the bar per the metric review,
or shape the lever (cheaper court on a thin pantry). The dissolution
finding (5/13 realms come apart; 2 while the village lives on) goes to the
findings backlog as the next axis question.
