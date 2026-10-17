# sim-pathchoice — tracing the take-seat choice function end to end (flesh-out loop DIAGNOSTIC, 2026-10-17)

Run: sim-pathchoice, scale-onramp axis (standing scale directive; the WIN side of the wall).
Arm: diagnostic, read-only, zero src/js, zero policy changes — pure observation.
Canon: docs/CANON.md + docs/TABLE.md (read first).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

Diagnostic run — no GO lever; the QUESTIONS bind per §14 (a miss is NO-GO
only on the questions' own terms).

**Context:** wins replicate (12/16 modal across four seed sets) but ALL are
lesser-seat feared-path walks. sim-pathcensus (2026-10-15) showed the funnel
dies at the CHOICE: the winpursuit drain plays options[0], and PATHS
insertion order puts feared ALWAYS at options[0]; witness was never offered
in 11/11 (prereq ledger.exposed ≥ 3); indispensable offered on 2/11 (full
seats only); the least-walked-offered counterfactual said the same seats
would have supported feared ×1 + beloved ×8 + indispensable ×2.
sim-pathselect (2026-10-15) built a max-standing chooser and was KILLED per
§14: it walked feared 13/13 anyway (feared strength saturates at 100 — the
table's own pricing closes the variety). Path variety is steve-call
#316/#317, which needs SHARPER EVIDENCE before Steve rules. This run does
NOT design path selection. It TRACES the take-seat choice function end to
end on the winning substrate and returns a mechanism-level VERDICT: is the
feared-monopoly a DRAIN ARTIFACT (the bot doesn't choose — path variety
unmeasured, not absent) or a DOOR-SIDE TRUTH (doors genuinely
unopenable/unreachable)? Is witness offerable on this substrate?

**Stack (EXACT composition, recorded):**
`SD.withSeatDrive(WD.withWinDefer(TF.leadfeast | TF.belongfeast))` composed
EXPLICITLY in the sweep script (not the require-time SD.leadseat objects —
the 2026-10-16 method note: SEATDRIVE env unset != driver active; the
wrapper must be composed, the env alone drives nothing). Env asserted up
front, all explicit: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1.

**Seeds:** 8 FRESH [1931,1932,1933,1934,1935,1936,1937,1938] × {leadfeast,
belongfeast}, armed only (16 runs). No control needed (no lever change —
the det-gate's trajectory identity IS the control).

**Horizon:** 180d death-aware. The win-day floor is d90 and the deferred
re-offer needs the days after; dead villages stop simulating (+10d tail
max per the harness).

**PRIMARY (binding, diagnostic GO):** 100% attribution of door offerings +
choice outcomes across all runs — every door answer traced with: offered
set (insertion order), chosen door, the drain's exact choice-function
inputs at that decision, the engine's own tableEarnedPaths() snapshot at
that moment — PLUS the verdict with mechanism-level numbers
(drain-artifact vs door-side-truth; witness offerable y/n with the exposed
trajectory).

**Proof:** scripts/test-pathchoice-20261017.js — 23/23 GREEN (exports +
PATH_IDS; METHOD-NOTE: unwrapped windefer(tribfloor) cannot drive the seat
with SEATDRIVE=1 in env — env alone drives nothing; DRAIN-POS: the drain
picks options[0] on crafted fixtures regardless of order, never reads
prompt/strengths, drains the whole queue — no choice logic; WITNESS-PREQ:
exposed 0 → unearned "the trial needs 3", +3 → earned strength 49;
INSERT-ORDER: earned-path id order == index.html table-*.js load order,
feared first; SMOKE 15d both policies; DET 2 seeds × 40d both-repeat
explicit+instrument == SD.leadseat).
SMOKE gate green on the sweep script before the sweep. DET-GATE 4/4 seeds
× 60d: plain-repeat stable AND traced-repeat stable AND plain==traced —
the instrument is provably read-only and the explicit composition is
byte-identical to the landed require-time stack (finding #389
equivalence).

## The choice function, as built (code reading — the mechanism under test)

**The door modal** (src/js/table.js:533 `tableOfferPaths`): options are
built from `tableEarnedPaths()` (table.js:543: `earned.map(p => ({ id:
'path:' + p.id, ... }))`) — ONLY earned paths are clickable; unearned
paths are shown priced in the prompt text but are not options.
`tableEarnedPaths()` iterates `Object.keys(PATHS)` (table.js:124) —
registration (insertion) order, unsorted, unshuffled.

**The insertion order** (index.html lines 103–111): table-feared.js,
table-indispensable.js, table-beloved.js, table-witness.js,
table-assimilated.js, table-defiant.js, table-relay.js. Each module calls
`tableRegisterPath(def)` at load (table.js:57-60). So feared is ALWAYS
options[0] whenever feared is earned — by LOAD ORDER, not by any designed
presentation. No comment, doc, or design statement orders the doors; nothing
sorts by standing, nothing randomizes. TABLE.md and STEVE-ANSWERS.md carry
no door-order statement (checked 2026-10-17).

**The drain's choice function** (scripts/policies/winpursuit.js delegates
to winseek.js `tableRoad`, line 880-900): the entire choice logic is
`Game.chooseTableOption(tc.options[0].id)` — one line. It reads the options
array and NOTHING else: not the prompt, not the strengths, not the earned
snapshot, not the ledger. The comment in winseek.js admits it: "The drain
answers options[0] throughout — it PLAYS the challenge, it does not play it
well. Branch/choice quality is a separate lever."

**The witness prereq** (src/js/table-witness.js:110-114): `Game.ledger()
.exposed >= 3`, else unearned with the why "You didn't keep the list (N
exposures on record — the trial needs 3)". `exposed` increments ONLY via
(src/js/ledger.js:1386-1405): `Game.exposeBribery` (+2, a player case-verb
at the moot — 'expose the bribery') and `resolveCase('exile')` (+1, when
the accused is NOT the player — driven by the moot belief ladder,
betrayal.js:1767/1776). No policy in the tribfloor stack drives moot
justice verbs (grep: exposeBribery/resolveCase appear in NO tribfloor-chain
policy file).

**The indispensable prereq** (src/js/table-indispensable.js:42: `minSeat:
'full'` — the only full-seat path; all six others declare
`minSeat: 'lesser'`). Honest, from pathcensus.

## Results — the trace

16/16 runs completed (8 FRESH seeds 1931–1938 × {leadfeast, belongfeast},
180d death-aware). 14 sittings, 70 drain answers, 14 door answers.
Attribution: **14/14 door answers fully traced** (offered set in insertion
order + chosen door + drain choice inputs + engine earned-snapshot) —
PRIMARY GO met at 100%.

Per-seed JSONs: evidence/2026-10-17/perseed-pathchoice/*.json (16/16).
Beats: evidence/2026-10-17/pathchoice-beats/*.json (14 sitting runs).

| | n |
|---|---|
| runs | 16 |
| sittings (seat taken) | 14/16 |
| door answers | 14 |
| wins | 14/16 (all door answers won) |
| non-sittings | 2 (s1935: survived 180d, national rank, seat 'none' — never invited; s1937: village-lost d60) |
| branch cells | feared:light ×14 (dark unmeasured — 14/14 light ledgers) |

## A — offered doors per answer (insertion order)

Every door answer offered the same 5 doors in the same order:

`[feared, beloved, assimilated, defiant, relay]` on 13/14;
`[feared, beloved, assimilated, relay]` on 1/14 (defiant unearned that run
— its prereq wasn't met).

- feared: earned 14/14, strength **always exactly 100** (saturated).
- beloved: earned 14/14, strength 79–100 (competitive — tied at 100 on
  several runs).
- assimilated: earned 14/14, strength 45–60 ("Always open. The table takes
  anyone — that's what makes it a trap, and what makes it safe.").
- defiant: earned 12/14, strength 0–52.
- relay: earned 14/14, strength 40–50 ("(sysbond 0)").
- indispensable: earned 0/14 — all 14 seats were LESSER; it needs
  minSeat:'full' (src/js/table-indispensable.js:42). Priced aloud on every
  modal: "The Indispensable needs a full seat — the galaxy must actually
  need you, not just notice you."
- witness: earned 0/14 — ledger.exposed was 0 on every run (see C).
  Priced aloud on every modal: "You didn't keep the list (0 exposures on
  record — the trial needs 3)."

The options array IS the earned-filtered registration order — the modal
builds exactly what `tableOfferPaths` promises: earned paths as choices,
unearned paths named and priced, never hidden.

## B — what the drain chose and its exact choice inputs

14/14 door answers: chosen = **feared**, chosenIndex = **0** — every time.

The drain's choice-function inputs at each decision (recorded per answer
in `drainInputs`): `{ frame, optionCount, options }` — the options array
above. That is ALL it reads. The proof script pins it positionally
(DRAIN-POS 4/4 GREEN): on a crafted `[path:beloved, path:feared,
path:relay]` fixture the drain picks beloved; on `[path:feared,
path:indispensable, path:beloved]` it picks feared; it drains a 3-beat
queue to empty. It never reads the prompt, the strengths, the earned
snapshot, or the ledger. The entire choice logic of the win-side stack is
winseek.js:893: `Game.chooseTableOption(tc.options[0].id)`.

Why options[0]: feared is earned on every feast-road seat (strength 100,
saturated) and it is FIRST in PATHS registration order (index.html:103 —
table-feared.js loads first). The two facts multiply: the door the build
earns hardest happens to be the door listed first, and the drain plays the
list position, not the door.

## C — the witness prereq trajectory

`ledger.exposed` sampled daily on all 16 runs:

- max exposedMax across 16 runs: **0**
- runs reaching ≥ 3: **0/16**
- exposedChanges per run: a single entry `{day: 2, exposed: 0}` — it never
  moved from zero. Not once in ~1,900 game-days.

What drives it (src/js/ledger.js:1386-1405): `Game.exposeBribery` (+2 — a
PLAYER moot verb, "expose the bribery" at a case confrontation) and
`resolveCase('exile')` (+1 — the ambient moot belief ladder, only when the
accused is NOT the player). No policy in the tribfloor stack drives moot
justice verbs (grep-verified), and in 16 runs the ambient ladder never
resolved a single exile. The prereq's SUBSTRATE IS DEAD on the winning
road: no verb fires, no exposure accrues, the bar (≥3) is unreachable by
construction here — not by tuning, but because nothing on this road ever
writes the counter.

This is new evidence beyond pathcensus ("witness never offered, honest
prereq"): the prereq isn't merely unmet — it is UNMEETABLE on this
substrate. Filed as a finding (see below).

## D — feared-first: design or accident

**Accident.** The chain: index.html:103–111 lists the table-*.js modules
with feared first → each calls `tableRegisterPath(def)` at load
(table.js:57-60) → `tableEarnedPaths()` iterates `Object.keys(PATHS)`
(table.js:124), insertion order, no sort, no shuffle → `tableOfferPaths()`
builds options from that order (table.js:543). The module headers say only
"Registers via tableRegisterPath. Load AFTER table.js." No comment, no
doc, no canon statement orders the doors — TABLE.md, STEVE-ANSWERS.md,
ENDGAME-BUILDS.md, COHERENCE-SPINE.md carry no door-order statement
(checked 2026-10-17). The only behavioral consumer of position is the bot
drain (winseek.js:893); the player UI (app.js) taps any option. So:
feared-first is load-order happenstance that the drain promotes into
destiny.

## E — the least-walked-door counterfactual (read-only)

Sweep-order least-walked of all 7 per answer: feared ×1 (first answer,
empty ledger), beloved ×13 — but beloved was OFFERED every time, so the
counterfactual collapses to the offered form:

least-walked-OFFERED door per answer: **beloved ×13, feared ×1**.

The same 14 seats would have supported 13 beloved walks + 1 feared walk
under a variety-seeking policy — on the menu, never walked. (Matches the
pathcensus shape: feared ×1, beloved ×8, indispensable ×2 on lesser/full
seats.)

## Sense-testing: two door-answer beats end to end

**1. belongfeast s1931, d90 (lesser seat, win).** The modal the player
would have SEEN (from the engine's earned snapshot at the decision):

- ◈ the Feared — "29 distinct monsters faced blow-by-blow. The footage
  exists, and it plays unasked." (standing 100)
- ◇ the Indispensable — "The Indispensable needs a full seat — the galaxy
  must actually need you, not just notice you."
- ◈ the Beloved — "Viewership 35.7, fan favor 30 — the galaxy's favorite,
  by the numbers." (standing **100 — tied with feared**)
- ◇ the Witness — "You didn't keep the list (0 exposures on record — the
  trial needs 3)."
- ◈ the Assimilated — "Always open. The table takes anyone — that's what
  makes it a trap, and what makes it safe." (50)
- ◈ the Defiant — "Defiance 6 on the record. The 'no' is earned." (44)
- ◈ the Relay — "Stage-3 neural integration. The matrix doesn't care
  about your kingdom — it cares how deep you are. (sysbond 0)" (40)

The drain clicked the first line. A human would have stood in front of
seven voiced, priced, build-honest doors — with beloved TIED at 100 — and
chosen. The beats then play the feared walk straight: the audit ("A lesser
seat — regional standing, waves 1–3 faced (19/6/4), 9 contests survived,
3 crises weathered"), the door grants (Dreadfield / War-table / Oathbound
/ Shieldbearer), "Look what eating built," the ledger read ("The food
truth was shared. The light road is open."), the tightrope beats ("You
spend it — the shield, not the sword"), the win ("You won. Say it plainly:
you won."). The fiction reads as deliberation; the instrument says the
deliberation never happened — five doors died in the instant between the
modal opening and options[0] being played.

**2. leadfeast s1932, d136 (lesser seat, win).** Same shape, later seat:
the announcement fired early, the floor held to d90+, the sit happened the
morning the preview existed (invDays=1). Offered 5, walked feared, won.
The offered set again read as a genuine choice — assimilated's "that's
what makes it a trap, and what makes it safe" is a real door with a real
voice, and the drain never read it.

**Verdict on the sense read:** the modal is an HONEST, well-built choice —
earned doors voiced with build-specific whys, unearned doors priced aloud.
Feared-as-options[0] does NOT read as "the only real door" in the fiction;
it reads as first among genuine alternatives. The monopoly is entirely in
the answering, not the offering.

## Village assessment (plain words)

Fourteen villages sat at the table and won the way they've been winning:
feared, light, plain-spoken. The two that didn't sit tell the wall's two
stories: s1937 died young (d60, village-lost — the standing combat
attrition), and s1935 is the interesting one — it SURVIVED all 180 days,
reached NATIONAL rank, and was never invited (seat 'none'): the lesser-seat
bar (waves 4/4/3, contests, crises, stage, food-deeds) held against a
national-ranked village that hadn't earned the table's price. The seat bar
is working as designed; national ≠ table-ready. Nobody stalled at the
door; nobody was exiled; the funnel below the choice is a well-oiled
machine.

## The verdict for Steve's ruling (#316/#317)

**Both — split by door.**

1. **DRAIN ARTIFACT for the 5 offered doors.** The modal is a genuine
   choice (voiced, priced, beloved tied at feared's 100); the bot doesn't
   choose — it plays options[0], which is feared by load-order accident
   (no design statement orders the doors). 14/14 walked feared; the
   counterfactual says the same seats supported beloved ×13. Path variety
   among the offered doors is UNMEASURED, not absent. A choosing bot would
   face a real decision here — including a standing tie (feared 100 =
   beloved 100) that no positional rule can resolve honestly.

2. **DOOR-SIDE TRUTH for witness.** Not merely unoffered — UNREACHABLE on
   this substrate: ledger.exposed never moved from 0 in 16 runs (~1,900
   game-days). Its only writers are a player moot verb the policy never
   drives and ambient exile resolutions that never fired. Even a perfect
   choosing bot could never walk witness on the winning road. The bar (≥3)
   isn't tuned wrong — the substrate that feeds it is dead.

3. **DOOR-SIDE TRUTH (by design) for indispensable.** Full-seat-only and
   0/14 seats were full. The seat bar is doing its job (s1935: national
   but seat 'none').

**Named next levers (no lever built — diagnostic arm):**

(i) **Choice-side:** the drain needs a real choice function / player-agency
model before variety can be measured. CAUTION from pathselect: a
max-standing chooser walked feared 13/13 anyway (feared strength saturates
at 100) — a choice-side lever must include tie-breaking and/or a
strength-rescale, or it re-discovers the same wall. The honest tie
(feared 100 = beloved 100) is the design question, not the bug.

(ii) **Door-side:** witness's exposure substrate. Either the bar moves
into reach (≥1–2), or exposure becomes reachable (ambient NPC cases
resolving to exile; the expose-bribery player verb becoming discoverable
— a discoverability question Steve has flagged as standing). Indispensable
needs full-seat measurement (0/14 here) before its door can be judged.

(iii) **Design-call for Steve (#316/#317), stated as his question:**
"The modal offers a genuine choice — five earned doors, beloved tied at
100 with feared — but the sim bot plays options[0], which is feared by
load order, so every measured win walks feared. Meanwhile witness needs 3
exposures and the winning road never exposes anything (0 in 16 runs).
Do you want (a) a choosing bot that picks by standing with a real
tie-break, (b) the witness bar moved into reach, or (c) the current
feared-walk as the honest design — 'the feast road is a feared road'?"

## Blanks filled / documented

- **Filled (measurement):** the take-seat choice function is now traced end
  to end with 100% attribution — every door answer's offered set, the
  drain's exact inputs, the engine's pricing at the moment. Scripts:
  scripts/pathchoice-20261017.js (instrument + sweep),
  scripts/test-pathchoice-20261017.js (23/23 GREEN).
- **Documented (finding):** witness-door substrate death (filed below) —
  needs Steve's ruling before any work (steve-call).
- **Documented:** feared-first is load-order accident, no design statement
  (for the #316/#317 ruling).
- **Documented:** s1935 (national rank, 180d survival, seat 'none') — the
  seat bar holds against national-ranked villages that haven't earned the
  table's price. Wall datum, not a bug.

## Metric review

1. PRIMARY met at 100%: 14/14 door answers fully traced
   (offered+chosen+drainInputs+earnedSnapshot) + the verdict with
   mechanism-level numbers. No re-scoring — the metric bound the run and
   the run delivered it.
2. The both-repeat det-gate (4 seeds × 60d: plain-stable AND traced-stable
   AND plain==traced) worked cleanly — the instrument is provably
   read-only, the explicit withSeatDrive composition byte-identical to the
   landed stack (finding #389 equivalence), and the known
   timestamp-entropy issue did not appear on these seeds.
3. Schema note: `answers` = total drain answers (70 = 5 per sitting),
   `doorAnswers` = 'path:' answers (14). `exposedMax`/`exposedFinal`/
   `exposedChanges` carry the witness trajectory. `drainInputs` on each
   door event carries the choice-function inputs.
4. Limitation: dark branches unmeasured (14/14 light ledgers); full seats
   unmeasured (0/14); witness/indispensable walks unmeasured on this
   substrate (the funnel can't measure what the road never reaches). A
   future run with a dark-leaning policy, a full-seat-heavy seed set, or a
   moot-justice-driving policy could walk them; path selection remains
   Steve's call (#316/#317).
