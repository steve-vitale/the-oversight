# Journey: crisis leg (6) r17 — the show must go on (2026-10-15)

## Pre-registration (MEASUREMENT.md §§9–12)

- **Leg:** 6 — crisis, r17. Fresh angle: **a contest fires mid-compound-crisis.**
  r5/r6/r10 covered raids/sieges, r7 famine slope, r8 outbreak talk, r9 the
  famine+outbreak compound, r16 the alien outbreak. NEVER tested as a focused
  question: Steve's contest interruption principle (2026-10-05 — "contests are
  UNAVOIDABLE. If you're not taken, it's announced.") colliding with a village
  that is starving and sick. Does the show still grab? Does talk carry both?
- **Leg question:** When the System grabs villagers mid-compound-crisis
  (famine + outbreak), does the village bend like people — announcement/
  dread/grab intact, talk carries the double load, the returned are tended or
  mourned, no deadlock between the two systems?
- **Interesting finding criteria:**
  - a contest fires while pantry is collapsed AND ≥3 sick, and resolves;
  - talk carries the contest (arena/show/grab/taken/audience) AND the crisis
    in the same conversations;
  - participants return and the village tends or mourns them;
  - no contest stall; no deadlock between crisis systems.
- **Seeds:** pilot 777, 888, 999 (exact literals; matches r9's set). Policy: oracleV2.
- **Method:** r9's compound recipe (establish 20d → blight: pantryAdd+
  stockPantry refused from d20 → d25 stage gut-rot on 5 adults, downstream
  fully real) + ORGANIC contests via contestTick (pilot guarantee d≥21; weekly
  2-budget; runDays drives via harness default). Horizon d55, death-aware
  (+10d tail). Mid convos d35+, end convos 2 sick + 2 healthy, full transcripts.
- **Primary metrics (binding, §14):**
  - M1: ≥2/3 seeds — contest fires during compound crisis (pantry <50%
    pre-blight AND ≥3 sick at fire) AND resolves.
  - M2: ≥2/3 seeds — ≥3/4 end-state convos carry the contest OR the crisis.
  - M3: no contest stall — every fired contest resolves within 7d.
- **Kill rule:** if the pilot shows no contest landing in the crisis window,
  document and move on.

## Pilot incident (script bug, fixed same-run)

The first pilot recorded **zero contests on all 3 seeds** — not a game
finding but an instrumentation bug: my `fireContest` wrapper read
`contest.participants` as an id array, but it is a COUNT (number; the cast
lives on `state.pendingContest.participants[]`). `(3).map` threw inside the
wrapper on every dawn; the dawn's try/catch swallowed it, so the pilot
guarantee retried and re-threw for 34 days — contests were SUPPRESSED by my
own wrapper. Fixed: call through first, read the cast from pendingContest.
Also fixed: `Game.over` early-end was unrecorded (777's village broke ~d30
with no flag). Both fixes in `scripts/diag-crisis-showmustgoon-20261015.js`.

## Run log

### Seed 777 — the village broke (game over ~d30)
2 contests, both PRE-crisis (The Wrong Map d14, Riddle Me This d17 — the
pilot window, healthy village). Blight bit hard (pantry 40731→0 by d30),
outbreak staged d25 (5 sick). Game over between d30–d35
(`villageLost=false`; cause not fully diagnosed — scholar alive, bearer
unchanged; documented, not fixed). 3 convos (2/3 carried crisis). The
compound crisis killed this village before the show could return.

### Seed 888 — the show during the outbreak (d55, 9 living, 7 fallen)
5 contests, 4 during the active outbreak: The Witness d21 (pilot, at blight
start), **Lie Detector d27 (6 sick), Duel d30 (5 sick)**, The Vigil d36,
The Maw d52. All resolved in 1d. The blight leaked (pantry 35118→11560 min —
direct villager deposits bypass the pantryAdd/stockPantry choke, r9 finding
#4), so no true famine; the outbreak was real (sickPeak 6). 4/4 end convos
carried crisis; 2/4 carried contest (one was a "chosen family" false
positive — regex fixed, see metric review). Deaths: 1 early + a 6-death
monster cluster d36–50 (wave pressure, village held).

### Seed 999 — the genuine compound grab (game over ~d51)
5 contests: Duel d21, The Pit d34/d43, Pattern Hunger d39, **The Vigil d49
with pantry=0 AND 3 sick — in-compound, resolved d50**. Village broke ~d51
(pop 9→4). 3/4 end convos carried crisis. Deaths mixed: dehydration, combat,
sickness, monster — the compound kills every way.

## The blank: the grab was conversationally invisible (FIXED)

**Finding:** A villager taken by the System for a televised contest had NO
lately topic. fireContest's own announcement promises "The village will talk
about this for days" — but the lately system (t2LatelyEvent/t2gen_lately in
`src/js/convoTopics.js`) had kinds for naming, mourning, threat, defense,
betrayal, outbreak, weirdness, table, realm… and **no contest/show kind**.
Transcript-verified: Victor, taken sick for "Hide and Seek" 2 days prior,
talked only gut cramps (`latelyKind=outbreak`); Martyna (taken for Lie
Detector) talked artichokes and "chosen family" 28 days later
(`latelyKind=none`).

**Fix** (`src/js/contests.js`, `src/js/convoTopics.js`):
- `fireContest` plants `state.village.lastContest = {day, name, ids}` (the cast).
- `t2LatelyEvent` computes a `showEv` scan: 7-day window (the defense tail);
  yields the naming debate; sits below fresh grief, the mantle, the table,
  and SEVERE bodily crisis, above mild bodily news, village politics, and
  the debate. Participant gets `self:true`.
- `t2gen_lately` gains `case 'show'`: participant first-person ("They took
  me. Duel — up there, on the screens, in front of everyone. I'm still
  turning it over."); bystanders name the taken via firstRef
  (knowledge-gated): "They took the woman in her 20s, with tattooed arms —
  Duel, on the screens. The whole fire watched. Nobody knew where to look."
- Priority refinement (same run): a MILD outbreak (or mild weirdness) no
  longer outshouts a fresh grab — severe still does. Verified: mild+show →
  show; severe+show → outbreak.

**Proof:** `scripts/test-contest-lately-r17-20261015.js` — RED 27 failures
pre-fix → GREEN all pass on seeds 7/42/99 (plant, scan, self-marking,
lines, 7-day expiry). SENSE-read: lines are in-voice and knowledge-gated.

## People check (SENSE-TESTING LAW)

13 full transcripts read. Verdict: people — with the one fixed gap above.
- Quinn (999, sick): "I'm not okay. I'm saying it out loud so it's real."
  Mourns Elif by name: "We bury, we grieve, we keep going. There's no step
  four." / "I'm picking up Elif's share of the work."
- Dante (888, sick): feverish, asks for help cleaning a hot cut, tastes
  water for others before they drink — duty while sick.
- Daniel (999): "Since Tanya died... I keep expecting to see Tanya at the
  fire. Stupid." / "The fire feels smaller without Tanya."
- The naming debate as coping (r9's read holds): arguing about what to call
  the mosquito while sick — human, not senseless.

## Verdicts

- **Reachable:** yes — 12 contests fired organically across 3 seeds (pilot
  guarantee + weekly budget); 5 landed during active crisis conditions.
- **Fun:** the double load plays — dread announcements, sick villagers
  grabbed mid-fever, the village mourning by name throughout. The show does
  not pause for the crisis, per the interruption principle.
- **Winnable:** 888's village survived outbreak + 5 contests + a 6-death
  monster cluster; 777/999 broke under the compound (pantry=0). Lethal to
  the weak, survivable by the strong — sensible.
- **M1: MISS (1/3 strict).** Only 999's d49 Vigil met the strict compound
  gate (pantry<50% + ≥3 sick). 888's 4 crisis contests fired during a real
  outbreak but the famine leaked (blight bypass — r9 #4); 777's contests
  were pre-crisis. See metric review.
- **M2: HIT (2/3).** 888 4/4, 999 3/4 end convos carried crisis-or-contest;
  777 2/3 (game over d30, 3 convos).
- **M3: HIT.** 12/12 contests resolved, all within 1 day. No stalls.

## Metric review (§14)

- M1's compound gate (pantry<50% AND ≥3 sick) was stricter than the leg
  question needed: 888 answered "does the show grab during a disease
  crisis" (yes, 4×) but fails the letter because the famine staging leaked.
  The leak is a harness limitation (r9 #4), not a game finding. Proposed
  revision for next run: define the crisis window by SICKNESS (≥3 sick) OR
  famine (pantry<50%), not AND — or fix the blight to intercept direct
  deposits. No goalposts moved: M1 stands as MISS.
- CONTEST_RE false positive: "chosen family" matched `chosen`. Fixed to
  contest-specific terms; baseline seeded with clean values. Future runs:
  keep the tight regex.
- Fresh-contest talk was sampled once (Victor, 2d post-grab, pre-fix):
  no contest topic. Post-fix, the unit proof covers it; a live re-sample
  is future work.

## Telemetry

Baseline seeded: `hidden_files/telemetry-baselines/crisis-contest.json`
(contests=12, carriedCount=9, sickPeak=16, deaths=15 across 3 seeds). All
LOUD lines were first-run "newly appeared" — expected, no real deviations.

## Files

- `scripts/diag-crisis-showmustgoon-20261015.js` — r17 compound+contest harness
- `scripts/test-contest-lately-r17-20261015.js` — proof test (RED→GREEN)
- `scripts/probe-freshcontest-20261015.js` — fresh-grab conversation probe
- `evidence/2026-10-15/journey-crisis-r17-{777,888,999}.{json,log}` — records
- `src/js/contests.js` — plant lastContest in fireContest
- `src/js/convoTopics.js` — showEv scan + case 'show' + mild/severe precedence
