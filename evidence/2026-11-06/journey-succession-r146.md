# Journey succession r146 — Lane B, leg 7 (succession) — RUN NOTE

Run: oversight-playtest-loop-2, scheduled 10:00 CST 2026-11-06. Rotation-b
read 7 at run start; this run writes 4 (endgame next) at closeout. Base
master 304ced6cf (local master ahead of origin/master 30fe8dc00 by the
unshipped fight-interior-b + killersurvive-a merges; `git pull` fails on
an ORIG_HEAD.lock write refusal — EPERM flap class, retried 3x; fetch
succeeds and local HEAD contains origin/master, so there is nothing to
pull; infrastructure noise, not a blocker).

CLOSEOUT NOTE (main session): the coordinator timed out at 2h before
closeout. The work below was finished in the main session: this run note
written from the worktree evidence, commits made, rebase onto master
371486eae, proof re-run, merge, release. Nothing was re-run except the
proof test and the post-hoc gate; all sim numbers are the coordinator's.

## Carried question (r143, blank filed, not fixed)

r143 filed the ASK_FAVOR WANT-FIZZLE as its blank (second sighting):
when the bearer asks a villager "Is there something you need? Really."
(alive:want:ask_favor), the NPC answers "...Sorry, lost my train of
thought" and the want evaporates. Sightings: r142 (James, seed 33605,
d+14) and r143 (Tyler, seed 33702, d+14). Prereg:
evidence/2026-11-06/journey-succession-r146-prereg.md.

## The fix (src/js, 3 files, +80/−6)

Mechanism (confirmed by SAYTRACE on the before-leg): sayLine's
no-repeat key is the first chunk of the rendered line. Four favor kinds
carried ONE fixed whyLine each (heal_help, snare_mend, watch_shift,
stay_close), so the second time anyone said it — another villager, or
the same villager in an earlier sitting — the run ledger dried the beat.

- convo-wants.js: three hash-keyed whyLine variants per kind (same
  stakes), so each instance speaks its own why — like food_share /
  water_haul / forage_help already do. The sickness kind, which already
  carried a whyLines array, now picks a hash-keyed variant instead of
  always [0].
- convo-dialogue.js (dlg:details, stage ≥ 2): if the kind's whyLine is
  ledger-blocked, name the need fresh via convoFavorNeedLine instead
  of drying; only when that too is blocked does the dry pool answer.
- conversation.js (stage-0 re-ask ladder): if opener, followup, and why
  are all ledger-blocked, name the live need fresh instead of losing
  the ask.
- New helper convoFavorNeedLine(vid, favor, still): PURE, built from
  the favor's own short, so it can never promise a need that isn't
  there. `still` fits the moment (ask new vs already stated).

Ledgers untouched; no trust/consequence flow changes; no new favor
state transitions. Proof: scripts/test-journey-succession-r146-askfavor.js
(unit-level, shared harness) — ALL GREEN on fixed code; the ledger
control still dry-replaces a true verbatim repeat in one sitting, so
the no-repeat law itself is intact.

## FIZZLE-FIX verdict: PASS on the binding bar (1/1 reproducing seeds) — with the class NOT eliminated (see qualifier)

Binding bar (prereg §14): on fixed code, each reproducing repro seed's
d+14 transcript shows a real ask/why at the ask_favor turn; 2/2
reproducing seeds must pass; a seed whose fizzle does not reproduce
drops out of the denominator, recorded, NOT re-scored.

- Seed 33702 (Tyler d+14): PASS. Ask: "This wound — I can't clean it
  properly one-handed. Could you clean it out for me? Please." Details:
  "It keeps getting worse. I can't haul or hunt with it like this — and
  if it festers, I'm done for. Please, clean it out and bind it tight."
  Third sighting in the same run, Linh d+30 (dlg:details): before-leg
  fizzle reproduced on unfixed code (SAYTRACE: RUN-BLOCKED, key =
  heal_help whyLine, preRun=true; BEFORE transcript preserved as
  *-Linh-BEFORE.txt, before/after stdout.json at
  /tmp/r146-33702-BEFORE.json and /tmp/r146-33702-AFTER.json); after-leg
  the same turn answers "Every day it's angrier. I need it cleaned
  before it turns — I can't work a wound like this. Wrap it tight when
  you're done." Trajectory otherwise identical.
- Seed 33605 (James d+14): DROPS OUT. No ask_favor turn fires on the
  d+14 transcripts under the r146 driver (James's d+14 is a bond-partner
  conversation: react/recap/teach/ask:lately/party_role — no ask turn),
  so the fizzle does not reproduce and the seed is out of the
  denominator per the prereg. The preregged fallback (verbatim
  r142-driver copy) was NOT run; recorded here so the next run can
  pick it up if it wants the James sighting judged.

QUALIFIER — the fix does not eliminate the class. Three panel-seed
dry lines at ask/details turns on FIXED code, all SAYTRACE-attributed
(preRun=true, RUN-BLOCKED), all through engageBeat, not through the
fixed branch:

- 33803 d+14 Omar (dlg:details): key = heal_help whyLine variant 0;
  sites convo-dialogue.js:724 → 866 → 911. The fixed dlg:details
  branch covers only wants with id 'ask_favor' at stage ≥ 2; this one
  reached dlg:details through engageBeat (line 724), which returns the
  kind's whyLine unguarded. The need-line was never spoken anywhere in
  the run (no "still need help" in 33803 convoLines), so the fallback
  ladder never ran — the branch condition failed, not the fallback.
- 33806 d+7 Ivy (dlg:details): key = heal_help whyLine variant 1;
  same sites (724). Same shape as Omar.
- 33806 d+45 David (dlg:details): key = the water_haul whyLine ("I
  checked the cistern three times... 7 liters..."); same sites (724).
  Water_haul carries NO why variants (the fix did not touch it), so its
  one fixed whyLine dries the same way.

Plus one adjacent case outside the fixed handlers: 33806 d+53 David
(dlg:help): same water_haul whyLine; sites convo-dialogue.js:481 → 866
→ 911. The dlg:help handler has no fallback at all.

Two other dry lines on the panel are out of scope and honest: 33805
d+45 Brian ("Here — let me show you" — a showing verb, not an ask)
and 33899 d+14 Oscar ("Teach me something from the wild" — teaching
path). The 33806 d+40/41 Ivy dries are the knowledge-trade line, not
an ask.

CORRECTION to the coordinator's handoff summary: "0 dry lines" is
WRONG. Six after-leg transcripts carry the dry line; three are
ask/details turns on the fixed code (above). The binding bar still
passes on the reproducing seeds, but the class is not eliminated.
Next for the class: extend the guard to the engageBeat path (the
whyLine should be selected ledger-aware at the source, not per
handler), add why variants to water_haul, and give dlg:help a
fallback. Filed as finding line 1827 in sim-findings.md.

## CAP-NC regression panel: INSUFFICIENT-DATA (not a regression)

Fresh band 33801–33808 + smoke 33899, fixed code, r143 stop rule.
Eligible 2/8 (33803, 33806), both bonded-by-deadline (2/2). Skipped:
33804, 33807 (village over at d33 before any kill — death-aware stop).
Non-denominator: 33801, 33805, 33808 (second-handoff-before-deadline),
33802 (village-ended-before-deadline). Smoke 33899: no-newcomer-arrival.
Per the preregged bar (≥3 eligible AND ≥3 bonded AND bonded/eligible
≥ 2/3): INSUFFICIENT-DATA — the panel is bound by seed variance, not
by the fix. Nothing in the panel points at the fix: selfReqDayEntries
0 on every seed (r133 purge holds), pick-time rank 1 on every first
handoff with npcCalls, funeral INCALL beat present on every leg death.

Repro seeds (descriptive): 33702 bonded-by-deadline (Owen, d+19,
trust 22); 33605 bonded-by-deadline (Ana, d+27, trust 32).

## Village assessment (succession leg, plain words)

The mantle passes and the village keeps going — both repro villages
bond their newcomers by the deadline, and the panel's two eligible
seeds do the same. What still breaks is the asking itself: a villager
with a real, stated need can still be met with silence when the words
have been used recently. The fix makes the two sighted cases speak;
the panel shows the silence still finds other doors (engageBeat,
dlg:help, water_haul). Reachable: yes — the succession content fires
on every seed that lives long enough. Fun: the conversations read as
real people when the ask lands (Tyler's and Linh's after-leg turns are
specific, urgent, in-character). Winnable: unchanged by this run —
the leg is about the mantle passing, and it passes.

## People check (sense, not a count)

Read the fixed d+14 transcripts (Tyler 33702, Linh 33702 d+30) in
full: the ask and the why are concrete, tied to the wound in front of
the player, and the want stays live after the answer. The need-line
fallback ("I still need help with this wound") names only the favor's
own short — it cannot promise a need that isn't there. No new filler
introduced on the repro seeds. The dry-pool lines ("It's...
complicated") were not hit on the repro seeds.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/succession.json --current
'evidence/2026-11-06/journey-succession-r146-tele-*.json' --metrics
deaths.bearer,census.alive,census.fallen,census.integrationStage,
week2.deadBearerMentions` → 3 LOUD lines, all INVESTIGATED, none a
real bug:

- deaths.bearer 740%: baseline 5 → current 42 (n=9 files).
- census.fallen 990%: baseline 10 → current 109 (n=9 files).
- census.integrationStage 80%: baseline 15 → current 27 (n=9 files).

The checker SUMS across the 9 per-seed files and compares against a
single-run baseline — the LOUD lines are the summation artifact, not
a deviation. Per-seed means: deaths.bearer 4.67 (baseline 5),
census.alive 5.11 (baseline 49), census.fallen 12.11 (baseline 10),
census.integrationStage 3.0 (baseline 15 — definitionally impossible;
Game.integrationStage() returns 0–3; r143's standing note),
week2.deadBearerMentions 3.89 (baseline 3). The alive-49 vs ~5 gap
says the baseline was seeded from a different panel shape than this
succession leg. The baseline was NOT rolled forward: --update-baseline
writes the current SUMS (42/109/27), which would bake the artifact
in. Recommendation for the next succession run: re-seed the baseline
from per-seed means (deaths.bearer 4.67, census.alive 5.11,
census.fallen 12.11, integrationStage 3.0, week2.deadBearerMentions
3.89), or fix the checker to compare means. The fix touches dialogue
only; nothing in it moves deaths, census, or integration stage.

## Gate

Coordinator ran check.js --quick in the worktree: 283/7 (the standing
profile). Main-session post-hoc gate on the rebased tip (03a05818d on
c9df669e0): 283/7 in 749s — the standing profile (goal hidden_files
check-journey2-succession-r146-20261106.log). Post-gate, master moved
to the ship bump b62ac120c (c9df669e0-20261106-172442); the branch was
re-based onto it (tip e1f2712e6) and the proof test re-ran ALL GREEN
on the new tip — no src change in the bump, gate result stands.

## Metric review

- The FIZZLE-FIX bar was judged exactly as preregged (reproducing
  seeds only; James drops out, recorded). It passes — but the panel
  dries show the bar's scope was too narrow: it covers the ask_favor
  want at stage ≥ 2, while the same question reaches the same dry
  line through engageBeat and dlg:help. Next run that touches
  dialogue: judge the fix on ALL ask/details turns across the panel,
  not only the preregged repro seeds.
- CAP-NC kept verbatim from r143 (eligible-subset design); the
  INSUFFICIENT-DATA verdict is the instrument working as designed —
  the panel is bound by how few seeds are eligible, and the fix
  cannot be blamed or credited on 2 seeds.
- Canon note: no canon doc covers mantle/bond formation specifically
  (r127's standing note, unchanged). Governing rules used: ledger.js
  "successor: the village chooses. Trust decides"; party-bond.js
  "v.bonds built by meals/visits/feasts, +6/pair/day cap, no bonds
  with the dead or gone"; CONVERSATIONS.md structural contract ("The
  repeat ledger must not replace a successful promise with 'lost my
  train of thought.'"); CANON.md "No silent actions". Nothing
  invented, nothing changed.
- The before-leg stdout.json for 33702 is at /tmp/r146-33702-BEFORE.json
  and the after-leg at /tmp/r146-33702-AFTER.json (coordinator's
  preservation note); the worktree evidence dir carries the after-leg
  files. The /tmp copies are not committed.

## Files

- Prereg: evidence/2026-11-06/journey-succession-r146-prereg.md
- Driver: scripts/journey-succession-r146-20261106.js (r143 driver
  verbatim except filenames)
- Analyzer: scripts/analyze-journey-succession-r146-20261106.js
  (r143 analyzer verbatim except filenames)
- Proof: scripts/test-journey-succession-r146-askfavor.js (ALL GREEN)
- Diagnosis scratch: scripts/diag-r146-ask.js (kept; the SAYTRACE
  walk that confirmed the mechanism)
- Evidence: evidence/2026-11-06/journey-succession-r146-*.json/.txt
  (per-seed stdout/saydump, tele jsons, analysis.txt, transcripts;
  BEFORE Linh transcript preserved as *-Linh-BEFORE.txt)
