# sim-tabledeed-voice — backlog #738: the audit voices wave-4/5 deeds (2026-10-21)

Arm: sim-tabledeed-voice (FIX, game-code narration). Worktree: sim-tabledeed-voice, base 6d93e78d4.

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14–15)

- PRIMARY: on a FIXED 16-run transcript corpus, ≥50% of table-audit beats
  that follow a village wave-4+ kill voice the deed BY NAME (monster name,
  killer, day), with 0 invented deeds (every voiced deed joined to a log
  record) and 0 fiction errors.
- Corpus choice (documented): re-ran the SEATDRIVE winning substrate
  (windowseat stack) on FIXED seeds 66001–66008 × {leadfeast, belongfeast}.
  The pre-reg named 65001–65008, but those seeds are taken by the sibling
  winsupport-decomp arm; 66001–66008 are the committed windowseat corpus
  seeds (evidence/2026-10-20), so the corpus stays comparable. Env:
  FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
  WINDEFER=1 NODEWITNESS=1 KILLDISC=1 WINDOWSEAT=1 (exact windowseat
  substrate; SEATDRIVE unset = default-on). Horizon: death-aware — stop
  at tableDone (table sitting fired) or run end (won/ended), 180d cap.
- GUARDRAIL: text-only provenance — the rest of the run is byte-identical
  with the layer on vs off except the audit beats (det-gate on 2 seeds,
  paired: ON vs ON2 control + ON vs OFF gate on leadfeast 66001/66002).
- Corpus: evidence/2026-10-21/tabledeed-corpus/ (16 ON + 2 ON2 + 2 OFF).

## The fix

`src/js/table.js` (audit-beat path only — 197 added lines, no other file
touched in src/):

- `tableDeedRecords()` — pure gather from the village's own logs:
  1. wave-4+ kills (monster, killer vid, day) from `state.waveKillLog`,
     joined to `data.monsters` by id — the def's wave is authoritative,
     unknown mids are never named and never counted;
  2. engagements (fought blow-by-blow via `recordDeedFight`, no recorded
     kill) from `deeds.wavesFaced` w4/w5, minus titan mids (named once);
  3. herald/titan encounters from `Game.state.titans` omens (stage 1 =
     named, 2 = located) + `slain` flags;
  4. the wave-4/5 readiness bars as they stand at audit time
     (`waveUnlockReady` → `_readinessBarLine`), voiced only when unready.
- `tableDeedLines()` — pure render: 4 variant framings in the System's
  register (big brother + chilling benefactor with disdain), kills named
  up to 2 most-recent + honest remainder ("and N more teeth after"),
  titan/engagement/bar aside. Silence ([]) when nothing war-shaped —
  never padding. Framing pick is a dedicated mulberry32 stream over a
  hash of stable inputs — never `Math.random`.
- Hook in `tableScene`, right after the audit `say`; every read in the
  block is state-write-free (pure reads replaced `deedState()`,
  `titanCast()`, `progState()` which all create-on-absent). Test-only
  `Game._tableDeedVoiceOff` skips the block.
- Killer resolution: 'p'/'player' → "you"; villager vid → `disp` (real
  name/descriptor); unknown/null → "Haven" (the log always attributes
  to the village; a person only when the log names one).
- Knowledge gating: `monsterNoun` (kills earn the codex 'slain' stage in
  `recordWaveKill`, so true names are earned); engagements use the
  village's earned name ("Big Loud", "The Ugly Bastard").

## Proof (scripts/test-tabledeed-20261021.js — ALL GATES GREEN)

- E0 shape: both methods exist, record shape {kills,engagements,titans,bars}.
- E1 RED→GREEN on fixtures — RED confirmed on base table.js (functions
  absent; test fails), GREEN on the fix:
  - F1 logged w4 deeds → voices monster name, killer ("you", "Ricardo"),
    day (140/152), herald encounter;
  - F2 no war content → [] (stays silent);
  - F3 unknown-mid claim → never voiced, never counted, stays silent;
  - F4 unready bars only → opens THE WAR PATH with the bar readout;
  - F5 herald in omens + engagements → named exactly once (dedupe).
- E2 det-gate: identical fixtures → identical lines; state JSON
  byte-identical before/after the call; framing pick stable across calls.
  Run-level (corpus, 2 seeds × leadfeast): dayHash streams identical
  ON-vs-ON2 (control) and ON-vs-OFF (gate) — trajectory byte-identical
  with the layer on vs off. (Full-state sha differs even ON-vs-ON2: the
  known Date.now villager-ID issue — see det-gate.js — so full-state
  hash is not a usable gate on this substrate; dayHash is the loop's
  canonical trajectory instrument.)
- E3 static audit: changed files = src/js/table.js + the proof test +
  evidence/2026-10-21 only; no combat/economy/AI functions touched.
- `node scripts/check.js --only table --quick`: 10 passed, 0 failed.

## Corpus results (16 runs, fixed seeds)

Wall numbers: wins 13/16, audits fired 13/16, national-or-global standing
11/16, wave-4+ kills in waveKillLog **0/16**, wave-4 engagements in 3/16,
herald omens in 3/16. Median win day ~90–100 (wins at 90–146).

- PRIMARY: **0/0 — vacuous.** Not a single run on this substrate logs a
  wave-4+ kill before the table sitting: villages win the lesser seat at
  ~day 90 (waves 1–3 ledger + contests + crises) without ever fighting
  wave-4. The metric's denominator does not exist on the winning
  substrate. Per §14 this is reported as vacuous, NOT re-scored — see
  Metric review. The deed-voicing behavior itself is proven by the
  deterministic E1 F1 fixture (RED→GREEN).
- Invented deeds: **0** across all 16 runs (every named monster joined
  to waveKillLog/wavesFaced/titan state; every titan word joined to an
  omen/slain record). Fiction errors found on read: **0**.
- The beat fired in all 13 audits: bar readouts in 13/13, herald
  encounters in 3/13, engagements in 3/13.
- Det-gate: ON-vs-OFF dayHash streams identical on both seeds.

## Sense-testing (read, not counted)

Pair 1 — leadfeast 66001 (before/after on the identical seed):
- BEFORE (layer off): `◈ THE AUDIT — ... A lesser seat — global standing,
  waves 1–3 faced (10/7/3), 10 contests survived, 4 crises weathered.
  The table does not rise. It prices.` — then nothing about the war.
- AFTER: `◈ THE WAR PATH — A moment of respect, from something that
  rarely respects. Even now the wave-4 bar reads: blood your fighters
  (0 of 1 veterans). Even now the wave-5 bar reads: armor the village
  (3 of 4 fighters armored); blood your fighters (0 of 2 veterans).`
  Judgment: the System sounds like itself (disdain + backhanded
  respect), the beat lands as appraisal, not a stat dump — it reads
  the village's own readiness terms back at it.

Pair 2 — leadfeast 66002:
- AFTER: `◈ THE WAR PATH — The body count, itemized. The System is not
  making this up — it was filming. THE HERALD came. Named, not yet
  located. They faced The Eulogy and lived to sit here. Even now the
  wave-4 bar reads: armor the village (2 of 3 fighters armored); blood
  your fighters (0 of 1 veterans). ...` Judgment: coherent, relevant —
  the herald's omen stage (named, not located) is voiced exactly as the
  log has it; the engagement ("The Eulogy") is a real fought deed.

Pair 3 — belongfeast 66006 (herald located + engagement):
- AFTER: `◈ THE WAR PATH — The body count, itemized. ... THE HERALD came.
  Named and located — the war council knew its face. They faced The
  Ugly Bastard and lived to sit here. Even now the wave-4 bar reads:
  blood your fighters (0 of 1 veterans). ...` Judgment: the dedupe
  works (herald named once despite being in both omens and wavesFaced);
  "The Ugly Bastard" is the village's earned name for the influencer —
  knowledge gating holds. No fabricated history, no stat dump.

## Village assessment

The corpus villages are the winning substrate's standard product:
competent, fast, and utterly unblooded at wave-4. Thirteen of sixteen
sat the table and won through it (mostly feared/light per the wintrack
audit) at a median ~day 90–100 with global/national standing — built on
waves 1–3 deeds (10–19 distinct w1, 6–7 w2, 3–4 w3), 7–10 contests, 2–4
crises. The three that reached wave-4 content did it as engagements
and herald omens, never kills. Two runs died before the table
(d36, d70); one survived 181 days without ever sitting (no seat earned).
Nobody in the corpus fought wave-5. The blank is filled: the audit now
says the war part aloud either way — teeth pulled, or the bars as they
stood when the village walked past the war to the table.

## Blanks filled / documented

- FILLED: the audit beat voices the village's real wave-4+ deeds from
  its own logs (kills by name/killer/day, herald/titan encounters,
  engagements, readiness bars at audit time), in the System's register,
  with a 4-variant framing pool instead of a stock template.
- DOCUMENTED (not papered over): no log records a titan retreat, so a
  "fled" encounter is never voiced — appended to sim-findings.md as an
  open item (titan engagement outcome logging).
- DOCUMENTED: the pre-registered PRIMARY denominator is empty on the
  winning substrate (see Metric review).

## Metric review (§14)

The PRIMARY as pre-registered ("≥50% of table-audit beats that follow a
village wave-4+ kill voice the deed by name") is VACUOUS on the
SEATDRIVE winning substrate: 0/16 runs log a wave-4+ kill before the
table sitting, because the lesser seat is earnable (and won) at ~day 90
on waves 1–3 deeds alone. This is not a miss to re-score — it is a
finding about the substrate: the war path is currently optional to the
win, and the audit beat's kill-naming branch has no natural corpus on
the winning policy. The behavior itself is proven by the deterministic
fixture gate (E1 F1, RED→GREEN). PROPOSED for the next run: keep the
fixture gate as the binding deed-voicing proof, and pre-register the
corpus metric on what the substrate actually produces — e.g. "≥90% of
table-audit beats voice the readiness bars as they stood (13/13 this
run)" and "0 invented deeds across the corpus (0 this run)". No metric
was changed mid-run; the corpus numbers above are reported, not judged.

## Throughput notes

- sims ~30–60s per 180d run; 20 runs total (16 corpus + 4 det-gate).
- Tooling: /tmp/tabledeed-corpus-20261021.js (runner, ephemeral),
  /tmp/tabledeed-analyze-20261021.js (analyzer, ephemeral). Corpus
  JSONs committed under evidence/2026-10-21/tabledeed-corpus/.
- One tooling wart, no game impact: the corpus runner stops at the
  first 'won'/'ended' but misses `tableDone` when the win lands the
  same day as the sitting (tableDay=null in all rows); audit capture
  is unaffected (say lines are captured at fire time).
