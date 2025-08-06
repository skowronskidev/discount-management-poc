<script setup lang="ts">
import { ref, computed } from 'vue';
import DiscountGrid from './components/DiscountGrid.vue';
import BulkActions from './components/BulkActions.vue';
import FilterPanel from './components/FilterPanel.vue';
import type { DiscountRecord } from './types/discount';
import { discountDataStore } from './composables/useDiscountData';

// Component references
const gridRef = ref<InstanceType<typeof DiscountGrid>>();

// Selected rows tracking
const selectedRows = ref<DiscountRecord[]>([]);
const displayedRowCount = ref(0);

// Computed properties for stats
const filteredCount = computed(() => discountDataStore.filteredRecords.value);
const totalCount = computed(() => discountDataStore.totalRecords.value);
const selectedCount = computed(() => selectedRows.value.length);

/**
 * Handle grid ready event
 */
function onGridReady(api: any) {
  console.log('Grid API is ready');
  displayedRowCount.value = api.getDisplayedRowCount();
}

/**
 * Handle selection changes from grid
 */
function onSelectionChanged(newSelectedRows: DiscountRecord[]) {
  selectedRows.value = newSelectedRows;
}

/**
 * Handle data changes (filtering, etc.)
 */
function onDataChanged(count: number) {
  displayedRowCount.value = count;
}

/**
 * Handle bulk operation completion
 */
function onOperationComplete(operation: string, count: number) {
  console.log(`Bulk ${operation} completed for ${count} records`);
  
  // Clear selection after bulk operations
  if (operation === 'delete') {
    selectedRows.value = [];
    gridRef.value?.deselectAll();
  }
  
  // Refresh grid to reflect changes
  gridRef.value?.refreshGrid();
}

/**
 * Select all visible rows
 */
function selectAllVisible() {
  gridRef.value?.selectAll();
}

/**
 * Deselect all rows
 */
function deselectAll() {
  gridRef.value?.deselectAll();
}

/**
 * Auto-size columns
 */
function autoSizeColumns() {
  gridRef.value?.autoSizeColumns();
}

/**
 * Refresh data
 */
async function refreshData() {
  await discountDataStore.loadData(100000);
  gridRef.value?.refreshGrid();
}

/**
 * Clear all filters
 */
function clearFilters() {
  gridRef.value?.resetFilters();
}
</script>

<template>
  <div id="app">
    <!-- App Header -->
    <header class="app-header">
      <div class="container">
        <h1 class="app-title">
          <span class="title-icon">📊</span>
          Discount Management System
        </h1>
        <p class="app-subtitle">
          High-performance Vue 3 + AG-Grid POC handling 100,000+ rows
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Filter Panel -->
        <FilterPanel
          :selectedCount="selectedCount"
          :filteredCount="filteredCount"
          :totalCount="totalCount"
          @selectAllVisible="selectAllVisible"
          @deselectAll="deselectAll"
          @autoSizeColumns="autoSizeColumns"
          @refreshData="refreshData"
          @clearFilters="clearFilters"
        />

        <!-- Bulk Actions -->
        <BulkActions
          :selectedRows="selectedRows"
          :filteredData="discountDataStore.filteredData.value"
          @operationComplete="onOperationComplete"
        />

        <!-- Main Data Grid -->
        <div class="grid-container">
          <DiscountGrid
            ref="gridRef"
            height="70vh"
            :recordCount="100000"
            @gridReady="onGridReady"
            @selectionChanged="onSelectionChanged"
            @dataChanged="onDataChanged"
          />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container">
        <p>
          🚀 Built with Vue 3, TypeScript, and AG-Grid Community Edition
        </p>
        <p class="performance-note">
          Optimized for 100,000+ rows with virtual scrolling and efficient filtering
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
              'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header styles */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  font-size: 2rem;
}

.app-subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
}

/* Main content */
.main-content {
  flex: 1;
  padding: 2rem 0;
}

.grid-container {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 70vh; /* Add explicit height */
  min-height: 500px; /* Minimum height fallback */
  animation: fadeIn 0.5s ease-out;
}

/* Footer */
.app-footer {
  background: #343a40;
  color: #adb5bd;
  padding: 1.5rem 0;
  text-align: center;
  margin-top: auto;
}

.app-footer p {
  margin: 0.25rem 0;
}

.performance-note {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Responsive design */
@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
  }
  
  .container {
    padding: 0 0.5rem;
  }
  
  .main-content {
    padding: 1rem 0;
  }
}

/* Utility classes */
.text-center {
  text-align: center;
}

.mb-1 {
  margin-bottom: 1rem;
}

.mb-2 {
  margin-bottom: 2rem;
}

/* Loading animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
