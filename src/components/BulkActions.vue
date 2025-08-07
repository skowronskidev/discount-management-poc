<template>
  <div class="bulk-actions">
    <div class="bulk-actions-header">
      <h3>Bulk Operations</h3>
      <div class="selection-info">
        <span class="selected-count">{{ selectedCount }} rows selected</span>
        <span class="total-count">/ {{ totalCount }} total</span>
      </div>
    </div>

    <!-- Bulk Update Section -->
    <div class="bulk-section">
      <h4>Bulk Update</h4>
      <form @submit.prevent="handleBulkUpdate" class="bulk-form">
        <div class="form-row">
          <div class="form-group">
            <label for="discount-name">Discount Name:</label>
            <input
              id="discount-name"
              v-model="updateForm.discountName"
              type="text"
              placeholder="Leave empty to keep current values"
            />
          </div>
          <div class="form-group">
            <label for="discount-percent">Discount Percent:</label>
            <input
              id="discount-percent"
              v-model.number="updateForm.discountPercent"
              type="number"
              min="0"
              max="100"
              placeholder="0-100"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="start-date">Start Date:</label>
            <input
              id="start-date"
              v-model="updateForm.startDate"
              type="date"
              placeholder="yyyy-mm-dd"
            />
          </div>
          <div class="form-group">
            <label for="end-date">End Date:</label>
            <input
              id="end-date"
              v-model="updateForm.endDate"
              type="date"
              placeholder="yyyy-mm-dd"
            />
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            :disabled="selectedCount === 0 || bulkOps.isProcessing.value || !hasUpdateData"
            class="btn btn-primary"
          >
            Update {{ selectedCount }} Row{{ selectedCount !== 1 ? 's' : '' }}
          </button>
          <button
            type="button"
            @click="clearForm"
            class="btn btn-secondary"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>

    <!-- Bulk Delete Section -->
    <div class="bulk-section">
      <h4>Bulk Delete</h4>
      <div class="delete-section">
        <p class="warning-text">
          ⚠️ This will permanently delete {{ selectedCount }} selected rows.
        </p>
        <button
          @click="handleBulkDelete"
          :disabled="selectedCount === 0 || bulkOps.isProcessing.value"
          class="btn btn-danger"
        >
          Delete {{ selectedCount }} Row{{ selectedCount !== 1 ? 's' : '' }}
        </button>
      </div>
    </div>

    <!-- Export Section -->
    <div class="bulk-section">
      <h4>Export Data</h4>
      <div class="export-section">
        <div class="form-group">
          <label for="export-filename">Filename:</label>
          <input
            id="export-filename"
            v-model="exportFilename"
            type="text"
            placeholder="discount-data.csv"
          />
        </div>
        <div class="export-options">
          <button
            @click="handleExportSelected"
            :disabled="selectedCount === 0 || bulkOps.isProcessing.value"
            class="btn btn-info"
          >
            Export Selected ({{ selectedCount }})
          </button>
          <button
            @click="handleExportFiltered"
            :disabled="bulkOps.isProcessing.value"
            class="btn btn-info"
          >
            Export Filtered ({{ filteredCount }})
          </button>
          <button
            @click="handleExportAll"
            :disabled="bulkOps.isProcessing.value"
            class="btn btn-info"
          >
            Export All ({{ totalCount }})
          </button>
        </div>
      </div>
    </div>

    <!-- Progress Indicator -->
    <div v-if="bulkOps.isProcessing.value" class="progress-section">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${bulkOps.operationProgress.value}%` }"
        ></div>
      </div>
      <p class="progress-text">
        Processing... {{ bulkOps.operationProgress.value }}%
      </p>
    </div>

    <!-- Operation Result -->
    <div v-if="bulkOps.lastOperationResult.value" class="result-section">
      <div class="result-message" :class="resultClass">
        {{ bulkOps.lastOperationResult.value }}
        <button @click="bulkOps.clearLastResult()" class="close-btn">×</button>
      </div>
    </div>

    <!-- Validation Errors -->
    <div v-if="validationErrors.length > 0" class="error-section">
      <h4>Validation Errors:</h4>
      <ul>
        <li v-for="error in validationErrors" :key="error" class="error-item">
          {{ error }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import type { DiscountRecord, BulkUpdateData } from '../types/discount';
import { useBulkOperations } from '../composables/useBulkOperations';
import { discountDataStore } from '../composables/useDiscountData';
import { generateFilename } from '../utils/csvExport';

// Props
interface Props {
  selectedRows: DiscountRecord[];
  filteredData: DiscountRecord[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  operationComplete: [operation: string, count: number];
}>();

// Composables
const bulkOps = useBulkOperations();
const discountData = discountDataStore;

// Form data
const updateForm = reactive<BulkUpdateData>({
  discountName: '',
  discountPercent: undefined,
  startDate: '',
  endDate: ''
});

const exportFilename = ref('');
const validationErrors = ref<string[]>([]);

// Computed properties
const selectedCount = computed(() => props.selectedRows.length);
const filteredCount = computed(() => props.filteredData.length);
const totalCount = computed(() => discountData.rawData.value.length);

const hasUpdateData = computed(() => {
  return !!(
    updateForm.discountName ||
    updateForm.discountPercent !== undefined ||
    updateForm.startDate ||
    updateForm.endDate
  );
});

const resultClass = computed(() => {
  const result = bulkOps.lastOperationResult.value;
  if (!result) return '';
  return result.includes('Error') ? 'error' : 'success';
});

/**
 * Handle bulk update operation
 */
async function handleBulkUpdate() {
  validationErrors.value = [];
  
  // Validate form data
  const errors = bulkOps.validateBulkUpdateData(updateForm);
  if (errors.length > 0) {
    validationErrors.value = errors;
    return;
  }

  try {
    await bulkOps.bulkUpdate(
      props.selectedRows,
      updateForm,
      (updatedRecord) => {
        discountData.updateRecord(updatedRecord);
      }
    );

    emit('operationComplete', 'update', selectedCount.value);
    clearForm();
  } catch (error) {
    console.error('Bulk update failed:', error);
  }
}

/**
 * Handle bulk delete operation
 */
async function handleBulkDelete() {
  if (!confirm(`Are you sure you want to delete ${selectedCount.value} rows? This action cannot be undone.`)) {
    return;
  }

  try {
    await bulkOps.bulkDelete(
      props.selectedRows,
      (clientIds) => {
        discountData.deleteRecords(clientIds);
      }
    );

    emit('operationComplete', 'delete', selectedCount.value);
  } catch (error) {
    console.error('Bulk delete failed:', error);
  }
}

/**
 * Handle export selected rows
 */
async function handleExportSelected() {
  try {
    const filename = exportFilename.value || generateFilename('selected-discounts');
    await bulkOps.exportToCSV(props.selectedRows, filename);
    emit('operationComplete', 'export', selectedCount.value);
  } catch (error) {
    console.error('Export selected failed:', error);
  }
}

/**
 * Handle export filtered rows
 */
async function handleExportFiltered() {
  try {
    const filename = exportFilename.value || generateFilename('filtered-discounts');
    await bulkOps.exportToCSV(props.filteredData, filename);
    emit('operationComplete', 'export', filteredCount.value);
  } catch (error) {
    console.error('Export filtered failed:', error);
  }
}

/**
 * Handle export all rows
 */
async function handleExportAll() {
  try {
    const filename = exportFilename.value || generateFilename('all-discounts');
    await bulkOps.exportToCSV([...discountData.rawData.value], filename);
    emit('operationComplete', 'export', totalCount.value);
  } catch (error) {
    console.error('Export all failed:', error);
  }
}

/**
 * Clear the update form
 */
function clearForm() {
  updateForm.discountName = '';
  updateForm.discountPercent = undefined;
  updateForm.startDate = '';
  updateForm.endDate = '';
  validationErrors.value = [];
}
</script>

<style scoped>
.bulk-actions {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.bulk-actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.bulk-actions-header h3 {
  margin: 0;
  color: var(--color-heading);
}

.selection-info {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.selected-count {
  font-weight: 600;
  color: var(--color-button-primary);
}

.bulk-section {
  margin-bottom: 2rem;
}

.bulk-section:last-child {
  margin-bottom: 0;
}

.bulk-section h4 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
  font-size: 1.1rem;
}

.bulk-form {
  background: var(--color-card-background);
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.9rem;
  background: var(--color-card-background);
  color: var(--color-text);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-button-primary);
  box-shadow: 0 0 0 2px rgba(74, 171, 247, 0.25);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-button-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-button-primary-hover);
}

.btn-secondary {
  background: var(--color-button-secondary);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-button-secondary-hover);
}

.btn-danger {
  background: var(--color-button-danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-button-danger-hover);
}

.btn-info {
  background: var(--color-button-info);
  color: white;
  margin-right: 0.5rem;
}

.btn-info:hover:not(:disabled) {
  background: var(--color-button-info-hover);
}

.delete-section,
.export-section {
  background: var(--color-card-background);
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.warning-text {
  color: var(--color-button-danger);
  margin-bottom: 1rem;
  font-weight: 500;
}

.export-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.progress-section {
  background: var(--color-card-background);
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--color-button-primary);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  margin: 0;
  color: var(--color-text);
}

.result-section {
  margin-bottom: 1rem;
}

.result-message {
  padding: 1rem;
  border-radius: 6px;
  position: relative;
  padding-right: 3rem;
}

.result-message.success {
  background: var(--color-success-bg);
  border: 1px solid var(--color-success-border);
  color: var(--color-success-text);
}

.result-message.error {
  background: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error-text);
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
}

.error-section {
  background: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error-text);
  padding: 1rem;
  border-radius: 6px;
}

.error-section h4 {
  margin-top: 0;
}

.error-section ul {
  margin-bottom: 0;
}

.error-item {
  margin-bottom: 0.25rem;
}
</style>