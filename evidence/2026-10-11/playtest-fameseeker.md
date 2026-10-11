# Playtest loop 2026-10-11 — fame-seeker adversarial (rotation idx 9)

Hostile-player attacks on the show/fame economy. Prior art: break-it shows r15
(same day) covered the broadcast machinery deeply, so this run attacked what
r15 did NOT. Proof: `scripts/test-playtest-fameseeker-20261011.js` (13/13 x3
seeds: 424242, 777001, 999983) + `scripts/test-fameseeker-cheerab-20261011.js`
(A/B). Regressions: shows r15 suite 486/486 green.

## E1 — HELD: free cheer cannot farm club boons
'Cheer them on' costs 0 kcal (confirmed) and moves showbiz favor +1 per watched
pull. 120-day hostile sim (cheer every pull): max showbiz favor **3**, zero days
>= 50 (apClubBoon threshold). The -1/day lane drift dominates the +3/pull inflow.
A/B vs quiet-everything: cheer triples boon-window days in a no-drift harness,
but under the real wave>=2 economy both strategies stay near zero. No farm.
(Caught a harness artifact mid-run: stubbing unlockedWave=1 made apDailyTick
early-return, freezing drift and faking favor=100. Fixed to 2; result above is
post-fix.)

## E2 — HELD: heckle-everything fame loop has real teeth
12 heckles -> player showmanship 12 deeds, notabilityWeight 1 -> 6.75
(self-feeding loop works: more fame -> more pulls -> more heckles — by design,
"infamy stays famous"). Punishment lands: every victim's trust dropped hard
(e.g. 15->3, 6->0, 20->10), all 11 remembered the heckling. Trust<15 gates talk
options (conversation.js:1015) and minTrust gates exist, so a heckle-maximalist
gets socially frozen out. The 'heckled' memory itself has no dedicated reader —
the trust number does the work. Designed tradeoff, working as intended.

## S1/S2 — HELD: ratings summons terminates cleanly
Phase graph: 1 phase, 3 choices, all terminal-bound. End-to-end all 3 choices
(stunt / phone-it-in / refuse): activeContest cleared, broadcast frame lifted,
no throws.

## H1 — HELD: cheer copy honest
"real support" moves performance (+0.05 ac.cheer) and +1 showbiz favor, costs
nothing — the copy promises no cost and takes none.

## H2 — SENSE (Steve 2026-10-11 law): show copy passes the meaning read
Death Reel, Ask a Human, Moot, Nap Wars, Tiny Door, Grudge Pudding,
Who Moved It? beats all read as real, specific, funny, consequential writing
("The pudding is a metaphor. The grudge is not." / "The goat is unrepentant.").
Nit (noted, not a break): Death Reel setup says "tonight: YOUR greatest hits"
but beats are generic — no personalization from actual player history. It's a
TV show; acceptable fiction, not a mechanical lie.

## Verdict
The show/fame economy held against every attack. Nothing broke; no fixes
shipped — the run contributes two regression scripts and this note.
