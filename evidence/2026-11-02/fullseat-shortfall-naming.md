# Full-seat shortfall naming — gap round 2026-11-02, item 2 [needs-eyes]

## The gap

The Nov 2 scale-onramp round (seed 97339, `evidence/2026-11-02/
fullseat-97339-analysis.json`) sat on a LESSER seat with every full-seat
bar met except wave-4/5 deeds (0 of 3, 0 of 2) — and heard NOTHING about
the full seat. The Haven offer named the lesser seat; the audit named the
lesser counts; no surface named what a full seat still wants. A player in
that position could not learn, from the game, what stood between them
and the full seat.

## What was built (voicing only — no gate, price, or requirement changed)

`Game.fullSeatShortfall(seat)` (`src/js/table.js`, next to
`tableSeatLine`): a pure naming function over `deedGateReady()`'s own
bars — 5/5/4/3/2 distinct monsters faced per wave, 3 contests survived,
3 crises weathered, national/global standing, integration stage 2, and
the two food-thesis deeds. It returns `{ ready, missing, line }`; when
the full seat is earned, `line` is empty, so a full seat's text never
changes. It writes no state (the food-thesis split is read defensively
from `scholar.prog`, never created), so an audit call cannot mint a deed.

It names each missing piece in plain words, with counts, in fixed
order (waves 1–5, contests, crises, standing, integration, food):

- `only 0 of 3 different wave-4 monsters faced`
- `only 0 of 2 different wave-5 monsters faced`
- `only 2 of 3 contests survived` / `only 2 of 3 crises weathered`
- `standing is regional — the full seat asks for national standing or higher`
- `integration too shallow (stage 1 of 2 needed)`
- `the keepsake lesson has not yet been taught`
- `a feast surge has not yet been spent in a real fight`

Joined as: `For a full seat, the ledger still wants: <pieces>.`

The two food-thesis halves are named separately (the keepsake lesson vs.
a feast surge spent in a real fight) because they are different deeds in
play; when the live split cannot be read, it falls back to the combined
wording (`the food-thesis deeds are unfinished`) rather than guessing.

## Where the player sees it

1. **Haven offer** — `tablePreview()` now carries `fullReady` and
   `fullShortfall`, and the Haven panel (`src/js/app.js`, the Table
   block) prints the line under the seat line, above the Take-your-seat
   button. Button behavior, gating, and doors are untouched.
2. **Table audit** — `tableScene()` says the shortfall line right after
   the seat line, on a LESSER seat only. A full seat has nothing missing
   (no line); a missing seat is withdrawn above with its own nearer
   bars already named (see boundary below). The old seat line itself is
   byte-unchanged.

## Proof

`node scripts/test-fullseat-shortfall-20261102.js` — ALL GREEN.
On identical constructed states (real deed/prog maps, no stubbed gate):

- BEFORE: the unchanged `tableSeatLine()` for a lesser seat never
  mentions a full seat; for the Nov 2 state it mentions neither wave-4
  nor wave-5 — the reported silence, reproduced.
- AFTER: `fullSeatShortfall()` names EXACTLY the missing piece(s) for
  14 cases — the Nov 2 regression (exactly the 2 wave entries), each
  wave 1–5 short in turn, contests short, crises short, standing short,
  integration short, each food-thesis half short, both halves short —
  and names nothing when all bars are met. The no-argument (live) path
  agrees with the seat-argument path in every case.
- OFFER: `tablePreview()` on a lesser seat carries the same line
  (`fullReady` false); on a full seat it carries `''` (`fullReady` true).
- AUDIT: `tableScene()` on the Nov 2 lesser state says the shortfall
  line aloud (with both wave counts); on a full seat it says no
  shortfall line, and the full-seat line still speaks.
- GATES UNCHANGED: `deedGateReady().ok` and `tableSeat().seat` match the
  old bars in every case (short at need-1, earned at need).

`node --check` passes for both edited files. jest and check.js were NOT
run (coordinator runs check.js --quick serialized at merge, per brief).

## Plain-words meaning (what a player sees and learns)

A player holding a lesser seat now sees, in Haven and again at the
audit, exactly what the full seat still asks for — e.g. "For a full
seat, the ledger still wants: only 0 of 3 different wave-4 monsters
faced; only 0 of 2 different wave-5 monsters faced." They learn the
missing deeds by name and number, instead of sitting on a lesser seat
wondering why the full seat never comes. Nothing about what the full
seat REQUIRES changed — only that the game now says what is missing.

## Deliberate boundary (not a gap left by accident)

A run holding NO seat at all still hears the existing once-per-run
seat-waiting beat, which names the nearer LESSER bars
(`progression.js` checkArc, proven by
`test-seat-waiting-honesty-20261023.js`, untouched). Listing the full
bars there too would stack two different goalposts in one beat and
muddy the nearer goal. Once such a run earns its lesser seat, both new
surfaces name the full shortfall. The function itself already covers
no-seat states exactly, so a future surface can reuse it unchanged.

## Files

- `src/js/table.js` — `fullSeatShortfall()`, preview fields, audit line
- `src/js/app.js` — Haven panel prints `tp.fullShortfall`
- `scripts/test-fullseat-shortfall-20261102.js` — proof test
- `evidence/2026-11-02/fullseat-shortfall-naming.md` — this note

Branch: `gap-seatshort` (worktree `~/workspace/worktrees/gap-seatshort`).
No merge, push, bump, or live verification — coordinator's job.
