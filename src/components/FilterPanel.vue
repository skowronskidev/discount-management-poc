<template>
  <div class="filter-panel">
    <div class="filter-header">
      <h3>Data Overview</h3>
      <button 
        @click="clearAllFilters" 
        :disabled="!hasActiveFilters"
        class="btn btn-outline"
      >
        Clear All Filters
      </button>
    </div>

    <div class="filter-stats">
      <div class="stat-card">
        <div class="stat-value">{{ filteredCount.toLocaleString() }}</div>
        <div class="stat-label">Filtered Rows</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalCount.toLocaleString() }}</div>
        <div class="stat-label">Total Rows</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ selectedCount.toLocaleString() }}</div>
        <div class="stat-label">Selected Rows</div>
      </div>
    </div>

    <div class="filter-info" v-if="hasActiveFilters">
      <h4>Active Filters</h4>
      <div class="active-filters">
        <div 
          v-for="(values, field) in activeFilters" 
          :key="field"
          class="filter-tag"
        >
          <span class="filter-field">{{ formatFieldName(field) }}:</span>
          <span class="filter-values">{{ formatFilterValues(values) }}</span>
          <button 
            @click="removeFilter(field)" 
            class="remove-filter"
            title="Remove this filter"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h4>Quick Actions</h4>
      <div class="action-buttons">
        <button @click="selectAllVisible" class="btn btn-small">
          Select All Visible
        </button>
        <button @click="deselectAll" class="btn btn-small">
          Deselect All
        </button>
        <button @click="autoSizeColumns" class="btn btn-small">
          Auto-size Columns
        </button>
        <button @click="refreshData" class="btn btn-small">
          Refresh Data
        </button>
      </div>
    </div>

    <div class="performance-info">
      <h4>Performance Info</h4>
      <div class="perf-stats">
        <div class="perf-item">
          <span class="perf-label">Load Time:</span>
          <span class="perf-value">{{ loadTime }}ms</span>
        </div>
        <div class="perf-item">
          <span class="perf-label">Filter Time:</span>
          <span class="perf-value">{{ filterTime }}ms</span>
        </div>
        <div class="perf-item">
          <span class="perf-label">Memory Usage:</span>
          <span class="perf-value">{{ memoryUsage }}MB</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { discountDataStore } from '../composables/useDiscountData';

// Props
interface Props {
  selectedCount: number;
  filteredCount: number;
  totalCount: number;
  onSelectAllVisible?: () => void;
  onDeselectAll?: () => void;
  onAutoSizeColumns?: () => void;
  onRefreshData?: () => void;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  selectAllVisible: [];
  deselectAll: [];
  autoSizeColumns: [];
  refreshData: [];
  clearFilters: [];
}>();

// Data store
const discountData = discountDataStore;

// Performance tracking
const loadTime = ref(0);
const filterTime = ref(0);
const memoryUsage = ref(0);

// Computed properties
const hasActiveFilters = computed(() => discountData.hasActiveFilters.value);

const activeFilters = computed(() => {
  const filters: Record<string, readonly string[]> = {};
  Object.entries(discountData.filters).forEach(([field, values]) => {
    if (values && values.length > 0) {
      filters[field] = values;
    }
  });
  return filters;
});

/**
 * Format field names for display
 */
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Format filter values for display
 */
function formatFilterValues(values: readonly string[]): string {
  if (values.length <= 2) {
    return values.join(', ');
  }
  return `${values[0]}, ${values[1]} +${values.length - 2} more`;
}

/**
 * Remove a specific filter
 */
function removeFilter(field: string) {
  discountData.updateFilter(field, null);
}

/**
 * Clear all filters
 */
function clearAllFilters() {
  discountData.clearFilters();
  emit('clearFilters');
}

/**
 * Select all visible rows
 */
function selectAllVisible() {
  emit('selectAllVisible');
}

/**
 * Deselect all rows
 */
function deselectAll() {
  emit('deselectAll');
}

/**
 * Auto-size columns
 */
function autoSizeColumns() {
  emit('autoSizeColumns');
}

/**
 * Refresh data
 */
function refreshData() {
  emit('refreshData');
}

/**
 * Update memory usage estimate
 */
function updateMemoryUsage() {
  // Rough estimate based on row count and data structure
  const rowCount = discountData.rawData.value.length;
  const avgRowSize = 500; // bytes per row (estimated)
  memoryUsage.value = Math.round((rowCount * avgRowSize) / (1024 * 1024));
}

/**
 * Track performance metrics
 */
function trackPerformance() {
  // Mock performance tracking
  loadTime.value = Math.round(Math.random() * 2000 + 500);
  filterTime.value = Math.round(Math.random() * 100 + 10);
  updateMemoryUsage();
}

// Performance tracking interval
let performanceInterval: number;

onMounted(() => {
  trackPerformance();
  performanceInterval = setInterval(trackPerformance, 5000);
});

onUnmounted(() => {
  if (performanceInterval) {
    clearInterval(performanceInterval);
  }
});
</script>

<style scoped>
.filter-panel {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.filter-header h3 {
  margin: 0;
  color: var(--color-heading);
}

.filter-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--color-background-soft);
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  border: 1px solid var(--color-border);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-button-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-info {
  margin-bottom: 1.5rem;
}

.filter-info h4 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
  font-size: 1rem;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-field {
  font-weight: 600;
  color: var(--color-button-primary);
}

.filter-values {
  color: var(--color-text);
}

.remove-filter {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  line-height: 1;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.remove-filter:hover {
  background: var(--color-border-hover);
  color: var(--color-text);
}

.quick-actions {
  margin-bottom: 1.5rem;
}

.quick-actions h4 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.performance-info h4 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
  font-size: 1rem;
}

.perf-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.perf-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  font-size: 0.875rem;
}

.perf-label {
  color: var(--color-text-secondary);
}

.perf-value {
  font-weight: 600;
  color: var(--color-text);
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-card-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  background: var(--color-background-soft);
  border-color: var(--color-border-hover);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  border-color: var(--color-button-primary);
  color: var(--color-button-primary);
}

.btn-outline:hover:not(:disabled) {
  background: var(--color-button-primary);
  color: white;
}

.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}
</style>