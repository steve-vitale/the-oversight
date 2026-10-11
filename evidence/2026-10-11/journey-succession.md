# Playtest loop 2026-10-11 — journey leg 7: SUCCESSION (queue jump)

Rotation said idx 0 (landing) but leg 0 was already played today with 3 seeds + 3
fixes merged (evidence/2026-10-11/journey-landing.md). Queue jump per the body:
commit ea939bc7 landed 4 min before this run — the succession inheritance build
(mantleOf handoff, inherited threads naming the predecessor) had zero
sense-testing. This run sense-tests it. Rotation file stays 0 (= (7+1) mod 8).

## What was played
`scripts/journey-succession.js` (previous run's harness, reused) — SEEDS=201-205,
22 days as a competent player, bearer killed through the REAL `Game.playerDeath`,
18 more days as the successor. All 5 seeds completed; all 15 mantle-pass
invariants held (no auto-transfer of gear, sentimentals buried, fresh body,
codex + system abilities kept, trust discounted, identity sync). Village-lost
path verified (over=true, villageLost=true when nobody remains).

## Village assessment (plain words)
The mantle passes every time and the village keeps being a village. Nobody's
first death breaks the machinery: codex breadth kept (14→20 plants across the
run), the pantry keeps feeding people, abilities keep their slots. But the
world is dangerous: seeds 201 and 205 lost three bearers in 40 days (combat,
monster, starvation) and seed 205's village wiped out entirely by day 40 —
wave-1/2 lethality against the competent policy is honest (real fights, real
causes in the fallen roll), not a bug. Notable: the new bearer starts with
discounted trust and must re-earn every face — one successor (Sofia, trust 1)
starved day 31 despite a 23k pantry; that's the sim policy not feeding a
low-agency stranger, and it reads as fair.

## People check (SENSE-TESTING LAW — lines read raw, not counted)
- Death beat is strong: "Luis is dead. You didn't ask. It knew." / "You're not
  Luis. No heat in it. Just fact." / the System's unhinged mantle-transfer
  announcement. No phantom cast (arm-grab goes to the highest-trust villager).
- Inherited favor re-ask is PERFECT: "I asked Luis about the forage sweep —
  Luis's gone. Still need hands. Are you in?"
- Inherited memory is PERFECT: "Luis didn't have to do that. I haven't
  forgotten." / "Luis never got to make that right. It's not yours to carry —
  but I remember." No fabricated shared history; the new face is never
  pretended into the room.
- Thread resume is good: YOU: "About a hard time — that was Luis's thread.
  We never finished." NPC: "Yeah... where were we with that."

## Blanks FILLED (worktree, proof-tested before/after)

### F1 — Resume opener stuttered (conversation.js:1157)
The `whyLine` for 'unfinished business' was "we never finished", doubling with
the template's "never finished talking about X": "Luis and I never finished
talking about the water thing — we never finished." Now "we left it
mid-thought" (fixes inherited + same-bearer branches alike).
Proof: `scripts/test-succession-opener-coherence.js` — RED pre-fix, GREEN
post-fix (both branches).

### F2 — Ghost-trial death line repeated per case (betrayal.js:869)
Bearer accused in two open cases heard "X is gone — the moot doesn't try the
dead. The case dies with the accused" TWICE back-to-back (seeds 201, 204).
Now: cases close first, the line fires ONCE ("The cases die with the accused"
plural, "The case dies" singular); every case still resolves accused_died with
its own journal note.
Proof: `scripts/test-ghost-trial-dedup.js` — RED pre-fix (said 2x), GREEN
post-fix (1x, plural/singular copy both verified).

### F3 — Release-blocking ontology error (hierarchy.js, sibling's landed commit)
`validate-ontology` failed on `grief_coalesces`: the rule spanned 4 comment
lines but the parser only reads `- ` lines, so the (code:) citation on the
last line was dropped. Rejoined to a single `- ` line. Validator now 72/72
green, "Release permitted."

## Reachable / fun / winnable
- Reachable: yes — death, mantle pass, village-lost, and the inherited-line
  rendering all fire through real paths.
- Fun: yes — the death beat and the inherited lines are the good stuff; the
  two stutters fixed this run were the only false notes.
- Winnable: yes for the leg — the mantle chain survives multiple deaths; a
  real player keeps everything the village earned.

## Regressions (on the landed tip, sequential)
- New proofs: test-succession-opener-coherence GREEN; test-ghost-trial-dedup
  GREEN (both RED→GREEN verified)
- test-succession-inheritance: ALL GREEN · test-betrayal: 80/80 ·
  test-moot-justice-aftermath: 27/27 · test-betrayal-fixes-20261008: 13/13 ·
  test-dialog-gating/leakfix/coherence(37/37)/stream(43/43): green ·
  validate-ontology: 72/72
- Pre-existing (not mine): test-midnight-burn crash, test-day-night 40/2, etc.
  (see journey-landing.md) — untouched.

## Incident (recovered, no work lost)
Mid-run I reached for `git stash push -- <file>` with bad flag syntax (failed),
then a bare `git stash pop` merged a sibling's ANCIENT 2026-10-06 WIP
(visitorHtml trader wares) into this worktree — conflicts in 5 files I never
touched. Recovered: `git checkout HEAD --` the 5 conflicted files +
docs/ONTOLOGY.md (all stash pollution), verified my 3 diffs byte-clean, KEPT
the stash entry. Lesson (new, for AGENTS.md): NEVER git stash/stash pop in a
worktree — stash stack is repo-global; for before/after tests use file swap
(`cp` aside, `git checkout HEAD --`, test RED, restore, test GREEN).

## Flags for other loops
- Sim loop: bearer mortality under the competent policy (3 bearers/40d in 2/5
  seeds) — honest lethality or policy recklessness? Lever question, not a bug.
- Break-it loop: ghost-trial closure now dedups — the old per-case say could
  be probed for other repetition-shaped holes.

Merged locally as 65989b98 ("merged locally, pending ship" — ship loop owns
pushes; [needs-eyes] on player-facing copy). Worktree released; main tree clean.
