# sim-wilddeath-cause-b — DIAGNOSIS (Loop B, food-economy, next blank 3)

Diagnosis arm, NOT a stepwalk re-confirm (that is a separate future
prereg, explicitly out of scope here). Prereg committed BEFORE any
judged or diagnostic sim: evidence/2026-11-02/
sim-wilddeath-cause-b-prereg.md (commit 0a1760a39).

## VERDICT: DIAG-GO — the cause is identified with trace evidence

The fed-at-home "wild" death is a lost turn-based fight against a
Highbeam Deer that breached Haven — fought and lost AT HOME, not
out in the wild. The recorded cause 'the wild' names the fight's
origin (a wild monster, via tbFightDeathCause), not the place of
death. The death narration itself does not lie about the fight:
the transcript says the haven was breached and the deer came with
a raid. What misleads is only the bare cause string in the
corpus: "died — the wild" read next to "at home, fed" looks like
a paradox. It is not a paradox once the fight is seen.

Recorded vs proximate, as the prereg required:

- RECORDED cause (tele / fallen / corpse, all three agree):
  'the wild'.
- PROXIMATE cause: killed by a Highbeam Deer (gallowdeer, 160 HP
  benchmark) in a Haven-breach/raid turn-based fight at tile
  (4,4), the scholar's home tile. The scholar fought solo or with
  one ally, with a kitchen knife, and went down to antler hits
  plus the Ocular Discharge beam.
- The instrument reports the PROXIMATE cause, with the recorded
  string kept alongside — never the string alone.

## The instrument (this arm's build, zero src/js)

scripts/sweep-wilddeath-b.js (driver-side wrappers: playerDeath,
registerDeath, hurtVillager, Game.say — every wrapper delegates
and only records) + scripts/analyze-wilddeath-b.js (classification
fixed by the prereg) + scripts/test-wilddeath-b.js (proof).

Proof: scripts/test-wilddeath-b.js 11/11, including the guard that
a tele-only wild death classifies UNRESOLVED — the tele string is
the question, never the answer — and that a falsy raw arg would
classify FALLBACK, a wild arg without a tbEnd wild fight
WILD-UNCONFIRMED.

## Diagnostics: both named cases REPRODUCE on this tree's base

Armed leg (competent-stepwalk-b, loaded for diagnostics only from
a /tmp extract of the held sim-stepwalk-b branch blobs — NOT
committed into this branch, which stays free of another worker's
code), 30d, DEPOSITGATE=0, same gate assertions as the stepwalk
confirm. Contrary to the base-drift caution in the prereg, both
cases reproduce on this base with the same scholar, day, and
cause as the stepwalk corpora:

| Seed | Death | Scholar | Pre-death day-end | Death snapshot | Fight |
|---|---|---|---|---|---|
| 61901 | day 10, 'the wild', player | gen_phep6cl (Aaliyah) | day 9, (4,4) home, 1099 kcal, 100 HP | day 10, (4,4) haven, 1200 kcal, 0 HP, sick null | tbEnd, Highbeam Deer alive 129 HP, scholar −51 HP |
| 61407 | day 26, 'the wild', player | gen_ujjzkbf (Hilda) | day 25, (4,4) home, 2050 kcal, 100 HP | day 26, (4,4) haven, 2351 kcal, 0 HP, sick null | tbEnd, Highbeam Deer alive 104 HP, scholar −23 HP |

Trace for both: raw playerDeath arg 'the wild' (NOT falsy),
stack through tbEnd at src/js/game.js:44907 via party.js /
party-formal.js, live tbfight with a monster fighter and no
hostile fighter, no arena/betrayal/table/coalition flag. Fallen
and corpse agree on villager, day, cause 'the wild', and place
(4,4). Classification: WILD-FIGHT, fed-at-home true, location-
misleading true (the label is origin-true, place-silent).

Transcript (sense test), 61901 day 10:

- "SYSTEM: Perimeter violated! This is unprecedented! ..."
- "🐗 This one came with the raid on Haven — it was with the
  teeth at the door, not a lone wanderer."
- "⚔ HIGHBEAM DEER! You're on your own."
- Antler hits 13 / 10 / 10, beam 57 then 53 ("the beam SITS on
  you!"), "You go down." The scholar struck back for 21 with a
  kitchen knife; the deer walked away at 129/160 HP.

Transcript (sense test), 61407 day 26:

- "◈ CRISIS — THE BREACH. It got INSIDE. The haven was supposed
  to be the safe place — the one place. It isn't."
- "SYSTEM: Perimeter violated! ..." then the same raid-on-Haven
  deer line; antler hits 15 / 15 / 10, beam 83, "You go down."
  The scholar struck back for 24–25 with a kitchen knife; the
  deer walked away at 104/160 HP.

Death lines (captured post-call tails, all five identical in
template — the line names no place, it omits where; it does not
lie about where):

- 61901: "🕯️ Aaliyah Levy is dead — the wild. The village stops.
  Somebody screams. Somebody else starts digging."
- 61407: "🕯️ Hilda Banerjee is dead — the wild. The village stops.
  Somebody screams. Somebody else starts digging."
- 62202: "🕯️ Gladys Ward is dead — the wild. ..."
- 62203: "🕯️ Ellis Rossi is dead — the wild. ..."
- 62205: "🕯️ Declan Deng is dead — the wild. ..."

(The fallen roll stores the shorter name — Aaliyah, Hilda — while
the death line uses the full name; same person, same day, same
cause in both records.)

## Judged band: the instrument generalizes (fresh seeds 62201–62208)

Baseline competent only, 30d, DEPOSITGATE=0, same gate assertions.
No banned/reused band touched. Three MORE fed-at-home wild deaths,
all WILD-FIGHT, all Highbeam Deer at (4,4):

| Seed | Death | Scholar | Pre-death day-end | Fight |
|---|---|---|---|---|
| 62202 | day 23, 'the wild' | gen_kwko0m6 (Gladys) | day 22, (4,4), 2190 kcal, 100 HP | Deer alive 42 HP; ally Ursula alive 65 HP — the scholar still died (−24 HP) |
| 62203 | day 25, 'the wild' | gen_fypea5j (Ellis) | day 24, (4,4), 1339 kcal, 110 HP | Deer alive 57 HP, scholar −8 HP, solo |
| 62205 | day 10, 'the wild' | gen_x7lt9p8 (Declan) | day 9, (4,4), 1007 kcal, 110 HP | Deer alive 109 HP, scholar −7 HP, solo; "CRISIS — THE BREACH" line present |

All three carry the same raid-on-Haven deer line ("This one came
with the raid on Haven") and the same breach/perimeter narration
where the tail reaches it. Fallen + corpse agree on every one.

Negative controls (the instrument distinguishes, not just labels):
62208's two player deaths classify by their own traces —
day 11 dehydration via resolveDay honestCause (game.js:32273),
day 24 'the expedition' via returnToVillage (game.js:8900).
Neither is forced into the wild bucket.

## Candidates ruled out (with the evidence that rules each out)

- FALLBACK LABEL (ledger `cause || 'the wild'`): RULED OUT. The
  raw playerDeath arg is 'the wild' in all 5 cases, never falsy,
  and the stack passes through tbEnd in all 5. A census of live
  playerDeath call sites found no site passing a falsy cause at
  all (resolveDay passes killedBy||'starvation', hurtVillager
  cause||'injuries', encounters cause||'the hunt', the rest pass
  named strings).
- DISEASE / WOUND / SICKNESS LAG: RULED OUT. Sick record null at
  all 5 deaths; scholar health 100–110 at the last pre-death
  day-end, 0 at death — a single fight, not attrition.
- STARVATION / DEHYDRATION LAG: RULED OUT. Death-moment kcal
  1000–2351; pre-death kcal 1007–2190. A fed scholar's overnight
  honestCause would in any case read 'starvation', never 'the
  wild'.
- STALE CAUSE / SUCCESSION ARTIFACT: RULED OUT. Every wild death
  joins to its dying scholarKey (not the successor's) on day,
  fallen, corpse, and place (4,4).
- What remains: the ONLY live producer of exact cause 'the wild'
  for a player death is tbFightDeathCause's proven-wild branch
  (game.js:44551), and all 5 cases are that branch. No candidate
  mechanism is left unexamined for this phenomenon.

## Wall numbers (judged band 62201–62208, 30d pre-seat window)

national 0/8, table 0/8, wins 0/8, median survival 30d (all 8
survived to day 30 — succession continues past scholar deaths),
maxWave 2 on 7/8, wave 1 on 62204. Player-death census: 'the
wild' 3, 'dehydration' 1, 'the expedition' 1. The 0s are the
expected 30d pre-seat measurement profile, NOT a regression —
waves 4–5, national, table, and wins are not reachable in-window.

Diagnostics band wall (2 seeds, for completeness, not a rate):
national / table / wins 0/2, maxWave 2, median survival 30d.

## Balanced panel (§15, context only)

Single-policy competent campaign for the judged band (seeds
62201–62208, 30d): evidence/2026-11-02/
sim-wilddeath-cause-b-panel/ — 8 cases, 0 cached, sourcesStable
true, neutrality matched on proof seed 62201 (observer on/off
identical), won 0/8. The panel agrees with the driver tables on
wins 0; it does not override the prereg classification, which
the driver traces decide. No base-vs-lever compare is claimed
(single-policy diagnosis, no lever).

## Metric review (next run, NOT a re-score)

1. The prereg's fed line (≥1000 kcal at the last pre-death
   day-end) classified all 5 cases cleanly, including the
   boundary case 62205 (1007 kcal). It held; no revision proposed.
2. Instrument limitation, found by this run: the hurtVillager
   trail is BLIND to turn-based fight damage — tb fights carry
   fighter HP directly, never through hurtVillager (hurtTail was
   empty on all 5 wild deaths). The fight snapshot compensates
   for wild-fight deaths; a future wound/disease instrument must
   not rely on hurtTrail alone for fight damage.
3. Instrument limitation: the row-level sayLines keep only the
   last 200 lines, so death-day narration for early deaths ages
   out of the row — the per-death 80-line pre-tail plus the
   20-line post-call tail are the reliable transcript sources.
4. The death line itself ("X is dead — the wild") names no place
   — it does not lie about where, it omits where. Whether the
   fallen/corpse record should carry the fight's place (Haven)
   alongside the origin label is a design question for the
   findings backlog, not a fix made here: this arm changes no
   game code and no cause string.
5. OUT OF SCOPE, documented not chased: the Haven breach itself
   (a raid monster fighting the scholar inside Haven, solo,
   against the standing "havens are the ONLY unbreakable
   structures" rule and the "CRISIS — THE BREACH" narration) is
   a design question for the coordinator's findings backlog —
   is a breached Haven intended, and should the scholar fight
   alone there? This arm answers what killed them, not whether
   the breach should happen.

## Regression / proof checks

- scripts/test-wilddeath-b.js: 11/11 passed (final run, after
  the post-call death-line capture was added).
- No full check.js run in this round (measurement/diagnosis
  round, zero src/js and zero policy changes — the instrument
  only wraps functions in its own driver process).
- No stepwalk re-confirm run or claimed by this arm.

## Village assessment (plain words)

The village's scholar is not starving in the wild. She is home,
fed, by the fire — and then something with headlights for eyes
comes through the door with a raid, and she has to fight it
alone in her own house with a kitchen knife. She loses: the
antlers and the eye-beam do more damage than a fed, healthy
person can take in one fight, and the deer walks away barely
hurt. The village writes "the wild" in its book of the dead —
true about what killed her, a wild thing, but it reads as if
she died out wandering, when she died defending home. The walk
that saved her from stranding did not save her from this: the
rescue and the raid are different dangers, and the raid is the
one that got her, twice on the old seeds and three times more
on fresh ground.

## EVIDENCE FILES

- Prereg: evidence/2026-11-02/sim-wilddeath-cause-b-prereg.md
- This results file: evidence/2026-11-02/sim-wilddeath-cause-b.md
- Diagnostics corpus: evidence/2026-11-02/
  sim-wilddeath-cause-b-diag-armed.json (+ analysis JSON)
- Judged corpus: evidence/2026-11-02/
  sim-wilddeath-cause-b-judged.json (+ analysis JSON)
- Instrument: scripts/sweep-wilddeath-b.js,
  scripts/analyze-wilddeath-b.js, scripts/test-wilddeath-b.js
- Panels: evidence/2026-11-02/sim-wilddeath-cause-b-panel/
  (context only; 8 cases, sourcesStable, neutrality matched)
