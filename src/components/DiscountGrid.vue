<template>
  <div class="discount-grid">
    <!-- Grid Container -->
    <div :class="gridThemeClass" :style="{ height: gridHeight }">
      <ag-grid-vue
        :columnDefs="gridConfig.columnDefs.value"
        :gridOptions="gridConfig.defaultGridOptions.value"
        :rowData="discountData.filteredData.value"
        @grid-ready="onGridReady"
        @cell-value-changed="onCellValueChanged"
        @selection-changed="onSelectionChanged"
        @filter-changed="onFilterChanged"
      />
    </div>

    <!-- Loading Overlay -->
    <div v-if="discountData.isLoading.value" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Loading discount data...</p>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="discountData.error.value" class="error-overlay">
      <div class="error-content">
        <h3>Error Loading Data</h3>
        <p>{{ discountData.error.value }}</p>
        <button @click="retryLoad" class="retry-btn">Retry</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-alpine-dark.css';

import { useGridConfig } from '../composables/useGridConfig';
import { discountDataStore } from '../composables/useDiscountData';
import type { DiscountRecord } from '../types/discount';

// Props
interface Props {
  height?: string;
  loadOnMount?: boolean;
  recordCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  height: '600px',
  loadOnMount: true,
  recordCount: 100000
});

// Emits
const emit = defineEmits<{
  gridReady: [api: any];
  selectionChanged: [selectedRows: DiscountRecord[]];
  dataChanged: [recordCount: number];
}>();

// Composables
const gridConfig = useGridConfig();
const discountData = discountDataStore;

// Grid API reference
const gridApi = ref<any>(null);

// Grid height calculation
const gridHeight = computed(() => props.height);

// Grid theme calculation (responsive to system preference)
const gridThemeClass = computed(() => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'ag-theme-alpine-dark';
  }
  return 'ag-theme-alpine';
});

// Selected rows tracking
const selectedRows = ref<DiscountRecord[]>([]);

// Watch for data changes and refresh grid
watch(() => discountData.filteredData.value.length, (newLength, oldLength) => {
  if (gridApi.value && newLength > 0 && oldLength === 0) {
    console.log('Refreshing grid with new data');
    gridApi.value.setGridOption('rowData', discountData.filteredData.value);
  }
}, { immediate: false });

/**
 * Handle grid ready event
 */
function onGridReady(params: any) {
  console.log('Grid is ready with', discountData.filteredData.value.length, 'rows');
  
  // Store grid API reference
  gridApi.value = params.api;
  emit('gridReady', params.api);
  
  // If data is already available, set it immediately
  if (discountData.filteredData.value.length > 0) {
    console.log('Setting initial data to grid');
    params.api.setGridOption('rowData', discountData.filteredData.value);
  }
  
  // Auto-size columns on initial load
  setTimeout(() => {
    gridConfig.autoSizeColumns();
  }, 100);
}

/**
 * Quick validation for individual fields
 */
function quickValidateField(fieldName: string, value: any, record: DiscountRecord): boolean {
  switch (fieldName) {
    case 'percent':
      return value >= 0 && value <= 100;
    case 'client':
    case 'platform':
    case 'region':
      return value && value.trim().length > 0;
    case 'startDate':
    case 'endDate':
    case 'deadline':
      return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
    default:
      return true; // Skip validation for other fields
  }
}

/**
 * Determine if full validation is needed
 */
function needsFullValidation(fieldName: string): boolean {
  // Only run expensive validation for critical fields
  return ['startDate', 'endDate', 'percent'].includes(fieldName);
}

/**
 * Handle cell value changes (editing) with improved validation
 */
function onCellValueChanged(params: any) {
  console.log('Cell editing completed:', params.colDef.field, params.newValue);
  
  // Quick validation first (synchronous)
  const isValid = quickValidateField(params.colDef.field, params.newValue, params.data);
  
  if (!isValid) {
    console.warn('Quick validation failed, reverting change');
    params.node.setDataValue(params.colDef.field, params.oldValue);
    return;
  }
  
  // Create updated record efficiently
  const updatedRecord = { ...params.data };
  updatedRecord[params.colDef.field as keyof DiscountRecord] = params.newValue;
  
  // Skip expensive validation for simple edits
  if (!needsFullValidation(params.colDef.field)) {
    // Direct update for simple fields
    discountData.updateRecord(updatedRecord);
    console.log('Record updated (fast path):', updatedRecord.clientId);
    return;
  }
  
  // Full validation only for complex fields
  if (!validateRecord(updatedRecord)) {
    console.warn('Full validation failed, reverting change');
    params.node.setDataValue(params.colDef.field, params.oldValue);
    return;
  }
  
  // Update the data store
  discountData.updateRecord(updatedRecord);
  console.log('Record updated (full validation):', updatedRecord.clientId);
}

/**
 * Handle selection changes
 */
function onSelectionChanged(params: any) {
  selectedRows.value = params.api.getSelectedRows();
  emit('selectionChanged', selectedRows.value);
}

/**
 * Handle filter changes
 */
function onFilterChanged(params: any) {
  const filterModel = params.api.getFilterModel();
  console.log('Active filters:', Object.keys(filterModel).length);
  
  // Update data count
  const displayedRowCount = params.api.getDisplayedRowCount();
  emit('dataChanged', displayedRowCount);
}

/**
 * Validate a record before saving changes
 */
function validateRecord(record: DiscountRecord): boolean {
  // Basic validation rules
  if (!record.clientId || !record.client || !record.platform) {
    return false;
  }
  
  if (record.percent < 0 || record.percent > 100) {
    return false;
  }
  
  // Date validation
  if (record.startDate && record.endDate) {
    const startDate = new Date(record.startDate);
    const endDate = new Date(record.endDate);
    if (endDate <= startDate) {
      return false;
    }
  }
  
  return true;
}

/**
 * Retry loading data
 */
async function retryLoad() {
  await discountData.loadData(props.recordCount);
}

/**
 * Get selected rows (exposed method)
 */
function getSelectedRows(): DiscountRecord[] {
  return gridConfig.getSelectedRows();
}

/**
 * Select all rows (exposed method)
 */
function selectAll() {
  gridConfig.selectAll();
}

/**
 * Deselect all rows (exposed method)
 */
function deselectAll() {
  gridConfig.deselectAll();
}

/**
 * Export to CSV (exposed method)
 */
function exportToCsv(filename?: string) {
  gridConfig.exportToCsv(filename);
}

/**
 * Auto-size columns (exposed method)
 */
function autoSizeColumns() {
  gridConfig.autoSizeColumns();
}

/**
 * Reset all filters (exposed method)
 */
function resetFilters() {
  gridConfig.resetFilters();
}

/**
 * Refresh the grid (exposed method)
 */
function refreshGrid() {
  gridConfig.refreshGrid();
}

// Load data on mount
onMounted(async () => {
  if (props.loadOnMount) {
    await discountData.loadData(props.recordCount);
  }
});

// Expose methods for parent components
defineExpose({
  getSelectedRows,
  selectAll,
  deselectAll,
  exportToCsv,
  autoSizeColumns,
  resetFilters,
  refreshGrid,
  selectedRows
});
</script>

<style scoped>
.discount-grid {
  position: relative;
  width: 100%;
}

.discount-grid .ag-theme-alpine {
  min-height: 400px; /* Ensure minimum height */
  width: 100%;
}

/* Fix for AG-Grid height inheritance */
:deep(.ag-root-wrapper) {
  height: 100% !important;
}

:deep(.ag-layout-normal) {
  height: 100% !important;
}

:deep(.ag-center-cols-clipper) {
  height: 100% !important;
}

:deep(.ag-center-cols-viewport) {
  height: 100% !important;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay-background);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content,
.error-content {
  text-align: center;
  padding: 2rem;
  background: var(--color-card-background);
  color: var(--color-text);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-button-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content h3 {
  color: var(--color-button-danger);
  margin-bottom: 1rem;
}

.retry-btn {
  background: var(--color-button-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: var(--color-button-primary-hover);
}

/* AG-Grid theme customizations */
:deep(.ag-theme-alpine) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

:deep(.ag-header-cell-text) {
  font-weight: 600;
}

:deep(.ag-row) {
  transition: background-color 0.1s ease;
}

:deep(.ag-row:hover) {
  background-color: #f8f9fa;
}

:deep(.ag-row-selected) {
  background-color: #e3f2fd !important;
}

:deep(.ag-cell-focus) {
  border: 2px solid #007bff !important;
}

/* Computed column styling */
:deep(.ag-cell[col-id="month"]),
:deep(.ag-cell[col-id="length"]) {
  background-color: #f0f8ff;
  font-style: italic;
}

/* Pinned column styling */
:deep(.ag-pinned-left-cols-container) {
  border-right: 2px solid #dee2e6;
}

/* AG-Grid Select Editor Dropdown Styling */
:deep(.ag-select-list) {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
}

:deep(.ag-select-list-item) {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

:deep(.ag-select-list-item:hover) {
  background-color: var(--color-background-mute) !important;
  color: var(--color-button-primary);
}

:deep(.ag-select-list-item:last-child) {
  border-bottom: none;
}

:deep(.ag-select-list-item.ag-select-list-item-selected) {
  background-color: var(--color-button-primary) !important;
  color: white;
}

/* Improve cell editor input styling */
:deep(.ag-cell-editor input) {
  border: 2px solid var(--color-button-primary) !important;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  background: var(--color-card-background);
  color: var(--color-text);
}

:deep(.ag-cell-editor select) {
  border: 2px solid var(--color-button-primary) !important;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  background: var(--color-card-background);
  color: var(--color-text);
}
</style>