# sim-reactorgate-a — reactor-gate verdict: what the kcal gate reads on the reactor evening

Run: oversight-flesh-out-loop, Loop A run fleshout-20261031T0643Z,
arm sim-reactorgate-a, axis food-economy, backlog #1582 class
(sim-tickbudget-b observation, 2026-10-30). Worktree
sim-reactorgate-a. DIAG ONLY: verdict + conditional fix
spec, ZERO src/js changes, zero policy-default flips,
zero edits to any existing policy file or existing
script. New files only: prereg, driver, analyzer, proof,
this evidence file, corpora, analysis, determinism
re-run. Sibling trees never touched; main tree never
touched. No balanced-panel compare is claimed: zero
game-root changes, so there is no before/after game
delta for scripts/balance-panel.js to compare — stated
here, not hidden.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-reactorgate-a-prereg.md (commit
d41f13b4d). Pinned base 3c03d468bbd6f752a35da27aaa535601538a1d15
(branch sim-reactorgate-a at prereg time; the prereg
commit adds only the prereg file, so all legs run on
pinned-base game/policy code verbatim). GO bar, judged
exactly as written: GO iff the evidence contains a
verdict with the exact gate inputs at the day-13 bridge
decision (reactor state, kcal in hand, gate read) plus
a reasoned ruling: either "correct-as-wired (bridge
cost is effort, reactor covers metabolism, gate reads
hand kcal correctly)" with the code path cited, or "bug
+ minimal fix spec" with the exact lines and the
corrected read. A verdict without exact gate inputs is
NO-GO.

## Canon

docs/CANON.md read. No canon doc covers the bridge /
reactor-gate interaction itself: docs/ABILITY-REFUSALS.md
covers ability-action refusals, not the woodcarry bridge
refusal — stated here instead of inventing canon. The
reactor's own text is the nearest canon: src/data/
abilities.json, fusion_reactor — "the pellet covers
your metabolism", metabolic block {daily: 0}. The
standing rule that bears on the narration half is
CANON.md's "no silent actions — every action narrates
honestly, including failures" (already the subject of
sim-lackingline-a, which this arm does not re-litigate).

## Prior evidence read in full before designing anything

evidence/2026-10-30/sim-tickbudget-b.md,
evidence/2026-10-31/sim-lackingline-a.md. Substrate
confirmed from them, deviation stated in the prereg:
the reactor evening sits on the ON-VARIANT leg
(PRESSB=1, WOODWARM=1), not the ON control leg
(PRESSB=0, WOODWARM=1); the judged set runs both
warmth-live legs on seed 15215, DAYS=30, all other
substrate gates identical (POLICY=nighttravel,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1).

## Instruments (new driver, disclosed delta only)

- scripts/reactorgate-trace-a.js — adapted from
  scripts/tickbudget-trace-b.js with ONLY the
  prereg-disclosed changes: reactor probe (pure reads
  at evening-row time), per-day reactor-install-line
  flag, OUTDIR/SEEDS defaults, WOODWARM=1 required.
  Same stack (pressb(warmed(woodcarry(nighttravel)))),
  same write transport.
- scripts/analyze-reactorgate-a.js (pure reads):
  day-13 gate-input extraction, reactor-state table,
  day 14+ persistence table, narration capture.
- scripts/test-reactorgate-a.js (proof): 71/71 (see
  Proof).
- Legs: ON control + ON variant, seed 15215 only,
  DAYS=30, errs 0/0/0 on both. Determinism: ON-variant
  re-run byte-identical.
- Cross-check (zero drift): ON control day 13
  (1 log, 0 kcal, 111 ticks) matches sim-lackingline-a
  exactly; ON-variant day 13 (2 logs, 0 kcal, 95 ticks)
  matches sim-tickbudget-b exactly. The probe changes
  no trajectory: still-day sets reproduce (control
  7-16, variant 7-23) AND all 30 evening outcomes match
  the tickbudget corpora evening-for-evening on both
  legs (0/30 diffs each).

## 1. THE ANSWER, FROM THE CODE PATH (before the replay)

What the kcal gate reads: kcal in hand — nothing else.
The path, with line-anchored citations (grep by
function name; line numbers drift):

- scripts/policies/creekremedy-diag.js
  classifyRefusedEvening: kcalLive =
  Math.round(scholar.kcal) — the scholar's hand-kcal
  pool, read raw. No reactor term, no
  fusionReactorOnline call, in the whole file's
  classification path.
- scripts/policies/woodcarry.js, evening bridge:
  kcalLive (falling back to cls.kcal) is passed as
  `kcal:` into bridgeDecision, which refuses
  'kcal-short' iff kcal < KCAL_FLOOR (60). The
  function takes no reactor parameter; no
  fusionReactorOnline call exists anywhere in
  woodcarry.js (proof-checked statically).
- src/js/game.js buildBridge: the engine side of the
  same cost — "building = 3 chunks (96 ticks) + 60
  kcal effort. Construction is work." It debits
  scholar.kcal = max(0, kcal - 60) with NO kcal
  precondition and NO reactor exemption: a direct
  engine call would build at 0 kcal (the debit
  floors at 0). The 60-kcal precondition exists ONLY
  in the policy gate, which mirrors the engine's
  stated effort cost.
- The reactor's wired coverage, exhaustively: the
  ability's metabolic {daily: 0} feeds metabolicDaily()
  (the daily drain sum — the pellet zeroes its own
  daily cost, it does not zero effort debits), and
  fusionReactorOnline() is consulted only by feastBuff
  (feast-multiplier ceiling/floor) and table/seat
  code (the cold-table / reactor-seat honesty beats).
  No ability-cost, tickAction-cost, or buildBridge
  path consults it. Effort debits apply to reactor
  bearers exactly as to everyone else, everywhere in
  the engine.

So the gate cannot read reactor coverage: there is no
wire from the reactor to the bridge decision at all.
The only question the replay can still answer is
whether the live trajectory agrees — and whether the
reactor was in fact installed and online at the
decision, rather than merely offered or pending.

## 2. THE JUDGED RECORD — DAY 13, BOTH LEGS

### ON-variant day 13 (the observed reactor evening)

| input | value | source |
|-------|-------|--------|
| reactor installed | true | scholar.fusionReactor.installed |
| reactor online | true | fusionReactorOnline() true |
| ability held | true | hasAbility('fusion_reactor') true |
| holder | player | state.fusionReactorHolder.who |
| install line this day | yes | "FUSION REACTOR: the pellet goes in — properly, inside you. A warm hum starts behind your ribs and settles. You will never be hungry again. ..." (verbatim, day's transcript) |
| wood in pack | 2 logs | cls.woodPlayer |
| kcal in hand | 0 | cls.kcal AND cls.kcalLive AND row-time scholar.kcal — all three agree at 0 |
| ticks to day end | 95 | cls.ticksToDayEnd (need 96) |
| gates failing | ALL THREE | wood 2 < 4, kcal 0 < 60, ticks 95 < 96 |
| bridge skip | wood-short | first-failure order (wood, kcal, ticks) |
| narration verbatim | "No bridge tonight — the pack holds 2 logs, and a bridge needs 4." | lackingLine wood-short template, proof-checked |

The gate read hand kcal (0), not reactor coverage —
because it has no reactor input to read. The kcal
failure is real (0 < 60) but NOT the deciding gate:
wood fails first, and the evening strands on wood
regardless of any kcal ruling. The "kcal-gated"
phrasing of the backlog observation is therefore loose
in one precise way: day 13 is kcal-FAILING, not
kcal-DECIDED. What the observation got right is the
striking part — a villager who was told "You will
never be hungry again" that same afternoon ends the
day with 0 kcal in hand and a bridge gate that would
refuse on kcal if wood passed.

### ON control day 13 (contrast — no reactor anywhere)

wood 1, kcal 0 (cls.kcal, cls.kcalLive, row kcal all
0), ticks 111, skip wood-short, narration "No bridge
tonight — the pack holds 1 log, and a bridge needs 4."
Reactor: installed false, onlineFn false, hasAbility
false, holder null, no install line on any day of the
leg. The control trajectory never installs the pellet
at all — the reactor evening is variant-specific, and
the control day-13 kcal failure (0 < 60) is just the
already-censused wood+kcal multi-gate class, with no
reactor question attached.

## 3. PERSISTENCE — DAY 14+ WHILE THE REACTOR STANDS

ON-variant still evenings, decision-time gate inputs
(classification values; row-time kcal differs only by
the post-decision warmth fuel, disclosed in Instrument
notes):

| day | wood | kcal (decision) | ticks | skip | reactor |
|-----|------|-----------------|-------|------|---------|
| 14 | 2 | 950 | 221 | wood-short | installed, online |
| 15 | 1 | 703 | 111 | wood-short | installed, online |
| 16 | 0 | 448 | 239 | wood-short | installed, online |
| 17 | 0 | 308 | 365 | wood-short | installed, online |
| 18 | 0 | 1246 | 93 | wood-short | installed, online |
| 19 | 0 | 1124 | 111 | wood-short | installed, online |
| 20 | 0 | 992 | 111 | wood-short | installed, online |
| 21 | 0 | 852 | 239 | wood-short | installed, online |
| 22 | 0 | 1420 | 93 | wood-short | installed, online |
| 23 | 0 | 1240 | 239 | wood-short | installed, online |

The reactor stays installed and online on every still
evening through day 23 (the strand's end); the install
line fires on day 13 only. The gate keeps reading hand
kcal — and from day 14 on the bearer passes the kcal
gate every evening (308-1420 kcal in hand: the
reactor bearer still forages and eats; hand kcal is
not stuck at 0). The kcal question therefore has
exactly one live evening in this substrate: day 13.
A hypothetical 4-log, 0-kcal, 96+-tick reactor
evening — the only shape where the ruling changes an
outcome — never occurs on either leg. The verdict
below rules the read, not a counterfactual outcome.

ON control days 14-16: reactor never installs (false
on every still evening); gate inputs wood 0, kcal
240 / 0 / 0, ticks 238 / 111 / 111, all wood-short.

## 4. VERDICT: GO — CORRECT-AS-WIRED

Ruling, in the prereg's first form, with the code path
cited: **correct-as-wired — the bridge cost is
effort, the reactor covers metabolism, and the gate
reads hand kcal correctly.**

Reasoning, in order:

1. The gate reads exactly what its code says: hand
   kcal (scholar.kcal, rounded), against the 60-kcal
   floor. The replay proves it on the live
   trajectory: three independent reads (cls.kcal,
   cls.kcalLive, row-time scholar.kcal) agree at 0
   on the judged evening, and the function has no
   reactor input to consult.
2. The reactor's wired coverage is daily metabolism
   only (metabolic {daily: 0} in the ability def;
   fusionReactorOnline consulted solely by feast and
   seat code). Counting reactor coverage in the bridge
   gate would DIVERGE from the engine's own cost
   model, not align with it: buildBridge debits the
   same 60 kcal of hand kcal from reactor bearers
   with no exemption. A gate that passed a 0-kcal
   reactor bearer while the engine still debited the
   effort would be the inconsistent wiring, not the
   current one.
3. The observed evening's outcome does not turn on
   the kcal read at all: wood-short decides it
   (2 < 4), and ticks also fail (95 < 96). No ruling
   on the kcal question changes day 13 — the bridge
   does not build under either reading.
4. The fiction tension is real but is a design
   question, not a bug: "You will never be hungry
   again" sits beside a 0-kcal hand the same evening
   because the reactor replaces the daily burn, not
   the hand pool — the bearer still carries, spends,
   and refills hand kcal (days 14+ prove it: 308-1420
   in hand). Nothing in the reactor's text promises
   effort without hand kcal; its promise is "the
   pellet covers your metabolism," and lashing is
   labeled effort, not metabolism, by the engine
   itself.

What this verdict does NOT claim: it does not rule
that a reactor bearer SHOULD be refused heavy work at
0 kcal as good design — only that the refusal is the
engine's stated cost model applied consistently, not
a wiring error. If Steve rules the other way (effort
counts reactor coverage), the fix is small and is
specified conditionally in §6, not landed here. The
genuine narration gap on this evening — the line
names wood while kcal and ticks also fail — is the
already-filed lackingline finding (multi-gate lines
hide concurrent failures), not a reactor finding;
this arm does not re-file it as its own.

## 5. SENSE-TEST (law — day 13 variant, read end to end)

The day reads as a person, not a ledger. A foraging
day: wetland patches worked out twice ("step to
another green patch and forage again"), a snare set
("Check it tomorrow"), Green Thumb deepening to L2
with the System cheering ("Like watching a seed
decide to be a tree!"). At the creek, the pellet
goes in mid-day — the install line and the ability
line land together, and the ability line itself
supplies the precise promise ("the pellet covers
your metabolism"), which is narrower than the
install line's flourish ("You will never be hungry
again"). The System's own sales pitch follows
("NEVER CHEW AGAIN!"). Then the creek refuses
("no crossing without a bridge or a swim") and the
bridge line names wood only. PASS on mechanism
(every number matches its record; the reactor state
is exactly what the lines claim) and PASS on the
narrower reading (the ability line's "covers your
metabolism" and the gate's hand-kcal read are
compatible sentences). The tension the backlog felt
is between the install line's flourish and the
evening's 0-kcal hand — and the transcript itself
resolves it toward the narrower promise: the pellet
covers metabolism, the hand pool still empties, and
by day 14 the bearer is eating again (950 kcal in
hand). The evening's warmth attempt then fails
honestly ("The coal glows... and dies"), which is
why row-time kcal equals decision-time kcal on day
13 itself — no post-decision fuel delta to disclose
for the judged evening.

## 6. CONDITIONAL FIX SPEC (NOT the verdict — only if Steve rules otherwise)

If Steve rules that effort-kcal should count reactor
coverage, the minimal change is policy-side only, in
scripts/policies/woodcarry.js bridgeDecision's call
site (evening bridge): pass a reactor-online flag
from Game.fusionReactorOnline() (guarded: function
may not exist on all harnesses) and treat the kcal
gate as satisfied when online. Exact shape: in the
bridgeDecision input object, add reactorOnline, and
in the kcal check, `if (!r.reactorOnline && (kcal <
60)) refuse kcal-short`. No engine change needed:
buildBridge's debit floors at 0, so a passed reactor
bearer builds with a vacuous debit — the same
flooring the engine already applies. No change to
gate order, gate numbers, or the narration templates
is implied by this spec; the multi-gate narration
gap stays a separate design call (sim-lackingline-a
§6). This spec is NOT landed, NOT recommended by
this arm, and NOT part of the verdict — it exists
so a later build arm does not have to re-derive the
wire.

## Village assessment (plain words)

The village is the same working village the strand
arms have always seen: it survives all 30 days on
both legs, and its scholar sleeps out by the creek
while the village at home is not poor. On the
press-fed road the scholar's day 13 is a good day
that ends strangely: it learns, it snares, the
System puts a tiny star inside it and promises it
will never be hungry again — and that same evening
it cannot cross the creek, short of logs, short of
food in hand, short of day by one tick. The star
does not change the crossing: the bridge still
wants wood first, and the villager's hands still
hold what they hold. From day 14 the star-bearer
eats like anyone else (hundreds of kcal in hand
most evenings) and keeps stranding on wood alone —
the reactor changed its hunger, not its woodpile.
That is the blank this arm fills: the exact shape
of a reactor evening's gate read, measured rather
than observed — hand kcal, 0, with the reactor
provably installed and online beside it.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Creek/bridge content
reached on both legs (still evenings: control 10,
variant 17 — the woodcarry creek-bucket sets, matching
the prior censuses' still counts). Note on the
tickbudget "rescued" counts (control 8, variant 8):
that analyzer's rescued class is NOT the woodcarry
rescued flag — the flag is false on every creek
evening in both the tickbudget corpora and these
corpora — so no rescued-count comparison is claimed
here; what is claimed is stronger for this arm's
purpose: all 30 evening outcomes match the tickbudget
corpora evening-for-evening on both legs (0/30 diffs
each). Wave reach in this 30-day window: wave 1 on
15215 both legs (as before); waves 4-5 not reached
(same window as the prior strand arms; the driver
records maxWaveUnlocked but the window is pre-seat,
no field — not a wall measurement).

## Wall numbers

NOT OBSERVABLE as reachability on 30-day evening legs
(pre-seat, no field) — reported, never claimed:
national 0, table 0, wins 0 (structurally unreachable
in this band, not a wall measurement); median survival
30 days (ceiling — the seed survived the window on
both legs).

## Proof

scripts/test-reactorgate-a.js: 71/71 checks pass,
including: corpus completeness + errs 0 on both legs;
day-13 gate inputs on both legs (control 1/0/111,
variant 2/0/95) with narration == lackingLine
template; variant day-13 reactor installed + onlineFn
+ hasAbility + player holder + install line in
fullDaySay (both the install line and the
never-hungry promise); all-three-fail classification
on variant day 13; persistence installed+online on
every variant still evening days 14-23 and never on
control; install line only on variant day 13;
bridgeDecision unit cases (4-log/0-kcal refuses
kcal-short — proving no reactor term exists in the
gate; 4/60/96 attempts; 2/0/95 refuses wood-short
first); static checks (woodcarry passes kcalLive as
the gate kcal; bridgeDecision region contains no
reactor mention; whole policy file contains no
fusionReactor mention; buildBridge debits hand kcal
with no reactor exemption); cross-checks vs
lackingline/tickbudget numbers; determinism
ON-variant byte-identical; tracked-diff guard: src/
+ scripts/policies/ diff vs pinned base
3c03d468bbd6f752a35da27aaa535601538a1d15 is EMPTY.

## Metric review

- The prereg's three-read rule (cls.kcal, cls.kcalLive,
  row-time scholar.kcal) earned its keep: on days
  14+ the row-time read differs from the decision-time
  read by exactly the post-decision warmth fuel
  (day 14: 950 → 880, warmth record kcalBefore 950 /
  kcalAfter 880, logSpent 1). Without the
  classification values as the gate read, the
  persistence table would have reported post-fire
  kcal as gate inputs — wrong by 70 on day 14. The
  judged evening (day 13) is unaffected: its warmth
  attempt failed (-0 kcal), so all three reads agree
  at 0. Any future prereg on evening gates must
  require the classification-time read, never a
  row-time proxy, wherever a post-decision step can
  spend.
- The dual-leg design (control + variant) was load-
  bearing, not decorative: the control leg proves
  the reactor evening is variant-specific (no install
  on any control day), which stops the verdict from
  generalizing a trajectory accident into a game rule.
  The prereg's stated deviation (variant carries the
  evening) was confirmed, not assumed.
- The GO bar as written worked: it forced the
  verdict to carry exact inputs + a cited path, and
  the "correct-as-wired vs bug+spec" fork forced the
  engine-side check (buildBridge has no kcal
  precondition) that distinguishes a policy strictness
  from an engine rule. No metric revision is proposed
  for the GO bar itself.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/reactor-gate —
  REACTOR EVENING VERDICT: CORRECT-AS-WIRED (this
  arm, measured): ON-variant day 13, reactor
  installed + online + ability held + player holder,
  gate inputs wood 2 / kcal 0 / ticks 95, skip
  wood-short — the gate reads hand kcal only (no
  reactor wire exists in the bridge path) and the
  engine's own cost model debits the same 60 kcal
  effort from reactor bearers. Outcome does not turn
  on kcal (wood decides). Conditional fix spec in §6
  if Steve rules effort counts reactor coverage.
  (evidence: this file; judged corpora, 15215.)
- [open] 2026-10-31 — food-economy/reactor-gate —
  ENGINE/GATE STRICTNESS GAP, NOTED NOT RULED (this
  arm): buildBridge itself has NO kcal precondition —
  a direct engine call builds at 0 kcal (debit floors
  at 0) — so the policy gate is stricter than the
  engine it mirrors. For a reactor bearer at 0 kcal
  this is the only place refusing on food-energy.
  Whether that strictness is intended is a design
  question for Steve, not a bug found here (the gate
  implements the engine's stated 60-kcal effort
  cost; the engine merely declines to enforce it).
  (evidence: this file §1, §6.)
- [open] 2026-10-31 — food-economy/reactor —
  REACTOR BEARER STILL EATS (this arm, observed):
  the day-13 reactor bearer holds 308-1420 kcal in
  hand on days 14-23 — it keeps foraging and eating
  after "never hungry again." Consistent with
  metabolism-only coverage (hand pool still spent
  and refilled), but worth one line in any reactor
  design note: "never hungry" does not mean "never
  eats" on this substrate. (evidence: this file §3.)

## Instrument notes (disclosed)

- Probe timing: the reactor probe reads at evening-row
  time (after the full daily, including the post-
  decision warmth step). Reactor state cannot change
  in the warmth step (no install/uninstall path
  there), so decision-time reactor state == row-time
  reactor state; kcal, by contrast, CAN change
  post-decision (warmth fuel, 70 kcal on day 14) —
  which is why the persistence table reports
  classification-time kcal as the gate read and the
  row-time value only as a cross-check. Day 13 is
  unaffected (warmth failed, -0 kcal).
- installDays/sinceDay quirk, reported not chased:
  scholar.fusionReactor.sinceDay records 0 on the
  install day (this.state.day at install time), while
  scholar.day reads 13 — the two day counters differ,
  and the probe's holder.day shows null only because
  the probe maps falsy 0 → null. Neither affects the
  verdict (installed/online/holder-who are the
  decision-relevant fields, all unambiguous), but a
  future arm reading sinceDay should know it is not
  the loop-day counter.
- EPERM flap: none observed on this arm's writes or
  commits (both judged legs wrote first-try; prereg
  commit landed first-try). The safe-commit index
  clobber class DID recur after the prereg commit
  (committed file shown as staged deletion +
  untracked); repaired with git update-index --add
  --cacheinfo from the HEAD blob, status verified
  clean before any leg ran. The same check will run
  after the final commit.

## Files

- Prereg: evidence/2026-10-31/sim-reactorgate-a-prereg.md
  (commit d41f13b4d; pinned base 3c03d468bbd6f752a35da27aaa535601538a1d15)
- Evidence (this file): evidence/2026-10-31/sim-reactorgate-a.md
- Driver: scripts/reactorgate-trace-a.js; analyzer:
  scripts/analyze-reactorgate-a.js; proof:
  scripts/test-reactorgate-a.js (71/71)
- Judged corpora: evidence/2026-10-31/
  sim-reactorgate-a-corpus-on,
  sim-reactorgate-a-corpus-on-variant (15215 each);
  analysis: sim-reactorgate-a-analysis.json
- Determinism: evidence/2026-10-31/
  sim-reactorgate-a-corpus-determinism (15215
  ON-variant re-run, byte-identical)
