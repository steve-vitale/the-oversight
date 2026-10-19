"use strict";
const K = require("./lib"),
  T = K.reporter("shepherd-deed");
(async () => {
  const saves = new Map();
  globalThis.localStorage = {
    getItem: (k) => saves.get(k) ?? null,
    setItem: (k, v) => saves.set(k, String(v)),
    removeItem: (k) => saves.delete(k),
    key: (i) => [...saves.keys()][i] ?? null,
    get length() {
      return saves.size;
    },
  };
  const G = await K.load({ seed: Number(process.env.SEED || 7) });
  let s, v, me, id, other;
  const menuState = G.state,
    menuPerson = G.villagerId,
    menuMap = G.map;
  G.state = null;
  G.villagerId = null;
  G.map = null;
  try {
    T.ok(
      "an empty expedition cannot invent a player doctor",
      typeof G.campPeopleIds === "function" &&
        G.campHealerName() === null &&
        G.campPeopleIds().length === 0,
    );
  } finally {
    G.state = menuState;
    G.villagerId = menuPerson;
    G.map = menuMap;
  }
  function fresh(playerCare = true) {
    G.over = false;
    G.won = false;
    G.tbfight = null;
    G.genRoster("Columbus, Ohio");
    G.generatedRoster[0].occupationId = "electrician";
    G.generatedRoster[0].formerOccupation = "Electrician";
    G.newGame("Columbus, Ohio", null, G.generatedRoster[0].id);
    G.depart();
    s = G.state.scholar;
    v = G.state.village;
    me = G.villagerId;
    [id, other] = v.roster
      .filter((x) => x !== me && G.npcAge(x) >= 18)
      .slice(0, 2);
    G.getPerson(id).formerOccupation = "Farmer";
    G.getPerson(other).formerOccupation = "Farmer";
    s.day = 85;
    s.health = 100;
    s.kcal = 2400;
    s.abilities = [];
    if (playerCare) K.giveAbility(G, "field_medicine");
    s.backgroundAbilities = [];
    s.activeSynergies = [];
    G.state.systemArrived = true;
    v.roster = [me, id, other];
    v.health = { [id]: 20, [other]: 100 };
    v.pantry = [
      {
        name: "Prepared stores",
        units: 200,
        kcalEach: 500,
        safe: true,
        spoilDay: 9999,
      },
    ];
    v.godpathDeeds = {};
    delete v.godpathCareWatch;
  }
  const status = (who = "player") =>
    G.godpathDeedStatus(who, "shepherd_of_the_dead");
  const book = (who = me) => v.godpathDeeds?.[who]?.care_survived;
  const dawn = () => {
    G.tbfight = null;
    // A controlled quiet environment isolates the later-dawn predicate.
    // Real seeded campaign hazards are measured separately; no method is replaced.
    const random = Math.random;
    try {
      Math.random = () => 0.99;
      G.endDay();
    } finally {
      Math.random = random;
    }
    s = G.state.scholar;
    v = G.state.village;
  };
  fresh();
  T.ok(
    "Shepherd declares a critical-health survival deed",
    G.data.godpaths.paths.caregiver.god.deed?.event === "care_survived",
  );
  T.ok(
    "human Field Medicine is prepared as competence, not a magic slot",
    G.hasAbility("field_medicine") && s.abilities.length === 0,
  );
  const old = JSON.stringify(G.state);
  status();
  T.ok("missing ledger read is pure", JSON.stringify(G.state) === old);
  T.ok(
    "unknown class does not reveal its objective",
    G.godpathDeedHint("player") === null,
  );
  fresh();
  T.ok(
    "real human rounds heal the critical resident",
    G.healerRounds() === id && v.health[id] === 35,
  );
  T.ok(
    "rounds create an attributed pending rescue",
    v.godpathCareWatch?.[me]?.[0]?.patient === id && !book(),
  );
  T.ok(
    "care alone does not fulfill later survival",
    status()?.complete === false,
  );
  s.day++;
  T.ok(
    "advancing a clock and reading status cannot settle survival",
    !book() && !status()?.complete,
  );
  s.day--;
  dawn();
  T.ok(
    "real later dawn fulfills both-person survival",
    book()?.patient === id && status()?.complete === true,
  );
  G.save();
  const key = G.state.runKey;
  delete v.godpathDeeds;
  G.load(key);
  s = G.state.scholar;
  v = G.state.village;
  T.ok(
    "fulfilled receipt persists through actual save/load",
    book()?.patient === id && status()?.complete === true,
  );
  fresh();
  G.healerRounds();
  G.save();
  const pendingKey = G.state.runKey;
  delete v.godpathCareWatch;
  G.load(pendingKey);
  s = G.state.scholar;
  v = G.state.village;
  T.ok(
    "pending rescue also persists without early fulfillment",
    v.godpathCareWatch?.[me]?.[0]?.patient === id && !book(),
  );
  G.getPerson(id).dead = true;
  dawn();
  T.ok(
    "patient death before dawn invalidates the pending rescue",
    !book() && !v.godpathCareWatch?.[me]?.length,
  );
  fresh();
  G.healerRounds();
  G.getPerson(me).dead = true;
  dawn();
  T.ok("caregiver death cannot fulfill a rescue", !book());
  fresh();
  v.health[id] = 30;
  G.healerRounds();
  T.ok(
    "routine noncritical healing does not invent a rescue",
    !v.godpathCareWatch?.[me],
  );
  fresh();
  v.health[id] = 1;
  G.healerRounds();
  T.ok(
    "healing that leaves the patient critical is insufficient",
    v.health[id] === 16 && !v.godpathCareWatch?.[me],
  );
  fresh(false);
  G.getPerson(other).formerOccupation = "Doctor";
  G.getPerson(id).formerOccupation = "Farmer";
  G.healerRounds();
  T.ok(
    "real NPC camp rounds belong to the doctor",
    v.godpathCareWatch?.[other]?.[0]?.patient === id &&
      !v.godpathCareWatch?.[me],
  );
  dawn();
  T.ok(
    "NPC rescue completes on the same later-dawn rule",
    book(other)?.patient === id && status(other)?.complete === true,
  );
  // Camp presence is an actual input, not a remote roster-wide aura.
  fresh();
  v.away = { [id]: true };
  T.ok(
    "away patient receives no phantom round or rescue",
    G.healerRounds() === null && v.health[id] === 20 && !v.godpathCareWatch,
  );
  fresh(false);
  G.getPerson(id).formerOccupation = "Farmer";
  G.getPerson(other).formerOccupation = "Doctor";
  v.away = { [other]: true };
  T.ok(
    "away doctor cannot lend remote hands",
    G.campHealerName() === null &&
      G.healerRounds() === null &&
      v.health[id] === 20,
  );
  fresh(false);
  G.getPerson(id).formerOccupation = "Farmer";
  G.getPerson(other).formerOccupation = "Doctor";
  v.health[other] = 0;
  T.ok(
    "zero-health doctor cannot supply camp care",
    G.campHealerName() === null && G.healerRounds() === null,
  );
  fresh();
  v.health[id] = 0;
  T.ok(
    "rounds cannot resurrect a zero-health patient",
    G.healerRounds() === null && v.health[id] === 0 && !v.godpathCareWatch,
  );
  function fieldCamp() {
    for (let y = 0; y < 9; y++)
      for (let x = 0; x < 9; x++) {
        const tile = G.tileAt(x, y);
        if (tile && !["haven", "ruin"].includes(tile.type)) {
          G.map.px = x;
          G.map.py = y;
          s.insideHaven = false;
          // Prepared existing field camp; construction is covered by camp proofs.
          G.state.camp = { px: x, py: y, condition: "shitty" };
          return;
        }
      }
    throw Error("No wild field-camp tile");
  }
  fresh(false);
  G.getPerson(id).formerOccupation = "Farmer";
  G.getPerson(other).formerOccupation = "Doctor";
  fieldCamp();
  v.party = [];
  T.ok(
    "a field camp cannot borrow Haven hands while Haven keeps its own care",
    G.atCamp() &&
      !G.playerAtHaven() &&
      G.campHealerName() === null &&
      G.healerRounds() === id &&
      v.health[id] === 35 &&
      v.godpathCareWatch?.[other]?.[0]?.scene === "haven" &&
      !v.godpathCareWatch?.[me],
  );
  fresh(false);
  G.getPerson(other).formerOccupation = "Doctor";
  fieldCamp();
  G.state.camp = null;
  v.party = [];
  T.ok(
    "a present Haven doctor treats residents while the bearer travels",
    !G.atCamp() && G.healerRounds() === id && v.health[id] === 35 &&
      v.godpathCareWatch?.[other]?.[0]?.scene === "haven",
  );
  dawn();
  T.ok(
    "offscreen Haven rescue fulfills for the actual surviving NPC doctor",
    !!book(other) && !book(),
  );
  fresh(false);
  G.getPerson(other).formerOccupation = "Doctor";
  v.health[id] = 100;
  v.health[other] = 20;
  T.ok(
    "a lone injured doctor keeps self care without earning another-person rounds",
    G.healerRounds() === other && v.health[other] === 35 && !v.godpathCareWatch,
  );
  fresh(false);
  G.getPerson(id).formerOccupation = "Farmer";
  G.getPerson(other).formerOccupation = "Doctor";
  fieldCamp();
  v.party = [other];
  T.ok(
    "a present field doctor cannot heal a patient left at Haven",
    G.campHealerVid() === other &&
      G.healerRounds() === null &&
      v.health[id] === 20,
  );
  fresh(false);
  G.getPerson(id).formerOccupation = "Farmer";
  G.getPerson(other).formerOccupation = "Doctor";
  fieldCamp();
  v.party = [id, other];
  v.away = { [id]: true, [other]: true };
  T.ok(
    "actual field-party doctor and patient can receive attributed care",
    G.healerRounds() === id &&
      v.health[id] === 35 &&
      v.godpathCareWatch?.[other]?.[0]?.patient === id,
  );
  fresh();
  fieldCamp();
  v.party = [id];
  T.ok(
    "player competence can care for their actual field companion",
    G.healerRounds() === id &&
      v.health[id] === 35 &&
      v.godpathCareWatch?.[me]?.[0]?.patient === id,
  );
  fresh();
  fieldCamp();
  G.state.camp = null;
  v.party = [id];
  T.ok(
    "being outdoors without a camp cannot mint camp care",
    !G.atCamp() && G.healerRounds() === null && v.health[id] === 20,
  );

  fresh(false);
  G.getPerson(id).formerOccupation = "Farmer";
  G.getPerson(other).formerOccupation = "Doctor";
  G.getPerson(other).name = "You";
  G.revealName(other, "prepared caregiver identity proof");
  G.healerRounds();
  T.ok(
    "a caregiver display label cannot turn NPC work into player credit",
    G.campHealerName() === "You" &&
      G.campHealerId?.() === other &&
      v.godpathCareWatch?.[other]?.[0]?.patient === id &&
      !v.godpathCareWatch?.[me],
  );

  fresh();
  G.villagerHealCheck(id, "Patient");
  T.ok(
    "actual predeparture patching credits the critical-health rescue",
    v.health[id] === 45 && v.godpathCareWatch?.[me]?.[0]?.via === "heal_check",
  );
  fresh(false);
  G.getPerson(other).formerOccupation = "Doctor";
  fieldCamp();
  v.party = [];
  G.villagerHealCheck(id, "Patient");
  T.ok(
    "Haven predeparture care belongs to the present doctor while bearer travels",
    v.health[id] === 45 && v.godpathCareWatch?.[other]?.[0]?.scene === "haven",
  );
  fresh();
  v.away = { [id]: true };
  G.villagerHealCheck(id, "Patient");
  T.ok(
    "predeparture patching cannot reach an already absent patient",
    v.health[id] === 20 && !v.godpathCareWatch,
  );
  fresh(false);
  G.getPerson(other).formerOccupation = "Doctor";
  fieldCamp();
  v.party = [other];
  G.villagerHealCheck(id, "Patient");
  T.ok(
    "predeparture care cannot borrow a travelling party doctor for Haven",
    v.health[id] === 20 && !v.godpathCareWatch,
  );
  fresh(false);
  G.getPerson(id).formerOccupation = "Doctor";
  G.villagerHealCheck(id, "Patient");
  T.ok(
    "a lone doctor keeps predeparture self care without rescue credit",
    v.health[id] === 45 && !v.godpathCareWatch,
  );
  function fever({awayDoctor = false, awayPatient = false, party = false} = {}) {
    fresh(false);
    G.getPerson(other).formerOccupation = "Doctor";
    fieldCamp();
    v.party = party ? [id, other] : [];
    v.away = {...(awayDoctor ? {[other]: true} : {}), ...(awayPatient ? {[id]: true} : {})};
    v.health[id] = 100;
    v.npcAbilities = {};
    v.sick = {[id]: {name: "gut rot", daysLeft: 5, severity: 1}};
    const random = Math.random;
    try { Math.random = () => 0.99; G.villageSicknessTick(); }
    finally { Math.random = random; }
    return v.health[id];
  }
  T.ok("present Haven medicine still eases fever while bearer travels", fever() === 98);
  T.ok("an absent doctor cannot ease a home patients fever", fever({awayDoctor:true}) === 97);
  T.ok("home medicine cannot ease an absent patients fever", fever({awayPatient:true}) === 97);
  T.ok("a present field-party doctor can ease their companions fever", fever({party:true}) === 98);

  function fight(abilities) {
    fresh();
    v.health[id] = 100;
    v.party = [id, other];
    v.positions = { [id]: { mx: 8, my: 8 }, [other]: { mx: 8, my: 8 } };
    v.npcAbilities = { [id]: abilities, [other]: [] };
    K.fight(G, "moderator", { party: true, px: 4, py: 4, mx: 8, my: 8 });
    const f = G.tbfight,
      p = G.tbFighter("p"),
      n = f.fighters.find((x) => x.villagerId === id),
      a = f.fighters.find((x) => x.villagerId === other),
      m = f.fighters.find((x) => x.kind === "monster");
    n.mx = 4;
    n.my = 5;
    a.mx = 5;
    a.my = 5;
    return { f, p, n, a, m };
  }
  let q = fight(["mending_hands"]);
  G.npcNeeds(id).hunger = 0;
  q.p.hp = s.health = 20;
  G.tbVillagerAbility(q.n);
  T.ok(
    "actual NPC Mending credits its caster for the player rescue",
    v.godpathCareWatch?.[id]?.[0]?.patient === me &&
      s.health > 25 &&
      G.npcNeeds(id).hunger === 2,
    JSON.stringify({
      watch: v.godpathCareWatch,
      hp: s.health,
      max: q.p.maxHp,
      hunger: G.npcNeeds(id).hunger,
    }),
  );
  q = fight(["mending_hands"]);
  q.n.hp = 20;
  q.p.hp = s.health = 100;
  G.tbVillagerAbility(q.n);
  T.ok("self Mending really heals beyond critical health", q.n.hp > 25);
  T.ok(
    "self healing cannot earn another-person rescue",
    !v.godpathCareWatch?.[id],
  );
  q = fight(["lifeline"]);
  G.tbDamage("p", 1000, "prepared hostile blow", q.m.key, {
    undodgeable: true,
  });
  G.tbEndCheck();
  T.ok(
    "real allied Lifeline records the actual lifesaver",
    v.godpathCareWatch?.[id]?.[0]?.patient === me && q.p.hp === 1,
  );
  q = fight(["lifeline"]);
  s.abilities = [{ id: "second_wind", level: 1 }];
  G.tbDamage("p", 1000, "prepared hostile blow", q.m.key, {
    undodgeable: true,
  });
  G.tbEndCheck();
  T.ok(
    "own death refusal cannot credit a bystanders Lifeline",
    !v.godpathCareWatch?.[id],
  );
  fresh();
  G.healerRounds();
  dawn();
  T.ok(
    "positive retention scenario first completes an actual rescue",
    !!book(),
  );
  const first = JSON.stringify(book());
  s.healerRoundsDay = null;
  v.health[other] = 20;
  G.healerRounds();
  dawn();
  T.ok(
    "first completed receipt is immutable",
    !!book() && JSON.stringify(book()) === first,
  );
  fresh();
  G.healerRounds();
  dawn();
  const autoKey = G.state.runKey;
  const autoReceipt = JSON.stringify(book());
  delete v.godpathDeeds;
  G.load(autoKey);
  s = G.state.scholar;
  v = G.state.village;
  T.ok(
    "the automatic dawn snapshot includes the completed receipt",
    !!book() && JSON.stringify(book()) === autoReceipt,
  );
  const kit = ["battlefield_grace", "the_touch", "purify", "mending_hands"];
  function build() {
    s.abilities = kit.map((id) => ({ id, level: 1 }));
    G.recognizeClass("player");
  }
  fresh();
  build();
  s.godpath.since = 1;
  s.activeSynergies = ["peacemakers_voice"];
  G.checkPlayerGodhoodAscension();
  T.ok(
    "old class age and synergy cannot substitute for a rescue",
    !s.godhood?.active?.includes("shepherd_of_the_dead"),
  );
  fresh();
  G.healerRounds();
  build();
  T.ok(
    "known class gets a truthful pending hint",
    G.godpathDeedHint("player") ===
      G.data.godpaths.paths.caregiver.god.deed.pendingHint,
  );
  dawn();
  T.ok(
    "a real deed and full prepared build reach the player ceremony",
    s.godhood?.active?.includes("shepherd_of_the_dead") && !!book(),
  );
  fresh();
  s.day = 78;
  G.healerRounds();
  build();
  dawn();
  T.ok(
    "the rescue does not bypass the day80 gate",
    !!book() && !s.godhood?.active?.includes("shepherd_of_the_dead"),
  );
  dawn();
  T.ok(
    "the ordinary day80 dawn can recognize the completed build",
    s.godhood?.active?.includes("shepherd_of_the_dead") &&
      s.godhood.recognized.shepherd_of_the_dead === s.day &&
      s.inventory.some((i) => i.itemId === "commanders_coat"),
  );
  fresh();
  G.healerRounds();
  s.abilities = [{ id: "mending_hands", level: 1 }];
  dawn();
  T.ok(
    "a deed alone cannot bypass the full build and payoff",
    !!book() && !s.godhood?.active?.includes("shepherd_of_the_dead"),
  );
  fresh(false);
  G.getPerson(other).formerOccupation = "Doctor";
  G.getPerson(id).formerOccupation = "Farmer";
  v.npcAbilities = { [other]: kit.slice() };
  G.recognizeClass(other);
  G.healerRounds();
  dawn();
  T.ok(
    "the same real care deed and prepared build reach NPC ceremony",
    v.npcGodhood?.[other]?.active?.includes("shepherd_of_the_dead") &&
      v.npcGodhood[other].recognized.shepherd_of_the_dead === s.day &&
      G.vpOf(other).items.some(
        (i) =>
          (typeof i === "string" ? i : i.itemId || i.id) === "commanders_coat",
      ) &&
      !!book(other),
  );
  fresh();
  s.godhood = {
    recognized: { shepherd_of_the_dead: 84 },
    active: ["shepherd_of_the_dead"],
  };
  G.checkPlayerGodhoodAscension();
  T.ok(
    "existing active Shepherds need no retroactive deed",
    s.godhood.active.includes("shepherd_of_the_dead") && !book(),
  );
  fresh();
  G.healerRounds();
  dawn();
  const predecessor = me;
  v.trust = { [other]: 10000 };
  G.playerDeath("prepared care succession");
  s = G.state.scholar;
  v = G.state.village;
  T.ok(
    "a successor cannot borrow a predecessors care",
    G.villagerId === other && !!book(predecessor) && !status()?.complete,
  );
  fresh();
  G.noteCareRescue?.(
    "unknown_person",
    id,
    20,
    35,
    100,
    "healer_rounds",
    "camp",
  );
  G.noteCareRescue?.(me, me, 20, 35, 100, "mending_hands", "battle");
  T.ok(
    "unknown people and self care cannot create pending history",
    typeof G.noteCareRescue === "function" && !v.godpathCareWatch,
  );
  T.done();
})().catch((e) => {
  console.error(e.stack);
  process.exitCode = 1;
});
