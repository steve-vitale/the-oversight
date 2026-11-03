# sim-food-round-0807-b — sensor known-supply PILOT-GO + guard-E entry fix DEPLOYED (GO)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T080700Z,
axis food-economy (second non-converged axis; sibling Loop A live on
scale-onramp throughout, 0518Z claim, NOT touched — its feastdraww4
tree carries uncommitted changes, left alone). Claim written before
any sims; retired to .DEAD at closeout; lock deleted.
Pre-flight: main tree clean at 436da92f6, disk 29%, reaper removed
nothing sibling-owned (dirty trees protected, as designed).
Master moved twice under this run from sibling lanes
(gap-counterbtn ca8b6c1ea, journey-deepening r88 8d4b6c17b) —
zero file overlap with either arm; both branches rebased clean in
their own worktrees, proofs green after every rebase and on merged
master.

## Arm sim-sensor-supply-b (PILOT-GO, merged c391edd5b)

Prereg committed BEFORE any judged leg (020475131, rebased to
7a71d0761); tools 60150d3c4/3e62a2233 (proof 20/20); evidence
07e94424/c391edd5b. A pilot of sensor rule (e*) on a FIXED
KNOWN-COLLAPSER supply — not a third fresh-band confirm (forbidden
by the 0535Z order: two fresh confirms failed the count gate, so a
third would re-prove the same scarcity). 12 fresh 30d competent
legs via the verbatim gatecover tracer: 7 candidate collapsing
seeds (pilot 79006, 79019, 79031, 79064; first confirm 80008,
80016; second confirm 81053) + 4 pilot-band cost survivors
(79001-79004) + 1 context seed (81042). Zero game-code changes,
zero policy flips, zero edits to existing scripts/policies.

Verdict PILOT-GO, all legs pass: still-collapsing 7/7 (0 excluded,
bar >= 4); fire 7/7; tie (lead_e >= lead_c) 7/7; strict 7/7;
lead >= 1 on 6/7 = 85.7% (bar >= 75%; only 79031 at lead 0, the
known death-knell); cost screen 0/4; cross-check 0 mismatches on
12/12; tracer rows == daysAlive on 12/12 first try; determinism
3/3 byte-identical; base-equality control 12/12 fresh lines
byte-identical to archived lines — zero drift. Per-seed leads
(e* vs (c)): 79006 lead 1 (c never), 79019 2 vs 1, 79031 0
(c never), 79064 6 vs 5, 80008 2 vs 1, 80016 3 vs 2, 81053
2 vs 0. Mean lead_e 2.29 (n=7).

Flag discrepancy RESOLVED: 81042 is NOT collapsing. Its summary
carries collapsed:true (village-lost, any cause) but
collapsing:false; re-derived from its archived death list it has
ZERO starvation deaths (combat, wild, ambush, dehydration,
monster only), lost day 26. It stays an "other" outcome; its
fresh re-run is byte-identical with both rules firing as context
only. The 0535Z judged count (1 collapsing seed, 81053, on band
81001-81056) stands. Prereg fixed the day-30 boundary as
window-inclusive (81053, village-lost day 30 with starvation
days 26/29/30, counts as collapsing); under a strict <30 reading
the supply would be 6 and every leg still passes.

Sense test (fresh firing evenings): noticing in time — 79019
day 18 and 80008 day 16 carry the thin-pack voice; 79064 day 19
the thinnest pack line (90 kcal) plus "The pantry is in the
hall. Your hands are not." Silent cliff — 79006 day 22 has zero
pantry/hunger lines in all 20 lines; the warning breaks a
silence. Death-knell — 79031 day 20 speaks the hunger voice on
the very evening people starve. 81053 day 24 has no pantry line
in 14 lines (leadership strain instead) — the store-framing
constraint stands.

Honesty note (worker's metric review, endorsed here): the 7
supply seeds are the SAME villages as the prior runs, re-run
fresh — this pilot adds no new collapsing village and must not
be pooled with prior runs as independent evidence. It proves
shape-survival on a combined known supply and earns a confirm
with a supply fixed in THAT run's prereg. Full survivor-cost
leg (>= 12 survivors) stays deferred to the confirm, as
preregistered — this collapser-only supply cannot carry it.
NO deploy claim may cite this pilot alone.

## Arm sim-guarde-deploy-b (GO, deployed into the guard instrument, merged bb1e93be8)

Prereg committed BEFORE any judged leg (3f007c6ef, rebased to
ee9472de5); instruments d29ede83f (proof 28/28); evidence
1b04c2a46/bb1e93be8. The 0535Z next blank (3): the guard-E
entry fix DEPLOY decision, with its own prereg deciding both
carried open questions BEFORE landing.

Decision (a) VETO-LINE WORDING: DISTINGUISH — landed as
decided. Escape veto (E fail, old veto set, unchanged): "You
don't walk there — you couldn't get home from there."
(verbatim). Entry veto (E pass, entry blocked, new vetoes
only): "You can't step there — you couldn't get in from
here." Generic, not blockType-specific: checkHop blockers can
be multiple and can sit on intermediate tiles of a multi-tile
jump, so naming one blocker could mislead; the line carries
the side-specific truth (the same tile may be enterable from
another side). Veto cause recorded per hop (vetoCause:
'escape' | 'entry' | null); a hop BOTH E-fail and
entry-blocked is an ESCAPE veto (old veto set). Veto memory
unchanged (first veto of a destination speaks, repeats
silent).

Decision (b) CREDIT-POOL CARVE-OUT: RAW checkHop, NO credit
— landed as decided, and now CLOSED BY LIVE EVIDENCE.
Rationale (prereg): credit answers "could you get home if
you cleared rubble on the way", entry answers "can you step
on from here"; the engine grants no credit on a real hop, so
a credit-inheriting allow' would re-create
entry-blindness for rubble hops. The judged confirm band
then produced the first live rubble-only E-pass hop: 69514
(6,4)->(7,4), E pass, entry rubble, engine rubble, moved
FALSE — exactly what raw checkHop vetoes and a credit
variant would falsely allow. Armed play corroborates
(69614: 11 entry vetoes on a rubble step, daysAlive /
forageOk identical). Overturn evidence (an E-pass
rubbled-only hop that MOVES) appeared nowhere: probe 0,
pilot 0, confirm 0. The carve-out is closed; a future
rubble-moving hop would reopen it, and none is known.

Verdict GO — all five prereg legs pass on pilot AND fresh
confirm: (1) allow'-pass fidelity pilot 24/24, confirm
65/65 pooled (A2 38/38, C2 27/27); (2) VETOES UNCHANGED
pilot 0/0, confirm 0/0 pooled and per band; (3) ENTRY
MODEL AGREEMENT pilot 34/34, confirm 75/75 (A2 43/43, C2
32/32); (4) COST GUARDRAIL armed old-vs-new pairs, 30d,
identical seeds — pilot false vetoes 0, daysAlive 240 =
240, forageOk 150 = 150; confirm false vetoes 0, daysAlive
480 = 480, forageOk 260 = 260, per seed-set exact; (5)
SENSE-TEST — spoken entry vetoes and spoken escape
vetoes both occur in vivo on pilot and confirm; say-line
counts match hop-log spoken counts on every seed;
line-cause confusion 0.

Deploy scope (stated in the evidence, verified): NOT a
default flip and NOT a live rule change. The guard
instrument file is default-OFF (no reference in src/js,
index.html, or scripts/policies/competent.js; only named
drivers/tools import it). Deploy means the instrument file
itself now vetoes on NOT allow' instead of NOT E.
scripts/policies/competent-homewardstep-b.js installGuard
ONLY edited (escapeCheck, checkHop, attemptHop,
simulateReturnPool, lateralCandidates, offersFrom, havenOf
untouched); hop log gains allowPrime, vetoCause,
entryBlockers and removes nothing (simOk stays E for prior
analyzers). Zero src/js changes, zero edits to
competent.js, the entry-variant module, the recorder, or
the armed driver.

## Wall numbers (in-window only — NOT wall movement)

Both arms are instrument legs, not campaigns: national /
table / wins carry no campaign fields here and are 0
in-window by construction, NOT wall movement. Sensor pilot:
30d competent, 12 legs (7 collapsing, 4 survivors, 1
other). Guard: recorder legs + armed 30d old-vs-new pairs
with trajectories identical between arms. Wall numbers as
last measured stand (full seat 0 / wave 5 unfought in
normal play, Loop A lane).

## Balanced panel (§15)

INAPPLICABLE, as declared in the arm preregs — not
fabricated. The panel expresses guard policies on natural
campaigns; these runs judge hop-level / rule-level
instruments on identical seeds (recorder legs vs shadow
legs, armed old-vs-new pairs). The identical-seed
comparisons ARE the comparisons; no panel was built and
no compare file is fabricated.

## Telemetry deviation check

Prescribed invocation on BOTH corpora was REFUSED by the
tool in the same way: telemetry-check reads its --current
file as a single JSON document and fails at line 2
("Unexpected non-whitespace character after JSON", sensor
corpus position 354565, guard pilot position 4015) although
both files are valid jsonl (12 lines, each parsing
cleanly). Input-shape incompatibility, same class as prior
runs' recorder-corpus refusals — NOT a deviation. No LOUD
deviation lines about national/table/wins; baseline NOT
rolled.

## Infrastructure

Safe-commit index clobber hit the sensor worker's three
commits (repaired each time via HEAD-blob cacheinfo,
commits verified correct, worktree clean). No EPERM flap
blocked this run's commits; the registry flock queue made
worktree registration slow (~2 min) but it completed with
fresh heartbeats. check.js --quick NOT re-run: zero src/js
in either arm, zero default flips, standing 280/7 profile.

## Village assessment (plain words)

Two instruments got sharper, no village changed. The
starvation sensor now proves its warning shape survives on
every collapsing village ever found — it fires on all
seven, usually days before people starve, and almost never
cries wolf on villages that survive — but those seven are
the same villages re-run, so the shape still needs a
confirm on a supply fixed fresh before anyone trusts it
with real villages. The way-home guard stopped letting
scholars step onto crossings the world itself refuses:
it now checks the step itself, not just the way back from
beyond it, says plainly which kind of refusal it is, and
— proven by a real rubble-blocked step it caught — refuses
nothing the world would have allowed. Neither change
touches the live game: the sensor is still a measuring
instrument, the guard still a default-OFF instrument.

food-economy stays converging (NOT converged): the sensor
program now has a PILOT-GO shape on a combined known
supply plus TWO INSUFFICIENT-DATA fresh-band confirms
(confirm question open, rule not overturned, no deploy);
the guard-E entry fix is DEPLOYED into its instrument
with both carried questions decided (distinguished veto
lines; raw checkHop, no credit, closed by live evidence).
scale-onramp untouched (sibling Loop A lane). Next blanks,
in order: (1) sensor (e*) CONFIRM with a supply fixed in
that run's prereg (full survivor-cost leg >= 12 survivors
owed; pilot must not be pooled as independent evidence);
(2) C prereg metric call: does "fences shape C" include
outward attempt vetoes (coordinator decision, still
carried, not decided here); (3) guard→succession cascade
(69604); then (10)-(25) as listed in the 1730Z entry,
unchanged (pocket persistence DONE, guard-E deploy DONE).

Claim retired to .DEAD; lock deleted.
Merged locally, pending ship (sensor-supply c391edd5b +
guarde-deploy bb1e93be8 + coordinator evidence).
