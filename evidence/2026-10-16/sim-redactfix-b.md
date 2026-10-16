# sim-redactfix-b — hygiene: replace literal redacted tokens in comments (2026-10-16)

- run: fleshout-loop-b-20261016T0753Z, ARM 2 of 3 (sim-redactfix-b)
- axis: food-economy; assignment: sim-findings #402 (hygiene blank)
- scope: 17 byte-verified literal 10-char tokens across 7 files. Did NOT touch
  src/js/game.js or src/js/corpses.js (owned by sibling workers this run).

## Protocol followed (strict byte protocol, per brief + AGENTS.md 2026-10-13)

1. Counted tokens at byte level with node (indexOf on raw Buffer-decoded text):
   relay-dialogue.js 7, nomad-drive.js 5, convo-scene.js 1, convo-wants.js 1,
   nomad.js 1, app.js 1, journal.js 1 = 17. Matches the brief exactly.
2. Confirmed each sits on a comment-only line (whitespace then `//` before the
   token; verified at byte level, not by display — see false alarm below).
3. Replaced via a node script that asserted comment-only per line and refused
   anything in a string or code path. No replacements were guessed as
   credentials; each is a prose word fitting the comment's own context.
4. Verified after every write: token count, hex of each replaced region,
   `node --check` on all 7 files, and a programmatic diff audit.

## Per-file replacements (line: word)

- src/js/relay-dialogue.js — 7
  - 68: "has" (locket / learned-the-ability / done-the-deed clause)
  - 79: "actually" (keepsakeName doc)
  - 140: "before" (needs-gate premise vs pickNext rotation)
  - 286: "of" (chk-sanctuary: accuses ... a closed room)
  - 307: "about" (chk-argument: confronts ... rewriting)
  - 362: "actually" (light-locket: real keepsake, sense-pass)
  - 477: "does" (pickNext: "does have the locket" clause)
- src/js/nomad-drive.js — 5
  - 37: "fights" (real_choice doc: duel through fieldFight)
  - 370: "alone" (fightKin doc: solo fighter vs their kin)
  - 475: "steps" (duelKin doc: "steps up alone", it's personal)
  - 483: "dies" (vDie outcome: -> nomadKill)
  - 485: "goes" (vFlee/evade outcome: "goes down" -> 'changed')
- src/js/convo-scene.js — 1: 349: "someone" (inherited thread: "someone else's
  unfinished business")
- src/js/convo-wants.js — 1: 571: "about" (inherited ask: "re-asks ... about it")
- src/js/nomad.js — 1: 202: "villagers" ("all non-bearer villagers" leader pool)
- src/js/app.js — 1: 15257: "carries" (alien-pool conditions doc)
- src/js/journal.js — 1: 275: "=" ("THE [role] = THE PAGE"; matches the known
  2026-10-13 corruption where `=` was the eaten token)

## Skipped instances

None remaining. One near-skip worth recording:

- nomad-drive.js:37 was first skipped by the fixer script's naive quote-parity
  check — the line contains an apostrophe ("BEARER's own kin") before the
  token, which tripped the guard. Byte-level re-verification confirmed it is
  comment-only (leading `//`, whitespace-only before it), so it was fixed with
  a line-targeted sed and hex-verified ("fights the kin through" present).

## False alarm worth recording for future runs

The DISPLAY layer redacts "bearer <any-word>" in tool OUTPUT (not just on the
write path). Concretely: journal.js:276's real bytes are "...bearer could
never..." but every displayed read showed "...bearer [token] never...". A
mid-run verification script therefore "found" a token that never existed in
bytes, and a computed boolean printed as the token string in stdout. Hex dumps
(`Buffer.toString('hex')`) are immune and are the only trustworthy check.
Future hygiene runs: verify with hex/counts only; never trust rendered text
containing the role word.

## GO criteria (binary) — all met

- Byte-level token count over the 7 files: 0 (was 17).
- Diff audit: 17 insertions / 17 deletions, programmatic check that every
  changed line is comment-only — 0 non-comment changed lines.
- `node --check` green on all 7 files.
- src/js/game.js and src/js/corpses.js untouched (git status confirms).

## Metric review

Hygiene task; no sim sweep, no balance metric. Pre-registered GO was the
binary above and it held. One process note for the next run: the scripted
fixer's quote-parity guard is too strict for comment lines containing
apostrophes — the comment-only assertion (whitespace + `//` before token) is
the sufficient guard; quote checks add false skips.

## Status

Convergence: n/a (hygiene). Committed in worktree, ready to land, pending ship.
