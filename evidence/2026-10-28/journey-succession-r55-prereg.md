# Journey succession r55 — SUCCESSOR RELATIONSHIPS + HISTORY CARRYOVER (lane B, pre-registration 2026-10-28, written before any run)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r54's documented leftover — the item-5 feel question r54 did
NOT measure: "relationships and personal history — whether the successor's
friendships, rivalries, and deeds-as-NPC carry into bearer life the way
items/knowledge/skills do" — and measures it on master BEFORE tackle-succession
lands its build. Instrument only, zero src/js changes. If blanks are found,
they are documented for tackle-succession, not fixed here: a competing Lane B
succession change would collide with the workstream that owns this item
(the same no-compete decision as r54).

## The question

At the moment the mantle passes, and through the 45 days after, what does
the new bearer carry of their own social life?

1. BONDS: the village bond ledger (village.bonds, keyed "a|b", {v, depth})
   — which bonds involving the successor exist before the death, and are
   the same keys still there, with the same v/depth, at handoff, d+14, and
   window end? Do bonds involving the DEAD bearer linger in the ledger
   after death (phantom friendships), or are they pruned?
2. GROUPS / CONFLICTS / GRIEVANCES: is the successor still in the same
   village.groups, still party to the same village.conflicts, still
   named in village.betrayal.grievances after takeover?
3. AFFINITY: Game.pairAffinity(successor, each living villager) — the
   number the world actually uses for the new bearer — pre vs post vs
   end. A bond that survives in the ledger but scores zero in affinity
   is not carried in any way that matters.
4. DEEDS-AS-NPC: the successor's own person entry (state.codex.people[vid]
   .depth.deeds, up to 12) and the village memory (state.codex.deeds, last
   40, vid-tagged) — how many deeds does the successor's entry hold
   before the death, and are they still there at handoff and at window
   end? (Read-only direct state reads; the driver never calls
   personDepth(), which creates a depth record when missing.)
5. VOICE: in driven conversations with the successor's strongest-bond
   living partner after takeover, does the partner's talk recognize the
   bond (close-read naming, warmth, shared grief for the predecessor),
   or does the successor meet a stranger's script?

## Instrument (r54 driver + REL additions)

- relSnap(Game): all village.bonds entries (key, partner first names, v,
  depth), village.groups membership lists, village.conflicts (parties,
  tension, resolved), village.betrayal.grievances (by/against/kind/
  severity/day), state.codex.deeds rows (vid first name, type, text, day),
  state.codex.people[vid].depth.deeds per living villager (count + texts,
  null when no person entry exists — never created by the read), and
  pairAffinity(newId-or-each-villager, partner) scores. All reads guarded;
  a failed read yields an empty list / null, never a throw.
- Snapshots: relPre (morning before the death day, same cadence as
  lastPre — organic seeds carry the up-to-a-day lag caveat, named);
  relPreDeath (fresh snapshot immediately before a scripted playerDeath,
  same-day, no lag); relPost (post-handoff); relD14 (first ledger
  checkpoint at d+14); relEnd (window end). Chain mantles re-snapshot
  relPost for the new bearer only if the chain bearer is the window's
  bearer at that point — otherwise the chain is noted, not re-scored.
- Convos: the existing top-2-by-trust driven convos at d+3/7/14/30/45
  are kept unchanged (carried metrics feed on them). ADDED: at d+3 and
  d+14, one driven convo with the successor's strongest-bond living
  partner from relPost (highest depth, then v), when that partner is
  not already among the top-2 — filed as a bond transcript so the
  people check can sense-read it separately.
- No game change. No gating, deedGate, scale, stage, readiness, or
  table-price code is touched (gating freeze, Steve 2026-10-27 16:53).

## Seeds, regime, policy

Fresh band 26121–26125 (no prior evidence file carries these seeds),
competent policy, POST_DAYS=45, same mixed regime as r53/r54:
26121–26122 EARLY_KILL_DAY=5 (scripted day-5 kills), 26123–26125
EARLY_KILL_DAY=40 (mature staging aspiration; organic pre-emption
honored, per r50–r54).

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- REL-READABLE (binds): a full REL snapshot (bonds + groups/conflicts/
  grievances + codex deeds + person deeds + affinity) on ≥4/5 seeds, OR
  successor-side readable on every seed with organic partiality named.
  A seed with neither side readable is a NO-GO on the instrument, not
  on the game.
- REL-BONDS (reported, NOT scored): per seed, successor bonds pre /
  post / d+14 / end (count, top partner + v/depth at each point,
  survived keys), dead-bearer bonds remaining post / end (phantom
  count), groups/conflicts/grievances retained counts.
- REL-DEEDS (reported, NOT scored): per seed, successor person-deed
  count pre / post / end, codex-deed rows for the successor pre / post
  (end rows are roll-off-prone under the 40-row cap and are reported
  with that caveat, never scored as loss).
- REL-VOICE (reported, NOT scored): bond-partner transcripts
  sense-read; a partner who does not recognize a depth>=2 bond is a
  documented seam, not a scored failure — the ledger read (depth>=2)
  is the game's own "close" definition (convoTopics.js), so the check
  is whether talk follows the ledger.
- CARRIED REGRESSION (binds, r54 bars unchanged): SCRIPT 2/2 young;
  MATURE staging scripted-or-organic honored; V1 snapshot PASS-fired
  on snapshot seeds; C1v3 0 missing; W1d-tightened pooled ≥ 1/2;
  S1 0 missing bearerDeltaExact; MG2v2 0 violations; M3v2b ≥ 2 on
  ≥ 4/5 seeds; M1/M4 hold; chain mantles all cause-known.

## What would count as an interesting finding

- A successor's bonds present before death and absent at handoff
  (ledger wipe on takeover).
- Dead-bearer bonds still in the ledger at window end with live
  partners (phantom friendships the close-read must then dodge).
- A depth>=2 bond whose partner talks to the successor as a stranger.
- A successor with a lived NPC life (deeds recorded pre-death) whose
  person entry is empty or closed at handoff.
- A successor whose pairAffinity to their best friend drops to the
  frozen-group baseline at takeover while the bond ledger still shows
  the bond (ledger/affinity split).

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (r54 prereg).
Bond rules are betrayal.js header (bonds form in run, +6/pair/day cap,
no bonds with the dead/gone); the close-read definition is
convoTopics.js (ledger depth >= 2 = close, depth >= 1 = live). No canon
is invented here: the run reports what the machinery does.
