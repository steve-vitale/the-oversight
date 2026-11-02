# Journey social life r110 — PRE-REGISTRATION (lane B, 2026-11-02, written before any run play)

Leg 5 (social life). Rotation-b read 5 at run start → write 6 at
closeout (social → crisis wrap 5→6), and VERIFY the file reads 6
afterwards (rotation writes have repeatedly failed to stick in
recent Lane B runs; the file is the authority, not this note's
claim).

Run number basis: last Lane B run overall is r109 (endgame,
2026-11-02, wrote rotation 4 → 5). This run is r110. Slug
journey2-social (no prior registry entry, registered cleanly
2026-11-02T14:01Z; heartbeat verified in REGISTRY.json).

Base: local master at registration (6674df432). No push, no bump,
no live check — ship loop owns those. Gating freeze (2026-10-27)
stands; no gate, deed-bar, standing, wave, or table-price change
is in scope. Perception law untouched. Canon doc for the leg:
docs/CONVERSATIONS.md (dialogue, talk, gossip) — read before any
dialogue fix, not just the code comment. No canon doc covers
moots specifically; none invented here.

## Why this run

The last social-leg run is r5/r6 (2026-10-12, three weeks ago).
Its verdict: social content solid (39 full conversations, 36
natural ends across 2 seeds), but neither village lived long
enough for the social layer to pay rent (day-78 phoenix-link
wipe; day-26 monster wipe), and moot transcripts were thin —
mootNotes recorded the petition fired, not the exchange
(documented blank, not fixed). Since then the knowledge ledger
landed, conversation fixes landed (deflect cycling, teaching
friction closed, succession seams), and the loot/abilities build
shipped. This run re-judges the leg on current master: do
friendships, rivalries, gossip, and moots form, persist, and
matter across a full run — and does the moot transcript capture
now hold the exchange?

Harness smoke check (NOT run data): the 20261012 driver ran
seed 31101 at DAYCAP=12 on current master and completed
(day 13, 11 alive) — the sim-harness + competent + socialite
stack still loads. The r110 driver is that driver with a new
EVID dir, fresh seeds, and three instrument additions (bond
snapshots at d30/60/90/end, per-villager rumor spread, moot
exchange lines) — zero src/js changes in the driver itself.

## The questions

1. REACH: do full conversations, talk requests, feasts, and
   moots still fire organically in competent play?
2. BONDS: do friendships (trust ≥ 50) form and persist to end
   of run, and do rivalries/conflicts/grievances appear at all?
3. GOSSIP: do reputation rumors spread — does more than one
   villager carry rumor content by end of run?
4. MOOTS: does a moot fire, and does the capture now hold the
   exchange (not just the petition id)? This closes or
   re-documents the r6 blank.
5. PEOPLE: do the driven transcripts read like people (NPC
   wants something, options engage/deflect, endings
   resolve/plant/owe; no fabricated shared history, no filler
   loops, no verbatim parrot)?

## Pre-registered metrics (BINDING — §14)

Pilot: 4 seeds (31101–31104), DAYCAP=140, competent + socialite
policy, full-run horizon; a dead/scattered village stops
simulating (death-aware horizon, +10d tail max is automatic:
runDays ends the run).

- M1 reach: ≥3 of 4 seeds record ≥10 full conversations with
  ≥80% natural ends. (r6 bar, kept.)
- M2 bonds: ≥1 friendship (trust ≥ 50 at any snapshot or end)
  in ≥3 seeds; ≥1 rivalry/conflict/grievance record in ≥2
  seeds. If rivalries are 0 everywhere, that is a finding
  (documented absence), not a re-score — the bar judges
  whether the rivalry channel fires, and a miss stands.
- M3 gossip: rumor content carried by ≥2 distinct villagers
  (or ≥2 distinct rumor keys in the village rep record) in
  ≥2 seeds.
- M4 moots: ≥1 moot fires in ≥2 seeds AND at least one
  mootNote carries ≥3 exchange lines. If moots fire but
  captures stay thin, the r6 blank is RE-DOCUMENTED, not
  re-scored as a pass.
- M5 sense: people-check transcripts sense-read in full; 0
  senseless flags = GO. Any verbatim-parrot-class break is
  fixed same-run with a proof test, or carried OPEN with
  the transcript quoted.

An interesting finding: anything that overturns the r6 picture
— villages living past day 100 with a social layer that pays
rent (joint outings kept, favors completed, moots changing
minds), or a new senseless-dialogue break, or rivalries
firing where r6 saw none.

## Addendum — pilot v1 discarded, scored panel re-run (written before the scored run)

Pilot v1 (narration off, the 20261012 driver's default) ran all
4 seeds to completion before the instrument bug was caught:
31101 survived d141 (170 convs, 165 natural, 20 feasts, 3
moots); 31102 village-lost d109 (75/71, 15 feasts, 1 moot);
31103 survived d141 (118/102, 20 feasts, 2 moots); 31104
village-lost d117 (101/92, 23 feasts, 1 moot). Every mootNote
in v1 captured 0 exchange lines. Root cause, found
instrument-side: sim-harness silences G.say unless
opts.narration is true, and moot speeches travel via say →
emit — the capture wrapped emit but the channel was muted, so
v1's moot captures are void. The same defect explains r6's
thin moot transcripts (same harness default). V1 is therefore
NOT the scored panel; its non-moot metrics stand as
supporting evidence only, and the v1 files are kept as
journey-social-life-r110v1-3110{3,4}.json (31101/31102
numbers preserved in the run note; files removed before the
rename to avoid a v2 filename collision).

Scored panel: the r110 driver with narration: true (say is
narration-only; no game code, policy, or seed changes) plus a
raised emit-capture cap (4000 → 50000) so a moot day's slice
cannot be trimmed mid-day. M1–M5 are judged on the scored
panel only. If scored-panel non-moot metrics diverge sharply
from v1, that divergence is investigated as a narration-on
effect before any verdict.

## Metric review

(To be filled after play. A metric that proves wrong is
written here and proposed for the NEXT run, never re-scored
mid-run.)
