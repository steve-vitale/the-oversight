# OPEN QUESTIONS for Steve

Only questions **not already answered** in `docs/godpath/STEVE-ANSWERS.md`.
Check that file first. When Steve answers, copy his words there (dated) and
delete the question here. The early-October list is archived in
`docs/_archive-OPEN-QUESTIONS-2026-10-03.md`.

Format: question, the default in place now, and where the lever is.

**Q1 (2026-11-07, sim-alienplayer-canon-b) — Alien players: is eight
the intended roster, or should the pool grow?** Default: eight personas
in src/data/alienPlayers.json. Earlier evidence said twelve, but no
code, data, or canon source supports twelve. Lever:
src/data/alienPlayers.json (data first, per repo rule). See
docs/ALIEN-PLAYERS.md, Open questions Q1.

**Q2 (2026-11-07, sim-alienplayer-canon-b) — The word "stranger" is
overloaded: road teacher vs alien killer. Intended?** Default: both
systems keep the word — the road stranger teaches, the alien player
kills, and only the death cause `a stranger` names the killer. If the
overload is a problem, the road encounter is the one to rename (the
alien branch is load-bearing: death records, Codex, and
knowledge-gating all key off it). Lever: the road-stranger encounter
copy (encounters.js road text) — a prose change, not a system change.
See docs/ALIEN-PLAYERS.md, Open questions Q2.

**Q3 (2026-11-07, sim-alienplayer-canon-b) — Should alien players
ever fight IN a contest, or is meddling-only the design?** Default:
meddling only — they rig outcomes and can lifeline the player, but no
contest code builds an alien-player fighter, so they never appear as
contest opponents. Blood contests stay monster-vs-human and
human-vs-human. If Steve wants them in the arena as opponents, that is
a new wiring task, not a tuning change. Lever: docs/CONTESTS.md arena
specs + contests.js `_contestArena`. See docs/ALIEN-PLAYERS.md, Open
questions Q3.
