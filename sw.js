/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'dea9296f6-20261021-061958';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=dea9296f6-20261021-061958",
  "./src/js/engine/modifiers.js?v=dea9296f6-20261021-061958",
  "./src/js/engine/calories.js?v=dea9296f6-20261021-061958",
  "./src/js/engine/day.js?v=dea9296f6-20261021-061958",
  "./src/js/engine/forage.js?v=dea9296f6-20261021-061958",
  "./src/js/engine/combat.js?v=dea9296f6-20261021-061958",
  "./src/js/audio-registry.js?v=dea9296f6-20261021-061958",
  "./src/js/game.js?v=dea9296f6-20261021-061958",
  "./src/js/encounters.js?v=dea9296f6-20261021-061958",
  "./src/js/conversation.js?v=dea9296f6-20261021-061958",
  "./src/js/convo-mood.js?v=dea9296f6-20261021-061958",
  "./src/js/convoTopics.js?v=dea9296f6-20261021-061958",
  "./src/js/convo-wants.js?v=dea9296f6-20261021-061958",
  "./src/js/convo-dialogue.js?v=dea9296f6-20261021-061958",
  "./src/js/convo-beats.js?v=dea9296f6-20261021-061958",
  "./src/js/convo-scene.js?v=dea9296f6-20261021-061958",
  "./src/js/voice-piper.js?v=dea9296f6-20261021-061958",
  "./src/js/voice-system.js?v=dea9296f6-20261021-061958",
  "./src/js/examine.js?v=dea9296f6-20261021-061958",
  "./src/js/equipment.js?v=dea9296f6-20261021-061958",
  "./src/js/journal.js?v=dea9296f6-20261021-061958",
  "./src/js/party.js?v=dea9296f6-20261021-061958",
  "./src/js/favor-water.js?v=dea9296f6-20261021-061958",
  "./src/js/party-formal.js?v=dea9296f6-20261021-061958",
  "./src/js/truth.js?v=dea9296f6-20261021-061958",
  "./src/js/galactic-cast.js?v=dea9296f6-20261021-061958",
  "./src/js/contests.js?v=dea9296f6-20261021-061958",
  "./src/js/broadcast.js?v=dea9296f6-20261021-061958",
  "./src/js/contestEngine.js?v=dea9296f6-20261021-061958",
  "./src/js/alienPlayers.js?v=dea9296f6-20261021-061958",
  "./src/js/storage.js?v=dea9296f6-20261021-061958",
  "./src/js/perceive.js?v=dea9296f6-20261021-061958",
  "./src/js/carexplore.js?v=dea9296f6-20261021-061958",
  "./src/js/justice.js?v=dea9296f6-20261021-061958",
  "./src/js/food.js?v=dea9296f6-20261021-061958",
  "./src/js/betrayal.js?v=dea9296f6-20261021-061958",
  "./src/js/corpses.js?v=dea9296f6-20261021-061958",
  "./src/js/corruption.js?v=dea9296f6-20261021-061958",
  "./src/js/lifeseed.js?v=dea9296f6-20261021-061958",
  "./src/js/spawn-knack.js?v=dea9296f6-20261021-061958",
  "./src/js/trial-deeds.js?v=dea9296f6-20261021-061958",
  "./src/js/practice-deeds.js?v=dea9296f6-20261021-061958",
  "./src/js/tracks.js?v=dea9296f6-20261021-061958",
  "./src/js/villager-build.js?v=dea9296f6-20261021-061958",
  "./src/js/progression.js?v=dea9296f6-20261021-061958",
  "./src/js/waveLedger.js?v=dea9296f6-20261021-061958",
  "./src/js/standing.js?v=dea9296f6-20261021-061958",
  "./src/js/feastBuff.js?v=dea9296f6-20261021-061958",
  "./src/js/ledger.js?v=dea9296f6-20261021-061958",
  "./src/js/exposure.js?v=dea9296f6-20261021-061958",
  "./src/js/abilityActions.js?v=dea9296f6-20261021-061958",
  "./src/js/buildarounds.js?v=dea9296f6-20261021-061958",
  "./src/js/foodPower.js?v=dea9296f6-20261021-061958",
  "./src/js/monsterBehaviors.js?v=dea9296f6-20261021-061958",
  "./src/js/partyTactics.js?v=dea9296f6-20261021-061958",
  "./src/js/sigW3a.js?v=dea9296f6-20261021-061958",
  "./src/js/statusEffects.js?v=dea9296f6-20261021-061958",
  "./src/js/sigW3b.js?v=dea9296f6-20261021-061958",
  "./src/js/metaProgression.js?v=dea9296f6-20261021-061958",
  "./src/js/sigW3c.js?v=dea9296f6-20261021-061958",
  "./src/js/sigW4.js?v=dea9296f6-20261021-061958",
  "./src/js/sigW5.js?v=dea9296f6-20261021-061958",
  "./src/js/villager-agency.js?v=dea9296f6-20261021-061958",
  "./src/js/fieldFights.js?v=dea9296f6-20261021-061958",
  "./src/js/party-wiring.js?v=dea9296f6-20261021-061958",
  "./src/js/party-bond.js?v=dea9296f6-20261021-061958",
  "./src/js/villager-objectives.js?v=dea9296f6-20261021-061958",
  "./src/js/villager-mapmem.js?v=dea9296f6-20261021-061958",
  "./src/js/codex-people.js?v=dea9296f6-20261021-061958",
  "./src/js/membership.js?v=dea9296f6-20261021-061958",
  "./src/js/gardenCultivation.js?v=dea9296f6-20261021-061958",
  "./src/js/havenGrowth.js?v=dea9296f6-20261021-061958",
  "./src/js/shelter.js?v=dea9296f6-20261021-061958",
  "./src/js/hierarchy.js?v=dea9296f6-20261021-061958",
  "./src/js/scaleDiscovery.js?v=dea9296f6-20261021-061958",
  "./src/js/comms.js?v=dea9296f6-20261021-061958",
  "./src/js/table.js?v=dea9296f6-20261021-061958",
  "./src/js/pods.js?v=dea9296f6-20261021-061958",
  "./src/js/titans.js?v=dea9296f6-20261021-061958",
  "./src/js/finale-campaign.js?v=dea9296f6-20261021-061958",
  "./src/js/godhood.js?v=dea9296f6-20261021-061958",
  "./src/js/pantheon.js?v=dea9296f6-20261021-061958",
  "./src/js/records.js?v=dea9296f6-20261021-061958",
  "./src/js/table-feared.js?v=dea9296f6-20261021-061958",
  "./src/js/table-indispensable.js?v=dea9296f6-20261021-061958",
  "./src/js/table-beloved.js?v=dea9296f6-20261021-061958",
  "./src/js/table-witness.js?v=dea9296f6-20261021-061958",
  "./src/js/table-assimilated.js?v=dea9296f6-20261021-061958",
  "./src/js/table-defiant.js?v=dea9296f6-20261021-061958",
  "./src/js/relay-ext.js?v=dea9296f6-20261021-061958",
  "./src/js/relay-dialogue.js?v=dea9296f6-20261021-061958",
  "./src/js/table-relay.js?v=dea9296f6-20261021-061958",
  "./src/js/safetynets.js?v=dea9296f6-20261021-061958",
  "./src/js/villageAgency.js?v=dea9296f6-20261021-061958",
  "./src/js/memdepth.js?v=dea9296f6-20261021-061958",
  "./src/js/overtime.js?v=dea9296f6-20261021-061958",
  "./src/js/network-campaign.js?v=dea9296f6-20261021-061958",
  "./src/js/debug-scenarios.js?v=dea9296f6-20261021-061958",
  "./src/js/keepsakes.js?v=dea9296f6-20261021-061958",
  "./src/js/skill-teaching.js?v=dea9296f6-20261021-061958",
  "./src/js/world.js?v=dea9296f6-20261021-061958",
  "./src/js/nomad.js?v=dea9296f6-20261021-061958",
  "./src/js/nomad-wild.js?v=dea9296f6-20261021-061958",
  "./src/js/nomad-scenes.js?v=dea9296f6-20261021-061958",
  "./src/js/nomad-drive.js?v=dea9296f6-20261021-061958",
  "./src/js/temperature.js?v=dea9296f6-20261021-061958",
  "./src/js/godpath.js?v=dea9296f6-20261021-061958",
  "./src/js/godverbs.js?v=dea9296f6-20261021-061958",
  "./src/js/endingKey.js?v=dea9296f6-20261021-061958",
  "./src/js/telemetry-hooks.js?v=dea9296f6-20261021-061958",
  "./src/js/feel.js?v=dea9296f6-20261021-061958",
  "./src/js/build.js?v=dea9296f6-20261021-061958",
  "./src/js/whereAreWe.js?v=dea9296f6-20261021-061958",
  "./src/js/drama.js?v=dea9296f6-20261021-061958",
  "./src/js/move-anim.js?v=dea9296f6-20261021-061958",
  "./src/js/presentation.js?v=dea9296f6-20261021-061958",
  "./src/js/sprites.js?v=dea9296f6-20261021-061958",
  "./src/js/tile-scenes.js?v=dea9296f6-20261021-061958",
  "./src/js/regional-audio.js?v=dea9296f6-20261021-061958",
  "./src/js/favor-company.js?v=dea9296f6-20261021-061958",
  "./src/js/timeSettlement.js?v=dea9296f6-20261021-061958",
  "./src/js/app.js?v=dea9296f6-20261021-061958",
  "./src/js/feel-audio.js?v=dea9296f6-20261021-061958",
  "./manifest.json?v=dea9296f6-20261021-061958",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=dea9296f6-20261021-061958",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=dea9296f6-20261021-061958",
  "./src/data/alienPlayers.json?v=dea9296f6-20261021-061958",
  "./src/data/animals.json?v=dea9296f6-20261021-061958",
  "./src/data/arrivalText.json?v=dea9296f6-20261021-061958",
  "./src/data/background_survivors.json?v=dea9296f6-20261021-061958",
  "./src/data/biomes.json?v=dea9296f6-20261021-061958",
  "./src/data/books.json?v=dea9296f6-20261021-061958",
  "./src/data/build-notes.json?v=dea9296f6-20261021-061958",
  "./src/data/cell_defs.json?v=dea9296f6-20261021-061958",
  "./src/data/characterGen.json?v=dea9296f6-20261021-061958",
  "./src/data/climates.json?v=dea9296f6-20261021-061958",
  "./src/data/contests.json?v=dea9296f6-20261021-061958",
  "./src/data/cooking.json?v=dea9296f6-20261021-061958",
  "./src/data/events.json?v=dea9296f6-20261021-061958",
  "./src/data/evolutions.json?v=dea9296f6-20261021-061958",
  "./src/data/favor-rules.json?v=dea9296f6-20261021-061958",
  "./src/data/feast-surge.json?v=dea9296f6-20261021-061958",
  "./src/data/foreignSpeech.json?v=dea9296f6-20261021-061958",
  "./src/data/gardening.json?v=dea9296f6-20261021-061958",
  "./src/data/godpaths.json?v=dea9296f6-20261021-061958",
  "./src/data/items.json?v=dea9296f6-20261021-061958",
  "./src/data/justiceVoice.json?v=dea9296f6-20261021-061958",
  "./src/data/knowledge.json?v=dea9296f6-20261021-061958",
  "./src/data/lifeseeds.json?v=dea9296f6-20261021-061958",
  "./src/data/locations.json?v=dea9296f6-20261021-061958",
  "./src/data/monsterBehaviors.json?v=dea9296f6-20261021-061958",
  "./src/data/monsters.json?v=dea9296f6-20261021-061958",
  "./src/data/nameCultures.json?v=dea9296f6-20261021-061958",
  "./src/data/originPicker.json?v=dea9296f6-20261021-061958",
  "./src/data/plants.json?v=dea9296f6-20261021-061958",
  "./src/data/presentation.json?v=dea9296f6-20261021-061958",
  "./src/data/recipes.json?v=dea9296f6-20261021-061958",
  "./src/data/regions.json?v=dea9296f6-20261021-061958",
  "./src/data/relicEnhancements.json?v=dea9296f6-20261021-061958",
  "./src/data/reward-economy.json?v=dea9296f6-20261021-061958",
  "./src/data/schemas.json?v=dea9296f6-20261021-061958",
  "./src/data/statusEffects.json?v=dea9296f6-20261021-061958",
  "./src/data/synergies.json?v=dea9296f6-20261021-061958",
  "./src/data/table-beats.json?v=dea9296f6-20261021-061958",
  "./src/data/table-endings.json?v=dea9296f6-20261021-061958",
  "./src/data/titans.json?v=dea9296f6-20261021-061958",
  "./src/data/tracks.json?v=dea9296f6-20261021-061958",
  "./src/data/villagers.json?v=dea9296f6-20261021-061958",
  "./src/data/wave-ledger.json?v=dea9296f6-20261021-061958"
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
