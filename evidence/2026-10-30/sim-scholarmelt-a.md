# sim-scholarmelt-a — scholar tb-combat melt sink behind the 4 BEAST-VANISHED chains

**Verdict: DIAG-NO-GO** (classification leg fails; see legs below).
Run: fleshout-20261030T0738Z, axis scale-onramp. DIAG ONLY — no game changes.
Prereg: `evidence/2026-10-30/sim-scholarmelt-a-prereg.md` (committed before any judged
analysis; correction #1 pre-sweep, correction #2 committed before the re-run sweep).
Band: seeds 75101–75116, 180d death-aware, substrate tableseat-nowait exactly as
chainclose/recurrence used it (verified from chainclose's sweep, not assumed).
Corpus: `evidence/2026-10-30/perseed-scholarmelt-a/` (row + census per seed),
analysis: `evidence/2026-10-30/sim-scholarmelt-a-analysis.json`.
Instruments: `scripts/policies/scholarmelt-diag.js`, `scripts/sweep-scholarmelt-a.js`,
`scripts/analyze-scholarmelt-a.js`, fixtures `scripts/test-scholarmelt-a.js`.

## What was asked

Split the scholar turn-based-combat melt sink behind recurrence's 4 BEAST-VANISHED
chains (s75102 algorithm, s75102 eulogy, s75116 audit, s75116 suburb). Per recurrence,
all 4 passed an all-HP census cross-check, neither host seed entered the table
(finale wipe excluded), and 0 later same-type meetings exclude villager removal —
leaving scholar tb-combat as the remaining code path: an ordinary wild monster lifted
into a scholar fight melts away on scholar flee/loss, while titans/lingering are
restored. This arm classifies EVERY scholar tb-combat on the band and resolves each
of the 4 chains to scholar-kill vs scholar-flee-melt vs other, with transcript
evidence, keyed by (seed, mid) instance, never type alone.

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Completeness | 16/16 valid seeds, recorder covers all scholar tb-combats | PASS — 16/16 rows, 427 scholar tb-combats recorded, 0 refused excluded, all recorder errs 0, joins 2257/2257, join errors 0, mDealt mismatches 0, shoutrec prefix-checked 751, violations 0 |
| Substrate equivalence | own row minus `scholarmelt` byte-identical to chainclose's row per seed; own census byte-identical to recurrence's census per seed | PASS — rows 16/16, census 16/16 (analyzer SUBSTRATE all=true) |
| Chain-set agreement | vanished set equals recurrence's 4 pairs | PASS — {75102\|algorithm, 75102\|eulogy, 75116\|audit, 75116\|suburb}; recurrence cross-check 10/10 chain fates agree, 0 mismatches |
| Classification | band UNCLASSIFIED == 0 and 0 unresolved vanished chains | **FAIL** — band UNCLASSIFIED = 3 (empty-fighter orphan tbEnds, see below); unresolved vanished chains = 3 of 4 |
| Determinism | 1 seed re-run, row + census byte-identical, scratch removed | PASS — seed 75102: row IDENTICAL, census IDENTICAL, DETERMINISM-PASS, no scratch left |
| Sense | every vanished-chain meeting log read end to end + matched scholar traces | PASS — all 10 villager logs read (see sense section); matched scholar trace for audit read; near-miss traces read |
| Fixtures | test script green | PASS — FIXTURES-PASS (44 checks, 0 fails) |

**Formal verdict is DIAG-NO-GO** because the classification leg fails on both halves:
3 orphan UNCLASSIFIED rows remain (prereg rule 2 forbids re-labelling them), and 3 of
4 vanished chains are INSUFFICIENT-DATA under the strict matching window. This is
reported as measured, not softened: the measurement still delivers 1 proven melt,
the full band sink size, and a new unexplained-removal sink class for follow-up.

## The 4 vanished chains

### RESOLVED — s75116 audit: SCHOLAR-FLEE-MELT (judged)

- Chain: n=1, d139, remaining HP 785, firstAbsentDay 140, finalDay 180.
- Villager story (d139, resolve, vFlee): Miguel + Isabel wound the beast 825→785
  over 3 rounds; Miguel flees at 1 HP. The beast stands at 785.
- Matched fight: fightSeq 21, d140, tile [4,4], intendedMid audit, wild (titan false,
  lingering false, veteran false), lift HP 785, lifted true, fighter HP 785→661 alive
  at end, scholar HP 100→−17 (scholar died), result lost, restoredIdentity false,
  restoredEntry false, restoredHp null → **SCHOLAR-FLEE-MELT**.
- Corroboration: fighter hpStart == lift HP (785); lift tile [4,4] matches the
  chain's tile; exactly ONE audit scholar fight exists on s75116, so the match is
  unambiguous. Census timing note: the d140 census snapshot already lacks the
  instance (censusPresentFightDay false). The d136–139 snapshots show audit at 825
  (pre-meeting HP), so snapshots capture start-of-day state before that day's
  meetings; the d140 snapshot's absence is consistent with the fight running in the
  day-boundary phase before that day's snapshot. The hp-exact lifted match, not the
  snapshot day label, is the identity proof — no second audit at 785 exists anywhere
  in the corpus.

### UNJUDGED SAME-DAY CANDIDATE — s75102 algorithm (observation only, NOT a verdict)

- Chain: n=4, d65–d71, remaining HP 959, firstAbsentDay 72, finalDay 85.
- Candidate: fightSeq 21, d71 (SAME day as the chain's last meeting), intendedMid
  algorithm, lift HP 959 at [4,4], wild (titan false, lingering false), lifted true,
  fighter HP 959→957 alive, scholar HP 100→−15 (scholar died), result lost,
  restoredIdentity false → SCHOLAR-FLEE-MELT in form.
- Ordering argument (why this is the only consistent story): the d71 villager meeting
  ended with the beast alive at 959 HP (Ursula dies, beast stands). If the scholar
  fight had come first on d71, the beast would be gone and no meeting could follow.
  Meeting-then-fight is the only order consistent with both events plus
  gone-by-d72-snapshot. A different s75102 algorithm scholar fight (seq 19, d65, lift
  45 HP, lingering, lifted false, restoredIdentity true) is a raid-side instance,
  not this chain.
- Formal status: **INSUFFICIENT-DATA**. The prereg matching rule requires
  dayStart strictly after lastDay (71 < 71 is false). Widening the window mid-run
  would be re-scoring under MEASUREMENT.md §14; the same-day inclusion (with
  part-stamped ordering proof) is ranked-next work for a follow-up arm's prereg.

### INSUFFICIENT-DATA — s75102 eulogy (no scholar fight vs the chain instance)

- Chain: n=4, d55–d59, remaining HP 853, lastSeen d61, firstAbsentDay 62, finalDay 85.
- Census trajectory for (eulogy, 853): present d57–61, all at tile (4,4), gone d62.
- Searched: every s75102 scholar fight mentioning eulogy. Exactly one exists:
  fightSeq 17, d62 — a bystander lift of 146 HP at [4,4] (not a fighter), routed,
  restoredIdentity true, with a DIFFERENT eulogy fighter at 962 HP fled. Near-miss,
  failed rules: not-lifted, hp-mismatch (lift 146 vs chain 853). **No scholar tb
  fight against the 853 instance exists in the corpus at any day.**
- The beast's removal between the d61 and d62 snapshots has no scholar-fight
  explanation. This is an unexplained removal, not a melt.

### INSUFFICIENT-DATA — s75116 suburb (no scholar fight vs the chain instance)

- Chain: n=1, d140, remaining HP 1285, lastSeen d158, firstAbsentDay 159, finalDay 180.
- Villager story (d140, resolve, vDie): Miguel strikes for 15 (1300→1285), dies to
  Property Tax in round 1. The beast stands at 1285.
- Census trajectory for (suburb, 1285): present d141–158, wandering
  (5,3)→(5,4)→(6,4)→(5,5)→(6,4)→(8,4)→(7,4)→(7,3)→(7,4)→(6,4), gone d159.
- Searched: every s75116 scholar fight mentioning suburb. Two exist, both different
  instances: fightSeq 18, d128, lift 975 wild, melt, result lost (before the chain
  meeting); fightSeq 23, d159, lift 960 LINGERING, melt, result lost — near-miss,
  failed rule: hp-mismatch (960 vs 1285); a siege suburb, not the wild chain
  instance. **The chain instance's removal between the d158 and d159 snapshots has
  no scholar-fight explanation.** Unexplained removal, not a melt.

### Classification table (summary)

| Chain (seed, mid) | Verdict | Matched fight | Fate | Lift HP | Fighter HP | Scholar HP | Restore |
|---|---|---|---|---|---|---|---|
| s75116 audit | scholar-flee-melt | seq 21, d140, lost | SCHOLAR-FLEE-MELT | 785 | 785→661 alive | 100→−17 | none |
| s75102 algorithm | INSUFFICIENT-DATA (same-day candidate, unjudged) | seq 21, d71, lost (same day) | melt in form | 959 | 959→957 alive | 100→−15 | none |
| s75102 eulogy | INSUFFICIENT-DATA | none (near-miss seq 17, d62, bystander 146) | — | — | — | — | — |
| s75116 suburb | INSUFFICIENT-DATA | none (near-miss seq 23, d159, lingering 960) | — | — | — | — | — |

## Band scholar tb-combat census (427 fights, 0 refused excluded)

Fate counts: SCHOLAR-KILL 182, SCHOLAR-FLEE-MELT 63, SPAWN-ENDED 70,
SCHOLAR-RESTORED 87, BYSTANDER-OR-NONMONSTER 22, UNCLASSIFIED 3.

Fate × wave:

| Wave | Kill | Flee-melt | Spawn-ended | Restored | Bystander | Unclassified |
|---|---|---|---|---|---|---|
| 1 | 120 | 24 | 12 | 1 | 9 | 0 |
| 2 | 38 | 9 | 7 | 0 | 3 | 0 |
| 3 | 20 | 15 | 3 | 2 | 6 | 0 |
| 4 | 4 | 15 | 3 | 9 | 4 | 0 |
| unknown* | 0 | 0 | 45 | 75 | 0 | 3 |

*Unknown wave = primary monster id absent from src/data/monsters.json (table-trial
'finale' and similar non-roster fighters; the 75 restored are herald dissolved rows
whose primary id is not in the roster — see below).

Fate × lift presence (what the fight did to the tile monster):
- SCHOLAR-FLEE-MELT 63: all lifted.
- SCHOLAR-KILL 182: lifted 93, spawned 75, never-lifted 14.
- SPAWN-ENDED 70: all spawned (no world instance; fight ended without a kill).
- SCHOLAR-RESTORED 87: lifted 12 (titan/lingerer tbEnd restores) + never-lifted 75
  (herald dissolved rows whose object was back by identity at flush).
- BYSTANDER-OR-NONMONSTER 22: all never-lifted.
- UNCLASSIFIED 3: no lift (orphan tbEnds with empty fighters; see below).

By lift presence overall: lifted 168, spawned (no lift) 148, lift-present-but-never-
lifted 111.

Per-seed tb counts: 75101:11, 75102:62, 75103:7, 75104:57, 75105:81, 75106:13,
75107:11, 75108:2, 75109:11, 75110:29, 75111:18, 75112:10, 75113:35, 75114:43,
75115:9, 75116:28.

Sink size (the scholar tb-combat melt sink, judged): **all melts 63, wave-4 melts 15,
wild non-titan non-lingerer melts 38**. The sink is real and measurable — 63
lifted wild monsters melted on scholar flee/loss across the band — but it explains
only 1 of the 4 recurrence vanished chains. The other 3 chains' removals (1 same-day
candidate, 2 with no scholar fight at all) are NOT explained by this sink.

## The 3 UNCLASSIFIED (why the classification leg fails, and why they change nothing)

All three are orphan-end tbEnds with empty fighters, result lost, scholar dead
(scholarHpEnd ≤ 0), no lift, no worldOrigin — the pattern of a scholar-death cleanup
tbEnd with no fighters attached:
- s75105 fightSeq 14, d82, scholarHpEnd −11.
- s75107 fightSeq 5, d42, scholarHpEnd 0.
- s75116 fightSeq 26, d160, scholarHpEnd 0 (after the suburb chain's firstAbsentDay
  159, so it cannot be the suburb removal even in principle).

Per prereg rule 2, fighters-unreadable orphans count as UNCLASSIFIED and they STAY
so — they are NOT re-labelled as non-combats to flip the leg, even though they
provably involve no beast (no lift, no worldOrigin, no fighters). They cannot affect
any chain verdict.

## Herald dissolved rows (instrument fix, not a game finding)

The first sweep left 78 UNCLASSIFIED: 75 herald fights dissolved inside startCombat
(kind start, intendedMid herald, result dissolved-no-tbend, fightersStart/End null).
The recorder's start post-record only filled lift fields for live fights and
same-call tbEnd fights; when tbfight was already over/null at post-record time,
nothing was filled. Correction #2 (committed before the re-run) fixed the recorder
to record post-start world presence of the lift object (present ⇒ lifted=false,
absent ⇒ lifted=true) and reordered dissolved classification restored-first (an
object back in the world by identity is not a melt, whatever the lift flag says,
because alias adoption can restore without tbEnd).

Re-run result: total dissolved rows 120, ALL herald (wave-4 titan). 75 classified
SCHOLAR-RESTORED (lift present at post-start, back by identity at flush — e.g.
s75102 d74 tile [4,4], three fights, herald 700 HP titan+lingering, scholar
65→63→63, restored 700 — the same object is back, it did NOT melt). 45 classified
SPAWN-ENDED (no world instance). 0 dissolved rows remain unclassified, and 0
dissolved rows are melts. The first sweep's corpus and analysis are superseded by
the re-run's and are not cited as final numbers anywhere in this file.

## Determinism

`node scripts/test-scholarmelt-a.js --determinism 75102`: pilot leg days 86,
village-lost, wave 4, won 0, natEver 0, deaths 45, fpMeetings 90, smMeetings 62,
smErrs 0 — row IDENTICAL, census IDENTICAL, DETERMINISM-PASS, scratch removed.

## Sense (transcripts read, judged for meaning — not just counts)

Transcript limitation, stated plainly: node-sim stubs Game.say to a no-op unless
narration is on, and this arm does NOT turn narration on (that would change the
substrate). Scholar tb fights therefore have NO say transcript in this corpus.
"Transcript evidence" for a scholar fight here means its structured trace (lift
snapshot, fighter HP path, tb result, post-end world check). Villager field-meeting
transcripts (w4dpr rec.log, engine-internal, not say) DO exist and were read.

All 10 villager meeting logs of the 4 chains read end to end:
- Algorithm (4): d65 Daniyar flees at 20 HP, beast 1000→971; d67 Daniyar dies,
  beast 971; d70 Dmitri dies to a 100-damage hit, beast 971→959; d71 Ursula dies,
  beast 959. No villager story removes the beast — it stands at 959 after every
  meeting. The same-day scholar melt candidate reads coherently against this: a
  standing, wounded beast met by the scholar later that day.
- Eulogy (4): d55 Aria flees, 900→877; d56 Daniyar + Terrence flee, 877→853; d57
  Aria dies, 853; d59 Daniyar flees, 853. The d57/d59 logs show the eulogy
  signature (narration-contradiction lines: "it says Aria runs — Aria advances"),
  consistent with chainclose's narration finding; the beast stands at 853 through
  the last meeting and is still on tile (4,4) in census through d61. Nothing in
  these logs removes it; its d62 disappearance has no story at all.
- Audit (1): d139 Miguel + Isabel wound 825→785, Miguel flees at 1 HP. The beast
  stands at 785 — the exact HP the scholar fight lifts the next day. The story
  hands the beast to the scholar, and the scholar trace (scholar dies, beast
  alive at 661, not restored) completes it: a melt, not a kill, not a restore.
- Suburb (1): d140 Miguel strikes once (1300→1285) and dies. The beast stands at
  1285 and then roams the census for 18 more days before vanishing with no fight
  and no story. The sense verdict matches the measured verdict: nothing explains
  the removal, and the long post-meeting wandering rules out any "died of the
  meeting wound" reading.

Sense conclusion: the villager stories are coherent and complete for what they
cover (fights that end in flight or death with the beast standing), and they
actively exclude villager removal for all 4 chains. The scholar trace completes
exactly one chain (audit). The other two non-candidate chains have a genuine gap
in the story — a beast that was standing, then was not there — which is the
unexplained-removal sink, not a narration artifact.

## Wall numbers (report-only, not judged)

Won 9/16 (all lesser seats, full 0), national ever 13, national final 11, table
reached 12, table entered 9, wave reach 1:16, 2:16, 3:14, 4:9, 5:0, median survival
118d (upper-middle convention; days sorted [31,86,90,99,102,114,115,115,118,128,
150,160,165,180,180,180]; statistical median 116.5d), deaths 527, starvation 3,
fieldparty meetings 2257. Identical to chainclose/recurrence wall numbers, as
substrate equivalence requires.

## Ranked next (for a follow-up arm, not this one)

1. **Unexplained-removal census + stalker-tick recorder (highest value).** 2 of 4
   chains (eulogy, suburb) vanish with no scholar fight and no villager story.
   Strongest non-fight candidate in code: lostSight > 6 → removeWorldMonster
   (game.js ~23158: a stalking monster that cannot see anyone for 7 turns is
   removed). Also: fledMonsters bolt/gave-up paths (~23375–23380), glasswing trap
   vanish (23108), curious watchTurns ≥ 2 glow fade (23264), titan-fall cleanup
   (titans.js:1197). A band-wide census-based disappearance census (instances
   present one day, gone the next, with no explaining fight) plus a stalker-tick
   recorder would split this sink the way this arm split the melt sink. Do NOT
   fold this into this arm's verdict — it is new instrumentation.
2. **Same-day matching window with part-stamped ordering (would resolve
   algorithm).** Prereg a window that admits same-day fights when the day's
   meeting log provably precedes the scholar fight (part-stamped day phases, or
   meeting-then-fight ordering proof as given above for s75102 algorithm). This
   is a metric change for the NEXT run, not a re-score of this one.
3. **Roster identification for unknown-wave rows.** 123 of 427 fights (29%) carry
   a primary monster id absent from src/data/monsters.json (table-trial 'finale'
   and similar). The 75 herald dissolved-restored rows are identified by
   intendedMid, but the remaining unknown-wave rows (45 spawned + 3 orphan) need
   roster mapping before their fates can be interpreted per wave.
4. **Empty-fighter orphan tbEnds.** 3 rows on the band; the pattern (scholar-death
   cleanup, no fighters) is understood but the exact tbEnd call site is not
   pinned. A tbEnd call-site recorder would let a follow-up prereg classify these
   as non-combats honestly instead of carrying them as UNCLASSIFIED.
5. **Audit census-timing documentation.** Snapshot day semantics (start-of-day
   state before that day's meetings vs day-boundary fight phase) should be pinned
   in the sweep's header comment so the next arm does not re-litigate the d140
   timing question. The audit match does not depend on it (hp-exact + unique), but
   the next arm's matching rule should state which phase a fight-day snapshot
   belongs to.

## Findings-backlog items found (reported to the coordinator; NOT appended to sim-findings.md by this worker)

- **Unexplained-removal sink class (2 chains).** Scholar tb-combat explains 1 of 4
  recurrence vanished chains; 2 chains (eulogy, suburb) have no scholar fight
  against the chain instance at any day and no villager story removing them. The
  melt sink (63 band-wide) is real but is not the whole disappearance story.
- **Herald dissolved fights are restores, not melts.** 120 dissolved scholar fights
  on the band, all herald; 75 are identity-restores (alias adoption, no tbEnd),
  45 spawned. A dissolved result must never be read as a melt without a
  post-end identity check.
- **Census snapshot timing is phase-offset.** Snapshots show pre-meeting HP on
  meeting days (audit 825 on d139, not post-meeting 785), and a d140 fight's
  instance is already absent from the d140 snapshot. Snapshot day labels must not
  be read as end-of-day state without a phase note.

## Metric review (mandatory)

- **Strict-window same-day edge.** The prereg's strict rule (lastDay < dayStart)
  excludes a same-day fight that the ordering argument shows is the only
  consistent story (s75102 algorithm, d71). The rule did its job (it prevented a
  friendly re-score), but the next arm should prereg a same-day window with
  part-stamped ordering proof rather than re-litigating this chain.
- **Dissolved/restored-first clarification (correction #2).** The original prereg
  assumed lifted was always recorded for dissolved rows; the recorder did not
  record it for over/null fights. The fix (post-start presence test) and the
  restored-first classification order are instrument corrections, not metric
  changes — but they show the dissolved branch needs its own fixture set, which
  it now has (44 checks).
- **Orphan empty-fighter rows.** Prereg rule 2 correctly keeps them UNCLASSIFIED;
  the cost is a failed classification leg on a 3-row technicality. The next arm
  should prereg a tbEnd call-site field so these can be classified as non-combats
  on evidence rather than on assumption.
- **Census snapshot timing / day-boundary phase.** The audit d140 fight vs the
  d140 snapshot absence shows snapshot day labels are phase-offset from fight
  days. Matching rules that compare fight days to snapshot days should state the
  phase assumption explicitly.
- **Unknown-wave SPAWN-ENDED rows.** 45 spawned-ended fights sit in the unknown
  wave bucket (non-roster primary ids). Their wave assignment needs roster work
  before any per-wave claim about spawned fights is made.

## Commits (worktree sim-scholarmelt-a; coordinator merges — merged locally, pending ship)

- a54df4fbe — preregistration (band, substrate legs, classification rules).
- 5701bc0a4 — prereg correction #1 (DISSOLVED-MELT fate, flush semantics).
- 5225b94a7 — instruments (recorder + sweep copy + analyzer + fixtures, 40 checks).
- 51e466685 — prereg correction #2 + recorder fix (over/null lift presence) +
  dissolved restored-first classification + fixtures (44 checks).
- 143958a29 — analyzer recurrence xcheck path fix (diagnostic only).
- Evidence + re-run corpus + analysis: committed together with this file (hash in
  the worker's final report to the coordinator; worktree shows only committed work
  at handoff).

No src/js game changes. No push, no version bump, no live verification (measurement
only). No [needs-eyes].
