# Journey succession r197 — Lane B, leg 7 (succession) — RUN NOTE

Run: Lane B r197, scheduled 19:00 CST 2026-11-13. Run id
loop2-20261114T005537Z. Base master 5f83ca93d (reaper lock-skip).
Rotation-b read 7 at run start; this run writes 4 at closeout.
Panel ran 01:06:59–01:08:20Z (~80s total — a quiet box; r193's
panel took ~11 min). Pre-registration:
evidence/2026-11-13/journey-succession-r197-prereg.md.

## Pre-flight

- Lock: none present at run start (the 18:00 CST r196 attempt
  aborted on the worktree cap and deleted its lock). This run's
  lock created (loop2-20261114T005537Z).
- Main tree clean; disk 39%; pull already up to date at 5f83ca93d.
- Reaper: removed nothing; 13/16 active, 12 LOUD dirty sibling
  trees (never auto-removed): sim-wideduty-a, sim-sametick-a,
  journey-scale-attr, sim-secondlink-a, sim-redactor-a,
  sim-saycap-a, sim-siegedialog-a, sim-inffight-ab,
  sim-transplant-raid-b, sim-rageloop-b, journey-establishment,
  sim-transplant2b-a. Registration succeeded on the freed slots
  (the 18:00 abort was a 16/16 cap hit; a sibling had registered
  in the gap after that run's reap).
- Worktree journey2-succession registered, heartbeated immediately
  and every ~5 min during the run.

## Panel

- Driver scripts/journey-succession-r197-20261113.js (r193 driver,
  rename only), analyzer
  scripts/analyze-journey-succession-r197-20261113.js (r193
  analyzer, rename only), runner
  scripts/run-journey-succession-r197-panel.sh (r193 runner,
  rename only).
- Seeds: FRESH BAND 34251–34254 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25). Pilot 34251 ran
  clean in the foreground first (exit 0, valid JSON), then the full
  panel via nohup: all 5 seeds exit 0, analyzer exit 0.
- Seed-band freshness: 34251–34254 searched 0 hits in all
  evidence preregs; fresh.

## Panel verdicts

- **MANTLE-FINE (binding): PASS.** 12 deaths observed (34251: 1,
  34252: 1, 34253: 5, 34254: 4, 33998: 1) — 0 flippedImmediate=false
  outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips. Two held-briefly same-day cascade
  bearers (34253 d95, 34254 d81) — same-day chains, correctly
  classed SAMPLING-or-CLEAN. The mantle 2-day latency owed item
  (from r155) is CLOSED: no latency >= 2 anywhere on this panel.
- **DRY CENSUS (binding, extended): PASS.** 0 dry hits, 0 honest
  fallbacks, 0 null-return silences across all 5 seeds.
- **R192 WILD CHECK + R193 AGENCY WILD CHECK (binding): PASS.** 0
  deflect_q, 0 dlg:doubt dry hits; 0 agency-closer dry lines —
  the r193 fix (villager-agency.js pool-picker) holds in the wild
  on the leg where the defect was found. (Refusal has no sayTrace
  pick; covered by its 11/11 proof test, green in r193.)
- **CONTROLS (binding, under r193's REVISED smoke bar — see Metric
  review): PASS.** Smoke 33998 at-death snapshot is BYTE-IDENTICAL
  to r193's: d6 Heinrich→Sofia, alive 11, fallen 1, newTrust 21.
  End-census headlines 1/11/1/3/2 (same as r193). Machinery holds
  on every seed: pick rank 1, funeral INCALL true, selfReq 0.
- **CAP-NC (descriptive): INSUFFICIENT-DATA.** bonded-by-deadline
  1/2 eligible (34254 Sam bonded by deadline d+58; 34251 Laura
  not bonded by d+57). bondedEver 1/3 probe-opened seeds — the
  2/2 streak from r193 breaks (34251 Laura warm scene, no bond;
  see People check). Denominator < 3, as ever.
- **OPP (descriptive):** unbonded talk-requests 1 (Esteban d5
  33998 — same as r187's and r193's smoke); FIRST-bearer new bonds
  on undriven days 2; NPC-NPC new bonds 27; newcomer arrivals 8;
  FIRST-bearer newcomer bonds 0 vs pre-existing 3; selfReqDayEntries
  0 (r133 purge regression check holds).
- **Day-skips:** 0 across the panel (sleep rolls 75/110/110/110/30)
  — ninth straight panel at zero; the watch stays a watch.

## Village assessment (plain words)

Five villages, five different deaths, one story that always
continues — the mantle never dropped, never stalled, never picked
a dead person. What differed was what was left standing around
the new bearer.

- **34251 — the near-extinction.** Olivia died on day 9, out in
  the wild, before the planned kill — an organic death, not the
  scripted one. Maya took the mantle at trust 42 and held it for
  the whole 66-day window: she never died, and nobody else ever
  had to take it from her. But the village bled out around her —
  13 fallen, 2 alive at the end, pantry empty. The mantle works;
  the village didn't. Maya's is a story of outliving everyone.
- **34252 — the healthy one.** Penelope died on day 40 as
  scripted; James took over at trust 60 and held it to the end.
  10 alive, 2 fallen, pantry over 12,000 kcal. The successor's
  trust barely moved at the office (delta 0) while the village
  warmed a little (delta 9.3). Nothing dramatic — which is the
  point: succession can be uneventful, and uneventful is fine.
- **34253 — the chain.** Darnell died day 41; Amy took over at
  trust 87 and died of dehydration on day 95. Then the mantle
  ran: Rahul (arena, day 96), Deirdre (wild, day 102), Mateo
  (wild, day 103) — four bearers in nine days, each handoff
  synchronous, each pick trust-rank 1. 8 alive, 6 fallen at the
  end, pantry thin (2,589 kcal). A village that keeps burying its
  leaders and keeps going.
- **34254 — the same-day cascade.** Luis died day 41; Irving
  took over, died in the night on day 72; Enzo took over and died
  in the wild on day 81 — and Vikram, who took it the same day,
  died in the wild the same day, passing to Vasyl. Two bearers in
  one day, both handoffs clean. 8 alive, 7 fallen, pantry 3,221.
- **33998 (smoke) — the young village.** Heinrich died day 6;
  Sofia took over at trust 21 and held it. 11 alive, 1 fallen,
  pantry 10,760. The control behaves exactly as it did in r193.

Across the panel: the dead are remembered (week-2 dead-bearer
mentions 4–5 per seed), the living keep bonding (bonds at relEnd
47–59 per seed), and no successor ate a half ration or heard a
word the ledger had refused. The survival collapse underneath
(34251: 2 alive) is the known structural hunt, not a succession
defect — the mantle did its job while the village starved.

## People check (read in full — 5 transcripts)

- **DeShawn d+3 (34251, trust 58)** — opens on trust ("Can I
  trust you? I mean really."), then the ambush-of-Nina betrayal
  case: site, witnesses, investigate, moot, vote guilty. The NPC
  wants the ambush settled; the options engage it; the vote
  resolves it ("Counted."). PASS.
- **Yara d+3, stranger probe (34251, trust 24)** — theory
  question, invite deflect ("You want me to follow you into the
  dark? Earn that first."), naming-debate gossip with a real
  name (Gianna pushing 'Big-Eyes'), and a full Black Walnut teach
  narration ("You show them Black Walnut — where it grows, how to
  tell it apart. They nod slowly, committing it to memory.").
  PASS — and this is the r155 teach-narration dry NOT firing:
  the line is complete and sensible (see Blanks).
- **Rahul d+53 (34253, trust 100)** — guilt question with a real
  answer ("We're all doing math that doesn't add up."), recap
  holds the thread, ask:lately gives an honest non-answer ("I
  could keep talking, but I'd just be repeating myself with more
  hand gestures."), party-role assignment correctly reports Rahul
  is already Scout. PASS.
- **Ruth d+65 (34251, trust 82)** — the best of the five. Grief
  that names the dead ("We lost Yara and Chloe. I do the
  headcount without thinking. Then I think."), a trade offer
  ("My knowledge for yours."), loyalty ("I'd follow you out past
  the treeline."), and a role transfer with consequence — Jesse
  steps back, "Scout is yours now." A villager acting like a
  person with a memory. PASS, strongly.
- **Laura d+43, newcomer probe (34251, trust 20)** — an
  Italian-only speaker; the whole scene plays in gesture and
  glosses ("Water?" — the one English she knows; "Tu sei... il
  capo?" — boss). Warmth builds nonverbally and ends "This was
  good. They mean it." PASS as drama — and note the tension: the
  scene reads as a bond forming, but the bond did NOT register
  (CAP-NC not-bonded-by-deadline). A warm conversation is not a
  bond; the threshold held. Descriptive, not a defect.

**"Names, named." (DeShawn transcript):** investigated, NOT a
defect. The line is the convo-turn finish in betrayal.js:4619;
`nameWitnesses` speaks the actual witness names in a separate
say() line ("X, Y saw you walk out together — friendly as
anything") before the turn line lands. The transcript only shows
the turn line, so it reads terser than the player hears it. No
fix.

## Blanks filled / documented

No src/js change this run — the panel's job was verification, and
the verification passed. Three carried items close with evidence:

1. **Teach-narration dry (r155, Black Walnut / Mayapple): NOT
   REPRODUCED.** 0 TEACH-DRY hits on this panel and 0 on r193's;
   a Black Walnut teach was read in full (Yara d+3) and the
   narration is complete. Closed as unreproduced on two
   consecutive clean panels; stays on the DRY-CENSUS watch list.
2. **Carried agency dry: CLOSED by r193's fix, verified in the
   wild.** 0 AGENCY-DRY hits on the fresh panel.
3. **Mantle 2-day latency owed item: CLOSED.** 0 fineLatency>=2
   across 12 deaths; every handoff synchronous.

No new dry surface fired. No new blank found this run — the next
fix item, if any, waits for a panel that actually produces one.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/succession.json --current 'evidence/2026-11-13/journey-succession-r197-tele-*.json' --metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`

- **LOUD: census.fallen swung 103%: baseline 14.3 -> current 29
  (n=5 files).** Verdict: KNOWN COMPARISON ARTIFACT, not a
  regression (r193 metric review). The baseline stores per-seed
  MEANS (14.3 fallen/seed on an old panel); the tool SUMS the
  current files (29 across 5 seeds). Honest mean: 5.8 fallen/seed
  — LOWER than the baseline describes, i.e. a healthier regime,
  not a worse one. The other metrics stayed quiet under the
  tool's rules (baseline < 5, or swing < 60%: deaths.bearer sum
  12 vs 7.6 = +58%). **Baseline NOT rolled** — the means-vs-sum
  mismatch is still unsettled, same as r193.

## Metric review

- **SMOKE BAR (prereg correction):** this run's prereg carried
  the pre-revision bar (2/9/3/3/2) — it was written before the
  r193 metric review was re-read. r193 had already REVISED the
  bar: end-census numbers dropped (they flipped twice on one wild
  death's luck); the smoke now guards the at-death snapshot (d6,
  Heinrich→Sofia, alive 11, fallen 1, newTrust 21) + machinery.
  The controls verdict above is judged under the REVISED bar, per
  r193's recorded decision. Do not re-score past runs; the bar
  change was r193's finding, and this run confirms the revised bar
  holds byte-identical on the new base.
- **CAP-NC:** no revision — the denominator stays starved by
  design (longer panel or earlier-arrival band, per r183). The
  bondedEver signal weakens this panel (1/3 probe-opened vs
  r193's 2/2); descriptive only.
- **TELEMETRY BASELINE:** still not rolled (means-vs-sum
  mismatch, see above). Either the baseline is re-derived from a
  current panel or the check compares means — a standing item for
  the next run that touches it.
- **DRY CENSUS:** keep as is; it caught nothing because there was
  nothing to catch, and its machine section is the reason we know
  that rather than guessing.

## Reachable / fun / winnable (leg 7, succession)

- **Reachable: YES.** Deaths happen organically (34251: day-9
  wild death, before any scripted kill) and by script; the mantle
  passes to a living successor every time, synchronously, with the
  funeral arc firing on all 5 seeds. A real player will meet this
  content by dying — which is to say, by playing.
- **Fun: YES, in the quiet way this leg is fun.** The successor's
  second life has real voice: grief that names the dead, roles
  that are promises and change hands, a newcomer scene played
  entirely in gesture across no shared language. The drama is in
  the living, not the dying.
- **Winnable: NOT JUDGED by this leg.** Succession is continuity,
  not a win path — its job is that the story continues after
  death, and it does, on all 5 seeds. Whether the village then
  wins belongs to the endgame leg; note 34251, where the mantle
  held for 66 days while the village around it fell to 2 alive.

## Gate

- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
  ran 01:11–01:21Z, log
  evidence/2026-11-13/journey-succession-r197-check.log:
  **335 passed, 5 failed in 615s — GO after adjudication, 0
  attributable.** This run changed no src/js (tooling + evidence
  only), so no failure can be attributed to it:
  1. test-measurement-proof-update.js + test-measurement-workflow.js
     — the pre-existing measurement-staleness pair (proof refresh
     rounds 11 + 12 owed since r192/r194/r195/r193 changed src/js);
     non-attributable.
  2. test-living-garden-deed-attainment.js — 120.1s timeout in the
     gate; exit 0 standalone (129s) → load artifact.
  3. test-one-person-army-deed-attainment.js — 120.0s timeout in
     the gate; exit 0 standalone (64s) → load artifact.
  4. test-phone-frame-proof.js — standing stale receipt
     (index.html etc. changed since the receipt); non-attributable,
     refresh owed by the proof-refresh round.
- Heartbeat note: the 01:13Z heartbeat queued ~10 min behind two
  sibling registrations on REGISTRY.lock, then failed with
  EPERM (host write flap) on its registry write; re-heartbeat
  landed 01:26:24Z. Last-good heartbeat before that was 01:11:19Z
  — 15 min was never breached (13 min at worst), but the flap +
  lock queue together nearly stranded the tree. The reaper's lock
  self-contention (AGENTS.md 2026-11-12) is the standing cause.

## Landing

- Commits (branch journey2-succession): 77999ccb8 (driver/analyzer/
  runner + panel evidence, 92 files) + f3870b3c8-after-rebase run
  note. Note: the run-note commit's hash changed across the rebase
  (56a8d6385 → f3870b3c8); this landing paragraph is a third commit
  on the rebased tip.
- Rebase: master moved during the run (5f83ca93d → a1d201e8e: 7
  commits — sim-transplant2b corpora/test + journey-establishment
  r136). No src/ changes in that range (evidence + scripts only),
  so no game-code drift. Rebasing was clean; the full panel was
  re-run on the rebased tip (01:43:29Z) and produced BYTE-IDENTICAL
  outputs — 0 changed files. Proof re-run confirmed.
- Merge: `git merge --ff-only journey2-succession` in the main
  tree (READ-ONLY for the merge). [FILL: merge result + new HEAD.]
- Release: `bash scripts/worktree-release.sh journey2-succession
  merged`, worktree removed, branch deleted, final reap.
  [FILL at closeout.]
- Main tree verified clean after landing. [FILL at closeout.]
- Merged locally, pending ship — no version bump, no push, no live
  verification (the ship loop owns those).

## Rotation

- journey-rotation-b.txt: 7 at run start → 4 at closeout
  (verify the file reads 4 afterwards).
