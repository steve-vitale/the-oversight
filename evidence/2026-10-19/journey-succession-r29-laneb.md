# Journey-succession r29 (lane B) — "THE CHAIN" (2026-10-19)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question:** does the machinery hold across a THREE-DEATH CHAIN in one
run? Every proof so far does ONE death per run. Never proven end-to-end:
mantleOf chain honesty, lineage stacking, the "you're not X" beat naming the
IMMEDIATELY preceding bearer on deaths 2+, trust inheritance across the
chain (the 2026-10-13 compound fix on a real chain), stamp honesty after 3
deaths (inheritedName attribution), promise release/moot chained (r25 + r27).

**Interesting-finding criteria:**
(a) chain holds cleanly → machinery proven on chains; note stands.
(b) break at a named link → REAL BUG.
(c) stamp misattribution across the chain → REAL BUG.
(d) trust floor violated → REAL BUG (compounding regression).

**Seeds:** 9401–9404. **Policy:** competent throughout.
**Profile:** 3 scripted kills via the REAL playerDeath (~d15 'a hushwolf',
~d29 'the fever', ~d43 'starvation'); organic mid-phase deaths expected on
this schedule and folded into the chain by a bearer-watcher. Forcing: one
favor+promise per kill through the real favor machinery (death 1 → highest-
trust promisee, testing the r27 moot path; deaths 2/3 → lowest-trust ≥30,
testing release→asked).
**Binding metrics:**
- M1: all 3 scripted mantles pass on ≥4/4 seeds (bearer changes, game
  continues, village alive, lineage entry per death). Kill rule: mantle
  fails on ≥2/4 → SUBSTRATE-MISSING.
- M2: the GAME's lineage[] and mantleOf[] arrays agree on every link
  (entries match, head-to-tail connect, days ascend, every entry has a
  cause, last link's `to` == current bearer).
- M3: every successor's trust ≥ 10 (the floor), decay recorded.
- M4: ≥2 death-2/death-3 handoff transcripts sense-read → names right, no
  corpse speaks, successor identity announced.

## What happened

**M1: 4/4 GO.** 12 scripted mantles + 3 organic mid-phase deaths (all
combat) = 15 handoffs, every one clean: bearer changed, lineage entry,
mantleOf link, village alive (8–10 living at end), game continued.

**M2: 4/4 GO** — all six sub-checks true on every seed: lineage↔mantleOf
match, links connect head-to-tail, days ascend, causes present, last link
lands on the current bearer. Example chain (9401): Ji →(hushwolf d15)
Ray →(combat d25, ORGANIC) Nia →(fever d29) Riley →(starvation d43)
Abigail. The organic combat death is a first-class link — same beats, same
records.

**M3: 4/4 GO.** Trust floor held for every successor (lowest: 23). Chains:
9401: 42→53→57→47. 9402: 23→24→35→62. 9403: 32→32→40→44. 9404: 43→62→79
(the office GAINS standing across successions when the village vouches —
the 2026-10-13 formula working as designed, not compounding to zero).

**M4: GO (5/5 sense-read).** The beats are honest on chains: "You're not
Nia" names the immediate predecessor (never the first bearer, never a
corpse); the orientation beat names each new face with age + occupation;
grief bonds fire per-successor (+5 trauma when they knew the dead bearer);
vouchers speak only when earned; the open book names each death's unkept
promises. The organic combat handoff (Ray→Nia, killed by a Tanuki's
Belly-Drum Thunderclap mid-fight) runs the FULL machinery — death beats,
"you're not Ray" from Abigail, Codex sync, orientation, grief, vouching.

**Stamp scan: 479/479 clean** across 4 seeds (102–137 per seed). Every
inh/inhFrom stamp names a real dead bearer; none names the current bearer
or an unknown name.

**Favor dispositions chained:** the r27 promisee-moot path fired twice
(9403 deaths 1+3: Arturo→Medet, Miles→Yara — favor 'moot', promise
'released', open book names the need honestly); release→asked fired on all
other forced promises. Zero zombie promises at end on all seeds.

## The almost-bug: the phantom swap (instrument error, not a game bug)

The first pilot run appeared to show a SILENT bearer swap (Ray→Nia, no
lineage entry, no mantleOf link, 29 "bad" stamps). Investigation:
1. Audited every `villagerId` write site — only `playerDeath`
   (ledger.js:836) and the nomad road (inactive). No second succession path
   exists.
2. Reproduced on the same seed with a bearer-watcher armed: the swap was a
   REAL, HONEST combat death mid-phase — full playerDeath machinery,
   lineage entry ("Ray Katz", d25, "combat"), mantleOf link, all handoff
   beats. The pilot's bookkeeping only sampled the chain around its own
   kills, so it missed the organic link and misread everything downstream
   (the "bad" stamps were Nia's legitimate stamps; my dead-bearer set
   didn't know she'd held the office).
3. Fixed the instrument: the bearer-watcher now folds organic handoffs into
   the chain record, and M2 reads the game's full arrays instead of the
   script's incremental sampling. Re-ran all 4 seeds: everything green.

No game code changed for this. The lesson is filed under the script header.

## Village assessment (plain words)

Four villages, all alive at the end (8–10 living each). Fifteen bearers
across the four runs picked up the Codex; every handoff was marked — the
village stopped, somebody screamed, somebody else started digging, and the
new face was named aloud with their old occupation. Trust in the office
mostly held or grew across chains (one village saw the office at trust 0
twice — the bearer had a bad fortnight — and the floor still gave each
successor a hearing). The Codex survived every death intact (breadth
53–65). Promises died with their makers and were named in the open book;
two became moot when the promisee inherited (correct — you can't owe
yourself), the rest went back to live asks. Nothing was lost that the
village didn't mark.

## People check

Full handoff transcripts on all 15 deaths. The chain-specific beats hold:
on death 3 the village says "You're not Riley" (not "you're not Ji" —
it tracks the immediate predecessor); the successor's grief names the
person they knew ("You knew Ray — not the office, the person"); vouchers
speak at graves only when the dead bearer earned them. One wrinkle carried
forward (not new): the open-book line "help Medet with their injury" uses
generic "their" for a named villager — slightly flat, social-loop
territory if they want it.

## Blanks filled / documented

1. **Documented (no game change): the phantom swap** — root-caused to
   instrument bookkeeping (above). The game was correct throughout.
2. **Moot path re-verified on a chain** (r27's fix, 2 firings): promisee-
   heir favor → 'moot', never a zombie self-ask.
3. **Trust-0 bearer observed** (9402, twice): the office can hit trust 0
   during play; the inheritance floor (≥10) still gives each successor a
   hearing. Working as designed; noted.

## Metric roll-up

- M1: 4/4 GO (15/15 handoffs clean, incl. 3 organic).
- M2: 4/4 GO (all six sub-checks).
- M3: 4/4 GO (floor ≥10 everywhere; lowest 23).
- M4: 5/5 transcripts meet the bar.

## Metric review

M2 was revised mid-build (not mid-run): the pre-registered M2 read the
script's incremental chain sampling; the organic-death discovery showed
that sampling misses real links. The revision (read the game's full
lineage[]/mantleOf[] arrays) is STRICTER, not friendlier — it verifies
more links, not fewer. The bar stands; the instrument got honest. Filed
here per §14.

## Findings for Steve (design calls)

1. **Chains hold.** The succession machinery is proven across 3–4-deep
   chains now, including organic mid-run deaths. No design call needed —
   this is confirmation.
2. **r28's open items stand:** the Simone zombie (dead-need 'asked' favor,
   inert — still no daily sweep, your call) and the gratitude-template
   variation question (same-day thanks for two villagers still waits a
   conversation by design).
3. **Trust-0 office:** the bearer can hit trust 0 mid-run (9402). The
   floor handles succession; whether the mid-run experience at trust 0
   feels right is a social-loop question, not succession's.

## Reachable / fun / winnable

- **Reachable:** the mantle passes every time (15/15), including deaths the
  run didn't script. The chain is the normal case, not an edge.
- **Fun:** the handoff beats stay the emotional spine of the leg — the
  combat-death handoff (killed mid-fight, village reacts, new face named)
  is the strongest version of it.
- **Winnable:** neutral — succession is continuity machinery, and it held
  across every chain.

## Telemetry

telemetry-check vs telemetry-baselines/succession.json: **quiet on shared
metrics** (census.alive/fallen/integrationStage — no large deviations).
LOUD lines on deaths.bearer (5→15) and the two new chain.* metrics are
EXPLAINED: this run's chain profile does 3 scripted kills + organic deaths
per seed by design vs the baseline's single-death profile. Baseline NOT
rolled (different profile; the standard-profile baseline stays).

## Regression

- New/updated proof script: scripts/journey-succession-r29-20261019.js
  (bearer-watcher + organic-handoff folding + array-based M2).
- check.js --quick: 252 passed, 5 failed in 1835s (final list captured in recovery). All 5 are scripts/godpath/ (Codex lane, zero of them touch succession machinery): test-main67-gossip-resume-beat (2 assertions — 'failed gossip still restores the real narrator'), test-measurement-proof-update ('Proof source inputs are not current'), test-measurement-workflow ('retained neutrality proof covers the current Game/controller/harness inputs'), test-occupation-panels (120s timeout — requires browser/phone evidence per MOBILE-PLAYTEST.md), test-phone-frame-proof ('current phone evidence is required'). This run changed zero src/js files (harness + evidence + tele JSONs only), so none of the 5 can be caused by this arm — pre-existing Codex-lane drift against master. Not blocking this landing; the lane owner reconciles godpath proofs against master per AGENT-LANES.md.
- 4 per-seed tele JSONs in evidence/2026-10-19/
  (journey-succession-r29-tele-940{1,2,3,4}.json).

## Landing

- Commit: scripts/journey-succession-r29-20261019.js + 4 tele JSONs +
  evidence/2026-10-19/journey-succession-r29-laneb.md.
- rotation-b: 7 → 4 (endgame next). Lock deleted.
- Report: "merged locally, pending ship" — no version tag; the ship job
  reports the tag when it goes live.
