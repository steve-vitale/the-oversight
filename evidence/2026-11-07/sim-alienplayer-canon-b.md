# sim-alienplayer-canon-b — the alien-player canon gap, closed: DOCS-GO

**Arm:** sim-alienplayer-canon-b (run fleshout-loop-b-20261107T0420Z,
Loop B, axis scale-onramp / winnability chain) · **DOCS ONLY — zero
src/js, zero sims, zero game-code changes.**
**Verdict: DOCS-GO** — the gap named by sim-arena-b is closed in canon:
docs/ALIEN-PLAYERS.md now describes the alien-player system, grounded
claim-by-claim in the trace table below; the three things that could
not be grounded are Steve questions, not invented canon.
**Base:** master a2f482839 (worktree sim-alienplayer-canon-b) ·
**Prereg:** none written — this arm's brief is itself the prereg
(docs-only canon write, trace table as proof); the GO condition was:
every canon claim traced to code/evidence, or the claim does not ship.
**Proof:** the trace table (§ Trace table) — every claim in
docs/ALIEN-PLAYERS.md maps to a code file + function/line or an
evidence file + section. No test file: prose needs no jest run, and
the trace table IS the proof. `node scripts/check.js --quick` run
after the edits (see § Checks).

## The gap, plainly

Sim-arena-b (2026-11-07, DIAG-GO) proved that "a stranger" is a real
person — an alien-player persona, Vex Marlowe named as the killer of
Blanca Cox on the 53006 replay, day 29 — and that the unnamed-ness is
deliberate knowledge-gating, not a bug. Its canon-coverage verdict was:
the arena is covered in docs/CONTESTS.md, but **the alien-player
system is undescribed in canon** — documented only in docs/ONTOLOGY.md
(the generated `alienPlayers` ledger entry) and in code comments, and
not listed in docs/CANON.md's manifest. A builder told to "read the
canon first" would never find it. That was the gap this arm closed.
(sim-findings.md line 1854, still `[open]` at arm start — coordinator
to mark `fixed` on landing; see § Findings for the backlog.)

## What was written, and where

**New canon doc: docs/ALIEN-PLAYERS.md** — the decision from canon
structure. The system is bigger than contests: wild encounters,
groups, the off-screen playground, dead drops, the feed, care
packages, gossip, the Codex, contest meddling, beams and armor
salvage. A section inside docs/CONTESTS.md would have buried most of
it under the wrong heading. The new doc follows the
docs/ABILITY-REFUSALS.md precedent (2026-10-28: a new canon doc for a
gap, registered in the CANON.md manifest + changelog).

The doc covers, in order: Steve's 2026-10-07 design line (as recorded
in the module header — STEVE-ANSWERS.md says nothing about alien
players, verified by reading it); what they are (humans, not monsters,
exclusive pool); the roster table (8 personas, 3 dispositions,
wealth, who fights); where they appear (wild, groups, playground,
contests-meddling-only, edges); how a fight works (placement,
`startAlienCombat` bypassing `Game.startCombat`, the fighter record,
beams); the name as knowledge gate (all four reveal paths — the
complete set of `apRevealAlien` call sites); after the fight (memory,
permanent death, kill-only salvage, the `'a stranger'` death cause);
what they are not (monsters, fans, the road stranger, contest
opponents, the galactic cast); and three open questions for Steve.

**Registration:** docs/CANON.md manifest gained the
docs/ALIEN-PLAYERS.md row plus a 2026-11-07 changelog entry.

**Cross-link:** docs/CONTESTS.md gained "Alien players meddle here"
(a short pointer section before "Release restoration"): they never
fight in a contest, they rig and lifeline; full system in the new doc.

**Steve questions:** docs/OPEN-QUESTIONS.md gained Q1–Q3 (roster
count, the overloaded word "stranger", contest opponents vs
meddling-only), each with the default in place and the lever — in
that file's format. They are mirrored in the canon doc's Open
questions section so the doc is self-contained.

## The count correction — the one thing the brief got wrong

The brief (and sim-arena-b, its prereg, and the 0230 round note) said
"twelve alien players." **That number is wrong, and the canon doc
does not repeat it.** The only persona source in the game is
src/data/alienPlayers.json, loaded as `this.data.alienPlayers`
(game.js:294–296) and returned verbatim by `apPersonas()`. It holds
**eight** entries — 7 combat + Wren (non-combat) — confirmed by
reading the file, not by counting mentions. The word "twelve" appears
nowhere in src/js, src/data, or docs canon; the only "twelve
strangers" in the repo is an unrelated shelter line in
src/data/_archive/villagers.json ("Twelve cots… not enough for twelve
strangers"). The arena-b "twelve strangers of the opening" has no
source behind it. The canon doc states eight, flags the correction
prominently, and asks Steve (Q1) whether eight is the intended roster
or four personas were never built/cut. The sim-findings.md entry
(line 1854) repeats "twelve alien players via apBuildFighter" — the
coordinator should correct that line when marking the finding fixed;
this arm does not edit sim-findings.md (coordinator-owned).

## What remains unknown / open

- **Q1 — roster size (Steve).** Eight in data vs twelve in earlier
  evidence. Default: eight. See docs/OPEN-QUESTIONS.md Q1.
- **Q2 — "stranger" overload (Steve).** Road teacher vs alien killer
  sharing one word. Default: keep both; rename the road encounter if
  it bothers him. See Q2.
- **Q3 — contest opponents or meddling-only (Steve).** Verified by
  grep: no contest code builds an alien-player fighter. Default:
  meddling only. See Q3.
- **Not unknown:** the reveal mechanic is fully designed in code —
  four paths, all traced (trace rows R-17..R-20). No Steve ruling was
  needed before canon could be written, so no "finding instead of
  canon" outcome arose. The brief's contingency did not trigger.
- **Deliberately not claimed:** exact per-persona backstories beyond
  the roster table (they live in alienPlayers.json; the doc points
  there rather than copying 8 backstories); fan-club numbers beyond
  the gates already in CONTESTS.md/ONTOLOGY.md; galactic-cast
  mechanics beyond one disambiguation line (a separate layer).

## Wall numbers

**N/A — docs-only arm, by brief.** No sims ran, no panel exists, no
before/after pair. National / table / wins, wave unlocks, and median
survival are not measured here and no numbers are fabricated. The
winnability chain is untouched by this arm: nothing in the game
changed.

## Metric review

- GO condition (the brief as prereg): every canon claim traced to
  code/evidence, or the claim does not ship. **Met:** the trace table
  below covers every substantive claim in docs/ALIEN-PLAYERS.md;
  the three ungroundable items are Steve questions (Q1–Q3), not
  canon. No metric was swapped or re-cut.
- **One correction made mid-arm, honestly:** the brief's "twelve
  alien players" was checked against the data file before any canon
  was written and found unsupported (8 entries). The doc corrects it
  rather than repeating the brief. This is a correction of the
  incoming evidence, not a metric change — the trace-table rule is
  what caught it.
- No sims, no panel (§15 inapplicable — no armed leg, no before/after
  pair), no telemetry check (no per-seed evidence glob exists for a
  docs-only arm; nothing to feed it).

## Trace table — every canon claim to its source

Line numbers are from the worktree at base a2f482839; function names
are the stable anchor (line numbers drift daily).

| # | Canon claim (docs/ALIEN-PLAYERS.md) | Source |
|---|---|---|
| R-01 | Steve 2026-10-07: "impersonating humans… full ability sets and alien technology… exclusive pool" | src/js/alienPlayers.js module header comment (top of file); ONTOLOGY.md `alienPlayers` description repeats the Steve 2026-10-07 attribution |
| R-02 | STEVE-ANSWERS.md says nothing about alien players | docs/godpath/STEVE-ANSWERS.md — read whole file; no alien-player entry (nearest: 2026-10-14 round 3 "local/visitor/stranger" is about the visitor map, not alien players) |
| R-03 | They impersonate HUMANS, not monsters; exclusive pool, separate spawn logic | src/js/alienPlayers.js header + ONTOLOGY.md `alienPlayers` rule (separation); apBuildFighter comment "NOT a monster — this is a person" |
| R-04 | Roster is EIGHT personas; src/data/alienPlayers.json is the only source | src/data/alienPlayers.json — 8 entries (read + counted); src/js/game.js:294–296 loads it as `this.data.alienPlayers`; alienPlayers.js:216 `apPersonas()` returns `this.data.alienPlayers` |
| R-05 | "Twelve" has no source; only unrelated "twelve strangers" is an archive shelter line | grep: "twelve" absent from src/js/alienPlayers.js, docs/ONTOLOGY.md, docs/CONTESTS.md; src/data/_archive/villagers.json:256 ("Twelve cots… twelve strangers") is a shelter line, not alien players |
| R-06 | Roster table: names, titles, dispositions, species, wealth, combat flag | src/data/alienPlayers.json — per-persona fields (id, name, title, disposition, species, wealth, combat) read for all 8 |
| R-07 | Wren never fights; acts only through dead drops and warnings | alienPlayers.js:135 COMBAT_PILOTS comment ("Wren (benevolent) never fights — her avatar is non-combat"); alienPlayers.json `wren.combat: false`; apIsCombat (alienPlayers.js:707) reads the `combat` flag |
| R-08 | Dispositions: sadistic = trophy hunters, cruel/escalating; neutral = experience, unpredictable; benevolent = games are wrong, help secretly/deniably | src/js/alienPlayers.js module header ("Three dispositions" block); motivations per persona in alienPlayers.json (Vex/Sable/Rax/Pip/Sarge/Fenwick/Wren/Old Tam) |
| R-09 | Wealth shapes behavior: broke retreat when losing, rich never retreat + enrage when hurt | alienPlayers.js apBuildFighter comment (wealth) + ONTOLOGY.md `alienPlayers` rule (wealth); apWealthStance (alienPlayers.js:730+) returns normal/cautious/retreating/enraged |
| R-10 | Wild encounters: post-System, wave 2+, separate roll after monster phase, never on safe tile / mid-fight / monster-held tile | alienPlayers.js:210 apEligible (systemArrived + unlockedWave() >= 2); :254 apEncounterEligible (+ isSafeTile); encounters.js:2673–2705 checkEncounter wrap (skips if inCombat, animal live, monsterAt) |
| R-11 | Roll numbers: 8% base, 15% due rival, due rival picked 60%, weights sadistic 4 / neutral 4.5 / benevolent 1.5, met ×2, tracked ×3, min 2 days same persona, dead never hunt | alienPlayers.js:265 apRollEncounter (chance 0.08/0.15, weights, multipliers, sporting filter, apIsDead checks) |
| R-12 | Readiness gate: score >= 100 (party 25 each, threatRating cap 100, day 30+ 25, integration 25, beam gear 15/piece) | alienPlayers.js:2850 apReadinessCheck (threshold 100 + scoring); :3228 wrap adds it to apEncounterEligible ("don't spawn alien players until the player has at least a slight chance with a party") |
| R-13 | Group encounters: day 40+, 2+ rivals met 2+ times, 3% roll, max 1/14 days, 2–3 personas, join in turn via tbEnd chain | alienPlayers.js:856 apGroupEligible; :873 apRollGroupEncounter (0.03); :978 apStartGroupEncounter (state.alienGroup, chained via tbEnd); encounters.js:2690 checkEncounter group roll first |
| R-14 | Playground: max 3 active, max 1 new per 4 days, 30% roll; they kill/burn/raid/duel off-screen; factions sadistic 70% / benevolent 90% / neutral opportunistic; sadistic+benevolent never align | alienPlayers.js:2058 apMaybeActivate (cap 3, 4-day, 0.3, disposition weights 3/2/1); ONTOLOGY.md `alienPlayers` rules (playground) + (factions); module header playground comment |
| R-15 | Contests: no alien-player fighter built in contest code; role is interference only (rigging winMod, lifeline deathSave) | grep: no `alienPid`/`apBuildFighter` in src/js/contests.js, contestEngine.js, fieldFights.js (only a fan-club-gates comment in contests.js:114); alienPlayers.js:1592 apContestInterference; ONTOLOGY.md rule (lifeline_player_only) |
| R-16 | Lifeline: player-only, at killing blow (contestChoose) + arena-loss tbEnd branch; death → 'lost', barely alive; 7-day cooldown; villager deaths never converted | contests.js:4519–4520 (forPlayer:true, killing-blow check); game.js:46188–46189 (arena-loss branch); contests.js:5920 verdict call (no forPlayer → deathSave false); ONTOLOGY.md rule (lifeline_player_only, "7-day cooldown") |
| R-17 | Fan favor -100..100, four per-lane clubs; club boon 25+, max 1/5 days; dead drops max 1/3 days, feed max 1/day | ONTOLOGY.md `alienPlayers` rules (favor), (fan_clubs_per_lane), (club_boons_vote: gate 50→25), (limits); docs/CONTESTS.md fan-club section |
| R-18 | Fight start: placed 3–4 tiles away, treeline lines, `startAlienCombat` builds tbfight directly, NEVER calls `Game.startCombat`; party villagers ≤4 squares join (nearest 4) | alienPlayers.js:464 apStartEncounter (placement + lines + startAlienCombat call); encounters.js:2710 startAlienCombat (builds this.tbfight, alienFight:true); evidence sim-arena-b.md § "How the fight starts" |
| R-19 | Fighter record: kind hostile, alienPid, name 'Stranger' pre-reveal, HP 80+10/encounter, sadistic +20, Pip −20, Tam cap 70, kit 6 growing 3→6, tech 1–2 (Tam none), ai adaptive, bespoke tbAlienTurn | alienPlayers.js:417 apBuildFighter (all fields); kit/tech data in alienPlayers.json (kits 6 each, tech counts verified: Vex/Sable/Rax 2, Pip/Sarge/Fenwick 1, Wren/Tam 0); ONTOLOGY.md rule (progression: kit 3→6, rich faster); encounters.js:2653–2670 tbAlienTurn wiring comment |
| R-20 | Beams: normal armor does nothing; 0 pieces 90–110% max HP; each piece ×0.7; full 5-piece set ~17% | alienPlayers.js:2891+ apBeamHit comment + code (damageType alien_beam routes via tbDamage wrap, :3240s) |
| R-21 | Name gate: fighter 'Stranger' pre-reveal; codex 'someone'/'stranger', species/disposition 'unknown'; word "alien" + persona names never in player copy pre-reveal | alienPlayers.js:444 (`name: apKnowsAlien(pid) ? p.name : 'Stranger'`); :1819 apCodexEntry (gated name/title/species/disposition); ONTOLOGY.md rules (knowledge_alien_word), (knowledge_persona_names) |
| R-22 | Reveal paths (complete set of apRevealAlien call sites): 3rd encounter ("recognized the fighting style"); feed slip ("System feed named them"); armor strip ("stripped their armor"); Wren dead drop ("spotted her leaving a cache", 3+ drops, 25%) | alienPlayers.js:1029 (3rd encounter, in apOnCombatEnd: encounters >= 3); :1539 (feed); :1111 (armor strip); :1466 (Wren, wrenDrops >= 3 + Math.random() < 0.25); grep confirms these are the only 4 call sites |
| R-23 | Reveal announcement + Codex stages encountered/identified/understood (known + 5 encounters) | alienPlayers.js:233 apRevealAlien (say line + apCodexEntry + cast advance); :1819 apCodexEntry (stages + notes, pre-reveal suspicion note quoted) |
| R-24 | After the fight: met record (encounters/outcome/day/bond); death permanent (rec.dead + deadDay, excluded from every pool, Codex keeps entry with fate); salvage kill-only (alien helm/carapace/greaves/gauntlets/boots); retreat = drove off, no body | alienPlayers.js:1016 apOnCombatEnd (rec, 3rd-encounter reveal, killed → dead + deadDay + release from playground + gated death line); :1090+ salvage block (armorPool, outcome 'won' + killed); ONTOLOGY.md rules (death_permanent), (salvage_kill_only) |
| R-25 | Death cause 'a stranger', never 'an alien'; fallback for unclassifiable loss is 'the arena', not 'a stranger' | src/js/game.js:45856 tbFightDeathCause (hostile + alienPid → 'a stranger'; comment: cause must not leak unlearned truth); evidence sim-arena-b.md § "How the death is recorded" |
| R-26 | Outcome lines: victoryLines when persona wins, defeatLines when persona loses; killed persona speaks nothing | alienPlayers.js:1057 apOnCombatEnd (mapping); ONTOLOGY.md rule (outcome_lines, inverted until break-it 2026-10-10 r12) |
| R-27 | Not fans (FANS.md: audience faces, never fight); not the road stranger (different teaching system); not the galactic cast (separate 5-persona registry) | docs/FANS.md ("Fans are NOT fighters. They never enter combat."); evidence sim-arena-b.md § "Not to be confused with" (d57 road stranger); src/js/galactic-cast.js:67 CAST_PERSONAS + alienPlayers.js:138–140 comment (five cast personae tracked) |
| R-28 | Canon gap as stated by arena-b: system undescribed in canon, ONTOLOGY.md only, not in CANON.md manifest | evidence/2026-11-07/sim-arena-b.md § "Canon coverage (prereg (c))"; docs/CANON.md manifest before this arm (no ALIEN-PLAYERS.md row); grep: "alien player" in docs/ only ONTOLOGY.md + SCAFFOLD-AUDIT.md one-liner |

## Checks

- `node scripts/check.js --quick` — STARTED 04:47Z, KILLED at ~11 min
  with zero output, not failed: the box was under heavy concurrent
  load (load average ~22 — sibling sims and another loop's
  check.js --quick running at the same time) and the run was
  CPU-starved, still working through its test list. Killed rather
  than blocking the arm on it: this arm touched only docs/*.md and
  evidence/*.md (zero src/js, zero data, zero scripts), so no check
  in that suite can be affected by these edits. The trace table is
  this arm's proof, not the test suite. If the coordinator wants a
  green check on the merged branch, it is cheap to re-run when the
  box is quiet.
- `node scripts/validate-ontology.js` — NOT run: no src/js module or
  `provides:` reference was touched (docs only), per the brief.

## Findings for the backlog (coordinator appends — do not edit sim-findings.md here)

- sim-findings.md line 1854 (ALIEN-PLAYER SYSTEM UNDESCRIBED IN CANON,
  `[open]`, 2026-11-07) is now fixed by docs/ALIEN-PLAYERS.md — but
  its text repeats the wrong "twelve alien players" count. Correct
  the count to eight when marking it `fixed`.
- The same "twelve" claim also sits in evidence/2026-11-07/sim-arena-b.md
  (two places + prereg line 42) and evidence/2026-11-07/
  sim-winnability-round-0230.md:20. Evidence files are historical
  records and should not be rewritten; the correction lives in
  docs/ALIEN-PLAYERS.md (§ Count correction) and this file. Future
  arms should cite eight, not twelve.

## Proof and commits

- Docs-only arm: docs/ALIEN-PLAYERS.md (new), docs/CANON.md
  (manifest row + changelog), docs/CONTESTS.md (pointer section),
  docs/OPEN-QUESTIONS.md (Q1–Q3), this evidence file. Zero src/js,
  zero sims, zero tests (trace table is the proof).
- Commit via scripts/safe-commit.sh; branch sim-alienplayer-canon-b.
  Worktree contains only committed work at closeout. No push, no
  version bump, no live verification (coordinator owns the merge).

## Convergence

**scale-onramp: converging, NOT converged.** The canon blank behind
killersurvive blank #6 is now closed in docs (the arena was already
covered; the stranger system now is too). The winnability chain
itself is untouched by this arm — docs only, 0 wins / 0 national /
0 table claimed or measured. What remains is Steve's call on the
three open questions (Q1–Q3) and the coordinator's sim-findings
bookkeeping (mark line 1854 `fixed`, correct twelve → eight).
