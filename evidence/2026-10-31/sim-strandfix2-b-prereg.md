# sim-strandfix2-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0741Z,
arm sim-strandfix2-b, axis food-economy. Worktree sim-strandfix2-b.
POLICY PROTOTYPE ONLY: one new policy file, zero edits to any existing
policy file, zero src/js changes, zero policy-default flips. Sibling
trees never touched; main tree never touched. The coordinator merges;
this worker does NOT push, bump, or verify live.

## Canon read before designing

docs/CANON.md first, then docs/TIME-ECONOMY.md (ticks/day-parts, fell
96 / bridge 96 / forage 16 / gather 16 / walk 1 per step, sleep guards).
No canon doc covers the bridge/fell tick budget or the strand-fix blank
itself — stated here instead of inventing canon. Standing rules that
bear on it: "no silent actions" (every act narrated), perception law
(Steve 2026-10-28: decisions from what the villager senses, never a
roster/list feed).

## Prior art read in full before designing (all priced, none repeated)

- sim-strandfix-morning-b (2026-10-30): morning wood-seek NO-GO. Food
  phase converts both-evenings to wood-only but never rescues: the tool
  gate (Stone knife cannot fell; axe tier required) blocks every fell,
  the wake tile holds 0 bushes, and the food phase's own 17 ticks
  create a new ticks-short evening (guard day 10).
- sim-strandfix-ticks-b (2026-10-30): whole-day hold refutes itself.
  Ticks preserved, but the hold freezes position at the foodless west
  corner, suppressing every morning press (0 presses both legs) and
  LOSING the guard day-11 rescue the control leg already had.
- sim-selecttrim-a (2026-10-31, DIAG-GO): wrapper over competent.daily
  from exported beats preserves the walk 8/8 and presses, but saves
  only 1-3 ticks on early strand days, cannot clear the day-7 49-tick
  hole, and cannot clear day-10's 3-tick hole while keeping forage.
  Talk is a -60 kcal food event; the day-7 81-tick routine is a HAVEN
  day no creek-wake gate can touch.
- sim-waitsalign-a (2026-10-31, DIAG-GO): the too-late-sleep line,
  evening dayTicks 448. Sleep accepted (clock <= 448) -> 3 waits land
  on 384 (128 ticks left next morning); sleep refused (clock >= 449)
  -> next morning 256 (256 left). Saving 3 ticks on a 451-clock
  evening flips the next morning 256 -> 384: a 3-tick save costs 128
  next morning. Any trim must price savings against the 448 line.
- sim-tickfell-a (2026-10-31, NO-GO at pilot): tick-budgeted fell gate,
  0 attempts: the axe never arrives on the warmed-only stack, and the
  joint fed+axe+roomy conjunction never co-occurs on strand mornings
  (7 wood-short ON mornings fail tool 7/7, kcal-floor 7/7, ticks 4/7).
- sim-stashfetch-a (2026-10-31, DIAG-GO): ordinary routine fetches best
  weapon/armor at home day 1 — not a strand mechanism, cited only to
  exclude it as a confound.
- sim-axearrival-a (2026-10-30, DIAG-GO): the axe arrives day 15
  intraday by corpse loot (Ethan, died day 11); day 16 the hatchet is
  held but kcal-floored; day 17 a fell fills the pack (+5 wood) but
  the evening still strands on ticks alone (23 left); day 18 rescued
  return. Morning fells before day 15 are impossible on any stack.

## The design: evening flip-bank + morning pack-eat (FLIPBANK)

This design does NONE of the failed things: no morning wood-seek, no
whole-day hold, no routine trim, no morning fell. It works the two
priced levers the prior arms left untouched — the evening clock and
the warmth fuel — and it never moves the villager in the morning, so
the selecttrim walk and the morning press position are untouched by
construction.

EVENING PHASE (after inner.daily returns, i.e. after woodcarry's bridge
decision AND after woodwarm's warmth fire, on a still creek evening
only: ctx._wcLast outcome travel-refused, bucket creek, rescued
false; not game-over, not combat, not in tent, not at haven):
  The bridge has already failed, so spending ticks now cannot hurt
  that evening's bridge. What it CAN change is tomorrow, through two
  priced channels:
  (a) THE FLIP: if the post-warmth clock is <= 448, sleep will be
      accepted and tomorrow morning is cramped (384 used, 128 left).
      Spending ticks to push the clock to >= 449 makes sleep refuse
      ("too late for real sleep") and tomorrow morning roomy (256
      used, 256 left) — a gain of 128 morning ticks for a spend of
      at most 80 evening ticks. The phase fires ONLY when the flip is
      within reach: needed = 449 - clock <= 80 ticks (at most 5
      actions: walk steps at 1 tick, gatherFallen 16, forage 16).
      If needed > 80 it skips 'flip-too-far' (an 8+ forage evening
      is fiction-breaking and stock-limited, and is not attempted).
      If clock >= 449 it skips 'already-flipped' (tomorrow is
      already roomy; no spend needed).
  (b) THE BANK: the same evening actions bank tomorrow's food and
      fuel. Actions in order until the clock reaches >= 449 (or the
      action cap): first, if branches < 2, BFS-walk (occupied tile's
      own detail grid, morning-b precedent) to a tree/bigtree stance
      and gatherFallen until branches >= 2 (16 ticks, 10 kcal, NO
      tool gate — deadfall is always available). Branches >= 2 makes
      the NEXT night's warmth fire MISS ('branches-available'), so
      warmth cannot spend a bridge log that night — the ON leg's
      wood decline (4 -> 3 -> 2 -> 1 -> 0 across warmth successes)
      is the wood gate's slow bleed, and this stops it without
      touching woodwarm. Then forage presses (16 ticks each) on the
      evening tile, banking pack food for tomorrow morning.
  (c) LAST-LIGHT BANK (already-flipped evenings only): if clock >=
      449 and ticksLeft >= 17, up to 2 forages (or a short walk +
      forage within the ticksLeft budget, always keeping the final
      clock <= 505) bank pack food for tomorrow morning. Day 7 is
      the case in point: clock 465, ticksLeft 47, tomorrow already
      roomy — the only thing a day-7 evening can still do for day 8
      is bank food. Yield is MEASURED, never assumed: forage on an
      unassigned/foodless 3x3 may yield nothing or unknown-only
      lump, and the morning eat records its realized net.
  Every evening act carries ONE honest say line naming what was done
  and whether the night flipped, banked only, or fell short. Acted
  evenings that do not flip say so plainly.

MORNING PHASE (before inner.daily, stranded morning gate exactly as
prior arms: previous evening still-creek, wake not at haven, not in
combat, not game-over): if pack food kcal > 0 (morning-b's
packFoodKcal sum, kcalEach > 0 items only) and ticksLeft >= 1, call
Game.eat() ONCE (1 tick) and record realized net. NOTHING ELSE in the
morning: no walk, no forage, no fell, no brush. Position is preserved
exactly, so the morning press cell and the routine's walk are the
control leg's own.

What this design deliberately does NOT do, and why: it never attempts
a morning fell (tool gate, tickfell NO-GO); it never trims the routine
(selecttrim ceiling 1-3 ticks, waitsalign flip penalty); it never
holds the day (ticks-b press suppression); it never spends a bridge
log (warmth is the spender, and branches block it); it never calls
travelTo, buildBridge, or takeWood.

## Sibling coordination (read-only, no waiting, no shared code)

The sibling arm this run is sim-jointgate-b (the fed+axe+roomy morning
gate). At prereg writing time its prereg file was NOT present in its
worktree (checked: no sim-jointgate-b prereg under its evidence
directory), so there is nothing to coordinate against beyond the
brief. The arms stay independently committable by construction:
jointgate is a MORNING fell gate; this arm is an EVENING flip-bank +
morning pack-eat; disjoint files, disjoint mechanisms, no shared code,
no shared policy file. If jointgate's prereg appears later, this arm
does not change: its gates above are frozen at this commit.

## Prevention-counts restatement (the 0415Z decision, in my own words)

A both-evening counts as converted for this arm if the variant leg
PREVENTS it as well as if it is rescued same-day. Prevented means: no
creek still evening on that loop-day because the strand ended earlier
on that leg (villager home) through a recorded flip-bank / pack-eat
chain. Rescued same-day means: bridge built or return home that
evening. A prevented day counts ONLY when the strand-ending rescue is
causally linked to a recorded flip-bank or pack-eat action on that
leg; trajectory drift without a recorded link does not count. The GO
bar below is written on still-count FALL, not on a conversion count,
so a single tail rescue that leaves the count unchanged cannot pass
by re-labelling prevented days.

## Substrate (asserted FATAL in the driver)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON),
STRANDFIX2=0 (control/OFF) / 1 (variant), DAYS=30, PRESSB unset/0
(never stacked with pressb, as in morning-b). Seeds: the 8-seed pilot
band 15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337 (the bank's
first 8, including the sole strand seed 15215). Control legs run
through the existing kcalshort driver (unmodified); variant and OFF
legs run through the new strandfix2 driver (same warmed stack, gate
0 = OFF). OFF legs must reproduce the kcalshort control legs exactly
on per-seed creek/still/rescued counts (det-gate, as in morning-b).

## Horizon + why (death-aware, never a fixed 200d by default)

DAYS=30, death-aware: the harness stops at Game.over (dead villages
stop simulating; the +10d tail is the harness's own end handling).
30 days covers the whole strand (control guard nights 7-9, ON nights
7-16, plus the day-17/18 tail) and 12 post-strand guardrail days, and
matches every prior strand arm's census window, so counts compare
exactly. A 150-day panel would measure a different question on a
different substrate and cannot express this stack (as declared by
tickfell-a and the other strand arms); the §15 comparison here is
the paired control-vs-variant census through the analyzer, never
labelled a panel run. Wall numbers (national/table/wins) are NOT
observable on a 30d pre-seat census and will be reported as such,
not fabricated.

## Primary metric + GO threshold (judged exactly as written)

Primary metric: the stranded-evening census on seed 15215, guard + ON
legs, extracted exactly as in tickfell-a (still = woodcarry bucket
creek + rescued false; rescued = bucket creek + rescued true; strand
= maximal run of still evenings on consecutive loop-days; both-evening
= a loop-day still on BOTH control legs).

GO iff ALL of:
  (a) still-count FALL >= 2 on at least one variant leg vs its
      same-WOODWARM control leg, AND the fall is causally linked to
      recorded flip-bank / pack-eat actions on that leg (at least one
      recorded act on the evening before, or the morning of, a
      rescued or prevented day in the shortened strand);
  (b) strand length does NOT increase on EITHER variant leg vs its
      control (total still count AND maximal still-run, both
      non-increasing);
  (c) GUARDRAILS (all must hold):
      - no earlier death: no seed's vessel death / game-over day
        moves earlier on a variant leg vs its control;
      - no new death mode: no death cause on a variant leg absent
        from that seed's control leg;
      - no newly ticks-short evening on any seed (per-leg
        ticks-short still-evening count <= control);
      - no increase in creek still counts on any non-strand seed.
Otherwise NO-GO. A pilot with zero flip-bank acts is NOT a pass: it
is a substrate finding, and the confirm legs are still run ONLY if
the pilot sniff below passes (records complete on every still
evening, errs 0); if the pilot records are incomplete or the driver
crashes, the lever is KILLED-AT-PILOT and no confirm spend follows.

## Staging

- PILOT (sniff only, never judged): 8 seeds, ON variant leg only.
  Pass iff 8/8 files present, errs 0, every 15215 ON still evening
  carries a flip-bank record (act or skip with reason + clock), and
  at least one flip-bank evaluation ran (act, already-flipped, or
  flip-too-far — i.e. the mechanism was evaluated on a real still
  evening, not merely wired). Pilot files are NEVER mixed into
  judged corpora.
- CONFIRM (judged): 8 seeds x 4 legs (guard/ON x control/variant)
  + OFF det-gate legs + determinism re-run of the ON variant leg
  (byte-identical corpus required, as in axearrival-a).
- SENSE TEST (law): read the fullDaySay lines of every converted /
  prevented evening's preceding evening and morning. The fix must be
  NARRATED (evening say line + morning eat line where applicable),
  never silent. A conversion with no narration in the transcript is
  reported as a sense failure even if the census passes.

## Metric review (carried in the evidence file; revisions apply to the
NEXT run, never mid-run)

Open questions noted before any judged leg, not resolved by re-scoring:
- Whether evening forage on a foodless 3x3 yields bankable food at
  all (the day-7 bank's value turns on this; the pilot measures it).
- Whether branches gathered in the evening survive the routine to
  the next night's warmth gate (material spend elsewhere in the
  routine could consume them; the variant legs measure it).
- Whether a flipped morning's 256 ticks actually convert to a bridge
  when wood is 3 (it does not — wood is a hard 4; the flip only helps
  wood-4 evenings, which is why branch preservation is in the same
  design, not an optional extra).
- Whether the GO bar's fall >= 2 is too coarse if the design shortens
  the strand by exactly 1 night on both legs (fall 1 + 1): under this
  prereg that is NO-GO, and the evidence file will say so rather
  than re-barring mid-run.
