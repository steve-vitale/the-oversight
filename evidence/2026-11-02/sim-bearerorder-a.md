# sim-bearerorder-a — bearer-succession ordering rule (Loop A 20261102)

Arm: bearer-succession ordering diagnosis, Loop A run
fleshout-loop-a-20261102T1340Z, axis scale-onramp. DIAGNOSIS ONLY —
zero src/js changes, zero policy-decision changes (the closecommit
policy stack is reused verbatim from sim-closedecay-a). A Steve design
ruling is PENDING on whether a committed blade should be allowed to
become bearer at all; this arm does NOT change game code to exclude
committed blades and does NOT recommend a ruling — it names the rule,
proves it, and states the options plainly (§"What this means for the
pending Steve-call"). Ready for coordinator merge, pending ship (NOT
pushed, NOT bumped, NOT live-verified — ship loop owns deploys).

## Verdict: DIAG-GO

The pre-registered GO threshold is MET, with margin: the ordering rule
is named from code AND reproduced on 19 independent bearer-succession
events across 2 seeds (10 on 97330, 9 on 97338), with the base-rate
comparison reported below. Proof test: scripts/test-bearerorder-a.js,
32/32 green. Prereg: evidence/2026-11-02/sim-bearerorder-a-prereg.md,
written and committed BEFORE any judged sim in this arm.

## The rule, in one sentence

The mantle passes to the roster villager with the highest
sort-time village trust — entry trust plus a deeds bonus of
min(12, floor(agencyScore/4)), capped at 100 — with roster order
breaking sort-time ties, and committed status never consulted.

## The rule, from code (all read, not inferred)

1. Chooser — src/js/ledger.js playerDeath ("successor: the village
   chooses. Trust decides."): candidates = Game.npcIds(), sorted
   descending by state.village.trust, candidates[0] wins.
2. Candidate pool — src/js/betrayal.js npcIds(): village roster minus
   the current bearer, NOTHING else. No filter for committed status,
   engaged status, away status, traveling-with status, or membership
   (a non-member in the roster can win — see d112 below).
3. Pre-sort deeds bonus — src/js/villager-agency.js playerDeath wrap
   (runs BEFORE the ledger sort; this was the missing piece that made
   entry-trust rankings look wrong): for every roster member except
   the bearer, trust += min(12, floor(agencyScore/4)), capped at 100.
   agencyScore (villager-agency.js) = achievement magnitudes +
   expeditions*2 + monsterKills*8 + nodes visited + tier*4. The bonus
   is why entry-trust rank 5 (Piper, d93) still won: her agency 115
   lifted her 90 -> 100 at sort time.
4. Post-sort office transfer — src/js/ledger.js (after the choice):
   the new bearer's trust is reset to an inheritance formula (40%
   dead bearer's trust + 40% own trust + vouch bonus). This explains
   the large post-pass trust drops in the traces (e.g. Piper 100 ->
   62); it does NOT affect the choice, which already happened.
5. Consequence, not chooser — src/js/titans.js: titanHavenBlades
   excludes Game.villagerId, and titanReconcileBearer (wrapped around
   mantleBecome) re-filters every muster.haven on every mantle pass
   and deletes titanCommitted[new bearer]. A committed blade who
   becomes bearer stops counting at once, alive or not.
6. Why the volunteer pool overlaps the succession pool — src/js/
   titans.js titanVolunteers(): available Haven villagers sorted
   descending by linkStanding = agencyScore + trust/5
   (src/js/hierarchy.js). The commit takes the first 3. Volunteers
   are therefore drawn from the village's high-standing (high-trust,
   high-agency) people — the same people the succession rule favors.
   There is NO committed-first rule anywhere: committed blades come
   first only when they top the trust+bonus ranking, which, on these
   seeds, they did every time while any remained.

## What the rival hypotheses came to

- Roster order alone: KILLED. Chosen successors sit at roster ranks
  1-8 with no roster pattern; sort-time trust rank is 1 in 19/19.
- Standing order alone: KILLED. Standing rank of the chosen is 1 in
  only 12/19 events (e.g. d103 Vera standing rank 2, d117 Clinton
  standing rank 3) — standing explains the volunteer pool, not the
  succession pick.
- Marching proximity / traveling-with: KILLED. Committed blades show
  travelingWith=false, away=false at every muster event; an
  away-flagged villager (Piper, d93) won a non-muster event.
- Free-adult / member status: KILLED. Nora Wilson won d112 on 97330
  with isMember=false (see instrument observation below).
- Commit order: KILLED as the succession order. Same SET, different
  order, on both seeds (see §"Correction to closedecay").

## Per-event numbers (judged runs: 97330 r3, 97338 r3)

Instrument: scripts/bearerorder-driver-20261102.js — driver-side only.
It snapshots the full candidate list BEFORE the engine chooses (name,
trust, standing, agency, roster index, committed flag, member,
engaged, traveling, away), re-reads the list at the ledger's own
npcIds() call (sort-time trust), and records the chosen successor
plus the gate before/after each pass. Sort-time winner == chosen in
19/19 real events; the deeds-bonus formula predicts sort-time trust
for EVERY candidate in EVERY event (0 mismatches across 111
candidate-slots). Event sequences reproduce identically across driver
versions (r2 == r3 on both seeds; r4/r5 on 97330 identical) — the
instrument did not move outcomes. All passes went through playerDeath
(mantleOutsidePlayerDeath == 0); the nomad road party-order path
never fired in these runs.

Seed 97330 (call d97, gate 11; village-lost d122):

| day | old bearer -> chosen | committed? | cand / comm | gate before -> after |
|-----|----------------------|------------|-------------|----------------------|
| 93 | Jenny -> Piper | no | 10 / 0 | — (pre-muster) |
| 94 | Piper -> Piya | no | 9 / 0 | — |
| 95 | Piya -> Patrick | no | 8 / 0 | — |
| 103 | Patrick -> Vera | YES | 6 / 3 | 11 -> 10 |
| 106 | Vera -> Nora | YES | 7 / 2 | 10 -> 9 |
| 106 | Nora -> Aroha | YES | 6 / 1 | 9 -> 8 |
| 106 | Aroha -> Lamar | no | 5 / 0 | 8 -> 8 |
| 107 | Lamar -> Ivy | no | 5 / 0 | 8 -> 8 |
| 112 | Ivy -> Nora | no | 5 / 0 | 8 -> 8 |
| 122 | Nora -> Omar | no | 3 / 0 | 8 -> 8 |

Seed 97338 (call d113, gate 9 already short; village-lost d122):

| day | old bearer -> chosen | committed? | cand / comm | gate before -> after |
|-----|----------------------|------------|-------------|----------------------|
| 16 | Ming -> Catalina | no | 10 / 0 | — (pre-muster) |
| 37 | Catalina -> Jian | no | 9 / 0 | — |
| 97 | Jian -> Alfredo | no | 7 / 0 | — |
| 112 | Alfredo -> Jovan | no | 6 / 0 | — |
| 112 | Jovan -> Sanne | no | 5 / 0 | — |
| 115 | Sanne -> Dmitri | YES | 4 / 3 | 9 -> 8 |
| 117 | Dmitri -> Clinton | YES | 3 / 2 | 8 -> 7 |
| 117 | Clinton -> Elif | YES | 2 / 1 | 7 -> 6 |
| 117 | Elif -> Enzo | no | 1 / 0 | 6 -> 6 |
| 122 | (no candidates — village lost; not a succession) | — | 0 / 0 | 6 -> 6 |

The 6 committed-choice events in detail (all were already
entry-trust rank 1 BEFORE the deeds bonus, so the bonus did not
decide the chain — pre-existing village trust did):

- 97330 d103: Vera, entry trust 95, agency 4 (bonus 1) -> sort 96.
  Commit order at the time: Aroha, Vera, Nora.
- 97330 d106: Nora, entry 94, agency 4 (bonus 1) -> sort 95.
- 97330 d106: Aroha, entry 93, agency 7 (bonus 1) -> sort 94.
- 97338 d115: Dmitri, entry 93, agency 4 (bonus 1) -> sort 94.
  Commit order: Dmitri, Elif, Clinton.
- 97338 d117: Clinton, entry 92, agency 1 (bonus 0) -> sort 92,
  tied with Elif at 92; earlier roster entry wins the tie.
- 97338 d117: Elif, entry 93, agency 2 (bonus 0) -> sort 93.

Tie-break evidence (sort-time top ties, stable sort = roster order):
97330 d93 Piper/Piya tied at 100 (capped), earlier roster entry
Piper wins; 97338 d117 Clinton/Elif tied at 92, earlier roster entry
Clinton wins.

## Base-rate comparison (pre-registered)

- All real succession events, both seeds: 111 candidate-slots, 12
  committed (0.11); chosen successors committed in 6 of 19 events
  (0.32). Committed blades are chosen at roughly 3x their share of
  candidate-slots — because they sit at the top of the trust ranking,
  not because the rule sees commitment.
- Muster-window events where committed blades were still candidates
  (6 events: 97330 d103 + d106x2, 97338 d115 + d117x2): 28
  candidate-slots, 12 committed (0.43); chosen committed 6/6 (1.00).
- The chain self-terminates: each pass removes exactly one committed
  blade from the muster (bearer exclusion) and from future candidacy
  (as bearer, then by death/removal), so the chain eats precisely the
  committed set in trust order, then stops. On 97330 it consumed all
  3 in one day (d106); on 97338 all 3 across d115-d117.

## Correction to closedecay (recorded, not hidden)

sim-closedecay-a said the mantle passes "exactly the commit order"
on 97330. That is wrong: commit order was Aroha, Vera, Nora;
succession order was Vera, Nora, Aroha. On 97338, commit order was
Dmitri, Elif, Clinton; succession order was Dmitri, Clinton, Elif.
The SET is the same; the ORDER is trust+bonus order, not commit
order. Likewise the d106 gate movement is per-pass 10 -> 9 -> 8, not
a single jump to 8 (end-of-day 8 is the same figure closedecay
reported; the per-pass steps refine it). Neither correction changes
closedecay's verdict (the chain eats the muster); both matter for
anyone predicting WHO goes next.

## Sense-testing (transcript judged for meaning)

Read from the judged runs (97330 r3, 97338 r3):

- d103: "📖 The Codex turns a page: Patrick Castillo, 103 days. The
  mantle passes to Vera Bhatt." / "🪞 You wake up somebody else. Vera
  Bhatt, 31 — a Chef." The succession fiction itself reads sensibly:
  the village picks a trusted face, and a volunteer who stepped
  forward to die for the coalition is exactly the kind of person a
  village would trust with the mantle. Nothing in the fiction says
  she stops being a blade.
- d106 chain: three mantle passes in one day, each "You wake up
  somebody else" — Vera, then Nora, then Aroha, each dead by day's
  end. As fiction it reads as a massacre of leaders on the march,
  which IS the story. What never sounds is the muster consequence:
  no line ever says "the coalition lost a blade" when a bearer pass
  un-commits one. A player watching only the muster count would see
  it fall 11 -> 10 -> 9 -> 8 and never be told why. That silence, not
  the succession itself, is the sense gap — the same gap closedecay
  flagged for the refusal line.
- The commit line's warning ("They can die — Haven does not get them
  back") stays true under this rule, but its picture stays wrong in
  the same way closedecay noted: they die as the player, one after
  another, in ordinary wild fights on the march, not standing in
  front of the herald.
- Does it make sense in-world that the new bearer is a committed
  blade? Yes, on the fiction's own terms: the village does not know
  (or does not weigh) that the candidate marched with the muster;
  it picks the most trusted face, and the most trusted faces are the
  ones who volunteered. Whether that SHOULD be the rule is the
  pending Steve-call below — the fiction does not make it absurd,
  and it does not make it obviously intended either. The instrument
  cannot settle intent; only the ruling can.

## What this means for the pending Steve-call (facts + options, no recommendation)

Facts for the ruling:
- Committed blades are eligible for the mantle because succession
  never looks at commitment, engagement, or muster membership — it
  looks at trust (+ a small deeds bonus) over the whole roster.
- Committed blades win while any remain because volunteers are
  picked by standing (agency + trust/5) and succession picks by
  trust (+ agency bonus) — the two selections draw from the same
  top of the village. This is systematic, not seed luck: 6/6
  committed-choice events across 2 seeds, every one entry-trust
  rank 1.
- Each win costs the muster exactly one blade immediately (bearer
  exclusion), whether or not the new bearer then dies. The muster
  never re-taps in the closecommit leg, so the loss is permanent for
  that muster.
- Excluding committed blades would change WHO can become bearer in
  exactly the runs where the village's most trusted people are the
  volunteers — i.e. it would hand the mantle to a less-trusted
  villager precisely when the trusted ones marched. Keeping the rule
  keeps the fiction (the village picks its most trusted face) and
  keeps the cost (the muster bleeds on every leadership death).
Options, stated plainly (no recommendation; the ruling is Steve's):
  (a) Keep the rule as-is: committed blades stay eligible; the
      muster shrinking on bearer deaths is the price of leadership
      churn, and the village's story includes losing its volunteers
      to the mantle.
  (b) Exclude committed blades from succession candidates: the
      muster holds its blades through successions; the mantle then
      passes to the most trusted NON-committed villager.
  (c) Keep eligibility but narrate the consequence: no rule change,
      but a line when a bearer pass un-commits a blade, so the
      muster count's fall is explained in-fiction.
  (d) Keep eligibility but re-tap the muster on a bearer pass (a
      fresh commit episode when a blade becomes bearer): the muster
      refills, at whatever cost a re-tap should carry.
This arm implements none of (a)-(d) — (a) is the status quo, and
(b)-(d) are game-code changes that would pre-empt the ruling.

## Metric review (for the NEXT run, not this verdict)

- A wrapper-entry trust snapshot is NOT sort-time trust: a
  pre-sort wrapper (villager-agency.js) rewrites trust before the
  ledger sort. Future succession instruments must snapshot at the
  ledger's npcIds() call (inside the death), not at playerDeath
  entry, or they will mis-rank 4 of 19 events (d93, d112 on 97330;
  d37, d112 on 97338 in entry-trust terms) and misjudge the rule.
  The driver built here does both and reconciles them; keep that
  pattern.
- Same-day chains need the distinct counting rule this prereg used:
  a chain's passes are real events, but "2 independent events" must
  not be satisfiable by one day's cascade alone — this arm satisfied
  it many times over (distinct death days d103, d106, d115, d117
  across 2 seeds), so no verdict change, but the rule should stay in
  future preregs.
- The entry-trust anomalies (rank 5 / rank 3 winners) were the most
  valuable part of this run: without chasing them to the
  villager-agency wrapper, the honest verdict would have been
  DIAG-NO-GO on a rule that is in fact exact at sort time. When a
  ranked list contradicts a code-read rule, instrument INSIDE the
  call (npcIds-time snapshot, write traps) before doubting the rule.

## Instrument observations (not verdicts)

- Nora Wilson returns to the roster on d112 (97330) after falling
  d106: daily roster snapshots show her absent d106-d111 and present
  (appended last) on d112, before Ivy's death that day; she then
  wins the mantle by sort-time trust (91 vs Omar 90) and falls again
  d122. The return mechanism is NOT isolated by this arm (no
  'walks in' line was captured for it in the filtered transcript,
  and it is outside the ordering question). It does not affect the
  ordering verdict — at choice time she was a legitimate roster
  candidate by the engine's own list — but a dead villager returning
  to candidacy deserves one look before anyone builds on roster
  membership as "alive".
- The d122 event on 97338 (0 candidates) is a village-lost, not a
  succession: the driver records chosen == old bearer with
  candidateCount 0. It is excluded from all rates above.
- Game.state.village.titanCommitted reads {} on muster days in the
  closedecay diag run; this arm's committed flag comes from
  muster.haven (the gate's actual input) plus the titanCommitted map
  as a secondary field, so the verdict does not depend on that map.
  Where titanCommitted lives after commit remains unexplained (same
  observation as closedecay).

## Canon

docs/CANON.md read first. No canon doc covers titan musters, the
Herald, or bearer succession ordering (MONSTER-WAVES.md covers wave
law, not muster accounting or succession). Everything above is
code-read (ledger.js, betrayal.js, villager-agency.js, hierarchy.js,
titans.js) plus judged sim traces, not invented canon.

## Files committed (this arm)

- scripts/bearerorder-driver-20261102.js — succession instrument
  (closecommit stack reused verbatim; driver-side reads + wrappers
  only; includes the npcIds sort-time instrument, the bumpTrust
  silence check, and the BO_TRUSTPROXY=1 trust-write trap used for
  the villager-agency mechanism follow-up — off by default)
- scripts/test-bearerorder-a.js — proof test, 32/32 green (read-only)
- evidence/2026-11-02/sim-bearerorder-a-prereg.md (pre-sim prereg)
- evidence/2026-11-02/sim-bearerorder-a.md (this file)
- evidence/2026-11-02/perseed-bearerorder-a/*.json (7 run records:
  97330 r1/r2/r3/r4/r5, 97338 r2/r3 — r2 pre-instrument reproduction,
  r3 judged, r4 bumpTrust-silence check, r5 trust-write Proxy stack
  naming villager-agency.js:1439 as the pre-sort trust writer)

## Village assessment (plain words)

The village does not pick its next leader by asking who is free, who
is marching, or who volunteered to die facing the herald. It picks
the person it trusts most — and because the people who volunteer
are the people it already trusts most, the mantle keeps falling on
the volunteers. Each time it does, the coalition quietly loses one
of its own blades: not because anyone ordered it, but because the
new leader stops counting as a volunteer the moment she becomes the
leader. The village is not betraying its volunteers. It is promoting
them, one funeral at a time, until none are left to march.
