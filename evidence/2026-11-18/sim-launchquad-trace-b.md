# sim-launchquad-trace-b — DIAGNOSTIC evidence (finding #2511: do launched quads arrive as launched?)

**Arm:** sim-launchquad-trace-b · **Loop B run:** fleshout-loop-b-20261118T0330Z
**Type:** DIAGNOSTIC — no new sims, no game-code change.
**Corpus (frozen, existing):** sim-partysize-allycap-b corpora, band
103601–103608 — `evidence/2026-11-17/perseed-partysize-allycap-b-ctl/`
(8 seeds) and `...-arm/` (8 seeds). Substrate: PARTYSIZE4=1 both legs;
ctl = FIGHTALLY2 off, arm = FIGHTALLY2 on; policy competent verbatim;
horizon 150d death-aware.
**Corpus-location correction:** the corpora are NOT on master in this
worktree (its base predates the allycap landing); they were read
read-only from the sibling worktree
`~/workspace/worktrees/sim-partysize-b/evidence/2026-11-17/`. The
tracer takes corpus dirs as arguments so it still runs once the
allycap corpus lands on master.
**Branch tip:** `sim-launchquad-trace-b` + prereg commit `89ddae55c`
(this arm's work below that tip).
**Prereg:** `evidence/2026-11-18/sim-launchquad-trace-b-prereg.md`
(frozen 2026-11-18 04:28 UTC, BEFORE any judged analysis).
**Question (finding #2511, the top tracker blank):** a launched quad
never fielded four at a meeting on the allycap band — does the launched
party scatter en route, or does `villagerFightAllies` just return
whoever is near at the meeting? This blocks the partysize B2
re-judgement (the 4th seat cannot show damage in a meeting it never
reaches).

## Verdict: GO — ALLY-PICK, 3/3 traced

| Check | Result |
| --- | --- |
| Population reproduced | **PASS** — 3 launched evades (1 ctl, 2 arm), exactly the frozen count; tracer exit 0 |
| Every traced quad carries a mechanism verdict with cited rows | **PASS** — table below; every claim tied to a cited recorder row |
| Proof green | **PASS** — `scripts/test-launchquad-trace-b.js` 10/10 (join fixtures incl. the day-49 triple-launch regression, verdict fixtures, `launchesForSeed` fixture, corpus-population check) |
| Instrument | **CLEAN** — no verdict-required field missing on any traced quad; distance/terrain is the documented recorder gap (#2512), not a verdict blocker |

**Answer in one line:** the meeting party is sensed fresh at the
meeting — `villagerFightAllies` returns whoever is near, and the
launch party is never read at the meeting at all. The parties do not
so much scatter as never exist as a travelling unit in the fight
path: the launch is a dawn decision plus a shared destination, and
the meeting is a fresh sense. And structurally, a quad could never
have fielded four anyway: the sense caps at 2 allies, so the meeting
party caps at 3 — the 4th seat cannot appear at a meeting by
construction (finding #2515).

## Trace table (every launched evade meeting in the corpus)

| # | Leg / seed / day | Fighter vs species | Launch (day, size, target) | Meeting party (sensed) | Gate planParty vs sensed | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | ctl / 103606 / d77 | Mateo Alvarez vs The Eulogy (w4) | d61, size 2, target eulogy; party [gen_a48xjkw, mateo_alvarez] | 3 (Mateo + gen_a7suqzn + elena_petrova); holder absent entirely | planParty [ivy_wang] vs sensed [mateo_alvarez, gen_a7suqzn, elena_petrova] | **ALLY-PICK** |
| E2 | arm / 103604 / d49 | Ivy Wang vs The Audit (w4) | d46, size 4, target audit; party [ivy_wang, benoit_lambert, naran_tumen, gen_ke7f7nq] | 3 (Ivy + gen_256ihks + gen_x833x9m — NEITHER a launch companion) | planParty [benoit_lambert, ava_garcia, naran_tumen] vs sensed [ivy_wang, gen_256ihks, gen_x833x9m] | **ALLY-PICK** |
| E3 | arm / 103604 / d53 | Ava Garcia vs The Audit (w4) | d49, size 4, target audit; party [ivy_wang, benoit_lambert, ava_garcia, naran_tumen] | 3 (Ava + benoit_lambert + ivy_wang — a subset of the quad) | planParty [benoit_lambert] vs sensed [ava_garcia, benoit_lambert, ivy_wang] | **ALLY-PICK** |

All three: origin `expedition`, outcome `evade`, rounds 0, dealt 0,
`allyFromStart: false`, distance/terrain "n/a (not in corpus)".

## The code half (why ALLY-PICK, not just "rows agree")

The meeting party is computed at the meeting, from live senses only:

- `Game.villagerFightAllies(vid)` (`src/js/party-wiring.js:41`) reads
  ONLY live assignments (outdoor tasks), the `_outdoorCrew` snapshot
  backup, and `npcNode` proximity (Chebyshev ≤ 1), trust-ordered,
  trust floor 15, **capped at 2** (`.slice(0, 2)`). It never reads
  `st.exped`, `plan.party`, or any launch roster. The header comment
  states the rule: "the outdoor crew first..., then villagers on/
  adjacent grid nodes (in earshot). Capped at 2."
- The wild-encounter path (`src/js/game.js:20880`, comment verbatim):
  "No roster feed: only co-tasked or co-located villagers,
  trust-ordered, capped at 2 by the helper." The sense result is
  passed straight into `fieldFight` as `allyVids`.
- The expedition-encounter path (`src/js/villager-agency.js:652`):
  `allyVids = this.villagerFightAllies(vid)` at the encounter, then
  `fieldFight(vid, m, null, { awareness, allies, allyVids })`. Same
  fresh sense, no expedition read.
- The launch DOES create shared-destination expeditions
  (`src/js/win-plan.js:573` `winPlanDepart` → `launchParty`: one
  shared target tile `(tx, ty)` and duration for holder + companions,
  each via `startExpedition`, which sets each member's node one step
  from Haven toward the target and an independent `st.exped[vid]`
  record). So the design intends co-travel — but there is no shared
  party object: each member holds an independent expedition, legs
  advance per villager, and `plan.party` is overwritten on every
  re-launch. Nothing in the fight path ever consults it.

The corpus half matches the code exactly: in all three gate rows the
recorder itself distinguishes the plan from the sensed party
(`planParty` ≠ `party`/`sensed`), and `allyFromStart` is false on all
three encounters. The launch party is a dawn decision; the meeting
party is a fresh sense. That is ALLY-PICK by the prereg's frozen rule.

## The row half, quad by quad

**E2 — arm 103604 d49, Ivy vs The Audit, ALLY-PICK.** The quad
launched d46 (Ivy + Benoit + Naran + gen_ke7f7nq, target audit).
Three days later Ivy met the Audit with gen_256ihks + gen_x833x9m —
neither a launch companion. Two rows pin the sense: (a) the d49 gate
row records `planParty: [benoit_lambert, ava_garcia, naran_tumen]`
(Ivy's d49 re-launch quad) against `sensed: [ivy_wang, gen_256ihks,
gen_x833x9m]` — plan and sensed are different sets in the same row;
(b) Ivy had fought this same Audit on d44 with exactly the same two
allies (gen_256ihks + gen_x833x9m, 86 dealt, then fled) — the sensed
party is stable across days for Ivy, which is what a co-located crew
looks like, not what a launch roster looks like. The tracer's one
together-row (d48: Naran met a Strike with gen_ke7f7nq + gen_256ihks —
two launch members together, but without the holder and already with
a stranger) is partial-together evidence, not a full-quad
together-sighting; under the frozen rule SCATTER needs together AND
apart, and no apart-row precedes the meeting. It does not flip the
verdict: the meeting party was still drawn by the fresh sense.

**E3 — arm 103604 d53, Ava vs The Audit, ALLY-PICK.** The second quad
(Ivy's d49 launch: Ivy + Benoit + Ava + Naran) met as Ava + Benoit +
Ivy — three of the four, Naran missing. The strongest
SCATTER-adjacent evidence on the band sits here: on d52, the day
before, Ivy evaded a Eulogy with allies [benoit_lambert, naran_tumen]
— three of the four launch members together. But the d53 meeting
party was still a fresh sense (`allyFromStart: false`; gate
`planParty: [benoit_lambert]` — Ava's d52 pair re-launch had already
overwritten her plan — vs `sensed: [ava_garcia, benoit_lambert,
ivy_wang]`). The quad was mostly together on d52 and still did not
arrive as a quad on d53, because nothing carries "together yesterday"
into "allies today" except live proximity. The same day, Benoit fought
an Algorithm with [ivy_wang, gen_256ihks] — the sensed party re-draws
per encounter, per fighter. The E2/E3 Audit question (one spawn
wounded 1298 → 1237, or a second spawn) is still unsettled by this
trace — neither is claimed.

**E1 — ctl 103606 d77, Mateo vs The Eulogy, ALLY-PICK.** The size-2
launch (d61: holder gen_a48xjkw + Mateo, target eulogy) never
produced a joint meeting at all. The holder was last seen d64,
meeting the Eulogy with [gen_a7suqzn, elena_petrova]; Mateo then met
three monsters (d69 Suburb, d76 Timeslot, d77 Eulogy) with exactly
that same pair, the holder absent throughout (tracer apart-rows: 3).
The pair gen_a7suqzn + elena_petrova is a recurring co-located crew
that attaches to whoever is out — first the holder, then Mateo. The
d77 gate row's `planParty: [ivy_wang]` is stale/other-plan (Mateo's
current plan at gate time, not the d61 launch) — the same gate-snapshot
staleness the evadeclass evidence documented; no verdict rides on it.

## The structural cap (finding #2515)

Even if a quad travelled perfectly together, the meeting could never
field four: `villagerFightAllies` returns at most 2 allies, the
field-fight join takes the first two, and the gate's `sensedSize` is 3
on all three meetings. The 4th seat is not a meeting that failed to
form — it is a seat the fight path cannot express. Any B2
re-judgement that needs the 4th seat's damage must either change the
sense (let the meeting party prefer the launch/expedition party and
raise the ally cap for launched parties) or judge the 4th seat by a
different instrument (e.g. damage across the launch's meetings, not
one meeting's party). This arm documents the shape; it does not build
the fix.

## Why this is not SCATTER

SCATTER, as pre-registered, needed a together-sighting after depart
AND an apart-state before the meeting. No traced quad has both: E2
has a partial together-row and no apart-row; E3 has two together-rows
and no apart-row; E1 has three apart-rows and no together-row. The
depart rows alone are dawn decisions, not together-sightings. The
honest reading is that the launch party is ephemeral by design —
re-launched daily (Ivy launched d46, d49, d55, d63, d67 on this one
seed; `plan.party` is overwritten each time), with no persistent quad
object — and the meeting party is drawn fresh each time from whoever
is near. "Scatter" implies a unit that broke apart; the corpus shows
a decision that was never a unit in the fight path.

## Sense-testing (what the player would actually see)

The three evade lines are the same honest refusal, spotter named:

- E1: *"Mateo saw Big Ugly in time and gave it room."*
- E2: *"Ivy saw The Audit in time and gave it room."*
- E3: *"Ava saw The Audit in time and gave it room."*

They read like people, not counters — and they are the only voice the
launch program has at the meeting: nothing says "we set out as four"
or "where did the fourth go," because the game itself never tracks
the launched party into the meeting. A player watching Ivy's quad
leave on d46 and meeting the Audit with two strangers on d49 would
have no in-fiction account of where Benoit, Naran, and gen_ke7f7nq
went. That silence is the player-facing symptom of the ALLY-PICK
mechanism (finding #2515's voice note).

## Village assessment (plain words)

On seed 103604, Ivy's village sent two hunting parties after the
Audit, three days apart, and both came home having never raised a
weapon — the first with two strangers at Ivy's side, the second
mostly together but one short. Nobody died; the evades were wise (the
Audit sat at 1298 and 1237 HP against a best-ever 86 damage in a
meeting). But the village's plan never actually travelled: the four
names written down at dawn were a wish, and the three people who met
the monster were whoever happened to be standing nearby. On seed
103606, Mateo walked out with one companion and spent the next two
weeks walking with two entirely different people, while the companion
he left with vanished from the record after one fight. The villages
feel alive — people sense danger, give it room, and form little
travelling crews that stick together for days — but the "launched
party" as the game plans it is not a thing that walks the world. It
is a dawn decision that dissolves by noon, and the fight that follows
belongs to whoever is near. Until the meeting sense reads the launch,
every lever that assumes a launched party arrives together is
measuring a party that was never there.

## Instrument notes (read before reusing this corpus)

- **First tracer run inflated the population to 28 — fixed before
  judging.** The first version joined encounters to ALL launch rows,
  including wave-3 hunts (targets like `ad_break`, `spool`,
  `callback`, `terms_of_service`, null targets). The analyzer's
  `launchesForSeed` counts only wave-4+ launches (`targetWave >= 4`
  or target in the wave-4 list) and dedupes by (vid, day). Replicating
  it exactly reproduces the frozen 3 (1 ctl, 2 arm). The tracer now
  carries that function verbatim-logic; the proof test pins it with a
  fixture (wave-3 filtered, same-day dupes merged). Any future tracer
  that joins launches must apply the same filter or it will re-inflate.
- **The gate row already separates plan from sensed.** `v4gates`
  carries both `planParty` and `party`/`sensed` on the same row — the
  plan-vs-meeting distinction is recorder-visible without any new
  instrument. But `planParty` is the CURRENT plan at gate time, not
  necessarily the joined launch's party (E1's is `[ivy_wang]`; E3's
  is the d52 pair, not the d49 quad) — it is stale by the same rule
  the evadeclass evidence documented for `planTarget`.
- **No daily expedition roster exists in the corpus.** `daily` rows
  carry `roster` and `partyMembers` (the scholar's party — e.g.
  103604 d46–49 `partyMembers: [naran_tumen, gen_xwqkqwr]`), not
  expedition rosters. The trace therefore reasons from encounter
  ally-sets (who was near whom, day by day), which is exactly what
  the sense computes — but a recorder that snapshotted
  `st.exped[vid]` (tx/ty/legs) daily would let a future arm test
  whether launch members actually share tiles en route. That is the
  one instrument addition this diagnostic names; no fresh sweep was
  run, because the code half already settles the mechanism and the
  prereg's contingency (fresh tracer sweep) is not needed.
- **Distance/terrain is still a recorder gap (finding #2512).** No
  encounter, gate, or depart row carries distance or terrain — the
  verdict does not depend on it, but whether launch members share a
  tile en route (vs merely a destination) is unmeasurable from this
  corpus.
- **Canon note.** `docs/CANON.md` (manifest), `docs/PARTY.md`, and
  `docs/MONSTER-WAVES.md` were read for this arm. PARTY.md covers
  the PLAYER's party system (System unlock, invites, cap 3→4→5,
  travelling leash) — not villager win-plan launches; MONSTER-WAVES.md
  carries no party/expedition/launch rule. No canon doc covers the
  sim recorder or the villager launch party — say so here rather than
  inventing canon. The launch mechanics in this evidence are cited
  from code (`win-plan.js`, `villager-agency.js`, `party-wiring.js`,
  `game.js`), not from canon.

## Metric review

- The prereg's GO bar was met: 3/3 quads fully traced (depart roster,
  meeting party, gate plan-vs-sensed, together/apart rows), mechanism
  named ALLY-PICK for all three, every claim tied to a cited row
  (depart/encounter/gate rows by seed + day) and cited code lines.
- The frozen verdict rules did their job: no verdict was forced. The
  SCATTER branch (together AND apart) never fired because no quad
  supplied both halves — the rules refused to call E3's d52
  together-row a scatter on its own, which is the honest outcome.
- The population check caught a real instrument error mid-run (28 vs
  3) and the fix (wave-4 launch filter, replicated from the analyzer)
  is locked by a proof-test fixture — the check earned its keep.
- The prereg's contingency (fresh tracer sweep with a daily roster
  recorder) was NOT run: the frozen corpus + code settle the
  mechanism, and a fresh sweep would re-measure the same rows. The
  sweep design is recorded here as the named next instrument step
  (daily `st.exped` snapshot) rather than run.
- Limitation: the verdict's code half is a code reading, not a live
  probe — no run in this arm executed `villagerFightAllies` against a
  staged expedition to watch it ignore the launch party. The corpus
  half (3/3 gate rows separating plan from sensed, `allyFromStart:
  false` on all three) corroborates it, but a staged harness probe
  would be the belt-and-braces confirmation for the fix arm.
- Wall numbers are inherited from the allycap run (no new sims): see
  below. This diagnostic moves no wall number.

## Wall numbers (inherited from sim-partysize-allycap-b — carried, not re-measured)

National 0/8 · table 0/8 · wins 0/8 · wave-4 unlock 7/8 ctl, 8/8 arm ·
wave-5 unlock 1/8 ctl, 4/8 arm · median survival 151d ctl / 148.5d arm.
Standing ≥200: 1/8 ctl, 4/8 arm. No village reached national rank.

## Convergence state

Axis (winnability chain): **not converged**. This arm closes finding
#2511's open question on this band: the mechanism is ALLY-PICK — the
meeting party is sensed fresh, the launch party is never read at the
meeting. The next work is NOT another trace; it is the fix-shape
decision in finding #2515 (sense the launch party at the meeting, or
judge the 4th seat by a different instrument) and the B2
re-judgement, which cannot proceed on a per-meeting 4th-seat damage
bar while the sense caps at 2 allies.

## Blanks filled or documented

- **Filled:** finding #2511's mechanism — all three launched quads
  traced depart → meeting with the mechanism named (tracer
  `scripts/trace-launchquad-b.js`, proof
  `scripts/test-launchquad-trace-b.js` 10/10).
- **Filled:** the wave-4 launch-filter trap — the first tracer run
  inflated the population 28 vs the frozen 3 by joining wave-3
  hunts; fixed by replicating the analyzer's `launchesForSeed`,
  locked by a proof-test fixture.
- **Documented, not built:** finding #2515 — the 4th seat cannot
  appear at a meeting (ally cap 2; launch party never read); fix
  shape named, no game-code change in this arm.
- **Documented, not chased:** the E2/E3 Audit identity question (one
  spawn wounded 1298 → 1237 vs a second spawn) — unsettled by this
  trace.
- **Documented:** the daily-expedition-roster recorder gap — no
  `st.exped` snapshot in the corpus; the named next instrument step.
- **Documented:** canon gap — no canon doc covers villager launch
  parties or the sim recorder; PARTY.md is the player's party only.

## Files

- Prereg: `evidence/2026-11-18/sim-launchquad-trace-b-prereg.md`
  (frozen BEFORE judged analysis, commit `89ddae55c`)
- Analysis: `evidence/2026-11-18/launchquad-trace-b-analysis.json`
  (tracer exit 0, population 3: 1 ctl, 2 arm, verdicts ALLY-PICK 3)
- Tracer: `scripts/trace-launchquad-b.js` (self-contained; launch
  join + wave-4 `launchesForSeed` replicated from the analyzer)
- Proof: `scripts/test-launchquad-trace-b.js` (10/10 green)
- Corpus (read-only, sibling worktree — NOT in this worktree):
  `~/workspace/worktrees/sim-partysize-b/evidence/2026-11-17/perseed-partysize-allycap-b-ctl/`
  and `...-arm/` (8 seeds each)
- Findings: #2511 marked fixed (answered); #2515 appended to
  `sim-findings.md`
