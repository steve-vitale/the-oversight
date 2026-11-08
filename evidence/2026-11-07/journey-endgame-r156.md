# Journey endgame r156 — Lane B, leg 4 (2026-11-07 18:00 CST run)

Substrate: master `386d7c4bf` EXACTLY. Pilot: matched re-run of r152's 5
seeds (89701–89705) on the new substrate — first endgame pilot on the
xp-gear retune. Prereg: `journey-endgame-r156-prereg.md`. Amendment 1:
`journey-endgame-r156-prereg-amendment-1.md` (refusal-variety fix + post-fix
re-run).

Adoption note: the 18:00 CST worker timed out at ~00:58Z after the
post-fix pilot reached 2/5 seeds, with no verification performed. The main
session adopted the run: verified the heartbeat frozen (00:54:51Z across
re-checks, zero worker processes — dead run, not a live one), completed
the post-fix pilot (89703, then 89704–89705 with RELAYGREY=1 added — the
forcedrift plan requires it), re-ran the analyzer on the postfix corpora,
and closed out the run (gate, commit, rebase onto the alien-expansion
master `2bc17d793` that landed mid-adoption, merge). No bar was moved and
nothing was re-scored in adoption.

## Headlines (per seed)

- 89701 waves: village-LOST (scattered), never announced, never sat.
  2 wave-4 kills, standing peak 199, uw=4. FLIPPED from r152 (won lesser).
  Third flip for this seed across r147/r152/r156 (lost → lesser → lost).
- 89702 waves: WON LESSER — announced d90, sat d100, feared/light,
  final:pledge, alive 4. 1 wave-4 kill, standing peak 199, uw=4. FLIPPED
  from r152 (village-lost). Surge spent d46 + d54 — the pellet lock did
  NOT recur (r152: bearer Carlos died d83, surge never).
- 89703 waves: WON LESSER — announced d90, sat d107, beloved/light,
  final:audience, alive 6. 0 wave-4 kills, standing peak 199, uw=4.
  FLIPPED from r152 (survived, never announced — the scholar was exiled
  there). The exile lock did NOT recur: the scholar announced and sat.
  Q4 (exile feast-surge spend) still open.
- 89704 forcedrift (experimental, ex-control): WON LESSER — announced
  d90, sat d90, relay/dark, final:merge, alive 8. Wave-5 FACED (editor
  d78), 2 living veterans at release d72, standing peak 375, uw=5.
  Final pick moved from r152's final:voice to final:merge.
- 89705 wavesnw: WON LESSER — announced d90, sat d98, beloved/light,
  final:audience, alive 8. 1 wave-4 kill, standing peak 199, uw=4.
  Sat 20 days earlier than r152 (d118 → d98).

Tally: lesser 4/5 (r152: 3/5), full 0/5, wave-5 unlocked 1/5 (89704;
r152: 2/5), wave-5 faced 1/5. Sits 4/5 on the xp-gear substrate — the
frozen-band collapse (sits 5/8 → 0/8 on the frozen band) does NOT
reproduce on these seeds. Observation, not a verdict: the collapse may
be band-specific, or these seeds are insensitive to it. The endgame
pilot does not move the frozen-band question either way.

## Fix verification in the wild (refusal variety — see amendment 1)

Pre-fix transcripts showed party-invitation refusals repeating one
identical line verbatim. Fix (`src/js/party.js`, +31/−4): 3 lines per
refusal branch, deterministic per villager+day, spoken aloud. Proof test
`scripts/test-endgame-r156-refusal-variety.js`: 15/15 GREEN standalone.

Wild proof (post-fix re-run, matched seeds): all 5 per-seed JSON
summaries byte-identical pre vs post; transcripts differ ONLY in refusal
lines (89701: 10, 89702: 2, 89703: 4, 89704/89705: 0). Same villager,
same branch, different words on different days. Postfix analysis
byte-identical to pre-fix. Fix verified in the wild, trajectories
unchanged — LANDS with this run.

## Dark re-verify (S1/S2 — GO)

Full dark probe re-run on the new substrate (7 variants,
`perseed-endgame-r156-dark/`): S1 GO — the v3 walk-out line names the
sitter Amelia Moon, not Bill Palmer. S2 GO — D1–D4/D6 hold; the only
non-ok step is v1a's D2-twist-fired, the expected by-design curdle step.

## People check

- 89704's dark relay finale reads as people, with real consequences:
  "You say yes. The word is small. The pods open — not like morning.
  Like a barracks." / "The village doesn't cheer. The village has never
  been this quiet." / "The System is delighted. That's the worst part."
- Refusals now read as decisions, not recordings (see fix verification).
- Bond proposals: ZERO villager-initiated bond proposals in any pilot
  transcript. The single "propos" hit (89701) is a Codex line ("Gilberto
  proposed relief (raid), day 8"), not a proposal. Per the prereg this
  is a finding, not a NO-GO — the warmth window may not be reached in
  endgame pilot runs — but the scholar-facing half of the bonds build
  remains unverified in the wild. Carry-forward: probe bond proposals
  from the social leg, not endgame.
- V-WAITVARIETY GO 5/5 (no adjacent hold-line repeats). V-FixB,
  V-Gorge, V-FixC (no case arose), V-POCKETSAND (no case arose),
  V-RAIDDENSITY, V-STICKYOFFER (no announce-then-dip case — UNMEASURED),
  V-PREOFFER all hold per the analysis.

## Verdicts (from analysis)

PRIMARY-BINDINGS NO-GO | PRIMARY NO-GO | ALL NO-GO — on exactly
M3-conversion (armB 1 vs armA 3), M3b-peak (0/4 peak ≥2), M4-wave5-or-full
(0/4). Per the prereg's ROAD-TALLY note this is the EXPECTED road
reading on a closed road, not a pilot failure — same reading as
r121/r124/r128/r130/r131/r135/r140/r143/r144/r147/r152. Everything else
GO: M1-guard 5/5, M2-census, M2b/M2c/M2d, MFLEE-routed 17/17,
KILL-ANATOMY 53/53, M5-voicing, M5b, M6, M10-fullseat-gap 3/3, M11,
M12, M13, M14, M15-feast-census, M16, M17, M18, M19, M20, M21, M22,
REG-r35/r37, VETCONV, SECOND-VETERAN, FIRENARR/HURTRETURN captured,
FALLEN-ambush, V-WAITVARIETY, LOSSKIND (89701: scattering).

## Reachable / fun / winnable

- Reachable: YES — 4/5 seeds reached the table and sat; the endgame
  opens on this substrate.
- Fun: YES, with the refusals fixed — finales read as people, the dark
  relay has teeth, and the lesser-seat paths (feared/beloved/relay)
  each play differently.
- Winnable: NO CHANGE — full seat 0/5, wave-5 faced 1/5, the road is
  still closed at uw=4 for the waves seeds. The wall is the same one
  the feast-gate finding names: the seat is priced through a feast
  the village almost never throws. The gating redesign is now a
  separate design question with Steve (research done, design presented
  2026-11-07); this run does not move it.

## Gate

`node scripts/check.js --quick` in the worktree: **281 passed, 9 failed in
853s** (first attempt killed by SIGTERM at 45/290, no failures recorded —
runtime restart suspected; re-run clean to completion). Failures triaged:
6 standing (measurement-workflow, measurement-proof-update,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20) + measurement-cache-flags (known intermittent) + 2
EPERM-flap-caused: test-foodpower-20261014 (ontology validator failed
mid-flap; passes standalone 30/30 when the flap clears) and
test-sw-audio-cache-20261012 (EPERM copyfile sw.js → /tmp during the
flap; all inner offline-asset assertions pass). No failure is
attributable to this run's change (party.js refusal variety). Proof test
`scripts/test-endgame-r156-refusal-variety.js`: 15/15 GREEN standalone.
Gate accepted on the standing profile + flap triage. (Adoption note: an
EPERM write flap from ~01:40Z blocked registry/git writes afterward, so
commit/rebase/merge wait for the flap to clear; the tree was heartbeated
at 01:29:41Z and the lock held until closeout.)

## Telemetry

N/A this run. `telemetry-check` refuses recorder-corpus input by design
(same as the 2130Z adoption — perseed files carry anchorCommit, panels
are the comparison instrument). Prereg: baseline re-seed is a panel
decision, baseline NOT rolled.

## Metric review

- M3/M3b/M4 NO-GO on a closed road stays the expected reading; the
  road tally is the instrument, the bindings are the judge — no change.
- NEW standing item V-REFUSALVARIETY: future endgame pilots check
  refusal variety in transcripts (within-branch variety, not one
  repeated line). The fix lands here.
- V-BONDINIT: absence in endgame pilots is a finding about the
  instrument (warmth window), not the feature — move wild verification
  of bond proposals to the social leg.
- The 89704 control question stays CLOSED (experimental seed from now
  on). The 89701 flip-flop (lost → lesser → lost) is trajectory
  divergence of the same class as r143→r144 — recorded, not chased.
- Pilot env record: a forcedrift seed requires RELAYGREY=1 in the
  probe invocation; the adoption's first postfix attempt stopped on
  it. Future endgame pilot commands must list it.
- Pellet-bearer question is RULED (Steve 2026-11-07: pellet passes to
  hungrier hands); the pellet-pass build is in flight in the build
  lane. Q4 (exile feast-surge spend) still open.

## Carry-forwards

- Q4 exile feast-surge spend (Steve call, still open).
- Bond-proposal wild verification via the social leg (r153's M9
  recap-cap offer-path fix is a separate owed build).
- Full seat still 0/5 across r152+r156; wave-4 kill conversion is the
  binding constraint (M3), per the winnability funnel.
- Master moved mid-adoption (alien expansion `2bc17d793` landed);
  this branch was rebased onto it before merging.
