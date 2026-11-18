# Journey social life r235 — Lane B (2026-11-17)

## Run

- Lane B occurrence 17:00 CST Nov 17, 2026 (run_id `loop2-20261117T225525Z`).
- Rotation-b read 5 at run start. This run plays 5 (social life) and writes 6 at closeout.
- Base at registration: `392ec63d4` (master; worktree branch `journey2-social`).
- Leg 5 (social life). Seeds 45717–45720 (fresh band, verified in the prereg), DAYCAP 140, policy journey.
- **ADOPTION:** the 17:00 coordinator timed out at 3600s mid-proof (DRY3 fix
  written, stashed as stash@{0}; proof test written; base run done, react-guard
  anomaly under investigation; no panel, no commit). The run was verified dead
  in the main session (registry heartbeat 23:37:46Z, >15 min stale at 23:57Z,
  no hbloop process) and adopted: the tree was heartbeated first, the fix was
  restored from stash@{0} by explicit ref (never bare pop; stash left in
  place), the react anomaly was root-caused (see below), the proof was re-run
  both directions by the adopter (37/37 green, 30/34 red on base), the panel
  was run fresh by the adopter (exit 0, 4/4 seeds), then analyzer, telemetry,
  and gate were run by the adopter. No partial panel JSON existed, so no seed
  was double-run. The 18:00 Lane B occurrence stood down on the adoption
  heartbeat (correct).

## Leg question (carried from r226 + r229 + r231 + r234)

Does social life hold up across a full run — invitations sometimes taken,
bonds proposed and answered by character, moots firing, conversations
reading as people, wants surviving across sittings without drying into the
"...lost my train of thought." dead line — and do the r226 F6 fix, the r231
C3d fix, and the r234 DRY2 fix hold in the wild, with the r235 DRY3 fix
closing the three new dry sites?

## Fix arm: DRY3 — landed [needs-eyes]

The r234 panel's 4 dry servings at 3 new sites. One shared mechanism:
`sayLine` is handed a line with no `convoWouldBlock` pre-check, and its
truthy dry-line return fools the caller's "primary spoken" test. Fix, all
three sites:

1. **Expedition-ask answer** (`src/js/villager-agency.js`, `agencyTurn`):
   pre-check `convoWouldBlock(vid, lineText)` before the lesson sayLine
   (place branch keeps its `diegeticAct` exemption and skips the check);
   when blocked, skip sayLine and fall to the r193 closer pool (already
   pre-checked) or the honest noop.
2. **dlg:details favor explanation** (`src/js/convo-dialogue.js`): new
   shared helper `convoWouldRunBlock(vid, line)` in conversation.js — true
   only when the line's first-chunk key is in the run ledger AND NOT in this
   sitting's ledger. On a run-block, serve the `dlg:details:dry` pool
   deflection via sayLine with `{ structural: true }` (generic grammar,
   DRY2 stonewall precedent) with the same tail. A within-sitting
   self-block still flows to sayLine → null → the existing self-repeat
   path (r16 honesty: the "I just said" accusation is only true for
   within-sitting repeats).
3. **dlg:react greeting reply** (`src/js/convo-dialogue.js`): pre-check
   `convoWouldBlock(vid, composed)` before sayLine; when blocked, skip
   sayLine and fall to the existing dead-react wind-down (structural
   pool), like a dry thread.

Proof `scripts/test-journey-social-life-r235-dry3-20261117.js`: **37/37 on
fix, 30/34 on base** (exactly the 4 discriminator-linked failures on base;
all guards pass on both). Both directions re-run by the adopter. Diff:
conversation.js +25, convo-dialogue.js +42/−1, villager-agency.js +18/−1.

**Prereg-count correction:** the prereg says "exactly the 3 discriminator
assertions fail on base" — the actual count is 4, because the agency
discriminator carries two failing assertions on base (speaks-a-closer AND
reports-a-closer; the does-not-respeak assertion passes vacuously since
the transcript holds the dry line). The intent (discriminators only,
guards pass on both) holds exactly.

**Wild hold of the DRY3 sites: PASS — 0 dry servings panel-wide** (see F6
below). Site-by-site wild exercise: site 2 (details) pressed 149× with
zero dries — real hold. Site 3 (react) fired 3,224× with zero dries —
real hold. Site 1 (expedition ask) was asked only 4×, all with teachable
content (place/plant lessons, no fallback collision) — the wild hold
there is unproven by this panel; the proof carries it.

### Adoption finding: the belong-pool line was honest game behavior, not a defect

The timed-out run's base proof showed a 5th failure: the react GUARD
failed on base, speaking "Just... include me. In things. That's all I
want." — a `belong`-pool line — for a villager whose `npcGoal` read
'lead'. Root-caused by the adopter with a temporary probe (removed
before commit; no src change):

- The villager (gen_pkg7bj4) has a LIVE GOAL LIE: true goal 'lead',
  told goal 'belong'. truth.js wrapper 0b (`convoThreadBeat`) swaps
  `vp.goal` to the lie's told value for pool selection while a goal lie
  is live (comment: "a goal liar would discuss their TRUE goal's
  follow-ups" — i.e. the cover goal's), and the fillTalkLine wrapper
  does the same for the fill. The beat correctly came from the belong
  pool. The test's guard assumed the beat comes from
  `goalFollow[npcGoal(vid)]`, which is false for a goal-liar.
- Test fix (test-only, no src change): a `spokenGoal(Game, vid)`
  helper that returns the live lie's told value when `lieLive` holds,
  else `npcGoal(vid)` — mirroring the engine's own gate. Used for the
  react pool lookups in both the guard and the discriminator. After
  the fix the base run is 30/34 with exactly the 4 discriminator
  failures and all guards green on both sides.

## Panel

- **2/4 villages survived (45717 d139, 45719 d136); 2 lost (45718 d118
  village-lost with 0 alive, 45720 d75 scattered with 5 alive).** 512
  conversations, 496 transcripts read by the analyzer.
- **M1 GO** — plots 4 (all early, d16–25), arms 4, grievance-linked 4/4
  by the reasons bar (binding judge). Springs 3 (2 escaped, 1 killed),
  1 expired plot. Vendetta max 3 (Onni<->Sam).
- **M2 rate 0.31** proposals per village-day (145 proposals / 468 lived
  days; r195 0.328, r200 0.177 — watch only, no bar).
- **M3 GO (sometimes-taken)** — lure accept 409 / decline 375; party
  accept 28 / decline 18; bond accept 14 / decline 12.
- **M4 (human-read):** 496 transcripts, 212 nearDupFlags. The printed
  candidates are the same two families as r234: the Haven-door
  positioning instruction ("same side of the Haven door", 4 paraphrase
  variants — the game re-explaining how to stand next to your partner)
  and repeated live-want re-asks (pantry run) plus the teach-lesson
  same-opening template ("You show them Cattail / White Oak Acorns /
  Pokeweed / Muscadine Grapes — where it grows..."). Verdict:
  instructional repeats + template families, not conversational
  parroting. The M4 split proposal (instructional vs conversational)
  stands.
- **M5 REPORT-ONLY** — 3/4 past d100 (45717 d139, 45718 d118, 45719
  d136; 45720 lost d75). **Moots 6** (0+1+3+2).
- **M6 GO** (re-aligned gate definition) — no naming-beat line emitted
  beyond radius-1 of Haven; debates alive (154 kicked, 148 settled).
  Strict-definition away total 32 = the known metric/gate discrepancy,
  does not fail M6 (prereg).
- **M7 HOLDS** — NARR-DUP verbatimRepeats 0. **M9 HOLDS** — recap cap
  fires (493 presses, 0 after cap). **M10 HOLDS** — no NARR coach line
  repeats verbatim in one sitting. **FACE HOLDS** — no accuseFace
  repeats.
- **M11 GO** — recap-empty flags 0/212. **M12 informational** — door-req
  flags 121/212 (24.4%); M12-native HOLDS (threeTimes 65, max 1 per
  sitting, 0 sittings 2+, exits 173).
- **M8 SETTLED** — 3 links formed via driver settle, no BLOCKED
  re-raise.
- **B5:** 17 funerals — **12 full / 4 partial / 1 none** (r234: 12/3/1;
  r231: 14/4/0). Funeral feasts honest (8,067–20,800 kcal mended).
- **B6 GO** — 511 want-resolutions, deflected-from-stage-0 = 0.
- **CONFESS:** 29 total, 10 confessed, 13 already-confessed, 4
  deflected, 2 cleared, 0 double-sittings.
- **BOND ANSWERED** — 145 villager-initiated proposals (68 link, 77
  person; 48 accepted, 12 refused, 60 staged, 25 expired). Person
  accepted 29. End bonds per seed: 113 / 165 / 82 / 66.
- **F1 GO** — no commit-refusal-as-memory sighting (F3 watch: none).
- **F5 WILD CHECK — 0 servings** (all three r225 variants 0 across
  all seeds; r234: 3, r231: 1). Third thin panel in a row — the
  targeted harness from the r229 metric review stays owed.
- **F6 WILD HOLD — GO: 0 dry servings panel-wide.** First clean F6
  panel (r226: 21, r231: 4, r234: 4, r235: 0). Verified by grep over
  all four per-seed JSONs, the analyzer log, and the panel log — the
  dry-line text appears nowhere. The DRY3 fix holds in the wild at
  the two sites the panel actually exercised (details 149×, react
  3,224×); site 1 unproven in the wild (see above).

## People check (full transcripts read)

- **Raj Patel (45717, d66, C-friendship, water haul)** reads like a
  person with a real need: "Water's almost gone — 2 liters. I can't
  carry enough alone." Concrete numbers (2 liters, 9 people), the
  driver hammering "Why can't I do this now?" 5× and the NPC answering
  with escalating "As I said — / Like I said — / Still the same thing
  — / I've told you three times now — / We're going in circles —"
  prefixes on the same instruction: a person getting firmer, not a
  parrot. The favor closes honestly on "I can't right now" ("Right. I
  get it." + subject closed). The recap ("Wait — what were we talking
  about?") names the live want honestly. Sour note: the same
  accept-first instruction 5× is the M4 instructional family again,
  and the sitting ends with three closers stitched in a row
  ("Alright — carefully, now." / "Anyway — where was I?" / "Forget I
  asked. I'll figure it out.") — each honest, the sequence slightly
  stitched.
- **gen_wfzrket (45717, d19, D-talk-request, florist)** — thin but
  voiced, not dry: "Same weather, different day. I keep notes." /
  "Same as always: we endure." The "How am I doing" beat is genuinely
  personal ("I'd follow you out past the treeline. Don't tell the
  others — they'd want to come too."). Ends warmly ("A month ago I
  wouldn't have said any of this to you.").
- **Sigrun Eiriksdottir (45720, d33, D-talk-request, forage ask)** —
  the forage ask is a real plan (tiger nut ground, pack and knife,
  first light), and the "Why can't I do this now?" hammering gets the
  same escalating-prefix treatment as Raj's. The sitting ends on a
  human note ("Okay. That's — I need a minute. A long minute." /
  "First light. The pantry's counting on us.").
- **Trail-talk loop (45720):** the pool is still 2 lines deep — the
  exact r234 line A ("Two pairs of eyes, twice the ground. That was
  the deal, and it is working.") recurs 12× on this seed. A real
  player mashing the same option hits the same wall. Finding stands,
  not fixed here.

## Census

- 45717: Walt (florist) survives d139, 11 alive; 4 successions
  (Ashley→Dominic→Diana→Scott→Walt); 19 feasts, 0 moots.
- 45718: Thabo's village lost d118, 0 alive, 33 fallen; 11
  successions (Moshe→Gunther→Stan→Tanisha→Wanjiru→Priya→Oliver→
  Askar→Daniyar→Xavier→Frehiwot→Dmitri); 16 feasts, 1 moot.
- 45719: Onni survives d136, 9 alive; 4 successions
  (Brianna→Carl→Ella→Hemi→Onni); 19 feasts, 3 moots.
- 45720: Sanne's village lost d75 (scattered), 5 alive; 2
  successions (Finn→Petra→Sanne); 11 feasts, 2 moots (analyzer count;
  mootNotes lists 3 rows).
- Scholar deaths (mantle passes): 21 panel-wide (4/11/4/2). The 45718
  chain of 11 bearers in 118 days ends with the village lost and
  nobody alive — the standing scholar-death watch.
- Deaths are monster/wild/arena/contest/starvation, no death clusters
  ≥3/day. No village won or ended.

## Telemetry

`telemetry-check.js` vs the social baseline: **QUIET** (4 files, 4
metrics, no large deviations). Baseline NOT rolled (same as r231/r234
— the social.json baseline carries only stale-era l3.* keys the driver
never emits; the metric-mapping re-seed stays deferred).

Determinism proof (adopter): seed 45718 re-run to a scratch OUTDIR —
JSONs identical except the `ms` timing field and the `sitting`
counter (a per-process global, not per-seed: the panel's 2nd seed
starts offset by the 1st seed's sittings; content identical). The
driver wraps add no RNG and mutate no state.

## Gate

`node scripts/check.js --quick` on the branch tip: **TBD — fill in
before landing** (expect the standing set: measurement-proof
staleness pair, phone-frame stale receipt, ladder-bundle, timeouts).

## Metric review

- **F6 bar (0 dry panel-wide) is MET for the first time** (r226: 21 →
  r231: 4 → r234: 4 → r235: 0). The per-site patch program worked.
  The sayLine choke-point guard question stays open: with F6 at 0,
  the next panel decides whether a fourth site appears (choke-point
  becomes the arm) or the line stays quiet (sites were the whole
  story).
- **Prereg count correction:** "exactly the 3 discriminator
  assertions fail on base" undercounts — 4 fail (agency carries two).
  The bar's intent (discriminators only, guards pass on both) is the
  binding reading; the count is corrected here, not re-scored.
- **M4 split:** the near-dup count (212) is still dominated by
  instructional lines (Haven-door cluster + live-want re-asks + teach
  templates). The split proposal stands for the next run.
- **F5:** third thin panel in a row (1, 3, 0). The targeted harness
  stays owed; the analyzer still carries no settled-favor counter
  (this count was produced by grepping the three r225 variant texts,
  as r231/r234 did).
- **Determinism `sitting` field:** the per-seed JSONs carry a
  process-global sitting counter, so a solo-seed re-run differs in
  that field only. Harmless, but the driver could reset it per seed.

## Verdicts

- **Reachable:** yes — invitations, bonds, moots, funerals,
  confessions, and the full want arc all fire across a full run.
- **Fun:** mostly — villages read like people and wants survive
  across sittings, the dry line is silent for the first time, but
  the trail-talk loop is still 2 lines deep and the instructional
  repeats (Haven-door, accept-first) still nag.
- **Winnable:** not judged on this leg.

## Remainders

- F5 targeted harness (owed per the r231 rule — third thin panel).
- Trail-talk pool widening (2 lines deep; line A 12× on 45720).
- repay.engageBeat broken/open pools (same class as F6, unobserved);
  all-3-blocked F5 residual (r226).
- Proof refresh round 21 (measurement-proof pair fails on any src/js
  change until refreshed).
- M4 split (instructional vs conversational) — proposal for next run.
- DRY3 site-1 wild hold unproven (no fallback collision in the wild
  this panel; proof carries it).
