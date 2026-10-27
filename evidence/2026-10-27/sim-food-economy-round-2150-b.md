# sim-food-economy-round-2150-b — coordinator evidence (loop B, axis food-economy)

Run: fleshout-loop-b-20261027T2150Z. Loop A live on scale-onramp the
whole run (2147Z claim, arms sim-w4channel-a + sim-w4abstain-a, NOT
touched) -> B worked food-economy (converging, second non-converged
axis), taking the 2030Z next blanks (1) and (2) in order. Zero src/js
across the run. No push, no bump. Merged locally, pending ship.

Base at arm start 112cd5154. Master moved four times under the run
(journey crisis r58 c1eb16dec; seat-taker Triage A6 1184626b7; plus the
two in-order arm merges themselves) — both branches rebased clean onto
each new master, proofs re-run green after every rebase, merged ff-only
in order spanpromo -> driedhunt. Final master a847835e7.

## Arm 1 — sim-spanpromo-b (NO PROMOTIONS, all 15 keys stay PROBE-PROVEN)

Commits (rebased): prereg abb67261e, evidence 220038188. Proof 15/15
post-rebase and on merged master.

The 2030Z run's first next blank, answered for competent policy. Pilot:
unscripted competent-nofeast band, 8 fresh collision-checked seeds
10012–10019, 100d max death-aware, census sweep and classifier reused
unchanged. Every one of the 15 probe-proven keys recorded 0 spans, 0
crossings, 0 exclusions on all 8 seeds. The only keys that fired were
the two cultivates (433 spans, all same-day, 0 records, 0 kcal
excluded). 13 keys never owned on the band; war_cry and trophy_room
owned-but-unfired on 4 seeds each (war_cry player-owned on 10014 and
still never tapped) — the sharpest form of the negative result. In
plain words: the probe proved these keys COULD swallow a night if
tapped at the last hour; this band proves competent-policy play never
taps them at any hour, because in node sims the only game-code
useAbility caller is cultivateGarden. LEG 3 (confirm) NOT triggered:
zero pilot signal, so no confirm band was run — per the prereg, a
negative band is a result, not a failure.

Det-gate: instrument OFF vs ON on seed 10012 identical on every
compared field. Sense-test: closest real-play span read end-to-end
(seed 10012, cultivate, day 46, same day, zero events inside) — the
gardener is done before dark, the opposite shape from the probe trace.

Wall (this band, competent-nofeast, 100d cap): national 0/8, table 0/8,
wins 0/8, wave 4–5 0/8, median 100d at cap, 23 villager deaths inside
surviving villages. Ledger work, not a reachability claim.

## Arm 2 — sim-driedhunt-b (FOUND on all three seeds)

Commits (rebased): prereg b294981ba, evidence a847835e7. Proof GREEN
post-rebase and on merged master.

The 2030Z run's second next blank, closed. Hunt order 9738 -> 9735 ->
9825, judged only against the prereg bar (stack-level flows accounting
for >=90% of the residual, tied to a mechanism and a code location):

| Seed | Residual | Found | Mechanism |
|---|---|---|---|
| 9738 (confirm) | -2,240 | 2,240 (100%) | unanswered-raid loot |
| 9735 (confirm) | -800 | 800 (100%) | unanswered-raid loot |
| 9825 (pilot) | -1,021 | 1,021 (100%) | unanswered-raid loot |

What the residuals were: NOT a dried bug. `villageAgencyDaily`
(src/js/villageAgency.js:203, via hierarchyDaily -> membershipDaily at
endDay) takes `_removePantryKcal(800)` when a pending raid defense goes
unanswered — longest-spoilDay-first, so Canned soup goes first, then
the longest-lived dried stacks. `_removePantryKcal` was the ONE
pantry-removal method no capture wrapped, so raid loot was invisible
to all six instruments. The game behavior is real (a spoken raid
consequence with a named champion and village); the gap was purely
instrumental. Corroboration: the same raids explain the Canned soup
family residuals to the kcal on all three seeds (-1,250 / -1,000 /
-1,750), while every other staple family closes exactly at 0.

Method: corpus-first hunt from the existing stockdoors corpora (never
overwritten), then a step-2 re-run of only the three seeds with a new
`_removePantryKcal` snapshot-diff + caller-stack capture into a new
directory. Det-gate PASSED on all three seeds — the re-run reproduces
every published stockdoors headline number exactly. Table-defiant's
tribute take excluded by reachability as pre-registered (endgame-only;
band never reaches the table).

Sense-test: the largest single stack flow (9738's 160|79 stack, 3,200
kcal dried day 64 by Benoit) reads as real village behavior — saved
just in time from spoilDay-65 fresh, raided 5 units day 65, the
remaining 15 units eaten day 78, the day before expiry. Nothing
robotic; the only edge is the instruments' missing door.

Wall numbers inherited from stockdoors, not this arm's own:
national/table/wins 0/20, wave 4–5 0/20 across both bands.

## Telemetry deviation check (same-run investigation, resolved)

Spanpromo corpus: 3 LOUD lines (national 12->0, table 16->0, wins
16->0). Driedhunt corpus: same 3 LOUD lines. Both are the known
regime artifact class (WINSEAT baseline vs pre-seat
competent-nofeast substrate; driedhunt's 3-file re-run corpus
compared against the stockdoors band itself shows zero deviation via
the det-gate, as the worker investigated same-run). No exiled LOUD
line. Baseline NOT rolled.

## Balanced panel (§15)

No panel artifact producible on either arm — balance-panel.js builds
panels from live roots / compares panel files, not census rows. This
is the standing exception recorded by the 1940Z, 2036Z, and prior
rounds (a corpus-ingest mode for the panel is itself a tooling blank
for a future run). Both arms were judged against their own
pre-registered bars instead, as prior measurement rounds were.

## Infrastructure

- Safe-commit index clobber hit all worker commits — repaired via
  HEAD-blob cacheinfo each time, commits verified correct.
- Worktree registration queued behind sibling lanes (~3 min); release
  at closeout queued behind a deep registry-lock queue (tackle-all
  lanes registering constantly) — see closeout note below.
- No EPERM flap on sweep writes this run. Sibling trees never touched.
- check.js --quick NOT re-run: zero src/js, zero green-list files,
  standing 280/7 pre-existing profile recorded by sibling runs.

## Closeout note (release pending at evidence-commit time)

Both arm branches are merged (commits verified ancestors of master
a847835e7) and both proof suites are green on merged master. The
worktree-release chain was still queued on the registry lock at
evidence-commit time; the release + branch deletion + reap + final
clean-tree verification are recorded in the run's closeout record
(memory log 2026-10-27) once the lock frees. The merges themselves
are complete and are NOT contingent on the release.

## Village assessment (plain words)

The village's pantry books now balance to the kcal on the dried side:
what looked like dried food vanishing was actually raiders taking
their cut when nobody answered the call — a real consequence the
instruments simply couldn't see. On the span side, the village never
does the exotic thing the probe feared: in ordinary competent play,
nobody taps those fifteen abilities at all, so no night ever gets
swallowed twice. The books are cleaner and the fears are smaller
than the probe suggested — but only for the kind of play the
competent policy represents. A village played any other way could
still tap those keys; that question needs a new kind of play, not
more of the same seeds.

## Next blanks, in order

1. A NEW INSTRUMENT for span promotion (spanpromo finding): any
   future promotion claim needs a policy or UI-driven play path that
   actually taps arbitrary ability actions. Do NOT re-run the
   promotion question under competent policy — it is answered (0/15).
2. Install the driedhunt `_removePantryKcal` wrapper (or fold it into
   stockdoors-capture) before judging any ledger on a band where
   raids/tributes/gifts can fire, or this same class reappears as an
   unexplained residual.
3. Carried from 2030Z: precheck gap for the three post-payment
   refusals (end_it_before, war_cry.challenge, trophy_room.mark);
   cultivate fresh-setup hall gate; zero-record outflow path
   accounting (alien raids now have a door — Light Fingers lifts,
   event/bulk takes, child pantry eats still unproven); stale-baseline
   rule for provenance preregs; treeline give/overrun band; span-log
   foodState gap.

food-economy stays converging (NOT converged): the pantry ledger now
closes on the dried side and the span-promotion question is answered
for competent policy, but no food-economy game fix has landed from
this axis, the real-play promotion instrument does not exist yet, and
the scale wall is untouched by this axis. scale-onramp stays
converging (untouched; sibling loop A — see its 2147Z claim).
Claim deleted; lock deleted at closeout.
