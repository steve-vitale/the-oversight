# sim-homewardstep-rpt-b — homeward-step guard on a QUALIFYING band (PILOT GO, with a mechanism caveat)

Run: oversight-flesh-out-loop-b, arm sim-homewardstep-rpt-b (Loop B,
food-economy next blank 1 from run fleshout-loop-b-20261102T0933Z).
Worktree sim-homeward-rpt-b, branch sim-homeward-rpt-b.
Prereg: evidence/2026-11-02/sim-homewardstep-rpt-b-prereg.md (committed
f1e910b72 BEFORE any judged sim). Port: ecc48554 (policy + driver +
analyzer + proof + panel registry line). Proof: scripts/test-homewardstep-rpt-b.js
48/48, census agreement 100% (see below).
Convergence state: converging (primary met on a qualifying band; the
homeward extension's own mechanism still open — see verdict).

## What was built (policy-side ONLY, re-port)

scripts/policies/competent-homewardstep-b.js re-ported VERBATIM from
branch sim-homewardstep-b (via `git show` only; that branch was never
checked out or merged) with header comments updated to this run. The
guard is unchanged: every guarded hop — outward or homeward — is
evaluated with the lateral-escape-aware E(D) (direct walkTo-faithful
sim, else up to 4 stocked lateral legs, one shared roadwork credit)
and vetoed ONLY if E(D) fails. A hop into haven itself always passes.
Veto memory is unchanged: first veto of a destination says the line;
repeats are silent, still vetoed, still counted. Zero src/js, zero
competent.js edits, zero default flips. The panel registry gains the
same one additive line the predecessor described (this tree's master
did not carry it — found by inspection, added here).

WHAT WAS ARMED (prereg, decided up front): the FULL inherited guard.
The policy file is indivisible — the homeward extension cannot be
armed without the outward guard it extends — so the PRIMARY is judged
on homeward-hop pocket episodes while ALL no-harm bars judge the
full guard's cost. Attribution (which veto did the work) is reported
in full below; it does not re-score any bar.

Analyzer deltas in this re-port (preregged, the only changes):
(1) per-seed haul floor bar B5perSeed (binding, >= 0.50x per seed);
(2) arrival-conditioned false-close proxy v2 quoted, attempt-based
v1 retained alongside; (3) per-seed haul ratio + homeward-veto split
in the per-seed table.

## Census (proof, not judged evidence)

scripts/test-homewardstep-rpt-b.js: PASS 48 checks. Live-engine
battery: hop cases 7, walk cases 6, false opens 0, false closes 0 —
no-credit core agreement 100% with the real walkTo/travelTo. A
homeward hop into a no-escape destination IS vetoed and the scholar
stays at the origin, orig travelTo never called; a homeward hop into
an escapable destination passes untouched (including straight into
haven); shadow mode evaluates and logs homeward hops but never
vetoes; veto memory covers homeward destinations (first says,
second silent, both vetoed); the 61705 lateral miniature passes,
the 61704 true pocket fails, credit rules unchanged.

## Screening (baseline-shadow only, disclosed, every band)

Prereg rule: first fresh band with >= 2 baseline homeward-hop pocket
episodes becomes the judged band; max 8 bands; 62001-62208 banned
(already screened at 1/0/0). Screening stops at the first qualifier.

- 62301-62308: 0 homeward episodes (13 away day-ends band-wide).
- 62401-62408: 1 homeward episode (62403 only; days 7-12 at (5,0),
  E fails all 6 days, strand death day 12; plus a non-homeward
  episode on 62407).
- 62501-62508: 0 homeward episodes (7 away day-ends).
- 62601-62608: 0 homeward episodes (plus a non-homeward episode
  on 62607, days 13-18 at (1,6), E fails all 6 days).
- 62701-62708: 0 homeward episodes (plus a non-homeward episode
  on 62707, days 5-10 at (5,3), E fails day 5 only).
- 62801-62808: 3 homeward episodes — QUALIFIES (first qualifier,
  screening stops; bands 62901/63001 never screened).
  - 62804: days 8-13 at (7,1), E fails all 6 days, strand death
    day 13 (dehydration).
  - 62807: days 10-12 at (8,3), E fails all 3 days.
  - 62808: days 22-29 at (4,0), E fails all 8 days, strand death
    day 29 (dehydration); plus a non-homeward episode days 8-15
    at (0,5), E fails days 8 and 11 only.

Screening yield across this run: 4 homeward episodes in 48 fresh
seeds (plus the predecessor's 1 in 24). Homeward-hop pockets are
rare on the natural substrate — roughly 1 episode per 12 seeds —
which is why the predecessor's 3-band budget could not qualify
and why this prereg budgeted 8.

## Pilot (judged band 62801-62808, 30d, competent vs competent-homewardstep-b, identical seeds, DEPOSITGATE=0)

Baseline leg = screen6 file reused verbatim (disclosed; the shadow
run is the baseline leg by construction).

| Bar | Baseline | Armed | Verdict |
|---|---|---|---|
| PRIMARY prevented homeward-hop pocket entries (>= 2) | 3 homeward episodes | 3 prevented (armed episodes 0) | PASS |
| B1 away day-ends (<= baseline) | 26 | 3 | PASS |
| B2 new-or-worsened (= 0) | — | none | PASS |
| B4 failed-trip share (<= baseline) | 0.525 | 0.508 | PASS |
| B5 mean daily haul (>= 0.95x) | 201.8 | 258.9 (1.28x) | PASS |
| B5perSeed floor (every seed >= 0.50x own baseline) | — | worst seed 1.00x (62803 0/0 excluded as null) | PASS |
| B6 median survival (>= control; starv seeds <= base+2) | 30d, 0 starv | 30d, 0 starv | PASS |
| Veto-created pockets (= 0) | — | 0 | PASS |
| False opens (reported) | — | 0 | — |

Per-seed (away/episodes, haul, homeward vetoes): 62801 1/0 -> 1/0,
haul 204.2 identical, homeV 0; 62802 0/0 -> 0/0, 181.7 identical,
homeV 0; 62803 0/0 -> 0/0, haul 0 both, homeV 0; 62804 6/1 -> 2/0,
haul 211.1 -> 230.8 (1.09x), homeV 0; 62805 0/0 -> 0/0, 414.8
identical, homeV 0; 62806 0/0 -> 0/0, 268.3 identical, homeV 0;
62807 3/1 -> 0/0, haul 214.5 -> 409.2 (1.91x), homeV 0; 62808
16/2 -> 0/0, haul 120.2 -> 362.0 (3.01x), homeV 0.
Armed vetoes band-wide: 96 (85 silent, 11 spoken) — ALL outward
vetoes from the inherited guard; HOMEWARD VETOES = 0, veto-origin
pass/fail = 0/0. Lateral passes 28; credit uses 2 (62804);
beyond-ungenerated 0.

### The mechanism caveat (read before the verdict)

The PRIMARY passes, but the homeward extension itself never fired:
homeward vetoes = 0 on the judged band, exactly as on the
predecessor's band. All three prevented episodes were prevented by
OUTWARD vetoes diverting the trip before it ever reached the
homeward entry step. Trace-proven, seed by seed:

- 62804: baseline day 8 walks (4,4)->(6,4)->(7,4)->(7,2)->(7,1),
  the last step outward, then the homeward hop (7,0)->(7,1) on a
  later attempt anchors the entry (shadow log: homeward hop
  landing on the entry tile). Armed day 8: outward vetoes
  (7,2)->(7,1) and (7,2)->(7,0) stop the approach; the scholar
  walks home the same day via (7,2)->(4,2)->(4,4) and ends home
  at kcal 1065. The scholar later camps (1,6) days 9-10 with E
  PASSING (an escapable camp, not a pocket), ends day 10 at
  kcal 0, and comes home day 11 at 2090.
- 62807: baseline day 10 enters via the homeward hop
  (8,2)->(8,3) (simOk false). Armed day 10: outward veto
  (6,2)->(6,0) twice — first spoken, second silent, veto memory
  working — and the scholar reroutes home via (4,3), ending
  home at kcal 2020. Armed away day-ends: 0.
- 62808: baseline day 22 enters via the homeward hop
  (1,0)->(4,0) (simOk false). Armed day 22: the very first step
  (4,4)->(4,1) is vetoed 3x, all silent (the destination was
  first vetoed, spoken, on day 8); the scholar forages near home
  instead and ends home at kcal 2130. Armed away day-ends: 0.

So this pilot proves the GUARD AS ARMED (full guard) prevents
pockets on a qualifying band. It does NOT prove the homeward
extension adds anything over the inherited outward guard: no
armed scholar ever reached a homeward step into a no-escape
tile, so the extension had nothing to veto. The 61807 diagnostic
remains the only firing evidence for the extension itself, and
it is unjudged. A follow-up that isolates the extension needs
either an ablation (outward-only guard vs full guard on this
same band) or a band where a homeward step is attempted under
the armed policy — proposed for the next prereg, not scored
here.

### Deaths and survival (driver substrate, with the succession caveat)

Median survival 30d both legs; villages survive to day 30 on all
8 seeds both legs (driver endReason survived). Player-death
accounting differs by substrate and by succession (the "player"
is a role that passes to another villager), so no "lives saved"
claim is made: baseline 62804 loses its player day 13
(dehydration) and armed 62804 still records a player death day
11 ("the wild") while the village survives; baseline 62808
records 3 player deaths including dehydration day 29 and armed
62808 records none. What is solid: pockets are gone, villages
survive, and no armed seed strands worse than its baseline.

### False closes: v2 vindicated by trace

Attempt-based proxy v1 fires 4 times (62801 day 29: (4,4)->(4,1)
and (4,4)->(5,2); 62802 day 8: (4,0)->(2,0) twice). The
arrival-conditioned proxy v2 fires 0 times — and the traces
prove v2 right in all 4 cases: on 62801 day 29 the baseline hop
AFTER each attempt departs from (4,4) again, so the scholar
never arrived at (4,1) or (5,2); on 62802 day 8 the hops after
the (2,0) attempts depart from (4,0) again, so the scholar
never arrived at (2,0) — the attempts were engine-refused or
non-arriving system attempts. This is a second independent
confirmation of the predecessor's 62001 artifact class, and v2
filters it exactly as designed. False opens 0: no armed away
day-end sits on failing ground with zero vetoes that day.

### Sense-testing (transcripts, not just counts)

- The veto line reads true where it speaks: "You don't walk
  there — you couldn't get home from there." On 62804 it speaks
  twice on day 8 for two different destinations (correct per
  per-destination memory); on 62807 first spoken, second silent
  (memory working); on 62808 spoken on days 8-9, then silent
  for three weeks of the same refused step.
- The repeat pattern to flag (not a bar failure): on 62808 the
  armed scholar attempts (4,4)->(4,1) three times a day, every
  day from day 10 to day 30, silently refused each time — 68
  vetoes on one seed, 66 silent — while ending every day home
  and fed (kcal ~2100). The silence is by design (memory), and
  the scholar's reroute reads sensibly (tries north, refused,
  forages near home, eats well), but a player watching closely
  would see the same first step tried and refused daily for
  three weeks with no further word. That is competent's daily
  re-pick meeting a permanently refused route, not a guard
  defect — but if the guard ever speaks in-game, a
  once-per-route reminder after long silence would read more
  human than total silence. Carried to metric review.
- 62804's hungry night (day 10 at kcal 0 on escapable ground,
  home day 11 at 2090) reads as honest hardship resolved by
  walking home — the guard's promise kept: the camp was one
  the scholar could leave, and it did.
- Nothing robotic in the reroutes themselves: each diverted
  scholar forages elsewhere, beds down where it can leave
  from, or comes straight home fed. No veto strands worse than
  the pocket it prevents; veto-created pockets = 0.

## Balanced panel (§15, context never verdict)

The compare of the two single-policy panels (base competent panel
vs armed competent-homewardstep-b panel, same seeds/days) returns
decision INVALID — "Unmatched policies / Unmatched cases" — and is
attached as-is (evidence/2026-11-02/sim-homewardstep-rpt-b-panel-compare.md),
not overridden. The reason is structural, and it is the same
refusal class as the predecessor's split-panel attempt: the
comparator matches campaigns with the same policy set across two
roots, while a policy-side arm splits its two policies across the
two panels, so the sets can never match. The valid panel artifact
is therefore the single combined campaign above (both policies,
one panel, sourcesStable, neutrality matched), whose per-policy
rows are the panel context quoted here. No panel verdict is
claimed: per §15 the panel is the instrument, the preregistered
threshold is the judge, and the judged verdict above comes from
the driver/analyzer, not the panel.

Combined campaign: `node scripts/balance-panel.js --out
/tmp/homewardstep-rpt-b-panel --policies
competent,competent-homewardstep-b --seeds 62801,...,62808
--days 30 --par 4` — 16 cases, 0 reused, sourcesStable true,
neutrality matched on both policies (proof seed 62801, 0
warnings). Per-seed panel outcomes: survived 8/8 both legs;
won / national / table 0 both; wave reach 2 on 7/8 both legs
(62806 wave 1 both legs); maxArc 3 both legs except baseline
62808 arc 2 -> armed arc 3; vests baseline 62804 1 -> armed 0
(a small panel-context difference, not a judged bar). Raw
panel archived as evidence/2026-11-02/sim-homewardstep-rpt-b-panel.json.gz.
Driver-vs-panel definitions differ (driver maxWaveUnlocked reads
62804 armed 3 vs panel 2, 62807/62808 armed 1 vs panel 2) — the
same substrate difference as the predecessor's panel notes;
numbers are never pooled across substrates.

## Wall numbers (in-window only, never pooled across arms)

Pilot window (30d): national / table / wins 0 both legs
(expected measurement profile in a 30-day pre-seat window, not
a regression); median survival 30d both; panel wave reach 2 on
7/8 both legs; full seat 0 / wave 5 reached 0 unchanged. No
wall movement is shown or claimed: this pilot measures pocket
prevention, not the scale wall.

## Village assessment (plain words)

On the three seeds where trouble actually showed up, the
baseline village kept a scholar camped for days on ground it
could walk to but not walk home from — six days on a north
edge tile, three days on the far eastern rim, eight days on a
northern tile while its food ran down to a dehydration death.
Given the guard, none of those camps ever forms: the scholar
is turned back at the approach — at the last step before the
trap on one seed, at the first step out of haven on another —
and comes home fed instead. The village eats better for it
on all three seeds, and on the worst seed three times better,
because the scholar that used to sit on a far patch for two
weeks now works the ground near home instead. What the guard
did not do, on any seed, is stop a step toward home: no
scholar ever took a homeward step into a trap while guarded,
so the new homeward eyes never had to open. The guard works
as a fence around the far ground; whether its homeward half
works as a fence around the way back is still unproven, and
the next run should test exactly that rather than assuming
this pilot did.

## Verdict: GO (full guard, on a qualifying band) — with the mechanism caveat above

- PRIMARY PASSES: 3 prevented >= 2, on a band carrying 3
  baseline homeward-hop pocket episodes (the first qualifying
  band in 6 screened this run; 62403's episode does not count
  — it is not on the judged band).
- B1, B2, B4, B5, B5perSeed, B6, veto-created-pockets all PASS.
  No pooled bar is hostage to a single seed this time: haul
  rises on every episode seed and is identical elsewhere.
- The GO is for the FULL GUARD as armed. The homeward
  extension's own contribution is UNPROVEN (0 homeward vetoes):
  the prevention observed is outward-diversion prevention.
  This is stated here, not buried, so the coordinator does not
  over-claim it: landing the full guard is supported; claiming
  the homeward extension works is not yet supported.
- No confirm spend in this run (prereg): a pilot GO goes to
  the coordinator for a confirm decision (12-16 seeds), ideally
  paired with the extension-isolation question below.

## Metric review (for the NEXT run, never a re-score)

- Extension isolation is now the open question: the next
  prereg should arm an outward-only guard against the full
  guard on this same band (62801-62808), or pre-register a
  band-search rule that requires an armed-policy homeward
  attempt, so the extension's own vetoes are the measured
  thing. Without that, further qualifying-band pilots will
  keep proving the fence, not the homeward half.
- Veto-silence duration: 62808's 20+ days of silent refusals
  of one step suggest a "reminder after long silence" design
  question (Steve-call if it becomes a narration change):
  memory suppressing every repeat may under-narrate a
  permanently refused route. No bar changes proposed.
- Episode definition held up well here: all three judged
  episodes are sustained multi-day E-fails (3, 6, 8 days),
  two death-linked — the opposite of the predecessor's
  transient 62003 camp. The transient-E-fail worry from the
  predecessor's metric review did not recur on this band.
- Screening yield confirmed low but workable: 4 homeward
  episodes in 48 fresh seeds (~1/12 seeds); future preregs
  should budget >= 6 bands or accept UNDER-POWERED as the
  likely outcome. The far-travel-substrate alternative remains
  rejected for comparability (see prereg).
- Per-seed haul floor was not binding here (worst ratio
  1.00x) but cost nothing to carry; keep it — the predecessor
  showed a pooled bar can hide a single-seed collapse, and
  this run shows the floor does not false-alarm when haul
  genuinely rises.

## Corpora

- evidence/2026-11-02/sim-homewardstep-rpt-b-prereg.md
- evidence/2026-11-02/sim-homewardstep-rpt-b.md (this file)
- evidence/2026-11-02/sim-homewardstep-rpt-b-screen{1,2,3,4,5,6}-baseline.jsonl (+ .log)
- evidence/2026-11-02/sim-homewardstep-rpt-b-pilot-{baseline,armed}.jsonl (+ .log)
  (baseline = screen6 verbatim)
- evidence/2026-11-02/sim-homewardstep-rpt-b-panel.json.gz
- evidence/2026-11-02/sim-homewardstep-rpt-b-panel-compare.md
  (comparator INVALID on policy-split panels, attached as-is —
  see panel section)
