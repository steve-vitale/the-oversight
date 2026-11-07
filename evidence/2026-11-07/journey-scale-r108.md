# Journey-scale r108 — run note

Lane A leg 3 SCALE (days 80–140), run `laneA-20261107T0845Z`. Base master
`8ee8dcfb6` (r114 deepening merge: langGate bond/link decisions + clear
decided asks). Rotation 3 → 0 at closeout.
Prereg: `evidence/2026-11-07/journey-scale-r108-prereg.md` (binding,
committed 1adf7da57 before any scored seed).

## Pre-registration (summary)

**Q1 (PRIMARY, binding): does answering link raises move the scale outcome
downstream?** New policy `scalecourt-nogate-morntrace3-linkraise` wraps the
FROZEN scalecourt-morntrace3 policy and adds one step after its daily: answer
live village-link raises in conversation (the sim-linkdrive-b GO shape:
`link:accept` only when offered, never the bare verb, never a decline,
courtship-ready det sub ≥ 55, at most one answer a day). Matched seeds
97001–97004 (§15 deliberate reuse of r107's band), DAYCAP=180,
death-aware. Two legs: BASELINE replay (`LINKRAISE=0`, r107 behavior on
this base) vs ARMED. Verdicts judged against the replayed baseline:
GO = national ≥ 1/4 OR a lesser seat sat ≥ 1/4; PARTIAL = raises answered
≥ 4 AND links ever ≥ 12 AND regional 4/4, no national/seat; NO-GO =
raises answered < 4 OR links ever ≤ 8.

## Q1 verdict: GO

Answering the raises moves the scale line two rungs downstream. National
goes 0/4 → 2/4, global rank is reached on 2/4 (first time on this band),
links ever 8 → 15, first links form on days 6–25 instead of day 25
everywhere, and the Dawn fires 15–20 days earlier. No seat was sat on
either leg — the lesser seat stayed priced-and-waiting on 97001 while
its village died, and 97003 reached global without the table ever
pricing a seat (see below).

Pooled (4 seeds, matched):

| leg | days lived | links ever | first link | Dawn (net live) | national | global | lesser seat | raises staged/expired/accepted |
|---|---|---|---|---|---|---|---|---|
| baseline replay | 93/54/79/133 | 8 | d25 ×4 | d46 ×4 | 0/4 | 0/4 | priced 1/4, sat 0 | 16/16/0 |
| armed | 178/75/128/111 | 15 | d10/d6/d16/d25 | d31/d27/d37/d46 | 2/4 | 2/4 | priced 1/4, sat 0 | 15/1/14 |

Per seed (armed vs baseline):

| seed | days | links | national / global | raises answered | end |
|---|---|---|---|---|---|
| 97001 | 93 → **178** | 3 → 5 | — → **nat d62, glob d90** (dissolved d152, re-staged d159–160) | 5/5 (4 linked, 1 counter) | all dead in combat, pantry 6,924 |
| 97002 | 54 → **75** | 1 → 4 | — → — | 4/5 (1 expired, 2 not-offered then answered) | hunger scatter d75, pantry 0 |
| 97003 | 79 → **128** | 2 → 3 | — → **nat d68, glob d69, held to the end** | 3/3 | all dead in combat, pantry 5,500 |
| 97004 | 133 → 111 | 2 → 3 | — → — | 2/2 | hunger scatter d111, pantry 0 |

Raise ledger (policy stats, armed): seen-days 17, answered 14, linked
13, countered 1 (97001 d31, answered by courtship the next day),
skipped-not-ready 0, skipped-no-raiser 0, talk-failed 0, not-offered 2
(both on 97002 d34–35, answered d35 by a different raiser the same day
— the first raiser's talk never offered the choice, the second's did),
errors 0. First raise-talk days 10/6/16/32; first answers the same days.

## Baseline replay guard: REPRODUCES r107 EXACTLY

The replayed baseline matches r107's corpus seed-for-seed: end days
93/54/79/133, gate tallies identical (e.g. 97004:
no-known 1 / courtship-no-attempt 21 / link-young 20 / seasoned-no-dawn
1 / regional 84), propose 1/1/1/2, links 3/1/2/2, Dawn network-live d46
(voiced d47) on all four, abilities identical (97002
survivor/echo_location/bird_whisperer/pocket_sand/cornered_rat; 97003
green_whisper/switcheroo; 97004 green_whisper + fusion). r114 did not
drift the scale line. Verdicts are judged against this replay, not
assumed from r107.

## Purity guard: OK on all 4 seeds

First reggate divergence day vs first raise-talk day (the floor):
97001 d10/d10, 97002 d6/d6, 97003 d16/d16, 97004 d32/d32. No leg
diverged before its first raise talk. The only policy difference is the
raise step, and it only acts on live pending raises.

## Village assessment (plain words)

Four villages, four longer lives — and the lever bought links, not food.

- **97001** (ended d178, nobody left): the long life. Five links (Sanne
  raised the first on d10, Ellie the second on d24), national on d62,
  global on d90 — the band's first global — then the realm came apart
  on d152 when a link broke, and was rebuilt by d159–160. The table
  priced a lesser seat and waited (arc 4). The village did not starve
  (pantry 6,924 at the end); it died fighting — 63 of 89 deaths in
  combat or the wild, wave 5 unlocked, 2 wave-5 kills on the deed book.
  The last three links grieved through successions on d177–178.
- **97002** (ended d75, one person left): the shortest life, still
  longer than its baseline (54). Four links, one seasoned, but the
  pantry hit zero and stayed there — 7 starvation deaths, hunger
  scatter on d75 after four hungry days. The lever bought standing;
  it did not buy dinner.
- **97003** (ended d128, nobody left): national d68, global d69, and
  the realm HELD to the end — all three links seasoned (trust 41/89/53,
  ages 109–112 days). It died fighting (34 villager-combat deaths, 16
  expedition deaths), pantry 5,500. And yet the table never priced a
  seat: arc stayed 3. Global rank without a seat offer — the table
  prices deeds (wave-4 kills 3, wave-5 0, no food deeds), not rank.
- **97004** (ended d111, one person left): the one seed that lived
  SHORTER armed than baseline (133 → 111). Three links, one seasoned
  (trust 61), but the pantry emptied and the village scattered on its
  fourth hungry day. Same wall as its baseline, earlier. The lever is
  not a food lever, and on this seed the extra links cost days the
  pantry could not spare — or it is noise at n=1; either way the
  hunger wall, not the ask, ended it.

What they knew: counters learned and shared (the Swarm Hum bellow trick
shows up in the armed line's deed book as wave-4 kills: 8 on 97001).
What was missing: food, on the two seeds that scattered; fighters, on
the two that died in combat; and on 97003, the deeds the table wants.

Table approach: only 97001 got there (lesser seat, waiting, never sat —
`tableDone=false` every day to d178). The other three never priced a
seat. No full seat, no sitting, on either leg.

## People check

Four CONVO_DAYS transcripts read in full, plus a probe of the
raise-answer talk itself (the driver's say capture cannot see it — the
accept line travels through `sayLine` into the conversation transcript,
so a probe script replayed seed 97002 to day 12 with a read-only
convoTurn recorder: `scripts/raise-answer-probe-20261107.js`).

- **Day 90, Ellie** (97001, mason, trust 90): grieving — "We gave them
  a good burial. Doesn't feel like enough, does it?" Gossip carries
  real village news (Ursula out foraging, Carlos's story with "a fresh
  coat of paint"). Coherent, human.
- **Day 120, Ellie** (97001, trust 100): her buried food bundle comes
  up (+1806 kcal to the pantry) and she talks about stepping up to lead
  — "If I don't step up, someone worse will. That's not ambition,
  that's arithmetic." The sitting's turn-0 accept was an ORDINARY
  invitation (betrayWatch: armed=ordinary), not an ambush; she died
  d138. Ends "See you at the fire."
- **Day 90, Hassan** (97003, butcher, trust 90): no shared words — he
  speaks only Hindi. The sitting is nonverbal and honest: "A final nod.
  They touch their chest, then point at you — a promise without
  words." The langGate world working as designed; nothing is fabricated.
- **Day 90, Chloe** (97004, interpreter, trust 57): "Are you going to
  stay? With us. For real." — answered honestly, "Lyon, France is a
  direction, not a plan. Here is a plan, even if it's a hard one."
  Ends "Do try to stay alive. The paperwork otherwise is murder."

**0 senseless sittings.**

Raise-answer talk (probe, 97002 d6, Rosa): she opens with the raise
line itself — "I've heard good things about Emberhold. We should link
with them — we'd be stronger together." — and the scholar answers on
the spot: "All right — let's ask them." You carry the proposal to
Emberhold. A proposal and an agreement, in words, with the village she
personally knows. It reads as a real agreement, not a menu press. The
probe's surrounding talks are vivid too (Rosa's illiteracy confession
d7, Donal's forage invite, Mutlaq's Arabic-only with one proud English
word, "Food?"). Limitation, stated honestly: only this one raise-answer
talk was read verbatim; the other 13 answers' wording is unverified
beyond the engine's fixed accept line and the policy counters.

D-THING / bonds / betrayals: 1 betrayal accept in the band (97001
Ellie d120, ordinary). No bond-proposal sitting was separately tallied
this run.

## Blanks filled / documented

- **Blank FILLED (the run's lever): the villagers' link raises all died
  unanswered (r107).** Now 14/15 answered, 13 linked on the spot, 1
  counter (answered next day). The scale driver answers raises in
  conversation, as r113 did for sittings and linkdrive-b did on the
  staged substrate.
- **Blank documented (not fixed): the raise-answer talks are invisible
  to the run's instruments.** They travel through `sayLine`, not `say`,
  so neither the say capture nor the saved transcripts see them. The
  probe script reads one; the driver should save them the way
  runConversation saves CONVO_DAYS talks. Candidate for the next scale
  run (small driver change, no game change).
- **Blank documented (not fixed): the realm dissolves and re-stages.**
  97001 went global d90, fell back to regional d152 when a link broke,
  re-staged national d159 and global d160, fell back again d168. The
  broken link handed 63,750 kcal of arrears to its successor. Whether
  the dissolve/re-stage churn is intended pressure or a wobble in the
  staging bar is a design question, not a bug claim — but a realm that
  stages and dissolves three times in 88 days reads unstable from the
  village's side.
- **Console-line nit (r107) — fixed:** the per-seed line printed
  `proposed=0` because it read `ctx.proposedLead`, which the policy
  never sets; it now reads `ctx.proposed` and prints the true
  direct-propose count (baseline 1/1/1/2, matching r107). Note for
  readers: the reggate `propose=` counts the WRAPPED proposeLink verb,
  which the engine also calls inside acceptLinkRaise — so on the armed
  leg reggate propose=5/4/3/3 while direct proposes are 0/0/0/1. Two
  different counters, both true.

## Metric review

Q1 bound the run and the metric proved the right instrument: raises
answered + links ever + national/global cleanly separated the ask
question from the seasoning/survival question, and the matched
before/after on identical seeds makes the verdict robust at n=4.
Revisions proposed for the NEXT run: (1) split the instrument's
proposeCalls into direct proposes vs raise-accept proposes (the wrapped
verb counts both paths — the analyzer should read the policy events
for the split); (2) `raisesSeen` in the policy stats counts raise-DAYS
(a pending raise counts every day it sits), not distinct raises —
distinct counts come from raiseHistory; rename or add a distinct
counter; (3) save raise-answer talks as transcripts in the driver so
the people check reads all of them, not one probe.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
`hidden_files/telemetry-baselines/scale.json` (metrics firstCourt,
watchers, tableTele, fightsTotal, fightsByWave.4, maxGameDay), run
against the armed regional JSONs, printed LOUD "disappeared" lines
(fightsTotal 90→0, fightsByWave.4 3→0, maxGameDay 880→0). Investigated:
**shape artifact, not a real deviation** — same caveat as r107. The
scale baseline was seeded from an old aggregate shape; this run's
per-seed files don't carry those metrics in resolvable form (the
regional JSONs are the reggate corpus; the trust JSONs carry the census
under `census.*`). The baseline was **not** rolled forward from these
files. Honest comparison from the census itself: national 0/4 → 2/4,
global 0/4 → 2/4, maxWave 4 → 5, days lived 93/54/79/133 →
178/75/128/111, combat deaths plentiful on every seed — no overturning
deviation, and the movement is the lever's, in the expected direction.

## Regression

No full `check.js --quick` this run (see gate note in the prereg). The
r114 gate (284/6, all adjudicated pre-existing) ran on this exact
master; this run changes ZERO src/js. Proof test 11/11 green + pilot
evidence (0 instrument errors on all 8 seed-runs, 0 policy errors) are
the regression cover, as for r107 and regionalstep-b.

## Commits

- `1adf7da57` — prereg + driver + analyzer + proof test (11/11)
- (this commit) — run note + analysis + probe script

## Closeout

- Merged locally, pending ship (no bump, no push, no live verification —
  the ship loop owns those).
- Rotation 3 → 0 written at closeout.
- Baseline replay reproduced r107 exactly; no stale-lock recovery
  needed this run (no lock file existed at start).
- Note: mid-run the box ran hot (sibling feastcap-b driver + an
  awayconfirm analyzer held 50–90% CPU; load 3–7.5) and one heartbeat
  call took ~4 minutes to return. The heartbeat DID land (15:25:38Z);
  nothing was lost, but a slow heartbeat under load looks like a dead
  run to the next guard — the lock file, not the heartbeat, is what
  protected this run.

## Rebase addendum (post-judgement, on master 9aa2698fc)

Master moved mid-run: the xp-gear build lane landed (gear protection
retune, synergy bonus, patrol deed, measurement-proof refreshes) after
the judged run's base 8ee8dcfb6. The branch rebased cleanly onto
9aa2698fc (explicit SHA, no conflicts, per the stale-ref rule). Proof
re-run 11/11 green on the rebased tip. Both legs were then re-run in
full on the new base, same seeds, same driver
(`journey-scale-r108-rebased-baseline/`, `journey-scale-r108-rebased/`,
analysis `journey-scale-r108-rebased-analysis.txt`):

- Rebased baseline: days 74/80/131/47, links ever 10, national 0/4,
  raises 0 answered (18 staged, all expired). The baseline no longer
  reproduces r107 (97001: 93→74 days; 97004: 133→47) — xp-gear's
  combat/gear changes reshuffled survival on every seed.
- Rebased armed: days 106/72/106/75, links ever 13, national **2/4**
  (97001 d62, 97004 d71), global 2/4, raises answered 12/14, purity OK
  on all 4 seeds.
- **The GO reproduces on the new base** (national 0/4 → 2/4), with
  different seeds carrying it (97001+97004 instead of 97001+97003) and
  a smaller links gain (10→13 vs 8→15). The reshuffle is attributable
  to xp-gear, not to the raise policy — purity holds on the rebased
  legs too, and the lever's direction is the same on both bases.
- One sensitivity to carry forward: on the new base, 97002's raises
  went un-offered 9 seen-days (vs 2 before) — the talk sometimes never
  offers `link:accept`, and which villagers raise (and when) is
  base-sensitive. The policy still answered 2/4 there; no error, no
  decline, no bare verb.

The judged verdict above stands on its preregged base (8ee8dcfb6); this
re-run is a robustness check on the merged base, and it agrees.
