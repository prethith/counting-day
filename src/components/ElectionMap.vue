<template>
  <div class="map-container" ref="containerRef">
    <div v-if="topoLoading || resultsLoading" class="map-skeleton">
      <div class="skeleton-pulse" />
      <div class="skeleton-label">Loading map…</div>
    </div>

    <div v-else-if="topoError" class="map-error">
      <span class="error-icon">⚠</span>
      <p>Couldn't load map: {{ topoError }}</p>
    </div>

    <svg
      v-show="!topoLoading && !topoError"
      ref="svgRef"
      class="election-svg"
      :viewBox="`0 0 ${svgW} ${svgH}`"
      preserveAspectRatio="xMidYMid meet"
      shape-rendering="optimizeSpeed"
      @click.self="clearSelection"
    >
      <defs>
        <pattern
          v-for="(alliance, key) in stateConfig?.alliances"
          :key="key"
          :id="`hatch-${key}`"
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="6" :fill="alliance.color" opacity="0.25" />
          <line x1="0" y1="0" x2="0" y2="6" :stroke="alliance.color" stroke-width="3" />
        </pattern>
      </defs>
      <g ref="mapGroupRef" class="map-group">
        <path
          v-for="feature in features"
          :key="getFeatureId(feature)"
          :d="pathGen ? pathGen(feature) : ''"
          :fill="getColor(feature)"
          :stroke="selectedId === getFeatureId(feature) ? '#111' : '#fff'"
          :stroke-width="selectedId === getFeatureId(feature) ? 1.5 : 0.4"
          :opacity="selectedId && selectedId !== getFeatureId(feature) ? 0.72 : 1"
          class="constituency-path"
          @click.stop="handleClick(feature, $event)"
          @mouseenter="handleHover(feature, $event)"
          @mouseleave="handleLeave"
        />
      </g>
    </svg>

    <Transition name="tooltip">
      <div
        v-if="tooltip.visible && !isMobile"
        class="map-tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <TooltipContent :constituency="tooltip.data" :stateConfig="stateConfig" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import TooltipContent from './TooltipContent.vue'

const props = defineProps({
  resultsLoading: Boolean,
  constituencyMap: Object,
  stateConfig: Object,
  selectedId: String,
  isMobile: Boolean,
})

const emit = defineEmits(['select', 'clear-selection'])

const containerRef = ref(null)
const svgRef       = ref(null)
const mapGroupRef  = ref(null)
const svgW = ref(400)
const svgH = ref(700)

const features    = ref([])
const pathGen     = ref(null)
const topoLoading = ref(false)
const topoError   = ref(null)

const tooltip = ref({ visible: false, x: 0, y: 0, data: null })

let cachedTopos = {}

// ── Topo loading ──────────────────────────────────────────────────────────────

async function loadTopo(cfg) {
  if (!cfg) return
  topoLoading.value = true
  topoError.value   = null
  pathGen.value     = null
  features.value    = []

  try {
    if (!cachedTopos[cfg.topoUrl]) {
      const res = await fetch(cfg.topoUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      cachedTopos[cfg.topoUrl] = await res.json()
    }

    const file = cachedTopos[cfg.topoUrl]

    if (file.type === 'Topology') {
      features.value = topojson.feature(file, file.objects[cfg.topoObject]).features
    } else if (file.type === 'FeatureCollection') {
      features.value = file.features
    } else {
      throw new Error(`Unknown format: ${file.type}`)
    }

    buildProjection()
  } catch (e) {
    topoError.value = e.message
  } finally {
    topoLoading.value = false
  }
}

// ── Projection ────────────────────────────────────────────────────────────────

function buildProjection() {
  if (!features.value.length || !svgW.value || !svgH.value) return
  const pad = 24
  const proj = d3.geoMercator().fitExtent(
    [[pad, pad], [svgW.value - pad, svgH.value - pad]],
    { type: 'FeatureCollection', features: features.value }
  )
  pathGen.value = d3.geoPath().projection(proj)
}

// ── Resize ────────────────────────────────────────────────────────────────────

let resizeObs = null

function updateSize() {
  if (!containerRef.value) return
  const { width, height } = containerRef.value.getBoundingClientRect()
  svgW.value = Math.max(width, 200)
  svgH.value = Math.max(height, 300)
  buildProjection()
}

onMounted(() => {
  updateSize()
  resizeObs = new ResizeObserver(updateSize)
  resizeObs.observe(containerRef.value)
  setupZoom()
})

onUnmounted(() => {
  resizeObs?.disconnect()
  cachedTopos = {}
})

watch(() => props.stateConfig, (cfg) => {
  if (cfg) loadTopo(cfg)
}, { immediate: true })

watch(features, async () => {
  await nextTick()
  if (!svgRef.value || !zoomBehavior) return
  d3.select(svgRef.value)
    .transition().duration(300)
    .call(zoomBehavior.transform, d3.zoomIdentity)
})

// ── Zoom ──────────────────────────────────────────────────────────────────────

let zoomBehavior = null

function setupZoom() {
  if (!svgRef.value || !mapGroupRef.value) return
  if (props.isMobile) return
  zoomBehavior = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', (event) => {
      d3.select(mapGroupRef.value).attr('transform', event.transform)
    })
  d3.select(svgRef.value).call(zoomBehavior)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFeatureId(feature) {
  return String(feature.properties?.[props.stateConfig?.idProperty] ?? '')
}

function getConstituency(feature) {
  return props.constituencyMap?.[getFeatureId(feature)] ?? null
}

function getColor(feature) {
  const cfg = props.stateConfig
  if (!cfg) return '#e8e8e4'
  const c = getConstituency(feature)
  if (!c || c.status === 'pending') return cfg.pendingColor
  const alliance = cfg.alliances[c.leadingAlliance]
  if (!alliance) return '#7f8c8d'
  const allRoundsDone = c.totalRounds > 0 && c.roundsComplete >= c.totalRounds
  return allRoundsDone ? alliance.color : `url(#hatch-${c.leadingAlliance})`
}

// ── Interaction ───────────────────────────────────────────────────────────────

function handleClick(feature, event) {
  const id = getFeatureId(feature)
  if (props.selectedId === id) {
    emit('clear-selection')
    tooltip.value.visible = false
    return
  }
  emit('select', { feature, constituency: getConstituency(feature), id })
  if (!props.isMobile) {
    const rect = containerRef.value.getBoundingClientRect()
    tooltip.value = {
      visible: true,
      x: event.clientX - rect.left + 12,
      y: event.clientY - rect.top - 12,
      data: getConstituency(feature),
    }
  }
}

function handleHover(feature, event) {
  if (props.isMobile) return
  const rect = containerRef.value.getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: event.clientX - rect.left + 14,
    y: event.clientY - rect.top - 14,
    data: getConstituency(feature),
  }
}

function handleLeave() {
  if (!props.selectedId) tooltip.value.visible = false
}

function clearSelection() {
  emit('clear-selection')
  tooltip.value.visible = false
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: var(--bg-map);
  border-radius: 12px;
}

.election-svg {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
}

.map-group {
  will-change: transform;
}

.election-svg:active { cursor: grabbing; }

.constituency-path {
  cursor: pointer;
}

.constituency-path:hover {
  stroke: #111 !important;
  stroke-width: 1px !important;
}

.map-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 50;
  max-width: 240px;
}

.tooltip-enter-active,
.tooltip-leave-active { transition: opacity 0.15s, transform 0.15s; }
.tooltip-enter-from,
.tooltip-leave-to { opacity: 0; transform: translateY(4px); }

.map-skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.skeleton-pulse {
  width: 180px;
  height: 280px;
  background: linear-gradient(90deg,
    var(--skeleton-a) 25%, var(--skeleton-b) 50%, var(--skeleton-a) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
  clip-path: polygon(50% 0%, 80% 10%, 100% 30%, 90% 60%, 70% 100%, 30% 100%, 10% 60%, 0% 30%, 20% 10%);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-label {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-body);
  letter-spacing: 0.04em;
}

.map-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 13px;
  padding: 24px;
  text-align: center;
}

.error-icon { font-size: 28px; }
</style>