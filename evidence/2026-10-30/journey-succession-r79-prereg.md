# Journey succession r79 — FOURTH HANDOFF RE-PROOF + DEATH-LEDGER (lane B, pre-registration 2026-10-30, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at closeout
(endgame next), and VERIFY the file reads 4 afterwards (rotation writes
have repeatedly failed to stick; the file is the authority, not this note).
Run number basis: last numbered Lane B run is r78 (crisis adoption
closeout, 2026-10-30); no r79 evidence or memory entry exists at run start.
Base: local master 26b3e1da4 (includes r78 + sim-pressb-b / effdebt /
tier3watch landings). No push, no bump, no live check — ship loop owns those.

Instrument only, zero src/js changes. Same no-compete decision as
r54/r55/r56/r64/r67/r70/r72/r75: tackle-succession owns the succession
inheritance build; this run measures master for it and documents blanks,
never fixes them here. Gating freeze (2026-10-27) stands; no gate,
deed-bar, standing, wave, or table-price change is in scope. Perception
law untouched: invites here are player-chosen; no partner-selection
change is in scope. No canon doc covers succession/mantle (r54 prereg,
unchanged) — none invented here.

## The question

r75 proved the FOURTH handoff keeps the web intact on master 56b4cbe74.
Since then real game changes landed: contest-death recording via
registerDeath + fallen (06b502d53, [needs-eyes]), NPC hide-handling
teaching hide_armor (gapscomp-hide), vessel stash/armor fetch
(armorfetch/stashfetch), sick-record clearing (sickstale-b), titan
exclusion from the castMonster pool (titanexcl). Does the fourth
handoff still hold on this master — and does the death ledger now
record handoff deaths the way the contest-death fix records contest
deaths?

1. CHAIN4-REPROOF (matched panel): r75's exact seeds/config. Do the
   same seeds produce the same chain structure (first-death mode,
   chainDeaths with scriptedSecond/Third/Fourth tags), the same
   fourth-handoff bond/affinity integrity, and the same inh4 classes?
   Any drift is attributed to an intervening game change or flagged
   unexplained — never silently absorbed.
2. DEATH-LEDGER (new, analyzer-side only): per seed, every chainDeath's
   fallenCause / lineageCause / causeKnown, the fallen count at first
   death, and the fallen count at window end. Do scripted handoff
   deaths leave a fallen entry with a real cause (as contest deaths
   now do), or does the ledger still rely on the lineage fallback?
3. VOICE: a driven convo at d+53 as the FINAL bearer on chain-forced
   seeds. Sense-read: does the fourth successor's talk grieve the
   third successor by name the way earlier partners grieved earlier
   bearers? Any wrong-bearer naming is a finding, not a footnote.

## Instrument (r75 driver + analyzer DEATH-LEDGER section)

- Driver: r75 verbatim by pure rename (diff-verified), no behavior
  change. Proof test: r75 proof renamed — RED r72 driver must lack all
  fourth fields, GREEN r79 driver must emit all of them on proof seed
  24998 (second + third + fourth kills forced at dplus 3).
- Analyzer: r75 verbatim by pure rename + two changes: (a) DEATH-LEDGER
  section (above); (b) STAGING RATE controls list fixed to
  [26154, 26155, 26156] — r75's analyzer carried a stale r72-era list
  ([26144, 26145, 26146]), which printed controls as 0/0.
- No game change. No gating, deedGate, scale, stage, readiness, or
  table-price code is touched.

## Seeds, regime, policy

Matched to r75 exactly: fresh band 26151–26156 (now a re-proof band,
not fresh — intentional), competent policy, POST_DAYS=55, mature
regime (EARLY_KILL_DAY=40): 26151–26153 CHAIN-FORCED
(SECOND_KILL_DPLUS=20, THIRD_KILL_DPLUS=20 measured from the second
death day, FOURTH_KILL_DPLUS=10 measured from the third death day),
26154–26156 CONTROLS (no forced kills; organic chains, if any, still
recorded and tagged scriptedSecond=false / scriptedThird=false /
scriptedFourth=false). Pilot first: 26151 (forced) + 26154 (control)
at full config; if the pilot shows nothing but instrument failure,
stop and report — don't burn the panel.

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- CHAIN4-READABLE (binds): on ≥2/3 chain-forced seeds, a full fourth
  handoff record (relPreDeath4 + relPost4 + fourthDeath with linOk +
  moOk + inh4 readable). A forced seed with no fourthDeath is a
  NO-GO on the instrument, not on the game.
- CARRIED REGRESSION (binds, r75 bars unchanged): SCRIPT first kill
  staged-or-organic honored on all seeds; C1v3 0 missing;
  W1d-tightened pooled: M3v2b ≥ 2 on ≥ 4/6 seeds; S1 0 missing
  bearerDeltaExact; MG2v2 0 violations; M1/M4 hold; chain mantles
  all cause-known (forced chains carry scriptedSecond /
  scriptedThird / scriptedFourth = true, organic chains
  cause-known).
- DEATH-LEDGER (reported, NOT scored): fallenCause strings per
  chainDeath, first-death fallen count, end fallen count — compared
  against r75's values seed by seed. A missing fallen entry for a
  chain death is documented as a blank for the death-ledger owner,
  not scored as a game failure here (scripted handoffs may
  legitimately record through the lineage path).
- INVITE SEAM (reported, r72 bars): invite outcomes spoken /
  deflected / other across driven transcripts; any sibling
  deflection joined to its SAYTRACE pool draw.
- MATCHED DRIFT (reported, NOT scored): per-seed chain structure,
  fourth bond/affinity integrity, inh4 class vs r75. Drift with a
  named intervening change is explained; drift without one is an
  open finding.

## What would count as an interesting finding

- A fourth-handoff bond drop or affinity drift appearing only after
  the intervening landings (a regression in the handoff machinery).
- A chain death with no fallen entry and no lineage cause (the ledger
  going dark for handoff deaths while contest deaths are now
  recorded).
- A fourth-bearer convo naming the wrong bearer, or no grief at all
  for the third successor (voice machinery not following the fourth
  bearer).
- Matched-seed chain structure changing shape (e.g. a forced seed
  losing its fourth kill) with no named cause.

## Metric review (carried)

- r75: fourth handoff keeps the web intact; phantoms are successor
  webs; the original bearer's web is usually empty at death, so
  orig-phantom 0 is a thin-web artifact, not decay — phantom
  reporting must quote pre alongside end.
- r75: headline chain lines compress organic middle links — the
  per-seed chain line reads death/second/third bearers only; the
  analyzer's chains line (with scriptedFourth) is the full record;
  any "bearer <redacted>" must count chainDeaths + 1, not headline bearers.
- FOURTH-KILL DPLUS HAS THREE HONEST BASES. fourthDeath carries
  dplus (since third death), dplusSecond (since second death),
  and dplusFirst (since first death). No metric in this run reads
  "d+10" or "d+50" without naming its base.
- POLICY FALLBACKS ARE NOT DRIVEN DEFLECTIONS. The SEAM metric
  counts driven transcripts only.
- r79 analyzer fix: STAGING RATE controls list corrected (above);
  r75's printed controls rate (0/0) is superseded, not a finding.
