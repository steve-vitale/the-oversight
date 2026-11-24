/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'ebc163fe8-20261124-233806';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=ebc163fe8-20261124-233806",
  "./src/js/engine/modifiers.js?v=ebc163fe8-20261124-233806",
  "./src/js/engine/calories.js?v=ebc163fe8-20261124-233806",
  "./src/js/engine/day.js?v=ebc163fe8-20261124-233806",
  "./src/js/engine/forage.js?v=ebc163fe8-20261124-233806",
  "./src/js/engine/combat.js?v=ebc163fe8-20261124-233806",
  "./src/js/audio-registry.js?v=ebc163fe8-20261124-233806",
  "./src/js/text.js?v=ebc163fe8-20261124-233806",
  "./src/js/game.js?v=ebc163fe8-20261124-233806",
  "./src/js/encounters.js?v=ebc163fe8-20261124-233806",
  "./src/js/conversation.js?v=ebc163fe8-20261124-233806",
  "./src/js/convo-mood.js?v=ebc163fe8-20261124-233806",
  "./src/js/convoTopics.js?v=ebc163fe8-20261124-233806",
  "./src/js/naming-rite.js?v=ebc163fe8-20261124-233806",
  "./src/js/convo-wants.js?v=ebc163fe8-20261124-233806",
  "./src/js/convo-dialogue.js?v=ebc163fe8-20261124-233806",
  "./src/js/convo-beats.js?v=ebc163fe8-20261124-233806",
  "./src/js/convo-scene.js?v=ebc163fe8-20261124-233806",
  "./src/js/voice-piper.js?v=ebc163fe8-20261124-233806",
  "./src/js/voice-system.js?v=ebc163fe8-20261124-233806",
  "./src/js/examine.js?v=ebc163fe8-20261124-233806",
  "./src/js/equipment.js?v=ebc163fe8-20261124-233806",
  "./src/js/journal.js?v=ebc163fe8-20261124-233806",
  "./src/js/party.js?v=ebc163fe8-20261124-233806",
  "./src/js/favor-water.js?v=ebc163fe8-20261124-233806",
  "./src/js/favor-forage.js?v=ebc163fe8-20261124-233806",
  "./src/js/favor-outing.js?v=ebc163fe8-20261124-233806",
  "./src/js/party-formal.js?v=ebc163fe8-20261124-233806",
  "./src/js/truth.js?v=ebc163fe8-20261124-233806",
  "./src/js/galactic-cast.js?v=ebc163fe8-20261124-233806",
  "./src/js/contests.js?v=ebc163fe8-20261124-233806",
  "./src/js/broadcast.js?v=ebc163fe8-20261124-233806",
  "./src/js/contestEngine.js?v=ebc163fe8-20261124-233806",
  "./src/js/alienPlayers.js?v=ebc163fe8-20261124-233806",
  "./src/js/storage.js?v=ebc163fe8-20261124-233806",
  "./src/js/perceive.js?v=ebc163fe8-20261124-233806",
  "./src/js/carexplore.js?v=ebc163fe8-20261124-233806",
  "./src/js/justice.js?v=ebc163fe8-20261124-233806",
  "./src/js/food.js?v=ebc163fe8-20261124-233806",
  "./src/js/betrayal.js?v=ebc163fe8-20261124-233806",
  "./src/js/corpses.js?v=ebc163fe8-20261124-233806",
  "./src/js/corruption.js?v=ebc163fe8-20261124-233806",
  "./src/js/lifeseed.js?v=ebc163fe8-20261124-233806",
  "./src/js/spawn-knack.js?v=ebc163fe8-20261124-233806",
  "./src/js/trial-deeds.js?v=ebc163fe8-20261124-233806",
  "./src/js/practice-deeds.js?v=ebc163fe8-20261124-233806",
  "./src/js/tracks.js?v=ebc163fe8-20261124-233806",
  "./src/js/villager-build.js?v=ebc163fe8-20261124-233806",
  "./src/js/progression.js?v=ebc163fe8-20261124-233806",
  "./src/js/waveLedger.js?v=ebc163fe8-20261124-233806",
  "./src/js/standing.js?v=ebc163fe8-20261124-233806",
  "./src/js/ladder.js?v=ebc163fe8-20261124-233806",
  "./src/js/feastBuff.js?v=ebc163fe8-20261124-233806",
  "./src/js/ledger.js?v=ebc163fe8-20261124-233806",
  "./src/js/exposure.js?v=ebc163fe8-20261124-233806",
  "./src/js/abilityActions.js?v=ebc163fe8-20261124-233806",
  "./src/js/buildarounds.js?v=ebc163fe8-20261124-233806",
  "./src/js/foodPower.js?v=ebc163fe8-20261124-233806",
  "./src/js/monsterBehaviors.js?v=ebc163fe8-20261124-233806",
  "./src/js/partyTactics.js?v=ebc163fe8-20261124-233806",
  "./src/js/sigW3a.js?v=ebc163fe8-20261124-233806",
  "./src/js/statusEffects.js?v=ebc163fe8-20261124-233806",
  "./src/js/sigW3b.js?v=ebc163fe8-20261124-233806",
  "./src/js/metaProgression.js?v=ebc163fe8-20261124-233806",
  "./src/js/sigW3c.js?v=ebc163fe8-20261124-233806",
  "./src/js/sigW4.js?v=ebc163fe8-20261124-233806",
  "./src/js/sigW5.js?v=ebc163fe8-20261124-233806",
  "./src/js/villager-agency.js?v=ebc163fe8-20261124-233806",
  "./src/js/win-plan.js?v=ebc163fe8-20261124-233806",
  "./src/js/npc-triggers.js?v=ebc163fe8-20261124-233806",
  "./src/js/fieldFights.js?v=ebc163fe8-20261124-233806",
  "./src/js/party-wiring.js?v=ebc163fe8-20261124-233806",
  "./src/js/party-bond.js?v=ebc163fe8-20261124-233806",
  "./src/js/villager-objectives.js?v=ebc163fe8-20261124-233806",
  "./src/js/villager-goals.js?v=ebc163fe8-20261124-233806",
  "./src/js/villager-brain.js?v=ebc163fe8-20261124-233806",
  "./src/js/bond-initiation.js?v=ebc163fe8-20261124-233806",
  "./src/js/villager-mapmem.js?v=ebc163fe8-20261124-233806",
  "./src/js/codex-people.js?v=ebc163fe8-20261124-233806",
  "./src/js/fallen-memorial.js?v=ebc163fe8-20261124-233806",
  "./src/js/graves.js?v=ebc163fe8-20261124-233806",
  "./src/js/membership.js?v=ebc163fe8-20261124-233806",
  "./src/js/gardenCultivation.js?v=ebc163fe8-20261124-233806",
  "./src/js/havenGrowth.js?v=ebc163fe8-20261124-233806",
  "./src/js/shelter.js?v=ebc163fe8-20261124-233806",
  "./src/js/hierarchy.js?v=ebc163fe8-20261124-233806",
  "./src/js/scaleDiscovery.js?v=ebc163fe8-20261124-233806",
  "./src/js/comms.js?v=ebc163fe8-20261124-233806",
  "./src/js/table.js?v=ebc163fe8-20261124-233806",
  "./src/js/pods.js?v=ebc163fe8-20261124-233806",
  "./src/js/titans.js?v=ebc163fe8-20261124-233806",
  "./src/js/finale-campaign.js?v=ebc163fe8-20261124-233806",
  "./src/js/godhood.js?v=ebc163fe8-20261124-233806",
  "./src/js/pantheon.js?v=ebc163fe8-20261124-233806",
  "./src/js/records.js?v=ebc163fe8-20261124-233806",
  "./src/js/table-feared.js?v=ebc163fe8-20261124-233806",
  "./src/js/table-indispensable.js?v=ebc163fe8-20261124-233806",
  "./src/js/table-beloved.js?v=ebc163fe8-20261124-233806",
  "./src/js/table-witness.js?v=ebc163fe8-20261124-233806",
  "./src/js/table-assimilated.js?v=ebc163fe8-20261124-233806",
  "./src/js/table-defiant.js?v=ebc163fe8-20261124-233806",
  "./src/js/relay-ext.js?v=ebc163fe8-20261124-233806",
  "./src/js/relay-dialogue.js?v=ebc163fe8-20261124-233806",
  "./src/js/table-relay.js?v=ebc163fe8-20261124-233806",
  "./src/js/safetynets.js?v=ebc163fe8-20261124-233806",
  "./src/js/villageAgency.js?v=ebc163fe8-20261124-233806",
  "./src/js/memdepth.js?v=ebc163fe8-20261124-233806",
  "./src/js/overtime.js?v=ebc163fe8-20261124-233806",
  "./src/js/network-campaign.js?v=ebc163fe8-20261124-233806",
  "./src/js/debug-scenarios.js?v=ebc163fe8-20261124-233806",
  "./src/js/keepsakes.js?v=ebc163fe8-20261124-233806",
  "./src/js/skill-teaching.js?v=ebc163fe8-20261124-233806",
  "./src/js/person-trust.js?v=ebc163fe8-20261124-233806",
  "./src/js/companion-score.js?v=ebc163fe8-20261124-233806",
  "./src/js/world.js?v=ebc163fe8-20261124-233806",
  "./src/js/nomad.js?v=ebc163fe8-20261124-233806",
  "./src/js/nomad-wild.js?v=ebc163fe8-20261124-233806",
  "./src/js/nomad-scenes.js?v=ebc163fe8-20261124-233806",
  "./src/js/nomad-drive.js?v=ebc163fe8-20261124-233806",
  "./src/js/temperature.js?v=ebc163fe8-20261124-233806",
  "./src/js/godpath.js?v=ebc163fe8-20261124-233806",
  "./src/js/godverbs.js?v=ebc163fe8-20261124-233806",
  "./src/js/endingKey.js?v=ebc163fe8-20261124-233806",
  "./src/js/telemetry-hooks.js?v=ebc163fe8-20261124-233806",
  "./src/js/finishLog.js?v=ebc163fe8-20261124-233806",
  "./src/js/feel.js?v=ebc163fe8-20261124-233806",
  "./src/js/build.js?v=ebc163fe8-20261124-233806",
  "./src/js/whereAreWe.js?v=ebc163fe8-20261124-233806",
  "./src/js/drama.js?v=ebc163fe8-20261124-233806",
  "./src/js/move-anim.js?v=ebc163fe8-20261124-233806",
  "./src/js/presentation.js?v=ebc163fe8-20261124-233806",
  "./src/js/sprites.js?v=ebc163fe8-20261124-233806",
  "./src/js/tile-scenes.js?v=ebc163fe8-20261124-233806",
  "./src/js/regional-audio.js?v=ebc163fe8-20261124-233806",
  "./src/js/favor-company.js?v=ebc163fe8-20261124-233806",
  "./src/js/timeSettlement.js?v=ebc163fe8-20261124-233806",
  "./src/js/app.js?v=ebc163fe8-20261124-233806",
  "./src/js/feel-audio.js?v=ebc163fe8-20261124-233806",
  "./manifest.json?v=ebc163fe8-20261124-233806",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=ebc163fe8-20261124-233806",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=ebc163fe8-20261124-233806",
  "./src/data/alienPlayers.json?v=ebc163fe8-20261124-233806",
  "./src/data/animals.json?v=ebc163fe8-20261124-233806",
  "./src/data/arrivalText.json?v=ebc163fe8-20261124-233806",
  "./src/data/background_survivors.json?v=ebc163fe8-20261124-233806",
  "./src/data/biomes.json?v=ebc163fe8-20261124-233806",
  "./src/data/books.json?v=ebc163fe8-20261124-233806",
  "./src/data/build-notes.json?v=ebc163fe8-20261124-233806",
  "./src/data/cell_defs.json?v=ebc163fe8-20261124-233806",
  "./src/data/characterGen.json?v=ebc163fe8-20261124-233806",
  "./src/data/climates.json?v=ebc163fe8-20261124-233806",
  "./src/data/contests.json?v=ebc163fe8-20261124-233806",
  "./src/data/cooking.json?v=ebc163fe8-20261124-233806",
  "./src/data/events.json?v=ebc163fe8-20261124-233806",
  "./src/data/evolutions.json?v=ebc163fe8-20261124-233806",
  "./src/data/favor-rules.json?v=ebc163fe8-20261124-233806",
  "./src/data/feast-surge.json?v=ebc163fe8-20261124-233806",
  "./src/data/foreignSpeech.json?v=ebc163fe8-20261124-233806",
  "./src/data/gardening.json?v=ebc163fe8-20261124-233806",
  "./src/data/godpaths.json?v=ebc163fe8-20261124-233806",
  "./src/data/items.json?v=ebc163fe8-20261124-233806",
  "./src/data/justiceVoice.json?v=ebc163fe8-20261124-233806",
  "./src/data/knowledge.json?v=ebc163fe8-20261124-233806",
  "./src/data/ladder-capstones.json?v=ebc163fe8-20261124-233806",
  "./src/data/lifeseeds.json?v=ebc163fe8-20261124-233806",
  "./src/data/locations.json?v=ebc163fe8-20261124-233806",
  "./src/data/monsterBehaviors.json?v=ebc163fe8-20261124-233806",
  "./src/data/monsters.json?v=ebc163fe8-20261124-233806",
  "./src/data/nameCultures.json?v=ebc163fe8-20261124-233806",
  "./src/data/originPicker.json?v=ebc163fe8-20261124-233806",
  "./src/data/pellet-boost.json?v=ebc163fe8-20261124-233806",
  "./src/data/plants.json?v=ebc163fe8-20261124-233806",
  "./src/data/presentation.json?v=ebc163fe8-20261124-233806",
  "./src/data/recipes.json?v=ebc163fe8-20261124-233806",
  "./src/data/regions.json?v=ebc163fe8-20261124-233806",
  "./src/data/relicEnhancements.json?v=ebc163fe8-20261124-233806",
  "./src/data/reward-economy.json?v=ebc163fe8-20261124-233806",
  "./src/data/schemas.json?v=ebc163fe8-20261124-233806",
  "./src/data/statusEffects.json?v=ebc163fe8-20261124-233806",
  "./src/data/synergies.json?v=ebc163fe8-20261124-233806",
  "./src/data/table-beats.json?v=ebc163fe8-20261124-233806",
  "./src/data/table-endings.json?v=ebc163fe8-20261124-233806",
  "./src/data/titans.json?v=ebc163fe8-20261124-233806",
  "./src/data/tracks.json?v=ebc163fe8-20261124-233806",
  "./src/data/villagers.json?v=ebc163fe8-20261124-233806",
  "./src/data/wave-ledger.json?v=ebc163fe8-20261124-233806"
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
