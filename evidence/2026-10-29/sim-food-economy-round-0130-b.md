# Loop B run fleshout-loop-b-20261030T0130Z — food-economy, 2 arms landed, merged locally pending ship

Run: 2026-10-30T01:40Z–03:0xZ (20:40–22:0x CDT 2026-10-29).
Axis: food-economy (second non-converged axis). Sibling loop A live on
scale-onramp the whole run (0015Z claim: shoutrec + joinendlines, NOT
touched) — A landed mid-run as 2bfa0c426 (shoutrec adoption DIAG-GO +
joinendlines GO). Journey crisis r70 (38e1e050e) also landed mid-run.
Both B branches rebased clean onto the moving master and re-proven
before merging. Zero game changes, zero default flips, zero src/js
in either arm.

## Arm 1 — sim-raidname-b1-b: DIAG-GO (backlog #1454 next step)

Question: the raidname species-id collision caveat (residual (2)) was
fixture-proven but frequency-open: a 40-seed blind band produced 0
collisions. The standing next step, twice recorded, was a TARGETED
staged-B1 leg in live sims, never more blind seeds. This arm ran it.

Method (prereg eb6c24431, committed before any judged leg): stage a
B1 configuration in live sims — a non-raid pending written once per
seed at a verified shadow-null window where a naturally arisen
raidBorn entity sat on the player tile — then let the harness resolve
it via startCombat. The lingerer was never created, moved, or edited.
Pre-registered bar: >= 8 staged configurations, 0 unclassified staged
fights, pre-staging determinism identical on every staged seed, AND
misfire rate >= 0.75 (the fixture proved the mechanism deterministic
given the configuration).

Results (16 seeds, 10710–10725, 30d legs):
- Staged configurations: 9 (pilot 4 + confirm 5; within the 40-seed
  budget, no further seeds needed). Staging misses: 0.
- Misfire count: 9/9 = 1.000. Every staged fight carried the raid line
  via path (b) with the shadow null at entry (pendingMatch false on
  all 9) and a raidBorn same-species tile entity (entityMatchCandidate
  true on all 9), while the pending was by construction a non-raid
  wanderer-style pending. Unclassified: 0.
- Pre-staging determinism: identical OFF vs ON fight sequences on all
  9 staged seeds (0 mismatches).
- The lingerer half is common (OFF leg: 27 natural lingerer windows on
  the same seeds); the pending half is what never coincides naturally
  (blind band: 0/40 seeds). All 9 staged origins had lingering=false —
  drafted raiders on the haven tile (4,4), not siege lingerers.
- Signature: tile entities at 12–130 HP fought as fresh instantiations
  at 51–167 HP (e.g. 10710: 43-HP raidBorn deer vs 167-HP fighter).
- Sense test: full 120-line tail read for 10710 (gallowdeer / Highbeam
  Deer). Prose passes, honesty fails — exactly the caveat's shape:
  nothing betrays the misattribution, and here it attaches a false
  raid origin to a player death and mantle succession (Jason Palmer
  falls; Natalie Gonzalez succeeds mid-tail).

Verdict: DIAG-GO. Backlog #1454 residual (2) is now LIVE-PROVEN, not
just fixture-proven. The caveat itself stays OPEN until the
provenance-gate fix lands (a later arm's work); this staged leg is its
regression instrument (expect 0/8+ post-fix). Do NOT mark it closed on
this measurement alone — the measurement proves the bug, it does not
fix it. The natural coincidence rate remains the blind band's 0/40.
Fix recommendation (documented, NOT built): provenance gate,
consume-or-clear on any pending-clear, clear on exile/succession
clears. Residual (3) browser ordering stays OPEN; [needs-eyes] stays
on the raidname wording commit.

Proof: node scripts/test-raidname-b1-b.js on the judged corpora —
pass=14 fail=0 skip=0, re-run green after rebase onto 2bfa0c426.
Commits: prereg eb6c24431, instruments 11be49d55, evidence 2914d4c39
(rebased as 9047ab400 / 6605a1be9 / e19534e56). Zero src/ paths.

## Arm 2 — sim-lackingline-woodshort-b: INSUFFICIENT-DATA (backlog #1456 sub-item)

Question: the lacking-line is played for ticks-short (lackingline4,
DIAG-GO, #1450/#1455 closed), but wood-short was never played on any
band — the ON (woodcarry) leg always rescued by carrying. This arm
hunted a wood-short still-refused ON creek evening.

Method (prereg 9fc0b98c2, pinned base d6723d3f, committed before any
judged leg): 500 fresh OFF seeds (15000–15499, 30d, woodcarry3 driver
unchanged) screened for creek evenings, qualifiers run ON. Bar:
DIAG-GO requires >= 1 staged wood-short still-refused ON creek
evening with the named number equal to the live classification
woodPlayer, plus full-tail sense-test and guards (a)–(g).

Results:
- Screen: 500 seeds → 60 OFF creek evenings → 10 qualifiers (15003,
  15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439).
- ON legs (all 10, all survived 30d): 15 creek evenings, woodPlayer =
  4 on all 15, still-refused 4 (kcal-short 3, ticks-short 1,
  wood-short 0), rescued 11 (73.3%).
- Staged wood-short evenings: 0. No tail leg was built and no
  sense-test is claimed (recorded as NOT PERFORMED, not hidden). No
  bar lowered, no seed added post-hoc, no refusal faked, no carry
  weakened.

Diagnosis — exactly which precondition failed:
1. Pile-floor mornings exist on all 10 qualifiers but only on day 1
   (pack 0, pile 10), and day-1 evenings are inside on 500/500 screen
   seeds — the day-1 window can never meet a creek evening; no later
   pile-floor morning exists (piles grow past the floor by day 2).
2. Stranded (not-at-haven) mornings DO meet same-day creek evenings
   (4 cases: 15009 day 13, 15215 days 8–10) but packs still hold 4
   logs — stranding doesn't spend pack wood.
3. kcal-floor 0 and cannot-carry 0 across 300 banked mornings.
Across four lacking-line bands, wood-short is now 0-for-52 ON creek
evenings. Next prereg must name a new honest route (pile/pack
ledgers) or close the sub-claim as unplayable-by-construction under
the shipped carry.

Proof: node scripts/test-lackingline-woodshort-b.js — all checks green
(screen recomputation, ON census recomputation, carry-skip census,
OFF guard 300 evenings / 0 lever lines, determinism re-run of 15003 ON
byte-identical, staging dir deleted), re-run green after rebase onto
38e1e050e. Commits: prereg 9fc0b98c2, evidence 8d5503d50 (rebased as
b7543fadb / 5d40ae91c). Zero src/js, zero scripts/policies.

## Wall numbers (report-only; 30d legs — national / table / wins NOT OBSERVABLE, never zeros)

- Raidname corpus (16 seeds): scale 'village' 16/16, standing 0 on
  16/16; max wave unlocked 1 on 4 seeds, 2 on 12; wave 4–5 reach 0;
  median survival 30 loop-days (ceiling), max 30; 51 fights ON.
- Woodshort bank (10 qualifiers): wave 1 in 10/10, wave 2 in 10/10,
  waves 3–5 in 0/10; median survival 30 days (ceiling effect of the
  short window + banking selection); 76 wave kills, 109 death-log
  entries (77 monsters, 28 villagers, 4 persons).

## Telemetry deviation check

On both corpora (raidname ON n=16, woodshort ON n=10): 3 LOUD lines
each (national 12->0, table 16->0, wins 16->0) — the KNOWN
WINSEAT-baseline vs pre-seat regime artifact (30d evening/instance
legs; exiled clean). Baseline NOT rolled, no investigation item.

## Infrastructure

- Safe-commit index clobber hit all worker commits in both arms
  (bogus staged deletions, worktree files byte-identical to HEAD) —
  repaired via HEAD-blob cacheinfo each time, commits verified
  correct. No clobber on the coordinator commit (verified below).
- Both branches rebased in their own worktrees after sibling landings
  (raidname once onto 2bfa0c426; woodshort once onto 38e1e050e);
  proofs re-ran green after every rebase and post-merge in the main
  tree (raidname 14/14, woodshort all-checks green). Merges verified
  one at a time before any cleanup.
- check.js --quick NOT re-run: zero src/js, zero green-list files in
  either arm; loop A's 0015Z run just recorded the standing profile.
- Held sim-lackingline3-b branch + worktree left registered with a
  FRESH heartbeat, NOT merged, NOT deleted — its old-base evidence is
  superseded by lackingline4 on current master, but the branch is the
  only record of the old-base result; a later B run may release it.

## Convergence state

food-economy stays converging (NOT converged): one caveat now
live-proven with its fix still unbuilt, one narration sub-claim
measured as 0-for-52 with its next route named. scale-onramp stays
converging (untouched; sibling loop A lane). Claim deleted; lock
deleted.

Evidence: evidence/2026-10-29/sim-raidname-b1-b.md +
sim-raidname-b1-b-prereg.md + corpora + analysis (e19534e56) and
evidence/2026-10-29/sim-lackingline-woodshort-b.md +
sim-lackingline-woodshort-b-prereg.md + census + corpora (5d40ae91c).
Merged locally, pending ship.
