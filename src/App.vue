<template>
  <div class="app" :class="{ 'dark': isDark }">
    <!-- ── Header ── -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-dot" />
          <span class="logo-text">Results</span>
        </div>
        <StateSelector
          v-model="activeStateKey"
          :registry="STATE_REGISTRY"
        />
      </div>
      <div class="header-right">
        <!-- Dark mode toggle -->
        <button class="icon-btn" @click="isDark = !isDark" :title="isDark ? 'Light mode' : 'Dark mode'">
          <svg v-if="isDark" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.42-1.41l.71-.71zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zM4.22 15.78a1 1 0 001.42-1.42l-.71-.7a1 1 0 00-1.42 1.41l.71.71zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-5.78-.22a1 1 0 001.42-1.42l-.7-.71a1 1 0 00-1.42 1.42l.7.71zM4 10a1 1 0 110-2H3a1 1 0 000 2h1zm11.78 5.78a1 1 0 01-1.42-1.42l.71-.7a1 1 0 011.41 1.41l-.7.71zM10 6a4 4 0 100 8 4 4 0 000-8z"/></svg>
          <svg v-else viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
        </button>
      </div>
    </header>

    <!-- ── Main layout ── -->
    <main class="app-main">
      <!-- Desktop sidebar (left) -->
      <aside class="sidebar" v-if="!isMobile">
        <div class="sidebar-section">
          <div class="section-label">{{ activeStateCfg?.label }} Legislative Assembly</div>
          <Scoreboard
            v-if="activeStateCfg"
            :stateConfig="activeStateCfg"
            :tally="tally"
            :declared="declared"
            :counting="counting"
            :constituencies="constituencies"
          />
        </div>

        <div class="sidebar-divider" />

        <div class="sidebar-section sidebar-list-section">
          <div class="section-label">All Constituencies</div>
          <ConstituencyList
            :constituencies="constituencies"
            :stateConfig="activeStateCfg"
            :selectedId="selectedId"
            @select="onConstituencySelect"
          />
        </div>
      </aside>

      <!-- Map area -->
      <div class="map-area">
        <!-- Mobile scoreboard above map -->
        <div class="mobile-scoreboard" v-if="isMobile && activeStateCfg">
          <Scoreboard
            :stateConfig="activeStateCfg"
            :tally="tally"
            :declared="declared"
            :counting="counting"
            :constituencies="constituencies"
          />
        </div>

        <div class="map-wrap">
          <ElectionMap
            :resultsLoading="resultsLoading"
            :constituencyMap="constituencyMap"
            :stateConfig="activeStateCfg"
            :selectedId="selectedId"
            :isMobile="isMobile"
            @select="onMapSelect"
            @clear-selection="clearSelection"
          />

          <!-- Legend -->
          <div class="map-legend" v-if="activeStateCfg">
            <div
              v-for="(cfg, key) in activeStateCfg.alliances"
              :key="key"
              class="legend-item"
            >
              <span class="legend-dot" :style="{ background: cfg.color }" />
              <span class="legend-label">{{ cfg.label }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" :style="{ background: activeStateCfg.countingColor }" />
              <span class="legend-label">Counting</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" :style="{ background: activeStateCfg.pendingColor, border: '1px solid #ccc' }" />
              <span class="legend-label">Pending</span>
            </div>
          </div>

          <!-- Error pill -->
          <div class="error-pill" v-if="resultsError">
            ⚠ Poll error — retrying
          </div>

          <!-- Zoom hint -->
          <div class="zoom-hint" v-if="!isMobile">
            Scroll to zoom · Click to select
          </div>
        </div>

        <!-- Mobile bottom sheet -->
        <BottomSheet
          v-if="isMobile"
          v-model="sheetOpen"
          :peekMode="true"
        >
          <!-- Detail view when constituency selected -->
          <template v-if="selectedId && selectedConstituency">
            <div class="sheet-detail-header">
              <button class="back-btn" @click="clearSelection">← Back</button>
            </div>
            <TooltipContent
              :constituency="selectedConstituency"
              :stateConfig="activeStateCfg"
              :sheetMode="true"
            />
          </template>

          <!-- Default: scoreboard + list -->
          <template v-else>
            <div class="sheet-title">All Constituencies</div>
            <ConstituencyList
              :constituencies="constituencies"
              :stateConfig="activeStateCfg"
              :selectedId="selectedId"
              @select="onConstituencySelect"
            />
          </template>
        </BottomSheet>
      </div>

      <!-- Desktop: constituency detail panel slides in from right -->
      <Transition name="detail-panel">
        <div class="detail-panel" v-if="!isMobile && selectedId && selectedConstituency">
          <div class="detail-header">
            <div class="section-label">Constituency Detail</div>
            <button class="icon-btn close-btn" @click="clearSelection">✕</button>
          </div>
          <TooltipContent
            :constituency="selectedConstituency"
            :stateConfig="activeStateCfg"
            :sheetMode="true"
          />
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { STATE_REGISTRY, DEFAULT_STATE } from './config/states.js'
import { useResults } from './composables/useResults.js'

import ElectionMap      from './components/ElectionMap.vue'
import Scoreboard       from './components/Scoreboard.vue'
import ConstituencyList from './components/ConstituencyList.vue'
import BottomSheet      from './components/BottomSheet.vue'
import StateSelector    from './components/StateSelector.vue'
import TooltipContent   from './components/TooltipContent.vue'

const activeStateKey = ref(DEFAULT_STATE)
const activeStateCfg = computed(() => STATE_REGISTRY[activeStateKey.value])

const isMobile = ref(false)
const isDark   = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const {
  constituencies, constituencyMap, updatedAt, loading: resultsLoading,
  error: resultsError, lastPollAt, tally, declared, counting
} = useResults(activeStateCfg)

const selectedId = ref(null)
const sheetOpen  = ref(false)

const selectedConstituency = computed(() =>
  selectedId.value ? constituencyMap.value[selectedId.value] : null
)

function onMapSelect({ id, constituency }) {
  selectedId.value = id
  if (isMobile.value) sheetOpen.value = true
}

function onConstituencySelect(c) {
  selectedId.value = c.id
  if (isMobile.value) sheetOpen.value = true
}

function clearSelection() {
  selectedId.value = null
  if (isMobile.value) sheetOpen.value = false
}

watch(activeStateKey, () => {
  selectedId.value = null
  sheetOpen.value  = false
})

const timeAgo = computed(() => {
  if (!lastPollAt.value) return ''
  const secs = Math.floor((Date.now() - lastPollAt.value) / 1000)
  if (secs < 60) return `${secs}s ago`
  return `${Math.floor(secs / 60)}m ago`
})

let timeAgoTimer = null
onMounted(() => { timeAgoTimer = setInterval(() => {}, 10_000) })
onUnmounted(() => clearInterval(timeAgoTimer))
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
/* ── CSS Variables ─────────────────────────────────────────────────────────── */
:root {
  --font-display:'Inter', sans-serif;
  --font-body:'Inter', sans-serif;

  --bg-main: #f5f4f0;
  --bg-card: #ffffff;
  --bg-map: #eae9e4;
  --border: #e0deda;
  --text-main: #1a1916;
  --text-muted: #7a7570;

  --skeleton-a: #e4e2dd;
  --skeleton-b: #f0ede8;

  --header-h: 52px;
}

.app.dark {
  --bg-main: #131211;
  --bg-card: #1e1c1a;
  --bg-map: #1a1816;
  --border: #2e2c2a;
  --text-main: #f0ede8;
  --text-muted: #7a7570;
  --skeleton-a: #252320;
  --skeleton-b: #1e1c1a;
}

/* ── Reset ─────────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #app {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: var(--font-body);
  background: var(--bg-main);
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
}

/* ── App shell ────────────────────────────────────────────────────────────── */
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-main);
  transition: background 0.2s, color 0.2s;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.app-header {
  height: var(--header-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-main);
  flex-shrink: 0;
  gap: 12px;
  z-index: 20;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  overflow: visible;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.logo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0392b;
  box-shadow: 0 0 0 0 rgba(192,57,43,0.5);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(192,57,43,0.5); }
  50% { box-shadow: 0 0 0 5px rgba(192,57,43,0); }
}

.logo-text {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #c0392b;
  padding: 3px 8px;
  border: 1px solid rgba(192,57,43,0.3);
  border-radius: 4px;
  background: rgba(192,57,43,0.06);
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #c0392b;
  animation: blink 1.2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.updated-at {
  font-size: 10px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 0.15s, background 0.15s;
}

.icon-btn:hover {
  color: var(--text-main);
  background: var(--bg-map);
}

/* ── Main layout ───────────────────────────────────────────────────────────── */
.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* ── Sidebar (desktop) ─────────────────────────────────────────────────────── */
.sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  overflow: hidden;
  background: var(--bg-main);
}

.sidebar-section {
  padding: 16px;
}

.sidebar-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 0;
}

.sidebar-divider {
  height: 1px;
  background: var(--border);
  flex-shrink: 0;
}

.section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 12px;
}

/* ── Map area ──────────────────────────────────────────────────────────────── */
.map-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.mobile-scoreboard {
  padding: 12px 12px 0;
  flex-shrink: 0;
  background: var(--bg-main);
  border-bottom: 1px solid var(--border);
}

.map-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding: 8px;
}

/* ── Legend ────────────────────────────────────────────────────────────────── */
.map-legend {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-family: var(--font-body);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 11px;
  color: var(--text-main);
}

/* ── Overlays ─────────────────────────────────────────────────────────────── */
.error-pill {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #c0392b;
  color: #fff;
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 99px;
  font-family: var(--font-body);
  white-space: nowrap;
}

.zoom-hint {
  position: absolute;
  bottom: 16px;
  right: 16px;
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-body);
  pointer-events: none;
}

/* ── Detail panel (desktop) ────────────────────────────────────────────────── */
.detail-panel {
  width: 260px;
  flex-shrink: 0;
  border-left: 1px solid var(--border);
  padding: 16px;
  background: var(--bg-main);
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn { font-size: 14px; }

.detail-panel-enter-active,
.detail-panel-leave-active { transition: transform 0.25s ease, opacity 0.25s; }
.detail-panel-enter-from,
.detail-panel-leave-to { transform: translateX(20px); opacity: 0; }

/* ── Mobile sheet internals ────────────────────────────────────────────────── */
.sheet-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 12px;
}

.sheet-detail-header {
  margin-bottom: 12px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}
</style>
