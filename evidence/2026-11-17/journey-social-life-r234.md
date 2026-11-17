# Journey social life r234 — Lane B (2026-11-17)

## Run

- Lane B occurrence 07:00 CST Nov 17, 2026 (run_id `journey2-social-20261117T125612Z`).
- Rotation-b read 5 at run start. This run plays 5 (social life) and writes 6 at closeout.
- Base at registration: `f9b33757a` (master; worktree branch `journey2-social`).
- Leg 5 (social life). Seeds 45709–45712 (fresh band, verified in the prereg), DAYCAP 140, policy journey.
- **ADOPTION:** the 07:00 coordinator timed out at 3600s with the panel half-run (pilot 45709 complete, 45710 aborted mid-seed). The run was verified dead in the main session (registry heartbeat 27 min stale, no live processes) and adopted: the tree was heartbeated first, the DRY2 proof was re-run both directions by the adopter (27/27 green, 23/27 red on base, fix restored byte-identical), panel seeds 45710–45712 were re-run fresh by the adopter (exit 0), then analyzer, telemetry, and gate were run by the adopter. The aborted 45710 attempt left only a log header; no partial JSON existed, so no seed was double-run.
- Master moved mid-adoption: planignite CONFIRM NO-GO landed (`2a49a1e82`) during the run; the branch was rebased onto the new tip before landing (see below).

## Leg question (carried from r226 + r229 + r231)

Does social life hold up across a full run — invitations sometimes taken, bonds
proposed and answered by character, moots firing, conversations reading as
people, wants surviving across sittings without drying into the
"...lost my train of thought." dead line — and do the r226 F6 fix, the r231 C3d
fix, and the r234 DRY2 fix hold in the wild?

## Fix arm: DRY2 — landed [needs-eyes]

The r231 panel's 4 dry servings at 3 new sites (dlg:doubt stonewall ledgered
as primary; confront handler with no WouldBlock check; neighbors topic reply
via a bare-line guard that could never fire). Fix, all three sites:

1. **Probe stonewall** (`src/js/convo-dialogue.js`): when all pool variants
   are blocked and the handler falls to the stonewall, serve it ledger-exempt
   (`{ structural: true }`). Pool variants keep ledgering.
2. **Confront result** (`src/js/truth.js`): WouldBlock-check `r.line` before
   `sayLine`; if blocked, re-speak it with `{ diegeticAct: true }`. Every
   `r.line` is an outcome whose consequences already fired — paraphrasing
   would misreport a landed outcome as a fizzle (r86 rule).
3. **Neighbors topic reply** (`src/js/conversation.js`, generic emission after
   `convoComposeBeat`, scoped to `'ask:'` turns): WouldBlock on the COMPOSED
   line → honest exhausted line. The prereg placed this guard in `topic2Ask`;
   proof debugging showed that guard is dead (the generic emission prepends a
   random 1-of-3 topic ack, so the run ledger holds the ack-prefixed
   composite and WouldBlock on the bare line is always false). The `topic2Ask`
   guard was removed; `convoTopics.js` is unchanged. Recorded in the prereg's
   execution addendum.

Proof `scripts/test-journey-social-life-r234-dry2-20261117.js`: **27/27 on fix,
23/27 on base** (exactly the 4 discriminators fail on base; all guards pass
on both). Both directions re-run by the adopter. Diff: conversation.js +20,
convo-dialogue.js +19/−1, truth.js +18/−1.

**Wild hold of the DRY2 sites: PASS.** None of this panel's 4 dry servings
is at a DRY2 site (no probe-stonewall, no confront, no neighbors-topic dry).
The dry line persists at NEW sites — see DRY3 below.

## Panel

- **4/4 villages survived to d138–139; 0 scattered.** 640 conversations,
  623 transcripts read by the analyzer.
- **M1 GO** — plots 8 (all early, d7–26), arms 8, grievance-linked 8/8 by
  the reasons bar. Springs 7 (5 escaped, 2 hurt), 1 expired plot.
- **M2 rate 0.383** proposals per village-day (212 proposals / 553 lived
  days; r195 0.328, r200 0.177 — watch only, no bar).
- **M3 GO (sometimes-taken)** — lure accept 400 / decline 286; party accept
  28 / decline 10; bond accept 11 / decline 15.
- **M4 (human-read):** 623 transcripts, 321 nearDupFlags. The 4 printed
  candidates are two families: the Haven-door positioning instruction
  ("same side of the Haven door" in 4 paraphrase variants — the game
  re-explaining how to stand next to your partner to help) and repeated
  live-want re-asks (pantry run / creek water run, same ask restated).
  Verdict: instructional repeats + live-want persistence, not conversational
  parroting. The door-position instruction is the same cluster every run;
  it reads as the game nagging, not a person repeating themselves.
- **M5 GO** — 4/4 past d100. **Moots 7** (3+1+1+2).
- **M6 GO** (re-aligned gate definition) — no naming-beat line emitted beyond
  radius-1 of Haven; debates alive (169 kicked, 168 settled).
- **M7 HOLDS** — NARR-DUP verbatimRepeats 0. **M9 HOLDS** — recap cap fires
  (616 presses, 0 after cap). **M10 HOLDS** — no NARR coach line repeats
  verbatim in one sitting. **FACE HOLDS** — no accuseFace repeats.
- **M11 GO** — recap-empty flags 0/321. **M12 informational** — door-req
  flags 173/321 (27.8%); M12-native HOLDS (threeTimes 96, max 1 per
  sitting, 0 sittings 2+, exits 253).
- **M8 SETTLED** — 3 links formed via driver settle, no BLOCKED re-raise.
- **B5:** 12 funerals — **8 full / 3 partial / 1 none** (r231: 14/4/0).
  Funeral feasts honest throughout (1,500–9,000 kcal; one pantry-empty
  feast honestly unmended, trust −8 stands).
- **B6 GO** — 712 want-resolutions, deflected-from-stage-0 = 0.
- **CONFESS:** 46 total, 13 confessed, 13 already-confessed, 13 deflected,
  0 double-sittings.
- **BOND ANSWERED** — 212 villager-initiated proposals (116 link, 96
  person; 47 accepted, 15 refused, 93 staged, 57 expired). Person
  accepted 27. End bonds per seed: 94 / 84 / 84 / 66.
- **F1 GO** — 3 "has an edge today" hits, all legitimate NARR mood beats.
- **F3 watch** — no commit-refusal-as-memory sighting.
- **F5 WILD CHECK — thin but real: 3 servings** (all variant 2, "It's taken
  care of, I swear...", on 45711 ×2 and 45712 ×1; r231: 1, r226: 8).
  Served honestly, not dry. **Per the r231 rule the targeted harness from
  the r229 metric review is now owed** (two thin panels in a row) — filed
  as a remainder, not built here.
- **F6 WILD HOLD — NO-GO: 4 dry servings panel-wide** (45709: 0, 45710: 1,
  45711: 2, 45712: 1). Same count as r231, all at NEW sites. See DRY3.

## People check (full transcripts read)

- **James Okonkwo (45711, C-friendship)** reads like a person with a real
  need: "The stores won't stretch past tomorrow, and I'm not choosing who
  eats" — concrete plan, far treeline, sunup, pack and knife. The driver
  hammered "Why can't I do this now?" 4× and the NPC answered with
  escalating "As I said — / Like I said — / Still the same thing —"
  prefixes on the same content: a person getting firmer, not a parrot.
  The sitting ends naturally with a parting.
- **Trail-talk loop (45711, D-talk-request, gen_0pp3dol):** the driver
  picked "Talk on the trail for a while" 7× and got the same two lines
  alternating 4× each ("Two pairs of eyes, twice the ground. That was the
  deal, and it is working." / "Onward — there is more green ahead.").
  No new content, no want, no progression — filler, not conversation.
  The pool is 2 lines deep. A real player mashing the same option hits
  the same wall. Filed as a finding (wider pool or a spent-after-N guard),
  not fixed here.
- **Dropped-thread next sittings resurface live wants:** after each dry,
  the next sitting names the live want honestly (trap line, water haul,
  grief). The thread drops; the want survives.

## DRY3 — the finding (fix design filed, not built)

Four dry servings, three shapes, all in D-talk-request sittings:

1. **Expedition-ask answer ×2** (Catalina Reyes, Liam Davis — "What did
   you see out there?"). The handler (`villager-agency.js` ~1203) speaks
   the lesson line (monster/plant) with NO WouldBlock pre-check: only the
   place branch is exempt (`diegeticAct`) and only the closer pool is
   pre-checked (r193). A lesson line already in the run ledger — most
   plausibly a plant lesson another villager already taught — dry-replaces
   on the answer turn. **Fix shape:** pre-check the lesson line with
   WouldBlock like the closers do, falling through to the closer pool
   when blocked (same class as r193).
2. **dlg:details favor explanation ×1** (Liam Davis — "Tell me why you
   need this."). The favor-detail answer line is handed to sayLine
   without a WouldBlock guard. **Fix shape:** guard at the source, same
   class as DRY2 site 2.
3. **Greeting ack ×1** (gen_b7edxxa — "Yeah. Hey."). The NPC's reply to
   a greeting dries. **Fix shape:** guard the greeting-reply emission,
   same class.

The pattern across F6 → DRY2 → DRY3: each fix closes the sites the last
panel found, and the dry line moves one layer out to the next unguarded
sayLine call. The durable fix is a choke-point guard in sayLine itself
(never serve the dry line for a ledger-blocked line when a fallback
exists) — that is a bigger change than a site fix and needs its own
prereg + proof. Filed here; the DRY3 site fixes are the next arm.

## Census

- 45709: Lily (social_worker) survives d138, 4 alive, 14 fallen; 5
  successions (Easton→Franz→Verena→Fasil→Vikram→Lily); 20 feasts, 3 moots.
- 45710: Valeria survives d138; 6 successions (Carol→Naran→Liam→Brian→
  Daniyar→Sanne→Valeria); 19 feasts, 1 moot.
- 45711: Maya survives d139; 4 successions (Sarah→Ming→Tânia→Liam→Maya);
  19 feasts, 1 moot.
- 45712: Chris survives d138, 8 alive; 5 successions (Molly→Naran→Silas→
  Esmeralda→Pablo→Chris); 19 feasts, 2 moots.
- Deaths are monster/wild/arena/contest/starvation, no death clusters
  ≥3/day. No village won or ended.

## Telemetry

`telemetry-check.js` vs the social baseline: **QUIET** (4 files, 4 metrics,
no large deviations). Baseline NOT rolled (same as r231 — the social.json
baseline carries only stale-era l3.* keys the driver never emits; the
metric-mapping re-seed from the prereg's stretch item stays deferred).

Determinism proof (adopter): seed 45710 re-run to a scratch OUTDIR — JSONs
identical except the `ms` timing field. The driver wraps add no RNG and
mutate no state.

## Gate

`node scripts/check.js --quick` on the rebased tip: **331 passed, 9 failed,
0 attributable** (1244s). The 9: measurement-proof staleness pair
(2 — the DRY2 src/js change invalidates the retained proof, expected;
refresh is the proof-refresh round's job, round 21 owed), phone-frame
stale receipt (1, standing), ladder-bundle (1, standing), and five exact
120s timeouts (living-garden, one-person-army, trust-observer-neutrality,
capable-bot, table-endings — all known load artifacts on a loaded box).

## Metric review

- **F6 bar (0 dry panel-wide) keeps missing at new sites each round**
  (r226: 21 → r231: 4 → r234: 4). The bar is right; the fix scope is
  per-site. The next arm should be DRY3 (three sites above) or the
  sayLine choke-point guard — not another single-site patch presented as
  a cure.
- **M4 near-dup count (321) is dominated by instructional lines** (the
  Haven-door positioning cluster + live-want re-asks). Propose splitting
  M4 into instructional vs conversational dups next run; the current
  count punishes the game for re-explaining a mechanic.
- **F5:** the analyzer carries no settled-favor counter; the count above
  (3) was produced by grepping the three r225 variant texts in the panel
  JSONs, as r231 did. A counter in the analyzer is owed with the
  targeted harness.
- **B5 split** (8/3/1) stays informative; keep instrumenting.

## Verdicts

- **Reachable:** yes — invitations, bonds, moots, funerals, confessions,
  and the full want arc all fire across a full run.
- **Fun:** mostly — villages read like people and wants survive across
  sittings, but the dry line still bites 4 times a panel and the
  trail-talk loop is 2 lines deep.
- **Winnable:** not judged on this leg.

## Remainders

- DRY3 fix arm (three sites above, or the sayLine choke-point guard).
- F5 targeted harness (owed per the r231 rule — two thin panels).
- Trail-talk pool widening (2 lines deep).
- repay.engageBeat broken/open pools (same class as F6, unobserved);
  all-3-blocked F5 residual (r226).
- Proof refresh round 21 (measurement-proof pair fails on any src/js
  change until refreshed).
