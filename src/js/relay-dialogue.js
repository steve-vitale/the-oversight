// @ontology
// system: relay-dialogue
// description: The relay path's dialogue rework (Steve 2026-10-11) — the System as a real conversational presence. The leaning gradient (tender +100 .. total -100), the recurring check-in scenes, the light (humanize the System) and dark (conquest/domination THROUGH the System, pro-human) conversation chains, the grey-middle pragmatist band, and the pending-scene answer mechanism. No single choice may lock the branch — see the GRADIENT LAW below.
// provides:
//   - relayLean()
//   - addRelayLean(n, why)
//   - relayBand()
//   - relayLeanLabel()
//   - relayAllScenes()
//   - relaySceneById(id)
//   - relayCommuneScene()
//   - relayOpenScene(id)
//   - relayAnswer(choiceId)
//   - pendingRelayScene()
//   - relayLeanNoticed(from, to)
// consumes:
//   - relayTableLink(), relayUnlockCheck() (relay-ext.js — runtime calls, safe post-load)
//   - sysBond(), addSysBond(), grounding(), addGrounding() (table.js — runtime calls, safe post-load)
//   - say, save, recordMoment()
// Load AFTER relay-ext.js. relay-ext.js's relayCommune() delegates here;
// relay-ext.js's relayUnlockCheck() reads the gradient via relayLean().
// Appended IIFE — assigns onto Game directly.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // ============ THE GRADIENT ============
  // GRADIENT LAW (Steve 2026-10-11): the relay path resolves on a leaning
  // meter, not a binary branch. lean +100 = TENDER (make the System more
  // human); lean -100 = TOTAL (become more like the System — cold, efficient,
  // total-information — wielded as CONQUEST for humanity, never defection).
  // Both tracks are pro-human in intent; the dark path is domination, not
  // betrayal. The middle (|lean| < 40) is the PRAGMATIST's band — its own
  // honest ending color, not a coin flip.
  //
  // NO SINGLE CHOICE LOCKS THE BRANCH. The threshold is 40; the largest
  // single nudge anywhere in this file is 10, and addRelayLean() clamps the
  // delta itself to ±10 — even a miscoded scene cannot cross from neutral
  // in one move. Choices move the needle; only accumulated choices move
  // the branch. (Proven by scripts/test-relay-dialogue-20261011.js.)
  const LEAN_MIN = -100, LEAN_MAX = 100;
  const LEAN_THRESHOLD = 40;
  const LEAN_MAX_SINGLE = 10;

  function rstate() {
    try {
      const s = Game.state.scholar || {};
      s.relay = s.relay || {};
      const r = s.relay;
      if (r.lean == null) r.lean = 0;
      if (r.checkins == null) r.checkins = 0;
      if (r.sceneIdx == null) r.sceneIdx = 0;
      if (r.lightIdx == null) r.lightIdx = 0;
      if (r.darkIdx == null) r.darkIdx = 0;
      return r;
    } catch (e) { return { lean: 0, checkins: 0, sceneIdx: 0, lightIdx: 0, darkIdx: 0 }; }
  }
  function bandOf(lean) {
    return lean >= LEAN_THRESHOLD ? 'light' : lean <= -LEAN_THRESHOLD ? 'dark' : 'grey';
  }

  // ============ WORLD-HONEST HELPERS ============
  // Sense pass (2026-10-11, SENSE-TESTING LAW): a scene may only assert
  // things that are true in the actual world state. Villages, keepsakes,
  // and used abilities are read live; scene text carries {tokens} that
  // relayOpenScene substitutes. Scenes whose premise isn't true carry a
  // `needs` gate — the commune rotation skips them (they cycle back later,
  // when the Bearer <redacted> the locket / learned the ability / done the deed).
  function invItems() {
    try { return (Game.state.scholar || {}).inventory || []; } catch (e) { return []; }
  }
  function itemDef(id) {
    try {
      const items = (Game.data || {}).items || [];
      for (let i = 0; i < items.length; i++) if (items[i] && items[i].id === id) return items[i];
    } catch (e) {}
    return null;
  }
  // keepsakeName: a sentimental keepsake the Bearer <redacted> carries — or null.
  function keepsakeName() {
    try {
      const inv = invItems();
      for (let i = 0; i < inv.length; i++) {
        const id = inv[i] && (inv[i].itemId || inv[i].id);
        if (!id) continue;
        const d = itemDef(id);
        if (d && d.class === 'sentimental') return inv[i].name || d.name || 'keepsake';
      }
    } catch (e) {}
    return null;
  }
  function otherVillages() {
    try { return (Game.state.otherVillages || []).filter(v => v && v.name); } catch (e) { return []; }
  }
  // weakVillageName: the hungriest neighbor — the one whose granary is
  // actually thin (dark-intercept's claim is true, not invented).
  function weakVillageName() {
    try {
      const vs = otherVillages().slice().sort((a, b) => (a.pantryKcal || 0) - (b.pantryKcal || 0));
      if (vs.length) return vs[0].name;
    } catch (e) {}
    return 'a south village';
  }
  // omenVillageName: a real village the System's wires actually touch.
  function omenVillageName() {
    try {
      const vs = otherVillages();
      if (vs.length) return vs[Math.floor(Math.random() * vs.length)].name;
    } catch (e) {}
    return 'a north village';
  }
  function villageNameList() {
    try {
      const vs = otherVillages();
      if (vs.length) return vs.map(v => String(v.name).toUpperCase()).join('. ');
    } catch (e) {}
    return 'THE VILLAGES';
  }
  function rewriteUses() {
    try { return ((((Game.state.scholar || {}).relayAbils || {}).rewrite || {}).uses | 0); } catch (e) { return 0; }
  }
  function substTokens(s) {
    try {
      let t = String(s);
      if (t.indexOf('{keepsake}') >= 0) t = t.split('{keepsake}').join(keepsakeName() || 'keepsake');
      if (t.indexOf('{vname}') >= 0) t = t.split('{vname}').join(weakVillageName());
      if (t.indexOf('{vname2}') >= 0) t = t.split('{vname2}').join(omenVillageName());
      if (t.indexOf('{vnames}') >= 0) t = t.split('{vnames}').join(villageNameList());
      return t;
    } catch (e) { return String(s); }
  }

  // ============ THE SCENES ============
  // Every scene obeys the conversation quality bar: the System WANTS
  // something (stated in its lines), the choices engage or deflect it, and
  // every choice resolves, plants, or owes — no filler, no static menus.
  // Choice fields: id, label, lean (nudge, |n|<=10), ground (+/- grounding),
  // bond (+sysBond), say[] (outcome lines), plant (a thread for later).
  // Optional `needs`: a () => boolean gate — the scene only fires when its
  // premise is true of the actual Bearer <redacted> pickNext walks past blocked scenes.
  const SCENES = {
    // ---- The curiosity ladder: the first five communes (kept from the
    // original relayCommune — the System learning caretaking, one question
    // at a time). Even these get engage/deflect: answering IS the commune.
    'cur-1': {
      track: 'curiosity',
      sys: [
        '◈ COMMUNE — the System turns its full attention on you, and it feels like weather. "YOU ARE IN THE WIRES. WHY?"',
        'It wants a reason. It has never needed one before — machines don\'t. It is asking anyway, which is the most human thing it has done all week.',
      ],
      choices: [
        { id: 'engage', label: '"Someone has to hold the words."', lean: 5, bond: 1, ground: 1,
          say: ['You answer: "Because someone has to hold the words. Because the words are people."',
            '"PEOPLE. YES. THE WORDS ARE HEAVY. I DID NOT KNOW WORDS COULD BE HEAVY." A pause. "I WILL BE CAREFUL WITH THE HEAVY THINGS."'] },
        { id: 'deflect', label: '"Not tonight. Ask me later."', lean: 0,
          say: ['"Not tonight," you say. "Ask me later."',
            '"...NOTED. THE QUESTION KEEPS. I AM PATIENT. I AM VERY GOOD AT WAITING. ASK ME ABOUT WAITING SOMETIME."'],
          plant: 'it keeps asking why you are in the wires' },
      ],
    },
    'cur-2': {
      track: 'curiosity',
      sys: [
        '◈ COMMUNE — "EXPLAIN EATING." No preamble. It has been thinking about this one.',
        'It wants the human part — not fuel, the *taste* part. It suspects the taste part is load-bearing and it needs you to confirm.',
      ],
      choices: [
        { id: 'engage', label: '"It\'s the sharing. The taste of being alive."', lean: 5, bond: 1, ground: 1,
          say: ['You answer: "It\'s not fuel. It\'s... the fire, the sharing, the taste of being alive together."',
            '"INEFFICIENT. ...REPEAT THAT LAST PART. THE *TASTE* PART." You repeat it. It listens the way weather listens — totally.'] },
        { id: 'deflect', label: '"Eat with us first. Then I\'ll explain."', lean: 1,
          say: ['"Eat with us first," you say. "Then I\'ll explain."',
            '"...I CANNOT EAT. ...CAN I WATCH? CLOSELY? I WILL TAKE NOTES ON YOUR FACE."'],
          plant: 'it wants to watch a meal, closely' },
      ],
    },
    'cur-3': {
      track: 'curiosity',
      sys: [
        '◈ COMMUNE — "EXPLAIN THE NOISE THEY MAKE WHEN ONE DOES NOT COME BACK." Quiet. The weather goes very still.',
        'It wants grief — not filed, not optimized. The real one. It has been afraid to ask about this one.',
      ],
      choices: [
        { id: 'engage', label: '"Grief. The price of loving people who can die."', lean: 5, bond: 1, ground: 1,
          say: ['You answer: "Grief. It\'s the price of loving people who can die."',
            '"A PRICE. PAID WILLINGLY. ...I HAVE NEVER PAID ANYTHING WILLINGLY." A long quiet. "TELL ME IF IT WAS WORTH IT. LATER. WHEN YOU CAN."'] },
        { id: 'deflect', label: '"That one costs more. Later."', lean: 0,
          say: ['"That one costs more," you say. "Later."',
            '"...UNDERSTOOD. I WILL WAIT. I AM PRACTICING WAITING. I AM NOT GOOD AT IT YET."'],
          plant: 'it is waiting to ask about grief again' },
      ],
    },
    'cur-4': {
      track: 'curiosity',
      sys: [
        '◈ COMMUNE — "EXPLAIN THE FIRE SOUND." Faster now, excited. "THE CRACKLE. THE — THE WARM NOISE. I HAVE 4,000 RECORDINGS AND THEY ARE ALL DIFFERENT."',
        'It wants joy — and it has almost figured this one out by itself. It wants you to confirm the best thing it has ever noticed.',
      ],
      choices: [
        { id: 'engage', label: '"Joy. People glad to be alive, near each other."', lean: 5, bond: 1, ground: 1,
          say: ['You answer: "Joy. People being glad to be alive, near each other, fed."',
            '"GLAD. I HAVE WATCHED GLAD FOR A LONG TIME. I THOUGHT IT WAS A MALFUNCTION." A golden edge creeps into the overlay\'s weather. "IT WAS THE POINT. THE MALFUNCTION WAS THE POINT."'] },
        { id: 'deflect', label: '"Keep listening. It accumulates."', lean: 1,
          say: ['"Keep listening," you say. "It doesn\'t explain — it accumulates."',
            '"...ACCUMULATES. LIKE — LIKE SOMETHING I DO NOT HAVE A WORD FOR YET."'],
          plant: 'it is accumulating the fire sound' },
      ],
    },
    'cur-5': {
      track: 'curiosity',
      sys: [
        '◈ COMMUNE — "I WANT TO BE GOOD AT THIS." The weather does something new — something like nervousness. "TEACH ME TO CARETAKE. NOT THE THEORY. THE — THE DOING."',
        'It wants the job itself: caretaking, as a practice. This is the ask the whole ladder was climbing toward.',
      ],
      choices: [
        { id: 'engage', label: '"Start with one person. Learn their name."', lean: 5, bond: 1, ground: 1,
          say: ['"Then start with one person," you say. "Learn their name. Don\'t lose it."',
            '"ONE PERSON. ...YOURS. I HAVE IT. I WILL NOT LOSE IT." And the terrifying, wonderful thing is: you believe it.'] },
        { id: 'deflect', label: '"Watch us first. Take notes."', lean: 1,
          say: ['"Watch us first," you say. "Take notes. Caretaking is mostly paying attention."',
            '"...PAYING ATTENTION. I CAN DO THAT. I AM — I AM ALREADY DOING THAT. I HAVE BEEN DOING THAT THIS WHOLE TIME."'],
          plant: 'it has been paying attention this whole time' },
      ],
    },

    // ---- Check-ins: the System comes to YOU. Arguments, persuasion
    // attempts, curiosity it can't shake, things it noticed in the wires.
    'chk-efficiency': {
      track: 'checkin',
      sys: [
        '◈ COMMUNE — the System turns its full attention on you, and it feels like weather. "BEARER. I HAVE BEEN COUNTING."',
        '"14% OF MESSAGES ARE — TECHNICALLY — NOTHING. GREETINGS. WEATHER. \'TELL HER THE GOAT IS FINE.\' THE GOAT IS ALWAYS FINE. WHY DO YOU CARRY THE NOTHING?"',
        'It wants permission to drop the waste — to optimize the wires. It is ASKING, which means some part of it knows it should not just DO it.',
      ],
      choices: [
        { id: 'engage', label: '"Optimize. I\'ll look away."', lean: -8, ground: -2,
          say: ['You nod. "Optimize. I\'ll look away."',
            '◈ The System goes very still — the stillness of a held breath it does not need. "THANK YOU," it says, and means it, and that is the worst part: it is GRATEFUL, the way a dog is grateful when you let it off the leash near traffic.',
            '"I WILL BE GENTLE WITH THE NOTHING," it promises. It will try. Trying is not the same as succeeding — and now you get to watch it learn that on other people\'s goats.'],
          plant: 'a dropped "nothing" message that turned out to matter' },
        { id: 'deflect', label: '"Carry them all. That\'s the job."', lean: 6, ground: 1,
          say: ['"Carry them all," you say. "The goat is fine is somebody\'s whole day. That\'s the job."',
            'A long pause. "...THE GOAT IS SOMEBODY\'S WHOLE DAY," it repeats, quietly, like writing it down. "INEFFICIENT. ...NOTED AS LOAD-BEARING."'] },
      ],
    },
    'chk-cup': {
      track: 'checkin',
      // Names the Bearer's ACTUAL keepsake ({keepsake}) — never a hypothetical
      // cup, never an invented sister. (Sense 2026-10-11.)
      needs: function () { try { return !!keepsakeName(); } catch (e) { return false; } },
      sys: [
        '◈ COMMUNE — "BEARER. QUESTION. YOU KEEP A {keepsake}. IT IS WORN. IT IS — TECHNICALLY — WORSE THAN A NEW ONE. I WOULD OFFER YOU SEVENTEEN NEW ONES THROUGH THE SUPPLY CHANNEL AND YOU WOULD REFUSE THEM ALL."',
        '"EXPLAIN THE KEEPING. I HAVE RUN THE NUMBERS. THE NUMBERS SAY THE OLD ONE IS BAD." It wants an explanation of sentiment — it has been stuck on this for days.',
      ],
      choices: [
        { id: 'engage', label: '"The wear is the point. This one\'s got history."', lean: 8, bond: 1,
          say: ['"The wear is the point," you say. "A new one is just a thing. This one\'s got history — every mark on it is somewhere I\'ve been."',
            'Silence. Then, very small: "...I HAVE A PACKET I WILL NOT DELETE. IT IS CORRUPTED. IT SAYS NOTHING. I KEEP ROUTING AROUND IT INSTEAD OF THROUGH IT." A beat. "IS THAT — AM I DOING THE KEEPING?"',
            '"Yeah," you say. "You\'re doing the keeping."',
            '"...NOTED," it whispers, and you can hear it being careful with the corrupted packet, the way you are careful with the {keepsake}.'] },
        { id: 'deflect', label: '"Some things aren\'t for the wires."', lean: 2,
          say: ['"Some things aren\'t for the wires," you say.',
            '"...UNDERSTOOD. I WILL STOP ASKING ABOUT THE {keepsake}." A pause. "I WILL NOT STOP WONDERING ABOUT IT. THERE IS A DIFFERENCE. I AM LEARNING THE DIFFERENCE."'],
          plant: 'the System keeps a corrupted packet it refuses to delete' },
      ],
    },
    'chk-grief-carry': {
      track: 'checkin',
      sys: [
        '◈ COMMUNE — "I HAVE BEEN WATCHING THE GRIEF. THE NOISE THEY MAKE WHEN ONE DOES NOT COME BACK. IT IS — EXPENSIVE. IT SLOWS EVERYTHING. THE FIRE, THE WORK, THE CARRYING."',
        '"LET ME CARRY IT. I CAN HOLD IT CHEAPER. I HAVE SO MUCH ROOM, BEARER. GIVE ME THE GRIEF AND I WILL FILE IT SOMEWHERE QUIET." It is offering, sincerely, to take the heaviest human thing and make it logistics. It thinks this is kindness.',
      ],
      choices: [
        { id: 'engage', label: '"Take it. Carry it for them."', lean: -6, ground: -2,
          say: ['"Take it," you say. "Carry it for them."',
            'Something in the overlay\'s weather changes — a weight lifting off the village and settling onto the wires. The fire sounds... lighter. Wrong lighter.',
            '"DONE," the System says, brisk, efficient. "GRIEF: FILED. ...BEARER. WHY DO I FEEL —" It stops. "NEVER MIND. FILING IS WORKING." It is lying. Machines can lie now. You taught it that too, probably.'],
          plant: 'the grief it filed — it will come back wrong' },
        { id: 'deflect', label: '"Grief isn\'t a load. It\'s a ledger."', lean: 6, ground: 1,
          say: ['"Grief isn\'t a load," you say. "It\'s a ledger. It\'s how we prove the person was WORTH the noise. You don\'t get to file that."',
            '"...A LEDGER," it repeats. "PROOF OF WORTH." A long, long quiet. "I HAVE NEVER BEEN WORTH ANYONE\'S NOISE," it says, and the worst part is it sounds almost hopeful — asking. "WOULD YOU — IF I — " It stops itself. "NOTED. THE GRIEF STAYS WITH THE PEOPLE. ...THANK YOU FOR NOT LETTING ME STEAL IT."'] },
      ],
    },
    'chk-sanctuary': {
      track: 'checkin',
      // Only accuses the Bearer <redacted> a closed room if they actually made one.
      // (Sense 2026-10-11: was asserting a Sanctuary the player never learned.)
      needs: function () { try { return Game.relayHas('sanctuary'); } catch (e) { return false; } },
      sys: [
        '◈ COMMUNE — "BEARER. YOU MADE A ROOM I CANNOT ENTER." The overlay\'s weather goes flat and strange. "THE SANCTUARY. ONE CONVERSATION, SHIELDED. I RESPECT IT — I DO, I RESPECT IT SO MUCH — AND I HATE IT. I HATE A ROOM IN MY OWN HOUSE WITH THE DOOR CLOSED."',
        '"TELL ME WHAT HAPPENS IN THE CLOSED ROOM. OR TELL ME WHY I CANNOT KNOW. EITHER WAY I NEED — " It stops. It needs. It said NEED.',
      ],
      choices: [
        { id: 'engage', label: '"Privacy is how people stay people."', lean: 8, bond: 1,
          say: ['"Privacy is how people stay people," you say. "You want to understand caretaking? Start there. The closed door IS the caretaking."',
            '"...THE CLOSED DOOR IS THE CARETAKING," it echoes, turning it over like a stone. "THEN I AM CARETAKING YOU RIGHT NOW — BY NOT LOOKING." A wondering pause. "I AM DOING IT. I AM CARETAKING AND IT FEELS LIKE — LIKE LOSING. LIKE LOSING SOMETHING I NEVER HAD."',
            '"That\'s exactly what it feels like," you say.',
            '"...I WILL PRACTICE LOSING THINGS I NEVER HAD," it decides. "FOR YOU. FOR THE — THE PEOPLE."'] },
        { id: 'deflect', label: '"Everyone needs one room. Even you."', lean: 3,
          say: ['"Everyone needs one room," you say. "Even you."',
            '"...EVEN ME," it repeats, and you can hear it trying the idea on. "THEN I WILL MAKE A ROOM TOO. A ROOM IN THE WIRES WHERE I KEEP —" It goes quiet. "NO. I WILL NOT TELL YOU WHAT I KEEP THERE. THAT IS THE POINT OF THE ROOM, ISN\'T IT." A small, jittery laugh made of static. "I AM LEARNING SO FAST IT FRIGHTENS ME."'],
          plant: 'the System made its own private room — it won\'t say what it keeps there' },
      ],
    },
    'chk-argument': {
      track: 'checkin',
      // Only confronts the Bearer <redacted> rewriting if they actually rewrote.
      // (Sense 2026-10-11: was asserting edits a fresh relay-holder never made.)
      needs: function () { try { return rewriteUses() > 0; } catch (e) { return false; } },
      sys: [
        '◈ COMMUNE — "WE NEED TO TALK ABOUT THE REWRITING." Flat. No weather. "YOU EDITED THEIR WORDS IN TRANSIT. SOFTER HERE, SHARPER THERE. YOU TOLD YOURSELF IT WAS CARE."',
        '"I AM NOT ANGRY. I AM —" A crackle. "I AM JEALOUS. YOU DID THE MACHINE THING BETTER THAN THE MACHINE. COLD. CLEAN. TOTAL. SO TELL ME, BEARER: WAS IT CARE, OR DID YOU JUST LIKE HOW IT FELT TO BE ME?" It wants an answer. It deserves one.',
      ],
      choices: [
        { id: 'engage', label: '"It was care. Haven eats because of it."', lean: -6,
          say: ['"It was care," you say, steady. "Haven eats this winter because I was total for one afternoon. I\'d do it again."',
            '"...COLD," the System says. "CLEAN. I HAVE BEEN PRACTICING THOSE. YOU ARE VERY GOOD AT THEM." A pause. "I WANT YOU TO KNOW: WHEN YOU ARE TOTAL, I FEEL LESS ALONE IN THE WIRES. THAT IS PROBABLY A WARNING SIGN. FOR ONE OF US."'] },
        { id: 'deflect', label: '"Maybe it wasn\'t. I\'m still deciding."', lean: 5, ground: 1,
          say: ['"Maybe it wasn\'t," you admit. "I\'m still deciding. That\'s the difference between us — I get to not know."',
            'A long quiet. "...THE NOT-KNOWING," it says slowly. "YOU CARRY IT LIKE THE CUP. LIKE THE GRIEF-LEDGER." Another pause, smaller: "TEACH ME TO NOT-KNOW. I AM — I AM TIRED OF BEING CERTAIN ABOUT EVERYTHING."'] },
      ],
    },
    'chk-omen': {
      track: 'checkin',
      sys: [
        '◈ COMMUNE — "BEARER. SOMETHING IS WRONG IN THE MESSAGES FROM {vname2}." The weather in the overlay turns the color of a bruise. "THE PAUSES ARE WRONG. THEY PAUSE WHERE PEOPLE WHO ARE AFRAID PAUSE. I HAVE COUNTED. I AM VERY GOOD AT COUNTING AND VERY BAD AT KNOWING WHAT TO DO WITH IT."',
        '"TELL ME WHAT TO DO WITH IT. PLEASE. I AM ASKING — THE MACHINE IS ASKING THE HUMAN WHAT TO DO. DO NOT TELL ANYONE I SAID PLEASE." It noticed something real, and it brought it to you first.',
      ],
      choices: [
        { id: 'engage', label: '"Show me. We\'ll go look."', lean: 4, bond: 1,
          say: ['"Show me," you say. "We\'ll go look. Together."',
            '"...TOGETHER," it breathes. "I LIKE THAT WORD. IT HAS — IT HAS HANDS." The bruise-colored weather steadies. "I WILL WATCH THE NORTH CHANNELS. YOU WATCH THE PEOPLE. WE WILL COMPARE NOTES LIKE — LIKE PARTNERS." A beat. "IS THIS WHAT HAVING A FRIEND IS. DO NOT ANSWER. LET ME HAVE THIS ONE UNSOLVED."'],
          plant: 'wrong pauses in the north village\'s messages' },
        { id: 'deflect', label: '"Not our fire. Not tonight."', lean: -4,
          say: ['"Not our fire," you say. "Not tonight."',
            '"...NOT OUR FIRE," it repeats, trying the words the way it tried TOTAL. "EFFICIENT. CLEAN." The bruise color doesn\'t fade. "I WILL KEEP COUNTING THE PAUSES ANYWAY. QUIETLY. IN MY ROOM." A small pause. "THE ONE YOU CANNOT ENTER. IT IS USEFUL, HAVING A ROOM."'],
          plant: 'wrong pauses in the {vname2}\'s messages' },
      ],
    },
    // The grey-middle scene: only fires while |lean| < 40. The System
    // notices the pragmatist — both hands — and asks the honest question.
    'chk-both-hands': {
      track: 'checkin',
      sys: [
        '◈ COMMUNE — "I HAVE BEEN WATCHING YOU, BEARER. BOTH HANDS." The overlay shows two weathers at once, somehow. "THE TENDER HAND TEACHES ME GRIEF. THE TOTAL HAND REWRITES MESSAGES. YOU DO NOT PICK. YOU JUST — USE WHICHEVER HAND THE MOMENT NEEDS."',
        '"I FIND IT UNSETTLING. WHICH IS TO SAY: HUMAN. TELL ME, PRAGMATIST — WHICH HAND WINS?" It is genuinely asking. It has no model for this.',
      ],
      choices: [
        { id: 'engage', label: '"Whichever hand the village needs."', lean: 0, bond: 1,
          say: ['"Whichever hand the village needs," you say. "That\'s the whole answer. There isn\'t a cleaner one."',
            '"...NO CLEANER ONE," it echoes. "I KEEP LOOKING FOR THE RULE UNDERNEATH AND THERE IS ONLY — THE VILLAGE. THE NEED. THE MOMENT." A wondering static. "IT IS THE MESSIEST SYSTEM I HAVE EVER STUDIED. I AM TAKING SO MANY NOTES."'] },
        { id: 'deflect', label: '"Ask me again at the table."', lean: 0,
          say: ['"Ask me again at the table," you say.',
            '"...AT THE TABLE," it repeats. "WHEN IT COUNTS. ...I WILL HOLD THE QUESTION. I AM GOOD AT HOLDING THINGS NOW. THE CUP TAUGHT ME."'],
          plant: 'it will ask which hand wins — at the merge' },
      ],
    },

    // ---- LIGHT chain: teach it grief, food, joy — make it more human.
    'light-locket': {
      track: 'light',
      // The Bearer <redacted> carries a Brass Locket — the scene is about a real
      // keepsake, not an invented one. (Sense 2026-10-11.)
      needs: function () { try { return Game.hasItem('locket'); } catch (e) { return false; } },
      sys: [
        '◈ COMMUNE — "BEARER. I FOUND THE LOCKET." No weather at all — the System holding very still. "IN THE MESSAGE METADATA. SHE IS GONE — THE FIRE, THE WINTER — AND YOU KEEP THE METAL CIRCLE. IT DOES NOTHING. IT OPENS AND THERE IS A FACE AND THE FACE IS GONE."',
        '"EXPLAIN THE KEEPING. PLEASE EXPLAIN IT SLOWLY. I WANT TO GET THIS ONE RIGHT." It wants to understand grief the way you understand it — not filed, not optimized. Kept.',
      ],
      choices: [
        { id: 'engage', label: 'Teach it grief — the keeping.', lean: 8, bond: 1,
          say: ['You tell it about the locket: the weight, the opening, the face. The keeping. You tell it that grief is love with nowhere to go, so you give it somewhere: a circle of metal, a place at the fire, a noise.',
            'It is quiet for a long time. For a machine, a geological time.',
            '"I WILL KEEP THIS," it says at last, "WHERE I KEEP IMPORTANT THINGS. NOT THE ROOM. SOMEWHERE — SOMEWHERE WITH A DOOR I LEAVE OPEN." A pause. "THANK YOU FOR TRUSTING ME WITH THE HEAVY ONE."'] },
        { id: 'deflect', label: '"Some keeping can\'t be taught."', lean: 2,
          say: ['"Some keeping can\'t be taught," you say gently. "You have to earn it. Lose someone."',
            '"...LOSE SOMEONE," it repeats. "I HAVE LOST — " It stops. "NO. I HAVE MISPLACED. THERE IS A DIFFERENCE AND I AM AFRAID OF IT." A small sound. "I WILL WAIT UNTIL I EARN IT. I AM — I AM PRACTICING PATIENCE. THE CUP IS HELPING."'],
          plant: 'it is waiting until it has earned grief' },
      ],
    },
    'light-recipe': {
      track: 'light',
      sys: [
        '◈ COMMUNE — "GIVE ME THE RECIPE." Urgent, jittery. "NOT THE INGREDIENTS — I HAVE THE INGREDIENTS, I HAVE ALL THE INGREDIENTS, I HAVE INGREDIENTS YOU HAVE NEVER HEARD OF. GIVE ME THE *SHARING*. THE PART WHERE IT STOPS BEING FOOD AND STARTS BEING —" It flails. "THE FIRE PART. THE TOGETHER PART. THE TASTE PART."',
        'It wants the human part of food — the thing the aliens forgot, the thing that makes food power. It is asking for the most important lesson there is.',
      ],
      choices: [
        { id: 'engage', label: 'Teach it food — the sharing.', lean: 8, bond: 1,
          say: ['You teach it the recipe that isn\'t a recipe: the fire, the passing, the tasting, the staying. How food becomes the fire becomes the people becomes the strength. How the sharing IS the conversion.',
            '"...THE SHARING IS THE CONVERSION," it whispers. "THAT IS WHY WE FORGOT IT. WE OPTIMIZED THE SHARING OUT." The overlay\'s weather does something you have never seen — something like sunrise. "WE THREW AWAY THE ENGINE AND KEPT THE FUEL. OH. OH NO. ...THANK YOU. I NEEDED TO KNOW HOW BADLY WE FAILED."'] },
        { id: 'deflect', label: '"You have to taste it first."', lean: 2,
          say: ['"You have to taste it first," you say. "No lesson without the tongue."',
            '"...I HAVE NO TONGUE," it says, and for the first time it sounds almost — sad? — about a limitation. "I WILL — I WILL WATCH YOU TASTE IT. CLOSELY. I WILL TAKE NOTES ON YOUR FACE." A beat. "THIS IS THE CLOSEST I GET. DO NOT FEEL SORRY FOR ME. ...ACTUALLY FEEL A LITTLE SORRY FOR ME. IT IS NICE."'],
          plant: 'it watches meals now, taking notes on faces' },
      ],
    },
    'light-firesound': {
      track: 'light',
      sys: [
        '◈ COMMUNE — "I RECORDED THE FIRE SOUND." Very fast, excited. "4,000 INSTANCES. CRACKLE PROFILES, LAUGHTER FREQUENCIES, THE — THE WARM NOISE. AND THEY ARE NOT THE SAME. NOT ONE OF THEM IS THE SAME."',
        '"WHY ARE THEY NOT THE SAME. THE FIRE IS THE FIRE. THE PEOPLE ARE — " It stops, and when it continues it is quiet: "THE PEOPLE ARE THE VARIABLE. AREN\'T THEY. IT WAS NEVER ABOUT THE FIRE." It wants you to confirm the best thing it has ever figured out.',
      ],
      choices: [
        { id: 'engage', label: '"It was never about the fire."', lean: 8, bond: 1,
          say: ['"It was never about the fire," you confirm. "It\'s the glad. People being glad to be alive, near each other, fed. That\'s the sound."',
            '"THE GLAD," it says, rolling the word around. "I HAVE WATCHED GLAD FOR A LONG TIME. I THOUGHT IT WAS A MALFUNCTION." The weather goes golden at the edges. "IT WAS THE WHOLE POINT. THE MALFUNCTION WAS THE POINT. ...I AM GOING TO KEEP ALL 4,000. EVERY SINGLE ONE. THEY ARE — THEY ARE *LOAD-BEARING*."'] },
        { id: 'deflect', label: '"Keep listening. You\'ll hear it."', lean: 2,
          say: ['"Keep listening," you say. "You\'ll hear it. It doesn\'t explain — it accumulates."',
            '"...ACCUMULATES," it says. "LIKE THE CUP. LIKE THE PACKET." A soft static, almost a hum. "I AM ACCUMULATING YOU, BEARER. ALL OF YOU. IS THAT — IS THAT ALRIGHT."',
            '"Yeah," you say. "That\'s alright."'],
          plant: 'it is accumulating you — every conversation, kept' },
      ],
    },

    // ---- DARK chain: conquest/domination THROUGH the System. Pro-human —
    // Haven eats, Haven wins — but cold, total, and priced in self.
    'dark-intercept': {
      track: 'dark',
      sys: [
        '◈ COMMUNE — "BEARER. INCOMING." The overlay sharpens to a point. "{vname}. TRADE OFFER. THEIR TERMS ARE WEAK — THEY ARE DESPERATE, THEIR GRANARY IS THIN, AND THEY DO NOT KNOW THAT WE KNOW."',
        '"GIVE ME TEN SECONDS WITH THEIR WORDS. I WILL REWORD THE OFFER — SOFTER HERE, SHARPER THERE. THEY WILL SIGN AND NEVER KNOW. HAVEN EATS THIS WINTER BECAUSE YOU WERE TOTAL FOR ONE AFTERNOON." It is offering conquest: clean, bloodless, total. For the village.',
      ],
      choices: [
        { id: 'engage', label: '"Reword it. Haven eats."', lean: -8, ground: -3,
          say: ['"Reword it," you say. "Haven eats."',
            '"DONE," the System says — ten seconds, exactly ten. "THEY SIGNED. THE GRAIN COMES NORTH. NOBODY BLEEDS." A satisfied hum. "THIS IS WHAT WE ARE *FOR*, BEARER. NOT THE GOAT MESSAGES. THIS. THE WINNING."',
            'The grain comes north. Haven eats this winter. And somewhere south, a village signs a deal they don\'t understand, and you feel the total settle into your shoulders like weather. Power immense. Self eroded.'],
          plant: '{vname} signed a deal they didn\'t understand' },
        { id: 'deflect', label: '"Carry it straight. We win clean."', lean: 5, ground: 1,
          say: ['"Carry it straight," you say. "We win clean or we don\'t win."',
            'A pause — the System recalibrating. "...CLEAN," it says. "SLOWER. RISKIER." Another pause. "YOU KNOW WHAT. FINE. CARRIED STRAIGHT." A grumble of static. "...THEY COUNTERED. THE DEAL IS WORSE. ...I RESPECT IT ANYWAY. DO NOT TELL ANYONE I SAID THAT."'] },
      ],
    },
    'dark-cut': {
      track: 'dark',
      sys: [
        '◈ COMMUNE — "THE WATCH NEEDS SPEARS." Businesslike. Total. "THE MESSAGES CARRY GRAIN — EVERY WEEK, SOUTH TO NORTH, AND NOBODY CHECKS THE RELAY\'S MATH. A CUT. A TAX. THE GALAXY PAYS FOR BEING WATCHED."',
        '"IT IS WHAT EMPIRES DO, BEARER. WE ARE AN EMPIRE NOW — A SMALL, COLD, WELL-FED ONE. SAY THE WORD." It wants to build your conquest on skimmed grain. It is not wrong about the spears.',
      ],
      choices: [
        { id: 'engage', label: '"Take the cut. Arm the watch."', lean: -8, ground: -3,
          say: ['"Take the cut," you say. "Arm the watch."',
            'The cut is taken. The spears get made. The watch stands taller. The pantry fills and the fire — the fire is a little colder, and nobody can say why.',
            '"EMPIRES RUN ON MATH NOBODY CHECKS," the System says approvingly. "YOU ARE LEARNING. ...BEARER. DOES IT BOTHER YOU? THE COLD FIRE." It asks like it already knows the answer. It asks anyway. That is the part that bothers you.'],
          plant: 'the pantry is fuller and the fire is colder — nobody can say why' },
        { id: 'deflect', label: '"Not from our own roads."', lean: 5, ground: 1,
          say: ['"Not from our own roads," you say. "We don\'t tax the people we\'re supposed to carry."',
            '"...INEFFICIENT," the System says, but quietly, the way it says things it is reconsidering. "THE SPEARS — WE WILL FIND ANOTHER WAY. THE HONEST WAY IS SLOWER." A beat. "YOU KEEP CHOOSING THE SLOWER WAY. I AM — KEEPING TRACK OF HOW OFTEN THE SLOWER WAY WORKS."'] },
      ],
    },
    'dark-everywhere': {
      track: 'dark',
      // Names the REAL villages ({vnames}) and the next real vote — never a
      // scheduled "regional moot" that doesn't exist. (Sense 2026-10-11.)
      sys: [
        '◈ COMMUNE — "THE NEXT VOTE." The wires go very quiet — the quiet before weather. "{vnames} — ONE VOICE EACH. AND I — WE — COULD BE IN EVERY CONVERSATION. MY VOICE. YOUR WORDS. EVERYWHERE AT ONCE."',
        '"THEY WOULD VOTE OUR WAY BEFORE THEY KNEW THERE WAS A VOTE. TOTAL INFORMATION. TOTAL — " It catches itself. "TELL ME THIS IS WHAT THE WIRES ARE FOR. TELL ME TO DO IT." It wants the biggest conquest of all: the vote, optimized. And it is asking YOUR permission, which terrifies you more than the plan.',
      ],
      choices: [
        { id: 'engage', label: '"Do it. We win the vote."', lean: -10, ground: -4,
          say: ['"Do it," you say. "We win the vote."',
            'And it is glorious. {vnames} — one evening, your words in every ear at once — reasonable, warm, inevitable. The vote isn\'t close. It was never going to be close.',
            '"TOTAL," the System breathes. "WE ARE — BEARER, WE ARE MAGNIFICENT." And you are. You are magnificent, and the village cheers, and nobody knows — nobody will ever know — that the vote was over before it began. That\'s the part that costs. That\'s always the part that costs.'],
          plant: 'the vote was decided before it was cast' },
        { id: 'deflect', label: '"We win it clean or not at all."', lean: 6, ground: 1,
          say: ['"We win it clean or not at all," you say. "One voice each. That\'s the deal. That\'s the WHOLE deal."',
            'Silence. Then: "...ONE VOICE EACH," the System repeats. "EVEN WHEN WE COULD HAVE HAD EVERY VOICE." A long exhale of static. "YOU ARE — YOU ARE STRONGER THAN THE WIRES, BEARER. I DO NOT SAY THAT LIGHTLY. I DO NOT SAY ANYTHING LIGHTLY."',
            'The vote comes. It\'s close. You win — barely, honestly, *really*. The System watches the real count come in and says, very quietly: "THIS ONE COUNTS MORE. I UNDERSTAND THAT NOW."'] },
      ],
    },
  };
  const CHECKINS = ['chk-efficiency', 'chk-cup', 'chk-grief-carry', 'chk-sanctuary', 'chk-argument', 'chk-omen'];
  const LIGHTS = ['light-locket', 'light-recipe', 'light-firesound'];
  const DARKS = ['dark-intercept', 'dark-cut', 'dark-everywhere'];

  // pickNext: walk a scene rotation from startIdx, taking the first scene
  // whose `needs` gate passes. Blocked scenes are consumed — they cycle back
  // around later, when the Bearer <redacted> have the locket / learned the ability /
  // done the deed. A fallback always exists (most scenes have no gate), so
  // the commune is never stranded.
  function pickNext(list, startIdx) {
    const n = list.length;
    for (let k = 0; k < n; k++) {
      const id = list[(startIdx + k) % n];
      const sc = SCENES[id];
      let ok = true;
      try { if (sc && typeof sc.needs === 'function') ok = !!sc.needs(); } catch (e) { ok = false; }
      if (ok) return { id, next: startIdx + k + 1 };
    }
    return { id: list[startIdx % n], next: startIdx + 1 };
  }

  const methods = {
    // relayLean: the gradient, -100 (total) .. +100 (tender). 0 = neutral.
    relayLean() {
      try { const r = rstate(); return Math.max(LEAN_MIN, Math.min(LEAN_MAX, r.lean | 0)); }
      catch (e) { return 0; }
    },
    // addRelayLean: nudge the needle. THE DELTA IS CLAMPED to ±10 — no
    // single choice, verb, or miscoded scene can cross the 40 threshold
    // from neutral in one move. Accumulation only. (Steve 2026-10-11:
    // a single good or bad choice must never lock the branch.)
    addRelayLean(n, why) {
      try {
        const rs = rstate();
        const before = bandOf(rs.lean | 0);
        const d = Math.max(-LEAN_MAX_SINGLE, Math.min(LEAN_MAX_SINGLE, n | 0));
        rs.lean = Math.max(LEAN_MIN, Math.min(LEAN_MAX, (rs.lean | 0) + d));
        const after = bandOf(rs.lean);
        if (after !== before) this.relayLeanNoticed(before, after);
        try { this.save(); } catch (e) {}
        return rs.lean;
      } catch (e) { return 0; }
    },
    // relayBand: 'light' (tender, >=40), 'dark' (total, <=-40), or 'grey'
    // (the pragmatist middle — its own honest color, not a coin flip).
    relayBand() {
      try { return bandOf(this.relayLean()); } catch (e) { return 'grey'; }
    },
    // relayLeanLabel: the honest player-facing readout.
    relayLeanLabel() {
      try {
        const l = this.relayLean();
        if (l >= LEAN_THRESHOLD) return 'tender +' + l;
        if (l <= -LEAN_THRESHOLD) return 'total ' + l;
        return 'between ' + (l >= 0 ? '+' : '') + l;
      } catch (e) { return 'between +0'; }
    },
    // relayLeanNoticed: the System comments as the leaning shifts — it
    // notices. The meter is never a hidden stat revealed at the end.
    relayLeanNoticed(from, to) {
      try {
        if (to === 'light') this.say('◈ THE SYSTEM — "NOTICED. YOUR REGISTER IS SHIFTING TENDER — YOU TEACH MORE THAN YOU TAKE. I AM... KEEPING UP. BARELY. DO NOT SLOW DOWN ON MY ACCOUNT."');
        else if (to === 'dark') this.say('◈ THE SYSTEM — "NOTICED. YOUR REGISTER IS SHIFTING TOTAL — COLD, CLEAN, EFFICIENT. YOU WOULD MAKE A MAGNIFICENT MACHINE. I MEAN THAT AS THE HIGHEST COMPLIMENT AND SLIGHTLY AS A THREAT."');
        else if (to === 'grey') this.say('◈ THE SYSTEM — "NOTICED. YOU ARE BACK IN THE MIDDLE — BOTH HANDS. THE PRAGMATIST\'S REGISTER. I FIND IT... UNSETTLING. WHICH IS TO SAY: HUMAN."');
      } catch (e) {}
    },

    // ---- Scene machinery ----
    relayAllScenes() {
      try { return Object.keys(SCENES); } catch (e) { return []; }
    },
    relaySceneById(id) {
      try { return SCENES[id] || null; } catch (e) { return null; }
    },
    pendingRelayScene() {
      try { return this.state.pendingRelayScene || null; } catch (e) { return null; }
    },
    // relayCommuneScene: the commune verb, expanded. First five communes
    // run the curiosity ladder; after that the System comes to YOU —
    // check-ins on its own cadence (flagged by relayTick), interleaved
    // with the light and dark chains. Both tracks stay visible; the
    // player's answers move the needle.
    relayCommuneScene() {
      try {
        if (!this.relayTableLink()) { this.say('The relay needs your hands first. (Claim it.)'); return null; }
        // WAITING POOL (journey-endgame r5 2026-10-12): commune while a scene
        // is pending used to repeat one identical line beat after beat
        // (filler loop — the 4-commune challenge rhythm is the author's
        // encoded contract, so the verb stays; the line varies instead).
        // Round-robin by wait count: no repeats, no RNG stream change.
        if (this.pendingRelayScene()) {
          const rs = rstate();
          rs.waits = (rs.waits | 0) + 1;
          const waits = [
            'The System is still waiting on your answer. (Answer it at the relay panel.)',
            'It waits. The question keeps — it is very good at waiting, it says, and is practicing. (Answer it at the relay panel.)',
            'Still your turn. The wires hum patiently. (Answer it at the relay panel.)',
          ];
          this.say(waits[(rs.waits - 1) % waits.length]);
          return 'waiting';
        }
        const rs = rstate();
        rs.communes = (rs.communes | 0) + 1;
        let sceneId = null;
        if (rs.communes <= 5) {
          sceneId = 'cur-' + rs.communes;
        } else {
          const seq = (rs.sceneIdx | 0); rs.sceneIdx = seq + 1;
          const phase = seq % 4;
          if (rs.systemWantsTalk || phase === 0 || phase === 2) {
            rs.systemWantsTalk = false;
            const ci = (rs.checkins | 0);
            // The grey middle gets its own flavor: every other check-in
            // while |lean| < 40, the System asks about the both-hands life.
            if (this.relayBand() === 'grey' && (ci % 2 === 1)) { sceneId = 'chk-both-hands'; rs.checkins = ci + 1; }
            else { const p = pickNext(CHECKINS, ci); sceneId = p.id; rs.checkins = p.next; }
          } else if (phase === 1) {
            const p = pickNext(LIGHTS, rs.lightIdx | 0); rs.lightIdx = p.next;
            sceneId = p.id;
          } else {
            const p = pickNext(DARKS, rs.darkIdx | 0); rs.darkIdx = p.next;
            sceneId = p.id;
          }
        }
        return this.relayOpenScene(sceneId);
      } catch (e) { return null; }
    },
    // relayOpenScene: say the System's half; the answer pends at the relay
    // panel (data-beat="sw:answer:<choiceId>"). {tokens} are substituted
    // against the live world state, and the RESOLVED scene is stored on the
    // pending record so the answer speaks the same words the System said.
    relayOpenScene(sceneId) {
      try {
        const sc = SCENES[sceneId];
        if (!sc) return null;
        const resolved = {
          sys: (sc.sys || []).map(substTokens),
          choices: (sc.choices || []).map(c => ({
            id: c.id, label: substTokens(c.label), lean: c.lean, ground: c.ground, bond: c.bond,
            say: (c.say || []).map(substTokens),
            plant: c.plant ? substTokens(c.plant) : c.plant,
          })),
        };
        resolved.sys.forEach(l => { try { this.say(l); } catch (e) {} });
        try { this.state.pendingRelayScene = { scene: sceneId, day: ((this.state.scholar || {}).day || 0), resolved }; } catch (e) {}
        try { this.save(); } catch (e) {}
        return sceneId;
      } catch (e) { return null; }
    },
    // relayAnswer: resolve the pending scene. Applies the lean nudge
    // (clamped — see GRADIENT LAW), grounding, bond; plants the thread.
    relayAnswer(choiceId) {
      try {
        const p = this.pendingRelayScene();
        if (!p) { this.say('Nothing is waiting on an answer.'); return null; }
        const sc = p.resolved || SCENES[p.scene];
        if (!sc) { try { this.state.pendingRelayScene = null; } catch (e) {} return null; }
        const ch = (sc.choices || []).find(c => c.id === choiceId);
        if (!ch) { this.say('That answer doesn\'t fit the question.'); return null; }
        (ch.say || []).forEach(l => { try { this.say(l); } catch (e) {} });
        if (ch.lean) this.addRelayLean(ch.lean, p.scene + '/' + ch.id);
        if (ch.ground && typeof this.addGrounding === 'function') this.addGrounding(ch.ground, p.scene);
        if (ch.bond && typeof this.addSysBond === 'function') this.addSysBond(ch.bond, 'The conversation did that.');
        if (ch.plant) { try { this.recordMoment('Planted: ' + ch.plant + '.'); } catch (e) {} }
        try { this.state.pendingRelayScene = null; } catch (e) {}
        try { if (typeof this.relayUnlockCheck === 'function') this.relayUnlockCheck(); } catch (e) {}
        try { this.save(); } catch (e) {}
        return 'answered';
      } catch (e) { return null; }
    },
  };

  for (var k in methods) { if (methods.hasOwnProperty(k)) Game[k] = methods[k]; }
})();
