// @ontology
// system: nomad-scenes
// description: Trails, reunion scenes, and the ending for The Long Way Home (docs/WORLD-REGIONS.md §6, Steve 2026-10-14: "Expedition is leaving your village as a nomad to find remaining family. That should be another bonus ending."). Per-kin trails sharpen from vague (continent) to named (region) only as earned — keepsake bond L2+ names it, road encounters sharpen a step. Four reunion fates (alive/changed/dead/moved) as real scenes in spare second person. The ending composes light ("We were never lost; we were just far apart.") or dark (the village left behind fell) from Game.nomad.endingData(). Road state, legs, and loss live in nomad.js (sibling stream); this module owns scenes only.
// provides:
//   - trailFor(kinName, ownerId?) -> {kinName, relation, level, text, regionKnown} | null
//   - sharpenTrail(kinName, source, ownerId?) -> {ok, level, text} | {ok:false, reason}
//   - reunionScene(kinName, fate, ownerId?) -> {fate, title, lines, outcome, choices?} (also says the lines)
//   - changedChoices(kind, kinName) -> [{id: 'ask'|'leave'|'fight', label}] — the three real choices at a 'changed' reunion of the bearer's own kin
//   - choiceLines(kind, choice, kinName) -> [lines] — narration for a resolved ASK or LEAVE (FIGHT is fought in nomad-drive.js)
//   - playEnding(data) -> {moral, title, lines} (also says the lines)
// consumes:
//   - worldKin(), worldKinEntry(), worldRegionName(), hearOfRegion(), regionDef() (world.js)
//   - keepsakeKinPerson(), keepsakeLevel(), wornKeepsakes() (keepsakes.js)
//   - state, say(), vpOf(), mulberry32
//   - Game.nomad.endingData() (nomad.js, sibling stream; defensive — playEnding takes data)
// rules:
//   - knowledge_gated: a trail never names a region the village hasn't earned; level 0 is continent-only (code: trailFor, sharpenTrail)
//   - keepsake_names_region: a worn keepsake of that person at bond L2+ names the region (code: sharpenTrail, WORLD-REGIONS.md §6)
//   - no_fabricated_history: scenes use only lifeseed/world facts — name, relation, hometown, workplace, fate line, region (code: reunionScene, kinFacts)
//   - deterministic_fate: the 'changed' subtype derives from a seeded hash of the kin name, never Math.random (code: changedKind)
//   - member_perspective: a party member's reunion is narrated in third person from their perspective — their voice, their choice beats — never the bearer's second person; the member decides changed-choices by a seeded hash (code: reunionScene, memberDecide; nomad-drive.js applies the outcomes)
//   - real_choice: a 'changed' reunion of the BEARER's own kin always presents exactly ASK / LEAVE / FIGHT; labels are kind-specific, never knowledge-leaking (code: changedChoices)
(function () {
  'use strict';
  const S = globalThis.Scattering = globalThis.Scattering || {};
  const Game = S.Game;
  if (!Game) return;

  function warn(msg) { try { console.warn('[nomad-scenes] ' + msg); } catch (e) {} }

  const CONTINENTS = {
    north_america: 'North America', south_america: 'South America',
    europe: 'Europe', africa: 'Africa', asia: 'Asia', oceania: 'Oceania',
  };

  function hashStr(s) {
    let h = 2166136261 >>> 0;
    const str = String(s || '');
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }

  function nsState() {
    const st = Game.state || {};
    st.nomadScenes = st.nomadScenes || { trails: {} };
    st.nomadScenes.trails = st.nomadScenes.trails || {};
    return st.nomadScenes;
  }

  // kinFacts(name, ownerId): the true facts about a scattered kin — world
  // entry plus lifeseed person and lifeseed-level hometown/workplace.
  // Everything a scene may say must come from here. ownerId narrows to the
  // seeking villager's kin (party members' reunions); null keeps the
  // historical preference for the bearer's own kin.
  function kinFacts(name, ownerId) {
    const st = Game.state;
    if (!st || !st.world) return null;
    const kins = (st.world.kin || []).filter(k => k.name === name && k.fate === 'scattered');
    if (!kins.length) return null;
    // Prefer the seeker's own kin; fall back to the bearer's, then any.
    const entry = (ownerId && kins.find(k => k.owner === ownerId)) ||
      kins.find(k => k.owner === Game.villagerId) || kins[0];
    let person = null, hometown = null, workplace = null;
    try {
      const vp = Game.vpOf ? Game.vpOf(entry.owner) : null;
      const ls = vp && vp.lifeseed;
      if (ls) {
        person = (ls.people || []).find(p => p.name === name) || null;
        hometown = ls.hometown || null;
        workplace = ls.workplace || null;
      }
    } catch (e) { warn('kinFacts lifeseed: ' + e.message); }
    let region = null;
    try { region = entry.region && Game.regionDef ? Game.regionDef(entry.region) : null; } catch (e) { warn('kinFacts region: ' + e.message); }
    return { entry, person, hometown, workplace, region,
      relation: entry.relation || (person && person.relation) || 'kin',
      fateLine: (person && person.fate) || 'is somewhere out there' };
  }

  function firstName(n) { return String(n || '').split(' ')[0] || 'them'; }

  function wseed() {
    try { return ((Game.map && Game.map.worldSeed) >>> 0) || 1; } catch (e) { return 1; }
  }

  // personName(id): a villager's name for third-person road narration
  // (party members' reunions are their scenes, not the bearer's).
  function personName(id) {
    try {
      const rc = ((Game.state.village || {}).rosterChars || {})[id];
      if (rc && rc.name) return rc.name;
    } catch (e) { warn('personName roster: ' + e.message); }
    try {
      const d = (Game.data.villagers || []).find(x => x.id === id);
      if (d && d.name) return d.name;
    } catch (e) { warn('personName data: ' + e.message); }
    try {
      const vp = Game.vpOf ? Game.vpOf(id) : null;
      if (vp && vp.name) return vp.name;
    } catch (e) { warn('personName vp: ' + e.message); }
    return 'a companion';
  }

  // memberDecide(owner, name, kind, choices): the deterministic choice a
  // party member makes at their own changed-reunion — seeded hash over the
  // seeker, the kin, and the situation, never Math.random. The bearer
  // witnesses; the member decides.
  function memberDecide(owner, name, kind, choices) {
    const ids = choices.map(c => c.id);
    if (!ids.length) return null;
    return ids[hashStr('member-choice|' + wseed() + '|' + owner + '|' + name + '|' + kind) % ids.length];
  }

  function trailLevel(name) {
    const t = nsState().trails[name];
    return t ? (t.level | 0) : 0;
  }

  // The current clue text for a trail level. Level 0 never names the
  // region; level 1 narrows; level 2 names it. ownerName shifts the
  // possessive: the bearer's own trail is "your brother"; a party member's
  // trail is theirs ("Ash's brother") — the bearer knows the quest because
  // the seeker told them on the road.
  function trailText(facts, level, ownerName) {
    const rel = facts.relation, fn = firstName(facts.entry.name);
    const region = facts.region;
    const cont = region && CONTINENTS[region.continent] ? CONTINENTS[region.continent] : 'somewhere on Earth';
    const whose = ownerName ? `${ownerName}'s ${rel}` : `Your ${rel}`;
    const base = `Somewhere in ${cont}. ${whose}, ${facts.entry.name} — ${facts.fateLine}.`;
    if (level <= 0) return base;
    const neighbors = (region && region.neighbors) || [];
    let narrow = '';
    if (neighbors.length && Game.worldRegionName) {
      const nb = Game.worldRegionName(neighbors[hashStr(facts.entry.name) % neighbors.length]);
      narrow = ` Word on the road narrows it: travelers speak of ${nb}, and ${fn} was headed that way.`;
    } else if (facts.hometown) {
      narrow = ` Word on the road narrows it: someone remembers ${fn} asking after the road out of ${facts.hometown}.`;
    } else {
      narrow = ' Word on the road narrows it: further than you hoped, closer than you feared.';
    }
    if (level === 1) return base + narrow;
    // Level 2: the region has a name now.
    const rname = Game.worldRegionName ? Game.worldRegionName(region.id) : region.id;
    return base + narrow + ` And now the trail has a name: ${rname}.`;
  }

  const methods = {
    // trailFor(kinName, ownerId?): the current, earned clue for one scattered kin.
    trailFor(kinName, ownerId) {
      try {
        const facts = kinFacts(kinName, ownerId);
        if (!facts) return null;
        const level = trailLevel(kinName);
        const reg = (((Game.state || {}).world || {}).regions || {})[facts.entry.region] || {};
        const ownerName = (ownerId && ownerId !== Game.villagerId) ? personName(ownerId) : null;
        return {
          kinName, relation: facts.relation, level,
          text: trailText(facts, level, ownerName),
          regionKnown: !!reg.known,
          regionId: level >= 2 ? facts.entry.region : null,
        };
      } catch (e) { warn('trailFor: ' + e.message); return null; }
    },

    // sharpenTrail(kinName, source, ownerId?): earn one step of the trail.
    // source: 'keepsake' (worn, L2+), 'villager', 'survivor', 'broadcast'.
    sharpenTrail(kinName, source, ownerId) {
      try {
        const facts = kinFacts(kinName, ownerId);
        if (!facts) return { ok: false, reason: 'no-trail' };
        const valid = { keepsake: 1, villager: 1, survivor: 1, broadcast: 1 };
        if (!valid[source]) return { ok: false, reason: 'bad-source' };
        const ns = nsState();
        const t = ns.trails[kinName] || (ns.trails[kinName] = { level: 0, sharpenedBy: [] });
        if (source === 'keepsake') {
          // WORLD-REGIONS.md §6: a worn keepsake of that person at L2+
          // names the region.
          let ok = false;
          try {
            const worn = Game.wornKeepsakes ? Game.wornKeepsakes() : [];
            for (const it of worn) {
              const p = Game.keepsakeKinPerson ? Game.keepsakeKinPerson(it) : null;
              if (p && p.name === kinName && Game.keepsakeLevel && Game.keepsakeLevel(it) >= 2) { ok = true; break; }
            }
          } catch (e) { warn('sharpenTrail keepsake: ' + e.message); }
          if (!ok) return { ok: false, reason: 'no-keepsake' };
          t.level = 2;
          if (!t.sharpenedBy.includes('keepsake')) t.sharpenedBy.push('keepsake');
        } else {
          if (t.sharpenedBy.includes(source)) return { ok: false, reason: 'already' };
          t.sharpenedBy.push(source);
          t.level = Math.min(2, t.level + 1);
        }
        if (t.level >= 2 && facts.entry.region && Game.hearOfRegion) {
          // KNOWER LEDGER (2026-10-29): the trail's owner is the knower
          // who learned the region — not the village at large.
          try { Game.hearOfRegion(facts.entry.region, 'trail', { knowerId: ownerId || Game.villagerId }); } catch (e) { warn('hearOfRegion: ' + e.message); }
        }
        const ownerName = (ownerId && ownerId !== Game.villagerId) ? personName(ownerId) : null;
        const out = { ok: true, level: t.level, text: trailText(facts, t.level, ownerName) };
        return out;
      } catch (e) { warn('sharpenTrail: ' + e.message); return { ok: false, reason: 'error' }; }
    },

    // changedKind(name, ownerId?): deterministic subtype for the 'changed' fate.
    // Salted by the seeker so a party member's kin never shadows the
    // bearer's on the same name; the bearer's own formula is unchanged.
    changedKind(name, ownerId) {
      const kinds = ['leads', 'ascended', 'hostile'];
      const salt = (ownerId && ownerId !== Game.villagerId) ? ownerId + '|' : '';
      return kinds[hashStr('changed|' + salt + name) % kinds.length];
    },

    // changedChoices(kind, kinName): the three real choices at a 'changed'
    // reunion — ASK / LEAVE / FIGHT, normalized across all changed kinds
    // (Steve 2026-10-15: the road default of walking on is the LEAVE choice,
    // narrated honestly). Labels are kind-specific but reveal nothing the
    // party couldn't know.
    changedChoices(kind, kinName) {
      const fn = firstName(kinName);
      let ask = 'Ask ' + fn + ' what happened';
      let leave = 'Leave ' + fn + ' be, and walk on';
      if (kind === 'leads') {
        ask = 'Ask ' + fn + ' to come';
        leave = 'Leave ' + fn + ' to the village';
      } else if (kind === 'ascended') {
        ask = 'Speak a while, then go';
        leave = 'Let the shining thing be';
      } else { // hostile
        ask = 'Demand an answer';
        leave = 'Back away. Keep walking.';
      }
      return [
        { id: 'ask', label: ask },
        { id: 'leave', label: leave },
        { id: 'fight', label: 'Force it — a real fight' },
      ];
    },

    // choiceLines(kind, choice, kinName): narration for a resolved ASK or
    // LEAVE at a 'changed' reunion. FIGHT is fought in the driver
    // (nomad-drive.js fightKin) and narrated there from the real outcome.
    // The NPC wants something in every scene; each ends resolved, planted,
    // or owed — never a filler loop.
    choiceLines(kind, choice, kinName) {
      try {
        const facts = kinFacts(kinName);
        const fn = firstName(kinName);
        const rel = facts ? facts.relation : 'kin';
        const L = [];
        if (choice === 'ask') {
          if (kind === 'leads') {
            L.push('You ask ' + fn + ' to come. ' + fn + ' looks at the gardens, the watch, the bell — then back at you, and the arithmetic is all over their face.');
            L.push('"I walked until the walking made sense," ' + fn + ' says. "Then I stopped, and people started depending on the stopping. I can\'t unbuild it. But I remember every face at that fire — including yours."');
            L.push('They press a pack of their stores into your hands. ' + fn + ' isn\'t coming. The blessing is: you understand.');
          } else if (kind === 'ascended') {
            L.push('You speak a while. The shining thing answers in plurals, in fragments — the System took the bright ones up, the way it takes everything it doesn\'t understand, and it almost understands ' + fn + '.');
            L.push('"WE REMEMBER BEING YOUR ' + String(rel).toUpperCase() + '," it says, softer now. "TELL THE BRIGHT VOICE WE ARE WELL. IT WORRIES, IN ITS WAY."');
            L.push('You leave lighter than you came. Some questions don\'t need the person back. They just need asking.');
          } else {
            L.push('You demand an answer. ' + fn + ' gives it — flat, tired, the way you set down something heavy: what they crossed, who they buried, what it cost to learn not to be found.');
            L.push('"You got your answer," ' + fn + ' says. "Now take your people and go, before I decide the answer was a mistake." The hand doesn\'t leave the weapon. Some doors open exactly once.');
          }
        } else {
          // leave: the road default, narrated honestly.
          if (kind === 'leads') {
            L.push('You leave ' + fn + ' to it. The bell rings behind you as the party shoulders packs — a sound like a door closing gently.');
          } else if (kind === 'ascended') {
            L.push('You let the shining thing keep its village of light. Behind you the air hums a half-step lower — then the road is just the road.');
          } else {
            L.push('You back away. ' + fn + '\'s hand stays on the weapon until the trees take you. The road keeps the secret, and you keep walking.');
          }
        }
        return L;
      } catch (e) { warn('choiceLines: ' + e.message); return []; }
    },

    // reunionScene(kinName, fate, ownerId?): play the reunion. Says the lines
    // and returns the structured outcome for the road driver (nomad.js).
    // fate: 'alive' | 'changed' | 'dead' | 'moved'. ownerId (a party
    // villager's id) makes it THEIR reunion — third person, their voice,
    // their choice beats — never the bearer's second person. The member's
    // changed-choices are decided by seeded hash (memberDecide); the bearer
    // only witnesses. Omitted ownerId (or the bearer's id) keeps the
    // historical second-person scenes byte-identical.
    reunionScene(kinName, fate, ownerId) {
      try {
        const seeker = (ownerId && ownerId !== Game.villagerId) ? ownerId : null;
        const facts = kinFacts(kinName, seeker);
        if (!facts) return null;
        const member = seeker ? personName(seeker) : null;
        const fn = firstName(kinName), rel = facts.relation;
        const rname = facts.region && Game.worldRegionName ? Game.worldRegionName(facts.region.id) : 'this place';
        const lines = [];
        const say = (l) => { lines.push(l); try { Game.say(l); } catch (e) { warn('say: ' + e.message); } };
        const title = `REUNION — ${kinName}`;
        let outcome = null, choices = null, extra = {};

        const markFound = () => {
          try {
            for (const k of ((Game.state.world || {}).kin || [])) {
              if (k.name === kinName && k.fate === 'scattered' && (!seeker || k.owner === seeker)) k.found = true;
            }
          } catch (e) { warn('markFound: ' + e.message); }
        };

        if (fate === 'alive') {
          if (member) {
            say(`◈ REUNION — ${rname} gives up its secret: ${member}'s ${rel}, ${kinName}.`);
            say(`${member} says the name before they're sure. ${fn} turns, stares, and then they're both moving. "${facts.hometown ? `You made it out of ${facts.hometown}. ` : ''}You actually made it."`);
            say(`${fn} walks with the party now, falling in beside ${member} like the road was always going to bring them here. One more mouth, one more pair of eyes on the dark. ${member} keeps checking over, like ${fn} might vanish. Nobody minds.`);
          } else {
            say(`◈ REUNION — ${rname} gives up its secret: your ${rel}, ${kinName}.`);
            say(`You say the name before you're sure. ${fn} turns, stares, and then you're both moving. "${facts.hometown ? `You made it out of ${facts.hometown}. ` : ''}You actually made it."`);
            say(`${fn} walks with the party now. The road is one person less lonely, which is to say: one person more fed, one more mouth, one more pair of eyes on the dark. You'd trade none of it.`);
          }
          markFound();
          outcome = 'joined';
          extra.joined = kinName;
        } else if (fate === 'changed') {
          const kind = this.changedKind(kinName, seeker);
          extra.changedKind = kind;
          if (kind === 'leads') {
            const normChoices = this.changedChoices(kind, kinName);
            if (member) {
              say(`◈ REUNION — ${kinName} is not lost. ${fn} leads a village here in ${rname} — gardens, a watch, a bell.`);
              say(`"${fn}?" ${member} says, and the leader's face does something complicated. "You walked all this way." Not a question. ${fn} has a village to keep. ${member} has a road.`);
              const decision = memberDecide(seeker, kinName, kind, normChoices);
              extra.decision = decision;
              choices = null; // decided: the member chose; no one is left to tap
              if (decision === 'ask') {
                say(`${member} asks. ${fn} looks at the gardens, the bell, the people who depend on the bell — and walks away from all of it, toward the road. Some choices you don't get to unmake.`);
                outcome = 'joined';
                extra.joined = kinName;
              } else if (decision === 'leave') {
                say(`${member} stays. ${fn}'s village has room for one more, and the road has one fewer. The party says its goodbyes at dawn, and means them.`);
                outcome = 'stayed';
                extra.stayed = member;
              } else {
                say(`${member} doesn't ask — doesn't even slow down. "${fn}," ${member} says, "you don't get to keep them AND me." It comes to blows before anyone can stop it.`);
                outcome = 'fight';
              }
            } else {
              say(`◈ REUNION — ${kinName} is not lost. ${fn} leads a village here in ${rname} — gardens, a watch, a bell.`);
              say(`"${fn}?" you say, and the leader's face does something complicated. "You walked all this way." Not a question. ${fn} has a village to keep. You have a road.`);
              say(`The choice sits between you, honest and unsolvable: ask ${fn} to leave it all, or leave ${fn} to it.`);
              outcome = 'choice';
              choices = this.changedChoices(kind, kinName);
            }
          } else if (kind === 'ascended') {
            const normChoices = this.changedChoices(kind, kinName);
            if (member) {
              say(`◈ REUNION — ${kinName} is here, and is not. The System took ${fn} up the way it takes the bright ones — ascended, shining at the edges, speaking in the plural.`);
              say(`"WE REMEMBER BEING THEIR ${rel.toUpperCase()}," ${fn} says, and the voice is ${fn}'s the way a bell is a cup. "THE ROAD WAS KIND TO LET YOU COME THIS FAR."`);
              const decision = memberDecide(seeker, kinName, kind, normChoices);
              extra.decision = decision;
              choices = null; // decided: the member chose; no one is left to tap
              if (decision === 'ask') {
                say(`${member} speaks a while, person to whatever-this-is. ${fn} listens the way light listens. Then ${member} walks on.`);
                outcome = 'choice';
              } else if (decision === 'fight') {
                say(`${member} looks at the shining thing for a long moment — then raises a weapon. "Come back down," ${member} says. It doesn't. It comes to blows anyway.`);
                outcome = 'fight';
              } else {
                say(`${member} lets the shining thing keep its village of light, and walks on.`);
                outcome = 'choice';
              }
            } else {
              say(`◈ REUNION — ${kinName} is here, and is not. The System took ${fn} up the way it takes the bright ones — ascended, shining at the edges, speaking in the plural.`);
              say(`"WE REMEMBER BEING YOUR ${rel.toUpperCase()}," ${fn} says, and the voice is ${fn}'s the way a bell is a cup. "THE ROAD WAS KIND TO LET YOU COME THIS FAR."`);
              say(`You can speak a while, person to whatever-this-is. Or you can let the shining thing keep its village of light, and walk on.`);
              outcome = 'choice';
              choices = this.changedChoices(kind, kinName);
            }
          } else {
            const normChoices = this.changedChoices(kind, kinName);
            extra.hostile = true;
            if (member) {
              say(`◈ REUNION — ${member}'s ${rel}, ${kinName}, is alive — and does not want to be found. ${fn}'s hand is on a weapon before ${member} is in speaking range.`);
              say(`"Turn around." Not angry. Tired. Whatever ${fn} is surviving out here, it doesn't include ${member}.`);
              const decision = memberDecide(seeker, kinName, kind, normChoices);
              extra.decision = decision;
              choices = null; // decided: the member chose; no one is left to tap
              if (decision === 'fight') {
                say(`${member} doesn't back away. "Then we do this," ${member} says, and it comes to blows — for real, no ceremony.`);
                outcome = 'fight';
              } else {
                say(`${member} backs away, hands open. The road keeps the secret, and the party keeps walking.`);
                outcome = 'choice';
              }
            } else {
              say(`◈ REUNION — ${kinName} is alive, and does not want to be found. ${fn}'s hand is on a weapon before you're in speaking range.`);
              say(`"Turn around." Not angry. Tired. Whatever ${fn} is surviving out here, it doesn't include you.`);
              say(`You could force it — there is a fight in this, if you want it. Or the road keeps the secret, and you keep walking.`);
              outcome = 'choice';
              choices = this.changedChoices(kind, kinName);
            }
          }
          markFound();
        } else if (fate === 'dead') {
          if (member) {
            say(`◈ REUNION — ${rname}. A marker, weathered to the grain: ${kinName}. ${member}'s ${rel}.`);
            say(`No drama in it. Someone buried ${fn} properly — stones piled, the name spelled right. ${facts.fateLine.endsWith('.') ? facts.fateLine : facts.fateLine + '.'}`);
            say(`${member} sits a while. Nobody hurries them; the road knows what this costs. When they stand, something in their pack feels finished — the story of ${fn} has an ending now, and endings are a kind of keeping.`);
          } else {
            say(`◈ REUNION — ${rname}. A marker, weathered to the grain: ${kinName}. Your ${rel}.`);
            say(`No drama in it. Someone buried ${fn} properly — stones piled, the name spelled right. ${facts.fateLine.endsWith('.') ? facts.fateLine : facts.fateLine + '.'}`);
            say(`You sit a while. The road doesn't hurry you; it knows what this costs. When you stand, something in your pack feels finished — the story of ${fn} has an ending now, and endings are a kind of keeping.`);
          }
          // A keepsake of this person completes: it has an ending now.
          try {
            const all = [];
            const inv = ((Game.state.scholar || {}).inventory || []);
            for (const it of inv) all.push(it);
            for (const sl of Object.keys((Game.state.scholar || {}).equipped || {})) {
              const it = Game.state.scholar.equipped[sl];
              if (it) all.push(it);
            }
            for (const it of all) {
              const p = Game.keepsakeKinPerson ? Game.keepsakeKinPerson(it) : null;
              if (p && p.name === kinName && !it.nomadComplete) {
                it.nomadComplete = true;
                say(`The keepsake of ${fn} is complete now. It has an ending. It will not grow further, and it doesn't need to.`);
                extra.keepsakeCompleted = it.itemId || it.id || true;
                break;
              }
            }
          } catch (e) { warn('keepsake complete: ' + e.message); }
          markFound();
          outcome = 'grave';
        } else if (fate === 'moved') {
          if (member) {
            say(`◈ REUNION — not ${kinName}. But ${member} finds someone in ${rname} who saw ${fn} — ${member}'s ${rel}, passing through with a caravan, headed on.`);
            say(`Not a reunion. A direction. The trail doesn't end here — it sharpens. ${member} marks the map, shoulders the pack, and walks the way ${fn} went.`);
          } else {
            say(`◈ REUNION — not ${kinName}. But someone in ${rname} saw ${fn}: "Tall? ${rel === 'mother' || rel === 'father' ? 'Older, kind face?' : 'Young, quick?'} Passed through with a caravan, headed on."`);
            say(`Not a reunion. A direction. The trail doesn't end here — it sharpens. You mark the map, shoulder the pack, and walk the way ${fn} went.`);
          }
          // The trail continues, sharper.
          try { this.sharpenTrail(kinName, 'survivor', seeker); } catch (e) { warn('moved sharpen: ' + e.message); }
          outcome = 'trail-continues';
        } else {
          return null;
        }
        return { fate, kind: extra.changedKind || null, title, lines, outcome, choices, extra };
      } catch (e) { warn('reunionScene: ' + e.message); return null; }
    },

    // playEnding(data): the ending scene + epilogue. data = {foundKin,
    // villageLeft, daysOnRoad, partyIds, settled?} (Game.nomad.endingData()).
    playEnding(data) {
      try {
        const d = data || {};
        const found = Array.isArray(d.foundKin) ? d.foundKin : [];
        const vl = d.villageLeft || {};
        const dark = vl.fate === 'fell';
        const moral = dark ? 'dark' : 'light';
        const lines = [];
        const say = (l) => { lines.push(l); try { Game.say(l); } catch (e) { warn('say: ' + e.message); } };
        const days = d.daysOnRoad | 0;

        say('◈ THE LONG WAY HOME — the road ends.');
        if (found.length) {
          const names = found.slice(0, 3).map(e => (e && e.name) || e).join(', ') + (found.length > 3 ? `, and ${found.length - 3} more` : '');
          say(`You found them: ${names}. ${days} days of walking, and the world finally gave back what the sky took.`);
        } else {
          say(`You didn't find them all. ${days} days of walking, and some trails just go quiet. You stopped where the walking felt done.`);
        }
        if (d.settled) {
          say('You chose to stop. Not surrender — settlement. A new home, built on purpose this time, with the people the road gave you.');
        }
        if (dark) {
          const vname = vl.name || 'the village you left';
          say(`You have your family. And you know what it cost: ${vname} fell while you were gone. The ledger doesn't forgive it, and neither do you. That's the price, paid in full, and you'd pay it again — which is the worst part.`);
        } else {
          say('We were never lost; we were just far apart.');
        }
        // Party members' found kin in the epilogue.
        try {
          const st = Game.state || {};
          const pids = Array.isArray(d.partyIds) ? d.partyIds : [];
          const bits = [];
          for (const pid of pids) {
            if (pid === Game.villagerId) continue;
            const fk = ((st.world || {}).kin || []).filter(k => k.owner === pid && k.found && k.fate === 'scattered');
            if (fk.length) {
              let nm = pid;
              try { const ch = ((st.village || {}).rosterChars || {})[pid]; if (ch && ch.name) nm = ch.name; } catch (e) {}
              bits.push(`${nm} found ${fk.map(k => k.name).join(', ')}`);
            }
          }
          if (bits.length) say('The road gave back more than your own: ' + bits.join('; ') + '.');
        } catch (e) { warn('epilogue party: ' + e.message); }
        say(dark
          ? '◈ THE LONG WAY HOME — dark. Home, at a price.'
          : '◈ THE LONG WAY HOME — light. Home, at last.');
        return { moral, title: 'The Long Way Home', lines };
      } catch (e) { warn('playEnding: ' + e.message); return null; }
    },
  };

  Object.assign(Game, methods);
  Game.nomadScenes = {
    trailFor: (n, o) => Game.trailFor(n, o),
    sharpenTrail: (n, s, o) => Game.sharpenTrail(n, s, o),
    reunionScene: (n, f, o) => Game.reunionScene(n, f, o),
    changedKind: (n) => Game.changedKind(n),
    changedChoices: (k, n) => Game.changedChoices(k, n),
    choiceLines: (k, c, n) => Game.choiceLines(k, c, n),
    playEnding: (d) => Game.playEnding(d),
  };
})();
