# Journey: crisis leg (6) r23 — the death on camera (2026-10-18)

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Leg:** 6 — crisis, r23. Fresh angle: **THE DEATH ON CAMERA.** r22
  (menu cap) and r20/r21 (muster, event queue) covered UI; r5–r19 covered
  famine/outbreak/siege mechanics. NEVER journey-tested since 2026-10-12:
  the blood-on-air crisis beat (0/120 organic fires despite its 2026-10-10
  reachability fix) and the bearer-dies-on-camera gap (open design question
  since 2026-10-12: should the bearer dying on air fire blood-on-air?).
- **Leg question:** When someone dies on camera — villager or bearer — does
  the village's crisis system register it like people would? Does
  blood-on-air fire legibly? Do conversations carry the televised death, or
  does the village talk about the abduction as if the dead came home?
- **Interesting finding criteria:**
  - (a) a staged villager death in a televised contest fires blood-on-air
    with the beat line naming the dead;
  - (b) a staged bearer death in a televised contest: what registers
    publicly — if nothing does, that's the documented blank;
  - (c) post-death conversations carry the death (named, on-topic,
    sense-verified); a line asserting the opposite ("came back like nothing
    happened" for someone who didn't) is a bug.
- **Seeds:** proof 7, 42, 99 (crisis-proof convention); sense-reads 2210,
  2211 (fresh).
- **Primary metrics (binding, §14):**
  - M1: 3/3 proof seeds — staged villager death in a televised contest fires
    blood-on-air (pg.crises), beat line names the dead, roster removal real,
    contest_died gossip seeded.
  - M2: 3/3 proof seeds — staged bearer death in a televised contest:
    succession completes AND the death is publicly registered (some
    village-facing record). If nothing registers the televised aspect,
    document as blank.
  - M3: 2/2 sense seeds — post-death conversations carry the death
    (lately event + on-topic lines, sense-read); no line contradicts the death.
- **Kill rule:** if the staged deaths can't be driven through the real choke
  points (_contestDie watch path / player path) → SUBSTRATE-MISSING,
  document and move on. Not triggered.
- **Horizon:** proof: staged, same-day. Sense: staged + immediate convos
  (honest post-contest state: fireContest's lastContest + real death path).
- **Method:** scripts/test-crisis-deathoncam-20261018.js (proof, real choke
  points); scripts/sense-crisis-deathoncam-20261018.js (4 full convos,
  sense-read). Policy: none needed (staged); harness = sim-harness
  loadGame/setupGame with narration:true.

## Metric review (§14)

- **M1: HIT (3/3).** blood-on-air fires perfectly: beat line ("◈ CRISIS —
  BLOOD ON AIR. It happened on camera. Trillions watched X die..."), names
  the dead (knowledge-gated descriptor, correct per "if you don't know, it
  doesn't show"), roster removal real, contest_died gossip seeded. The
  0/120 organic rate is a rarity fact, not a wiring bug: villager contest
  deaths are vanishingly rare in organic play.
- **M2: HIT with a documented blank.** Succession completes (new bearer,
  fallen roll cause='contest', lineage records, death said aloud). The
  TELEVISED aspect registers nowhere: no blood-on-air (deliberate
  `pid !== 'player'` guard, 2026-10-10), no gossip (villager-only,
  deliberate). The village's grief IS carried: the new bearer's lately
  event is kind 'mourning' naming the dead bearer's TRUE name ("Otis" —
  the succession r20 name fix working), and it outranks the 'show' event
  in the priority chain. So the death is mourned, the cameras aren't
  mentioned. **Design question for Steve (restated from 2026-10-12):**
  should the bearer dying on air fire blood-on-air too, or is the
  mourning branch the intended register? Left as his call — no behavior
  changed on the bearer path.
- **M3: MISS → FIXED this run.** Pre-fix sense-read (seed 2210): all 4
  post-death conversations had latelyKind=show and talked about the GRAB —
  one line said "The Pit. They just... took the person in their 50s. Came
  back like nothing happened. It wasn't nothing." — for a villager who DIED
  on camera. Root cause: the 'show' lately event read only v.lastContest
  (the grab); _cxKillContestant created no corpse (arena is light-years
  away), so the 'mourning' scan found nothing, and no line knew the outcome.

## The fix (r23)

_villager dies on camera → the village now talks about the death._

1. `fireContest` plants `died: []` on `v.lastContest` (the show memory).
2. `_cxKillContestant` (the choke point for EVERY contest death — watch
   path, multi-take, duel partner) records the dead pid on
   `lastContest.died`, only when they were taken for that contest.
3. `t2LatelyEvent` threads `died` into the 'show' event.
4. The 'show' line renderer (convoTopics.js `t2gen_lately`) is death-aware:
   - bystander, named dead: "They took {name} — {contest}, on the screens.
     They didn't come home." / "The whole fire watched {contest}. {name}
     is gone — the cameras kept rolling."
   - bystander, unknown dead: "They took some of us — {contest}, on the
     screens. Not everyone came home." / "The screens showed everything.
     The fire's quieter tonight."
   - survivor of a multi-take (ev.self + someone died beside them):
     first-person grief variant instead of the tone-deaf "They took me...
     I'm still turning it over."
   - no deaths: existing grab lines UNCHANGED (verified byte-identical
     behavior on the no-death probe).

Post-fix sense (seed 2211): "The whole fire watched The Pit. the person
in their 50s is gone — the cameras kept rolling." — the NPC names the
loss in live talk. 4/4 convos carry it.

## Proof & regression

- scripts/test-crisis-deathoncam-20261018.js: 54/54 pass (3 seeds × 18
  assertions) — incl. the 4 new show-death assertions.
- check.js --only crisis: 11/11. --only convo: 13/13. --quick: 96/97 —
  the single failure is test-sprites-valid-20261014 (dustboar/sunback/
  sweeps_week/cliffhanger sprites), the same pre-existing failure r22
  documented (verified byte-identical on pristine HEAD, unrelated to this
  change).
- No new modules; ontology untouched. Canon: docs/CONTESTS.md (death on
  camera is the show's business), docs/DISEASES.md n/a.

## Village assessment (plain words)

Molly died in The Pit on camera. The village's crisis system did its job —
the beat fired loud, the gossip spread, the roster shrank for real. But the
fire kept talking about the night she was TAKEN, not the night she DIED;
one neighbor even said she came back like nothing happened. Now the fire
says her name and the cameras in the same breath. The leader's death is a
different story: when the bearer dies on camera, the village doesn't talk
about the show at all — it mourns its leader by name for ten days, and the
new bearer carries the grief personally. That half is already people.

## Reachable / fun / winnable

- Reachable: blood-on-air remains rare in organic play (villager contest
  deaths ~0/120) — but when it fires, every surface now agrees it happened.
- Fun: the fix is feel, not math — the village grieves on camera deaths
  instead of contradicting them. No balance touched.
- Winnable: untouched — no stat, cost, or trigger changed.

## Metric review (house section)

- The pre-registered metrics bound the run; M3's miss was fixed, not
  re-scored. No metric revisions proposed.
- Found-not-fixed: none. The bearer-on-camera design question is Steve's,
  not a fix deferred.
