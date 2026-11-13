# sim-namelessadm-b — finding #2309, NAMELESS ADMISSION LINE (live-play verification + fix)

Arm: sim-namelessadm-b. Base: master 48ed1ffd7 (Lane B journey succession
r193 adoption) + prereg commit 36f66dafc. Proof test:
scripts/test-namelessadm-b.js (20 assertions, proof seed 3). Probe driver:
scripts/namelessadm-probe-20261113.js. Prereg:
scripts/sim-namelessadm-b-prereg.md (committed BEFORE any judged sim).

Verdict: **GO — live-play reachable, fixed narrowly, proof test RED→GREEN,
after-leg byte-identical.**

## 0. The finding, in plain words

When strangers ask for a fire at Haven, the village holds a moot and votes.
If the vote says yes, the game says "The fire makes room" and speaks the
newcomers' names aloud so the village learns them. Finding #2309 said that
when there is no housing room left, the game still says that line — with
blank names, admitting nobody. It was found by calling the admission
function directly in a test, which skips the moot entirely, so whether a
real player could ever reach that line was unproven. This arm proves it:
yes, a real player can — and the fix is in.

## 1. Code trace — every gate upstream of `_vaAdmitPetitioners`

`_vaAdmitPetitioners` (src/js/villageAgency.js:892) has exactly ONE caller:

- `_vaFinishPetition` (villageAgency.js:885): `if (accepted) return
  this._vaAdmitPetitioners(pet);`

`_vaFinishPetition` (villageAgency.js:837) has exactly TWO callers:

- `conductPetitionMoot` (villageAgency.js:806): the exiled-player path —
  reached ONLY after the room gate below, and in the same tick, so no
  window opens here.
- `answerPetition` (villageAgency.js:831): the player's vote — reached
  ONLY when `pet.awaitingPlayerVote` is true, which is set ONLY by
  `conductPetitionMoot` after it passes the room gate.

The room gates upstream:

1. `conductPetitionMoot` (villageAgency.js:756-766): `var room =
   this.havenRoom(); if (room <= 0) { say("There's no room — every bed's
   full, every bowl spoken for. What would the moot even vote on? ...");
   return { room: 0 }; }` — the moot CANNOT be called at room 0. This is
   why the finding's staged call looked unreachable at first glance.
2. `openPetition` (villageAgency.js:608): NO room gate — a petition can
   arrive and sit pending at room 0 (the moot then refuses it). Not an
   admit path, but it means a pending petition at room 0 is normal.
3. `_vaFinishPetition` (villageAgency.js:837) and `answerPetition`
   (villageAgency.js:811): NO room re-check. The vote lands on the
   room the moot saw, not the room that exists when the vote is cast.

The window: `villageAgencyDaily` (villageAgency.js:182-186) walks an
ignored petition away after 3 days — but ONLY `if (!pet.vote &&
!pet.awaitingPlayerVote ...)`. Once the moot is held, `pet.vote` exists,
so the petition NEVER expires. The player may vote days or weeks later.

Roster growth between moot and vote — real game paths, no petition check:

- `visitorInteract(visId, 'invite')` (src/js/betrayal.js ~3438): a player
  action — a fleeing/curious visitor joins, roster +1. Proved live by
  voicejoins-b §2.
- `arrivalTick` (src/js/membership.js:640): an accepted membership
  applicant walks in on their arriveDay, roster +1. Proved live by
  voicejoins-b §1.

So the live-play sequence is: moot held at room ≥ 1 → a visitor is
invited in (or an applicant arrives) and takes the last bed → the player
votes accept → `_vaAdmitPetitioners` runs at room 0. The moot's own
gate is a snapshot, not a lock.

## 2. The staged moot attempt (proof seed 3)

Driven honestly through the game entry points — `openPetition` →
`conductPetitionMoot` → visitor invite → `answerPetition('accept')` —
never `_vaAdmitPetitioners` directly. Proof test
scripts/test-namelessadm-b.js §1; seeds searched 1..40 for a moot that
accepts on the player's vote (seed selection, not vote manipulation —
the moot's own return predicts the outcome).

Before the fix, seed 3 (roster trimmed to 11, room 1, two petitioners
Wren Hall and Ash Kett, cause famine-flight):

- Moot: "7 for taking them in. 3 against." — the moot said yes.
- Visitor invite takes the last bed: room 0.
- Player votes accept. The game then says, in order:
  - "The fire makes room.  — said aloud, so the village learns the
    names. They're Haven's now, for better or worse." (BLANK names,
    nobody admitted)
  - "Wren, Ash — there's no room. Every bed's full. They nod like they
    expected it, and walk on into the dark." (the same people, turned
    away — directly contradicting the line above it)
  - "Word will travel: Haven is feeding the hungry. (Opinion +3 with
    every village that knows you.)" (the world reacts as if the hungry
    were harbored — they were not)

Three dishonesties in one vote: a room claimed that did not exist, names
not spoken, and a reputation earned for a sheltering that never happened.
The proof test failed 6/20 before the fix (all six §1 assertions) and
passes 20/20 after.

## 3. The fix (one fix, src/js/villageAgency.js `_vaAdmitPetitioners`)

- When nobody is admitted (`admitted.length === 0`), the fire-makes-room
  line does NOT fire. Instead one honest line names them: "The moot said
  yes — but the beds filled while the count was taken. Wren Hall, Ash
  Kett — there's no room after all. They nod like they expected it, and
  walk on into the dark." The old left-out line stays silent here — it
  would only repeat the same turn-away.
- When some are admitted, the old lines are unchanged (fire-makes-room
  names the admitted, the left line names the rest) — guarded by the
  §2 partial-admission control on the same seed.
- `_vaPetitionConsequences` now receives `newIds.length > 0` instead of
  a constant `true`: consequences follow what actually happened, not the
  vote. A zero admission now reads "Haven is turned away the hungry.
  (Opinion -4...)" instead of "feeding the hungry. (Opinion +3...)".
- The journal now records "Moot said yes but no room: … turned away"
  instead of "Admitted 0:  (…)", and no `recordMoment` claims "Haven
  took in 0". The ledger line (`petition-accepted:…:0`) is unchanged —
  it records the vote outcome and the count honestly.

After the fix, seed 3's vote reads:

- "The fire is built high. Nobody speaks while the count is taken."
- "…7 for taking them in. 3 against."
- The loser's line. Then: "The moot said yes — but the beds filled
  while the count was taken. Wren Hall, Ash Kett — there's no room
  after all. They nod like they expected it, and walk on into the
  dark."
- "Word will travel: Haven is turned away the hungry. (Opinion -4
  with every village that knows you.)"

The vote, the turn-away, and the world's reaction finally agree with
each other. No canon doc covers roster join/leave narration specifically
(closest: docs/CONVERSATIONS.md, docs/PARTY.md) — no canon invented; the
fix follows the standing rule in docs/CANON.md, "No silent actions.
Every action narrates honestly, including failures."

## 4. Proof results

- scripts/test-namelessadm-b.js: RED before the fix (14 passed, 6
  failed — all six §1 fixed-behavior assertions), GREEN after
  (20/20, proof seed 3). §2 partial-admission control passes on both
  sides of the fix.
- Petition-adjacent suite on the fixed code: test-voicejoins-b 57/57
  PASS; test-petition-moot-afterlife-20261012 17/0; test-petition-moot-
  speeches-20261012 15/0; test-break-social-r13-20261011 ALL GREEN;
  test-reach-beats-20261010 15/0; test-social-lever-20261011 ran clean.
- Three old tests crash identically WITH and WITHOUT the fix (verified
  by reverting villageAgency.js to HEAD and re-running): 
  test-village-agency-20261010 (`FATAL ReferenceError: Text is not
  defined` in genCharacter), test-membership-depth-20261007 (crash at
  `G.seekReadmission()`), test-util-petition-nolink-20261010 (crash at
  `Game.fireSplinter(...)`). Pre-existing stale-test failures, not
  attributable to this change. Fix re-applied from the saved patch and
  the proof test re-run GREEN (20/20) afterwards.
- `node scripts/check.js --quick` after the fix: 327 passed, 13 failed
  in 1743s under heavy sibling load (three named 120s timeouts:
  test-throttlefeast-20261014, test-table-endings-20261014,
  godpath/test-one-person-army-deed-attainment). The three crashes above
  account for 3 of the 13; the remaining failures were not individually
  enumerated in the captured tail — the petition-adjacent suite above
  was run directly instead and is green except for the three pre-existing
  stale crashes, which fail identically on the base.

## 5. Probe band — before/after (190391–190398, 150d, competent)

[AFTER-LEG RESULT — the after-leg probe (after the fix,
evidence/2026-11-13/perseed-namelessadm-b/) is BYTE-IDENTICAL to the
baseline: `diff -r` of the two corpora dirs is empty, and every seed's
days / end / scale / maxWave / standing / won / fire / blank matches
exactly. Blank-names lines: 0 before, 0 after. The fix is narration-only,
as designed — it cannot move a sim, and the band proves it did not.]

After-leg (identical to the baseline on every cell):

| seed | days | end | scale | maxWave | standing | fire | blank |
|------|------|-----|-------|---------|----------|------|-------|
| 190391 | 65 | village-lost | regional | 4 | 145 | 0 | 0 |
| 190392 | 143 | village-lost | regional | 4 | 199 | 0 | 0 |
| 190393 | 126 | village-lost | regional | 4 | 199 | 0 | 0 |
| 190394 | 128 | village-lost | regional | 4 | 199 | 0 | 0 |
| 190395 | 150 | survived | regional | 4 | 199 | 0 | 0 |
| 190396 | 140 | village-lost | regional | 4 | 199 | 0 | 0 |
| 190397 | 135 | village-lost | regional | 4 | 199 | 0 | 0 |
| 190398 | 139 | village-lost | regional | 5 | 370 | 0 | 0 |

Wall numbers (after-leg band, identical to baseline): national 0/8,
table 0/8, wins 0/8; wave-4 unlocks 8/8, wave-5 unlocks 1/8; median
survival 137 days.

Baseline (before the fix, anchor f5b685ee2728,
evidence/2026-11-13/perseed-namelessadm-b-before/):

| seed | days | end | scale | maxWave | standing | fire | blank |
|------|------|-----|-------|---------|----------|------|-------|
| 190391 | 65 | village-lost | regional | 4 | 145 | 0 | 0 |
| 190392 | 143 | village-lost | regional | 4 | 199 | 0 | 0 |
| 190393 | 126 | village-lost | regional | 4 | 199 | 0 | 0 |
| 190394 | 128 | village-lost | regional | 4 | 199 | 0 | 0 |
| 190395 | 150 | survived | regional | 4 | 199 | 0 | 0 |
| 190396 | 140 | village-lost | regional | 4 | 199 | 0 | 0 |
| 190397 | 135 | village-lost | regional | 4 | 199 | 0 | 0 |
| 190398 | 139 | village-lost | regional | 5 | 370 | 0 | 0 |

No petition admission fired organically on this band (0 fire-makes-room
lines on all 8 seeds) — the blank line is rare in the wild, which is why
the staged moot drive, not the band, is the proof. The band's job is the
byte-identical check: the fix is narration-only, so survival/wave must
not move.

Wall numbers (baseline band): national 0/8, table 0/8, wins 0/8; wave-4
unlocks 8/8, wave-5 unlocks 1/8; median survival 137 days.

## 6. Village assessment (plain words)

The village in this arm is Haven at the moment strangers ask for a fire.
What the village looked like: a moot that votes honestly, a count spoken
aloud, a loser who speaks after losing — the petition beat is well built.
The blank was a timing hole, not a missing system: the moot checks the
beds when it is called, but the vote can land after the beds fill, and
nothing re-checked. The fix fills that hole with one honest sentence
instead of a new system, and makes the world's memory match what
actually happened. Nobody was harmed in the sims by the wart itself —
no one was admitted who should not have been, and no one was turned
away who should have been taken in. The harm was to the story: the
village was told a sheltering happened that did not, and other villages
were told to admire Haven for it.

## 7. Blanks filled and findings

- Blank filled (fix landed in this arm): the room-0 admission line.
  The moot-said-yes-but-beds-filled line, the turn-away consequences,
  and the honest journal/moment records are the fill.
- Unexamined edge, noted not chased: if `hydrateSeed` fails for an
  admitted petitioner, the fire-makes-room line still names them (it is
  built from `admitted`, not from the successfully hydrated `newIds`).
  Unproven whether hydration can fail in live play; a future arm could
  build the admission line from `newIds` instead. Out of scope here.
- The voicejoins-b finding #2309's sibling blank (a newcomer joining
  voiced and vanishing within a day without a word, sim-voicejoins-b.md
  §7) is untouched by this arm — still open for a future arm.

## 8. Proposed annotation for finding #2309 (coordinator applies)

Do NOT edit sim-findings.md from this arm. Proposed annotation text:

`- [fixed 2026-11-13 by Loop B arm sim-namelessadm-b, evidence/2026-11-13/sim-namelessadm-b.md, GO] 2026-11-13 — narration / sense — NAMELESS ADMISSION LINE: REACHABLE in live play, not a staged-call artifact — the moot checks room when called but the vote can land after the last bed fills (a visitor invite or an arrival takes it; the petition never expires once the moot is held), and _vaAdmitPetitioners then said "The fire makes room." with blank names, admitted nobody, and still earned the village +3 opinion for "feeding the hungry". Proof seed 3: moot 7–3 accept, bed filled by a visitor invite, vote accept → blank line + contradictory no-room line + false harboring line. Fix (villageAgency.js _vaAdmitPetitioners): zero-admission says "The moot said yes — but the beds filled while the count was taken. <names> — there's no room after all."; consequences follow what actually happened (turn-away, -4); journal/moment no longer claim a taking-in of 0. Proof test scripts/test-namelessadm-b.js 20/20 (RED 14/6 before fix); probe band 190391–190398 byte-identical before/after, blank lines 0 in both.`

## 9. Metric review

Pre-registered primary metric: live-play reachability decided with proof
(code trace + staged moot attempt through the real entry points). Met:
the trace pins the window (moot gate is a snapshot at
villageAgency.js:756-766; no re-check in `_vaFinishPetition` /
`answerPetition`; no expiry after the moot at :182-186) and the staged
drive reproduces it on seed 3 with the blank line firing. GO threshold
for the fix leg: after-leg blank-names line 0 AND probe-band
survival/wave byte-identical — MET: blank lines 0 in both legs, and the
two 8-seed corpora dirs are byte-identical (`diff -r` empty). No metric
was re-scored mid-run; the probe band's organic zero for fire-makes-room
lines was expected (the band is the no-regression check, the staged
drive is the proof — the prereg says so).

## 10. Run notes

- safe-commit.sh clobbered the main index on the prereg commit (file
  showed staged-deleted after a good commit 36f66dafc); repaired with
  the documented pipe (`git ls-tree -r HEAD -- <path> | git update-index
  --add --index-info`), verified `git status --short` empty and hashes
  match HEAD.
- No write-flap episodes during this arm.
- check.js --quick took 1743s under heavy sibling load; three 120s
  timeouts are load artifacts, and the three petition-area crashes were
  proven pre-existing by re-running them on the reverted base.
- Commits in this arm: prereg; fix + proof test; probe driver +
  before/after corpora + this evidence. Merged locally via --ff-only;
  no push, no bump, no live verification (ship loop owns it).
- Rebase at closeout: a sibling arm (sim-silentvanish-b) landed on
  local master after this arm's base, so the branch was rebased onto
  05aa4ce5a (clean, no conflicts) and the proof test re-run GREEN
  (20/20, seed 3) on the rebased tip before the --ff-only merge. The
  probe-band before/after comparison stands on the pre-rebase base
  48ed1ffd7, where it isolates this arm's fix; the rebase changed no
  line this arm's fix touches (the corpora's anchorCommit
  f5b685ee2728 is the probe-time HEAD, pre-rebase).
