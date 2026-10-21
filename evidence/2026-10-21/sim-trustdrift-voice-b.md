# sim-trustdrift-voice-b — CONFIRM of the landed trust-drift voice fix (2026-10-21)

**Axis:** food-economy (second non-converged axis; loop A live on scale-onramp).
**Arm:** confirm duty, not a build. The assigned FIX (backlog #751,
trust-erosion toward dissolution is unvoiced) was already LANDED by the
sibling loop this morning as `abd17010bb` ("[needs-eyes] sim-trustdrift-voice:
voiced trust-drift warning beats + tend-skip boundary", backlogs #751, #753).
Per the loop's convergence rules, building it again would be duplication, so
this run does confirm duty: a 16-seed confirm of the landed lever on real
trust-erosion trajectories. **Zero src/js changes in this run.**

**Canon note:** docs/CANON.md read first. There is NO canon doc covering
link-trust fiction (the sibling run documented the same). Mechanism claims
are grounded in `src/js/hierarchy.js` reads; the beat fiction honors
"If you don't know, it doesn't show" (no trust numbers in the copy) and
"No silent actions" (the blank being filled). docs/SCALE.md confirms the
seasoned bar (30+ days, trust 40+) used below.

## Pre-registration (binding, §14 — written in the proof script BEFORE any sim ran)

- **PRIMARY (real trajectories, 16 seeds 8801–8816):** a 3-link Haven-led
  national realm; link1 (Thornfield) carries a crushing 60,000 kcal/week
  tribute its fields cannot pay, so the REAL weekly `linkTick` drives trust
  down −2/week (arrears accrue, said aloud). Links 2–3 (Ashford, Oakvale) pay
  0 tribute (+1 trust/week, stay seasoned). 110 days of `hierarchyDaily`.
  GO = ≥12/16 seeds: (a) link1's trust crosses below the trust-40 seasoned
  bar exactly once; (b) EXACTLY ONE drift beat fires, naming Thornfield, on
  the crossing day; (c) ZERO drift beats name Ashford or Oakvale; (d) the
  "◈ The realm came apart" verdict fires on the crossing day AFTER the beat
  in the same day's log; (e) the beat names the village and carries no trust
  numbers (no digits).
- **RED (hunks reverse-applied):** the paired run with `_trustDriftWatch`
  stubbed to a no-op (the pre-fix engine had no watcher) must emit ZERO
  drift beats on all 16 seeds while the trust trajectories still cross.
  GO = 16/16 silent.
- **DET-GATE (paired A/B, same seed):** daily trust series byte-identical
  (JSON), link objects byte-identical minus the watcher's declared memory
  (`_trustDriftAbove` + history entries), nationalLive trajectory identical,
  say-log diff = EXACTLY the drift beat lines. GO = 16/16 clean.
- **TEND-REFUSAL (re-verify the landed boundary, 1 seed):** bare-pantry
  `tendLink` returns 0 and voices the refusal line. GO = voiced.
- **SENSE:** a real trajectory transcript (exemplar replay if 8802
  reproduces, else the confirm-A trajectory) read for meaning — does the
  player see the cause of the dissolution coming?

## Results

**PART 1 — 16/16 PASS.** Every seed (8801–8816): crossing on day 154
(deterministic: 8 weekly −2 ticks, 55→39), exactly 1 drift beat naming
Thornfield ON the crossing day, 0 beats for Ashford/Oakvale, the realm
verdict on the crossing day AFTER the beat, no digits in the beat copy.
Paired stubbed runs: 16/16 silent (RED holds — the beats come from the
watcher). Det-gate: 16/16 clean — trust series byte-identical, say-log diff
exactly the beat lines, link objects byte-identical minus declared memory.

**PART 2 — 8802 exemplar replay did NOT reproduce (reported open, not a
fail of the fix).** leadfeast / SURPLUSFEED=1 / FEASTSCALE_R13=1 / SEATDRIVE=0,
180d death-aware on current master (26ef3cae): the village died
(`village-lost`) at day 132; the three Haven-led links' trust CLIMBED
(30→88, 22→60, 30→95) — no link crossed below 40, no genuine drift beats, no
verdict. The 0730Z exemplar's erosion shape (tending stops at the policy's
20k gate, trust 100→7) does not reproduce on current master in this config.
Master has moved substantially since the exemplar was recorded. The
confirm-A trajectories exercise the same real mechanics (weekly arrears
−2/week through the seasoned bar → warning → verdict), so the sense re-read
uses them per the pre-registered fallback.

**PART 3 — tend-refusal re-verified:** bare-pantry `tendLink` returns 0 and
voices "The pantry is bare — there is no grain to send..." (1 seed, separate
instance so the trajectory runs are uncontaminated).

**Full logs:** `/tmp/trustdrift-b-run2.txt` (final GO run);
`/tmp/trustdrift-b-run1.txt` (first run, caught a log-capture bug — see
metric review).

## Sense re-read (SENSE-TESTING LAW)

Real transcript, seed 8801, mechanism-real erosion trajectory. The weekly
chain (every week, said aloud by the real `linkTick`):

> [d105] 🌾 Nothing comes from Thornfield this week — their fields are as
> empty as the wagons look. Hunger isn't defiance, but the ledger doesn't
> know the difference. (Arrears +60,000 kcal, trust -2.)
> …(repeats weekly, arrears compounding, trust 55→41)…

Then, the day trust crosses below the seasoned bar:

> [d154] ⚠️ Thornfield's fire is drifting from ours — their speaker doesn't
> linger at the gate the way they used to, and nobody over there says why.
> Bonds don't mend themselves; a tended fire remembers who fed it.
> [d154] ◈ The realm came apart — no polity answers to Haven now, and Haven
> is a free fire again. National no longer describe this village. The climb
> starts over.

**Judgment:** the chain reads. Weeks of voiced arrears establish the
economic cause; the drift beat names the link and translates the number into
something a person would notice (the speaker's manner at the gate — no trust
meter, no "40"); the verdict lands the same day, after the warning, so the
player learns the bond died BEFORE the funeral, not at it. The beat's closing
nudge ("a tended fire remembers who fed it") points at the real `tendLink`
verb without promising it fixes arrears. One wrinkle: world-feed flavor had
Thornfield's speaker turn over mid-erosion ("Kira holds the fire now", d126),
so "doesn't linger at the gate the way they used to" reads as the village
noticing through whoever comes to the gate — coherent enough, no rewrite
needed. Verdict: **the player now sees the cause of the dissolution coming.
#751 is filled, not just documented.**

## Metric review (§14)

- PRIMARY: met — 16/16 PASS against the pre-registered bar (bar was 12).
  The bar did not move mid-run.
- RED: met — 16/16 stubbed runs silent. The beats are the watcher's.
- DET-GATE: met — 16/16 paired runs clean. The watcher draws no RNG (fixed
  copy, verified by reading the landed diff); the only state writes are the
  declared memory (`_trustDriftAbove`, one `drift` history note, one ledger
  entry per crossing) — same exclusions the sibling run declared.
- TEND-REFUSAL: met — voiced, returns 0.
- SENSE: met — transcript judged above; the fallback (confirm-A trajectory)
  was used because the 8802 exemplar did not reproduce on current master.
- Honest mid-run correction: the first run's beat capture sliced
  `Game.log` by length, but the game log caps at 40 entries — after the cap
  fills, the slice goes empty and beats are missed. Caught because beats=0
  contradicted the sibling's proof; fixed by day-stamped dedupe scanning
  (Game.log caps — future trajectory tests must scan, never slice).
  Also tightened the beat matcher (`/drift/i` false-positived on "the
  spores only drift so far" and "they drift" in the exemplar replay) to the
  actual beat copy. Both fixes are in the committed script; the final GO run
  used them.
- §15: fiction confirm — no balance levers move, so no balanced-panel
  before/after was run (declared, not dodged). The paired det-gate is the
  instrument; the pre-registered threshold is the judge.
- Convergence: this arm is a confirm of a content fix, not a scale lever —
  it moves no wall numbers. It verifies the narration blank (#751) stays
  filled on real trajectories.

## Design calls (numbered, for Steve's overrule)

1. **Confirm instead of build.** The sibling loop had already landed the
   assigned fix (both #751 and #753) 5 hours before this arm's claim was
   written. Rebuilding would have duplicated their commit and risked a
   merge conflict on src/js/hierarchy.js. Chose the loop's prescribed
   confirm duty instead. If you'd rather this arm had extended the fix
   (e.g., the policy-side "tending paused" line the sibling deliberately
   left unfaked), say so.
2. **Exemplar non-reproduction reported open, not chased.** The 8802
   trust-erosion shape from the 0730Z run does not reproduce on current
   master (village dies at 132d; links' trust climbs). I did not chase why —
   that's a food-economy/policy trajectory question for a DIAG arm, and the
   confirm's mechanism-real trajectories cover the fix's behavior. Named
   next: a DIAG arm could re-attribute the 8802 shape on current master.
3. **Tribute-0 kept links.** Ashford/Oakvale pay 0 tribute (+1 trust/week)
   to hold the realm's other two seasoned links stable. A 0 tribute is
   always "paid" by the tick's own logic — legitimate lever, not a hack.
4. **No [needs-eyes] on this commit.** The player-facing fiction is the
   sibling's (already tagged); this commit is confirm + evidence only.
   The sense verdict above is my judgment for your overrule in the report.

## Files

- `scripts/test-trustdrift-voice-b.js` — the confirm (16-seed paired
  trajectories + exemplar replay + tend-refusal re-verify). Exit 0 = GO.
- `evidence/2026-10-21/sim-trustdrift-voice-b.md` — this file.

**Verdict: GO** — the landed trust-drift voice fix behaves on real
trajectories: one named warning per drift episode, verdict after the
warning, zero voice in the pre-fix engine, zero gameplay disturbance.
