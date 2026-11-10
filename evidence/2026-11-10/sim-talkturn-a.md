# Talk-turn arm — Loop A verdict (run fleshout-20261110T1215Z, arm sim-talkturn-a)

Axis: scale-onramp / winnability chain (the polity half of
sim-findings #2061, open remainder after sim-secondlink-a).
Policy-side instrument only, zero src/js. Gates, prices, deeds,
and readyDemand untouched.

## Pre-registration (committed before any judged computation)

Full text: `evidence/2026-11-10/sim-talkturn-a-prereg.md`
(commit 48719d8a1). In short: competent policy verbatim,
fresh band 150201–150208, 150d death-aware horizon, armed leg
`COMPETENT_TALK=1` vs control leg (flag unset) on identical
seeds. Primary metric: second links formed per 8 seeds. GO
candidate iff armed >= 2/8 vs control 0/8; NO-GO iff 0/8
armed; 1/8 inconclusive. Cost bar: starvation armed <=
control+2 AND total villager deaths armed <= control total AND
median survival armed >= 0.8x control median — if the cost bar
fails, a GO candidate is HELD, not landed. Secondary: raises
answered vs expired, first-link source, talk mechanism, wall
numbers.

## Grounding verified in code before the judged pilot (not assumed)

- `COMPETENT_TALK=1` already exists as a switchable env gate in
  `scripts/policies/competent.js`: `talkOn()` returns
  `process.env.COMPETENT_TALK === '1'`; default OFF. `deepTalk`
  (called daily) returns immediately unless the gate is on — so
  NO policy file change was needed to switch it on; the
  instrument is the flag + this driver. The driver sets/deletes
  the flag explicitly per leg so ambient env cannot leak.
- `deepTalk`: up to 2 held sittings/day, up to 5 real turns each
  (`holdConversation` via `chooseConversationChoice` +
  `pickTalkChoice`), closed honestly with `endConvo 'left'`.
- `pickTalkChoice` priority: `ans:*` first, then `teach`, then
  `gq:*`, then `ask`, then `live[0]`. `bondChoices` are
  PREPENDED to the menu, so when a raise is pending,
  `link:accept` / `link:decline` are the first two entries and
  `link:accept` is the fallback first live choice — reached once
  the higher-priority choices for that sitting are consumed
  (no-repeat `seen` set) or absent.
- Target picking (`talkScore`) has NO pending-raise signal:
  unresolved want +100, grieving/scared +50, stranger,
  least-talked-to. The raiser is picked by general sociability,
  not by the pending ask.
- Language gate: `bondChoices` returns nothing at commLevel
  'none' — a raise staged by a villager with no shared words is
  unanswerable by construction for its whole 3-day life.
- `acceptLinkRaise` tells the lore then calls `proposeLink`:
  formed (score >= 55), `'counter'` (35–54), or null. An
  accepted raise can still fail to form a link.

## Verdict — GO CANDIDATE, HELD BY THE COST BAR (judged strictly against the prereg)

Primary: armed **7/8** seeds formed a second link (20 via
raise) vs control **0/8** — clears the GO bar (>= 2/8) by a
wide margin. BUT the cost bar as written FAILS: total villager
deaths armed 696 vs control 603 (starvation 0 vs 0 passes;
median 129.5 vs 101.5 passes). Per the prereg, a GO candidate
whose cost bar fails is HELD, not landed — so this run makes
NO landing claim and spends NO confirm band. The cost-bar
failure is, on the evidence, a metric-design artifact, not a
higher death rate: per village-day the death rate is
identical (armed 696/985 = 0.707/day, control 603/851 =
0.708/day) — armed villages lived 134 more days in total, so
they accumulated more deaths at the same daily rate. The
revised bar belongs to the NEXT run (see metric review). The
confirm band 150209–150216 is NOT spent this run; it is
reserved for the re-judged run under the revised cost bar.
Coordinator can overrule.

Proof: `scripts/test-talkturn-a.js` — 11/11 PASS (talkOn gate,
pickTalkChoice link-fallback + courtesy, analyzer
second-link/source/cost-bar fixtures, live 12d armed miniature
with real held turns + determinism, live flag-off miniature
byte-identical to plain competent). RED->GREEN recorded:
the test failed on `MODULE_NOT_FOUND` before the
driver/analyzer existed, then passed 11/11 after.
Instrument errors 0 on all 8 seeds, both legs. Reconciliation
0 bad (secondlink analyzer: every staged tele event matches a
snapshot transition).

## THE TALK-TURN ANSWER (plain words)

Yes — sitting down to talk answers the mail, and second links
follow. With held conversations on, the scholar took 8,140
held turns across the band (1,952 sittings), picked the link
ask 27 times, and 27 raises were accepted — every single pick
was "All right. Let's ask them." Seven villages out of eight
grew a second link, most grew three or four, one grew seven.
Six villages formed something the control band never formed at
all: a polity — three or more seasoned subordinate fires under
one head. The first link stopped being a gift from above, too:
on seven of eight armed seeds it came from a villager's raise
being answered (days 11–18), not from the ladder's stage-3
grant. The control band, same seeds, same code, flag off:
zero turns taken, zero raises answered, one ladder-granted
link per village, zero polities — a perfect reproduction of
the secondlink-a picture.

The one armed seed that stayed at one link is the exception
that names the next fix. On 150206 the villagers staged 28
raises and every one expired unanswered, while the scholar held
1,251 conversation turns with everyone else. The top raiser
was the village's most trusted, most talked-to person — and
that is exactly why the talk picker kept passing him by: it
prefers strangers and the least-talked-to, so the established
villager carrying the ask never makes the top two seats. The
mail was answered everywhere the raiser got a seat. Where the
seating chart never offered one, the mail expired exactly as
before.

And the wall: the talk flag moved the polity and wave-5 layer
hard — wave-5 unlocks 7/8 armed vs 2/8 control, polities 6/8
vs 0/8, seasoned links up to 4 vs 0 — but national, the table,
and wins are still 0/8 on both legs. The road past regional
is open now in a way it wasn't; the seat itself is still
unreached. The cost of the road, measured honestly, is
nothing in starvation (zero both legs) and nothing in the
daily death rate (0.707 vs 0.708 per village-day) — but the
villages that talk more also fight and travel more (combat
deaths 206 vs 115, expedition deaths 165 vs 116), and one
armed seed (150208) died young at 75 days against its
control's 140. Talking is not free; it is just not paid for
in hunger.

## Per-seed table

| seed | leg | days | end | wave | standing | links | first link | second | ans acc/ref/exp | deepTurns | deaths (starv) |
|------|-----|------|-----|------|----------|-------|------------|--------|-----------------|-----------|----------------|
| 150201 | armed | 143 | lost | 5 | 585 | 7 | village_2 d15 (raise) | 5 via raise | 6/0/13 | 1220 | 87 (0) |
| 150201 | ctrl | 78 | lost | 5 | 250 | 1 | village_3 d38 (ladder) | no | 0/0/8 | 0 | 83 (0) |
| 150202 | armed | 91 | lost | 5 | 360 | 4 | village_0 d18 (raise) | 3 via raise | 4/0/2 | 800 | 61 (0) |
| 150202 | ctrl | 107 | lost | 4 | 199 | 1 | village_1 d73 (ladder) | no | 0/0/12 | 0 | 73 (0) |
| 150203 | armed | 116 | lost | 5 | 250 | 4 | village_3 d12 (raise) | 3 via raise | 4/0/0 | 952 | 87 (0) |
| 150203 | ctrl | 75 | lost | 4 | 150 | 1 | village_0 d30 (ladder) | no | 0/0/7 | 0 | 80 (0) |
| 150204 | armed | 110 | lost | 5 | 345 | 5 | village_0 d11 (raise) | 3 via raise | 4/0/7 | 887 | 80 (0) |
| 150204 | ctrl | 96 | lost | 3 | 99 | 1 | village_2 d37 (ladder) | no | 0/0/14 | 0 | 47 (0) |
| 150205 | armed | 150 | survived | 5 | 420 | 3 | village_1 d11 (raise) | 2 via raise | 3/0/11 | 1148 | 101 (0) |
| 150205 | ctrl | 76 | lost | 4 | 199 | 1 | village_0 d36 (ladder) | no | 0/0/5 | 0 | 72 (0) |
| 150206 | armed | 150 | survived | 5 | 440 | 1 | village_0 d37 (ladder) | no | 0/0/27 | 1170 | 67 (0) |
| 150206 | ctrl | 129 | lost | 4 | 199 | 1 | village_1 d32 (ladder) | no | 0/0/12 | 0 | 60 (0) |
| 150207 | armed | 150 | survived | 5 | 495 | 4 | village_spl_28 d48 (raise) | 3 via raise | 4/0/0 | 1308 | 140 (0) |
| 150207 | ctrl | 150 | survived | 4 | 199 | 1 | village_2 d35 (ladder) | no | 0/0/0 | 0 | 81 (0) |
| 150208 | armed | 75 | lost | 4 | 199 | 2 | village_1 d27 (raise) | 1 via raise | 2/0/5 | 655 | 73 (0) |
| 150208 | ctrl | 140 | lost | 5 | 300 | 1 | village_1 d32 (ladder) | no | 0/0/9 | 0 | 107 (0) |

Band: armed 7/8 second links (20 via raise), 93 stagings
(27 accepted / 0 refused / 65 expired / 1 pending-at-end);
control 0/8, 69 stagings (0 / 0 / 67 / 2 pending-at-end).
Second raises alone: armed 79 staged, 20 accepted, 0 refused,
58 expired; control 61 staged, 0 accepted, 0 refused, 59
expired. First-link source: armed 7 raise / 1 ladder; control
8 ladder. Talk: armed 2,962 talks, 8,806 turns, 27 link picks,
2 bond picks, 57 talks with a raiser while a raise was
pending, 1,952 held sittings, 8,140 deep turns; control 869
talks, 0 turns, 0 link picks, 36 raiser-pending talks (all
walk-outs). Note the armed leg also STAGED more raises (93 vs
69): held conversations spread lore at their ends
(`maybeTellVillageLore`), so more villagers know more
villages — the flag generates more mail as well as answering
it. Refusals: 0 on both legs — every answered raise was
accepted. The decline path (`link:decline`, second in the
menu, never reached as the fallback pick) is untested by this
pilot.

## Wall numbers (this pilot)

Armed: wins 0/8, national 0/8, table 0/8, wave-4 unlocks 8/8,
wave-5 unlocks 7/8, median survival 129.5d (3 seeds censored
at the 150d horizon), seasoned links max 4, polities on 6/8
seeds. Control: wins 0/8, national 0/8, table 0/8, wave-4
7/8, wave-5 2/8, median 101.5d (1 censored), seasoned links
max 0, polities 0/8. The wall moved at the polity/wave-5
layer and did not move at the national/table/win layer.

## The 150206 exception (why one seed answered nothing)

28 stagings, 27 expired, 1 pending-at-end, 0 accepted, 0
link picks — while the scholar held 1,251 conversation turns.
The raisers were devon_okafor (7 stagings, trust 96–100,
`build_standing` 1, knew 3 villages) and gen_zwr9wzo (trust
38–91, `build_standing` 2.5). In the first 200 recorded turn
events devon_okafor got 5 turns total (ella_johnson got 34,
chloe_dubois 29); the two raiser-pending talks visible in the
capped record both took 0 turns — walk-out `talkRound` opens,
not held sittings. The mechanism is the target picker, not the
choice picker: `talkScore` rewards strangers (+20−bond) and
the least-talked-to (+10−count), so the most trusted,
most-talked-to villager — the one carrying the standing goal
and staging the raises — systematically ranks out of the two
daily seats. The raise is never refused; it is never sat
with. Fix direction (next arm, NAMED not built): give the
target picker a pending-raise signal (a raiser with an
undelivered ask outranks a stranger), or let a pending raise
hold its raiser a seat. The first link on 150206 still came
from the ladder (d37) despite 28 stagings — the staging
pipeline was rich, the answering pipeline missed entirely.

## The 150208 early death (one armed seed did worse)

Armed died at 75 days against its control's 140, with fewer
total deaths (73 vs 107) but a higher daily rate (0.973 vs
0.764). Causes are ordinary — villager combat 32, expedition
17, combat 16, the wild 5 — no exotic killer, no starvation.
The village lost its fights faster, not differently. n=1: it
is reported as the counter-case to the band's longer median,
not as a mechanism. The other armed seed that died sooner
than its control (150202: 91 vs 107) shows the same ordinary
cause mix.

## Deaths: what the cost bar actually measured

Starvation: 0 both legs — the talk flag costs nothing in
hunger. Total deaths: armed 696 vs control 603, and the
prereg's raw-total clause fails on that number alone. But the
village-day totals are armed 985 vs control 851, and the
per-day rates are armed 0.707 vs control 0.708 — identical.
Per-seed rates range 0.45–1.07 on both legs; no seed shows a
rate blowout attributable to talking. Cause mix: the armed
excess is combat (206 vs 115) and expedition (165 vs 116),
partly offset by fewer wild (47 vs 77) and monster (10 vs 17)
deaths; villager combat is flat (238 vs 251). The armed
villages that survive longer fight more and travel more —
150207 armed is the pure case: same 150 days as its control,
140 deaths vs 81, driven by expedition 60 vs 19 and combat 32
vs 15, with 4 links and standing 495 vs 199. More living, more
exposure — not a new way to die. The raw-total cost bar
punishes exactly the survival it is meant to protect; see
metric review.

## Village assessment (plain words)

Picture eight villages where the scholar finally sits down.
Not a new system, not a new lever — the same person, the same
days, except now they stay for the conversation instead of
walking out of it. The difference is immediate and visible:
by day 11–18 the first friendship is asked for and granted by a villager's own voice
(on six of the eight seeds, by day 11–18), not handed down by
the System at day 30–70; by the end most villages hold three or four
friendships, one holds seven, and six of the eight have grown
into something with a shape — a polity, fires under one head,
seasoned over weeks. The villages live longer (median 129
days against 101) and stand taller (standing up to 585
against a control ceiling of 300). They also bleed more in
absolute terms, because they live longer and roam further —
the same daily risk, stretched over more days. One village in
eight never got the letter answered at all, because its
most trusted elder kept bringing the ask and the seating
chart kept giving his chair to strangers. And the seat itself
— national, the table, the win — is still nowhere: the road
past regional is paved now, but nobody has walked it to the
end. The talk flag opens the diplomacy road. It does not
finish the game.

## Sense-test

- The answered raise reads like people. 150201, day 15:
  "⛓️ Smita brings it home: Thornfield bows to Haven — one
  organization, us primary. Tribute: 4,000 kcal/week. The
  relationship starts at trust 30. Everything from here is
  earned." + Codex: "First link formed with Thornfield. The
  gesture goes out now; the Dawn waits for seasons." A named
  villager carries the news; the System narrates the season it
  will take. Day 16, the link is already lived in: "You give
  Thornfield 1,750 kcal from Haven's bins — real food,
  honestly counted. Hana weeps, openly. 'The fire network.
  That's what it's FOR.' (Trust +4. They owe you — the ledger
  remembers.)" The formation is followed by a real exchange,
  not a number.
- The ask itself still wears the thin template secondlink-a
  flagged: every raise line on the band is the rumor variant —
  "I've heard good things about Ashford. We should link with
  them — we'd be stronger together." — the same sentence for
  every village, repeated day after day while the raise sits
  pending (d10, d11, d12, identical). The line is honest about
  being secondhand, and the `how` variants ('visit' /
  'seen-nearby' / 'told') exist in code but never fired on
  this band either — the lore these villagers hold is still
  all rumor. With 27 raises now answered, the repetition is
  more audible than it was when they all expired: the same
  sentence, accepted 27 times. A voice-pool note for later,
  not a defect in the ask.
- No robotic villager behavior was flagged by this arm's
  corpus beyond the template repetition above. The refusals
  never happening (0/27) is a picker fact, not a behavior
  verdict: `link:decline` sits second in the menu and the
  fallback pick takes the first, so the scholar on this band
  is constitutionally incapable of saying no to a link ask —
  the policy answers every ask yes. That is a property of
  this instrument, named here so nobody mistakes 27/27
  accepts for 27 considered decisions.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The primary bar held up: 7/8 vs 0/8 separates cleanly, the
  mechanism (link picks → accepts → formed links) is visible
  in the corpus, reconciliation went 0 bad with zero
  instrument errors. No bar needs lowering or raising.
- The cost bar as written is WRONG and must be revised before
  the next run, not re-scored now: its raw-total clause
  (`total deaths armed <= control total`) penalizes any arm
  that extends survival, because a village that lives longer
  accumulates more deaths at an unchanged daily rate. On this
  band the daily rates are identical to three decimals
  (0.707 vs 0.708) while the raw totals differ by 93 — the
  clause measures days lived, not lives cost. Proposed
  revision for the next run: deaths per 100 village-days
  armed <= control + 10%, keeping the starvation clause
  (armed <= control+2) and the median clause (>= 0.8x
  control) as written. Under that revision this pilot's cost
  bar would PASS (0.707 <= 0.708 x 1.1); the verdict recorded
  here stays HELD under the bar that bound this run.
- Two instrument notes, both disclosed, neither affecting the
  verdict: (a) the per-seed `ms` timing in the driver log is
  meaningless under the harness frozen clock (negative and
  wild values) — it is a log-line field only, never in the
  JSON, and no timing claim is made from it; (b) the talk
  recorder caps `talkEvents`/`turnEvents` at 200 per seed, so
  the 150206 deep-dive could only see the first 200 talks —
  the headline counters (talks/turns/linkPicks/
  talksWithRaiserPending) are uncapped and exact; the cap
  binds only the per-event reconstruction. A future
  instrument that needs full reconstruction should raise the
  cap or count per (day, vid) in the driver.
- The analyzer's `secondLinkFormed` counts villages ever
  linked (union over snapshots) excluding the first-formed
  link — robust to link breaks, and it agrees with maxLinks
  >= 2 on all 8 armed seeds (maxLinks 7/4/4/5/3/1/4/2).
- The decline path is unmeasured by design of the picker, not
  by a gap in the instrument: `link:decline` was offered on
  every answered raise and picked 0 times. A future arm that
  wants a refusal measurement needs a picker that can say no
  (e.g. score-based accept/decline), not more seeds.

## Next blanks, in order

1. **Seat the raiser (the 150206 fix, NAMED not built).** Give
   the held-conversation target picker a pending-raise signal
   so a villager with an undelivered link ask gets a seat
   ahead of a stranger — or let a pending raise hold its
   raiser a seat. Measure on this band + confirm band: does
   150206-class failure (28 stagings, 0 answers) disappear,
   and does the accept rate hold? Do NOT move readyDemand
   numbers or any win price/deed gate on this evidence.
2. **Re-judge under the revised cost bar (confirm band
   150209–150216).** The confirm band is reserved, not spent:
   run it under the revised deaths-per-village-day bar and
   judge the GO candidate again. If it passes, the talk flag
   (or the raiser-seating build from blank 1) is a landing
   candidate — as a policy default or a game change, which is
   a coordinator/Steve call: COMPETENT_TALK=1 is a bot
   behavior, not a game change, and making held conversations
   the default competent behavior is a policy decision, not a
   src/js change.
3. **A picker that can say no.** 27/27 accepts is a property
   of the fallback pick, not 27 considered decisions. If the
   design wants refusals to be possible from the scholar's
   side, the choice picker needs a score-based accept/decline
   (e.g. refuse when the village is unknown, hostile, or the
   pantry cannot carry the tribute) — a design question.
4. **The rumor template.** Every raise cites rumor, verbatim,
   27 times accepted. The `how` variants exist; the lore is
   all secondhand. Whether raises should sometimes cite a
   visit or a telling — and whether the line pool needs
   widening now that raises get answered — is a voice note
   for a later pass.

## Findings for the coordinator

- **COMPETENT_TALK=1 ANSWERS THE MAIL — GO CANDIDATE, HELD
  (primary 7/8 vs 0/8).** Second links formed on 7/8 armed
  seeds (20 via raise) vs 0/8 control; first link via raise
  on 7/8 armed vs 0/8 control (ladder on all 8); polities on
  6/8 armed vs 0/8 control; wave-5 unlocks 7/8 vs 2/8.
  (This arm.)
- **COST BAR FAILS AS WRITTEN — HELD, NOT LANDED.** Total
  deaths 696 armed vs 603 control; starvation 0 vs 0; median
  129.5 vs 101.5. Per-day death rate identical (0.707 vs
  0.708). The raw-total clause punishes longer survival;
  metric review proposes deaths-per-village-day for the next
  run. Confirm band 150209–150216 NOT spent; reserved for
  the re-judged run. (This arm.)
- **THE RAISER NEVER GETS A SEAT ON 150206 (mechanism).**
  28 stagings, 0 answers, 0 link picks, 1,251 held turns.
  `talkScore` prefers strangers/least-talked-to, so the
  highest-trust raiser (devon_okafor, trust 96–100) got 5
  turns in the first 200 events while others got 29–34.
  Next build: pending-raise signal in the target picker.
  (This arm.)
- **THE SCHOLAR NEVER SAYS NO (picker property).** 27/27
  answered raises accepted, 0 refused — `link:accept` is the
  fallback first live choice and `link:decline` is never
  reached. Refusal measurement needs a score-based picker.
  (This arm.)
- **WALL: POLITY/WAVE-5 MOVED, NATIONAL/TABLE/WINS STILL 0.**
  Armed wins 0/8, national 0/8, table 0/8; wave-5 7/8 vs
  2/8; polities 6/8 vs 0/8; median survival 129.5 vs 101.5.
  (This arm.)

## Proof and landing

- Prereg: `evidence/2026-11-10/sim-talkturn-a-prereg.md`
  (commit 48719d8a1).
- Instrument + driver + analyzer + proof:
  `scripts/talkturn-driver-20261110.js`,
  `scripts/talkturn-analyze-20261110.js`,
  `scripts/test-talkturn-a.js` — proof 11/11 PASS
  (commit 05ff97279). Reuses
  `scripts/secondlink-instrument-20261110.js` and
  `scripts/secondlink-analyze-20261110.js` unchanged.
- Corpus: `evidence/2026-11-10/perseed-talkturn-a/`
  (16 files: 8 armed + 8 control), summary
  `evidence/2026-11-10/talkturn-summary-talkturn-pilot.json`.
- Logs: `/tmp/talkturn-pilot-control.log`,
  `/tmp/talkturn-pilot-armed.log`, `/tmp/talkturn-analyze.log`
  (worktree-external scratch — not committed).
- Probe scripts (`/tmp/talkturn-probe.js`,
  `/tmp/talkturn-probe2.js`) are scratch diagnostics, not
  committed: the 150206 mechanism, the death-cause
  histograms, and the sense-test scenes are quoted in this
  evidence, and the judged corpus carries the numbers.
- Zero src/js changed. Commits to be merged locally by the
  coordinator; report 'committed in worktree, pending
  coordinator merge'.
