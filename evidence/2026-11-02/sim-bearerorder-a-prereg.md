# sim-bearerorder-a — PREREG (written BEFORE any judged sim in this arm)

Arm: bearer-succession ordering diagnosis, Loop A run
fleshout-loop-a-20261102T1340Z, axis scale-onramp. DIAGNOSIS ONLY —
no game-code behavior change. A Steve design ruling is PENDING on
whether a committed blade should be allowed to become bearer at all;
this arm must NOT change game code to exclude committed blades, which
would pre-empt his ruling. Instrument and diagnose only.

## Question (only this question)

sim-closedecay-a (evidence/2026-11-02/sim-closedecay-a.md) proved the
mechanism — the bearer succession chain eats the committed blades —
but left the ordering rule unisolated: why the mantle passes to Vera,
then Nora, then Aroha — exactly the commit order — on seed 97330, and
to Dmitri, then Elif on seed 97338. This arm names the rule from code
and reproduces it on judged bearer-succession events.

## Code hypothesis (read BEFORE any judged sim; to be confirmed or killed)

- Succession chooser: src/js/ledger.js playerDeath — "successor: the
  village chooses. Trust decides." Candidates = Game.npcIds() =
  src/js/betrayal.js npcIds() = village roster minus the current
  bearer, with NO filter for committed status, engaged status, away
  status, or traveling-with status. Candidates are sorted descending
  by village trust (state.village.trust[id]) and candidates[0] wins.
  Ties fall to JS sort stability, i.e. roster order.
- Commit pool: src/js/titans.js titanVolunteers() — available Haven
  villagers (not away, not traveling with the player, not engaged;
  isEngaged covers titanCommitted) sorted descending by
  Game.linkStanding(id) = agencyScore(id) + trust(id)/5
  (src/js/hierarchy.js linkStanding). titanCommitOwn takes the first
  3 of that order, in that order.
- Bearer exclusion (consequence, not chooser): src/js/titans.js
  titanHavenBlades excludes Game.villagerId, and titanReconcileBearer
  (wrapped around mantleBecome) re-filters every muster.haven on every
  mantle pass and deletes titanCommitted[new bearer]. So a committed
  blade who becomes bearer stops counting at once, alive or not.
- Candidate rival hypotheses to be killed or kept by the instrument:
  (a) roster order alone; (b) trust order (above); (c) standing order;
  (d) marching proximity / traveling-with status; (e) free-adult
  status. The instrument records ALL of these per candidate per event,
  so the winning sort can be read off the ranked lists, not asserted.
- The nomad road path (src/js/nomad.js nomadKill: party order, first
  non-companion party member) is a DIFFERENT chooser; the instrument
  counts mantleBecome calls made outside playerDeath so a road-path
  pass cannot be mistaken for a village-trust pass.

## Canon

docs/CANON.md read first. No canon doc covers titan musters, the
Herald, or bearer succession ordering specifically (MONSTER-WAVES.md
covers wave law, not muster accounting or succession; the succession
rule above is read from src/js/ledger.js, stated as code-read, not
invented canon). The closedecay arm's §"Instrument observations"
named this blank; this arm fills it.

## Primary metric (pre-registered, binds this arm)

For every bearer-succession event in the judged runs (playerDeath
path), the instrument (driver-side only; zero src/js changes) records,
BEFORE the engine chooses:
- the full candidate list in roster order and in trust-sorted order,
  each candidate with: name, village trust, linkStanding,
  agencyScore, roster index, committed flag (in muster.haven for
  'herald' OR in village titanCommitted), isMember, isEngaged,
  traveling-with flag, away flag;
- the chosen successor, its rank in the trust-sorted list, its rank
  in roster order, its rank among committed candidates, and whether
  it was committed;
- the muster gate before/after the pass (living allies + valid Haven
  blades, same judged-gate replication as closedecay);
- the mantle-pass transcript lines for that day.
Base rate per run: share of committed blades among candidates at each
event vs share of committed blades among chosen successors.

## GO threshold for a diagnosis claim (pre-registered)

DIAG-GO ONLY if BOTH hold:
1. The ordering rule is named from code AND the ranked candidate lists
   show the chosen successor is the rule's winner at each judged event
   (trust-descending winner, or whichever rival sort the lists prove).
2. The rule is reproduced on at least 2 independent bearer-succession
   events across at least 2 seeds, with the base-rate comparison
   reported (committed share among candidates vs among chosen).
A miss is DIAG-NO-GO, never re-scored against a friendlier metric
mid-run. A single-seed reproduction, or a rule named from code but
contradicted by a ranked list, is NO-GO.

## Seeds, horizon, guardrails

- Reuse the prior arm's closecommit driver/policy stack exactly
  (scripts/closedecay-driver-20261102.js policy stack: titanroute +
  musterclose + mustergap commit-own; scripts/policies/musterclose.js
  recovered verbatim in that arm — reproduction scaffolding, not a
  re-landing). New driver scripts/bearerorder-driver-20261102.js adds
  only the succession instrument; it does not change policy decisions.
- Seed 97330 first, 180d, death-aware (same cap as closedecay; run
  ends early on village-lost / win as the harness reports). Seed
  97338 second. If the known seeds do not yield >= 2 independent
  succession events across the 2 seeds, pilot-screen 8 seeds (pilot
  gate: 8 seeds before any confirm spend) under the same closecommit
  stack, and report the pilot as the fallback.
- Independent events: two mantle passes count as independent only if
  they follow different bearer deaths (a same-day chain like d106's
  Vera -> Nora -> Aroha counts as a chain, and the arm reports both
  the chain count and the distinct-death-day count, so a single day's
  cascade cannot silently satisfy "2 events" on its own — at least
  one event must come from a different death day or the second seed).
- SENSE-TESTING LAW: read at least one transcript snippet around a
  mantle pass and judge whether the fiction reads sensibly (does it
  make sense in-world that the new bearer is a committed blade?).
- Zero src/js changes. Policy files unchanged. No [needs-eyes]:
  diagnosis only, no feel/combat/UI change.

## Metric review (for the NEXT run, not this verdict)

To be filled at closeout: whether the trust-sorted candidate list
needs standing/agency columns as standard in future succession
instruments, and whether same-day chains need a distinct counting
rule in preregs generally.
