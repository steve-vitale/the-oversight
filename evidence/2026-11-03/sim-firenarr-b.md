# sim-firenarr-b — FIRING-EVENING NARRATION SPEC for a future (v**) deploy (DESIGN ONLY)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261104T0046Z,
axis food-economy, arm sim-firenarr-b. Worktree sim-firenarr-b,
branch sim-firenarr-b. DESIGN ONLY: the (v**) rule is NOT
deployed, so this arm writes NO src/js game code and NO policy
files. Its deliverable is a deploy-ready narration spec, grounded
in real transcripts, that a future deploy arm can lift verbatim.
No number from the reused corpus enters any judged denominator
anywhere in this file: the corpus use here is descriptive reuse
only (sampled evenings, quoted lines), and the sibling freshband
arm judges the fresh band separately.

## Sources read

- docs/CANON.md, in full. NO canon doc covers the gatediseng
  sensor (e*)/(v**) itself — it is a policy-side sim instrument,
  not a game system; no canon is invented for it. Adjacent only:
  docs/PRESERVATION.md (the food ladder: cleaned → cooked →
  smoked → rendered → pemmican) governs how food lasts, not how
  a collapse warning is computed. Two standing canon rules do
  bear on this spec and are cited, not invented: "No silent
  actions" (every action narrates honestly, including failures)
  and "If you don't know, it doesn't show" (knowledge gates
  every surface).
- evidence/2026-11-03/sim-streakfree-cost-b.md (the (v**)
  store-fall shape, its sense test, its silent firing evenings).
- evidence/2026-11-03/sim-envelope-b.md (the envelope findings:
  0.85 vs 0.90 is a two-leg trade; intermediates buy nothing).
- evidence/2026-11-03/sim-verifyfield-b.md (the settled
  verification field; the judged (v**) shape: PILOT-NO-GO on
  the tie leg, sole miss 83248).
- The corpus itself, read-only, never edited:
  evidence/2026-11-03/sim-streakfree-cost-b-tracer.jsonl
  (the EXISTING 83201–83400 band, 28 traced legs). Firing days
  below were recomputed with the verbatim analyzer
  (scripts/analyze-streakfree-cost-b.js: fireEstar85,
  fireFallback, fireVariant) and match the prior evidence
  tables on every sampled leg.

## The rule being narrated (verbatim from the analyzer, in plain words)

(v**) = (e**) OR (F), first firing wins; on a tie the (e**)
clause wins. A "stretch" is a run of evenings where the
deposit gate is NOT engaged (gateEngaged false); a new
stretch starts after any engaged evening. Within a stretch,
S is the first evening, peak(D) is the highest evening store
over S..D, falls(D) counts evenings in (S..D] whose store is
lower than the previous evening's (cumulative, not
consecutive). The variant fires at the FIRST evening D with
D > S and D >= 8 where either:

- (e**), which needs a hunger streak (hungryStreak >= 1,
  the game's own progState counter, updated in
  villageEats()): (E1) falls >= 2 AND store <= 0.85 × peak,
  or (E2) store <= 0.65 × peak (the cliff, no falls
  condition); or
- (F), which needs NO hunger streak: falls >= 3 AND
  store <= 0.80 × peak.

In plain words: (e**) speaks when the store has fallen well
below its recent high on evenings when someone has already
gone short; (F) speaks when the store has slipped evening
after evening to four-fifths of its recent high even if
nobody has gone short yet. The store here is the village's
communal pantry (Game.pantryKcal(), src/js/food.js), read
in the evening after the day's meals — never a single
villager's pack, never a single villager's belly.

## 1. Sampled firing evenings (descriptive reuse only)

Ten evenings across eight seeds: eight (v**) first-firing
evenings (four E1-only, two E2-only, two E1+(F) tie
evenings — 83248 on a collapsing leg, 83201 on the
survivor leg) and two (F)-trailing evenings where (F)
fires after (v**) already fired. One honest corpus fact first: in this corpus (F)
NEVER beats (e**) to a first firing — it ties on 83248 and
83201 and trails on every other sampled leg. So "F-firings"
below are evenings where the (F) clause fires (tie or
trailing), not evenings where (F) wins alone; the F-first
template in §2 is specified from the rule definition and is
flagged untested against a real transcript in §5.

Ratios below are evening store / stretch peak, from the
verbatim analyzer. "First starv." is the first starvation
death day (the reference day); the survivor leg has none.

| seed | evening (loopDay) | (v**) clause | store / peak (ratio) | streak | alive | first starv. |
|---|---|---|---|---|---|---|
| 83230 | 13 | E2 cliff | 13,250 / 21,700 (0.61) | 6 | 11 | 16 |
| 83230 | 14 | (F) trailing | 10,000 / 21,700 (0.46) | 7 | 10 | 16 |
| 83248 | 18 | E1 + (F) tie | 13,400 / 17,430 (0.77) | 7 | 11 | 20 |
| 83272 | 20 | E1 envelope | 22,486 / 26,467 (0.85) | 7 | 9 | 25 |
| 83336 | 21 | E1 envelope | 8,250 / 10,450 (0.79) | 2 | 9 | 27 |
| 83336 | 23 | (F) trailing | 7,600 / 10,450 (0.73) | 4 | 5 | 27 |
| 83341 | 14 | E2 cliff | 5,050 / 7,930 (0.64) | 5 | 10 | 21 |
| 83377 | 14 | E1 envelope | 11,500 / 13,900 (0.83) | 5 | 11 | 25 |
| 83201 | 15 | E1 + (F) tie, SURVIVOR | 18,489 / 23,550 (0.79) | 6 | 10 | — (survives 30d) |
| 83379 | 23 | E1 envelope | 7,335 / 10,110 (0.73) | 4 | 12 | 28 |

Notes on the edges a deploy arm must know: 83272's E1
firing sits at 0.8496 against the 0.85 bar — a knife-edge
firing, carried from the envelope arm, not a robust one.
83201 is the sole survivor firing in the corpus: a healthy
village whose store merely dipped to 0.79 of its high and
then recovered (days 16–18: 17,401 → 17,102 → 19,362).
83248 is the judged tie miss: the old 0.90 envelope would
have fired day 16, (e**) waits until day 18.

## 2. Sense test — what the village notices, or fails to notice

Read around each firing evening (the full day's lines in
the tracer row). Verdict in plain words: on ALL TEN sampled
evenings the warning would land SILENTLY. Nothing in any
transcript notices the store falling from its recent high.
This repeats the 2130Z and verifyfield sense tests (their
six evenings were also silent) on four new evenings
(83272, 83379, 83201, and the two (F)-trailing evenings)
and confirms it: the silence is the finding, and this spec
is the fix for it.

What the evenings DO notice instead — the attention the new
line must compete with, quoted verbatim:

Seed 83230, day 13 (E2 firing; store 13,250, streak 6).
The evening reads as an ordinary productive day:

> "You work the patch with practiced hands: 8× Hickory Nuts (in shell — shell them to eat). This patch is picked clean — it'll recover in a few days."
> "⚔️ Kai killed the Ugly-Eyes with their party — 3 rounds, 18 taken. Word travels fast. The village cheers."
> "📖 Mia starts in on the lesson, then catches themself. "Hold on — I already showed you this one. Hickory Nuts. You remember.""

No line mentions the store. The next evening (day 14,
the (F) evening, store 10,000) carries the closest thing
to store awareness in the whole sample — and it is a haul
line, not a store-fall line:

> "You keep a day's food (585 kcal) — nothing extra for the pantry this time."

Seed 83248, day 18 (E1 + (F) tie; store 13,400, streak 7).
A grim evening — gossip, a stripped body, trauma — but no
store-fall line:

> "You catch fragments by the fire — Ella telling Mateo about you. Three retellings in, nobody remembers what actually happened — but everyone has opinions."
> "The body is stripped. What's left isn't worth taking."
> "You take denim jacket, crude bow, gilded pack from Wakjira. Your hands know what they did. (+11 trauma)"

Seed 83272, day 20 (E1 firing at the 0.8496 knife-edge;
store 22,486, streak 7). The evening's only store-adjacent
line is again the haul line, and it reads as reassurance,
not warning:

> "You keep a day's food (540 kcal) — nothing extra for the pantry this time."
> "📖 Ryan starts in on the lesson, then catches themself. "Hold on — I already showed you this one. White Oak Acorns. You remember.""

Seed 83336, day 21 (E1 firing; store 8,250, streak 2).
A monster at the treeline dominates the evening's
attention; the store's fall is nowhere in the lines:

> "Something moves out there — Grief Counselor."
> "The Grief Counselor stops at the treeline — pacing, unwilling. The walls end the argument. It's still out there."
> "You keep a day's food (650 kcal) — nothing extra for the pantry this time."

Its (F) evening, day 23 (store 7,600, 5 alive), is
starker — canned soup eaten four times over, still no
store line:

> "You eat Canned soup (250 kcal)."
> "You eat Canned soup (250 kcal)."

Seed 83341, day 14 (E2 firing; store 5,050, streak 5).
Monster-watch day, small haul, no store language:

> "Something moves out there — Lockpick."
> "Something big pads at the edge of the clearing — then thinks better of it. This ground is already claimed."
> "You work the patch with practiced hands: 4× Blackberry (260 kcal). This patch is picked clean — it'll recover in a few days."

Seed 83377, day 14 (E1 firing; store 11,500, streak 5,
eleven days of lead). The most usable evening in the
sample: a good day (kills, new knowledge) on which the
warning would land early — and the only store-adjacent
line is the haul line:

> "★ Deeper knowledge: Blackberry. Parts: berries (eat), leaves (tea), roots (medicinal). Pick ripe (black, not red). (Yield +50%)."
> "⚔️ Mateo killed the Night Court with their party — 8 rounds, 28 taken. Word travels fast. The village cheers."
> "You keep a day's food (195 kcal) — nothing extra for the pantry this time."

Seed 83201, day 15 (E1 + (F) tie, THE SURVIVOR; store
18,489, streak 6). The firing evening carries NO pantry
line at all — not even the haul line:

> "You walk back into Haven. 15 Codex entries. The village is glad to see you."
> "You take hatchet, denim jacket, good boots, snare wire, plant fiber, grandfather's knife from Jorge. Your hands know what they did. (+5 trauma)"
> "The body is stripped. What's left isn't worth taking."

Seed 83379, day 23 (E1 firing; store 7,335, streak 4).
A kill celebrated, lessons repeated, no store line except
the haul line:

> "⚔️ Sandra killed the Big Loud with their party — 1 round, 16 taken. Word travels fast. The village cheers."
> "You keep a day's food (360 kcal) — nothing extra for the pantry this time."
> "📖 Rocco starts in on the lesson, then catches themself. "Hold on — I already showed you this one. White Oak Acorns. You remember.""

The recurring silence, stated exactly: across the ten
sampled evenings the word "pantry" appears ONLY in the
haul line "You keep a day's food (N kcal) — nothing extra
for the pantry this time." (6 of 10 evenings), and on the
other 4 firing evenings (83230 day 13, 83248 day 18,
83336 day 23, 83201 day 15) there is no pantry word at
all. No evening says the store fell, shrank, thinned, or
dropped from anything. The haul line notices the day's
food, not the store's fall from its recent high — and it
also appears on non-firing evenings (83201 days 16–18,
after the store starts recovering), so it cannot carry
the warning: a line that also speaks on recovery evenings
is not a warning line.

Repeated/verbatim lines the new narration must NOT
collide with (counts across the ten sampled evenings):
"You walk back into Haven. N Codex entries. The village
is glad to see you." (10× — every evening); "This patch
is picked clean — it'll recover in a few days." (8×);
"This patch is worked out — step to another green patch
and forage again." (9×); "The body is stripped. What's
left isn't worth taking." (5×); "Something moves out
there — X." (4×); "The creek runs fast here — no
crossing without a bridge or a swim." (5×); "Travel N
tiles to …" (20×). Consequences for the spec: (a) the new
line must NOT reuse the haul line's "nothing extra for
the pantry" phrasing or the homecoming line's shape, or
it will read as another piece of nightly spam; (b) it
must be SHORT — one line among 15–35 nightly lines, on
evenings already crowded with kills, lessons, and
monsters at the treeline; (c) it must be VISUALLY
distinct from the spam, which is why it carries the ⚠
marker (precedent: the existing pantry warning in
villageEats(), "⚠ Haven's pantry is empty. Day N of
hunger.", src/js/game.js:31704 — the game's own voice
for a store warning, reused here for a store warning).

Post-firing evenings (why repeats must quiet down):
after 83230 fires day 13, the store keeps falling (day
15: 7,294; day 16: 1,950) with only the haul line
speaking; after 83336 fires day 21, day 22 actually
RISES (8,321) and day 24 falls again (5,900) with the
streak reset to 0; after survivor 83201 fires day 15,
the store dips then recovers (17,401 → 17,102 → 19,362)
while the haul line repeats nightly. A warning that
re-spoke the identical line on every one of those
evenings would join the spam it is meant to cut through
— and on 83201 it would cry warning on a village that
is already recovering. Hence §2(c): repeats quiet down.

## 3. THE SPEC (self-contained — lift verbatim)

### (a) Trigger point — exactly which evening speaks, and where the line is emitted

TRIGGER. The line is emitted on the FIRST evening D of a
disengaged stretch that satisfies the (v**) firing
conditions in full: D > S (not the stretch's first
evening — a fall needs something to fall from), D >= 8
(not in the first week), and the clause conditions of
(e**) or (F) as defined above, computed on the EVENING
store (after the day's meals and deposits, the same read
the tracer uses). The clause of the variant's first
firing — the earlier of the (e**) and (F) firing days in
that stretch, ties going to (e**) — selects the template
in §2(b). A later evening in the same stretch on which
the conditions still hold, or on which the other clause
fires (e.g. the (F)-trailing evenings 83230 day 14 and
83336 day 23), is a REPEAT evening, governed by §2(c),
never a new first firing.

EMISSION POINT (nearest real branch — hook NOT fully
pinned, see gap 1). The line is emitted at the END of the
day, as the night's closing line, AFTER the day's meals
and starvation accounting. The nearest real branch in
game code is endDay() (src/js/game.js:32284), which
calls villageEats() (src/js/game.js:32526); villageEats()
is where hungryStreak is updated (src/js/game.js:31696)
and where the existing pantry warning is spoken
("⚠ Haven's pantry is empty…", src/js/game.js:31704).
The deploy arm places the new line after the
villageEats() call inside endDay(), via this.say() — the
same narration stream as the existing pantry warning.
It is NOT hung on the homecoming unload line in
returnToVillage() (src/js/game.js:8636; the "nothing
extra for the pantry" say at 8874): four sampled firing
evenings carry no unload line at all, and the unload line
also speaks on non-firing evenings, so it cannot be the
warning's carrier. The deploy arm must add the stretch
state the game does not hold today (see gap 1) and must
confirm the evening-store read ordering against the
tracer's evening read before shipping.

SPEAKER AND KNOWLEDGE GATE. The line is plain narration
(this.say), in the village's fireside voice, not a System
popup and not a single villager's dialogue. No knowledge
gate blocks it: the store is communal and visible to
anyone who looks in the pantry, and "fallen from its
recent high" compares two things the village itself has
seen (what the store held recently, what it holds
tonight). It must never be spoken as a System
calculation, a percentage, or a prophecy.

### (b) Line templates keyed to firing kind — peak-anchored, store-framed

Every template is short enough for one mobile-screen
line (all ≤ 100 characters, proved in
scripts/test-firenarr-20261104.js). Every template says
"the store" and "its recent high": the framing constraint
is the village STORE's fall, never a villager's belly.
No template mentions hunger, starving, bellies, or
anyone going without — the hunger streak is a firing
CONDITION of (e**), not narration content, and the (F)
clause fires with no hunger at all, so no template may
imply hunger. No template gives a number, a fraction, a
percentage, a kcal count, or a days-left claim.

FIRST FIRING IN A STRETCH:

- (E1) envelope — store fallen to at most 0.85 of its
  recent high after 2+ falls:
  "⚠ The store has fallen from its recent high — the shelves are thinning."
- (E2) cliff — store fallen to at most 0.65 of its
  recent high:
  "⚠ The store has fallen far from its recent high — the shelves are nearly bare."
- (F) fallback — store slipped to at most 0.80 of its
  recent high after 3+ falls, with no hunger streak
  required (the slow drain, not the hungry evening):
  "⚠ The store keeps slipping from its recent high — evening after evening, lower."

TIE RULE (lift with the table). If (e**) and (F) fire on
the same evening (as on 83248 day 18 and 83201 day 15),
the (e**) template wins — E1 or E2 as the (e**) clause
dictates, never the (F) template. The (F) template
speaks ONLY when (F) fires strictly earlier than (e**)
in the stretch (possible only when the streak condition
holds (e**) back: slow drain, nobody short yet).

WHY THREE TEMPLATES AND NOT ONE. E1 and E2 differ in
depth, and the village should sound like it knows the
difference: "fallen" vs "fallen far", "thinning" vs
"nearly bare". (F) differs in SHAPE, not depth: it is
the slip-evening-after-evening warning, so its wording
is durational ("keeps slipping … evening after
evening"), not a depth claim. One generic template
would erase exactly the distinction the rule was built
to draw.

### (c) First firing vs repeat firing

FIRST FIRING IN A STRETCH: speak the §2(b) template for
the winning clause, once.

REPEAT EVENING IN THE SAME STRETCH (conditions still
hold, or the other clause fires later): SPEAK NOTHING.
No repeat of the first line, no paraphrase, no quieter
echo. The store's fall was already named; nightly
repetition would join the spam documented in §2 (the
haul line already repeats nightly) and would cry warning
on recovery evenings like 83201 days 16–18. Silence
after the first line is the design, not an omission.

ONE ESCALATION PER STRETCH (the single exception). If
the first firing was E1 or (F) and the store later in
the SAME stretch crosses the cliff band (at most 0.65
of the stretch peak), speak ONE escalation line, once
per stretch, and then fall silent for the rest of the
stretch:

  "⚠ The store has fallen further still from its recent high."

If the first firing was already E2, there is no deeper
band in this rule and therefore no escalation: repeats
after an E2 first firing are always silent.

NEW STRETCH, NEW FIRST FIRING. When a stretch ends (an
engaged evening breaks the run) and a later stretch
fires, the line may speak again — but it must sound
like a return, not a first discovery. Use the
"again" variants, once per new stretch:

- (E1) again:
  "⚠ The store has fallen from its recent high again — the shelves are thinning."
- (E2) again:
  "⚠ The store has fallen far from its recent high again — the shelves are nearly bare."
- (F) again:
  "⚠ The store keeps slipping from its recent high again — evening after evening, lower."

The repeat/escalation/again bookkeeping (fired flag,
escalation-spoken flag, stretch index) lives in the
stretch state the deploy arm adds; it is part of the
deploy, not of this spec's proof, which proves the
selection table only.

DEATH-KNELL EVENINGS. If the first firing lands on the
first-starvation day itself (as on 83281 and 83373 in
the prior evidence — the rule fires, the death lands
the same day), the line STILL speaks. Do not suppress
it as "too late": the starvation lines name the death,
they do not name the store's fall, and the spec's job
is to name the fall whenever the rule fires. The deploy
arm must read a live death-knell evening to place the
line correctly against the death narration (gap 4).

### (d) What must NOT be said

- NO numbers of any kind: no kcal, no fractions, no
  percentages ("down 15%", "at 79% of peak"), no counts
  of falls ("three falls", "second night running").
  The rule counts falls; the village does not count
  them aloud. (The existing empty-pantry line's "Day N
  of hunger" is a different, already-spoken fact and is
  not copied here.)
- NO days-left claims: never "N days of food left",
  "a week from empty", "we will starve by…". The rule
  measures a fall from a high, not a runway; a runway
  claim would be false precision on a store whose
  intake changes nightly.
- NO hunger framing: never "we are hungry", "bellies
  are empty", "people are starving", or any line that
  turns a store measurement into a body. The (F)
  clause can fire with nobody short; a hunger line on
  that evening would be false, and on (e**) evenings
  the starvation narration already speaks for itself.
- NO stand-down language: never "since we stood down",
  "since the gate lifted", "since the throttle eased".
  The stretch start is a throttle state in the sensor,
  not a decision the village made or would describe;
  naming it would leak the instrument into the fiction.
- NO blame and NO promises: never "you wasted food",
  "we foraged too little", "forage tomorrow and…".
  The line names what the village sees, not who is at
  fault or what will fix it.
- NO repeat lines: never re-speak, paraphrase, or echo
  the first line on a repeat evening (§2(c) — silence
  is the repeat behavior, with the single escalation
  exception).

### (e) Why the village would speak at all on this evening (one line, plain words)

Because the store's fall is visible to anyone who looks
in the pantry, and on these evenings nobody says it out
loud — the warning names what everyone is already living
through, before the first empty shelf.

## 4. Proof

scripts/test-firenarr-20261104.js (new, this arm only).
SYNTHETIC ONLY: it loads no game code, needs no node
harness, runs no judged seeds, and touches no real
corpus seed. It proves TEMPLATE SELECTION on pure
synthetic evening fixtures: given a synthetic firing
kind (E1 / E2 / F) plus a first / repeat / escalation /
again occasion, the right template is selected; given a
non-firing evening, nothing is selected. The selector in
the proof is the spec's reference table (§3(b)–(c)),
not game code and not a deploy — the deploy arm lifts
the table, not the proof code. The proof also asserts
the table's constraints: every template ≤ 100
characters, every template says "store" and "recent
high", no template contains a digit, a percent sign, the
word "days", a hunger word, or stand-down language, and
the tie rule resolves (e**) over (F). Result: 107/107
green before commit (the script exits non-zero on any
failure).

## 5. Gaps the spec could not close (named, not papered over)

1. HOOK UNPINNED as a single call site. No game code
   today computes a stretch peak, a falls count, or an
   envelope fraction: pantryKcal() (src/js/food.js)
   reads the live total, progState().hungryStreak is
   updated in villageEats(), and gateEngaged comes from
   Game._depositGateEngaged() (read by the tracer) —
   but the stretch bookkeeping (peak, falls, previous
   evening's store, fired flag, escalation flag) does
   not exist in game state. The deploy arm must add it
   and must verify the evening-store read ordering
   (endDay after villageEats vs the tracer's
   policy.daily-end read) before shipping. The nearest
   real branches are named in §3(a); the full hook is
   NOT claimed.
2. (F)-FIRST TEMPLATE UNTESTED against a real
   transcript. (F) never wins a first firing alone in
   this corpus (ties or trails everywhere sampled), so
   the (F) template's wording — the slow-drain shape,
   "evening after evening" — is specified from the rule
   definition, not observed. Before shipping that
   template, the deploy arm must read a real (F)-first
   evening (slow drain, streak 0) and confirm the
   wording fits it.
3. REPEAT / ESCALATION / AGAIN variants untested in
   live play. There is no deploy, so no live evening
   has ever carried these lines; repeat behavior is
   inferred from post-firing evenings (83230 days
   15–16, 83336 days 22–24, 83201 days 16–18), and no
   sampled leg shows two stretches with two firings,
   so the "again" variant is specified, not observed.
   The deploy arm must playtest a collapsing village
   past its first firing and past a stretch break
   before shipping §3(c).
4. DEATH-KNELL PLACEMENT unknown. On firing evenings
   that are also first-starvation days, the ordering of
   the new line against starvation/death narration
   inside endDay() is not observable from the tracer
   (which records the day's lines, not endDay's
   internal order). The deploy arm must read a live
   death-knell evening.
5. MOBILE RENDER untested. Templates are ≤ 100
   characters by construction, but rendered width at
   390px was not checked in this design arm (no browser
   work, no live verification — out of scope by task).
   The deploy arm checks the line on a phone-size
   screen before shipping.
6. KNIFE-EDGE firing carried, not fixed. 83272 fires
   at 0.8496 under a 0.85 bar; if the deploy's evening
   store read differs from the tracer's by even a hair
   (morning vs evening pantry, deposit timing), that
   leg's firing evening moves. The deploy arm's
   read-ordering check (gap 1) is the mitigation, not
   a re-tuning of the fraction — the fraction is the
   sibling arms' decision, not this spec's.

## 6. Status for the coordinator (do NOT edit the trackers from here)

Firing-evening narration finding item: open -> SPEC-READY.
Evidence: evidence/2026-11-03/sim-firenarr-b.md (this
file) + proof scripts/test-firenarr-20261104.js. The
coordinator owns sim-findings.md and
convergence-tracker.md; this worker does not edit them
(concurrent-edit risk), and reports the transition here
instead. No game code, no policy file, no existing file
edited. Ready for coordinator merge, pending ship.

## Blanks filled or documented

- Filled: the firing-evening narration blank (food-economy
  blank 2) — a deploy-ready, lift-verbatim spec with
  trigger point, kind-keyed templates, first/repeat/
  escalation/again rules, prohibitions, and the
  plain-words reason, grounded in ten sampled firing
  evenings with quoted lines.
- Documented (not fixed): the six gaps in §5 — hook
  unpinned, (F)-first untested, repeat variants
  untested in live play, death-knell placement unknown,
  mobile render untested, knife-edge firing carried.
- No new findings-backlog item: nothing outside this
  arm surfaced. The recurring silence itself was already
  the logged finding; this spec is its answer, not a
  new item.
