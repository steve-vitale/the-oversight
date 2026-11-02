# journey-landing r72 — PRE-REGISTER (lane A, leg 0 LANDING, days 1–14 + tail)

**Run id:** laneA-landing-2026-11-02T07:45CST (scheduled 07:45 CST 2026-11-02).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@6674df432 at branch creation (local master ahead of origin
push state; pending ship — normal).
**Driver:** scripts/journey-landing-r72-20261102.js — clone of the r71 driver
(labels/seeds/OUTDIR only) + OUTING_PROBE + outing72 census field.
Diff verified by inspection: no src/js, no src/data, no other driver logic.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** instruments read-only; the probe only
presses offered favor actions (forageFavorAction/performForageFavor) and
walks honest travel hops — never engine state, never teleports.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if the fix
gate below is met; otherwise document and move on.

## Standing context (read before scoring)
- Last landing run: r71 (2026-11-02, seeds 601–604). Stay-green GO on all
  gates; people check GO with 0 fizzles / 0 fabrication; loot tiers did not
  reach the fortnight (8 monster kills, 0 loot-tier pack items — no
  opportunity claim, not a defect).
- r71 observation 1 (THIS RUN'S BLANK): every joint-foraging promise broke
  (3/3: Thabo 601, Aroha 603, Onni 604; −15 trust each) while every
  sickness-help promise kept (2/2). r71 did NOT claim a game defect: the
  driver may simply never take the next-day outing action.
- Mechanism read before this probe (favor-forage.js, convo-wants.js,
  game.js checkPromises, policies/competent.js): the competent policy's
  keepPromiseFood gives food via giveFood, but checkPromises keeps a
  forage_help promise ONLY on the outing's deliver step (matching
  forageFavorId + forageRun.returned + deliveredKcal>0 + bearer match).
  giveFood can NEVER keep a forage promise. So r71's breaks are a POLICY
  blank until a player walks the outing — that walk is this run's probe.
- r71 metric-review proposal, ADOPTED here: retire the depth-share gate
  (wants resolve in 1–2 turns by design) and gate instead on "0 sittings
  where a pursued continuer yields an empty beat" (the actual senseless
  shape), which r71 passes.

## Leg questions (binding)
1. **OUTING (the blank):** does the joint-foraging path fire end-to-end
   when a competent player actually goes out the next morning?
   - Probe: at each dawn, for each forageFavorWaiting partner, walk home
     (honest hops), start, forage together, return, deliver — all through
     the public favor actions. Every block reason is logged verbatim.
   - Gates: (a) ≥1 forage promise arises across the quad (else the
     question is unasked, not failed — expand seeds only if the pilot
     yields zero promises AND zero outings); (b) every probe-attempted
     outing ends in exactly one of: KEPT (kept=true, favor fulfilled,
     deliveredKcal>0), or a BLOCK with a quoted engine reason.
   - GO = ≥1 outing KEPT end-to-end, OR every block explained as a fair
     rule (deadline passed, partner gone, no forageable patch) — not a
     defect. A block from a senseless defect (contradictory gate,
     adjacency unreachable with no legal move) meets the fix gate below.
   - Control: promises the probe never touches (none expected — the probe
     acts on every waiting partner each dawn) are reported from favorsEnd;
     any KEPT without a probe walk is itself a finding (another keep path).
2. **STAY-GREEN (carry, report + gates):** fresh quad 701–704, policy
   competent PINNED, FAVOR_ACCEPT default ON, horizon 14d, death-aware
   stop (+10d tail). Gates per seed:
   - System contact day ≤ 10.
   - Death liturgy exact: grief beats == villager deaths, 0 headcount codas.
   - Theft rate 0 (caughtRedHanded == 0).
   - Self-sufficiency: mean produced/expected across living villagers on
     the last series day ≥ 0.70, and 0 starvation deaths.
   - Plenty-voice present (plentyVoiceLines ≥ 1).
   PILOT GATE: seeds 701+702 run first; if either crashes or systemDay is
   null, STOP and report.
3. **PEOPLE CHECK (sense law — transcripts read in full):** all sittings
   from the pilot + main seeds judged on meaning, coherence, relevance,
   consequences — never just exchange counts. Gates: 0 depth fizzles
   (dry admission at depth ≤ 1 after a pursued continuer), 0 fabricated
   shared history, 0 sittings where a pursued continuer yields an empty
   beat (adopted r71 proposal). Dialogue/mechanic coherence note: the
   forage commit line names a meeting spot ("East treeline, first light")
   while the mechanic gathers at Haven at dawn then walks out — the probe
   records whether that reads as one plan or two.
4. **LOOT/ABILITIES REACH (report-only):** same as r71 — pack72 + grants +
   monsterKills + fleshArc. 0 gains with 0 kills = no opportunity, not a
   defect; 0 gains DESPITE kills/drops is named for the next run.

## Fix gate
Land a code change ONLY if ALL hold: (a) the finding is a senseless defect
(dead end, unfireable beat, contradictory numbers, fizzle) — not a tuned bar
or a fair loss; (b) a runnable before/after proof test exists in
scripts/test-*.js; (c) the relevant existing suite stays green. Otherwise
document and move on.

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)

## Infra notes (at prereg time)
- worktree-register.sh took ~5.5 min (evidence-tree checkout under heavy
  parallel load; sibling register/reap processes queued on the registry
  flock). Register exit 0.
- First heartbeat queued on the same flock, landed 2026-11-02T13:54:32Z
  (registry-confirmed). Standing loop (10-min, PID 53177, log at goal
  hidden_files/landing-r72-heartbeat.log) started; its first beat was
  still queued on the flock at loop start — verified by registry re-read
  before the pilot runs.
- Pre-flight reap: sibling reaps hold the registry flock (13:46/13:48Z
  processes); my own reap would queue behind them. Active trees under
  the 16 cap at register time, so the cap was not at risk; reap skipped
  safely per the r71 precedent (never kill a sibling's reap).
- Main tree was clean (0 lines) at pre-flight; git pull already up to date.
