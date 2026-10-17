# sim-winstall — WIN CHAIN STALLS AFTER THE TABLE MODAL ON THE SEATDRIVE SUBSTRATE (flesh-out loop, 2026-10-17)

Axis: scale-onramp. Run: fleshout-20261017-0816Z (arm). Worker: sim-winstall.
Claims sim-findings #446 (marked claimed for this run): on the seatdrive-composed
substrate (FEASTSCALE_R13=1, SEATDRIVE=1 via scripts/policies/seatdrive.js
leadseat/belongseat — see evidence/2026-10-17/sim-seatblow.md for the full
substrate/seed/capture spec), 11/16 invitations staged, the driver took the seat
11/11 (seatTakenDay 90-119), phaseEnd='paths', tableDone=1 — but wins 0/16 within
the 180d death-aware horizon. The table modal runs to completion and no win lands.

DIAGNOSTIC ARM: telemetry-only, read-only instruments, ZERO behavior change,
zero src/js. LANE CONSTRAINT: src/js/game.js and src/js/engine/calories.js belong
to sibling loop B this run — neither file nor any src/js is touched.

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14 — written BEFORE any sim)
THE QUESTION: the driver took the seat 11/11 but wins 0/16. The table modal runs
to completion and no win lands. WHY?

SUBSTRATE (asserted up front, identical to the seatblow sweep for direct
comparability):
- FEASTSCALE_R13=1, SEATDRIVE=1 EXPLICIT (unset is not the pinned state).
- scripts/policies/seatdrive.js leadseat/belongseat = withSeatDrive(
  withWinDefer(tribfloor leadfeast/belongfeast)).
- 8 FRESH seeds 5201–5208 x {leadseat, belongseat} = 16 runs, 180d
  death-aware, identical-seed lead/belong pairs. Fresh = 0 filename hits
  across evidence/ (verified by the seatblow arm 2026-10-17; incidental
  content hits documented there).

WORKING HYPOTHESIS (from code reading 2026-10-17, to be MEASURED not assumed):
the seatblow sweep's env asserted FEASTSCALE_R13=1 + SEATDRIVE=1 ONLY —
sweep-seatblow-20261017.js contains NO reference to WINDEFER/WINPURSUIT/
TRIBFLOOR/SUCCGRACE/RAIDDENSITY. The seatdrive stack's modal drain
(winseek tableRoad) is reached ONLY via withWinDefer's internal drain, which
is env-gated: windefer.js layerOn() = process.env.WINDEFER === '1'. With
WINDEFER unset the layer delegates byte-identically to the tribfloor base,
which has no table modal verbs — so tableTakeSeat() opens the 7-door offer
(tableScene → tableOfferPaths, phase='paths', tableDone=1) and NOTHING EVER
ANSWERS IT. The per-seed seatblow data corroborates: pathTaken=None on all 9
listed sitting runs, phaseEnd='paths', tableDone=1, wins=0. The "winning"
seatdrive sweep (evidence/2026-10-15/sim-seatdrive.md: 12/16 sittings, 12/16
wins) set WINPURSUIT=1 + WINDEFER=1 explicitly in-process on top of the full
tribcollapse stack. If the hypothesis holds, the stall is not a win-check
failure and not a horizon problem — the modal is UNATTEMPTED.

INSTRUMENTS (scripts/-only, read-only attach, exact restore):
- scripts/winstall-instrument-20261017.js — wraps (record + delegate, never
  alter): Game.chooseTableOption (every call: day, option id, phase/path/beat
  before→after, pending modal signature after, won), Game.tableScene (sits),
  Game.winDayFloorDefer (deferrals), Game.tableResolveFinal (finals reached),
  Game.say/Game.sysSay (ring buffer, table lines only). Daily pure-read
  sample: T.phase/path/beat/winDeferred/branch, pending modal sig + option
  count, pg.tableWaiting/tableDone, scholar day, Game.over/won,
  winDayFloorOk(). finish(ctx) reads ctx.tableAnswers (the drain's own
  counter) and the end-state snapshot.
- scripts/sweep-winstall-20261017.js — 16-run sweep + horizon probe (see
  below). Per-seed JSONs evidence/2026-10-17/perseed-winstall/.
- scripts/analyze-winstall-20261017.js — per-run stall attribution + verdict
  (no sims).
- scripts/test-winstall-20261017.js — proof: RED-pinned stall classifier,
  det-gate byte-identical pairs, SMOKE schema + 0-error, layer-live markers
  honest (seat taken on sitting seeds; drain-off marker: tableAnswers==0 when
  WINDEFER unset).

PRIMARY (diagnostic GO): the stall mechanism named with evidence on 100% of
the sitting runs. Any sitting run with an unattributed stall = MISS (NO-GO,
never re-scored). Attribution = per-run record of {modal answered y/n
(chooseCalls>0), finals reached y/n, win-check reached y/n, deferral fired
y/n, pending modal signature at end, tableAnswers}.

SECONDARIES (report-only):
- win conversion on the 250d horizon probe (sitting non-winning runs re-run
  to 250d, same seeds — deterministic 1–180d prefix);
- per-run unsatisfied-condition inventory (which win-gate, if any, blocks at
  end: winDayFloorOk, stake, downgrade-loop, or "the modal was never
  answered so no win gate ever ran");
- what the full-stack wincensus substrate provides post-modal that the
  seatdrive-only stack lacks (code + evidence comparison).

HORIZON + why: 180d death-aware for the main sweep (the win-day floor is
day 90; the seat is taken day 90–119 on this substrate; 180d leaves 60–90d
of post-modal room — if the modal were being driven, wins would have to
land inside it). 250d probe ONLY on the sitting subset to distinguish
"too short" from "structurally unsatisfied": a never-answered modal cannot
win at any horizon.

COMPLETION gates: 16/16 runs complete; per-seed JSONs schema-clean (numeric
keys); det-gate byte-identical (instrumented vs uninstrumented, paired 60d
control); 0 instrument errors.

Metric review: (required section, below).

## Results — the stall is attributed (PRIMARY GO)

Sweep ran 2026-10-17 ~05:30–06:10 UTC (FEASTSCALE_R13=1, SEATDRIVE=1 explicit,
seatdrive-composed leadseat/belongseat, 8 fresh seeds 5201–5208 × 2 policies,
180d death-aware + 250d horizon probe on the sitting subset).

COMPLETION gates (all GO): 16/16 runs complete; 16/16 per-seed JSONs
schema-clean; det-gate 2/2 paired 60d runs byte-identical (proof t3);
0 instrument errors. Per-seed JSONs: evidence/2026-10-17/perseed-winstall/
(16 × 180d + 9 × probe250).

### The answering record (the diagnostic's payload)

| road | sittings | wins | chooseTableOption calls | drain answers (ctx.tableAnswers) | stall |
|---|---|---|---|---|---|
| leadseat | 5/8 | 0/8 | 0 | 0 (counter never initialized — the drain never ran) | 5 × modal-unanswered |
| belongseat | 4/8 | 0/8 | 0 | 0 (counter never initialized) | 4 × modal-unanswered |

Sit days: leadseat 90, 90, 115, 119, 93; belongseat 90, 90, 96, 90 —
day-for-day identical to the uninstrumented seatblow sweep on the same
seeds/policies (the instrument is neutral on the 180d horizon too, not just
the 60d det-gate pairs).

On ALL 9 sitting runs at end: phaseEnd='paths', pathEnd=null,
tableDoneEnd=1, floorOkEnd=1 (the day-90 win floor was MET — no deferral
involved), deferN=0, finalN=0, weakenedEnd=0, and the pending modal
signature is the unanswered 7-door offer:
`the Table|path:feared,path:beloved,path:assimilated,path:defiant,path:relay`
(5 earned doors). Zero chooseTableOption calls on 16/16 runs — the modal
was answered on 0/16 runs.

The 7 non-sitting runs: 6 village-lost early (days 24–78, before any table)
+ 1 national-no-seat (belongseat-s5208, survived to d182, never invited —
the tablegate gate again). 2 runs (belongseat-s5202 d61, leadseat-s5203
d78) staged an invitation (tableWaitingEnd=1) but died before the sit day —
so the seatblow sweep's 11/16 invitations = 9 sittings + 2 invited-but-died,
not 11 sittings. The evidence text's "the driver took the seat 11/11" is
corrected to 9/11 invitations (the driver sat every invitation it could —
the other two villages died first).

### The mechanism (measured, not assumed)

1. The seatdrive driver takes the seat: `tableTakeSeat()` → `tableScene()`
   → `tableOfferPaths()` — the 7-door modal opens on `s.tableChoices`,
   `T.phase='paths'`, `pg.tableDone=1`.
2. The ONLY code that answers `s.tableChoices` is winseek's `tableRoad`
   drain, reached via `withWinPursuit` (env WINPURSUIT=1) or `withWinDefer`'s
   internal drain (env WINDEFER=1 — windefer.js `layerOn()`).
3. The seatblow sweep's env asserted FEASTSCALE_R13=1 + SEATDRIVE=1 ONLY
   (sweep-seatblow-20261017.js contains no WINDEFER/WINPURSUIT/TRIBFLOOR/
   SUCCGRACE/RAIDDENSITY). With WINDEFER unset, `withWinDefer` delegates
   byte-identically to the tribfloor base, which has no table modal verbs —
   so the offer sat unanswered from the sit day to day 180.
4. The win check never ran: every win site (table.js:777/878/960/985)
   gates on `winDayFloorOk()` + the path challenge resolving through
   `tableFinals` → `tableResolveFinal`. With 0 answers the challenge never
   started; there is NO unsatisfied win condition on any of the 9 runs —
   the chain never reached the win check. The floor was met (floorOk=1),
   no deferral fired, no stake failed, no downgrade looped.

**One-line mechanism: the seatdrive-composed sweep ran with the modal
drain env-gated OFF (WINDEFER unset) — the driver opened the 7-door offer
and nothing in the policy chain answers modals, so the offer sat pending
from the sit day to the horizon on 9/9 sitting runs.**

### Horizon probe (250d, sitting subset): structurally unsatisfied, not too short

9/9 sitting runs re-run to 250d (same seeds — deterministic 1–180d prefix):
wins 0/9, stall modal-unanswered 9/9, chooseCalls 0/9. Two villages died
with the offer still open (leadseat-s5201 d201, belongseat-s5203 d191);
the other seven survived to d252 with the 7-door offer still pending.
A never-answered modal cannot win at any horizon — the probe rules out
"too short" and confirms "structurally unsatisfied".

### Full-stack comparison: what the winning stack provides post-modal

The sim-seatdrive armed stack (evidence/2026-10-15/sim-seatdrive.md:
12/16 sittings, 12/16 wins) = FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1
+ RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1 + SEATDRIVE=1, with
WINPURSUIT=1 + WINDEFER=1 set explicitly in-process.

| layer | full (12/16 wins) | seatblow (0/16) | role |
|---|---|---|---|
| SEATDRIVE | 1 | 1 | takes the seat (tableTakeSeat) |
| WINPURSUIT / WINDEFER | 1 | unset (OFF) | **the modal drain (tableRoad) — the ONLY post-modal layer** |
| TRIBFLOOR | 1 | unset | tribute never drops pantry below 2-day floor — pre-table survival |
| SUCCGRACE | 1 | unset | answerable renegotiation beat at succession funerals — pre-table survival |
| RAIDDENSITY | 1 | unset | young-national raid cooldown — pre-table survival |

Post-modal, the full stack provides exactly ONE thing the seatdrive-only
stack lacks: the drain. sim-seatdrive measured tableAnswers=60 (5 per run:
door + 3 challenge beats + final) and all 12 sittings converted.
TRIBFLOOR/SUCCGRACE/RAIDDENSITY keep villages alive TO the table — on the
seatblow substrate 9 villages reached and sat the table without them, so
survival was not the binding constraint on the stall; the unanswered modal
was. The seatdrive policy's own header says "The landed layers drive the
modal — this layer only opens the door" — the seatblow sweep ran WITHOUT
the landed layers switched on. **The composition is incomplete — at the
sweep-env level, not in the game and not in the policy.** Future
seatdrive-composed win-side sweeps must assert WINDEFER=1 (or WINPURSUIT=1)
or the "seatdrive-composed winning stack" label describes a stack that
cannot win.

### Per-run unsatisfied-condition inventory (the task's question)

On each of the 9 sitting runs at day 180 (and day 250): there is no
unsatisfied WIN condition. winDayFloorOk=1 (floor met), no deferral fired,
no stake check failed, no downgrade loop, no trial. The unsatisfied step
is pre-win-check: the 7-door offer (`the Table|path:feared,path:beloved,
path:assimilated,path:defiant,path:relay`, 5 earned doors) pending with
0 answers. The win check (tableResolveFinal's `winDayFloorOk()` gate +
`this.won = true`) never executed because the challenge never started.

## Metric review

(per §14 — pre-registered metrics bound the run; the verdict stands as
measured, never re-scored)

1. **PRIMARY (diagnostic GO) = 100% of sitting runs attributed: GO.**
   9/9 sitting runs attribute to `modal-unanswered` with the answering
   record (0 chooseTableOption calls, drain counter never initialized,
   pending 7-door signature at end). 0 unattributed. No re-scoring.
2. **The hypothesis was confirmed by measurement, not assumed.** The
   pre-registration named the WINDEFER-off mechanism from code reading;
   the instrument measured it: 0/16 runs with any chooseTableOption call,
   tableAnswers null (not 0) on all 16 — the drain's counter is only
   initialized inside tableRoad, so null is the honest "the drain never
   ran" marker (the proof's t4 pins this; an earlier assertion expecting 0
   was corrected mid-proof — documented, the mechanism payload unaffected).
3. **Two corrections to the seatblow evidence text** (measured here):
   (a) "the driver took the seat 11/11" → 9/16 sittings; 11/16 invitations
   = 9 sat + 2 invited-but-died-pre-sit (belongseat-s5202 d61,
   leadseat-s5203 d78). (b) "the table modal runs to completion" → the
   modal never ran at all: pathTaken=None, 0 answers, phaseEnd='paths' with
   the offer still pending. The stall is one step earlier than #446 framed
   it — not "the win check fails after the modal" but "the modal is never
   answered".
4. **The 250d probe was the right secondary.** It cleanly separates "too
   short" (wins would appear) from "structurally unsatisfied" (0/9 wins,
   modal still pending, 2 deaths with the offer open). The stall is
   structural to this env composition.
5. **Limitation for the next run:** the det-gate pins instrument neutrality
   on 60d pairs; the 180d neutrality is evidenced by day-for-day sit-day
   reproduction vs the uninstrumented seatblow sweep (9/9 sit days match).
   A 180d paired det-gate would be the stronger pin if a future arm needs
   it.

## Village assessment — what the stall FEELS like (plain words)

Sense-read of leadseat-s5201 (sit d90, modal pending to d180+):

The village does everything right. It feasts, it fights feasted, it earns
the lesser seat — the System reads the audit aloud and the galaxy listens.
The driver takes the seat from Haven. The ring of pale light waits. Five
doors stand open, named and priced: feared, beloved, assimilated, defiant,
relay.

And then nobody walks through any of them. Not for a day — for ninety
days. The village keeps living around the waiting ring: flashbacks fire
(reading glasses, grandfather's rope, the dispatcher's headset — the
System translating keepsakes aloud), word travels ("Out there they call
you the Feared"), feasts come and go. The table is the furniture of the
world now, not its climax. Two probe villages died with the offer still
open — leadseat-s5201's village lost at d201, the ring still waiting.

In-fiction this reads as the System setting the table and the village
never sitting down to eat — a held breath that never exhales. Nothing
robotic in the beats themselves; the wrongness is structural and silent:
no beat ever remarks that the doors are unanswered. The closest the game
comes to noticing is nothing at all.

## Convergence verdict

**answered** — the stall mechanism is 100% attributed on 9/9 sitting runs
(PRIMARY GO), the horizon probe rules out "too short", and the full-stack
comparison names the exact missing layer (the WINDEFER/WINPURSUIT modal
drain). sim-findings #446 → [answered] with the mechanism. No game change
(telemetry-only diagnostic; zero src/js). Follow-up for a future win-side
sweep (not this arm): assert WINDEFER=1 (or WINPURSUIT=1) on the
seatdrive-composed stack so the drain runs — the "seatdrive-composed
winning stack" label must name the env that actually won.

## Instruments kept
- scripts/winstall-instrument-20261017.js (read-only attach: chooseTableOption/tableScene/winDayFloorDefer/tableResolveFinal/say wraps, daily pure-read sampler, stall classifier; exact restore)
- scripts/sweep-winstall-20261017.js (16-run sweep + 250d horizon probe)
- scripts/analyze-winstall-20261017.js (attribution + verdict; --probe for the 250d set)
- scripts/test-winstall-20261017.js (proof: 11/11 classifier fixtures RED-pinned, no-op honesty, 2/2 det-gate byte-identical, drain-off marker on 3 sitting runs, SMOKE — ALL GREEN)
- evidence/2026-10-17/perseed-winstall/ (16 × 180d + 9 × probe250 per-seed JSONs)
