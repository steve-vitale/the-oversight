# journey-social r21 (2026-10-18) — leg 5 "social life": friendships & rivalries

## PRE-REGISTRATION (docs/MEASUREMENT.md §11, written BEFORE the pilot)

**Context:** the leg's own terms — "conversations, gossip, moots, friendships,
rivalries across a full run". r13–r20 covered conversations, moots, the justice
ladder, exile socials. The one leg term never sense-tested: FRIENDSHIPS AND
RIVALRIES forming across a run. 2026-10-11 finding: "No rivalries, no romances
observed. The policy was uniformly kind. Rivalry/friendship arcs need a mixed
policy (or longer-lived villages) to sense-test. Left for a future run." This
run is that run.

**The machinery (read before running):** `v.bonds["a|b"] = {v, depth, day,
dayGain}` (betrayal.js bondAdd): v is living warmth −100..+100, depth is
sediment −3..+3 (crossing ±25/±50/±75 banks ±1). pairAffinity reads bonds for
trial votes, ambush invites, case belief. POSITIVE bond sources: feed them
(+1/+2), deep talk (+2), tend/treat (+3), promise kept (+4), feast (+1/+2),
visit (+4), lingering meal (+2). NEGATIVE bond sources: exactly ONE —
recordGrievance (−6..−12; callers: ambush, trial votes, abandoned alliance,
false accusation, petition votes). Theft moves TRUST (−35 caught), never bonds.
bumpTrust never touches bonds. NOTHING in conversation.js / convo-*.js reads
bond depth — no narrative beat ever marks a friendship or rivalry.

**Leg question:** with a MIXED policy (kind to 2 favorites, hostile to 2
outsiders, neutral to the rest), do friendships and rivalries actually FORM
across a full run — scholar↔villager AND villager↔villager — and does the game
ever NARRATIVELY mark them (a beat, a line, an option), or do they stay
purely mechanical?

**Interesting findings to hunt:** a villager acting like a friend (seeking you
out, defending you at a moot, refusing to let you down); a villager acting
like an enemy (confronting you, refusing aid, plotting against you); two
villagers becoming visibly friends/enemies on their own ("the village
befriends itself"); any bond milestone narrated in fiction.

**Binding metrics (§14 — a miss is NO-GO, never re-scored):**
- M1 (friendship fires): ≥1 scholar→favorite pair reaches bond v ≥ 50
  (depth ≥2) in ≥2/3 runs.
- M2 (rivalry fires): ≥1 scholar→outsider pair reaches bond v ≤ −25
  (depth ≤−1) OR (trust ≤ 5 with ≥1 recorded grievance) in ≥2/3 runs.
- M3 (the village befriends itself): ≥1 NPC↔NPC pair crosses bond ≥+50 or
  ≤−25 in ≥1/3 runs (villager bonds are not player-driven; the audit says
  they should form on their own).
- M4 (people check): 6+ full transcripts (favorite + outsider samples)
  sense-read by the author; GO if ≥5/6 meet the conversation quality bar.
  SEPARATE finding: is any friendship/rivalry NARRATED (beat/line/option),
  or mechanical-only? (finding, not a GO gate)
- M5 (guardrail): ≥2/3 runs end the 60d harness with ≥5 villagers alive;
  no new death mode vs the r20 competent baseline.

**Seeds:** 1501, 1502, 1503 (fresh). **DAYCAP=60**, death-aware stop +10d
tail (r13–r20 standing). **Policy:** "favorites" = competent base +
favoritism overlay (2 favorites kind, 2 outsiders hostile, rest neutral;
chosen day 2 by initial trust, fixed for the run). Deterministic where it
matters; theft schedule day % 5.

**Driver:** scripts/journey-social-r21-favoritism-20261018.js (r20 pilot
pattern + bond snapshots/crossings + favor/outside convo driving +
NPC-NPC top-bond tracking).

**Metric review:** (empty — fill post-run)

**Telemetry:** node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/social.json
--current 'evidence/2026-10-18/journey-social-r21-per-seed-*.json'
--metrics <key metrics> — first run for this metric set: --update-baseline
only after the deviation check passes (any LOUD line investigated first).

## Run state

Driver: `scripts/journey-social-r21-favoritism-20261018.js` (r20 pilot
pattern + bond snapshots/crossings + favorites/outsiders overlay + NPC-NPC
top-bond tracking). Policy "favorites": competent base; day 2 picks 2
favorites (highest trust) + 2 outsiders (lowest trust); favorites get
giveFood/tend/comfort/deep-talk, outsiders get theft (every 5d), favor
declines, neglect. Seeds 1501/1502/1503, DAYCAP=60, death-aware stop.

Ran TWICE: pre-fix sweep (evidence in `social-r21-prefix/`) and post-fix
sweep (current files) after landing the theft->grievance fix.

Driver bug (mine, noted): `favAlive[day % favAlive.length]` on even days
always indexes 0 — favorite #2 never got driven conversations (only
feeds/tends). Does not invalidate M1 (>=1 pair), but second-favorite bonds
understate.

## Village assessment (plain words)

**Seed 1501 (Ethel, survived to d54, 11 alive):** Ethel played favorites
with Miguel (bond 97, depth 3 — the deepest friendship in the run) and
robbed Iman and Ernestine blind (18 thefts). The village tried Ethel for
theft (Willow, Benoit, Sari voted guilty d10). Miguel stayed loyal through
it. **Seed 1502 (Aubrey, d62, 11 alive):** favorites Aaron/Antônia —
Antônia died d11 (ambush), Aaron survived and bonded to 100/depth 3
post-fix. Outsiders Emma/Elijah/Tamika were robbed into -92/-96/-75
(depth -3): genuine enemies. **Seed 1503 (Rocco -> Hannah after Rocco died
d38, d63, 6 alive):** favorite Luis died d9 (ambush); Rocco bonded with
James to +75 before dying, then Hannah inherited zero relationships —
succession resets every bond to 0, including the depth-3 friendship.

## Metric verdicts (§14)

- **M1 (friendship fires): GO 3/3 post-fix** (pre-fix 2/3 bearer-aware).
  Miguel 97/d3, Aaron 100/d3, James 100/d3. Crossings: +25/+50/+75 all
  fire through feed/tend/talk/feast/visit.
- **M2 (rivalry fires): pre-fix NO-GO (1/3) -> post-fix GO 3/3.**
  Pre-fix: 51 thefts across 3 runs moved victim trust to ~0 but bonds
  stayed 0 — the ONLY negative-bond source was recordGrievance via moot
  machinery. Post-fix: all 6 outsiders at bond -56..-99, depth -2/-3;
  18 negative threshold crossings. Grievances 30/39/25 per run (vs 6-10).
- **M3 (village befriends itself): GO.** NPC-NPC bonds to +74/depth 2
  (Aaron-Devon, Terrence-Iman 64/d2). Visits/feasts/lingering meals do it
  with no player involvement.
- **M4 (people check): GO 6/8.** 8 transcripts sense-read (see below).
  The 2 weak reads are driver-artifact deflections (proven: deflection
  rate 23% days 1-15 -> 43% days 45+, the run-ledger no-repeat blocks
  accumulate as the driver hammers the same 2 villagers daily).
- **M5 (guardrail): GO.** Post-fix survival 11/11/6 alive vs pre-fix
  11/9/8 — no new death mode, no wipes; justice stages 3/2/1 vs 2/3/2.

## People check (transcripts read, not counted)

**Genuinely human:** decline consequences ("They won't forget. They'll
just stop asking." / "They won't ask twice. That much is clear.");
unfinished-thread continuity across days ("We never finished talking
about each other — we wandered off it, 2 days back"); promise-kept beats
("You kept your word. That's rare out here."); mood-grace ("That could
have stung. They let it pass — you've been kind before.").

**The blank (verified in code, not just transcripts): bonds have ZERO
narrative surface.** Nothing in conversation.js / convo-*.js reads bond
depth. The "kind before" beat is 5-day memory recency
(convoMoodReceptivity), not bonds — a bond-100 friend and a bond-0
stranger with recent gifts behave identically. Elijah at bond -96/depth
-3, trust collapsed, two trials: "Walk my trap line with me?" Priya at
bond -25 after voting guilty at your trial and being false-accused by
you: same trap-line invitation. Rivalries and friendships are
mechanical-only (trial votes, ambush invites, case belief) — never
narrated. Documented for a future content run; not fixed here.

**Succession resets relationships:** Rocco's depth-3 bond with James died
with Rocco; Hannah started at 0 with everyone. Bonds are bearer-keyed
with no inheritance. Noted for the succession leg.

## Blank filled: theft never made enemies (the rivalry substrate gap)

**Root cause:** `recordGrievance` is the bond system's ONLY negative
path, and theft — the most common player hostility — never called it.
51 pre-fix thefts: trust -> ~0, bonds 0. A robbed villager could never
become your enemy; the justice ladder punished, but the relationship
didn't move.

**Fix (src/js/game.js, src/js/memdepth.js):**
- `stealFrom` caught branch: `recordGrievance(vid, scholar,
  'stolen_from', 20)` -> bond -10.
- `theftNoticeSweep` (unseen but noticed): `recordGrievance(vid,
  scholar, 'suspected_theft', 12)` -> bond -6.
- `grievanceSay`: phrases "stealing from their pack" / "the missing
  rations" (narrative surface via memdepth's grievance lines).

This also feeds grievanceBetween -> motiveBetween (betrayal plots gain a
real fuel: "they think you robbed them") and convoTopics' t2pickOther
(villagers talk about who they hold grievances against).

**Proof** `scripts/test-theft-grievance-r21.js`: RED 2/7 pre-fix ->
GREEN 7/7 post-fix (grievance recorded, bond -10/-6, motive 21.6->37.6,
phrases exist). **Regressions:** test-justice 61/61, test-party-bond
45/45, test-scholar-bonds 12/12, test-betrayal 79/80 (1 pre-existing
`no strangers before notability`, documented r15 on pre-fix HEAD),
test-blitz-memdepth 85/86 + test-cache-theft-suspicion 71/72 (both
single failures verified identical on pristine HEAD via patch
round-trip — pre-existing, not regressions).

**Wild before/after:** re-ran all 3 seeds post-fix. Outsider bonds
0..-12 -> -56..-99; 18 negative threshold crossings (was 1);
grievances 6-10 -> 25-39 per run; survival parity held.

Design call (FIGURE-IT-OUT-YOURSELF): severity 20/12 mirrors the
existing trust hits (-35/-15) scaled to bond units; suspected (unseen)
is weaker than caught, matching the game's "the village only KNOWS if
someone saw" rule. Steve can overrule.

## Blanks documented (not fixed)

1. **Bonds never surface in conversation** (see People check). A future
   run should wire bond depth into convo openings/beats (warm openers at
   depth >= 2, cold shoulders at depth <= -1) — content + engine work.
2. **Ledger-exhaustion deflections:** hammering one villager daily drives
   the run-ledger no-repeat blocks and the game deflects ("lost my train
   of thought") instead of honestly ending ("I've told you everything").
   Largely a driver artifact; a real player rotating villagers sees
   ~23%, not 43%. The dry-line voice for run-blocked lines is a standing
   r16 design choice — flagging, not fixing.
3. **Succession bond reset** (for the succession leg): the mantle passes,
   relationships don't.

## Metric review

- M2 as pre-registered was bearer-naive (final-bond snapshot); the
  bearer-aware reading (crossings during tenure) was the honest one —
  propose M2-v2 for the next run: ">=1 scholar->outsider pair crosses
  bond -25 during the run (any bearer)". M1/M3/M4/M5 held as written.
- Telemetry check: 2 LOUD lines, both schema-mismatch ("convos/
  naturalEnds newly appeared" — keys absent from the 140d-era baseline);
  survival metrics quiet. Did NOT roll the baseline forward: the r21
  60d-era metric set is schema-incompatible with social.json's 140d-era
  set; overwriting would destroy it. Next social run should reconcile
  the schema.

## Verdict

- **Reachable: YES.** Friendships (feed/tend/talk/feast/visit) and now
  rivalries (theft -> grievance -> negative bond -> motive) both form
  through reachable player actions; NPC-NPC friendships form on their
  own.
- **Fun: YES, with the robot edges named.** The conversation machinery
  is genuinely human at its best (continuity, decline consequences,
  grace beats); the remaining robotic edge is that deep bonds change
  nothing in dialogue.
- **Winnable: YES (guardrail).** Rivalry heat doesn't kill villages;
  survival parity held across the fix.

**Land:** src/js/game.js, src/js/memdepth.js, scripts/test-theft-grievance-r21.js,
scripts/journey-social-r21-favoritism-20261018.js + evidence/2026-10-18/
(pre-fix sweep under social-r21-prefix/, post-fix current, 126
transcripts under social-r21-transcripts/). No [needs-eyes] — the fix is
mechanical, Steve's call on severity on review. Merged locally, pending ship.

