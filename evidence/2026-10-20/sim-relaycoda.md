# sim-relaycoda — branch-agnostic relay win coda (2026-10-20, oversight-flesh-out-loop)

run_id: fleshout-20261020T0215Z (sim-relaycoda worktree)
Blank (findings backlog, sim-findings.md:682): [open] 2026-10-20 —
narration/sense — BRANCH-AGNOSTIC RELAY CODA NEEDED (flesh-out loop A run
fleshout-20261020T0015Z, sim-wincoda follow-on): the seven path-specific win
codas landed 2026-10-20 each assume one walked path; the relay walk still
needs a branch-agnostic coda that does not name a fixed door. Naming which
branch is the open voice question.

[fixed 2026-10-20 by flesh-out loop arm sim-relaycoda, run fleshout-20261020T0215Z]

## PRE-REGISTRATION (binding — docs/MEASUREMENT.md §14, written before any sims)

- PRIMARY (GO requires all three):
  1. The coda fires on relay walks through the REAL table flow
     (Game.tableEpilogue → this.tableState().path, no stubs) on ≥2 seeds.
  2. SENSE-READ passes — the relay finale transcripts are read
     aloud-equivalent and judged for meaning and coherence; the line must
     never name a fixed door/branch (18 anti-pins enforced in code).
  3. DET-GATE: identical-seed epilogue transcripts byte-identical armed vs
     control EXCEPT exactly the coda line (voice-only, no behavioral change).
- A miss on any = NO-GO, honestly.
- No before/after balanced panel: this run changes no mechanics — it is a
  voice-only change (one template literal), so §§9–12/15 panel machinery is
  not applicable; the det-gate is the guardrail.

## Method

1. Read docs/CANON.md, then docs/TABLE.md (relay = "enter the matrix"; the
   System is the *relationship*; GRADIENT law: tender/light ≥+40, total/dark
   ≤−40, grey middle; light final "become its champion", dark final "become
   its voice (you stay inside, forever, and it learns your name first)",
   grey finals "both-hands" / "the-contract"; common ground: "both are
   caretakers failing at caretaking"; TABLE.md law 7: "Integration is two-way").
2. Wrote scripts/test-relaycoda.js (firing fixtures + 18 branch/door
   anti-pins + identity anchors + det-gate dump/compare).
3. Captured the control dump (16 seeds × 3 branches) pre-edit.
4. Edited ONLY the relay coda line in src/js/table.js — one template
   literal, zero RNG draws, zero logic change.
5. Ran the proof GREEN (202/202); captured the armed dump; byte-compared.

## Why the landed coda had to go (sense diagnosis)

The landed relay coda:
"◈ {name} walks out of the light accompanied — the System learned {pro} name
first, and it keeps saying it inside the wire while {pro} goes home."
- "the System learned {pro} name first" is the DARK final's own payoff
  (TABLE.md: "become its voice... and it learns your name first") — it names
  a fixed door.
- "walks out of the light ... goes home" is the light/grey exit; the dark
  bearer "stays inside, forever" — it names the other door.
- Pronoun bug in the landed line: with a male bearer, pro="he" produces
  "the System learned he name first" (observed on seed 1, Darius Bauer).
  The new construction avoids the pronoun-possessive entirely.

## GREEN

202/202 passed, 0 failed:
- Exactly one relay coda fires through the real table flow on all 8 seeds.
- The SAME line fires for branch light, dark AND grey on each seed —
  branch-agnostic by evidence, not by assertion alone.
- One coda shape across 8 seeds (name/pronoun only).
- All 18 anti-pins pass (champion / fights-for-Earth / become-its-voice /
  name-first / stay-inside / inside-forever / favorite-instrument /
  both-hands / the-contract / middle-road / door-gift / hand-is-forward /
  walks-out / does-not-walk-out / go-home / light-dark-grey-final /
  tender).
- Relay identity carried: light, machine, conversation, channel, caretaker.

The landed line:

"◈ {me} reached into the light and the light reached back — person and
machine, two caretakers, holding the channel open between them both ways.
The village endures, and the conversation does not end."

### Sense read (SENSE-TESTING LAW — read aloud-equivalent)

- "reached into the light and the light reached back" — the relay is the
  relationship path; TABLE.md law 7: "Integration is two-way." Reciprocity is
  the path's core verb. The light reaching back is the System "genuinely
  trying, slightly wrong" — its own register — without naming any branch.
- "person and machine, two caretakers" — TABLE.md's own common ground:
  "both are caretakers failing at caretaking... fellow strugglers at the
  same impossible job." This is the relay's thematic identity, shared by all
  three bands.
- "holding the channel open between them both ways" — faithful carry, the
  living relationship. It reads honestly for every final: champion (it
  fights for Earth, the channel open), voice (inside, the channel open),
  both-hands (both hands, the channel open), the-contract (the signed
  contract's living channel). No exit claim, no "stays inside" claim.
- "The village endures, and the conversation does not end" — the landed
  coda's closing, kept verbatim: the System comments aloud (commune verb),
  the conversation is the path. Warm, joyous RPG-overlay note, same as the
  other six codas' "The village endures" framing.
- Anti-pin verdict: nothing in the line commits to light/dark/grey, to any
  of the four finals, or to walking out vs staying inside. The open voice
  question (naming which branch) stays open BY DESIGN — one line, all doors.

## DET-GATE (guardrail)

16 seeds × 3 branches = 48 transcript pairs, armed vs control on identical
seeds: byte-identical EXCEPT exactly the coda line in every pair. The one
differing line is the new branch-agnostic coda. Zero RNG draws added (one
template literal in the winCodas map); the RNG stream cannot move.

## Sibling-proof update (same commit, design-change rule)

scripts/test-wincoda-20261019.js (the landed arm's proof) broke because its
coda regex assumed every coda opens "walks out of the light" and its relay
imagery anchors assumed "name" — both assumptions the branch-agnostic design
intentionally drops. Updated in the same commit per the repo rule ("If one
breaks because the design changed on purpose, update the test in the same
commit"): codaOf + name-normalization accept "reached into the light"; relay
anchors → ['machine','light','conversation','channel','caretaker']. Re-run:
81/81 green, no sentence shared between any two codas (the check runs and
passes).

## METRIC REVIEW (§14)

- The primary is a voice/sense metric, not a balance metric — it cannot be
  gamed by re-scoring, and no friendlier metric was substituted.
- The det-gate is the honest guardrail for a zero-mechanics change: 48/48
  pairs differ only at the coda site.
- Known limitation (not a miss): when a relay bearer wins WITH ascensions or
  facilitation, the ARCHITECT/OUTSHONE/PANTHEON beats carry the epilogue, not
  this coda — unchanged.

## Verdict

GO. Primary green (202/202 + 3/3 det-gate), guardrail green (48/48), zero
game-code changes outside the one coda line, sibling proof restored green,
[needs-eyes] on the commit for Steve's phone (player-facing finale voice).

## Findings backlog check

This run claimed sim-findings.md:682 — now fixed. No new backlog items
surfaced.

## Convergence note

This run is a backlog narration claim, not the scale-onramp axis work.
scale-onramp remains the blocking axis (standing directive holds). No
convergence movement this run.
