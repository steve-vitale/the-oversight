# sim-wintrack-audit — diagnostic audit of win-track variety on SEATDRIVE=1 (flesh-out loop, 2026-10-20, arm sim-wintrack-audit)

Run: fleshout-20261020T1915Z, arm sim-wintrack-audit. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY — zero src/js changes, zero game eval, zero RNG, zero new sims.
File scope: scripts/wintrack-audit-20261020.js (new, offline read-only analyzer),
scripts/test-wintrack-audit-20261020.js (new, proof 17/17 GREEN),
evidence/2026-10-20/wintrack-audit-report.json (new, the auditor's report),
evidence/2026-10-20/sim-wintrack-audit.md (this file).

Canon: docs/CANON.md + docs/TABLE.md (the table prices the run, never gates on
godhood; seven paths, each its own played challenge; failure resolves, never
wipes; light/dark branches earned through play, never a menu choice; the
relay's GRADIENT law; trial-by-combat the single opt-in existential risk) +
docs/ENDGAME-BUILDS.md (Steve 2026-10-07: "Most game wins look like that, but
not all" — the variety law this audit tests).

Named next this audit answers (alignment review 2026-10-20): the SEATDRIVE=1
substrate is the only one where wins happen (10/16 wins, zero seated deaths),
but "all one identical track — path variety is the named next." The sibling
arm sim-tablepathdriver (2026-10-20, landed 83a6ac023 + fd896c2ea) built the
7-door driver + dark-relay road and ran 16 steered runs. This audit
independently re-attributes every win and every stall in that committed corpus
(without re-running a single seed — the layers are deterministic per the
sibling's DET gate, and the corpus is committed on this base, verified:
fd896c2ea + 83a6ac023 are ancestors of this tree).

Corpora (both committed on this base — verified before use, no runs spent):
- armed: evidence/2026-10-20/perseed-tablepathdriver/ (16 runs: seeds
  64201–64208 × {leadfeast, belongfeast}, SEATDRIVE=1 + TABLEPATHDRIVER=1 +
  RELAYDARK=1, 180d death-aware)
- control: evidence/2026-10-20/perseed-tablepathdriver-control/ (16 runs,
  same seeds/policies, SEATDRIVE=1, driver OFF — the natural track)

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE analysis)

**PRIMARY (DIAG-GO):** attribution completeness — every WIN attributed to a
door/leg path (door + branch + the mechanism record), every NON-win attributed
to a stall mechanism (which leg/door blocked or never engaged — the mechanism,
not just the label). GO threshold: **100% attributed, 0 unexplained.** A miss
is NO-GO, never re-scored (§14).

**Secondary (the variety question, judged by the numbers, not by the GO):**
which of the 7 doors engage on this substrate, in what order, and which door
each win goes through; per-door reachability; whether the fiction reads as 7
distinct doors or one track with 7 labels (sense-read of 2–3 winning runs).

**Instrument:** scripts/wintrack-audit-20261020.js — offline read-only
analyzer. Win rule: canonical door = endRec.tb.path/branch (the engine's own
win record), cross-checked against the last finalsEvent; mismatch or missing
= UNEXPLAINED, never guessed. Stall classes: pre-table-collapse (village died
before any table announcement), invitation-window-collapse (announced but died
before sitting), no-invitation-stall (survived to horizon, table never came).

**Horizon:** 180d death-aware (the corpus's own horizon). **Seeds:** 64201–
64208 × {leadfeast, belongfeast} = 16 per corpus. **Policies:** the
tablepathdriver rotation (indispensable/witness probes + relay/defiant
concentration) vs the un-driven seatdrive stack.

## Results — armed (driver-steered), 16 runs

PRIMARY: **16/16 attributed, 0 unexplained — DIAG-GO.**

Wins 12/16, each attributed via endRec.tb + finalsEvents (all 12 agree):

| run | assigned | door walked | branch | final day | via |
|---|---|---|---|---|---|
| belongfeast-s64201 | witness | witness (as) | light | d100 | endRec.tb + finals |
| belongfeast-s64202 | indispensable | witness (fb) | light | d90 | fallback, engine why recorded |
| belongfeast-s64203 | relay | relay (as) | dark | d115 | endRec.tb + finals |
| belongfeast-s64206 | defiant | defiant (as) | light | d90 | endRec.tb + finals |
| belongfeast-s64208 | defiant | defiant (as) | light | d90 | endRec.tb + finals |
| leadfeast-s64202 | witness | witness (as) | light | d90 | endRec.tb + finals |
| leadfeast-s64203 | relay | relay (as) | dark | d95 | endRec.tb + finals |
| leadfeast-s64204 | relay | relay (as) | dark | d155 | endRec.tb + finals |
| leadfeast-s64205 | defiant | defiant (as) | light | d90 | endRec.tb + finals |
| leadfeast-s64206 | relay | relay (as) | dark | d91 | endRec.tb + finals |
| leadfeast-s64207 | defiant | defiant (as) | light | d90 | endRec.tb + finals |
| leadfeast-s64208 | relay | relay (as) | dark | d91 | endRec.tb + finals |

Every run walked exactly one door; no downgrades fired; all seats lesser.

Non-wins 4/16, each mechanism-attributed:
- belongfeast-s64204 (assigned defiant) — **pre-table-collapse**: village
  collapsed d38 before the table was ever announced; assigned door never
  engaged (answers=0). Death channels: monster 2, unclosed wounds 2, raid 1,
  sickness 1, starvation 1 — a genuine multi-cause early collapse. Same
  outcome in control.
- belongfeast-s64205 (assigned relay) — **invitation-window-collapse**: table
  announced d45, village collapsed d69 before sitting; relay door never
  engaged. Deaths: 5 raid (d18–d63), 1 starvation (d11), 1 expedition (d62).
  The relaydark road was active (claimed, lean −68, darkUses 9). Control
  (same seed) won feared/light — the road's pre-table perturbation is
  associated, not proven causal (n=1 pair).
- belongfeast-s64207 (assigned relay) — **no-invitation-stall**: survived to
  the d182 horizon, national d78, stage 3, relaydark road completed d60
  (lean −48 dark), but the table never announced (tableActiveDays=0,
  maxWave=3 — wave-4 never unlocked). Control sat d154 and won. Mechanism:
  road-active pre-table stall; the exact unmet lesser-seat prereq is not in
  the corpus fields (no deed/crisis/counter counters) — stated as an open
  sub-question, not an unexplained gap.
- leadfeast-s64201 (assigned indispensable) — **invitation-window-collapse**:
  table announced d48, village collapsed d83 before sitting; the
  indispensable question is unanswerable on this run (door never engaged).
  Same outcome in control.

Leg engagement (the 5 pre-registered tablepathdriver legs):
1. relay walks: 5/5 terminal (all relay/dark wins; dark band at end on all:
   lean −48/−96/−48/−52/−52, darkUses 8–9, grounding 44–55).
2. defiant walks: 4/4 terminal (all defiant/light wins).
3. indispensable + witness: witness walked 3/3 (2 assigned + 1 fallback),
   all terminal. Indispensable: 2 assignments — one fell back (engine:
   "The Indispensable needs a full seat — the galaxy must actually need you,
   not just notice you."), one died pre-table. Never earned on this
   substrate.
4. ledger-dark margins: recorded on 7/12 wins (all non-relay). The 5 relay
   wins lack margins — the TPD layer's `walked` recorder never fires for the
   relay door (its phase transition is not paths→challenge), so the margin
   instrument never captured them. Instrument gap, recorded as named next.
5. relay/dark band: 5/5 relay-assigned walking runs dark at end.

## Results — control (natural track), 16 runs

**12/12 wins through feared/light. 0/12 through any other door.** The 4
non-wins: all village-lost, never sat (belong-64204, lead-64201,
lead-64203, lead-64206 — tb.path=None on all). 16/16 attributed,
0 unexplained. The sibling gap report (10/10 identical) is confirmed on a
fresh 16: the natural seatdrive track is ONE track — lesser seat → feared →
light → win.

## Per-door reachability on this substrate

- feared: reachable — the natural track (control 12/12). Not assigned in
  the driver rotation (fallback-last; never needed).
- defiant: reachable — 4/5 walked → all terminal (the 5th died pre-table).
- witness: reachable — 3/3 walked → all terminal. CORRECTION to the
  sibling's leg-3 premise: witness WAS earned on the feast road (the
  'assigned+witness' picks came from the engine's earned set); it is
  indispensable — not witness — that never earned.
- relay: reachable — 5/7 walked → all terminal, dark branch, ledger-honest
  (lean ≤ −44 via real verb uses, darkUses ≥ 6, no engine errors).
- assimilated: earned (appeared in the 6-door offer on belong-64202) but
  never walked in this corpus — the driver's fallback order never reaches
  it. The sibling arm sim-tablepaths (2026-10-19) walked it on this
  substrate.
- beloved: earned (same 6-door offer), never walked here; sibling walked it.
- indispensable: NEVER earned — 0/16. Engine's own why-string: "The
  Indispensable needs a full seat." The full seat needs national + wave
  4–5 deed bars; waves 4–5 are unreachable on this substrate (the scale
  wall). This door is decoration until the wave-5 door opens.

## Variety verdict — one track or many?

**The engine has seven doors; the sims walk one.** The fiction is
genuinely 7-shaped (see sense), but win-track variety in sims is a
composition lock, not a content gap:
1. The natural policy stack always lands feared/light because the engine
   offers feared first and the inner drain takes the first offered door —
   while the feast-road ledger always reads light (protected > killed,
   food shared, promises kept).
2. When a driver forces other doors, the engine walks them to terminal
   honestly (12 steered wins across witness/defiant/relay-dark, zero
   engine errors, branches ledger-earned — the driver never overrode
   tableBranch).
3. The dark side is reachable through real play, not just the driver:
   5 relay/dark wins via the relaydark road's actual verb surface
   (claim → deepen → reroute-efficient → rewrite/skim to lean ≤ −44).
4. Indispensable is the one genuinely unreachable door on this substrate —
   it is gated on the scale wall (full seat needs wave 4–5 deed bars).

## Sense — do the finales read as 7 doors or 7 labels?

Read the win-path beats of 3 winning runs (witness belong-64201,
defiant lead-64205, relay/dark lead-64203). Verdict: **distinct doors,
shared epilogue.**
- Witness: the trial of the judges — "You didn't come to negotiate. You
  came with a list." Reading the charges, beings of light flinching, your
  own ledger in evidence beside theirs. Reads as justice, not combat.
- Defiant: the price list made flesh — you name Pasquale and the relay
  takes them ("Some prices you pay forever, in installments of grief"),
  de-integration kills the HUD, "Walk away." The long shot of small
  figures leaving the light. Reads as priced freedom, and the price is
  someone you know.
- Relay/dark: the merge — "Become its voice." "Human things seem small
  from in here. The village grieves you while you're alive." The System
  finally says your name right. Reads as self-erasure with power, the
  thematic inverse of the others.

Shared tissue: all three end with the identical "◈ THE OVERSIGHT — You
won. Say it plainly: you won..." epilogue + pod-kids beat + keepsake
beat — EXCEPT relay/dark, which skips the shared epilogue and ends on the
merge. The dark skip reads as intentional (the village grieving the
living Bearer can't share the galaxy-applauds beat) — legible, not
broken. The finale's distinctness lives in the door's own beats; the
shared epilogue is door-agnostic by design.

## Named nexts

1. **[instrument]** TPD `walked` recorder misses the relay door (walked=[]
   on 5/5 relay/dark wins; branchMargins absent there too). The relay
   door's phase transition is not paths→challenge — the recorder's
   condition never fires. Fix the recorder (policy-side) so the margin
   instrument covers relay; until then, relay attribution leans on
   doorEvents + finalsEvents + endRec.tb (which agreed 12/12 here).
2. **[correction]** sim-tablepathdriver leg-3 premise: witness IS earned
   on the feast road (3/3 walks). Only indispensable is unearned. The
   leg's verdict stands; its premise needs the one-word fix.
3. **[steve-call]** WIN-PATH CONCENTRATION (existing backlog item, now
   with teeth): 12/12 natural wins feared/light here, 10/10 in the gap
   report, 30/30 in the backlog. The lever is the door OFFER order (feared
   first) + first-option drain, not more doors. Is the first-offered door
   the right default, or should the natural track vary?
4. **[axis]** Indispensable is unreachable until the wave-5 door opens
   (full seat needs wave 4–5 deed bars). Owned by the scale-onramp axis —
   not chased here.
5. **[observation]** The relaydark road's pre-table perturbation is real:
   belong-64205 died in the invitation window (control won), belong-64207
   stalled to d182 without invitation (control sat d154). ~2/7
   relay-assigned runs. Association from n=1 pairs — needs a judged
   comparison before any verdict on the road's cost.

## Metric review

The pre-registered metric (attribution completeness, GO = 100%) is a
diagnostic gate, not a lever judgment — it held (16/16 armed, 16/16
control, 0 unexplained). No re-scoring was needed or done. Instrument
limitations recorded honestly: (a) relay `walked` gap (named next 1);
(b) the exact unmet lesser-seat prereq on belong-64207 is not in the
corpus fields (no deed/crisis counters) — the stall is mechanism-labeled
(road-active, wave-4 never unlocked, control contrast), not unexplained;
(c) this audit reuses the sibling's corpus by design — no independent
re-run, per the deterministic DET gate and the no-wasted-runs instruction.

## Convergence note

scale-onramp stays converging. This run is diagnostic: no lever changed,
no wall movement claimed. Findings for the axis: (1) the win-side
substrate's variety is engine-real but composition-locked to feared/light
— players who choose doors get 7 games; the sim's "one track" is the
first-offered-door + light-ledger composition; (2) the dark side is
reachable through honest play (relay/dark × 5); (3) indispensable is
gated on the wave-5 door — the scale wall owns it. Directive lift remains
a Steve call.
