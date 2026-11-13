# Prereg — sim-silentvanish-b (finding #2308: VOICED JOIN, SILENT VANISHING)

Run `fleshout-loop-b-20261113T1430Z` (continuation), Loop B, axis winnability
chain. Check-first root-cause arm on finding #2308 (sim-findings.md):
on seed 190392 d137 a curious wanderer is taken in via the visitor-invite
path (betrayal.js `visitorInteract` 'invite', id `visjoin_136`) — both join
lines fire, roster grows 3→4 — yet daily roster snapshots show 3 again by
d138, and no say line in d137–139 mentions the newcomer leaving or dying.
Which removal path takes them is unproven.

Canon: no canon doc covers roster join/leave narration specifically
(closest: docs/CONVERSATIONS.md, docs/PARTY.md). The standing rule that
bears on this arm is "No silent actions — every action narrates honestly,
including failures" (docs/CANON.md). No canon invented here.

## Primary metric

Removal path NAMED with a code citation + instrument reproduction on
current master: the exact mechanism that removes the joined villager
from the roster, proven by an instrument that logs the removal
call-site + reason for the joined villager's id.

## GO threshold

- GO (diagnosis): removal path named with code citation AND reproduced
  by instrument on current master (seed 190392 d137 join + d138 loss,
  or a same-class join-then-vanish-within-a-day case in the probe band).
- GO (fix, only if the path is a defect): after-leg on identical seeds
  shows the join sticks OR the exit is voiced, AND probe-band
  survival/wave numbers are byte-identical to the before leg.
- NO-GO: no path named, or the event does not reproduce and no
  same-class case exists in the band (then the verdict is NO-REPRO /
  ANSWERED, not a fix — see below).

## Judge rule

Judge against this header; a miss is NO-GO, never re-scored mid-run.
If the path is honest (the wanderer died in a fight that was said
elsewhere, left via a voiced path the snapshot missed, or the event
does not reproduce and no same-class case exists), the verdict is
ANSWERED with citations and NO fix is built. If the path is a defect
(a removal that should voice but doesn't, or a wrong-path removal —
e.g. a newcomer swept by a cleanup meant for someone else), fix it
narrowly: the exit gets a say line, or the newcomer is exempt from
that sweep — one fix, proof test scripts/test-silentvanish-b.js
(RED→GREEN), and an after-leg on identical seeds.

## Horizon + why

150d, competent policy. 150d matches the voicejoins probe band (the
event sits at d137, so the horizon must cover it with tail); the
competent policy is the standard winnability-chain instrument. Death-
aware: dead villages stop simulating (+10d tail max), never a fixed
200d.

## Seeds

- Reproduction: seed 190392 first (the finding's seed).
- Screen if no repro: probe band 190391–190398 (8 seeds, 150d,
  competent) for ANY join-then-vanish-within-a-day case; a same-class
  case is a valid substitute, a fresh band with zero cases is a
  NO-REPRO result, not a fix.

## Policies

competent (`scripts/policies/competent.js`) throughout. No policy
variants — this is a root-cause check, not a lever comparison.

## Wall numbers (reported every run)

national / table / wins, wave 4–5 unlocks, median survival on the
probe band.

## Instruments (starting point, copied from the voicejoins arm)

- `scripts/silentvanish-d137-check.js` — roster d134–141 on 190392.
- `scripts/silentvanish-d137-instr.js` — visitorInteract /
  villageAutoRecruit roster deltas d130+.
- `scripts/silentvanish-d137-track.js` — daily roster snapshots d136–140
  + say lines d136–139 matching wanderer/visjoin/death/gone/leaves.
- A removal-tracer instrument (to be written once the repro leg is
  known): wraps `removeVillager` + every direct roster-filter site and
  logs day + call-site + how for the joined id.

## Metric review (to be filled in the evidence file)

- Whether the metric (path named + reproduced) held, and what (if
  anything) should change for the next run.
- Whether the d137 event reproduced on current master, and what the
  band screen found if it did not.

## Flap note

Host write flap episode observed during setup: `cp` to
`scripts/silentvanish-d137-instr.js` failed EPERM twice
(2026-11-13 ~16:59–17:00Z; flap-watch log confirms the same window),
succeeded on retry after writes probed OK. Logged here and in the
evidence file; no work lost.
