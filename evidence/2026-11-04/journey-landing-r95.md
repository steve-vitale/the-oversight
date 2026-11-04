# journey-landing r95 — run note (lane A, leg 0 LANDING)

**Run id:** laneA-20261104T065218Z (scheduled 00:45 CST 2026-11-04). Base
master@def4f8f40 at branch creation; worktree `journey-landing`. Rotation read 0
→ leg 0 LANDING; 0→1 written at run start and verified by read-back.
Prereg: evidence/2026-11-04/journey-landing-r95-prereg.md (committed with
this run). Panel outputs: goal hidden_files evidence/2026-11-04/landing-r95
(census/system/transcript/pilot+main logs) + landing-r95-pilot/ (seed 817) +
landing-r95-repro805/ (seed 805 rerun) + analyzer, fights, checkquick logs.
Driver: scripts/journey-landing-r95-20261104.js (r94 driver verbatim except
seeds 817–826, OUTDIR landing-r95, header — diff verified). Analyzer:
scripts/analyze-landing-r94-20261104.js (unchanged, dir-as-argv). Shape test:
scripts/test-landing-r94-shape.js.

## Panel verdicts (as run)

- **M6 DOORSTEP-GO (binding): PASS on its clauses.** 253 doorstep checks, 246
  Haven days, triggered 2, ate 2, drank 1, doorFromOutside 2, doorRefused 0,
  0 class-E starvation deaths. The two triggered steps (818 d16: kcal
  1134→2355, inside false→true; 821 d14: kcal 203→2400, hyd 23→73, inside
  false→true) both ate from outside the hall and both succeeded.
- **M10 DAWN-DOOR, LIVE-ONLY (binding): PASS on its clauses.** 277 dawn opps,
  waitDiagMissing 0. Live promises 97 (waiting 7, has-run 46, kept 41,
  node-not-home 3); ledger rows 180 (65% of pooled opps — the r89/r94
  counting artifact, reported separately, never counted as door blocks).
  7 waited live opps, 7 approaches, sidestep attempts 9, ok 7, 0
  unexplained door blocks. Two waited opps did NOT depart, for a
  non-door reason that is this run's live finding (see below): 821
  Chloe (d11) and Ursula (d13) both waited, both were refused with
  "Finish your current outing before starting another" because Raj's
  live run (departed d9, due d10) was still live — both promises broke
  NO-DEPART. The door is not implicated in either; the live outing is.
  Caveat (probe reach, not a game block): on 819/820/824/826 no favor
  ever waited at dawn — the probe could not reach the partner ("Your
  partner is inside the Haven hall" / "Move next to your partner, on
  the same side of the Haven door"), the same Haven-door adjacency
  stall noted in r74. The game door is not implicated; the probe's
  walk-toward stalls at the hall door.
- **M1 ALIVE-D14: 10/10 PASS** (pops 9–12 at/around d14; 820's series skips
  day 14 itself — d13 pop 12, d15 pop 12 — alive across it, not missing).
- **M2 SYSTEM CONTACT: 10/10 PASS** (first contact day 8 on nine seeds,
  day 9 on 818).
- **M3 FIGHT-LOG: PASS** — 29 hunt fights, 29/29 complete, 4 fatal,
  0 unknown/mixed trigger (r94: 23/23). Two zero-damage notes in the
  fight log (a lost fight with 0 player strikes; a fight won by allies
  with 0 player damage) are complete fights with outcomes, not gaps.
- **M5 PEOPLE: PASS (adjudicated — see below).** Wind-down more 7 picks,
  0 empty; WD probe GATE-A GO, GATE-B GO; betrayal held-offers 0;
  party invites 8 offered / 8 spoken / 0 dry / 1 accepted. Fabrication
  flags 0, headcount codas 0, theft (caughtRedHanded) 0, empty beats 0.
  Instrument depth-fizzle flags 2, both adjudicated contentful (below).
- **M7 GUARD v3: kcal PASS, water UNTESTED (standing since r87).**
  Kcal skips 5 → arrivals 5, rescue ladder 5/5 complete, eat-on-arrival
  5/5 ate, 0 refusals, 0 guarded skip-day starvations. Water skips 0 on
  panel + pilot + repro — the water clause still has no wild positive
  case anywhere in r87–r95.
- **M8 SHAPE: PASS** on pilot corpus and on all 9 panel censuses
  (water arrivals 0, kcal arrivals 0–3 per seed).
- **M9 STAY-GREEN: PASS.** Death liturgy exact (griefMiss 0, analyzer
  SUMMARY; every panel death REGISTERED, including 4 scholar deaths —
  Debbie d24 wild → Andres latency 0, Pablo d19 wild → Rocco latency 1,
  Colleen d5 wild → Arjun latency 0, Wolfgang d16 wild → Ricardo
  latency 1). Theft 0 all seeds. Self-sufficiency (last series day)
  0.761–1.014, floor 0.70. Plenty-voice 29–56 all seeds. Starvation
  deaths 0. Scholar deaths 4 on 4/9 panel seeds, all classified wild.
- **Q1 LASTTILE: NO NEW POSITIVE CASE — walk stays repro-proven-only.**
  Both panel doorstep steps carried lastTileWalk=null (scholar already
  on the haven tile when the step ran, enter=true both). The 805 rerun
  on the current base did NOT reproduce the Leonard shape at all:
  doorstep triggered 0 times (fed-and-watered 24/28, already-inside 4),
  no kcal/water skips, no starvation; Leonard died d10 "the wild"
  (mantle Norman d11; Norman died d14 lockjaw, mantle Tanisha d15;
  scholar alive at horizon, kcal 2195, HP 100). The trajectory diverged
  before any doorstep trap could form, so the walk's only positive proof
  remains the r89-lasttile repro on its base. Nothing here contradicts
  the fix (0 refusals, 0 class-E deaths everywhere); nothing here
  re-proves it either. Next landing run should say the same until an
  adjacent-tile arrival recurs.
- **Q2 WATER CLAUSE: UNTESTED again** (0 wild water skips, r87–r95
  standing position, now nine runs deep).

## Blank filled (tooling, no src/js): the r75 live-run pass, folded at last

**The recurrence.** r74's stuck-live-outing blank is NOT closed in the
panel driver line. r74 built a dawn live-run pass into the r75 driver
(end a live run whose promise is already broken, when the player is at
Haven), and proved it on a seed-902 replay (Maya broken → END ok,
Nina unblocked → deliver 810 kcal, kept). But the landing line then
evolved through r89–r94 on a different driver branch, and that pass was
never folded in — grep confirms the r94/r95 driver contains no live-run
pass. This panel re-proves the shape on the current line: 821 Raj
departed d9, delivered late d13 (300 kcal, promise already broken —
NARROW window, due d10), and in between blocked Chloe's d11 wait and
Ursula's d13 wait ("Finish your current outing before starting
another"), both NO-DEPART, both promises broken. A real player talking
to Raj could end the outing (conversation cancel); the panel driver
never did, so the player ate two broken promises for one live run.
This is the same verdict class as r74 — driver coverage, not a proven
game defect — but now with a second, current-line occurrence, the fold
is overdue rather than optional.

**The fold.** scripts/journey-landing-r96-20261104.js = r95 driver
verbatim except seeds 827–836, OUTDIR landing-r96, header, and the R96
LIVE-RUN PASS inserted in outingDawn BEFORE the waiting-partner loop
(so an ended run frees the slot for the same dawn's waits): it logs
every live run (partner, broken?, haul kcal, atHome) into the new
census field liveRunEnds, and ends broken-promise runs when the player
is at Haven via Game.performForageFavor(vid, f, true) — the same end
call the r75 pass proved. Live runs with open promises are logged only.
Diff vs r95 verified: only header/seeds/outdir, the MET init + census
field, and the pass itself.

**Proof, two attempts (both kept).** Attempt 1 (landing-r96-proof/):
the pass fired but END failed twice — d11 and d13, both ok=false,
"Return to Haven together to unload and end this outing." Root cause
in game code, not the driver: the pass gated on playerAtHaven(), a
Manhattan-≤1 RADIUS (game.js playerAtHaven), while the end action
(favor-forage.js forageFavorAction, ending branch) requires the player
ON the haven TILE — the r89 doorstep geometry again, now biting the
END path. The player stood adjacent, so the end refused while the pass
reported atHome=true. Attempt 2 (landing-r96-proof2/, same seed 821,
pass strengthened with the r89 LASTTILE walk before END): d11 Raj
broken → walk (3,4)→(4,4) arrived=true → END ok=true ("0 kcal from
you, 0 kcal from Raj — 0 kcal into the pantry. The promise was
missed; unloading does not earn kept-promise credit.") → Chloe
DEPARTS d11, the exact unblock. Chloe's own run then broke and was
itself ended cleanly d14 (END ok=true, 0 kcal). The fold is PROVEN on
the r94 driver line. Honest trade-off, stated: ending Raj d11 banks
0 kcal where the r95 run's late d13 delivery banked 300 — ending early
forfeits later haul, but stops the blame cascade (Chloe/Ursula no
longer break because of Raj). That is the competent-player judgment
the pass encodes; a player who keeps working the run can still deliver
instead. The r96 driver ships proven; r96's prereg should adopt it
(seeds/OUTDIR TBD then) and re-check the Chloe-haul-0 shape (her d11
run produced nothing by d14 — patch exhaustion, same as Raj's
together-blocked presses — not a pass defect).

## The adjudicated flags (M5, stated plainly — not hidden)

Instrument depth-fizzle count is 2 across 10 seeds (pilot 817 day 1,
panel 818 day 13). Both beats carry specific content, and the 818 case
proves the flag's premise wrong in-thread:

- 817 day 1 (goon, want thread): "These hands? Radio DJ hands.
  Clipboards, mostly. Now they hold wire and wood, and they learn fast.
  Hands are honest that way. That's the whole of it." — the NPC answers
  the want's question (what did you do with your hands) with a specific
  trade history, then closes the topic. Contentful close, not an empty
  beat.
- 818 day 13 (dlg:more, gossip thread): "Piper headed out to see what's
  out there. That's the whole of it." — one gossip item, and the SAME
  thread then deepens to depth 7 (Hannah the Chef, Emmanuel the
  Pharmacist, Wei out foraging, "fires to light — metaphorical ones").
  A continuer that yields six more content beats is not a fizzle.

Verdict: sense-adjudicated empty beats 0; M5 PASS on the sense-reading.
Carried instrument question (metric-review proposal, NOT applied this
run): the fizzle flag fires on a closing phrase ("That's the whole of
it") at depth 1 regardless of content or continuation. It should require
thread exhaustion — no further content beat in the thread — before
flagging. Until that change lands, future runs should report the
instrument count AND the adjudication, as here, not the count alone.

## Village assessment (plain words)

Ten villages, all alive at day 14 (9–12 people) and at the day-28
horizon (7–12). Every one met the System on day 8 or 9. Nobody starved,
though four villages ended the horizon with thin pantries (425–1281
kcal per person on 819/821/822/825; the analyzer's revised gate calls
this WATCH, not HUNGRY — no pantry slide, no starvation death, and
self-sufficiency never fell below 0.76). The fortnight's deaths are
the wild's normal price: monsters, ambushes, the wild itself, one wound
that wouldn't close, one food-poisoning from raw food, two sicknesses —
each grieved properly in the record. Four scholars died and the mantle
passed within a day each time, so the village, not the individual,
carried on. Villagers fought back — 208 monster kills across the
panel, 14–45 per village — and kept one promised outing (822 Nikos,
195 kcal, kept) while two more deliveries landed late with the honest
line ("The promise was missed; unloading does not earn kept-promise
credit"). The pantry-run promise is still the fortnight's social
currency, and the village still answers honestly when it can't keep
one.

## People check (pilot transcripts read in full, 1078 lines; main-panel
flagged sitting read in full; one full sitting per main seed)

GO, with the adjudication above. What the transcripts actually show:

- Curious villagers want a real answer and get one: first memories
  (a kitchen, morning light, age three — answered with "Mine's
  Columbus, Ohio, I think," the NPC's OWN origin per the r94 template
  ruling, not an echo of the player, who named no town), useful
  lessons ("tracking… small useful things stack"), theories (the
  control-group village that got instructions), singing, sleep shifts,
  counting meals not days.
- Deflection has consequences: Tariq (817 day 6) shutters when the
  player changes the subject ("Something shutters, just slightly" /
  "Forget I said anything"), and the sitting ends deflected, not
  papered over.
- The away-guard speaks honestly (817 day 13 Ella: "I'm out on the
  road… Find me when I'm back"), betrayal lures decline cleanly
  ("Another time, then. A small thing, pocketed."), party invites
  refuse with reasons (trust 17/20, "not right now, I've got my own
  things") or accept with character ("Alright. But I'm not carrying
  your stuff." / "Finally. I was wondering when you'd see my value.").
- The naming debate lags one sitting behind the telling, coherently:
  each sitting names the beast reported in the previous sitting
  (stripes → raccoon → drumbeat → creek-still), with vote lists growing
  as more villagers weigh in. Not a mismatch — a village catching up.
- Template note (not a defect): the hands beat shares a skeleton
  across NPCs ("Clipboards, mostly. Now they hold wire and wood"),
  differing only in trade (Radio DJ vs Appliance repair tech). One
  line-joining quirk (826: "Cheerful thought, right? I'm listening.")
  reads like the NPC echoing the player's continuer — mild, not a
  sense failure.
- Thin record, by construction: pilot sittings stop after day 13
  (player away / no fresh conversational villager on later days), and
  main-panel day-1 sittings are short engaged opens, not deep dives.
  Depth lives in the longer sittings (818 day 13 gossip to depth 7,
  817 day 11 Nathan to depth 2 with wind-down more carried).

## Reachable / fun / winnable (leg 0)

- Reachable: yes for contact (d8–9 every seed), food, talk, favors,
  and outings — one kept outing plus two late deliveries on this panel,
  against four seeds where the probe never reached a waiting partner
  (hall-door stall, probe-side). The doorstep rescue fired twice and
  worked twice; the last-tile walk still awaits a natural case.
- Fun: the fortnight reads like people surviving together — asks with
  reasons, refusals with reasons, naming debates, grief that registers.
  The unfun residue is instrumental, not social: the fizzle flag
  crying wolf on contentful beats, and armor craft counts that disagree
  between telemetry and narration (below).
- Winnable: leg 0 unchanged in difficulty; no gate or balance change.
  Every village hands establishment a living, fed, System-contacted
  village with kills banked.

## Instrument watches (documented, not defects)

- **R69 armor tele/line disagree, 8/9 panel seeds (+ pilot).**
  Telemetry craft fails 0–2 per seed vs narration fail lines 3–14
  (e.g. 825: 0 tele fails vs 14 line fails; ok counts agree at 0).
  Narration speaks of failed craft attempts far more often than
  telemetry records them — likely different counting units (attempts /
  presses vs distinct craft events), but neither series should be
  cited for armor craft counts until the units are reconciled. Armor
  itself is fine (wearers 1–3 per seed, bark up to 13, hide up to 4).
- **Horizon pantry thin on 4/9 panel seeds** (819: 1281, 821: 956,
  822: 425, 825: 493 kcal/person at d28; pilot 817 also hungry at
  976). Revised R66 gate: NOT-HUNGRY (0 slides, 0 starvation deaths).
  The analyzer flags it PATTERN ("collapse recurs — lever work
  candidate"). Carried as a watch for a future lever run, not a gate
  miss — M9's binding metric is self-sufficiency, which passes.

## Metric review

- The fizzle-flag criterion question above is the only metric revision
  proposed, for the NEXT run: require thread exhaustion before flagging
  a depth fizzle. No thresholds changed this run (gating freeze stands).
- r94's M6/M10 definitions applied unchanged; r94's pooled-M10 counting
  stays superseded by the live/ledger split (pooled 277 still printed
  for comparability).
- If a future panel produces a non-null lastTileWalk, Q1 closes; until
  then the walk is reported as repro-proven-only, never panel-proven.

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/landing-split.json --current
'<r95-census-glob>' --metrics systemDay,monsterKills`. First attempt
failed on a quoted `~` (shell did not expand it; checker error verbatim
in the run's working notes, not a corpus refusal — retried with the
absolute path). Second run: 2 LOUD lines, BOTH EXPLAINED as aggregation
artifacts (same class as r94), baseline NOT rolled: (1) systemDay
33→73 is a 9-file sum (per-seed 8–9, matching r94's per-seed 8); (2)
monsterKills 24→208 is the baseline's pooled MEAN (its own note says
so) vs a 9-file sum (per-seed mean 23.1 ≈ 24). No behavior change is
indicated.

## Closeout note

- Commit: prereg + this note + r95 driver + r96 driver (tooling only,
  zero src/js). No [needs-eyes] — no player-facing change.
- Quick suite: `node scripts/check.js --quick` — 284 passed, 6 failed
  in 914s (landing-r95-checkquick.log), EXACTLY r94's standing set:
  measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes. None
  references this run's files (zero src/js changed, zero existing tests
  changed); reported here, not fixed — other lanes' proof-freshness
  maintenance, not this leg's findings.
- Merged locally, pending ship (no version tag; ship job owns it).
- Heartbeat: standing loop (600s) held the registry beat through the
  run; beats occasionally queued behind sibling registry-lock holders
  (same class as r94), never lost. The run's own lock held throughout.
