# build-armor — armor seeding/start gap — PRE-REGISTRATION (binding, MEASUREMENT §14)

Workstream: ARMOR SEEDING (the fixall-armor confirm's "exact remaining gap",
2026-10-28). This run lands or holds a first-piece mechanism on top of the
adopted fixall-armor conversion (rebased onto current master, proof
re-run green 32/32 — conversion is NOT rebuilt here). A miss is NO-GO,
never re-scored mid-run. Metric doubts go under "metric review" in the
results file and apply to the NEXT run only.

Worktree: ~/workspace/worktrees/build-armor, branch build-armor.
Base: fixall-armor rebased onto master 2342b764c (7 fixall commits replayed
clean, tip ac8867633 at rebase time), plus the seeding change below.
Pre-reg + instrument are committed BEFORE the judged confirm run. Scratch
diagnostics ran before this pre-reg to identify the exact mechanism: day-0
generation snapshots on 67701–67712, a 14-day band-policy trace of seed
67701's sole wearer, a day-by-day 180-day trace of seed 67703's grantee,
and a partial 180-day scratch band on 67701–67712 with a one-grantee
variant (killed after 7 seeds when the trace proved one wearer too
fragile — see below). Their findings are summarized below and do not
change the bars after the band. A full 180-day scratch band with the
final three-grantee mechanism runs before the judged confirm as a further
diagnostic; it is reported alongside, not judged.

## Plain-words picture

Villagers can sew armor (fixall-armor proved conversion: 71 attempts / 50
crafts on pilot villages), but sewing needs a villager who WEARS armor —
wearing is the only NPC recipe knowledge — and wearing needs a first
piece, and no path introduces the first piece in play where nobody crafts
one. Half of fresh villages never get a villager home wearing armor, so
no sewing can start there no matter how good conversion is. This run
builds the first piece at village creation.

## Diagnosis (scratch diagnostics, unjudged)

1. **Generation is the lottery.** A fresh village's only NPC armor comes
   from generated kits: only 4 of 78 occupations bias toward bark armor,
   other kits draw it randomly from 55 clothing items, and the 6
   background survivors arrive itemless (their hydrated kits can carry
   it, but rarely). Day-0/day-3 snapshots of the fixall confirm seeds:
   only 5 of 12 villages had ANY bark/hide in any NPC kit; 7 of 12 had
   none at all. Day-3 wearers: 4 of 12.
2. **Seeded-but-gone is a second loss mode.** Seed 67701's ONLY wearer
   (Zoltan, mushroom_grower) has goal 'escape': under the band policy he
   leaves on day 1–2 with purpose 'leave' and never returns (confirm:
   away all 112 days, 0 knower-days). Seed 67704's bark-bias villager held
   bark only in stash and left before gear day equipped it. A single
   wearer who walks out vetoes the whole loop.
3. **Late seeding is the same lottery, later.** Seed 67710 (no armor in
   any starting kit) seeded on day 133 — arrivals bring generated kits,
   i.e. fresh lottery tickets. The bot band has no armor deposit source
   (armorydrive donates weapons only, never armor), so the ungated pile
   draw cannot seed a bot village on its own.
4. **One wearer is too fragile (scratch-v1 + 67703 trace).** With a
   one-grantee variant, scratch on 67701–67707 gave attempts on only 4/7
   seeds and crafts on 3/7. The 67703 day-by-day trace shows why: the
   grantee was home+wearing on only 17 days, all before day 35, died
   around day 36, and vine never reached 2 while he was home (trust
   opens ~day 31; bark reached 3 on day 23, vine stayed 0–1). Villagers
   are away most days on short objectives and die young — a single
   wearer must survive until the slow material window AND be home on a
   complete day, and often does neither. Hence three grantees, not one.
5. **What is NOT the problem.** Materials (fixall inflow works), the
   craft beat, the spares flow, and gear-day equipping (a stashed bark
   piece is worn within days when its owner stays home). The old bark
   cuirass by the fire is explicitly UNWEARABLE in canon (game.js newGame
   comment: "split at the seam, unwearable") — so the fix does NOT make
   the cuirass wearable. The pile also stays deposit-gated by canon
   (deposit-is-consent, docs/STORAGE.md): a seeded pile item would break
   that rule. Personal starting gear breaks no rule — every villager
   already arrives with a generated kit.

## Fix to be tested

One mechanism, in src/js/game.js only (plus its call from newGame):

- `seedArmorWearer()`, called from `newGame` after goals are final
  (leadership fix-up can change a goal) and before play starts. If no
  staying (non-'escape'-goal) villager already carries bark or hide armor
  in items/stashed, up to THREE generated villagers' kits gain a bark
  armor, worn from day 0 via autoEquip. The grantees are picked
  deterministically in roster order (no RNG draw — generation streams
  unchanged): prefer a staying villager whose torso the bark improves,
  then any staying villager, then a leaving villager whose torso it
  improves, then any generated villager; villagers who already carry
  armor are excluded from the pool (they add nothing as grantees). The
  player is never a grantee. The pieces are those people's own starting
  gear and move afterward only through existing paths (wearing, spares
  flow, armory pile). A flag `village.armorSeedVid` records the first
  grantee for instruments only. Three is the redundancy the 67703 trace
  demands: with three wearers, one dying or leaving early no longer
  vetoes the village, and home-knower days overlap the material window
  far more often. Three bark armors (protection 10, the lowest tier) sit
  inside natural variation — pilot villages already showed up to three
  wearers without any grant.
- Explicitly NOT changed: recipes, odds, cooldown, the wearing-is-
  knowledge rule, all gating files and thresholds (gating freeze stands),
  the cuirass (still unwearable, still teaches at dawn), pile semantics
  (still deposit-only), and no roster scan at decision time (this runs
  once at creation, before play — the craft and gear beats still read
  only home villagers, their own worn items, and the communal pile, per
  the perception law).

## Band (judged)

- Seeds: 67801–67812 (FRESH — never used by fixall-armor, so the band
  cannot be tuned to the diagnosed seeds; the 67701–67712 scratch band
  is reported alongside as a diagnostic, not judged).
- Policy: leadfeast, via AD.armedFor + AV.armedFor (same stack as fixall;
  with no ARMORVILLAGE flag in this run the AV layer is inert
  delegation, so the effective stack is leadfeast + armorydrive).
- Horizon: 180 days, death-aware.
- Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1 — and deliberately NO ARMORVILLAGE flag.
  This is the live-play condition.
- Script: scripts/measure-build-armor.js (port of the fixall instrument
  plus setup snapshot, staying-knower days, first attempt/craft/knower
  days). Output: evidence/2026-10-29/build-armor-band-confirm.json.
- Instrument note (stated before the run, not after):
  scripts/balance-panel.js is NOT the judge for this band, for the same
  reason as fixall round 3: its contract contains no NPC armor-craft
  metric, and its policies are not the leadfeast armor stack. Snapshot
  knower-days undercount transient home windows (fixall 67709); the
  SEEDING bar below therefore counts attempts as proof of a home knower
  (an attempt can only fire for a home knower with materials on hand).

## Bars (binding — GO for merge only if ALL hold)

- S1 SEEDING: ≥10/12 seeds show a home knower in the run
  (knowersDays > 0 OR attempts > 0 — attempts prove a home knower
  existed even when snapshots missed the window).
- C1 attempts > 0 on ≥9/12 seeds (same bar as fixall confirm C1).
- C2 crafts ≥ 1 on ≥8/12 seeds (same bar as fixall confirm C2).
- G1 guardrail, starvation: starvation deaths ≤ 2× the fixall pilot
  before-band share (3/332 = 0.90%, so ≤ 1.80% of confirm deaths).
- G2 guardrail, no new harm: no death-cause kind absent from the fixall
  pilot before-band exceeds 10% of confirm deaths, AND total deaths per
  survival-day ≤ 1.25× the fixall confirm rate (546 deaths / 1763
  survival-days = 0.310/day, so ≤ 0.387/day) — the "wall not worse"
  check: seeding adds protection, it must not cost survival.
- Conversion-among-opportunity is REPORTED, not separately barred:
  attempts and crafts among S1 seeds (fixall proved conversion at 6/6
  attempts / 4/6 crafts among opportunity villages; C1/C2 already judge
  breadth, and a separate opportunity bar would re-score the same
  villages).

## Closeout (after the verdict — not bars)

- Proof tests: scripts/test-fixall-armor.js (32/32 on the rebased base)
  and scripts/test-build-armor-seed.js (38/38: synthetic grant / cap-at-
  three / no-grant / escape-only / preference cases, the staying-wearer
  floor on all 18 seeds after setup + one gear day, determinism) re-run
  on the final branch tip.
- scripts/check.js --quick on the final branch tip (fixall's 6
  pre-existing failures are the standing baseline; any NEW failure
  blocks landing and is reported, not waived).
- Main tree clean at closeout; nothing merged to master by this run
  except via --ff-only merge to local master (no push, no version bump,
  no live verification — the ship loop owns those).
