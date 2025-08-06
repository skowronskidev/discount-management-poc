<template>
  <div class="discount-grid">
    <!-- Grid Container -->
    <div class="ag-theme-alpine" :style="{ height: gridHeight }">
      <ag-grid-vue
        :columnDefs="gridConfig.columnDefs.value"
        :rowData="discountData.filteredData.value"
        :gridOptions="gridConfig.defaultGridOptions.value"
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
import { ref, onMounted, computed } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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

// Grid height calculation
const gridHeight = computed(() => props.height);

// Selected rows tracking
const selectedRows = ref<DiscountRecord[]>([]);

/**
 * Handle grid ready event
 */
function onGridReady(params: any) {
  console.log('Grid is ready with', discountData.filteredData.value.length, 'rows');
  emit('gridReady', params.api);
  
  // Auto-size columns on initial load
  setTimeout(() => {
    gridConfig.autoSizeColumns();
  }, 100);
}

/**
 * Handle cell value changes (editing)
 */
function onCellValueChanged(params: any) {
  const updatedRecord = params.data as DiscountRecord;
  
  // Validate the change
  if (validateRecord(updatedRecord)) {
    discountData.updateRecord(updatedRecord);
    console.log('Record updated:', updatedRecord.clientId);
  } else {
    // Revert the change if validation fails
    params.api.refreshCells({ rowNodes: [params.node] });
    console.warn('Invalid record data, change reverted');
  }
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

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content,
.error-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content h3 {
  color: #dc3545;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #0056b3;
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
</style>