# Loop A 1155Z round — scale-onramp: muster-completion prototype + two-creek walls

Run: fleshout-20261102T1155Z, axis scale-onramp. Claim written before any
sims; deleted at closeout. Pre-flight: main tree clean, disk 24%, reaper
removed nothing sibling-owned. Sibling Loop B live on food-economy at run
start (1135Z claim: homext-abl + stepwalk-rcf) — NOT touched; B closed
mid-run (19c120be0 coordinator evidence: homext ablation NO-GO +
stepwalk re-confirm NO-GO held) and a new B run claimed 1233Z — also NOT
touched. Master moved under this run (journey-deepening r85, zero src/js,
zero file overlap with either arm); the creekwood branch was rebased in its
own worktree before merging (hit the known stop-at-pick quirk at pick 4:
pick listed in both done and todo, worktree clean, pick unapplied —
recovered with `git rebase --continue`, all 6 commits exactly once).
Zero src/js changes in either arm. Merged locally, pending ship.

## Arm 1 — sim-musterclose-a: PILOT NO-GO, arm KILLED, branch deleted

Policy prototype deepening ONE own link pre-call via a generic
closest-climb rule (trust gap + opinion gap + arrears term; never a
seed→village hardcode), using only ordinary verbs (`tendLink` for
Haven-primary links, `payTribute` for Haven-subordinate links).
Pre-registered pilot GO: gate closes on ≥ 2/3 named seeds AND the chosen
link deepened pre-call on ≥ 2/3 named seeds; guardrail village-lost ≤
baseline and median end-day within 20d. Pilot band: 8 titanroute seeds
incl. 97330/97338/97342, baseline = mustergap route arm on identical
seeds, 180d death-aware. Unit proof 10/10 (rule picks the
mustergap-named closer on all 3 seeds' call-day values; 0 roster/monster
reads).

Result: gate closes 0/3, deepened 0/3 strict (1/3 any-link), guardrail
fails (village-lost 3/8 → 4/8). No confirm run, no metric re-scored.
Wall totals: national 4/8 → 4/8, table 5/8 → 4/8, won 5/8 → 4/8, wave-5
unlock 1/8 → 0/8, median survival 94d → 93d, full seat 0 both arms.
Named seeds route → close: 97330 gate 6 → 8 (call d85 → d97), 97338
gate 6 → 6 (call d90 → d113), 97342 gate 6 → 6 (call d61 → d61,
byte-identical run).

Why it failed — three different walls, not one lever:
1. Roster cap (97330, 97318): a trusted quota of 6 is not 6 blades.
   97330's Emberhold reached 96/18/0 but sent only 4 faces (roster 6,
   none free after the call); Stonebridge hit trust 92 but opinion
   collapsed 8 → 1, staying at quota 2. Total 8. On 97318 a genuinely
   deepened link (77/21/0) sent only 2 faces.
2. Primary-arrears trap (97338): both deepened links climbed to trust
   84 with opinion in the 20s yet still refused — arrears (4508/4000)
   never cleared. Code-read + sim agree: the weekly tick's full-payment
   branch grants +1 trust but does NOT reset arrears, and the engine's
   only arrears=0 paths are `payTribute` (subordinate-Haven only) and
   primacy flip. Mustergap's "Stonebridge arrears 7000 paid"
   presupposes a payment verb that doesn't exist for this link
   direction — DIAG, not a tending problem.
3. Saturated week (97342): the base already tends every week, so the
   policy's whole marginal contribution was one tend that moved 0 kcal
   (trust 60 → 60). The +6 climb needed is smaller than one tend (+8)
   yet unreachable inside an already-spent week.

Separate leg (support only, never pooled into GO): close + one-episode
commit-own. 97330: gate 11 at call day (8+3) yet 0 fights — 12
MUSTER-GATE refusals on d110, so the coalition decayed below the gate
between call and contact (mechanism unisolated; daily muster trace
owed). 97338: 9, still short (national 0 → 1 is a trajectory
side-effect, not claimed). 97342: 6, no volunteers, identical.
Trajectory cost of close alone: erased 97310's herald kill (no call at
all, maxWave 5 → 3) and flipped 97307 from won to village-lost.

Disposition (killed-arm rule): the musterclose branch (prereg 86d33fe74,
policy+proof+driver ef378b534, evidence c1acdf111) was NOT merged;
branch deleted, tree released as abandoned. Its verdict and findings are
preserved here so the kill leaves a record, not a trace in code.

## Arm 2 — sim-creekwood-a: PILOT GO, confirm unbanked, LANDED

Two-creek walls + wood gathering, on the creekdetour stack (baseline =
creekdetour arm on identical seeds, 180d death-aware). Pre-registered
pilot GO: 97396 arrives via a bridge leg firing in sim, guardrail median
end-day within 20d and village-lost ≤ baseline. Pilot band: 8
creekdetour confirmed cases (97396 + 97307, 97422, 97449, 97474, 97489,
97514, 97599). Unit proof 47/47 (two-creek wall board test, wood-starved
honest failure, sideways-creek case, perception audit). Policy:
scripts/policies/creekwood.js (does not overwrite creekdetour.js).

Result: 97396 arrives day 91 via a bridge leg that fires in sim — path:
takeWood (pile 1527 → 1523, scholar wood 0 → 4) → bridge (5,4) →
advance onto it → takeWood again (→ 1519) → bridge (6,4) → step onto
the lair. Call sounded day 91 (10 blades, all named, trust holds),
herald slain day 93, run ends won/table/national at day 101.
Guardrail passes: median end-day 122.0 → 119.0 (diff 3.0), village-lost
4 → 4. Wall-neutral: national 2/8 → 2/8, table 5/8 → 5/8, won 4/8 →
4/8, wave-5 1/8 → 1/8 (97474, pre-existing); the 7 non-wall seeds are
identical to baseline on every metric. Split: 6 detour, 1 bridge
(97396), 1 swimmer (97449, never carries GO). Calls 7 → 8, fought
2 → 3, slain 1 → 2.

Headline mechanism: the village had the wood all along — it just never
picked it up. Scholar wood is 0 at first march day on 8/8 pilot seeds
(both arms, newly instrumented as creekdetour's metric review required)
while village piles hold 834–2162 logs. The binding constraint was the
missing `takeWood` step, not wood scarcity. `cutTree` was deliberately
not used (needs a grove tile + micro-position + a day-part — undrivable
as a march-day leg; stated, not silently dropped).

Honest disclosure: a pre-pool candidate run on 97396 with the as-written
bridge rule arrived day 91 but bridged a useless third creek at (4,3)
and then lost its fight (village-lost, day 103). The pooled post-fix
run (ordered rule: bridge-if-closer → advance → bridge-any-adjacent)
fights day 93 and wins. Divergence mechanism unisolated (likeliest: the
extra bridge's 96 ticks + 60 kcal shifting encounter sampling) — neither
fight is claimed as the fix's effect; the pooled claim is arrival +
bridge firing only. The smoke result is disclosed in the arm evidence
and counted nowhere.

Confirm NOT RUN TO BAR (unjudged, not failed): 0 cases banked. Partial
fresh screen (59/300 targeted seeds — screening ran ~30s/seed under
sibling load, so the range was cut deliberately for run bounds) yielded
10 nominations; baseline full runs showed 7 never located a herald and 3
arrived, with 0 bridge-blocked days anywhere. Observed lair-creek case
yield is ~1 per 300+ seeds (97396 in creekdetour's 300; 0 in this run's
59), so a 12-case confirm needs a dedicated wide screening run. No
candidate confirm runs were pooled and no confirm rate is claimed.
Remaining ~241 seeds in 97690–97989 unscreened — first work of the
follow-up screening arm. Geometry screen tool + partial ledger committed
(scripts/creekwood-geometry-20261102.js,
evidence/2026-11-02/perseed-creekwood-a/confirm-geometry-ledger.json).

Owed legs from creekdetour, answered or still open: bridge-success in
sim ANSWERED YES (97396 fires it in a full run); refusal-memory firing
in sim STILL UNFIRED (0 refusals on all 8 candidate runs; unit-proven
only); wood instrumentation in both arms DONE; voice blanks (not this
arm's changes): bridge-walk narration line, why a march stops one tile
short (day-89 advance to (6,3)).

## Village assessment (plain words)

Two villages, two lessons. The muster village already feeds its friends
every week the pantry allows and still can't raise ten blades: the
friends it feeds don't all have fighters to spare, and two owe debts no
grain erases. The creek village sat on a mountain of logs it never
touched, behind two creeks in a row with the monster living on the
second one; the scholar finally did the obvious thing — took logs from
his own pile and built the two bridges — and the village that could
never reach the fight now wins it (37 deaths vs 33 when it never
marched: four more deaths for a kill, a call, and a win). The muster
gap is fighters, debts, and a weekly cap wearing one gate's clothes.
The road gap was a missing step, not missing wood.

## Reachability verdict

- Two-creek lair arrival via takeWood-funded bridges: reachable —
  97396 arrives day 91, herald slain day 93, run won day 101.
- Trusted-link close of the muster gap: NOT demonstrated — 0/3 named
  seeds, guardrail fails; the closer mustergap named is blocked by
  roster caps, a missing arrears-payment verb for primary links, and
  tend saturation, not by tending effort.
- Full seat / wave-5 fought in normal play: unchanged by this run
  (full seat 0 both arms' pilots; wave-5 1/8 pre-existing on the
  creekwood band, 0/8 on the musterclose armed band).

## Telemetry deviation check

First invocation (no --sweep-rows) printed one LOUD line ("wins
disappeared: baseline 16 -> current 0, n=27 files"). Investigated
before any baseline decision: without --sweep-rows the script reads the
literal `wins` field, which these recorder rows don't carry (they carry
`won`; summed `won` over the 26 seed rows is 17, not 0), and the
recorder-corpus guard was bypassed because the mixed glob included the
geometry ledger (no anchorCommit). Correct invocation (--sweep-rows):
REFUSES the input ("all 26 seed rows carry top-level anchorCommit, so
they are sweep recorder rows, not runs") — the same refusal class as
1030Z. No LOUD deviation lines, no metric deviation to investigate,
baseline NOT rolled. The first LOUD line is an invocation artifact,
explained here and superseded.

## Balanced panel (§15 — limitation reported)

No panel compare .md attached, deliberately, for the same reason as
mustergap/titanroute/creekdetour: the panel registry has no
titanroute/musterclose/creekwood composition, so running it would
measure something else. Instrumented driver records are the measurement;
wall metrics above are reported from them.

## Metric review (for the NEXT run, not these verdicts)

- The musterclose guardrail (village-lost ≤ baseline) correctly killed
  an arm whose gate gains were nil — keep it for muster arms.
- Creekwood's confirm bar (bridge-assisted arrival on ≥ 50% of
  two-creek-wall confirm seeds) stands as pre-registered; the confirm
  needs a case-yield plan up front (wide screen first, judged band
  second), not a pilot-band-sized hope.
- Telemetry-check invocations on recorder corpora must use
  --sweep-rows; without it the wins field misreads as 0 and the
  recorder guard can be bypassed by a mixed glob (ledger file). Future
  runs: glob per-seed records only, or expect the refusal.
- The 180 cap truncates post-call survival (inherited from prior
  rounds); creekwood's 3.0-day guardrail gap is comfortable, but a
  tight confirm guardrail should consider a longer cap.

## Infrastructure

- safe-commit index clobber hit worker commits (repaired by workers via
  HEAD-blob cacheinfo; commits verified correct) and the creekwood
  rebase; coordinator commit verified clean after.
- Rebase stop-at-pick quirk (creekwood pick 4, both done and todo lists)
  recovered with `git rebase --continue` per the repo lesson; all 6
  commits exactly once on current master.
- check.js --quick NOT re-run: zero src/js in both arms, standing
  280/7 pre-existing profile recorded by sibling runs this cycle, and
  both arm proofs re-green (musterclose 10/10 pre-kill, creekwood
  47/47 post-rebase and on merged master).
- Final reap: no sibling trees touched; main tree clean at closeout.

## Next blanks, in order

1. Wide screening run for the creekwood 12-case confirm (tool + partial
   ledger on master; remaining ~241 seeds in 97690–97989 unscreened;
   judged band second, not first).
2. Primary-arrears trap: a forgiveness/settlement verb (steve-call
   candidate), preventing arrears accrual, or subordinate-direction
   links — the "arrears paid" closer presupposes a payment verb that
   doesn't exist for Haven-primary links.
3. Roster-cap / free-adult constraint on trusted quotas (trusted 6 →
   4 faces; deepened link → 2 faces).
4. Closecommit coalition decay trace: gate 11 at call → 0 fights, 12
   MUSTER-GATE refusals (daily muster trace owed).
5. Tend saturation / saturated week (base tends every week; marginal
   tend 0 kcal).
6. Surprise-refusal seed for refusal-memory (still unfired in sim).
7. Bridge-walk narration line (voice queue); why a march stops one tile
   short.
8. Carried from 1030Z: call standing-cost trace; 97489-style no-contact
   arrivals; blocked-then-arrived mechanism (97369, 97409).

scale-onramp stays converging (NOT converged): the road to the lair is
now solved even across two creeks, but the muster that must follow it
is blocked by fighters, debts, and a weekly cap — not by effort — and
the full seat stays unreached. food-economy untouched (sibling Loop B
lane). Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted.
Merged locally, pending ship (creekwood arm only; musterclose killed,
branch deleted).
Coordinator evidence: evidence/2026-11-02/sim-scale-onramp-round-1155.md
(this file).
