/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'efdfd56c9-20261024-112420';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=efdfd56c9-20261024-112420",
  "./src/js/engine/modifiers.js?v=efdfd56c9-20261024-112420",
  "./src/js/engine/calories.js?v=efdfd56c9-20261024-112420",
  "./src/js/engine/day.js?v=efdfd56c9-20261024-112420",
  "./src/js/engine/forage.js?v=efdfd56c9-20261024-112420",
  "./src/js/engine/combat.js?v=efdfd56c9-20261024-112420",
  "./src/js/audio-registry.js?v=efdfd56c9-20261024-112420",
  "./src/js/text.js?v=efdfd56c9-20261024-112420",
  "./src/js/game.js?v=efdfd56c9-20261024-112420",
  "./src/js/encounters.js?v=efdfd56c9-20261024-112420",
  "./src/js/conversation.js?v=efdfd56c9-20261024-112420",
  "./src/js/convo-mood.js?v=efdfd56c9-20261024-112420",
  "./src/js/convoTopics.js?v=efdfd56c9-20261024-112420",
  "./src/js/naming-rite.js?v=efdfd56c9-20261024-112420",
  "./src/js/convo-wants.js?v=efdfd56c9-20261024-112420",
  "./src/js/convo-dialogue.js?v=efdfd56c9-20261024-112420",
  "./src/js/convo-beats.js?v=efdfd56c9-20261024-112420",
  "./src/js/convo-scene.js?v=efdfd56c9-20261024-112420",
  "./src/js/voice-piper.js?v=efdfd56c9-20261024-112420",
  "./src/js/voice-system.js?v=efdfd56c9-20261024-112420",
  "./src/js/examine.js?v=efdfd56c9-20261024-112420",
  "./src/js/equipment.js?v=efdfd56c9-20261024-112420",
  "./src/js/journal.js?v=efdfd56c9-20261024-112420",
  "./src/js/party.js?v=efdfd56c9-20261024-112420",
  "./src/js/favor-water.js?v=efdfd56c9-20261024-112420",
  "./src/js/party-formal.js?v=efdfd56c9-20261024-112420",
  "./src/js/truth.js?v=efdfd56c9-20261024-112420",
  "./src/js/galactic-cast.js?v=efdfd56c9-20261024-112420",
  "./src/js/contests.js?v=efdfd56c9-20261024-112420",
  "./src/js/broadcast.js?v=efdfd56c9-20261024-112420",
  "./src/js/contestEngine.js?v=efdfd56c9-20261024-112420",
  "./src/js/alienPlayers.js?v=efdfd56c9-20261024-112420",
  "./src/js/storage.js?v=efdfd56c9-20261024-112420",
  "./src/js/perceive.js?v=efdfd56c9-20261024-112420",
  "./src/js/carexplore.js?v=efdfd56c9-20261024-112420",
  "./src/js/justice.js?v=efdfd56c9-20261024-112420",
  "./src/js/food.js?v=efdfd56c9-20261024-112420",
  "./src/js/betrayal.js?v=efdfd56c9-20261024-112420",
  "./src/js/corpses.js?v=efdfd56c9-20261024-112420",
  "./src/js/corruption.js?v=efdfd56c9-20261024-112420",
  "./src/js/lifeseed.js?v=efdfd56c9-20261024-112420",
  "./src/js/spawn-knack.js?v=efdfd56c9-20261024-112420",
  "./src/js/trial-deeds.js?v=efdfd56c9-20261024-112420",
  "./src/js/practice-deeds.js?v=efdfd56c9-20261024-112420",
  "./src/js/tracks.js?v=efdfd56c9-20261024-112420",
  "./src/js/villager-build.js?v=efdfd56c9-20261024-112420",
  "./src/js/progression.js?v=efdfd56c9-20261024-112420",
  "./src/js/waveLedger.js?v=efdfd56c9-20261024-112420",
  "./src/js/standing.js?v=efdfd56c9-20261024-112420",
  "./src/js/feastBuff.js?v=efdfd56c9-20261024-112420",
  "./src/js/ledger.js?v=efdfd56c9-20261024-112420",
  "./src/js/exposure.js?v=efdfd56c9-20261024-112420",
  "./src/js/abilityActions.js?v=efdfd56c9-20261024-112420",
  "./src/js/buildarounds.js?v=efdfd56c9-20261024-112420",
  "./src/js/foodPower.js?v=efdfd56c9-20261024-112420",
  "./src/js/monsterBehaviors.js?v=efdfd56c9-20261024-112420",
  "./src/js/partyTactics.js?v=efdfd56c9-20261024-112420",
  "./src/js/sigW3a.js?v=efdfd56c9-20261024-112420",
  "./src/js/statusEffects.js?v=efdfd56c9-20261024-112420",
  "./src/js/sigW3b.js?v=efdfd56c9-20261024-112420",
  "./src/js/metaProgression.js?v=efdfd56c9-20261024-112420",
  "./src/js/sigW3c.js?v=efdfd56c9-20261024-112420",
  "./src/js/sigW4.js?v=efdfd56c9-20261024-112420",
  "./src/js/sigW5.js?v=efdfd56c9-20261024-112420",
  "./src/js/villager-agency.js?v=efdfd56c9-20261024-112420",
  "./src/js/npc-triggers.js?v=efdfd56c9-20261024-112420",
  "./src/js/fieldFights.js?v=efdfd56c9-20261024-112420",
  "./src/js/party-wiring.js?v=efdfd56c9-20261024-112420",
  "./src/js/party-bond.js?v=efdfd56c9-20261024-112420",
  "./src/js/villager-objectives.js?v=efdfd56c9-20261024-112420",
  "./src/js/villager-mapmem.js?v=efdfd56c9-20261024-112420",
  "./src/js/codex-people.js?v=efdfd56c9-20261024-112420",
  "./src/js/fallen-memorial.js?v=efdfd56c9-20261024-112420",
  "./src/js/graves.js?v=efdfd56c9-20261024-112420",
  "./src/js/membership.js?v=efdfd56c9-20261024-112420",
  "./src/js/gardenCultivation.js?v=efdfd56c9-20261024-112420",
  "./src/js/havenGrowth.js?v=efdfd56c9-20261024-112420",
  "./src/js/shelter.js?v=efdfd56c9-20261024-112420",
  "./src/js/hierarchy.js?v=efdfd56c9-20261024-112420",
  "./src/js/scaleDiscovery.js?v=efdfd56c9-20261024-112420",
  "./src/js/comms.js?v=efdfd56c9-20261024-112420",
  "./src/js/table.js?v=efdfd56c9-20261024-112420",
  "./src/js/pods.js?v=efdfd56c9-20261024-112420",
  "./src/js/titans.js?v=efdfd56c9-20261024-112420",
  "./src/js/finale-campaign.js?v=efdfd56c9-20261024-112420",
  "./src/js/godhood.js?v=efdfd56c9-20261024-112420",
  "./src/js/pantheon.js?v=efdfd56c9-20261024-112420",
  "./src/js/records.js?v=efdfd56c9-20261024-112420",
  "./src/js/table-feared.js?v=efdfd56c9-20261024-112420",
  "./src/js/table-indispensable.js?v=efdfd56c9-20261024-112420",
  "./src/js/table-beloved.js?v=efdfd56c9-20261024-112420",
  "./src/js/table-witness.js?v=efdfd56c9-20261024-112420",
  "./src/js/table-assimilated.js?v=efdfd56c9-20261024-112420",
  "./src/js/table-defiant.js?v=efdfd56c9-20261024-112420",
  "./src/js/relay-ext.js?v=efdfd56c9-20261024-112420",
  "./src/js/relay-dialogue.js?v=efdfd56c9-20261024-112420",
  "./src/js/table-relay.js?v=efdfd56c9-20261024-112420",
  "./src/js/safetynets.js?v=efdfd56c9-20261024-112420",
  "./src/js/villageAgency.js?v=efdfd56c9-20261024-112420",
  "./src/js/memdepth.js?v=efdfd56c9-20261024-112420",
  "./src/js/overtime.js?v=efdfd56c9-20261024-112420",
  "./src/js/network-campaign.js?v=efdfd56c9-20261024-112420",
  "./src/js/debug-scenarios.js?v=efdfd56c9-20261024-112420",
  "./src/js/keepsakes.js?v=efdfd56c9-20261024-112420",
  "./src/js/skill-teaching.js?v=efdfd56c9-20261024-112420",
  "./src/js/world.js?v=efdfd56c9-20261024-112420",
  "./src/js/nomad.js?v=efdfd56c9-20261024-112420",
  "./src/js/nomad-wild.js?v=efdfd56c9-20261024-112420",
  "./src/js/nomad-scenes.js?v=efdfd56c9-20261024-112420",
  "./src/js/nomad-drive.js?v=efdfd56c9-20261024-112420",
  "./src/js/temperature.js?v=efdfd56c9-20261024-112420",
  "./src/js/godpath.js?v=efdfd56c9-20261024-112420",
  "./src/js/godverbs.js?v=efdfd56c9-20261024-112420",
  "./src/js/endingKey.js?v=efdfd56c9-20261024-112420",
  "./src/js/telemetry-hooks.js?v=efdfd56c9-20261024-112420",
  "./src/js/feel.js?v=efdfd56c9-20261024-112420",
  "./src/js/build.js?v=efdfd56c9-20261024-112420",
  "./src/js/whereAreWe.js?v=efdfd56c9-20261024-112420",
  "./src/js/drama.js?v=efdfd56c9-20261024-112420",
  "./src/js/move-anim.js?v=efdfd56c9-20261024-112420",
  "./src/js/presentation.js?v=efdfd56c9-20261024-112420",
  "./src/js/sprites.js?v=efdfd56c9-20261024-112420",
  "./src/js/tile-scenes.js?v=efdfd56c9-20261024-112420",
  "./src/js/regional-audio.js?v=efdfd56c9-20261024-112420",
  "./src/js/favor-company.js?v=efdfd56c9-20261024-112420",
  "./src/js/timeSettlement.js?v=efdfd56c9-20261024-112420",
  "./src/js/app.js?v=efdfd56c9-20261024-112420",
  "./src/js/feel-audio.js?v=efdfd56c9-20261024-112420",
  "./manifest.json?v=efdfd56c9-20261024-112420",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=efdfd56c9-20261024-112420",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=efdfd56c9-20261024-112420",
  "./src/data/alienPlayers.json?v=efdfd56c9-20261024-112420",
  "./src/data/animals.json?v=efdfd56c9-20261024-112420",
  "./src/data/arrivalText.json?v=efdfd56c9-20261024-112420",
  "./src/data/background_survivors.json?v=efdfd56c9-20261024-112420",
  "./src/data/biomes.json?v=efdfd56c9-20261024-112420",
  "./src/data/books.json?v=efdfd56c9-20261024-112420",
  "./src/data/build-notes.json?v=efdfd56c9-20261024-112420",
  "./src/data/cell_defs.json?v=efdfd56c9-20261024-112420",
  "./src/data/characterGen.json?v=efdfd56c9-20261024-112420",
  "./src/data/climates.json?v=efdfd56c9-20261024-112420",
  "./src/data/contests.json?v=efdfd56c9-20261024-112420",
  "./src/data/cooking.json?v=efdfd56c9-20261024-112420",
  "./src/data/events.json?v=efdfd56c9-20261024-112420",
  "./src/data/evolutions.json?v=efdfd56c9-20261024-112420",
  "./src/data/favor-rules.json?v=efdfd56c9-20261024-112420",
  "./src/data/feast-surge.json?v=efdfd56c9-20261024-112420",
  "./src/data/foreignSpeech.json?v=efdfd56c9-20261024-112420",
  "./src/data/gardening.json?v=efdfd56c9-20261024-112420",
  "./src/data/godpaths.json?v=efdfd56c9-20261024-112420",
  "./src/data/items.json?v=efdfd56c9-20261024-112420",
  "./src/data/justiceVoice.json?v=efdfd56c9-20261024-112420",
  "./src/data/knowledge.json?v=efdfd56c9-20261024-112420",
  "./src/data/lifeseeds.json?v=efdfd56c9-20261024-112420",
  "./src/data/locations.json?v=efdfd56c9-20261024-112420",
  "./src/data/monsterBehaviors.json?v=efdfd56c9-20261024-112420",
  "./src/data/monsters.json?v=efdfd56c9-20261024-112420",
  "./src/data/nameCultures.json?v=efdfd56c9-20261024-112420",
  "./src/data/originPicker.json?v=efdfd56c9-20261024-112420",
  "./src/data/plants.json?v=efdfd56c9-20261024-112420",
  "./src/data/presentation.json?v=efdfd56c9-20261024-112420",
  "./src/data/recipes.json?v=efdfd56c9-20261024-112420",
  "./src/data/regions.json?v=efdfd56c9-20261024-112420",
  "./src/data/relicEnhancements.json?v=efdfd56c9-20261024-112420",
  "./src/data/reward-economy.json?v=efdfd56c9-20261024-112420",
  "./src/data/schemas.json?v=efdfd56c9-20261024-112420",
  "./src/data/statusEffects.json?v=efdfd56c9-20261024-112420",
  "./src/data/synergies.json?v=efdfd56c9-20261024-112420",
  "./src/data/table-beats.json?v=efdfd56c9-20261024-112420",
  "./src/data/table-endings.json?v=efdfd56c9-20261024-112420",
  "./src/data/titans.json?v=efdfd56c9-20261024-112420",
  "./src/data/tracks.json?v=efdfd56c9-20261024-112420",
  "./src/data/villagers.json?v=efdfd56c9-20261024-112420",
  "./src/data/wave-ledger.json?v=efdfd56c9-20261024-112420"
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
