# sim-freeface-a — verdict: DIAG-GO-SINGLE-CLUSTER

Arm: sim-freeface-a, Loop A run fleshout-loop-a-20261101T1935Z, axis
scale-onramp. DIAG ONLY — zero src/js, zero policy-default flips,
zero edits to existing policy files, no routing/call design, no gate
threshold moved. Backlog #1538 (steve-call: route on refused face?
re-sound after a lost muster-fight?) still pending a ruling; this
arm sizes the binding constraint behind the muster ceiling.

Prereg: evidence/2026-11-01/sim-freeface-a-prereg.md (written BEFORE
any judged sims). Instrument: scripts/policies/freeface-diag.js.
Proof: scripts/test-freeface-20261101.js (synthetic rosters: dead /
underage / unhealthy / committed excluded exactly; slain-muster
commits do NOT exclude; speaker bucket tracked).

## Answer in one paragraph

On seed 90111, Stonebridge and Thornfield show zero free faces not
because their people are dead, young, hurt, or marched — but because
they have no people at all in the game's eyes: their village records
carry NO `roster` field whatsoever. A village only gets a roster when
it is catch-up-simmed on approach (game.js catchUpSim →
genVillageRoster), but a hierarchy link can be born without any
approach (_formLink never calls catchUpSim), so Haven can hold a
fully trusted link (trust 84/88, opinion 46/42, arrears 0, quota 6)
to a village that has never been lived-in by the sim — and
titanAlliedFaces then reads an absent roster as zero faces. The
committed map is empty (no muster ever existed), so no face is
excluded by any of the four buckets: the cause is roster absence, a
fifth cause the partition shows as all-zero counts. It is chronic,
not a window: flat across all 22 refusal snapshots and all 16 daily
records days 80–95, identical every time. Emberhold, the one ally
that WAS approached, has a real roster (12 people: 6 dead, 3
children, 3 free adults) and supplies all 3 blades of the call
yield. On other pilot seeds these same villages DO have rosters, so
this is seed-specific — whether this run's policy happened to walk
to those fires — not a property of Stonebridge or Thornfield.

## Pilot gate: GO

Pilot seeds (first 8 muster3-selected, 90111 first): 90111, 90113,
90114, 90121, 90124, 90132, 90139, 90101.

- Instrument fired on all 8; instrumentErrors 0, musterErrs 0,
  freefaceErrs 0 on every seed.
- Refused Herald state reproduced on current base: seed 90111 —
  22 scholar-channel attempts, all REFUSED, 22 muster snapshots, 22
  freeface refusal records, 0 muster verbs called.
- Same-base leg: freeface per-seed gameDays/won/national/table/
  maxWave match muster3's per-seed JSONs EXACTLY on all 8 pilot
  seeds, and muster snapshot lists are identical (22/22 on 90111).
  The new recorder does not move trajectories.
- Corpus determinism leg: seed 90111 re-run through the freeface
  stdout runner reproduces its pilot stdout line BYTE-IDENTICALLY.

## Confirm: ran (pilot GO), no second refused state in-band

Confirm seeds (all remaining muster3-selected): 90102, 90106, 90117,
90119, 90126, 90129, 90116, 90140, 90127, 90105, 90118, 90137.
All 12 ran clean (errs 0 everywhere); same-base agreement exact on
all 12; Herald refusals 0 on all 12. Hence SINGLE-CLUSTER, not
full DIAG-GO: the decomposition reconciles exactly and names the
cause for both villages, but no second refused state exists in-band
to contrast. (Short runs: 90140 died day 88 with 9 daily records,
90127 died day 87 with 7, 90105/90118/90137 died before day 80
with 0 — the daily window is death-aware by construction.)

## Reconciliation (the arithmetic the brief demanded)

- Per-record check, every village in every record on all 20 judged
  seeds: total == dead + underage + unhealthy + committed + free.
  Violations: 0.
- Refusal cross-check, 90111: each of the 22 refusal records' free
  counts vs the same-day muster-diag snapshot's facesFree for the
  same village, paired in order within the day: 66/66 match
  (22 records × 3 villages), 0 mismatches, 0 missing.
- Muster-diag's facesFree therefore IS the titanAlliedFaces count
  on this base (same four filters, same non-slain committed map,
  speaker ordering count-neutral) — the prereg's reconciliation
  statement holds, and no number below is a reused mismatched count.

## The 90111 decomposition (refusal window days 87–89, all 22 identical)

| Village | Trust / opinion / arrears / quota | Total | Dead | Underage | Unhealthy | Committed | Free | Would yield |
|---|---|---|---|---|---|---|---|---|
| Emberhold (village_0) | 91 / 42 / 0 / 6 | 12 | 6 | 3 | 0 | 0 | 3 | 3 |
| Stonebridge (village_1) | 84 / 46 / 0 / 6 | 0* | 0 | 0 | 0 | 0 | 0 | 0 |
| Thornfield (village_2) | 88 / 42 / 0 / 6 | 0* | 0 | 0 | 0 | 0 | 0 | 0 |

\* Total 0 means NO ROSTER FIELD, not an empty roster array — proven
by the direct probe below. Committed-map contents at every refusal:
{} — no muster of any titan exists, slain or otherwise, so the
committed bucket is empty by construction, not by filtering.

- Emberhold's 3 free adults: Kenji Ford (village_0_p6, the link's
  speaker — speaker IS among the free), Elena Kowalski
  (village_0_p10), Kenji Delgado (village_0_p11). Its 6 dead are
  retained roster entries (with deathDay/cause); its 3 underage are
  ages 1–14. No roster entry carries a health field, so the
  unhealthy bucket is structurally 0 for generated rosters (health
  undefined counts as healthy in titanAlliedFaces).
- Stonebridge/Thornfield speaker: null on all records (theirSpeaker
  never designated — _designateSpeaker picks the first alive roster
  member and silently leaves null when there is no roster).

## Daily trace days 80–95: chronic, flat, window-independent

All 16 daily records (days 80–95) are identical to the refusal
table: Emberhold 12/6/3/0/0/3 every day; Stonebridge and Thornfield
0 across every bucket every day. Zero-free is CHRONIC on 90111, not
a days-87–89 window effect, and not a refusal-day artifact — the
daily records (taken outside any refusal) show the same state.

## Probe: roster field absent, not empty (scripts/freeface-probe-90111.js)

A direct re-run of 90111 dumping raw state.otherVillages at days 80
and 87 (evidence/2026-11-01/perseed-freeface/probe-90111.json)
shows: Emberhold HAS roster (array, 12 entries) plus generated /
knowledgeProfile / codex keys; Stonebridge and Thornfield have NO
roster key at all, NO generated key, NO knowledgeProfile key —
while still carrying opinion, population, pantryKcal, trust, and
map coordinates. (Ashford and the three splinter villages on this
seed likewise lack rosters; roster presence is per-village, not
global.) This rules out the instrument-artifact reading: the
opinion values 46/42 in the decomposition prove _otherVillage
returned a real object, and the probe shows that object simply has
no roster.

## Mechanism (code, not guess)

1. genVillageRoster (game.js) is the ONLY roster creator for distant
   villages, and it runs ONLY inside catchUpSim ("when you approach
   a village") — guarded by `if (!village.roster)`.
2. _formLink (hierarchy.js) — "the single place links are born" —
   never calls catchUpSim. A link (and its trust growth, tribute,
   opinion) can therefore exist for a village the sim has never
   approached or lived.
3. _designateSpeaker picks the first alive roster member; with no
   roster it silently leaves theirSpeaker null — matching 90111.
4. titanAlliedFaces reads `(ov && ov.roster) || []` — an absent
   roster and an all-excluded roster both read as zero faces, with
   no distinction in the call yield or in any narration.
5. Consequence for the ceiling: quota is computed from trust/
   opinion (6/6/6 here) but the yield is capped by faces that do
   not exist. Sounding the call on 90111 brings 3 blades (muster3's
   post-block proved exactly 3), and even a full Haven commit tops
   out at 6/10. The gate is unreachable by pressing the buttons —
   not because the gate is high, but because two of three coalition
   fires are rosterless.

## Cross-seed check: seed-specific, not village-specific

Day-80 daily records on the other pilot seeds show these villages
WITH rosters and free faces: Stonebridge 12 total / 9 free (90113),
10/6 (90124), 11/8 (90132), 8/8 (90121); Thornfield 10/8 (90114),
8/8 (90121), 10/5 (90132), 12/8 (90139). The same village names are
fully populated when the policy walks to them. What differs on
90111 is the policy's path, not the villages.

## Contrast: 85106 (comparison only, never judged)

- Prior-base corpus (mustercall-b, evidence/2026-10-31/
  perseed-mustercall/leadfeast/s85106.json): 35 snapshots, one
  signature — Emberhold 3 free, Thornfield 9 free, The Red Table 3
  free. Thornfield HAD faces there, reinforcing seed-specificity.
- Contrast-only run of 85106 on the CURRENT freeface stack
  (evidence/2026-11-01/perseed-freeface/contrast-85106.stdout, NOT
  counted toward any bar): 17 refusals, different link set
  (Emberhold / Stonebridge / Ashford — links differ by base), same
  mechanism in miniature: Emberhold T0 and Ashford T0 yield 0
  (rosterless), while rostered Stonebridge (T6: 0 dead, 3 underage,
  0 unhealthy, 0 committed, 3 free) yields 3. Roster absence is
  again the zero-maker wherever it appears.

## Sense-testing: the refusal narration vs the cause

The refusal line, identical on all 22 snapshots (and the only
Herald-refusal narration the sim produces — no muster verb was
ever called, so soundTitanCall's "has no free fighters" line never
appears):

> "⛔ THE HERALD does not notice you the way prey notices a hunter.
> It notices you the way weather notices a field. You cannot face
> this alone — sound the call, muster 10 allied blades (you have
> 0). This is not courage. This is arithmetic."

Verdict: HONEST ABOUT THE COUNT, MISLEADING ABOUT THE REMEDY. The
0/10 count is true. But "sound the call" reads as the solution to
the 0, and on 90111 sounding the call cannot reach 10 (yield 3,
ceiling 6) — the player is told to press a button that cannot
succeed, with no hint that two trusted allies have no fighters to
send at all, let alone why (they were never visited, so they were
never given people). Against docs/ABILITY-REFUSALS.md's standard —
a refusal the game can see coming must refuse before payment, and
button text must read what the button does — the line fails the
spirit: it prescribes an action the game already knows will fall
short. This is a DIAG finding for a later arm (and for #1538's
ruling); no narration was changed here.

## Side observations (not judged, recorded for later arms)

- Speaker CAN be a child: on contrast seed 85106, Stonebridge's
  speaker Aisha Moreau sits in the underage bucket (first alive
  roster member, regardless of age). No count effect — children
  are filtered out of titanAlliedFaces anyway — but the "speaker
  first" ordering puts a child at the head of the face list.
- Generated rosters carry no health field, so the unhealthy bucket
  never fires for distant villages unless something later writes
  health onto a roster entry. The four-bucket partition is exact,
  but "unhealthy" is currently a dead bucket for allies.
- 90101 (pilot, won, table 1) shows all four of its links
  rosterless at day 80 — roster absence is common, not rare; it
  only bites when a muster is attempted.

## Metric review (for the NEXT run — not a mid-run rescore)

The prereg's partition is arithmetically exact, but it cannot by
itself distinguish "roster field absent" from "roster present but
everyone excluded" — both print as all-zero counts. The probe, not
the partition, supplied that distinction. Next run's instrument
should record roster-field presence (hasRoster true/false) as its
own column, so roster absence becomes a counted sixth cause in the
decomposition itself rather than a probe follow-up.

## Backlog note for the coordinator (not written to sim-findings.md
## from this branch, to avoid a shared-file merge conflict)

Suggested open item: "2026-11-01 — muster ceiling — trusted links
to never-approached villages yield zero blades because the village
has no roster (catchUpSim-only generation); the gate line tells the
player to sound a call that cannot reach 10 (this run's evidence)."
The design question behind it (must links require approach? must
the call generate rosters? must the line say so?) belongs to #1538's
steve-call ruling, not to this DIAG arm.

## Files

- Prereg: evidence/2026-11-01/sim-freeface-a-prereg.md
- Evidence (this file): evidence/2026-11-01/sim-freeface-a.md
- Instrument: scripts/policies/freeface-diag.js
- Instrument proof: scripts/test-freeface-20261101.js
- Sweep / splitter / analyzer: scripts/freeface-sweep-20261101.js,
  scripts/freeface-split-20261101.js,
  scripts/freeface-analyze-20261101.js
- Probe: scripts/freeface-probe-90111.js
- Per-seed JSONs: evidence/2026-11-01/perseed-freeface/leadfeast/
  (20 judged seeds) + pilot/confirm stdout+stderr, determinism
  stdout+stderr, contrast-85106 stdout+stderr, probe-90111 json.
- Verdict: DIAG-GO-SINGLE-CLUSTER — decomposition reconciles
  exactly (66/66 cross-checks, 0 arithmetic violations), cause
  named and counted for BOTH Stonebridge and Thornfield (no roster
  field — chronic days 80–95), but only on 90111: no second refused
  state in-band to contrast. Merged locally, pending ship (the
  coordinator merges; no push, no bump, no live verification by
  this arm).
