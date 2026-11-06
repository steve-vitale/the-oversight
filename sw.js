/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'fe7cdea2d-20261106-120742';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=fe7cdea2d-20261106-120742",
  "./src/js/engine/modifiers.js?v=fe7cdea2d-20261106-120742",
  "./src/js/engine/calories.js?v=fe7cdea2d-20261106-120742",
  "./src/js/engine/day.js?v=fe7cdea2d-20261106-120742",
  "./src/js/engine/forage.js?v=fe7cdea2d-20261106-120742",
  "./src/js/engine/combat.js?v=fe7cdea2d-20261106-120742",
  "./src/js/audio-registry.js?v=fe7cdea2d-20261106-120742",
  "./src/js/text.js?v=fe7cdea2d-20261106-120742",
  "./src/js/game.js?v=fe7cdea2d-20261106-120742",
  "./src/js/encounters.js?v=fe7cdea2d-20261106-120742",
  "./src/js/conversation.js?v=fe7cdea2d-20261106-120742",
  "./src/js/convo-mood.js?v=fe7cdea2d-20261106-120742",
  "./src/js/convoTopics.js?v=fe7cdea2d-20261106-120742",
  "./src/js/naming-rite.js?v=fe7cdea2d-20261106-120742",
  "./src/js/convo-wants.js?v=fe7cdea2d-20261106-120742",
  "./src/js/convo-dialogue.js?v=fe7cdea2d-20261106-120742",
  "./src/js/convo-beats.js?v=fe7cdea2d-20261106-120742",
  "./src/js/convo-scene.js?v=fe7cdea2d-20261106-120742",
  "./src/js/voice-piper.js?v=fe7cdea2d-20261106-120742",
  "./src/js/voice-system.js?v=fe7cdea2d-20261106-120742",
  "./src/js/examine.js?v=fe7cdea2d-20261106-120742",
  "./src/js/equipment.js?v=fe7cdea2d-20261106-120742",
  "./src/js/journal.js?v=fe7cdea2d-20261106-120742",
  "./src/js/party.js?v=fe7cdea2d-20261106-120742",
  "./src/js/favor-water.js?v=fe7cdea2d-20261106-120742",
  "./src/js/favor-forage.js?v=fe7cdea2d-20261106-120742",
  "./src/js/favor-outing.js?v=fe7cdea2d-20261106-120742",
  "./src/js/party-formal.js?v=fe7cdea2d-20261106-120742",
  "./src/js/truth.js?v=fe7cdea2d-20261106-120742",
  "./src/js/galactic-cast.js?v=fe7cdea2d-20261106-120742",
  "./src/js/contests.js?v=fe7cdea2d-20261106-120742",
  "./src/js/broadcast.js?v=fe7cdea2d-20261106-120742",
  "./src/js/contestEngine.js?v=fe7cdea2d-20261106-120742",
  "./src/js/alienPlayers.js?v=fe7cdea2d-20261106-120742",
  "./src/js/storage.js?v=fe7cdea2d-20261106-120742",
  "./src/js/perceive.js?v=fe7cdea2d-20261106-120742",
  "./src/js/carexplore.js?v=fe7cdea2d-20261106-120742",
  "./src/js/justice.js?v=fe7cdea2d-20261106-120742",
  "./src/js/food.js?v=fe7cdea2d-20261106-120742",
  "./src/js/betrayal.js?v=fe7cdea2d-20261106-120742",
  "./src/js/corpses.js?v=fe7cdea2d-20261106-120742",
  "./src/js/corruption.js?v=fe7cdea2d-20261106-120742",
  "./src/js/lifeseed.js?v=fe7cdea2d-20261106-120742",
  "./src/js/spawn-knack.js?v=fe7cdea2d-20261106-120742",
  "./src/js/trial-deeds.js?v=fe7cdea2d-20261106-120742",
  "./src/js/practice-deeds.js?v=fe7cdea2d-20261106-120742",
  "./src/js/tracks.js?v=fe7cdea2d-20261106-120742",
  "./src/js/villager-build.js?v=fe7cdea2d-20261106-120742",
  "./src/js/progression.js?v=fe7cdea2d-20261106-120742",
  "./src/js/waveLedger.js?v=fe7cdea2d-20261106-120742",
  "./src/js/standing.js?v=fe7cdea2d-20261106-120742",
  "./src/js/feastBuff.js?v=fe7cdea2d-20261106-120742",
  "./src/js/ledger.js?v=fe7cdea2d-20261106-120742",
  "./src/js/exposure.js?v=fe7cdea2d-20261106-120742",
  "./src/js/abilityActions.js?v=fe7cdea2d-20261106-120742",
  "./src/js/buildarounds.js?v=fe7cdea2d-20261106-120742",
  "./src/js/foodPower.js?v=fe7cdea2d-20261106-120742",
  "./src/js/monsterBehaviors.js?v=fe7cdea2d-20261106-120742",
  "./src/js/partyTactics.js?v=fe7cdea2d-20261106-120742",
  "./src/js/sigW3a.js?v=fe7cdea2d-20261106-120742",
  "./src/js/statusEffects.js?v=fe7cdea2d-20261106-120742",
  "./src/js/sigW3b.js?v=fe7cdea2d-20261106-120742",
  "./src/js/metaProgression.js?v=fe7cdea2d-20261106-120742",
  "./src/js/sigW3c.js?v=fe7cdea2d-20261106-120742",
  "./src/js/sigW4.js?v=fe7cdea2d-20261106-120742",
  "./src/js/sigW5.js?v=fe7cdea2d-20261106-120742",
  "./src/js/villager-agency.js?v=fe7cdea2d-20261106-120742",
  "./src/js/win-plan.js?v=fe7cdea2d-20261106-120742",
  "./src/js/npc-triggers.js?v=fe7cdea2d-20261106-120742",
  "./src/js/fieldFights.js?v=fe7cdea2d-20261106-120742",
  "./src/js/party-wiring.js?v=fe7cdea2d-20261106-120742",
  "./src/js/party-bond.js?v=fe7cdea2d-20261106-120742",
  "./src/js/villager-objectives.js?v=fe7cdea2d-20261106-120742",
  "./src/js/villager-goals.js?v=fe7cdea2d-20261106-120742",
  "./src/js/villager-mapmem.js?v=fe7cdea2d-20261106-120742",
  "./src/js/codex-people.js?v=fe7cdea2d-20261106-120742",
  "./src/js/fallen-memorial.js?v=fe7cdea2d-20261106-120742",
  "./src/js/graves.js?v=fe7cdea2d-20261106-120742",
  "./src/js/membership.js?v=fe7cdea2d-20261106-120742",
  "./src/js/gardenCultivation.js?v=fe7cdea2d-20261106-120742",
  "./src/js/havenGrowth.js?v=fe7cdea2d-20261106-120742",
  "./src/js/shelter.js?v=fe7cdea2d-20261106-120742",
  "./src/js/hierarchy.js?v=fe7cdea2d-20261106-120742",
  "./src/js/scaleDiscovery.js?v=fe7cdea2d-20261106-120742",
  "./src/js/comms.js?v=fe7cdea2d-20261106-120742",
  "./src/js/table.js?v=fe7cdea2d-20261106-120742",
  "./src/js/pods.js?v=fe7cdea2d-20261106-120742",
  "./src/js/titans.js?v=fe7cdea2d-20261106-120742",
  "./src/js/finale-campaign.js?v=fe7cdea2d-20261106-120742",
  "./src/js/godhood.js?v=fe7cdea2d-20261106-120742",
  "./src/js/pantheon.js?v=fe7cdea2d-20261106-120742",
  "./src/js/records.js?v=fe7cdea2d-20261106-120742",
  "./src/js/table-feared.js?v=fe7cdea2d-20261106-120742",
  "./src/js/table-indispensable.js?v=fe7cdea2d-20261106-120742",
  "./src/js/table-beloved.js?v=fe7cdea2d-20261106-120742",
  "./src/js/table-witness.js?v=fe7cdea2d-20261106-120742",
  "./src/js/table-assimilated.js?v=fe7cdea2d-20261106-120742",
  "./src/js/table-defiant.js?v=fe7cdea2d-20261106-120742",
  "./src/js/relay-ext.js?v=fe7cdea2d-20261106-120742",
  "./src/js/relay-dialogue.js?v=fe7cdea2d-20261106-120742",
  "./src/js/table-relay.js?v=fe7cdea2d-20261106-120742",
  "./src/js/safetynets.js?v=fe7cdea2d-20261106-120742",
  "./src/js/villageAgency.js?v=fe7cdea2d-20261106-120742",
  "./src/js/memdepth.js?v=fe7cdea2d-20261106-120742",
  "./src/js/overtime.js?v=fe7cdea2d-20261106-120742",
  "./src/js/network-campaign.js?v=fe7cdea2d-20261106-120742",
  "./src/js/debug-scenarios.js?v=fe7cdea2d-20261106-120742",
  "./src/js/keepsakes.js?v=fe7cdea2d-20261106-120742",
  "./src/js/skill-teaching.js?v=fe7cdea2d-20261106-120742",
  "./src/js/world.js?v=fe7cdea2d-20261106-120742",
  "./src/js/nomad.js?v=fe7cdea2d-20261106-120742",
  "./src/js/nomad-wild.js?v=fe7cdea2d-20261106-120742",
  "./src/js/nomad-scenes.js?v=fe7cdea2d-20261106-120742",
  "./src/js/nomad-drive.js?v=fe7cdea2d-20261106-120742",
  "./src/js/temperature.js?v=fe7cdea2d-20261106-120742",
  "./src/js/godpath.js?v=fe7cdea2d-20261106-120742",
  "./src/js/godverbs.js?v=fe7cdea2d-20261106-120742",
  "./src/js/endingKey.js?v=fe7cdea2d-20261106-120742",
  "./src/js/telemetry-hooks.js?v=fe7cdea2d-20261106-120742",
  "./src/js/feel.js?v=fe7cdea2d-20261106-120742",
  "./src/js/build.js?v=fe7cdea2d-20261106-120742",
  "./src/js/whereAreWe.js?v=fe7cdea2d-20261106-120742",
  "./src/js/drama.js?v=fe7cdea2d-20261106-120742",
  "./src/js/move-anim.js?v=fe7cdea2d-20261106-120742",
  "./src/js/presentation.js?v=fe7cdea2d-20261106-120742",
  "./src/js/sprites.js?v=fe7cdea2d-20261106-120742",
  "./src/js/tile-scenes.js?v=fe7cdea2d-20261106-120742",
  "./src/js/regional-audio.js?v=fe7cdea2d-20261106-120742",
  "./src/js/favor-company.js?v=fe7cdea2d-20261106-120742",
  "./src/js/timeSettlement.js?v=fe7cdea2d-20261106-120742",
  "./src/js/app.js?v=fe7cdea2d-20261106-120742",
  "./src/js/feel-audio.js?v=fe7cdea2d-20261106-120742",
  "./manifest.json?v=fe7cdea2d-20261106-120742",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=fe7cdea2d-20261106-120742",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=fe7cdea2d-20261106-120742",
  "./src/data/alienPlayers.json?v=fe7cdea2d-20261106-120742",
  "./src/data/animals.json?v=fe7cdea2d-20261106-120742",
  "./src/data/arrivalText.json?v=fe7cdea2d-20261106-120742",
  "./src/data/background_survivors.json?v=fe7cdea2d-20261106-120742",
  "./src/data/biomes.json?v=fe7cdea2d-20261106-120742",
  "./src/data/books.json?v=fe7cdea2d-20261106-120742",
  "./src/data/build-notes.json?v=fe7cdea2d-20261106-120742",
  "./src/data/cell_defs.json?v=fe7cdea2d-20261106-120742",
  "./src/data/characterGen.json?v=fe7cdea2d-20261106-120742",
  "./src/data/climates.json?v=fe7cdea2d-20261106-120742",
  "./src/data/contests.json?v=fe7cdea2d-20261106-120742",
  "./src/data/cooking.json?v=fe7cdea2d-20261106-120742",
  "./src/data/events.json?v=fe7cdea2d-20261106-120742",
  "./src/data/evolutions.json?v=fe7cdea2d-20261106-120742",
  "./src/data/favor-rules.json?v=fe7cdea2d-20261106-120742",
  "./src/data/feast-surge.json?v=fe7cdea2d-20261106-120742",
  "./src/data/foreignSpeech.json?v=fe7cdea2d-20261106-120742",
  "./src/data/gardening.json?v=fe7cdea2d-20261106-120742",
  "./src/data/godpaths.json?v=fe7cdea2d-20261106-120742",
  "./src/data/items.json?v=fe7cdea2d-20261106-120742",
  "./src/data/justiceVoice.json?v=fe7cdea2d-20261106-120742",
  "./src/data/knowledge.json?v=fe7cdea2d-20261106-120742",
  "./src/data/lifeseeds.json?v=fe7cdea2d-20261106-120742",
  "./src/data/locations.json?v=fe7cdea2d-20261106-120742",
  "./src/data/monsterBehaviors.json?v=fe7cdea2d-20261106-120742",
  "./src/data/monsters.json?v=fe7cdea2d-20261106-120742",
  "./src/data/nameCultures.json?v=fe7cdea2d-20261106-120742",
  "./src/data/originPicker.json?v=fe7cdea2d-20261106-120742",
  "./src/data/plants.json?v=fe7cdea2d-20261106-120742",
  "./src/data/presentation.json?v=fe7cdea2d-20261106-120742",
  "./src/data/recipes.json?v=fe7cdea2d-20261106-120742",
  "./src/data/regions.json?v=fe7cdea2d-20261106-120742",
  "./src/data/relicEnhancements.json?v=fe7cdea2d-20261106-120742",
  "./src/data/reward-economy.json?v=fe7cdea2d-20261106-120742",
  "./src/data/schemas.json?v=fe7cdea2d-20261106-120742",
  "./src/data/statusEffects.json?v=fe7cdea2d-20261106-120742",
  "./src/data/synergies.json?v=fe7cdea2d-20261106-120742",
  "./src/data/table-beats.json?v=fe7cdea2d-20261106-120742",
  "./src/data/table-endings.json?v=fe7cdea2d-20261106-120742",
  "./src/data/titans.json?v=fe7cdea2d-20261106-120742",
  "./src/data/tracks.json?v=fe7cdea2d-20261106-120742",
  "./src/data/villagers.json?v=fe7cdea2d-20261106-120742",
  "./src/data/wave-ledger.json?v=fe7cdea2d-20261106-120742"
];
// END GENERATED OFFLINE ASSETS

self.addEventListener('install', e => {
  // Cache everything fresh for this version, then sit in "waiting" —
  // do NOT skipWaiting here; the page decides when to switch.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Only cache successful same-origin basics; game data is versioned by CACHE.
        // AUDIO RUNTIME CACHE (2026-10-12): voice lines are 14MB — too heavy to
        // precache at install, but the fetch handler never stored them, so the
        // offline PWA lost all voice after first install. Cache audio responses
        // at runtime: play once online, then it works offline.
        try {
          const ct = resp.headers.get('content-type') || '';
          if (resp.ok && (ct.indexOf('audio/') === 0 || e.request.url.indexOf('/src/audio/') !== -1)) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          }
        } catch (err) { /* cache failure must never break playback */ }
        return resp;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline');
      });
    })
  );
});
