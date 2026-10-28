# sim-grantpersist-b — grant-persistence diagnosis (spandraw playpath follow-up)

Run: oversight-flesh-out-loop-b, arm sim-grantpersist-b, axis
food-economy. DIAGNOSIS ONLY: zero src/js changes, zero edits
to scripts/playpath-spandraw-b.js (copied, never modified).
NEW scripts: scripts/grantpersist-trace-b.js (trace
instrument), scripts/test-grantpersist-b.js (proof),
scripts/analyze-grantpersist-b.js (corpus summarizer).
Corpus: evidence/2026-10-28/sim-grantpersist-b-corpus/
(120 files, one per seed × key).

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-28/sim-grantpersist-b-prereg.md, committed as 53a8572de BEFORE any judged trace run)

DIAG-GO. The loss reproduces on BOTH 10041 and 10042, and
every loss event is localized to a single overnight
day-transition on each reproducing seed, with the mechanism
and code site named. This is a documented mechanism finding,
not a bug claim: the game is doing exactly what Steve ruled
it should do — the grant dies with its bearer.

## Reproduction table (judged band: seeds 10040–10047, 15 keys, 2 lead + 5 tap days, substrate COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1)

All 120 instances completed (endReason survived everywhere);
all 120 setup grants succeeded (grantOk true, hasAbility
true at setup); zero lost-at-setup. Losses: 7 of 120
instances, all on the two original seeds, with exactly the
11 "You don't have that ability." refusal taps the playpath
pilot reported — same seeds, same keys, same counts:

| seed | key | refusal taps | bearer before → after | successor's own ability |
| --- | --- | --- | --- | --- |
| 10041 | animal_ken.read_beast | 1 | gen_m82yaz8 → gen_31thg6x | beast_calm L1 |
| 10041 | fear_aura.menace | 3 | gen_m82yaz8 → gen_31thg6x | beast_calm L1 |
| 10041 | molt.shed_skin | 3 | gen_m82yaz8 → gen_31thg6x | beast_calm L1 |
| 10042 | ambush.lay_wait | 1 | gen_snpynyq → liam_davis | bloodhound L1 |
| 10042 | blood_trail.follow_blood | 1 | gen_snpynyq → liam_davis | bloodhound L1 |
| 10042 | patient_aim.clean_shot | 1 | gen_snpynyq → liam_davis | bloodhound L1 |
| 10042 | scarecrow.stage_injury | 1 | gen_snpynyq → liam_davis | bloodhound L1 |

Per-seed totals: 10040: 0 losses / 0 refusal taps;
10041: 3 losses / 7 refusal taps; 10042: 4 losses / 4
refusal taps; 10043–10047: 0 / 0. The other 23 instances on
10041/10042 never changed bearer and never lost the grant
(0 losses in 113 non-switching instances band-wide) — the
correlation is perfect in both directions.

## Localization per seed (adjacent snapshot pairs, every one)

In all 7 losses the last present snapshot and the first
absent snapshot are ADJACENT in the trace, and the bracket
is always the overnight boundary — never inside
competent.daily, never at a tap:

- 10041 animal_ken: last present post-daily seq 6, game day
  6, ticks 401 (bearer gen_m82yaz8, animal_ken L1) →
  first absent tapday-start seq 7, game day 7, ticks 256
  (bearer gen_31thg6x, beast_calm L1). Snapshots 16 → 17.
- 10041 fear_aura: last present post-tap seq 4, game day 4,
  ticks 439 (fear_aura L1) → first absent tapday-start
  seq 5, game day 5, ticks 384 (beast_calm L1). Snaps 12 → 13.
- 10041 molt: last present post-daily seq 4, game day 5,
  ticks 435 (molt L1) → first absent tapday-start seq 5,
  game day 6, ticks 256 (beast_calm L1). Snaps 10 → 11.
- 10042 ambush / blood_trail / patient_aim / scarecrow
  (all four, same overnight): last present post-tap seq 6,
  game day 7, ticks 411–416 (granted key, deepened to L2 on
  all four) → first absent tapday-start seq 7, game day 8,
  ticks 256 (liam_davis, bloodhound L1). Snaps 20 → 21.

In every loss: bearerChanged true, listRefChanged true,
scholarChanged FALSE. The scholar record is the same object
across the swap (mantle mutates it in place); the tell-tale
pair is bearer id + abilities-array reference changing
together at a tapday-start snapshot. The tapday-start
snapshot is the first line of the wrapper daily, before
competent.daily runs — so the change happened in the
harness sleep / endDay window between days, not during any
played day's work. (The 10041 instances switch on different
harness days — seq 5 vs seq 7 — because each instance is a
separate game whose RNG diverges after the taps; the four
10042 instances share the seq 7 / day 8 overnight.)

## Mechanism (named system + code site)

The bearer died overnight and the mantle passed — the
village-as-protagonist succession, working as designed:

1. `playerDeath(cause)` — src/js/ledger.js:629. The old
   bearer <redacted> the village chooses the successor by trust
   (highest-trust living roster villager), sets
   `Game.villagerId = newId` (ledger.js:848) and
   `scholar.villagerId = newId` (ledger.js:888).
2. `mantleBecome(oldId, newId)` — src/js/villager-build.js:
   547, called from playerDeath. Its ability step replaces
   the whole list with the successor's own kit:
   `s.abilities = npcAbilities[newId]` mapped to L1 entries
   (villager-build.js:565–575). The successor's own
   tracks, XP, deed day, godhood, gear and languages replace
   the dead bearer's too; integration, slots, Codex, ledger
   and trust stay with the office.
3. Steve's ruling behind it (villager-build.js header,
   2026-10-14): "You become that villager" — "You don't
   think you should take your XP or the abilities. You
   become that villager." The setup grant was attached to
   the dead bearer, not to the office, so it dies with them
   by rule, not by accident. The refusal the taps then hit
   is the honest one: src/js/abilityActions.js:221,
   useAbility's `hasAbility` check ("You don't have that
   ability.").

That is why the button read still showed ok while the tap
refused (playpath evidence): the button read
(`_actionAvailable`) does not check ownership; the impl
does. That mismatch is instrument-visible, not a game bug —
the button's honesty gap for unowned abilities is a
separate, pre-existing observation, not this arm's claim.

What the death itself was is NOT established by this
instrument: the trace records no death cause, and the last
present tap days show healthy bearers (health 71–100, kcal
mostly 900–2,300; the 10041 animal_ken instance had two
hungry 0-kcal tap days before the switch, the others did
not). The overnight window is sleep()/endDay; which
overnight killer fired is a documented gap below, not a
guess. It does not affect the verdict: whatever killed the
bearer, the grant loss follows from the mantle by rule.

## Eliminated candidates (with evidence)

- Ability-list rewrite mid-run (non-bearer): ELIMINATED.
  No loss ever occurred without a bearer change (0/113),
  and every loss came with one (7/7).
- Slot replacement (game.js:24369, full slots + accepted
  ability choice): ELIMINATED. The list held exactly one
  entry (far below the 6-slot max), and a replacement would
  swap one entry, not the bearer id plus the whole list.
- sigW5 STAMP cancellation (sigW5.js:203, removes up to 2
  highest-level abilities): ELIMINATED. It never changes
  the bearer id; all 7 losses change it.
- Deepening / evolution: ELIMINATED as a loss path. The
  four 10042 keys had deepened to L2 before the switch and
  were still replaced wholesale; the detector's evolvedFrom
  lineage rule (modifiers.js hasAbility) never fired because
  the list itself was replaced, not evolved.
- Cap / slot rule / prune: ELIMINATED. One-entry list,
  no cap pressure, no prune call in the bracket (the bracket
  contains only the overnight sleep/endDay window).

## What this means for reusing long tap runs

Any tap run longer than a few days WILL cross successions
on some seeds, and every tap after a succession measures
the successor's kit, not the granted key. Future playpath-
style drivers must do one of these, disclosed in their
prereg:

- Record-and-exclude (recommended): record bearer id at
  every tap day (this instrument does) and exclude
  post-succession taps from the key's counts, reporting
  succession as a played outcome — the run's village lived
  on, its first bearer did not.
- Re-grant per tap day: re-grant the key to each new bearer
  at tap-day start. This changes what is measured (the key
  on a new body, not the original grant's survival) and
  must be disclosed as a different instrument, not a fix.
- End the instance at succession: cleanest for key
  measurement, but it throws away the village's continuation
  and biases toward short-lived bearers.

Do NOT do what the playpath pilot did unknowingly: keep
tapping a dead bearer's key and count the refusals as key
data. They are succession data. The 11 playpath refusals
change no spandraw verdict (every key classifies the same
with or without them), but any future band that taps past a
succession without a bearer check will misread its own
zeros.

## Sense note (plain words — what the player experienced)

On those late tap days, the player was no longer the person
who had been granted the ability. The first bearer had died
in the night — the village picked the person it trusted
most, that person picked up the Codex, and the game
continued as them, with their own single knack (a beast
calm, a bloodhound's nose) instead of the granted power.
When the evening tap came, the new bearer reached for a
power they never had, and the game said so plainly: "You
don't have that ability." That is not a broken tap. It is
the game's central promise working: the village goes on,
the person does not. The instrument's mistake was assuming
the hands stayed the same for seven days. They didn't —
and on seeds 10041 and 10042, that is the whole story.

## Metric review (MEASUREMENT.md §14)

Judged against the prereg as written, no mid-run re-scoring:
DIAG-GO required (a) reproduction on 10041 and/or 10042
and (b) localization to a single day-transition or named
event on each reproducing seed. Both hold: reproduction on
both seeds (7 instances, 11 refusal taps, exact match to
the playpath counts), and every loss localized to one
adjacent snapshot pair at the overnight tapday-start
boundary with bearer + mechanism named. The prereg's
"documented negative counts as GO" clause was not needed:
this is a positive localization, bearer-change class.
One instrument note for the next run: the proof's L3 leg
models bearer change as a NEW scholar object, while the
real mantle mutates the SAME scholar object in place
(scholarChanged false in all 7 real losses) — the proof
still passes because it asserts bearer + scholar flags on
its own fixture, but a future proof should include a
same-object mantle fixture to match reality. The detector
itself was unaffected (it keys on bearer + list, not on
scholar identity).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No before/after game leg: zero game changes, zero lever
variants, nothing to panel. Panel metrics (national/table/
wins) do not exist for 7-day instances and are not
estimated. No balance-panel compare .md is produced, as
pre-registered.

## Proof

- `node scripts/test-grantpersist-b.js` — 8/8, exit 0,
  verdict PROOF-GREEN (synthetic planted-loss legs L1–L8:
  snapshot shape, post-daily bracket, bearer change, list
  rewrite, no-loss silence, deepening not-a-loss,
  evolution not-a-loss, absent-at-setup). One correction
  during proof: the L3 fake first closed over the original
  scholar object, so its hasAbility stayed true after the
  swap — the fake was fixed to read the live scholar (like
  the real Game.hasAbility); the detector was never changed
  to chase the fake.
- Judged band: `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 node scripts/grantpersist-trace-b.js` —
  120 files, exit 0, corpus
  evidence/2026-10-28/sim-grantpersist-b-corpus/, ~10 min.
  No EPERM flap on this run (all 120 writes first-try).
- Analyzer: `node scripts/analyze-grantpersist-b.js` —
  reproduction table above; one analyzer correction (snapshot
  lookup by content, not object identity, after JSON
  re-parse) before the adjacency numbers were cited.
- No jest (proofs are node, not jest). No [needs-eyes]:
  diagnosis/tooling only, nothing player-visible. Zero
  src/js files in this arm's commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] death cause in the overnight window: this
  instrument localizes the swap to sleep()/endDay but does
  not record what killed the bearer. A future arm that
  needs the cause should capture the overnight say lines /
  death record (playerDeath's cause argument, corpses.js
  registerDeath) around the switch. Does not change this
  verdict. (sim-grantpersist-b)
- [follow-up] button-read ownership gap: _actionAvailable
  shows ok for abilities the bearer does not hold, so a
  tap can pass the button and refuse in the impl. Whether
  the bar should grey out unowned actions is a UI question
  for a future arm, not a claim here. (sim-grantpersist-b)

## Convergence line

grant-persistence — spandraw follow-up diagnosis: trace band
8 seeds × 15 keys (120 instances), loss reproduces exactly
(7 instances, 11 refusal taps, same seeds/keys/counts as
playpath). Root cause: BEARER SUCCESSION, not a list
rewrite — overnight playerDeath (ledger.js:629) →
mantleBecome (villager-build.js:547) replaces scholar.
abilities with the successor's own kit (Steve 2026-10-14:
"You become that villager"). Every loss is one adjacent
snapshot pair at a tapday-start boundary, bearerChanged +
listRefChanged, scholar object unchanged. Legitimate game
behavior by rule; long tap runs must record-and-exclude
post-succession taps (or re-grant per tap day, disclosed).
Death cause in the overnight window still unrecorded —
follow-up, not a verdict blocker.

## Verdict (judged against the pre-registered bar, not re-scored): DIAG-GO — bearer succession via playerDeath → mantleBecome; grant dies with its bearer by design
