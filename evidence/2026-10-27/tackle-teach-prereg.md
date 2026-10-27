# TACKLE-TEACH pre-registration — teaching new abilities (2026-10-27)

Workstream: TEACHING NEW ABILITIES, tackle-all program (Steve 2026-10-27).
Branch: tackle-teach. No gating changes (gating freeze 2026-10-27 16:53 still
in force: no deedGateReady, scale, stage, readiness-bar, or table-price edits).

## Background (measured before this work, not by this work)

Succession r53 band (seeds 26081–26085, analyzer
scripts/analyze-journey-succession-r53-20261027.js, re-run 2026-10-27):
BAND TEACH-NEW = 0 (known = 28, null = 0). All 28 teachPlant deeds arrived
via the haul-teach path; zero via teachRound, zero via conversation.
That metric counts teachPlant CALLS (the r53 driver wraps Game.teachPlant
and records every call, success or not) and defines "new" on the TEACHER
side (targetKnowsBefore = the teacher's village.plantKnowledge lacked the
plant). It does not record the call's return value, so it cannot tell a
lesson that taught from a no-op. It is context, not this work's bar: this
work's bars are about villagers seeking and receiving genuinely new
ABILITIES (villager-build.js ability knowledge 0–3), measured on the probe
band below.

## Standing design (not to be violated by the fix)

- Ability knowledge is 0–3; an ability nobody told a villager about scores
  0 in buildScore (villager-build.js knowledge_gates_planning).
- Villagers seek teachers for a target build (seek_not_drift); they do not
  receive abilities or ability knowledge for free — every new-ability
  knowledge gain must trace to a teacher who holds or knows it, a witnessed
  use, a System sheet show, or the System's broadcast (existing design).
- Human skills and alien abilities are separate lanes (docs/CANON.md):
  skill-teaching.js teaches human skills at L1; villager-build.js tracks
  magic-ability knowledge. A skill lesson is never counted as an ability
  teach, and vice versa.
- Conversation teaches must read as a person teaching another person
  something new (sense-testing law), not just increment a counter.

## The band (same band before and after — frozen)

Probe: scripts/test-teach-new-band.js (new with this work). Fresh run per
seed, seeds [71001, 71002, 71003, 71004, 71005, 71006], System arrived
(precondition for seeking; seeking is System-era by design), villagers at
home with neutral needs and a fed pantry (so objPick is not swallowed by
REST/EAT gates), 30 village days. Each day: villagerBuildDay() (skill
lessons + sheet resolution) plus one objPick per living non-bearer
villager at home. Counts per seed, summed across the band:

- SEEK-ATTEMPTS: objPick results of kind SEEK, plus direct
  villagerWantsKnowledge results ('sheet' / 'build' / null) sampled daily.
- SEEK-SUCCESS: villager_seek_knowledge tele events (a seek that taught).
- NEW-ABILITY: ability ids whose learner npcKnow went from absent/0 to
  >=1 during the band, attributed by same-day source (seek tele, talk,
  witness, sheet show, broadcast). A level raise on an already-known id
  is a RE-TEACH and is never counted here.
- SKILL-NEW: skillLessons ledger entries where the learner did not know
  the skill before that day (skill lane, reported separately).
- CONVO-TEACH: npcKnow gains from a held conversation (npcLearnFromTalk),
  and whether each produced a tele or journal entry (ledgered or not).

## Bars (set BEFORE any measurement on this band)

All bars are on the AFTER run unless marked (before). A miss on any bar
is NO-GO / HELD with root cause — never re-scored, never a kill (Steve's
kill discipline).

1. SEEK-ATTEMPTS (after): at least 1 SEEK objective per seed on average
   across the 6-seed band (band total >= 6), and SEEK-SUCCESS > 0.
   (Before is expected to be low; the bar is that seeking happens at all
   under at-home, System-arrived conditions.)
2. NEW-ABILITY (after): band total >= 6 (on average one genuinely new
   ability-knowledge gain per seed), with at least half attributed to a
   teacher (seek or talk), not to sheet shows or broadcasts alone.
   NEW-ABILITY must exceed the BEFORE band total; BEFORE is recorded
   before any game-code change.
3. NO-FREE-GRANT: every NEW-ABILITY gain in the AFTER run traces to one
   of: a teacher holding/knowing the ability, a witnessed use, a System
   sheet show, or the System broadcast. Zero gains with no source.
   (Broadcast gains are allowed but reported separately; the fix must not
   add any new sourceless grant.)
4. NO-REGRESSION on re-teaches: RE-TEACH counts are reported, not barred,
   but the fix must not convert re-teaches into new teaches by resetting
   or wiping npcKnow, and must not change buildScore, buildDecide, or
   any gate threshold.
5. CONVO-TEACH LEDGERED (after): every npcLearnFromTalk gain in the band
   produces a tele event or journal note naming teacher, learner, and
   ability. (Before: expected ledgered = 0 — the gap named in the task.)
6. SENSE: at least one transcript/journal line in the AFTER run reads as
   a person teaching another person something new (quoted in evidence),
   and no teach line narrates a lesson that taught nothing.

## Method notes

- The probe snapshots npcKnow / npcSkills per villager per day, so
  new-vs-reteach classification uses the learner's own before-state, not
  the teacher's.
- teachPlant / plant teaching is out of scope for the game-code fix: the
  policy teachRound teacher-filter inversion found during diagnosis
  (competent.js picks non-knowing villagers as teachers) is reported to
  the parent, not silently fixed, because policies are the measurement
  instrument and changing them mid-program breaks band comparability.
- If a bar fails, the work is HELD with the root cause, not killed.
