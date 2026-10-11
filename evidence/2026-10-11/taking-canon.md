# Taking canon repair — evidence 2026-10-11

Steve's directive: the half-of-adults disappearance was claimed (in the Day 7
cinematic's 'watched' beat) to have happened "after the first week" — but the
player never sees it happen in week one. TRUE CANON: THE TAKING happened at the
Scattering, day zero. The System took the boring half immediately.

## Canon doc

- New `docs/KIN.md`: day-zero timing; the boring half; relatives horror;
  taken adults' fate never confirmed (System: "Somewhere SAFE! Somewhere
  BORING! Like THEM!"); taken half's kids in stasis ("NAPPING! Very cozy! Very
  still!"); kids' return reserved for the good galactic table path.
- Registered in `docs/CANON.md` doc table + change log.

## Beat rewrite (src/js/game.js, systemArrivalBeats 'watched')

Old: "Some of you just... sat? All week? The audience got BORED. So we removed
them. Poor sportsmanship! No hard feelings! (There were hard feelings. Briefly.)"

New: "FUN FACT! Half of humanity is GONE! We took them! Right at the START! The
boring half — the sitters, the yawn-ers! The audience got BORED! Your relatives
were probably in it! Statistics! Don't think about it! They're somewhere SAFE!
Somewhere BORING! Like THEM! And their little ones are NAPPING! Very cozy! Very
still! 🎉"

The other two 'watched' lines (watched-everything, fans) untouched.

## Voice line regenerated

`src/audio/system/sys-day7-05.mp3` regenerated via ElevenLabs (System Prime
`kcRU6m41juxCwrgZCYcd`, eleven_v4, stability 0.25) + locked robot chain.
Manifest entry updated TEXTUALLY (2-line diff, no re-serialize).

## Sweep — hit list

Searched src/js + docs for: "removed them", "sat? All week", "after the first
week", "boring half", "half of humanity / half the adults", "disappeared",
taken+week/day7, stasis, taken-family backstories.

- Hits: ZERO competing claims. (One `docs/DEAD-LEDGER.md` "removed them" is
  about Steve removing docs; `hierarchy.js` "Taken by force" is tribute;
  `alienPlayers.js` stasis hits are Rax's combat tech — all unrelated.)
- Villager backstories (src/data/characterGen.json occupation vignettes):
  no taken-family timing claims exist — nothing to fix.

## Proof

`scripts/test-taking-canon.js`: 17/17 green — beat timing, no "week" phrasing,
manifest text/chars match, sweep zero hits, MP3 valid (22.4s), KIN.md exists +
registered, table-path reservation present.

Regressions: ontology validator 76/76 green; test-audio-check.js 22/22 green;
test-day7-arrival.js 27/29 — the 2 failures ("wave-2 events scheduled",
"second arrival schedules no events") reproduce identically on unmodified
master: pre-existing, not from this change.

## Note for the table-outcome worker

docs/KIN.md defines the canon the table build must honor: the stasis kids'
return is a GOOD-PATH table outcome only — no other quest/ability/bargain
returns them. The System never confirms the taken adults dead or alive.
