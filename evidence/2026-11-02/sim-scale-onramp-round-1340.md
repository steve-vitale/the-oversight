# sim-scale-onramp-round-1340 — Loop A 20261102: bearer-order rule + fed-march verdict

Run: fleshout-loop-a-20261102T1340Z, axis scale-onramp. Claim written
before any sims; retired to .DEAD at closeout. Sibling Loop B live on
food-economy throughout (1233Z claim at run start, retired mid-run;
new 1345Z vetobudget-confirm claim after) — NOT touched. Zero src/js
changes in either arm. Merged locally, pending ship (NOT pushed, NOT
bumped, NOT live-verified — ship loop owns deploys).

Pre-flight: main tree clean at 6674df432, disk 22%, reaper removed one
stale sibling tree (sim-homewardstep-b, branch kept) and touched no
active or dirty sibling tree. Master moved under this run once (this
run's own musterupkeep merge); the bearerorder branch was rebased
clean in its own worktree before merging (no rebase quirk this time).
Both arm proof suites re-run green on merged master (bearerorder
32/32, musterupkeep 35/35).

## Arm 1 — sim-bearerorder-a: DIAG-GO (the succession rule, named and proven)

Commits: 987a1c145 (prereg, written and committed BEFORE any judged
sim), 97b70f571 (results; rebased hashes). Proof:
scripts/test-bearerorder-a.js, 32/32 green. Evidence:
evidence/2026-11-02/sim-bearerorder-a.md (+ prereg). Instrument:
scripts/bearerorder-driver-20261102.js. DIAGNOSIS ONLY — no game-code
change, no recommendation on the pending Steve-call.

The rule, in one sentence: the mantle passes to the roster villager
with the highest sort-time village trust — entry trust plus a deeds
bonus of min(12, floor(agencyScore/4)), capped at 100 — with roster
order breaking sort-time ties, and committed status never consulted.

Proven on 19 independent bearer-succession events across 2 seeds
(97330: 10 events, 97338: 9 events). Sort-time winner == chosen in
19/19; the deeds-bonus formula predicts sort-time trust for EVERY
candidate in EVERY event (0 mismatches across 111 candidate-slots).
Code-read chain: ledger.js playerDeath sorts Game.npcIds() (roster
minus current bearer — no committed/engaged/away/member filter) by
state.village.trust; villager-agency.js playerDeath wrap rewrites
trust before the sort (the missing piece that made entry-trust
rankings look wrong); post-sort, the new bearer's trust resets to an
inheritance formula (does not affect the choice); titans.js
titanHavenBlades excludes Game.villagerId and titanReconcileBearer
re-filters muster.haven on every mantle pass, deleting
titanCommitted[new bearer] — a committed blade who becomes bearer
stops counting at once, alive or not.

Base rate: committed blades hold 12/111 candidate-slots (0.11) but
win 6/19 successions (0.32); in muster-window events where committed
blades were still candidates, 6/6 chosen were committed. This is
systematic, not seed luck: volunteers are picked by standing
(agency + trust/5) and succession picks by trust (+ agency bonus) —
the two selections draw from the same top of the village. Each win
costs the muster exactly one blade immediately, and the chain eats
precisely the committed set in trust order, then stops (97330: all 3
in one day, d106; 97338: all 3 across d115–d117).

Correction to closedecay (recorded, not hidden): the mantle does NOT
pass in commit order. 97330 commit order was Aroha, Vera, Nora;
succession order was Vera, Nora, Aroha. 97338 commit order was
Dmitri, Elif, Clinton; succession order was Dmitri, Clinton, Elif.
The SET is the same; the ORDER is trust order. The d106 gate movement
is per-pass 10 → 9 → 8 (end-of-day 8 unchanged). Neither correction
changes closedecay's verdict (the chain eats the muster).

What this means for the pending Steve-call (facts + options, no
recommendation — the ruling is Steve's): (a) keep the rule as-is
(committed blades stay eligible; muster shrinkage on bearer deaths
is the price of leadership churn); (b) exclude committed blades
from succession candidates (muster holds through successions;
mantle passes to the most trusted NON-committed villager); (c) keep
eligibility but narrate the consequence (a line when a bearer pass
un-commits a blade); (d) keep eligibility but re-tap the muster on
a bearer pass. This arm implements none of (a)–(d).

## Arm 2 — sim-musterupkeep-a: NO-GO (a fed march cannot preserve the coalition)

Commit: d813b0319. Proof: scripts/test-musterupkeep-a.js, 35/35
green. Evidence: evidence/2026-11-02/sim-musterupkeep-a.md (+ prereg).
Policy prototype: scripts/policies/musterfed.js (committed as a
measured-killed prototype, NOT landed as a fix). Instrument:
scripts/musterupkeep-driver-20261102.js.

Upkeep source + rate, from code: muster upkeep draws 1000 kcal per
blade per day at dawn from the scholar's pack alone
(Game.playerPackSpend in titanMusterUpkeep, src/js/titans.js) —
never from the village pantry — and charges −2 trust per mustered
link on any day the pack covers less than the full need, even on a
near-miss partial feed.

Measured on identical seeds vs the closecommit baseline (baseline
gate + trust series reproduced exactly first): the fed-march policy
(pack rations nightly up to the next dawn's need) moves allied trust
at day-matched contact by +6.0 on 97330 and +7.0 on 97338, against a
pre-registered bar of +20 on BOTH seeds. The bar fails on both
seeds, and the mechanism caps it: the need is 11,000 / 9,000 kcal
EVERY day while the pantry empties within two days of packing
(80,583 kcal packed on 97330, 38,090 on 97338, still starved);
fully-fed dawns are 1 of 44 (97330) and 2 of 39 (97338); the drain is
binary, so a partial feed buys exactly as much trust as zero. Only
~+2 of each gain is hunger actually saved (the single fully-fed
dawn); the rest is strike-timing divergence between trajectories.
Guardrail held: fed villages outlive baseline (village-lost d141 /
d152 vs d122), no earlier loss. Fights 0 in all four legs.

Two trajectory facts, recorded not hidden: (1) NEITHER fed scholar
ever ends a day on the lair tile (0 contact attempts in both fed
runs vs 12 / 6 in baselines) — attributed to trajectory noise from
a pantry-touching policy perturbing RNG and march outcomes, not to
feeding preventing contact; the day-matched trust comparison (which
does not depend on contact) misses by the same margin. (2) Gate at
day-matched contact differs (9 vs 8; 8 vs 6) because
bearer-succession timing diverged between arms (fed Haven blades
survive longer) — feeding adds no blades; cross-arm gate equality
is not a clean check while succession timing diverges.

What a GO would have meant (prereg, stated plainly): preserving
coalition trust for the NEXT call only — it would NOT have closed
the muster gap (gate fixed at call; feeding restores no
succession-eaten blade and cannot lift 97338's 9-blade ceiling above
the 10-blade gate). This NO-GO means even that narrower prize is out
of reach through the pack. A stores-draw upkeep fix (draw the
1000 kcal/blade/day from village stores, with a speakable cost line
when stores run thin) is now a Steve-call proposal, NOT built here:
this arm proves the pack route cannot fund it, not that the stores
route should be built.

## Wall numbers (this run's legs, not a new wall panel)

Judged legs: 97330 + 97338, closecommit baseline and fed-march arms.
National 0, table 0, wins 0, wave-5 unlocks 0, fights 0. (The
musterupkeep evidence notes a driver-computed national flag reading
1 at end on the 97338 baseline despite village-lost d122 — an
uninvestigated scale-audit artifact, NOT a national reach; do not
cite it as one.) Survival: baselines village-lost d122 / d122; fed
legs d141 / d152; bearerorder judged legs village-lost d122 / d122.
The standing wall picture is unchanged: full seat 0, wave 5 never
fought in normal play.

## Reachability verdict

The muster gap is now explained two layers deep and still open: a
sounded coalition that meets the gate at call (11 on 97330) is eaten
by its own successions in trust order before contact, and feeding
the march through the scholar's pack cannot preserve the trust that
bleeds meanwhile. No content reach changed this run: regional →
national, the table, and the win flag remain unreached in these
legs, and no game-code default flipped.

## Village assessment (plain words)

The village picks its next leader the way it picks its volunteers:
by trust. The people it trusts most are the people who stepped
forward to face the herald — so the mantle keeps falling on the
volunteers, and each time it does, the coalition quietly loses one
of its own blades, not because anyone ordered it but because the
new leader stops counting as a volunteer the moment she becomes the
leader. The village tried to feed the march too: every evening the
scholar packed everything the pantry held, and nearly every dawn
the muster was still hungry, because eleven blades eat eleven
thousand calories a day and the pantry holds barely one day of
that. The march lasted longer, the village held on weeks past where
it died before, but it never reached the herald at all — and the
coalition it was trying to preserve was still short of blades when
the village finally fell. The village is not betraying its
volunteers. It is promoting them, one funeral at a time, until none
are left to march — and carrying water in a cup to a thirsty army.

## Blanks filled or documented

Filled (diagnosis closed): (2) succession-order rule — DIAG-GO, rule
named from code and proven 19/19; (9) muster upkeep source + fed
march — NO-GO, pack route proven unable to fund the need.
Documented (evidence in arm files, not fixed): stores-draw upkeep
as a Steve-call proposal; dead-villager roster return (Nora Wilson
falls d106 on 97330, returns to the roster d112 appended last, wins
the mantle by sort-time trust — return mechanism unisolated,
deserves one look before anyone builds on roster membership as
"alive"); fed-scholar lair-contact cadence audit; 97338 end-state
national-flag artifact scale audit.

## Metric review (for the NEXT run, not these verdicts)

- Flat trust bars misgrade seeds: the +20 bar was unreachable on
  97338 by hunger removal alone (5 hunger days ≈ +10–11 ceiling).
  Future fed-march thresholds should be set from per-seed
  hunger-day arithmetic (days standing × 2), not a flat number.
- "Contact day" is a fragile primary-metric anchor across policy
  arms: a pantry-touching leg perturbs RNG and march outcomes, so
  contact may not occur at all. Day-matched trust is the sturdier
  primary for upkeep work; contact day should be secondary.
- A wrapper-entry trust snapshot is NOT sort-time trust: the
  villager-agency pre-sort wrapper rewrites trust before the ledger
  sort. Succession instruments must snapshot at the ledger's
  npcIds() call, or they mis-rank events and misjudge the rule.
- Same-day chains need distinct counting: a chain's passes are real
  events, but "2 independent events" must not be satisfiable by one
  day's cascade alone (this arm satisfied it many times over).
- Cross-arm gate equality is not a clean check while bearer
  succession timing diverges; gate claims need same-trajectory
  evidence or a succession-controlled comparison.
- Untouched and still open (from closedecay's metric review): the
  refusal line's allies-only "you have N" undercount and the
  12-attempts-on-one-day count.

## Telemetry deviation check

Both prescribed invocations REFUSE the recorder corpus (same class
as 1030Z / 1135Z / 1155Z / 1254Z: per-seed rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs). No LOUD
deviation lines; baseline NOT rolled. No --update-baseline, no
--allow-recorder-corpus override used.

## Infrastructure notes

- Registry-lock queue delayed the second worktree registration
  (~7 min: concurrent sibling registrations + reaps contending on
  REGISTRY.lock; the second register's git worktree add was slow
  under sibling load). No state harmed; both trees registered with
  fresh heartbeats before workers started.
- check.js --quick: started in the main tree after both merges, but
  after ~7 minutes it had consumed ~1s CPU (blocked idle, likely a
  hanging green-list test under heavy sibling load) and produced no
  output, so the coordinator terminated it rather than block closeout
  on it. NOT awaited and NOT claimed green: this run changed zero
  src/js, and both arm proof suites are green on merged master
  (32/32, 35/35). No stray tree changes from the terminated run
  (git status showed only this evidence file, untracked).
- safe-commit index-clobber check: run immediately after the
  coordinator commit — commit verified via git show --stat (single
  evidence file) and git status --short (clean) before closeout; any
  clobber would have been repaired via HEAD-blob cacheinfo and noted
  here (none hit).

## Next blanks, in order

1. STEVE-CALL: should a committed blade be allowed to become the
   bearer (options a–d in sim-bearerorder-a.md)?
2. Stores-draw upkeep proposal (Steve-call; needs ruling before any
   src/js work).
3. Dead-villager roster return mechanism (Nora d106 → d112).
4. Fed-scholar lair-contact cadence audit.
5. 97338 end-state national-flag artifact scale audit (NOT a
   national reach).
6. Carried: primary-arrears trap (Steve-call candidate).
7. Roster-cap / free-adult constraint on trusted quotas.
8. Tend saturation / marginal tend capacity.
9. Surprise-refusal seed for refusal-memory.
10. Bridge-walk narration line.
11. 12 vs 3–4 contact attempts on d110.
12. Carried: call standing-cost trace, 97489-style no-contact
    arrivals, blocked-then-arrived mechanism (97369, 97409).

Rotation left at 3 (convergence work does not cycle it).
