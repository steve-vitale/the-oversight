# journey-landing r153 — PREREG (Lane A, leg 0 LANDING)

**Run id:** playtest-loop-a-20261121T2150Z (scheduled Sat 2026-11-21 15:45 CST;
started 15:50 CST — scheduler fired late; the run's own clock is 21:50Z).
**Base:** local master `de0cb73c8` (r152's landing commit; verified it contains
origin/master `cb20cd650`, local ahead 14, behind 0; main tree clean, disk 47%).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg:
establishment.
**Lock:** `playtest-loop.lock`, run_id `playtest-loop-a-20261121T2150Z`,
created 2026-11-21T21:51:00Z (content verified after creation). Delete at
closeout in the same call as its read, only if run_id matches.

## Stale-lock recovery (this run's start)

The lock at run start held `playtest-loop-a-20261121T1950Z` (created
19:50:16Z). That run (r152) DID land its work — commit `de0cb73c8` is on
master, both fixes verified present (`lastToldBeast` in game.js,
"spare food for the little ones" in conversation.js) — but the machine
restarted ~20:22Z (uptime 1:28 at 21:50Z) and killed the run mid-closeout:
no worktree release, no rotation write (still 0), no lock delete. Its
registered `journey-landing` tree (heartbeat 20:21:11Z, 89 min stale at
21:50Z) held no live process (ps shows only lane B work), its branch was
0 ahead of master with a clean tree — nothing to adopt, clean re-run.
Recovery: lock replaced in the same call as its read (run_id matched);
the r152 worktree dir was removed (`git worktree remove --force`, dir
gone); the stale registry entry was later gone too (registry rewritten
22:05Z, 20→18 trees — reaper or lane B registration; slug free).
The `journey-landing` branch delete failed twice on flap EPERM writing
`.git/packed-refs.new`; the register script's existing-branch fallback
attaches to it. Registration for r153 launched 22:07:43Z (background,
queued on REGISTRY.lock behind lane B's `sim-departbeat-b` registration,
started 22:02Z); log `hidden_files/journey-landing-r153-register.log`.

## Flap (window 5, flickering — ongoing, never solved)

Fresh-file writes fail intermittently since ~21:52Z: small writes land as
0-byte husks (exit 0, size 0 — exit code alone is NOT a probe), writes
≥~12KB raise EPERM. Content-verified probes (write sentinel, read back,
compare) flicker: FAIL 22:01:30–22:01:43, CLEAR 22:01:59, FAIL again
~22:02. The flap watchdog (pid 8234, started 20:39Z) is alive but its
`.out` is 0 bytes. All release/register attempts in this window failed on
the registry atomic write until the registry was rewritten by another
process at 22:05Z.

## Amendment B — execution path, not metrics (this prereg)

**Registration may not succeed before the panel must run.** Fallback (per
r152 Amendment A precedent): the panel runs from the main tree, READ-ONLY,
using the committed r152 driver byte-identical under env overrides
(SEEDS/DAYS/OUTDIR). Verified before running: `src/js/` has no `fs` usage
(no require('fs')); sim-harness, policies/competent, and the analyzers make
no file writes; every driver write goes to the absolute OUTDIR under the
goal hidden_files (census/system/transcript paths), and the driver carries
the R81 EPERM-retry patch (census/system 90×10s, transcripts 3×5s). Main
tree verified clean before and after the panel; if master moves mid-panel
the panel is void and re-runs. All commits (driver clone, analyzers,
prereg, run note, any fix) go through the worktree + safe-commit.sh once
registration succeeds, or are left staged in goal hidden_files for
adoption if it never does. Any transcript lost to EPERM is re-harvested by
a deterministic re-run of the same seeds after the flap clears (same seeds
+ same code + same base = same conversations). The run note names every
missing transcript file.

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1342–1351**. `git grep` over `evidence/*.md` for
`1342-1351|1342–1351`: zero hits. Plain `grep -r` over `evidence/`
`--include=*.md`: zero hits. Contaminated-band lists in the r149/r150/
r151/r152 preregs name bands up to 1332–1341; none names 1342–1351.
**Band 1342–1351 is fresh.**
Prior landing bands: 1332–1341 (r152), 1272–1281 (r149), 1262–1271 (r148),
1252–1261 (r147), 1242–1251 (r146), 1232–1241 (r145), 1212–1221 (r143),
1192–1201 (r142), 1182–1191 (r141), 1172–1181 (r140), 1162–1171 (r139),
1142–1151 (r121–r138, deliberate reuse), 1122–1131 (r119), 1083–1092,
1073–1082, 1063–1072, 1053–1062, 1043–1052, 897–906 (contaminated),
887–896, 867–876, 857–866, 847–856, 837–846, 817–826, 797–806, 777–786.

## Q1 (PRIMARY) — regression watch on the post-r152 master, fresh band

Since r152's base (`320165c5a`), `src/js/` changed ONLY in the r152 commit
itself (`de0cb73c8`: game.js +29, conversation.js +17 — the two fixes
below). No other src/js change on master since. Q1 is therefore a
regression watch on r152's own fixes, on a fresh band:

- **Namebeast told-unkicked (r152 FIX 1):** tellbeast records
  `codex.lastToldBeast`; namebeast asked the same day about a
  reported-but-unnamed beast kicks that beast's debate on the spot and
  opens it first. Watch: tellbeast→namebeast pairs on the panel — the
  told beast must be the named beast when asked the same day; a told
  beast named a day late (the r152 defect shape) is a Q1 failure.
- **Settled re-ask names the favor (r152 FIX 2):** the handledPool
  settled-favor re-ask variants name the favor's short when speakable.
  Watch: any settled-favor re-ask that names no favor or speaks a bare
  kind id is a Q1 failure on live data.
- **Carried r152 watches (unchanged bars):** profilegate win-plans at
  d14/d28 (r152: 1/10, 4/10); reseed launch beat firing inside 28d; a
  downed ally re-targeted after going down; a deflect-promise line that
  reads as a broken promise; a resume that speaks a bare kind id; a
  witness line naming no one; an owed walk never re-offered after a veto;
  the r262 crisis fixes (deflect-promise wording, resume-quote-kind,
  witness-line return; FIX 1 unreachable-flee did NOT hold in r262).

**Q1b — WARN_YOU DEFLECT SHAPE (r149 item, carried r150/r151/r152 — sixth
carry):** the r150 warn-heed fix closed the heed path (r152: 2/2 heed
sittings name the danger). The deflect path is still open: no deflect
sitting fired in r152 either. Remains a design question (how forcefully a
pending warning re-asserts itself); **no fix this run unless a deflect
sitting shows a new defect shape** — else document and carry with the
design decision named.

**Interesting if:** any r152 bar moves on the fresh band; a pocket recurs
(any shape, including sub-threshold); a door-flee fight fires; a fledBad
sample fires with an unpinnable fight; an accepted link-raise parrots or
repeats its opener verbatim; a scholar ends stranded homeward for 2+ days;
a favor with a live need is answered settled; a trail-talk / Wren line
repeats verbatim in one sitting; a second scholar death pattern (deaths >
2); revised M-PR1 > 15%; statedAfterPick ≥ 6; hungry-at-horizon moves from
6/10 either way; any village starts a win-plan inside 28d; a parting-hit
death; a trio party forms inside 28d; a dry `...` line on any turn; a
COUNTER LEARNED line naming a prose-clause descriptor; a confide exit with
no secret shared; a volley line naming the wrong ammo; a mourning beat that
names no one or reads as template filler; a dead-react loop (reactDryCount
gate not holding in live play); a link-accept pool[0] repeat streak; a
doubled 'The' in an outing line; a "the the" article doubling anywhere in
the panel transcripts (r261 regression watch); a 4-person launch or
bow-staged volley (report as lever behavior, not a defect); a settled-favor
help topic that names no favor or speaks a bare kind id; a warn_you sitting
where the danger is never named or never surfaces; an all-fights
refused-turns count > 0 with the binding zero-DMG count at 0 (the Spool
shape recurring); a truly-silent (non-deduped) refused move; a warn_you
deflect sitting that re-surfaces the warning (new behavior — report it);
a told beast named a day late (r152 FIX 1 regression); a settled re-ask
naming no favor (r152 FIX 2 regression).

**Bars (bind, r152 bars carried verbatim):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG: **refused-turns 0 BINDS** (v4, zero-DMG fights); stood-through-by-choice
  reported only; raw zero-DMG + B-shape reported as watch.
- Refused-turns all-fights (v4): reported as watch; any count > 0
  is a Q1 investigation item (the Spool shape).
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket: 0 pocket fights BINDS; stuckTurns reported as watch.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1 (revised per r143 metric review item 1): never-offered among
  established ask_favor sittings ≤15%, where "established" excludes
  `resolution=unestablished` sittings regardless of final stage; raw
  analyzer rate + max per-seed never-offered reported as watch.
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
  Goal bridge: 0 repeats in a sitting (r149 fix regression watch).
- Presshop farUnreached REPORTED only.
- R66 HUNGRY: starvation deaths 0, starvingWarnings 0.
- 1130-d6 amnesia shape: 0 recurrences. Miriam line: 0 "That's settled".
  Deflect-fallback: 0 `fellBack`.
- Nodloop: LOOP=0.
- Q1 panel watch: resume-takes of deflected question-wants re-pose the
  question — report the count; a take that still ends in the generic
  acknowledgment is a Q1 failure on live data. verbatimRepeats 0,
  verbatimRepeatsExempted = re-poses observed; spot-check each exempted
  line against its transcript (a non-re-pose exemption is a Q1 failure).
- **Scholar deaths: ≤2 per 10-seed panel** (fairness adjudication
  recorded alongside). Report count, day, cause, succession latency
  per death.
- **silentTurns (phantom-line detector): 0 on the panel.**
- **Dry-line watch: 0 dry (empty-content) lines in the panel's transcripts.**
  Any dry line is a Q1 failure on live data.
- **FIGHTALLY2 watch:** count landing fights where a second ally joins;
  report the fight-log trigger class for each; any fight with 2 allies
  that ends zero-DMG or stuck is a Q1 failure on live data.
- **Homeward watch (r240 fix):** report end-stranded days per seed; any
  scholar stranded homeward 2+ days is a Q1 investigation item.
- **Door-flee watch (Q1a r146):** 0 fights ending 'fled' where the scholar's
  last step was onto a door tile; the zero-DMG/B-shape analyzer plus the
  fight-log `player-move` entries adjudicate.
- **Link-accept watch (r243 fix):** every accepted link-raise talk ends
  with a voiced accept line (never the player's choice label verbatim).
  Variety reported (pool[0] vs pool[1] split); a 22/1-style repeat streak
  is a Q1 failure on live data (r148 fix regression).
- **Link-opener watch (r248 fix):** no link-raise opener repeats verbatim
  in the panel; report as no-streak + variety (shapes + split) per r151
  metric review — the "no repeat verbatim" wording is over-strict.
- **Counter-label watch (r246 fix):** every COUNTER LEARNED line on the
  panel uses the guarded label (no prose-clause descriptor as a name).
- **Confide watch (r244 F8):** no "This stays between us, right? Right."
  closing a sitting where no secret was shared.
- **Ammo-name watch (#2593):** every volley "has no X" line names the
  weapon's actual ammo.
- **React wind-down watch (r246 fix):** no sitting where `dlg:react` is
  offered at reactDryCount ≥ 2; no verbatim-repeat react loop. Any such
  sitting is a Q1 failure on live data.
- **Settled-help watch (r247 fix):** every settled-favor help topic
  names the favor's short; a bare kind id spoken is a Q1 failure.
- **Deduped-vs-silent watch (r150 instrument):** the r150 move-refusals
  split is reported; a truly-silent refused move (not deduped) is a Q1
  investigation item.
- **Warn-heed watch (r150 fix):** every warn_you sitting where the
  player heeds must name the danger (r152 AFTER: 2/2). A heed sitting
  that ends without the danger named is a Q1 failure on live data.
- **Profilegate watch:** win-plans at d14/d28 reported per seed;
  any wave-4+ holder plan inside 28d reported with its trigger.
- **Reseed-beat watch:** any reseed launch beat firing inside 28d
  reported with its line; a beat that fires but stays silent is a Q1
  investigation item.
- **Downed-ally watch:** any landing fight where an ally goes down
  reported; a second 'goes down' for the same ally in one fight is a Q1
  failure on live data.
- **Owed-walk watch:** any accepted invitation vetoed by illness
  reported; the veto must name the owed walk and the re-offer must come.
- **Namebeast told-watch (NEW, r152 FIX 1):** every same-day
  tellbeast→namebeast pair on the panel names the told beast; a told
  beast named a day late is a Q1 failure on live data.
- **Settled-reask watch (NEW, r152 FIX 2):** every settled-favor re-ask
  on the panel names the favor's short when speakable; a generic "that
  one" re-ask is a Q1 failure on live data.
- Pilot first: seeds 1342–1345; expand to all 10 unless the pilot is
  red. Death-aware horizons (dead village stops, +10d tail max).

## Watch items carried from r152 (no binding bar)

- Hungry-at-horizon 6/10 (r151: 4/10) — band variation, no src change.
- Win-plans d14 1/10, d28 4/10 (r151: 2/10, 5/10) — down one each.
- Presshop pressFailTotal 6 (r151: 0) — narrated pack-full shape; if r153
  repeats 5+, it becomes a finding.
- M-PR1 3/30 = 10% (r151: 1/22 ≈ 4.5%) — under the 15% bar but climbing;
  if it passes the bar, the question is whether "stated" resolutions are
  counted too loosely.
- statedAfterPick 8 (threshold ≥6) — the two read are road refusals,
  intended Q1 shape; no action.
- Q1b deflect: still untested (sixth carry).
