# Design Methodology — Fiction-First (Steve 2026-10-14)

Steve's critique (2026-10-14): *"Why does phase blade mean hogtie costs no rope? These all seem like weak places to start. Need to reassess whole foundations of ability system. Why does the knife have anything to do with sand? Gear changing abilities should be one of our least frequent levers. Gear is more likely to grant another type of action in certain scenarios. Need to consider deeply not just knee jerk for content. How to adopt a better methodology around our development to base things on?"*

## The failure

The ability coherency rework (commits 3545883e, cfd620c4) generated 10 build-arounds and 4 gear rewrites quickly. Most fail the Three Whys:

- "Why does phase blade remove rope cost?" → "It phases" → "Why does phasing remove rope?" → *silence.* A phasing blade would be WORSE at knots.
- "Why does hardlight extend sand blindness?" → "Refraction" → "Why does refraction extend blindness?" → *clever-sounding silence.*
- "Why does Blood Frenzy stack damage?" → "Frenzy builds" → "Why?" → *it's just a game mechanic with a fiction coat.*

This is **knee-jerk content**: mechanics first, fiction backfilled. It produces systems that feel arbitrary because they ARE arbitrary.

## The methodology: Fiction-First

### 1. The Three Whys

For any mechanic, ask "why?" three times. If you reach "because game design" before the third why, cut it.

PASS: "Why does the spear pin on crit?" → "Spears impale" → "Why does impaling root?" → "It's physically stuck through them" → "Why does that matter?" → "You control where it stands." Three whys, all fiction.

FAIL: "Why does the knife extend sand?" → "Hardlight refracts" → "Why does that extend blindness?" → ...

### 2. Category Honesty

Alien abilities and human gear are different ontological things (Steve's canon: abilities are System-granted magic; gear is human tools with backstories). They interact at the **action level** — what you DO with both together — not by one rewriting the other's nature.

- RIGHT: Pocket Sand + machete → Shattering Blow (you blind them, THEN the machete finds seams — two actions composing)
- WRONG: Machete rewrites Shove (the tool changes what your body does — category confusion)

### 3. Rarity Discipline (Steve's principle)

"Gear changing abilities should be one of our least frequent levers."

If something should be rare, **don't build a system for it.** The 4 named weapon-ability synergies are the right frequency: specific, memorable, exceptional. A generic `abilityHooks` system makes the exceptional routine — which is why all 4 rewrites felt arbitrary. **Cut the system. Keep the exceptions.**

### 4. One Deep Beat

Prototype ONE interaction. Playtest it until it's fun. Then consider the second. Ten shallow mechanics are worse than one deep one. The build-arounds were built 10-at-once, zero playtested — that's the knee-jerk pattern.

### 5. The Plain Sentence Test

Explain the mechanic in one sentence using only fiction terms. If you need game terms (stacks, triggers, procs, multipliers), it's not ready.

- PASS: "The spear pins what it crits because spears go through things."
- FAIL: "Blood Frenzy grants +10% damage per consecutive hit stacking to +80%."

## What survives the rework

**Architecture (sound, keep):**
- Role classification (enabler/payoff/support) — analytical, not content
- Offer steering toward held paths — system, not content
- Path colors, slot roles — UI, not mechanics
- Codex witnessed synergies — discovery, not content

**Content (needs fiction-first rebuild):**
- 10 build-arounds: keep the SLOTS, rewrite the FICTION. Each must pass Three Whys.
- 4 gear abilityHooks: CUT the system. The 4 named synergies (Shattering Blow etc.) are the model — specific, action-level, rare.
- 3 relic enhancements (Blood-Bonded etc.): review each against Three Whys.

## The process going forward

1. No mechanic without a fiction paragraph first. The paragraph comes before the JSON.
2. Three Whys on every new mechanic, documented in the commit.
3. One prototype, playtested, before the second.
4. Rare stays rare: no systems for exceptions.
5. When in doubt, cut. A smaller coherent system beats a larger arbitrary one.
