/**
 * Composable for managing discount data
 * Handles data loading, filtering, and CRUD operations
 */

import { ref, computed, reactive, readonly } from 'vue';
import type { DiscountRecord, FilterState } from '../types/discount';
import { generateMockData, generateTestData } from '../utils/mockDataGenerator';
import { getMonthName, calculateDaysBetween } from '../utils/dateUtils';

export function useDiscountData() {
  // Raw data from "database"
  const rawData = ref<DiscountRecord[]>([]);
  
  // Loading state
  const isLoading = ref(false);
  
  // Filter state
  const filters = reactive<FilterState>({});
  
  // Error state
  const error = ref<string | null>(null);

  /**
   * Load mock data
   */
  async function loadData(count: number = 100000) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate async loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Generate data based on count
      const data = count <= 5000 ? generateTestData(count) : generateMockData(count);
      
      // Pre-calculate computed fields for better performance
      const dataWithComputedFields = data.map(record => ({
        ...record,
        month: getMonthName(record.startDate),
        length: calculateDaysBetween(record.startDate, record.endDate)
      }));
      
      rawData.value = dataWithComputedFields;
      
      console.log(`Loaded ${dataWithComputedFields.length} discount records with pre-calculated fields`);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load data';
      console.error('Error loading data:', err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Filtered data based on current filters
   * Optimized to skip computation when no filters are active
   */
  const filteredData = computed(() => {
    // If no filters are active, return raw data directly for better performance
    if (Object.keys(filters).length === 0) {
      return rawData.value;
    }
    
    let result = rawData.value;
    
    // Apply filters
    Object.entries(filters).forEach(([field, values]) => {
      if (values && values.length > 0) {
        result = result.filter(record => {
          const fieldValue = String((record as any)[field] || '');
          return values.some(filterValue => 
            fieldValue.toLowerCase().includes(filterValue.toLowerCase())
          );
        });
      }
    });
    
    return result;
  });

  /**
   * Get unique values for a specific field (for filter options)
   */
  function getUniqueValues(field: keyof DiscountRecord): string[] {
    const values = new Set<string>();
    
    rawData.value.forEach(record => {
      let value: string;
      
      // Handle computed fields
      if (field === 'month') {
        value = getMonthName(record.startDate);
      } else if (field === 'length') {
        value = String(calculateDaysBetween(record.startDate, record.endDate));
      } else {
        value = String((record as any)[field] || '');
      }
      
      if (value) {
        values.add(value);
      }
    });
    
    return Array.from(values).sort();
  }

  /**
   * Update filter for a specific field
   */
  function updateFilter(field: string, values: string[] | null) {
    if (values && values.length > 0) {
      filters[field] = values;
    } else {
      delete filters[field];
    }
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    Object.keys(filters).forEach(key => {
      delete filters[key];
    });
  }

  /**
   * Update a single record with optimized performance
   */
  function updateRecord(updatedRecord: DiscountRecord) {
    const index = rawData.value.findIndex(record => record.clientId === updatedRecord.clientId);
    if (index !== -1) {
      // Pre-calculate computed fields
      const recordWithComputedFields = {
        ...updatedRecord,
        month: getMonthName(updatedRecord.startDate),
        length: calculateDaysBetween(updatedRecord.startDate, updatedRecord.endDate)
      };
      
      // Use direct assignment for better performance
      rawData.value[index] = recordWithComputedFields;
      console.log('Record updated:', updatedRecord.clientId);
    }
  }

  /**
   * Delete a record
   */
  function deleteRecord(clientId: string) {
    const index = rawData.value.findIndex(record => record.clientId === clientId);
    if (index !== -1) {
      rawData.value.splice(index, 1);
      console.log('Record deleted:', clientId);
    }
  }

  /**
   * Delete multiple records
   */
  function deleteRecords(clientIds: string[]) {
    rawData.value = rawData.value.filter(record => !clientIds.includes(record.clientId));
    console.log(`Deleted ${clientIds.length} records`);
  }

  /**
   * Add a new record with computed fields
   */
  function addRecord(newRecord: DiscountRecord) {
    const recordWithComputedFields = {
      ...newRecord,
      month: getMonthName(newRecord.startDate),
      length: calculateDaysBetween(newRecord.startDate, newRecord.endDate)
    };
    
    rawData.value.push(recordWithComputedFields);
    console.log('Record added:', newRecord.clientId);
  }

  /**
   * Get total record count
   */
  const totalRecords = computed(() => rawData.value.length);

  /**
   * Get filtered record count
   */
  const filteredRecords = computed(() => filteredData.value.length);

  /**
   * Check if filters are active
   */
  const hasActiveFilters = computed(() => Object.keys(filters).length > 0);

  return {
    // Data
    rawData: readonly(rawData),
    filteredData,
    
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    filters: readonly(filters),
    
    // Computed
    totalRecords,
    filteredRecords,
    hasActiveFilters,
    
    // Methods
    loadData,
    getUniqueValues,
    updateFilter,
    clearFilters,
    updateRecord,
    deleteRecord,
    deleteRecords,
    addRecord
  };
}

// Create a global instance for sharing data across components
export const discountDataStore = useDiscountData();