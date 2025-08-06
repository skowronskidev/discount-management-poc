/**
 * Composable for bulk operations on discount data
 * Handles bulk updates, deletions, and CSV exports
 */

import { ref, computed, readonly } from 'vue';
import type { DiscountRecord, BulkUpdateData } from '../types/discount';
import { downloadCSV, generateFilename } from '../utils/csvExport';

export function useBulkOperations() {
  const isProcessing = ref(false);
  const operationProgress = ref(0);
  const lastOperationResult = ref<string | null>(null);

  /**
   * Apply bulk updates to selected records
   */
  async function bulkUpdate(
    records: DiscountRecord[],
    updateData: BulkUpdateData,
    onUpdate: (record: DiscountRecord) => void
  ): Promise<void> {
    if (records.length === 0) {
      throw new Error('No records selected for bulk update');
    }

    isProcessing.value = true;
    operationProgress.value = 0;
    lastOperationResult.value = null;

    try {
      const total = records.length;
      let processed = 0;

      for (const record of records) {
        // Create updated record
        const updatedRecord: DiscountRecord = {
          ...record,
          // Apply bulk updates
          ...(updateData.discountName && { discount: updateData.discountName }),
          ...(updateData.discountPercent !== undefined && { percent: updateData.discountPercent }),
          ...(updateData.startDate && { startDate: updateData.startDate }),
          ...(updateData.endDate && { endDate: updateData.endDate })
        };

        // Apply the update through callback
        onUpdate(updatedRecord);

        processed++;
        operationProgress.value = Math.round((processed / total) * 100);

        // Add small delay for large operations to prevent UI blocking
        if (processed % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      lastOperationResult.value = `Successfully updated ${processed} records`;
      console.log(`Bulk update completed: ${processed} records updated`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      lastOperationResult.value = `Error during bulk update: ${errorMessage}`;
      console.error('Bulk update failed:', error);
      throw error;
    } finally {
      isProcessing.value = false;
      operationProgress.value = 0;
    }
  }

  /**
   * Delete multiple records
   */
  async function bulkDelete(
    records: DiscountRecord[],
    onDelete: (clientIds: string[]) => void
  ): Promise<void> {
    if (records.length === 0) {
      throw new Error('No records selected for deletion');
    }

    isProcessing.value = true;
    operationProgress.value = 0;
    lastOperationResult.value = null;

    try {
      const clientIds = records.map(record => record.clientId);
      const total = clientIds.length;

      // Simulate processing for UI feedback
      for (let i = 0; i <= total; i += Math.max(1, Math.floor(total / 10))) {
        operationProgress.value = Math.round((Math.min(i, total) / total) * 100);
        if (i < total) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // Perform the actual deletion
      onDelete(clientIds);

      lastOperationResult.value = `Successfully deleted ${total} records`;
      console.log(`Bulk delete completed: ${total} records deleted`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      lastOperationResult.value = `Error during bulk delete: ${errorMessage}`;
      console.error('Bulk delete failed:', error);
      throw error;
    } finally {
      isProcessing.value = false;
      operationProgress.value = 0;
    }
  }

  /**
   * Export records to CSV
   */
  async function exportToCSV(
    records: DiscountRecord[],
    filename?: string
  ): Promise<void> {
    if (records.length === 0) {
      throw new Error('No records to export');
    }

    isProcessing.value = true;
    operationProgress.value = 0;
    lastOperationResult.value = null;

    try {
      // Simulate processing for large datasets
      const total = 100;
      for (let i = 0; i <= total; i += 10) {
        operationProgress.value = i;
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const exportFilename = filename || generateFilename('filtered-discounts');
      downloadCSV(records, exportFilename);

      lastOperationResult.value = `Successfully exported ${records.length} records to ${exportFilename}`;
      console.log(`CSV export completed: ${records.length} records exported`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      lastOperationResult.value = `Error during CSV export: ${errorMessage}`;
      console.error('CSV export failed:', error);
      throw error;
    } finally {
      isProcessing.value = false;
      operationProgress.value = 0;
    }
  }

  /**
   * Validate bulk update data
   */
  function validateBulkUpdateData(updateData: BulkUpdateData): string[] {
    const errors: string[] = [];

    if (updateData.discountPercent !== undefined) {
      if (updateData.discountPercent < 0 || updateData.discountPercent > 100) {
        errors.push('Discount percent must be between 0 and 100');
      }
    }

    if (updateData.startDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updateData.startDate)) {
        errors.push('Start date must be in YYYY-MM-DD format');
      }
    }

    if (updateData.endDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updateData.endDate)) {
        errors.push('End date must be in YYYY-MM-DD format');
      }
    }

    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }

    return errors;
  }

  /**
   * Get operation statistics
   */
  const operationStats = computed(() => ({
    isProcessing: isProcessing.value,
    progress: operationProgress.value,
    lastResult: lastOperationResult.value
  }));

  /**
   * Clear last operation result
   */
  function clearLastResult() {
    lastOperationResult.value = null;
  }

  return {
    // State
    isProcessing: readonly(isProcessing),
    operationProgress: readonly(operationProgress),
    lastOperationResult: readonly(lastOperationResult),
    operationStats,

    // Methods
    bulkUpdate,
    bulkDelete,
    exportToCSV,
    validateBulkUpdateData,
    clearLastResult
  };
}