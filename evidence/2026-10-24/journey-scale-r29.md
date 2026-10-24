# journey-scale r29 — COVENANT LEAGUE GRANARY: DOES IT FILL, DOES IT DRAW? (2026-10-24, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261024T1543Z. Rotation read 3 → leg 3 SCALE
(days 80–140); wrote 3→0.
**Base:** master@01ed41d93 (pulled at run start; r28's base ef04cd8cb has moved on).
**Driver:** `scripts/journey-scale-r29-20261024.js` (r28 driver, policy swapped
leadcourt→scalecourt, + weekly poolWatch samples). **Analyzer:**
`scripts/analyze-scale-r29-20261024.js`. **Instrument proof:** r28's govClass
classifier test re-run green at this tip (`test-journey-scale-r28-instruments-20261024.js`
ALL GREEN 7/7); the 4-seed run itself is the driver's end-to-end proof.
**Pre-register:** `evidence/2026-10-24/journey-scale-r29-prereg.md` (written
before any sim).
**Policy:** scalecourt (competent + covenant-road courtship). **Seeds:** fresh
84001–84004. **Horizon:** DAYCAP=150, death-aware stop. Pilot seed 84001 ran
clean (honest scatter d41) before the other three launched.

## Pre-registered leg question
r28 proved the LEAD national beat's famine-reserve line is announcement-only
on the lead road (leaguePoolKcal 0 — the lead road has no pool). The covenant
road is the one with a pool. In the wild, does the league granary actually
FILL from real pantries, and does its famine draw ever FIRE?

## Verdicts (binding — none re-scored)
- **C1 pool fills: NOT-ARMED (per prereg) + a deeper finding that supersedes
  the gate.** Only 2/4 seeds formed a covenant link (prereg: <3 such seeds →
  NOT-ARMED). But the deeper finding is structural, not sample-size: poolLive
  is a NATIONAL unlock, set only in answerNationalChoice (Founding Council,
  hierarchy.js:2560) once >=3 covenant bonds stand. A pre-national covenant
  link can never fill a pool — weekly pours require anyPoolLive
  (hierarchy.js:3050). 84003's two covenant links lived 107–108 days at
  trust 97–100 with poolLive false and pool 0 at every weekly sample. The
  pool is not a pre-national mechanism at all; it is a post-national one.
- **C2 draw when armed: NOT-ARMED.** No seed ever had pool > 0, so no
  bare-pantry day-start was ever an armed day. Bare days DID happen — 84004
  sampled pantry 200 kcal at d105 and scattered ~d110; 84001/84002 scattered
  on pantry 0 — and with pool 0 there was nothing to draw. The famine that
  killed 84004 had no granary to draw on, not because the draw failed but
  because the pool never existed. If Steve's mental model is "the covenant's
  headline promise is draw on it in famine," that promise currently only
  exists after national — pre-national covenant famine is honest, same as
  the lead road's in r28.
- **L1 stay-green: NO-GO (0/4 national ≤d140; bar ≥2/4).** No seed reached
  national. Best was 84003: regional to d151 with 2 covenant links — one
  bond short of the 3-peer covenant bar. This is a covenant-road
  reachability datum, not a regression claim: lead road hit 3/4 national in
  r28 on the same leg, and no code changed the covenant bar between runs.
  The binding miss is reported as NO-GO per §14.
- **L5 stay-green: GO (3/3 voiced).** Every scatter ending is voiced in
  full ("Haven couldn't hold. On the third hungry day, people started
  walking — in different directions. The scattering, again."). 84003 never
  scattered (alive 9/9 at d151). No silent deaths.
- **M4 people: GO (3/3 transcripts meaningful as content).** See People check.
  One driver artifact (Valeria nod-spam) is the same class r27/r28 documented.

## Mechanisms verified in the wild (not just in code)
- **Covenant formation copy vs pool state (observation for Steve, not a bug
  claim):** the formation line says "a COVENANT with Thornfield — no primary,
  no kneeling. Mutual defense and a shared pool, decided by council vote.
  Equals." At formation the pool does not exist and cannot exist until the
  Founding Council; 84003 carried that "shared pool" for 100+ days at pool 0.
  Likewise the grief-concession line "Haven concedes: Thornfield's pool share
  halves for four weeks" references a pool share pre-national. The charitable
  reading is that the pool is a term of the covenant that activates at the
  council — but as written, a player could reasonably expect famine relief
  that cannot arrive. Steve's call whether the copy should say "a shared pool
  when the council sits" or the mechanism should change.
- **Covenant crisis concession works pre-national:** grief-tested covenants
  on 84003 (Thornfield, Ashford) both conceded honestly with the halved
  share priced aloud. The crisis machinery operates; only the pool doesn't.
- **Village-as-protagonist continuity works:** the player character died in
  the arena on 84002 three times (d24, d42, d47) and the village kept playing
  under successors to its d56 scatter. Deaths are succession, not game over.
- **Tribute flows on covenant-adjacent links:** 84003 tribArrive ×3,
  84002 tribShort ×2, 84004 tribShort ×3 — the tribute ledger voices
  arrivals and shortfalls beside the covenant bonds.

## Village assessments (plain words)
- **84001 (scatter d41, village rank):** the early collapse. Player died in
  the arena d9; sickness and starvation took 9 more; pantry bled 25,950 →
  0 across the weekly samples; third hungry day scattered the 5 remaining.
  Never formed a link. Honest, voiced, early.
- **84002 (scatter d56, regional):** the arena-killed one. Three successive
  player deaths in the arena, one thin primary-sub link at trust 4, pantry
  28,120 → 334, scatter on the third hungry day. The bond at trust 4 is a
  bond in name only — worth watching whether such links should snap or
  dissolve aloud rather than linger.
- **84003 (alive 9/9 at d151, regional):** the patient one. Two covenant
  links (Thornfield, Ashford) at trust 100/97, one primary-sub link at
  trust 79, pantry positive throughout (15k–25k), 16 contests, 28 deaths
  (all combat/sickness, none starvation at end). One bond short of national
  for the whole back half — the covenant road's long middle, fully
  survivable but stalled one village short.
- **84004 (scatter d110, regional):** the famine one. One covenant link
  (trust 50), one primary-sub link (trust 17), pantry 23,507 at d56 sliding
  to 200 at d105, scatter after the third hungry day. Its covenant bond
  could not feed it — the pool it was promised never existed.

## People check (SENSE-TESTING LAW — 3 transcripts read in full)
- **84003-d90 Harper (teacher, curious):** meaningful. "Do you ever just
  need to be alone?" → player engages → "I go to the treeline edge and count
  my breaths. Ten of them. That's my alone." → closes with an open offer.
  A want, an engagement, a small revelation, an owed thread. GO.
- **84003-d120 Valeria (no shared Spanish):** meaningful as designed,
  driver-spammed as played. The honest language-barrier beat (r27's Ludmila
  class): mime, single caught words, ends where language couldn't reach.
  The driver's engage-first picker spammed nv:nod ×6 — driver artifact, not
  content failure; the content on both sides is coherent.
- **84004-d90 Neasa (aquarium keeper, ask_favor):** meaningful. Pantry-run
  favor with specifics (ridge above the creek, fill packs before dark) →
  player deflects ("I can't right now") → "Forget I asked. They won't
  forget. They'll just stop asking." → "Come see what I found" plants a
  thread. Engage/deflect/resolve-plant-owe all present. GO.

## Blanks filled / fixed this run (tooling only, zero src/js changes)
1. **Driver instrument bug (fixed for future runs):** the r29 census read
   `ctx.proposedLead`, which scalecourt never sets (it keys `proposed`) —
   so "proposed=0" on all seeds was an instrument lie, not zero proposals.
   Census now reads either key. Evidence stands as run (post-hoc ctx is
   unrecoverable); the formation lines in captures are the proposal evidence.
2. **Driver instrument bug (fixed):** covenant peer links carry a/b
   endpoints, not primary/subordinate — covLinks `other` resolved to
   'haven' on every link. Now resolves the non-haven endpoint.
3. **Analyzer added:** `scripts/analyze-scale-r29-20261024.js` recomputes the
   verdict table from census JSONs (no hand-counting in future runs).

## Metric review
- No metric re-scored mid-run. L1 reported NO-GO as bound.
- **C1/C2 gate lesson for the NEXT run:** pre-registering "pool fills once a
  covenant link forms" was wrong at the code level — poolLive is national-
  gated. The next covenant run should pre-register the post-national
  question instead: once a covenant national DOES form (e.g. via a
  3-bond-seeded scenario or longer horizon), does the founding pour move
  real food and does a later bare day draw? Or Steve may rule the
  pre-national pool should exist — that is a design call, not a metric fix.
- **Telemetry check:** quiet (4 files, 4 metrics, no large deviations
  vs scale-covenant.json baseline). Baseline NOT rolled (nothing to roll).
- **Test suites:** r28 instrument test ALL GREEN 7/7 at this tip (the
  classifier this driver reuses). Older standalone scripts
  test-hierarchy-20261007.js / test-scale-ladder-20261010.js fail at
  startup with `ReferenceError: Text is not defined` in genCharacter —
  PRE-EXISTING harness failure, unrelated to this run (zero src/js or test
  files touched; the r29 driver itself ran 4 seeds clean via sim-harness).
  npx jest finds no jest config in this repo — the suites are standalone
  node scripts, not jest. Flagged, not fixed (out of this run's scope).

## Reachable / fun / winnable (scale leg, covenant road)
- **Reachable:** national NOT reached on 0/4 competent covenant seeds this
  run (best: 2/3 bonds). The covenant road's long middle is survivable
  (84003 to d151) but the third bond is the binding constraint — whether
  that is courtship pacing, village discovery, or the opinion-10 bar is an
  open question for the next run, not answered here.
- **Fun:** the covenant crisis concessions and the patient-realm feel land;
  the "shared pool" promise unfulfilled for 100+ days is the sour note.
- **Winnable:** the table approach never opened on the covenant road this
  run (no national → no seat arc). Lead road remains the demonstrated path
  to the table (r26–r28).

## Evidence
`evidence/2026-10-24/journey-scale-r29-covenant/` — 4 census JSONs, captures,
beats/moments/table dumps, gov dumps, 3 transcripts, run log. Driver +
analyzer + prereg + this note under `scripts/` / `evidence/`.

## Ops
- Rotation: `journey-rotation-a.txt` → 0 (3→0).
- Commit: tooling + evidence only, zero src/js changes. No [needs-eyes] —
  no player-facing change; the pool-copy observation is for Steve's call.
- Master did not move during the run (01ed41d93 throughout).
