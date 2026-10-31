# sim-toolloss-b — the whittle -> none "tool loss" is a succession, not a loss

Run: Loop B fleshout-loop-b-20261031T1230Z, arm sim-toolloss-b, axis
food-economy. Worktree sim-toolloss-b. DIAG ONLY: measurement, zero
src/js changes, zero policy-default flips, zero edits to any existing
policy file or existing script. New files only: prereg, drivers +
analyzer + proof, this evidence file, corpora, table. Nothing is merged
by this worker (the coordinator merges); report status: committed on
branch, pending coordinator merge, no ship.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-toolloss-b-prereg.md (commit 2f25bd5b).
DIAG-GO iff a complete per-morning cutInfo + full-inventory table
covers every strand morning in the 15215 window AND the day-16 ->
day-17 transition is bracketed to a single loop-day segment with the
loss event NAMED and traced to a code path, OR the bracket plus the
excluded mechanisms are named and the residue is stated as an explicit
unknown. A table that merely re-shows "none on day 17" without the
bracket is NO-GO.

## Canon

docs/CANON.md read. No canon doc covers the tool tier / cutInfo gate
itself (docs/ABILITY-REFUSALS.md covers ability-action refusals, not
cutTree) — stated here instead of inventing canon. The standing rules
that bear on the verdict are CANON.md's "no silent actions" and the
sense-testing law: a villager losing their only knife should be
narrated or explainable. As §4 shows, nothing was lost, so there is
nothing silent to explain — but the death and the succession ARE
narrated loudly, which is the honest version of the same rule.

## Prior evidence read in full before designing anything

sim-fellrepeat-a.md (the finding: ON mornings whittle/Stone knife
days 8-16, "none"/"bare hands" day 17, no recorded loss event),
sim-axearrival-a.md (the mirror: an axe arrives via day-15 corpse loot
from Ethan — corpse loot moves gear between bearers),
sim-strandfix-morning-b.md (strand mornings, tool gate),
sim-morningcarry-b.md (substrate, reused verbatim).

## Instruments (new, this arm)

- scripts/toolloss-trace-b.js: the fellrepeat substrate verbatim
  (POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 guard / 1 ON, DAYS=30, NO
  prototype policy) with READ-ONLY additions in kind: every morning
  snap and every evening row carries a full inventory snapshot
  (scholar id/name, every stack, equipped map) and every evening row
  carries an evening cutInfo('bigtree') snap, so the transition is
  bracketed morning -> evening -> morning per loop-day; full day
  transcripts stored for loop-days 14-18; per-day knife-line scans
  for loop-days 14-18.
- scripts/toolloss-gap-b.js: the same driver plus READ-ONLY gap
  capture — every say line spoken between one daily's return and the
  next daily's entry (harness sleep + pre-daily waits/fights, the
  window day slices miss), morning corpse snapshots (loop-days
  15-19), bearer display names, and morning/evening vitals
  (kcal/health/hydration/trauma). No verb calls, no state writes, no
  RNG draws beyond the base policy stack. Its 15215 ON rerun
  reproduces the judged trajectory exactly (proof check), so it is a
  re-read of the same trajectory, not a different run.
- scripts/analyze-toolloss-b.js (pure reads; emits the table JSON).
- scripts/test-toolloss-b.js (proof; 32/32 — see Proof).

## Verdict: DIAG-GO — recording artifact, bearer change, not a tool loss

The Stone knife was never dropped, deposited, broken, swapped, or
evicted. It stayed in its owner's pack until its owner died, and it
has stayed on her corpse, unlooted, ever since. What changed between
the day-16 and day-17 mornings is WHO the morning snap is reading:
the scholar died overnight and the mantle passed to a different
villager who never owned a knife. Every candidate mechanism from the
brief is discriminated in §3; durability break, deliberate drop /
deposit, corpse-loot swap, inventory-cap eviction, and prototype
side effects are all excluded by the bracket, and the recording
artifact is confirmed: the fellrepeat morning snap read cutInfo off
the current scholar without recording WHICH scholar that was.

## 1. THE PER-MORNING TABLE (the GO input — 15215, both legs)

Bearer names from the gap rerun (the judged driver predates the
display-name field; ids match exactly across both drivers).

### ON leg: mornings 8-17 (strand mornings; the transition)

| morning | bearer | cutInfo tier / tool | Stone knife | inv stacks | where |
|---------|--------|---------------------|-------------|------------|-------|
| day 8 | Gabriela (gen_gyft62f) | whittle / Stone knife | inventory, units 1 | 5 | creek, outside |
| day 9 | Gabriela | whittle / Stone knife | inventory, units 1 | 5 | creek, outside |
| day 10 | Gabriela | whittle / Stone knife | inventory, units 1 | 4 | creek, outside |
| day 11 | Gabriela | whittle / Stone knife | inventory, units 1 | 4 | creek, outside |
| day 12 | Gabriela | whittle / Stone knife | inventory, units 1 | 5 | creek, outside |
| day 13 | Gabriela | whittle / Stone knife | inventory, units 1 | 5 | creek, outside |
| day 14 | Gabriela | whittle / Stone knife | inventory, units 1 | 4 | creek, outside |
| day 15 | Gabriela | whittle / Stone knife | inventory, units 1 | 4 | creek, outside |
| day 16 | Gabriela | whittle / Stone knife | inventory, units 1 | 5 | creek, outside |
| day 17 | Dakota (gen_eni1m98) | none / bare hands | ABSENT | 1 | haven, inside |

### Guard leg: mornings 8-17 (contrast — no transition)

Same bearer (Gabriela) on every morning; whittle / Stone knife,
inventory units 1, on all mornings 8-17 and through morning 30. The
guard leg never strands past day 10 (bridge built day 10) and never
changes bearer, so it never shows the drop. The discriminator is the
bearer, not the leg: ON strands Gabriela at the creek for 10 nights;
guard brings her home on day 10.

### The bracket (single loop-day segment)

- Morning day 16: Gabriela, whittle, knife in inventory (units 1).
- Evening day 16: Gabriela, whittle, knife in inventory (units 1),
  still at the creek (travel-refused, 0 logs), vitals spent: kcal 0,
  health 46, hydration 78. Full inventory: unknown berries 18,
  unknown shoots 7, Stick 1, Stone 2, Stone knife 1, Fan care package
  (unopened) 1.
- Morning day 17: Dakota Ibarra, none, knife absent, at Haven,
  vitals fresh: kcal 2340, health 100, hydration 100, trauma 10.
  Dakota's pack is her own: Field Sutures 1, plus equipped Hunting
  spear, Marked Bus Map, Good Boots, Daughter's Drawing, Field suture
  kit, Dead Phone, Grandfather's Rope — none of Gabriela's gear.

The transition is bracketed to the gap between evening day 16 and
morning day 17 — the harness sleep + pre-daily window, which the
fellrepeat day slices never captured. That gap is what the gap driver
was built to read, and it contains the whole answer (§2).

## 2. THE GAP: WHAT ACTUALLY HAPPENED OVERNIGHT (verbatim)

Morning-17 gap lines, in order (abridged to the causal chain; full
110 lines stored on the gap corpus morning row):

- "You settle into the cold ground. Sleep takes you." (sleeping rough
  at the creek, no fire — warmth store day 16: acted false, miss
  no-wood; evening wood 0)
- "🔇 The birds have gone quiet. ... Something out there knows
  exactly where you sleep."
- "Three shapes at the treeline — dog-shaped silences, circling."
- "⚠ STARVING: health and energy falling. The spiral has started."
  (she went to bed at kcal 0 — the night's metabolism is the spiral
  the sleep preview warned about)
- "— DAY 17 DAWN — The world wakes. Animals are active."
- "Overnight, unknown berries went bad — beyond saving."
- "You wake with a start — something is wrong."
- "🐕 It moves." / "You don't know what that was. A dog-shaped
  silence at the treeline."
- "⚔ HUSHPUPPY! You're on your own." / "The Hushpuppy is on you —
  no warning, just teeth." / "Armor absorbs 2." / "Hushpuppy hits
  you for 15." / "You go down."
- "📖 The Codex turns a page on its own. Gabriela Ludwig is dead.
  You didn't ask. It knew."
- "🕯️ Gabriela Ludwig is dead — the wild. The village stops.
  Somebody screams. Somebody else starts digging."
- "The Codex doesn't pause for grief. Dakota blinks — and it's
  already there, overlaying everything, syncing. No pen. No paper.
  The mantle just... transfers."
- "🌟 "MANTLE TRANSFER DETECTED. ...Oh! New face! Same job! Whole
  new set of tricks.""
- "📖 The Codex turns a page: Gabriela Ludwig, 17 days. The mantle
  passes to Dakota Ibarra."
- "🪞 You wake up somebody else. Dakota Ibarra, 57 — an ER nurse.
  Their hands know different work now: Iron Stomach, Purify."

Death record (harness live capture): day 17, kind villager, who
gen_gyft62f, cause "the wild", player true. "The wild" is the
tbFightDeathCause label for a lost wild monster fight (src/js/
game.js: tbFightDeathCause — at least one monster fighter, no hostile
fighter): the Hushpuppy ambush, one hit for 15 against a body already
drained to near-empty by the starving spiral overnight. The fight is
not narrated as a multi-round contest because there was nothing left
to contest with — she went down on the first hit.

## 3. CANDIDATE MECHANISMS — DISCRIMINATED

| candidate | verdict | evidence |
|-----------|---------|----------|
| Durability break | EXCLUDED | No durability system on the knife in items.json (no uses/durability field); knife units stay 1 through evening 16 and the same stack sits on the corpse after |
| Deliberate drop / deposit | EXCLUDED | No drop/deposit/knife line in any day 14-18 transcript or in the 110 gap lines; DEPOSITGATE policy never fires a deposit for her (no stash record) |
| Corpse-loot swap | EXCLUDED (as the loss) | The reverse happened: her gear BECAME corpse loot. No one looted it (looted false through morning 19); the mirror arm's axe arrival was Ethan's corpse, a different corpse on a different day |
| Succession handover | CONFIRMED | Bearer gen_gyft62f -> gen_eni1m98 across the bracket; death + mantle-transfer lines verbatim in the gap; successor's gear is entirely her own |
| Inventory-cap eviction | EXCLUDED | Pack shrinks 5 -> 1 stacks because the READER changed, not because the pack overflowed; no eviction line; evening-16 pack (6 stacks) is well within any cap |
| Prototype-policy side effect | EXCLUDED | No prototype policy runs on either leg; guard leg (same policies, no strand) keeps the knife |
| Recording artifact | CONFIRMED | The fellrepeat snap recorded cutInfo without bearer id or inventory, so a succession read as a tool loss. The artifact is in the instrument, not the game |

## 4. SENSE-TEST (law — read, judged for meaning)

The loss itself is never narrated — correctly, because nothing was
lost. What IS narrated, loudly and in order, is the death ("The
village stops. Somebody screams. Somebody else starts digging."),
the mantle transfer, and the disorientation of waking as somebody
else ("You wake up somebody else. Dakota Ibarra, 57 — an ER nurse.
Their hands know different work now."). A reader of the day-17
transcript alone could still be confused about one thing: the
successor's day opens by taking logs and traveling grove -> Haven
under the line "You come home after 11 days" — the homecoming count
belongs to the scholar ROLE (11 days = the strand), not to Dakota
the person, who starts the day already at Haven. That line is
role-anchored narration surviving a succession; flagged in §7 as a
texture note, not chased here. PASS on mechanism and on texture: the
game tells the truth about the death and the succession; only the
old instrument's silence about the bearer made it look like a
vanishing knife.

## 5. WHERE THE KNIFE IS NOW

On Gabriela's corpse, unlooted, with her full loadout — inventory
plus equipped (equipped items land on the corpse too):

- Corpse corpse_17_xrt0hz, villagerId gen_gyft62f: unknown shoots 7,
  Stick 1, Stone 2, Spare battery 1, Stone knife 1, Fan care package
  (unopened) 1, Hunting spear 1, Work Gloves 1. Absent at morning 16,
  present mornings 17-19, looted false throughout.
- The 18 unknown berries from evening 16 are NOT on the corpse:
  they spoiled overnight ("Overnight, unknown berries went bad"),
  which independently corroborates the overnight timeline.
- Side observation (not chased): the corpse's node reads creek
  (2,5) on mornings 17-18 and Haven (4,4) on morning 19, items
  unchanged, still unlooted. Something moves the body home between
  mornings 18 and 19; the mechanism is not identified here and no
  claim is made about it (§7).

## 6. PILOT BAND (8 seeds, ON leg) + CONFIRM TRIGGER

| seed | bearers (mornings) | bearer changes | whittle mornings | whittle -> none drop |
|------|--------------------|----------------|------------------|----------------------|
| 15003 | 1 | none | none | none |
| 15009 | 2 | day 18 (contest death) | none | none |
| 15091 | 3 | day 8, day 30 (wild deaths) | none | none |
| 15211 | 1 | none | none | none |
| 15215 | 2 | day 17 (wild death) | 8-16 | 16 -> 17, WITH bearer change |
| 15220 | 1 | none | none | none |
| 15221 | 1 | none (death day 31, past window) | 2-30 | none |
| 15337 | 1 | none | none | none |

Succession itself is common (3 of 8 seeds change bearer inside the
window); a whittle -> none drop appears on NO seed besides 15215.
Per the prereg, the confirm trigger (a drop on a seed beyond 15215)
did NOT fire, so no guard band was spent — this arm is a
single-trajectory diag and claims no rate. The band does support one
generalization: any future tool-tier census that does not record the
bearer will misread every succession as a gear event.

## 7. VILLAGE ASSESSMENT (plain words)

The same banked village, seen to its end: Gabriela slept rough by
the creek for ten nights because the bridge logs never arrived — the
fires ate them, night by night, until the pack held zero logs and
the warmth line could not fire at all. On the tenth night she went
to bed starving (kcal 0, health 46), the night's metabolism finished
what hunger started, and at dawn a Hushpuppy found her before she
could get up. She died in one hit, not because the monster was
overwhelming but because there was nothing left of her to hit. The
village did not end: the mantle passed mid-morning to Dakota, an ER
nurse with a suture kit and Purify, who walked home with four logs
and got on with the day. The knife did not vanish; it is still lying
where Gabriela fell, with everything else she carried, waiting for
someone to come back for it. The blank this arm fills is not a game
bug but an instrument bug: future tool arms must record the bearer
with the tier, or every succession will look like a theft.

## 8. CONTAINED FIX PROPOSAL (reported, NOT landed — coordinator go-ahead required)

No src/js change is proposed, because no game behavior is wrong.
The fill is instrumental, and two of its three parts are already
done by this arm:

1. DONE (this arm): the toolloss driver records scholar id + full
   inventory + equipped on every morning/evening snap, and the gap
   driver records inter-daily narration. Reuse these drivers (or
   their snap shape) for every future strand/tool census.
2. DESIGN RULE (recorded for future arms): any tier-change claim
   must first check bearer continuity — a tier change WITH a bearer
   change is a succession until proven otherwise, and must be
   reported as one, never as a gear event.
3. FOR THE COORDINATOR (not a fix proposal): mark the sim-findings
   tool-tier item answered (succession, recording artifact — see
   §3). No game change, no [needs-eyes] commit: nothing about the
   game needs Steve's eyes for this item.

## Reachability

No new content reached; no game change landed, so no reachability
change is claimed. Strand/creek/bridge content reached as in
fellrepeat-a (ON strand 7-16, succession day 17). Wave reach on
15215: wave 1 both legs (as fellrepeat-a); waves 2-5 not reached in
this 30-day window.

## Wall numbers

NOT OBSERVABLE as reachability on 30-day evening legs (pre-seat, no
field) — reported, never claimed. Observed on 15215, both legs alive
at day 30 (via the successor on ON): national 0, table 0, wins 0
(structurally unreachable in this band, not a wall measurement);
median survival 30 days (ceiling — single seed, survived the window
through succession).

## Proof

scripts/test-toolloss-b.js: 32/32 checks pass, including: knifeIn
unit cases (inventory / equipped / absent / null); the judged
bracket (morning 16 whittle+knife, evening 16 whittle+knife at the
creek, morning 17 none+absent with bearer change, morning 17 new
bearer at Haven); guard contrast (no change, knife throughout);
morning coverage (ON 8-16 whittle, 17 none; guard 8-17 whittle);
death record (day 17, "the wild", player); gap narration (death,
mantle, wake-somebody-else, Hushpuppy fight lines present; no knife
line); corpse check (absent morning 16, knife + full loadout
unlooted mornings 17-19); vitals (evening 16 kcal 0 / health 46;
morning 17 kcal 2340 / health 100); gap-rerun trajectory identical
to judged; band scope (only 15215 drops, with bearer change;
successions on >= 3 seeds); store errs 0; tracked-diff guard:
src/ and scripts/policies/ between the prereg commit's parent and
the final tree are EMPTY — drivers, analyzer, and proof are
measurement only (new files, not edits).

## Metric review

- The bracket metric behaved exactly as preregistered: the
  morning -> evening -> morning snapshots isolated the transition
  to one inter-daily segment, and the gap instrument (added as a
  second driver, not a metric change) supplied the narration the
  day slices miss. No re-scoring occurred: the GO bar required a
  named mechanism, and the mechanism named is the one the evidence
  shows, including the branch the prereg allowed (recording
  artifact — the bearer-change reading IS the artifact outcome, and
  it is a GO outcome, not a fallback).
- Reporting refinement for the next strand prereg: state the snap
  schema (bearer id + inventory + equipped) in the prereg itself,
  not just "cutInfo per morning" — the fellrepeat gap came from a
  prereg that asked for cutInfo alone. The gap-line instrument
  (inter-daily narration) should be standard on any arm whose
  transition could fall in the sleep/pre-daily window.
- No metric revision is proposed for the GO bar itself: completeness
  + bracket + traced mechanism separated the candidates cleanly.
- §15 panel: not applicable, as declared in the prereg — zero
  game-root changes, so there is no before/after game delta for
  scripts/balance-panel.js to compare. The before/after here is
  morning vs evening snapshots on the same legs, and it is never
  labeled a panel comparison.

## 9. OUT-OF-SCOPE FINDINGS (NOT chased; for the coordinator's backlog)

- [answered — coordinator to mark] 2026-10-31 — food-economy /
  tool-gate — TOOL TIER DROPS WHITTLE -> NONE ACROSS THE STRAND
  (this arm): not a tool loss. Gabriela Ludwig (gen_gyft62f) died
  day 17 in a dawn Hushpuppy ambush after a starving night at the
  creek (kcal 0 at bedtime, warmth unfired for want of wood); the
  mantle passed to Dakota Ibarra (gen_eni1m98), who never owned a
  knife. The Stone knife sits unlooted on Gabriela's corpse with
  her full loadout. The fellrepeat "loss" was a recording artifact:
  its morning snap read cutInfo without bearer id or inventory.
  Design rule recorded in §8: bearer continuity first on any
  tier-change claim. (evidence: this file; judged ON/guard corpora
  + gap corpus; table JSON.)
- [open] 2026-10-31 — food-economy / narration — SUCCESSOR
  HOMECOMING LINE IS ROLE-ANCHORED (this arm, texture note): the
  successor's day-17 transcript says "You come home after 11 days"
  on arriving at Haven, although the successor starts day 17 already
  at Haven — the count belongs to the scholar role (the strand
  length), not the person. Worth a look when succession narration
  is next touched; not a bug claim. (evidence: gap corpus
  loop-day-17 fullDaySay.)
- [open] 2026-10-31 — food-economy / corpses — CORPSE NODE MOVES
  CREEK -> HAVEN (this arm, side observation): Gabriela's corpse
  reads node (2,5) on mornings 17-18 and (4,4) on morning 19, items
  unchanged, still unlooted. Something carries the body home; the
  mechanism was not identified and no claim is made. (evidence: gap
  corpus corpse snapshots.)

## Instrument notes (disclosed)

- safe-commit index clobber (known class): after the prereg commit,
  the worktree's main index showed the committed prereg file as a
  staged deletion while the file itself was present. Repaired with
  `git update-index --add --cacheinfo` from the HEAD blob; `git
  status` after repair showed a clean tree, and `git show --stat
  HEAD` confirms the commit holds exactly the prereg file. The same
  check will be run after the final commit.
- The gap driver is a second instrument on the same trajectory, not
  a second judged leg: its morning/evening scholar+cut sequences
  are byte-equal to the judged ON corpus (proof check), so no
  trajectory divergence is hidden behind the extra reads.

## Files

- Prereg: evidence/2026-10-31/sim-toolloss-b-prereg.md (commit
  2f25bd5b)
- Evidence (this file): evidence/2026-10-31/sim-toolloss-b.md
- Drivers: scripts/toolloss-trace-b.js, scripts/toolloss-gap-b.js;
  analyzer: scripts/analyze-toolloss-b.js; proof:
  scripts/test-toolloss-b.js (32/32)
- Judged corpora: evidence/2026-10-31/sim-toolloss-b-corpus-on
  (8 seeds), sim-toolloss-b-corpus-guard (15215),
  sim-toolloss-b-corpus-gap (15215 gap rerun)
- Per-morning table: evidence/2026-10-31/sim-toolloss-b-table.json
