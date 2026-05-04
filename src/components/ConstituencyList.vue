<template>
  <div class="clist">
    <!-- Search + filters -->
    <div class="clist-controls">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="8.5" cy="8.5" r="5.5" /><path d="M15 15l-3-3" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchQ"
          class="search-input"
          placeholder="Search constituency…"
          autocomplete="off"
          spellcheck="false"
        />
        <button v-if="searchQ" class="search-clear" @click="searchQ = ''">✕</button>
      </div>

      <!-- Alliance filter pills -->
      <div class="filter-pills">
        <button
          class="pill"
          :class="{ active: filterAlliance === null }"
          @click="filterAlliance = null"
        >All</button>
        <button
          v-for="(cfg, key) in stateConfig.alliances"
          :key="key"
          class="pill"
          :class="{ active: filterAlliance === key }"
          :style="filterAlliance === key ? { background: cfg.color, color: cfg.textColor, borderColor: cfg.color } : {}"
          @click="filterAlliance = filterAlliance === key ? null : key"
        >{{ cfg.label }}</button>
        <button
          class="pill"
          :class="{ active: filterAlliance === 'pending' }"
          @click="filterAlliance = filterAlliance === 'pending' ? null : 'pending'"
        >Pending</button>
      </div>
    </div>

    <!-- Count -->
    <div class="clist-meta">
      {{ filtered.length }} of {{ constituencies.length }} constituencies
    </div>

    <!-- List -->
    <div class="clist-rows" ref="listRef">
      <div
        v-for="c in filtered"
        :key="c.id"
        class="clist-row"
        :class="{ selected: selectedId === c.id, declared: c.status === 'declared' }"
        @click="$emit('select', c)"
      >
        <div
          class="row-stripe"
          :style="{ background: getColor(c) }"
        />
        <div class="row-body">
          <div class="row-top">
            <span class="row-name">{{ c.name }}</span>
            <span
              v-if="c.leadingAlliance"
              class="row-alliance"
              :style="{ color: getAllianceColor(c.leadingAlliance) }"
            >{{ c.leadingAlliance }}</span>
          </div>
          <div class="row-bottom">
            <span class="row-candidate">{{ c.candidates?.[0]?.name ?? 'Awaiting results' }}</span>
            <span v-if="c.candidates?.[0]?.votes" class="row-lead">
              +{{ fmt(c.candidates[0].votes - (c.candidates[1]?.votes ?? 0)) }}
            </span>
          </div>
          <div class="row-rounds" v-if="c.status !== 'pending'">
            <div class="rounds-bar">
              <div
                class="rounds-fill"
                :style="{
                  width: ((c.roundsComplete / c.totalRounds) * 100) + '%',
                  background: getColor(c)
                }"
              />
            </div>
            <span class="rounds-label">{{ c.roundsComplete }}/{{ c.totalRounds }}</span>
          </div>
        </div>
        <div v-if="c.status === 'declared'" class="row-declared">✓</div>
      </div>

      <div v-if="filtered.length === 0" class="clist-empty">
        No constituencies match your search.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  constituencies: Array,
  stateConfig: Object,
  selectedId: String,
})

defineEmits(['select'])

const searchQ = ref('')
const filterAlliance = ref(null)
const listRef = ref(null)

const filtered = computed(() => {
  let list = props.constituencies ?? []
  const q = searchQ.value.toLowerCase().trim()
  if (q) {
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.candidates?.some(cand => cand.name.toLowerCase().includes(q))
    )
  }
  if (filterAlliance.value === 'pending') {
    list = list.filter(c => c.status === 'pending')
  } else if (filterAlliance.value) {
    list = list.filter(c => c.leadingAlliance === filterAlliance.value)
  }
  return list
})

function getColor(c) {
  const cfg = props.stateConfig
  if (!cfg || !c.leadingAlliance || c.status === 'pending') return cfg?.pendingColor ?? '#e8e8e4'
  const alliance = cfg.alliances[c.leadingAlliance]
  if (!alliance) return '#888'
  return c.status === 'declared' ? alliance.color : alliance.color + 'aa'
}

function getAllianceColor(key) {
  return props.stateConfig?.alliances?.[key]?.color ?? '#888'
}

function fmt(n) {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-IN')
}
</script>

<style scoped>
.clist {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--font-body);
  overflow: hidden;
}

/* Controls */
.clist-controls {
  padding: 0 0 8px;
  flex-shrink: 0;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.search-icon {
  position: absolute;
  left: 10px;
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-main);
  font-family: var(--font-body);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus { border-color: var(--text-muted); }
.search-input::placeholder { color: var(--text-muted); }

.search-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 11px;
  padding: 2px 4px;
}

/* Filter pills */
.filter-pills {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.pill {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 99px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.02em;
}

.pill.active {
  color: var(--text-main);
  border-color: var(--text-main);
  background: var(--bg-map);
}

/* Meta */
.clist-meta {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 6px;
  flex-shrink: 0;
}

/* Rows */
.clist-rows {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.clist-row {
  display: flex;
  align-items: stretch;
  gap: 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.1s;
  position: relative;
}

.clist-row:hover { background: var(--bg-map); }
.clist-row.selected { background: var(--bg-map); }

.row-stripe {
  width: 3px;
  flex-shrink: 0;
  border-radius: 2px 0 0 2px;
  transition: background 0.3s;
}

.row-body {
  flex: 1;
  padding: 8px 8px 8px 10px;
  min-width: 0;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 2px;
}

.row-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-alliance {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

.row-bottom {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 6px;
}

.row-candidate {
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-lead {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-main);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.row-rounds {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
}

.rounds-bar {
  flex: 1;
  height: 2px;
  background: var(--border);
  border-radius: 1px;
  overflow: hidden;
}

.rounds-fill {
  height: 100%;
  border-radius: 1px;
  transition: width 0.4s ease;
}

.rounds-label {
  font-size: 9px;
  color: var(--text-muted);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.row-declared {
  display: flex;
  align-items: center;
  padding-right: 10px;
  font-size: 10px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.clist-empty {
  padding: 24px 8px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
