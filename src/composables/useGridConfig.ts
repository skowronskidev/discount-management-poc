/**
 * Composable for AG-Grid configuration
 * Handles column definitions, grid options, and performance settings
 */

import { ref, computed, readonly } from 'vue';
import type { ColDef, GridOptions } from 'ag-grid-community';
import { 
  type DiscountRecord, 
  Platform, 
  Region, 
  ImplementationStatus, 
  SalesEventStatus,
  CLIENT_OPTIONS,
  PLATFORM_REGION_CONSTRAINTS
} from '../types/discount';

export function useGridConfig() {
  const gridApi = ref<any>(null);

  /**
   * Column definitions for AG-Grid
   */
  const columnDefs = computed((): ColDef[] => [
    {
      headerName: 'Client Id',
      field: 'clientId',
      width: 150,
      pinned: 'left' as const,
      cellStyle: { fontFamily: 'monospace' },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 500
      }
    },
    {
      headerName: 'Client',
      field: 'client',
      width: 150,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: CLIENT_OPTIONS
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 500
      }
    },
    {
      headerName: 'Platform',
      field: 'platform',
      width: 140,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: Object.values(Platform)
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 500
      }
    },
    {
      headerName: 'Region',
      field: 'region',
      width: 140,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        const platform = params.data?.platform as Platform;
        if (platform && PLATFORM_REGION_CONSTRAINTS[platform]) {
          return { values: PLATFORM_REGION_CONSTRAINTS[platform] };
        }
        return { values: Object.values(Region) };
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 500
      }
    },
    {
      headerName: 'Discount',
      field: 'discount',
      width: 200,
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 500
      }
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      width: 120,
      editable: true,
      cellEditor: 'agDateStringCellEditor',
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply']
      }
    },
    {
      headerName: 'Start Time',
      field: 'startTime',
      width: 100,
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply']
      }
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      width: 120,
      editable: true,
      cellEditor: 'agDateStringCellEditor',
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply']
      }
    },
    {
      headerName: 'End Time',
      field: 'endTime',
      width: 100,
      editable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply']
      }
    },
    {
      headerName: 'Percent',
      field: 'percent',
      width: 100,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 0,
        max: 100
      },
      valueFormatter: (params: any) => `${params.value}%`,
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply']
      }
    },
    {
      headerName: 'Deadline',
      field: 'deadline',
      width: 120,
      editable: true,
      cellEditor: 'agDateStringCellEditor',
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply']
      }
    },
    {
      headerName: 'Implementation Status',
      field: 'implementationStatus',
      width: 160,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: Object.values(ImplementationStatus)
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 500
      }
    },
    {
      headerName: 'Sales Event Status',
      field: 'salesEventStatus',
      width: 150,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: Object.values(SalesEventStatus)
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 500
      }
    },
    {
      headerName: 'Comments',
      field: 'comments',
      width: 200,
      editable: true,
      cellEditor: 'agLargeTextCellEditor',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 500
      }
    },
    // Computed columns (pre-calculated during data loading)
    {
      headerName: 'Month',
      field: 'month',
      width: 120,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 500
      },
      cellStyle: { 
        backgroundColor: '#f0f8ff',
        fontStyle: 'italic'
      }
    },
    {
      headerName: 'Length (Days)',
      field: 'length',
      width: 120,
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply']
      },
      cellStyle: { 
        backgroundColor: '#f0f8ff',
        fontStyle: 'italic'
      }
    }
  ]);

  /**
   * Default grid options optimized for performance
   */
  const defaultGridOptions = computed((): GridOptions => ({
    // Performance optimizations
    animateRows: false,
    enableCellTextSelection: true,
    suppressColumnVirtualisation: true,
    suppressRowVirtualisation: false,
    rowBuffer: 5,
    
    // Pagination
    pagination: true,
    paginationPageSize: 50,
    paginationPageSizeSelector: [25, 50, 100, 200],
    
    // Selection (using new v32+ API)
    rowSelection: {
      mode: 'multiRow',
      checkboxes: true,
      headerCheckbox: true,
      enableClickSelection: false
    },
    
    // Default column definitions
    defaultColDef: {
      sortingOrder: ['asc', 'desc', null]
    },
    
    // Editing
    suppressClickEdit: true,
    enterNavigatesVertically: true,
    enterNavigatesVerticallyAfterEdit: true,
    
    // Styling
    rowHeight: 35,
    headerHeight: 40,
    
    // Callbacks
    onGridReady: (params) => {
      gridApi.value = params.api;
      console.log('Grid is ready');
    },
    
    onCellValueChanged: (params) => {
      console.log('Cell value changed:', params);
    },
    
    onSelectionChanged: (params) => {
      const selectedRows = params.api.getSelectedRows();
      console.log('Selection changed:', selectedRows.length);
    },
    
    onFilterChanged: (params) => {
      const filterModel = params.api.getFilterModel();
      console.log('Filter changed:', filterModel);
    }
  }));

  /**
   * Get selected rows
   */
  function getSelectedRows(): DiscountRecord[] {
    if (!gridApi.value) return [];
    return gridApi.value.getSelectedRows();
  }

  /**
   * Select all rows
   */
  function selectAll() {
    if (gridApi.value) {
      gridApi.value.selectAll();
    }
  }

  /**
   * Deselect all rows
   */
  function deselectAll() {
    if (gridApi.value) {
      gridApi.value.deselectAll();
    }
  }

  /**
   * Export data to CSV
   */
  function exportToCsv(filename?: string) {
    if (gridApi.value) {
      gridApi.value.exportDataAsCsv({
        fileName: filename || 'discount-data.csv',
        columnKeys: columnDefs.value.map(col => col.field).filter(Boolean)
      });
    }
  }

  /**
   * Auto-size columns
   */
  function autoSizeColumns() {
    if (gridApi.value) {
      gridApi.value.sizeColumnsToFit();
    }
  }

  /**
   * Reset filters
   */
  function resetFilters() {
    if (gridApi.value) {
      gridApi.value.setFilterModel(null);
    }
  }

  /**
   * Refresh grid data
   */
  function refreshGrid() {
    if (gridApi.value) {
      gridApi.value.refreshCells();
    }
  }

  return {
    // Grid configuration
    columnDefs,
    defaultGridOptions,
    gridApi: readonly(gridApi),
    
    // Methods
    getSelectedRows,
    selectAll,
    deselectAll,
    exportToCsv,
    autoSizeColumns,
    resetFilters,
    refreshGrid
  };
}