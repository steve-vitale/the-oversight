/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'f72e4bd16-20261105-112414';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=f72e4bd16-20261105-112414",
  "./src/js/engine/modifiers.js?v=f72e4bd16-20261105-112414",
  "./src/js/engine/calories.js?v=f72e4bd16-20261105-112414",
  "./src/js/engine/day.js?v=f72e4bd16-20261105-112414",
  "./src/js/engine/forage.js?v=f72e4bd16-20261105-112414",
  "./src/js/engine/combat.js?v=f72e4bd16-20261105-112414",
  "./src/js/audio-registry.js?v=f72e4bd16-20261105-112414",
  "./src/js/text.js?v=f72e4bd16-20261105-112414",
  "./src/js/game.js?v=f72e4bd16-20261105-112414",
  "./src/js/encounters.js?v=f72e4bd16-20261105-112414",
  "./src/js/conversation.js?v=f72e4bd16-20261105-112414",
  "./src/js/convo-mood.js?v=f72e4bd16-20261105-112414",
  "./src/js/convoTopics.js?v=f72e4bd16-20261105-112414",
  "./src/js/naming-rite.js?v=f72e4bd16-20261105-112414",
  "./src/js/convo-wants.js?v=f72e4bd16-20261105-112414",
  "./src/js/convo-dialogue.js?v=f72e4bd16-20261105-112414",
  "./src/js/convo-beats.js?v=f72e4bd16-20261105-112414",
  "./src/js/convo-scene.js?v=f72e4bd16-20261105-112414",
  "./src/js/voice-piper.js?v=f72e4bd16-20261105-112414",
  "./src/js/voice-system.js?v=f72e4bd16-20261105-112414",
  "./src/js/examine.js?v=f72e4bd16-20261105-112414",
  "./src/js/equipment.js?v=f72e4bd16-20261105-112414",
  "./src/js/journal.js?v=f72e4bd16-20261105-112414",
  "./src/js/party.js?v=f72e4bd16-20261105-112414",
  "./src/js/favor-water.js?v=f72e4bd16-20261105-112414",
  "./src/js/favor-forage.js?v=f72e4bd16-20261105-112414",
  "./src/js/favor-outing.js?v=f72e4bd16-20261105-112414",
  "./src/js/party-formal.js?v=f72e4bd16-20261105-112414",
  "./src/js/truth.js?v=f72e4bd16-20261105-112414",
  "./src/js/galactic-cast.js?v=f72e4bd16-20261105-112414",
  "./src/js/contests.js?v=f72e4bd16-20261105-112414",
  "./src/js/broadcast.js?v=f72e4bd16-20261105-112414",
  "./src/js/contestEngine.js?v=f72e4bd16-20261105-112414",
  "./src/js/alienPlayers.js?v=f72e4bd16-20261105-112414",
  "./src/js/storage.js?v=f72e4bd16-20261105-112414",
  "./src/js/perceive.js?v=f72e4bd16-20261105-112414",
  "./src/js/carexplore.js?v=f72e4bd16-20261105-112414",
  "./src/js/justice.js?v=f72e4bd16-20261105-112414",
  "./src/js/food.js?v=f72e4bd16-20261105-112414",
  "./src/js/betrayal.js?v=f72e4bd16-20261105-112414",
  "./src/js/corpses.js?v=f72e4bd16-20261105-112414",
  "./src/js/corruption.js?v=f72e4bd16-20261105-112414",
  "./src/js/lifeseed.js?v=f72e4bd16-20261105-112414",
  "./src/js/spawn-knack.js?v=f72e4bd16-20261105-112414",
  "./src/js/trial-deeds.js?v=f72e4bd16-20261105-112414",
  "./src/js/practice-deeds.js?v=f72e4bd16-20261105-112414",
  "./src/js/tracks.js?v=f72e4bd16-20261105-112414",
  "./src/js/villager-build.js?v=f72e4bd16-20261105-112414",
  "./src/js/progression.js?v=f72e4bd16-20261105-112414",
  "./src/js/waveLedger.js?v=f72e4bd16-20261105-112414",
  "./src/js/standing.js?v=f72e4bd16-20261105-112414",
  "./src/js/feastBuff.js?v=f72e4bd16-20261105-112414",
  "./src/js/ledger.js?v=f72e4bd16-20261105-112414",
  "./src/js/exposure.js?v=f72e4bd16-20261105-112414",
  "./src/js/abilityActions.js?v=f72e4bd16-20261105-112414",
  "./src/js/buildarounds.js?v=f72e4bd16-20261105-112414",
  "./src/js/foodPower.js?v=f72e4bd16-20261105-112414",
  "./src/js/monsterBehaviors.js?v=f72e4bd16-20261105-112414",
  "./src/js/partyTactics.js?v=f72e4bd16-20261105-112414",
  "./src/js/sigW3a.js?v=f72e4bd16-20261105-112414",
  "./src/js/statusEffects.js?v=f72e4bd16-20261105-112414",
  "./src/js/sigW3b.js?v=f72e4bd16-20261105-112414",
  "./src/js/metaProgression.js?v=f72e4bd16-20261105-112414",
  "./src/js/sigW3c.js?v=f72e4bd16-20261105-112414",
  "./src/js/sigW4.js?v=f72e4bd16-20261105-112414",
  "./src/js/sigW5.js?v=f72e4bd16-20261105-112414",
  "./src/js/villager-agency.js?v=f72e4bd16-20261105-112414",
  "./src/js/win-plan.js?v=f72e4bd16-20261105-112414",
  "./src/js/npc-triggers.js?v=f72e4bd16-20261105-112414",
  "./src/js/fieldFights.js?v=f72e4bd16-20261105-112414",
  "./src/js/party-wiring.js?v=f72e4bd16-20261105-112414",
  "./src/js/party-bond.js?v=f72e4bd16-20261105-112414",
  "./src/js/villager-objectives.js?v=f72e4bd16-20261105-112414",
  "./src/js/villager-goals.js?v=f72e4bd16-20261105-112414",
  "./src/js/villager-mapmem.js?v=f72e4bd16-20261105-112414",
  "./src/js/codex-people.js?v=f72e4bd16-20261105-112414",
  "./src/js/fallen-memorial.js?v=f72e4bd16-20261105-112414",
  "./src/js/graves.js?v=f72e4bd16-20261105-112414",
  "./src/js/membership.js?v=f72e4bd16-20261105-112414",
  "./src/js/gardenCultivation.js?v=f72e4bd16-20261105-112414",
  "./src/js/havenGrowth.js?v=f72e4bd16-20261105-112414",
  "./src/js/shelter.js?v=f72e4bd16-20261105-112414",
  "./src/js/hierarchy.js?v=f72e4bd16-20261105-112414",
  "./src/js/scaleDiscovery.js?v=f72e4bd16-20261105-112414",
  "./src/js/comms.js?v=f72e4bd16-20261105-112414",
  "./src/js/table.js?v=f72e4bd16-20261105-112414",
  "./src/js/pods.js?v=f72e4bd16-20261105-112414",
  "./src/js/titans.js?v=f72e4bd16-20261105-112414",
  "./src/js/finale-campaign.js?v=f72e4bd16-20261105-112414",
  "./src/js/godhood.js?v=f72e4bd16-20261105-112414",
  "./src/js/pantheon.js?v=f72e4bd16-20261105-112414",
  "./src/js/records.js?v=f72e4bd16-20261105-112414",
  "./src/js/table-feared.js?v=f72e4bd16-20261105-112414",
  "./src/js/table-indispensable.js?v=f72e4bd16-20261105-112414",
  "./src/js/table-beloved.js?v=f72e4bd16-20261105-112414",
  "./src/js/table-witness.js?v=f72e4bd16-20261105-112414",
  "./src/js/table-assimilated.js?v=f72e4bd16-20261105-112414",
  "./src/js/table-defiant.js?v=f72e4bd16-20261105-112414",
  "./src/js/relay-ext.js?v=f72e4bd16-20261105-112414",
  "./src/js/relay-dialogue.js?v=f72e4bd16-20261105-112414",
  "./src/js/table-relay.js?v=f72e4bd16-20261105-112414",
  "./src/js/safetynets.js?v=f72e4bd16-20261105-112414",
  "./src/js/villageAgency.js?v=f72e4bd16-20261105-112414",
  "./src/js/memdepth.js?v=f72e4bd16-20261105-112414",
  "./src/js/overtime.js?v=f72e4bd16-20261105-112414",
  "./src/js/network-campaign.js?v=f72e4bd16-20261105-112414",
  "./src/js/debug-scenarios.js?v=f72e4bd16-20261105-112414",
  "./src/js/keepsakes.js?v=f72e4bd16-20261105-112414",
  "./src/js/skill-teaching.js?v=f72e4bd16-20261105-112414",
  "./src/js/world.js?v=f72e4bd16-20261105-112414",
  "./src/js/nomad.js?v=f72e4bd16-20261105-112414",
  "./src/js/nomad-wild.js?v=f72e4bd16-20261105-112414",
  "./src/js/nomad-scenes.js?v=f72e4bd16-20261105-112414",
  "./src/js/nomad-drive.js?v=f72e4bd16-20261105-112414",
  "./src/js/temperature.js?v=f72e4bd16-20261105-112414",
  "./src/js/godpath.js?v=f72e4bd16-20261105-112414",
  "./src/js/godverbs.js?v=f72e4bd16-20261105-112414",
  "./src/js/endingKey.js?v=f72e4bd16-20261105-112414",
  "./src/js/telemetry-hooks.js?v=f72e4bd16-20261105-112414",
  "./src/js/feel.js?v=f72e4bd16-20261105-112414",
  "./src/js/build.js?v=f72e4bd16-20261105-112414",
  "./src/js/whereAreWe.js?v=f72e4bd16-20261105-112414",
  "./src/js/drama.js?v=f72e4bd16-20261105-112414",
  "./src/js/move-anim.js?v=f72e4bd16-20261105-112414",
  "./src/js/presentation.js?v=f72e4bd16-20261105-112414",
  "./src/js/sprites.js?v=f72e4bd16-20261105-112414",
  "./src/js/tile-scenes.js?v=f72e4bd16-20261105-112414",
  "./src/js/regional-audio.js?v=f72e4bd16-20261105-112414",
  "./src/js/favor-company.js?v=f72e4bd16-20261105-112414",
  "./src/js/timeSettlement.js?v=f72e4bd16-20261105-112414",
  "./src/js/app.js?v=f72e4bd16-20261105-112414",
  "./src/js/feel-audio.js?v=f72e4bd16-20261105-112414",
  "./manifest.json?v=f72e4bd16-20261105-112414",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=f72e4bd16-20261105-112414",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=f72e4bd16-20261105-112414",
  "./src/data/alienPlayers.json?v=f72e4bd16-20261105-112414",
  "./src/data/animals.json?v=f72e4bd16-20261105-112414",
  "./src/data/arrivalText.json?v=f72e4bd16-20261105-112414",
  "./src/data/background_survivors.json?v=f72e4bd16-20261105-112414",
  "./src/data/biomes.json?v=f72e4bd16-20261105-112414",
  "./src/data/books.json?v=f72e4bd16-20261105-112414",
  "./src/data/build-notes.json?v=f72e4bd16-20261105-112414",
  "./src/data/cell_defs.json?v=f72e4bd16-20261105-112414",
  "./src/data/characterGen.json?v=f72e4bd16-20261105-112414",
  "./src/data/climates.json?v=f72e4bd16-20261105-112414",
  "./src/data/contests.json?v=f72e4bd16-20261105-112414",
  "./src/data/cooking.json?v=f72e4bd16-20261105-112414",
  "./src/data/events.json?v=f72e4bd16-20261105-112414",
  "./src/data/evolutions.json?v=f72e4bd16-20261105-112414",
  "./src/data/favor-rules.json?v=f72e4bd16-20261105-112414",
  "./src/data/feast-surge.json?v=f72e4bd16-20261105-112414",
  "./src/data/foreignSpeech.json?v=f72e4bd16-20261105-112414",
  "./src/data/gardening.json?v=f72e4bd16-20261105-112414",
  "./src/data/godpaths.json?v=f72e4bd16-20261105-112414",
  "./src/data/items.json?v=f72e4bd16-20261105-112414",
  "./src/data/justiceVoice.json?v=f72e4bd16-20261105-112414",
  "./src/data/knowledge.json?v=f72e4bd16-20261105-112414",
  "./src/data/lifeseeds.json?v=f72e4bd16-20261105-112414",
  "./src/data/locations.json?v=f72e4bd16-20261105-112414",
  "./src/data/monsterBehaviors.json?v=f72e4bd16-20261105-112414",
  "./src/data/monsters.json?v=f72e4bd16-20261105-112414",
  "./src/data/nameCultures.json?v=f72e4bd16-20261105-112414",
  "./src/data/originPicker.json?v=f72e4bd16-20261105-112414",
  "./src/data/plants.json?v=f72e4bd16-20261105-112414",
  "./src/data/presentation.json?v=f72e4bd16-20261105-112414",
  "./src/data/recipes.json?v=f72e4bd16-20261105-112414",
  "./src/data/regions.json?v=f72e4bd16-20261105-112414",
  "./src/data/relicEnhancements.json?v=f72e4bd16-20261105-112414",
  "./src/data/reward-economy.json?v=f72e4bd16-20261105-112414",
  "./src/data/schemas.json?v=f72e4bd16-20261105-112414",
  "./src/data/statusEffects.json?v=f72e4bd16-20261105-112414",
  "./src/data/synergies.json?v=f72e4bd16-20261105-112414",
  "./src/data/table-beats.json?v=f72e4bd16-20261105-112414",
  "./src/data/table-endings.json?v=f72e4bd16-20261105-112414",
  "./src/data/titans.json?v=f72e4bd16-20261105-112414",
  "./src/data/tracks.json?v=f72e4bd16-20261105-112414",
  "./src/data/villagers.json?v=f72e4bd16-20261105-112414",
  "./src/data/wave-ledger.json?v=f72e4bd16-20261105-112414"
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
