# sim-scale-onramp-round-1215 — coordinator evidence (2 DIAG-GO arms, merged locally pending ship)

Run: flesh-out loop, run fleshout-20261030T1215Z, axis scale-onramp
(converging, NOT converged). Sibling loop B live on food-economy at
run start (claim 1130Z, NOT touched) and sibling playtest
journey-landing live (NOT touched). No lock at run start, main tree
clean, disk 17%. No live claim on scale-onramp at run start, so the
axis was free. This run took the 1122Z run's ranked-next items (1)
and (2) in order: the dissolve-cause recorder, then fled coverage.
Rotation NOT advanced: the standing directive suspends rotation
until a run demonstrates national reached in sims.

Both arms DIAG ONLY, measurement + one policy-side instrument, zero
src/js game changes, no default flip, no gate move, no deed-bar
move. No [needs-eyes]: neither arm changes feel, combat, or UI.
Merged locally, pending ship. No push, no version bump, no live
verification (the batch ship job owns deploys).

## Pre-registration (binding, per arm)

- sim-dissolvecause-a: prereg 8baec319a (rebased; worker original
  734dd74d7c), committed BEFORE any judged analysis. Primary
  metric: dissolveCause coverage on dissolved rows in a fresh
  sweep (>=95% bar) + scholarHpAtDissolve coverage (100% bar) +
  both sense questions answered.
- sim-fledcover-a: prereg 862f39c7d (rebased; worker original
  f8a7f10e9), committed BEFORE any judged analysis. Primary
  metric: fled lingerer fights observed with origin + restore
  outcome classified (GO >=1, stronger bar >=3 in the report's
  terms as met by 3 scenarios); a preregistered search yielding
  0 was defined in advance as coverage-still-empty, never a rate.

## Arm 1 — sim-dissolvecause-a (DIAG-GO)

Builds the dissolve-cause recorder (policy-side only, in
scripts/policies/scholarmelt-diag.js; zero src/js) and runs a
fresh sweep on the draftflag substrate (seeds 75101-75116, 180d
death-aware, tableseat-nowait). Substrate neutrality proven, not
assumed: row-minus-scholarmelt identical 16/16 after normalizing
only the worktree slug embedded in removal stack frames (raw
difference disclosed in the arm evidence; census byte-identical
16/16; pilot 8/8 byte-identical on re-run).

Judged counts (fresh corpus, evidence/2026-10-30/
perseed-dissolvecause-a/): dissolved rows 120 (75102: 32, 75104:
45, 75105: 43, rest 0) — same seeds and counts as draftflag.
Cause coverage 120/120 (100%, bar >=95%), ALL 'start-post-gone'
(fight gone at startCombat post-record, no tbEnd seen); flush
causes 0, barrier-death stamps 0, null 0. Scholar HP at dissolve
120/120 (100%, bar 100%), all exact-HP rows. Fates re-checked
via dissolve-a's classifier verbatim: SCHOLAR-RESTORED 75,
SPAWN-ENDED 45, melts 0, unclassified 0; lingerer-origin 60/60
restored.

Answers, plainly: (a) a herald fight with no tile monster is
started by a pending-encounter resolution — instantiated by
species id, not lifted from a tile entity — which is why there
is nothing to lift, nothing to restore, and nothing at stake;
the pending survives each dissolved start (pendingMonsterId
'herald' still present after the call on all 45 spawn-ended
rows), so the scholar re-faces it 5-12 times a day for six
days. The barrier-death lead is REJECTED BY MEASUREMENT (0
stamps; bearer unchanged and game not over on 120/120 probe
rows; these fights never reach a player turn). (b) Dissolved
starts cost exactly 0 HP: within-fight delta 0 on 120/120 rows.
The s75104 grind (100->35) is entirely cross-day between-deltas
(-12/-12/-12/-17/-12) with zero non-dissolved scholar meetings
on those days — overnight/between-day attrition, not
dissolved-fight damage. Same-day between-steps of exactly -2
(5 pairs, s75102 only) are a between-start cost, not a fight
effect (within delta 0 on those very rows).

Proof: scripts/test-dissolvecause-a.js FIXTURES-PASS 52/52,
green before judged analysis and re-run green on the merged
tip. Commits (rebased onto the fledcover tip clean, proofs
re-run): prereg 8baec319a, instrument 0a442b6de, analyzer
a04a37d5e, evidence a7574c1b5. Backlog item "dissolved meetings
need a dissolve-path recorder" is now FIXED (fate retired by
dissolve-a, cause measured here); the surviving narrower
residual is a new item (see ranked next #1).

## Arm 2 — sim-fledcover-a (DIAG-GO, STRONG)

The fled half of lingerer-keeps is no longer unobserved, and
the answer is: a fled restore blocks exactly the same way as
a lost restore — the treeline tile decides, not the exit verb.

Leg N (natural fresh band, seeds 75201-75208, 180d death-aware,
tableseat-nowait stack verbatim): 54 tbend events — won 25,
routed 9, lost 20, fled 0; scholarmelt meetings fled 0. The
natural fled population is empty on a second band too — still
an empty population, never a rate. Nearest-miss corroboration:
all 20 Leg N lost rows are lingerer-origin, and 4 blocked the
old-band way (fellow besieger at (4,4)).

Leg S (scripted scenarios, seed 75102, real fought fights with
>=2 damaging strikes, monster turns advanced, flee through the
engine's own door/barrier exits — never an outcome table, never
a direct tbEnd call): S-clear (gallowdeer, Haven door) RESTORED
(origin back at (4,4) at 130 HP, restore-cap check exact);
S-blocked (gallowdeer + callback blocker 200 HP w3 lingering
same tile) BLOCKED (origin absent, callback still stands);
S-chase (bulldozer follows:true, 2 barrier crossings until
pursuit exhausts) RESTORED (origin back at (4,4) at 68 HP, cap
check exact). Leg C (policy-variant flee inducer) was never
invoked, per prereg — Leg S answered the question first. No
new recorder field was built (Leg N reuses draftflag +
scholarmelt fields verbatim), so there is no overlap with the
parallel dissolvecause recorder.

Caveats, stated in the arm evidence and carried here: 3 staged
fights must never be quoted as a fled restore rate (2 restored
/ 1 blocked is mechanism, not frequency); the natural-band fled
rate remains unmeasured (0 observations on 24 seeds across two
bands); S-chase fidelity flag — the bulldozer never landed a
blow (scholar HP 100 throughout), so the chase-to-fled-to-
restore path is proven, not a damage race; no canon doc covers
fled/restore rules (MONSTER-WAVES.md covers wave law only),
the rule lives in game.js comments, and nothing was invented
to fill that gap.

Proof: scripts/test-fledcover-a.js FIXTURES-PASS 19/19, green
before judged analysis, scenarios run twice byte-identical,
analyzer run twice byte-identical. Commits (rebased onto
bab13342b clean, proofs re-run): prereg 862f39c7d, work
7a593fbf9. Wall numbers for Leg N only (report-only, NOT
mixed with the 75101-75116 band): won 2/8 (full 0), national
ever 7/8, national final 4/8, table reached 4/8, table entered
2/8, wave reach 8/8/7/4/0, sweep median days 180, deaths 287.

## Wall numbers (dissolvecause fresh corpus, report-only)

Exact match to draftflag/blockedrestore on every figure: wins
9/16 (all lesser, full 0), national ever 13/16, national final
11/16, table reached 12/16, table entered 9/16, wave reach
16/16/14/9/0, median survival 118d, deaths 527. No before/after
claim: the recorder is an instrument, and the identical wall
is its neutrality proof, not a lever result.

Telemetry deviation check vs the scale-wall baseline:
node scripts/telemetry-check.js --baseline <scale-wall.json>
--current 'evidence/2026-10-30/perseed-dissolvecause-a/
s*-fresh.json' --sweep-rows --metrics national,table,wins,
exiled — QUIET (16 seed rows, 0 non-row files skipped, 4
metrics, no large deviations); wall line nationalEver=13/16
nationalFinal=11/16 table=12/16 entered=9/16 won=9/16,
matching the arm exactly. Baseline NOT rolled: the fresh
sweep reproduces the baseline wall exactly, so there is no
deviation to absorb. (Sweep-rows-only ingest, per the 1122Z
lesson — mixing census files with sweep rows manufactures
LOUD lines.)

## Reachability verdict

Unchanged by this run (measurement only): waves 1-4 reachable,
wave 5 unreachable on this band (0/16), the table reachable
only through the lesser seat, the full seat unreached. What
this run changes is the wall's plumbing, not its height: a
dissolved scholar fight now has a measured cause and a
measured HP path, the barrier-death lead is closed, the
phantom-herald loop is explained as a surviving pending, and
the fled half of lingerer-keeps is now observed — fled
restores block on a held tile exactly like lost restores.

## Village assessment (plain words)

When the scholar's fight against the great herald beast falls
apart before it starts, it falls apart in the same breath it
was called — and it costs the scholar nothing: same strength
afterwards as before, beast still standing where it was.
On one seed there is no beast at all, only the promise of
one, and the scholar spends six days facing that promise
over and over while it never arrives; the strength that
slips away across those nights slips away overnight, not in
the empty fights. And now the other half of the siege story
is seen for the first time: when the scholar actually runs
from a siege fight, the beast comes back if the treeline is
clear, and stays gone if another beast still holds the
ground — running away is judged by the same crowded ground
as losing, not by how the scholar left.

## Metric review

- Both preregs bound their runs and were honored: no metric
  was re-scored mid-run. Dissolvecause's cause (100%) and HP
  (100%) bars cleared outright; fledcover's GO was met by
  scenarios after the preregistered natural search returned
  0 — exactly the fork the prereg defined (search yields 0
  means coverage-still-empty for the NATURAL rate, while the
  scenario leg answers the MECHANISM question; the two are
  never blended into one rate).
- COORDINATOR JUDGMENT CALL (documented for Steve's overrule):
  dissolvecause's worker disclosed that if the (a) bar were
  read as requiring the exact in-call step that nulls
  tbfight, (a) alone would be NO-GO on that reading. I judge
  DIAG-GO stands: the prereg asked what code path STARTS a
  herald fight with no tile monster, and that is answered
  (pending-encounter resolution; barrier-death rejected by
  measurement). The in-call nulling step is a different,
  narrower question — bounded by this instrument (inside
  the startCombat call, no tbEnd, no throw, no death, no
  mantle pass) and carried as ranked next #1 — not a
  verdict reversal. The evidence is written so the stricter
  reading can be applied without re-running anything.
- Prereg-wording note for the NEXT run (from dissolvecause,
  not a revision to this verdict): write a substrate leg as
  "identical modulo recorded filesystem paths" from the
  start — the removal recorder embeds absolute worktree paths
  in stack frames, so raw byte-identity fails on a directory
  name, not on any game field.
- Fledcover wording note: scenario counts (2 restored / 1
  blocked) are mechanism proof, never a rate; the natural
  fled rate stays unmeasured at 0/24 seeds.

## Infrastructure notes (disclosed, all repaired)

- safe-commit index-clobber (known class) hit all four
  dissolvecause commits and both fledcover commits (bogus
  staged deletions/modifications, worktree files intact);
  workers repaired each via update-index --cacheinfo from
  the HEAD blob, verifying contents byte-identical and
  status clean before proceeding. The commits themselves
  are correct; only the main index lied. The coordinator
  evidence commit below was verified the same way after
  safe-commit (status clean + diff HEAD empty).
- Container EPERM flap slowed git operations during the
  dissolvecause run (12s safe-commit) but lost no data.
- Master moved mid-run under both workers (loop B landed
  sim-hatchequip-b and sim-sicktick-b, tip bab13342b):
  both branches were rebased onto the moving tip clean
  (no conflicts), proofs re-run green on each new base
  before merging, and all four proof suites re-run green
  on the final tip (dissolvecause 52/52, fledcover 19/19,
  dissolve-a 18 checks, blockedrestore 46/46).
  check.js --quick NOT run: zero src/js, zero policy
  defaults (dissolvecause's recorder edit is to a diag
  policy only), all proofs green post-merge, sibling
  loops live (concurrent-jest rule).
- Reap at closeout correctly refused sibling dirty trees
  (sim-vestcounter-b, journey2-social — LOUD lines, left
  alone, never touched); both of this run's trees were
  released as merged and their branches deleted. Main
  tree clean at closeout.
- Sibling activity during this run (NOT touched): loop B
  landed its 1130Z round and started new arms
  (sim-hatchequip-b, sim-vestcounter-b, plus
  sim-stranded-warmth-b in the worktree list);
  journey-landing finished and left the worktree list.

## Ranked next (NOT this run's work)

1. IN-CALL DISSOLVE PROBE (from dissolvecause #1): snapshot
   tbfight across the opening-turn window (tbBeginTurn/
   tbAdvance entry-exit, plus wrapper post-steps) to bracket
   the exact step that nulls tbfight inside startCombat.
   Until then, no claim about WHICH line dissolves these
   fights should be made.
2. PHANTOM-PENDING LIFECYCLE (design question, from
   dissolvecause #2): a pending 'herald' survives 45
   dissolved facing attempts across six days. Should a
   pending whose resolution dissolves be consumed, expired,
   or re-offered differently — or is the re-facing loop the
   intended pressure? The ~12 HP/night attrition during the
   loop comes from an outside source; whether that is the
   intended price is a design call, not a measurement.
3. NATURAL FLED POLICY (from fledcover #1, Leg C
   unbuilt): a policy that chooses to run from a lingerer
   fight is what would produce a natural fled observation
   (0 fled on 24 seeds across two bands under competent
   play). Mechanism is proven; frequency is not.
4. BLOCKED-RESTORE DESIGN QUESTION (steve-call,
   strengthened by fledcover): fled melts on a held tile
   too (1/1 scenario, plus 13/24 + 4/20 lost) — displace/
   queue when the tile is held, or is melt-while-the-
   siege-continues intended?
5. SAME-DAY -2 STEPS (minor, from dissolvecause #3): 5
   between-start steps of exactly -2 HP on s75102 same-day
   pairs; source not in the scholar trace; not a
   dissolved-fight effect.
6. STACK-FRAME BASENAMES (recorder hygiene, from
   dissolvecause #4): store basenames, not absolute
   worktree paths, in removal stack frames so future
   substrate legs pass raw.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0
on this band, as on every band this cycle. No axis is
converged. No gate number was moved on this evidence, per
the 2026-10-29 gate-sequencing note (prove behavior normal
before tuning gates to it). What converged further is the
siege plumbing: dissolved fights have a measured cause
(start-post-gone, 120/120) and a measured HP path (0 HP per
dissolved start), the barrier-death lead is closed, the
phantom-herald loop is explained, and the fled half of
lingerer-keeps is observed for the first time — fled
restores block on a held tile exactly like lost restores.
Backlog: 1122 ranked-next (1) and (2) now DONE by this run;
next in order is (1) the in-call dissolve probe, then (2)
the phantom-pending lifecycle question. Rotation NOT
advanced: the standing directive suspends rotation until a
run demonstrates national reached. Claim retired to .DEAD;
lock deleted.
