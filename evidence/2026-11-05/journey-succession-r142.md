# Journey succession r142 — Lane B, leg 7 (succession): the one eligible seed bonded — but 6 of 8 villages had no stranger left to meet

Leg 7 (succession). Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout, verified by re-read after landing.
Base master 25de3b127. Run number r142 follows r141 (social life,
same day); the rotation file, not the number, is the authority.

## Run setup — lock, registration, heartbeat

- No lock at run start. Fresh lock written (run_id 2026-11-05T21:55:45Z).
- Pre-flight: main tree clean, disk 25%. Reap ran clean except standing
  sibling noise (other lanes' dirty trees, never touched); 4/16 active,
  under cap.
- Registration: the plain body slug journey2-succession is still
  stale-registered (status done-merged, Oct 30; its directory is an
  orphaned non-git copy, NOT deleted — needs a main-session
  disposition, same as r137), so this run used the run-suffixed slug
  journey2-succession-r142, the same deviation prior runs used.
- Heartbeat: immediate heartbeat landed after registration
  (22:04:14Z); detached setsid loop (sleep 300) verified alive
  (pid 1971, parent 1) with ticks landing — the r133/r137 lesson
  applied (a loop spawned from a finished exec session dies silently;
  the first attempt here was killed with the session and re-started
  detached via a script file).

## Pre-registration (binding, written before any scored seed)

Prereg: evidence/2026-11-05/journey-succession-r142-prereg.md.
Question carried from r137 (verdict INSUFFICIENT-DATA): can a bearer
bond with a stranger they talk to, by relD14 — judged on a panel with
enough eligible seeds to count? r142 applies r137's metric-review
revision verbatim: run 6–8 seeds, score CAP-D14 on the eligible
subset with a stated minimum (≥3 eligible or INSUFFICIENT-DATA),
CAP-D30 dropped as an expectation. Panel stop rule: run seeds
33601–33608 in order, stop at 3 eligible or after 33608.
Smoke seed 33699 (EARLY_KILL_DAY=5, POST_DAYS=10) proved the
instrument before the panel: handoff d6 Maricela→Joyce, probe opened
(Nadia, trust 40, seek_comfort), bondDaily 10/10 entries carry
bearerId, pick rank 1, funeral INCALL true, selfReqDayEntries 0.

## Binding verdict: CAP-D14 = INSUFFICIENT-DATA (not a fail, not a pass)

- CAP-D14 bar: ≥3 eligible seeds AND ≥3 bonded by relD14 AND
  bonded/eligible ≥ 2/3. Result: 1 ELIGIBLE seed out of 8 run — and
  it bonded.
  - 33604: Norman↔Shaurya bonded d+3, the SAME day as the probe
    conversation (probe: Shaurya trust 30, want curious; Shaurya is
    visjoin_39, a newcomer). Still bonded at relD30 with the same
    bearer.
  - 33602: probe opened (Daniela trust 28, curious) and the pair
    bonded d+4, one day after the conversation — but Duc died before
    d+14 (second handoff), so the seed is not eligible. BondedEver
    counts it descriptively.
  - 33601, 33603, 33605, 33606, 33607, 33608: no-stranger-pool — the
    successor was already bonded to every living villager at relPost.
    Saturation findings, not capacity misses.
  - No seed was skipped (all 8 handoffs fired: 5 organic, 3
    scripted), no probe refused, no village ended before d+14.
  - Per §14 the bar is NOT re-scored against a friendlier metric
    mid-run. 1/1 bonded is the descriptive picture; the binding
    verdict is INSUFFICIENT-DATA because the denominator never
    reached 3.
- BONDED-EVER (descriptive): 2/2 probe-opened seeds (Shaurya,
  Daniela). Combined with r137's 2/2, the cross-run descriptive
  picture is 4/4 probe-opened pairs bonded — but that is not a
  binding verdict, and the denominator problem is now the finding.
- The pre-screen revision did NOT solve the denominator problem:
  r137 got 2 eligible of 6; r142 got 1 of 8. Saturation is worse on
  this band (6/8 no-stranger-pool vs 3/6). Running more seeds under
  the same design will not fix it — the instrument measures the
  wrong supply.

## The mechanism answer (descriptive): newcomers are the only bond supply

- FIRST-bearer new bonds, relPost→relEnd, all 8 seeds: 9 total — and
  ALL 9 are with NEWCOMERS (villagers who arrived after the handoff:
  visjoin/app arrivals). ZERO first-bearer bonds with pre-existing
  roster members. Both probe bonds (Shaurya visjoin_39, Daniela
  app_mgpsphkh812) are newcomer bonds too.
- Newcomers DO arrive post-handoff on every seed (2–10 arrivals per
  seed in the relEnd roster). The bond supply exists — it just is
  not in the relPost roster the probe looks at. By handoff day
  (~d35–41) the village is a near-clique (45–62 bonds at relPost);
  the successor has nobody left to meet among the people already
  there.
- OPP: 1 unbonded talk request in the panel (Rafael, 33602, filed
  d+29 — a newcomer who sought the bearer and never bonded with
  him; he ended the run holding the mantle himself, relEnd selfId
  rafael_torres — trust decides, not bonds). FIRST-bearer bonds on
  undriven days: 7. NPC-NPC new bonds: 97 across the panel — the
  autonomous bonding engine runs daily; the bearer is not excluded
  from it, but its new bonds for the bearer are all with newcomers.
- 33605 is the saturation extreme: 62 bonds at relPost, unchanged at
  relD14 and relD30, ZERO new bonds anywhere in 30 days — a fully
  closed clique. 33606/33607 are the same shape with the bearer
  forming 0 bonds while NPC-NPC bonding continues (16 and 3).

## Self-request regression check (r133 fix, in the wild)

selfReqDayEntries = 0 on all 8 panel seeds (and on the smoke seed).
The r133 ledger.js purge holds in wild play: no stale self-addressed
talk request survives a handoff on this panel. The r133 selftalk
proof test also re-runs ALL GREEN on this base
(scripts/test-journey-succession-r133-selftalk.js).

## People check (sense, not counts) — PASS, with one noted fizzle

Read in full: both stranger-probe transcripts + one d+14 successor
transcript per scored seed (33604) + one d+14 transcript from a
saturated seed (33605).
- Shaurya (33604): a newcomer awkward at talking to strangers, warms
  up, accepts the invite ("Okay. Yeah. I trust you."), ends with
  mutual regard. No fabricated shared history; bond follows the same
  day.
- Daniela (33602): opens with a real question (dreams of before),
  shares a specific dream (Anchorage, the lengthening street),
  mourns Jorge by name ("Jorge is gone and the world just...
  continues"), accepts the invite eagerly, takes the Scout role from
  Kakoli with a proper handoff ("Scout is yours now"), ends
  resolved. Bond follows the next day.
- Diana (33604 d+14): confides a secret (a photo of someone left
  behind), teaches chanterelle, asks "Can I trust you? I mean
  really", anger exchange with character ("Good. Anger's fuel. Just
  — point it somewhere useful."), takes Scout from Ananya.
  Coherent, ending resolves.
- James (33605 d+14): mourns Karina, Dante and Horomona by name —
  CORRECT mourning, verified against the record (Dante, the first
  bearer, died between relPost and relD14; the mantle had already
  passed to a later bearer by the conversation). Refuses the invite
  with character ("Not right now. I've got my own things to
  handle."). One fizzle, noted not scored: James opens with a wound
  needing a second pair of hands, the bearer asks "Tell me why you
  need this", and James drops it ("Sorry, lost my train of
  thought" / "Forget I said anything") — the want evaporates
  without being engaged or deflected with character. A small
  dialogue-seam blank for the builder's list.
- Recurring cosmetic wrinkle (r137, confirmed again): the recap pick
  renders as "Still on what they confided" — third-person where
  first-person would read naturally. Driver-pick phrasing, not an
  NPC failure; noted, not a blank.

## Village assessment (plain words)

Eight villages, all reached a handoff, none skipped:
- 33601 (Morris→Aaron, organic d23): the steadfast one. One handoff
  only, 8 alive at handoff, 5 at the end, 11 fallen. Aaron bonded
  once — with a newcomer.
- 33602 (Jorge→Duc, scripted d41): the churn. Ten bearers in the
  window, 6 alive at handoff, 1 at the end, 17 fallen. Duc bonded
  with the newcomer Daniela the day after they talked, then died;
  Daniela herself held the mantle later; Rafael, who sought Duc and
  never bonded with him, ended holding it.
- 33603 (Larry→Devon, scripted d41): quiet. Two handoffs, 6 alive at
  handoff, 4 at the end, 12 fallen. Devon bonded twice, both with
  newcomers, without a single talk request filed to him.
- 33604 (Elena→Norman, organic d39): the scored seed. Eight
  handoffs, 6 alive at handoff, 3 at the end, 19 fallen — the
  bloodiest village — yet Norman held the mantle past d+30 and
  bonded with Shaurya the day they talked and Jonathan a week
  later.
- 33605 (Seamus→Dante, scripted d41): the closed clique. Four
  handoffs, 10 alive at handoff, 7 at the end, 7 fallen — and not
  one new bond anywhere in 30 days. Dante died within two weeks of
  taking the mantle; James set out extra portions for the dead.
- 33606 (Christian→Darius, organic d33): four handoffs, 9 alive at
  handoff, 6 at the end, 14 fallen. The village kept bonding
  (16 new NPC-NPC bonds) while Darius formed none.
- 33607 (Vanessa→Harman, organic d34): five handoffs, 9 alive at
  handoff, 8 at the end, 8 fallen. Harman formed no bonds; the
  village barely bonded at all (3).
- 33608 (Werner→Gabriel, organic d35): three handoffs, 10 alive at
  handoff, 7 at the end, 10 fallen. Gabriel bonded twice, both with
  newcomers.
The pattern across the panel: villages either hold together and keep
bonding through newcomers, or they churn through bearers and die out.
The successor's social life runs entirely on arrivals — a village
with no arrivals offers no new faces to befriend, and by handoff
day the old faces are all already bonded.

## Verdicts for the leg

- REACHABLE: yes — succession fires on 8/8 seeds (5 organic, 3
  scripted), the pick follows trust on every handoff, the funeral
  arc fires, and the new bearer's social life continues through
  newcomers. A real player reaches this content by surviving to a
  death, which is the ordinary game.
- FUN: yes, with the standing caveat — the successor's second life
  is social through newcomers, but a village with no arrivals
  offers no new faces to befriend; that is a property of a small
  saturated village, not a broken system. The conversations
  themselves read like people, with one small want-fizzle noted.
- WINNABLE: unchanged by this run (no gate, price, or power changed;
  instrument-only run). The winnability chain is untouched, as
  ordered.

## Determinism proof

Seed 33604 re-run to a scratch file (/tmp/r142-33604-rerun.json):
BYTE-IDENTICAL to the panel file — the read-only wraps are
trajectory-neutral on this base.

## Metric review (§14)

- The eligible-subset revision failed as a fix, and that failure is
  itself the finding: the denominator is not a sampling problem, it
  is the design. The relPost-roster stranger pool is empty on 6/8
  seeds because the village is a near-clique by handoff day. No
  panel size under this instrument will reach 3 eligible seeds
  reliably.
- Proposed revision for the NEXT run (not applied here): probe the
  NEWCOMER channel directly — the first newcomer who arrives after
  the handoff and talks to the bearer, bond by d+14 after arrival
  (or after the probe conversation, whichever is later). The
  mechanism data says newcomers are the entire bond supply (9/9
  first-bearer bonds this panel, 100% in r137 too), so the bar
  should measure the channel that actually supplies bonds. The
  no-stranger-pool rate itself (6/8) becomes a saturation
  datapoint, not a denominator.
- CAP-D30 stays dropped as an expectation (r137 revision, unchanged).
- The 33605 pickCtxs carry no day/name fields (4 entries, all None)
  while the rank computation still works via npcCalls — a minor
  instrument-label gap, noted for the next driver copy.
- r137's bond counts are NOT re-scored here; r142 scores only the
  new decomposition (CAP-D14 on the eligible subset + OPP with
  first-bearer attribution), per its prereg.

## Telemetry deviation check (step 14) — LOUD lines, all EXPLAINED, baseline NOT rolled forward

Command (per-seed, single files — r133's aggregation lesson applied):
node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/succession.json --current
'evidence/2026-11-05/journey-succession-r142-tele-<seed>.json'
--metrics deaths.bearer,census.alive,census.fallen,
census.integrationStage,week2.deadBearerMentions, per seed.
- LOUD: census.integrationStage -80% (baseline 15 -> current 3) on
  ALL 8 seeds. EXPLAINED — baseline artifact, not a game deviation:
  Game.integrationStage() returns 0–3 (progression.js:132–138), so a
  baseline of 15 is definitionally impossible; the baseline was seeded
  when the metric meant something else. Current 3 is Full Integration,
  the ceiling. The baseline value must be corrected to 3 when it is
  next re-done; it will LOUD on every run until then. Same family as
  r137.
- LOUD: census.alive -84% to -98% (baseline 49 -> current 1–8).
  EXPLAINED — scale + extinction: baseline 49 is a large grown
  village; this panel's villages are small (5–10 alive at handoff,
  1–8 at end), and 33602 nearly went extinct (1 alive). Not a bug.
- LOUD: deaths.bearer -80% (5 -> 1) on 33601; +60–100% (5 -> 8/10)
  on 33604/33602. EXPLAINED — window length + churn: the 1 is the
  stable single-handoff seed; the 8/10 are churn villages (8 and 10
  pickCtxs). Both ends are the panel's own mortality regime.
- LOUD: census.fallen +70% (10 -> 17) on 33602; +90% (10 -> 19) on
  33604. EXPLAINED — same regime: fallen tracks window length and
  churn.
- No LOUD on week2.deadBearerMentions on any seed (funeral echo
  healthy).
- Baseline NOT updated this run: per-seed values span 1–8 alive and
  7–19 fallen, so no single-seed value represents the panel; and the
  integrationStage baseline needs a definitional correction (15 -> 3),
  not a roll-forward. The next run should re-baseline from a stated
  panel (per-seed means), as r133 concluded.

## Gate

node scripts/check.js --quick run in the worktree during closeout
(log: evidence/2026-11-05/journey-succession-r142-checkquick.log):
281 passed, 9 failed in 1204s — identical to the r104 establishment
profile (281/9) and r140's gate. The 9 are the standing families
(measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes ["next day voices once more: expected 2,
got 1"]) plus three 120s load timeouts
(trust-observer-neutrality, capable-bot, table-endings). NO new
failures from this run (zero src/js changes). Gate passed.
The r133 selftalk proof test re-run by hand: ALL GREEN.

## Seed-band freshness re-check (skill: local_seed_band_freshness)

Band 33601–33608 + smoke 33699 verified FRESH before the run:
exact patterns 33601–33608 and 33699 across ALL dated preregs
(evidence/*/sim-*-prereg.md and evidence/*/journey-*-prereg.md) —
zero matches. Loose-hit explanations checked and dismissed: a
"3360" hit in evidence/2026-11-02/sim-heraldband-pilot-prereg.md
is a commit-SHA substring (62e251b699ba9c3360f4fe...), not a seed
reservation; "33699" hits in October census JSONs are data values
in non-prereg files, not reservations. Forbidden bands named in Nov
preregs (73641–73648, 73671–73678, 78201–78208) do not intersect.

## Files

- Prereg: evidence/2026-11-05/journey-succession-r142-prereg.md
- Driver: scripts/journey-succession-r142-20261105.js (r137 verbatim
  except names/seeds)
- Analyzer: scripts/analyze-journey-succession-r142-20261105.js
  (r137 analyzer + eligible-subset CAP verdict)
  + evidence/2026-11-05/journey-succession-r142-analysis.txt
- Panel records: evidence/2026-11-05/journey-succession-r142-{33601..33608,33699}.{stdout.json,stderr.log,saydump.txt,tele-*.json}
  + transcripts journey-succession-r142-transcript-*.txt
- No src/js change this run. [needs-eyes] is NOT attached: instrument
  only, no feel change for Steve to playtest.
