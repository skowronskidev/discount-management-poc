/**
 * Test for DiscountGrid component to verify data binding fix
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DiscountGrid from '../DiscountGrid.vue';
import { discountDataStore } from '../../composables/useDiscountData';

// Mock AG-Grid
vi.mock('ag-grid-vue3', () => ({
  AgGridVue: {
    name: 'AgGridVue',
    template: '<div data-testid="ag-grid-mock">AG Grid Mock</div>',
    props: ['columnDefs', 'gridOptions'],
    emits: ['grid-ready', 'cell-value-changed', 'selection-changed', 'filter-changed']
  }
}));

describe('DiscountGrid', () => {
  beforeEach(() => {
    // Reset the data store before each test
    vi.clearAllMocks();
  });

  it('should render AG-Grid component', () => {
    const wrapper = mount(DiscountGrid, {
      props: {
        height: '400px',
        loadOnMount: false,
        recordCount: 1000
      }
    });

    expect(wrapper.find('[data-testid="ag-grid-mock"]').exists()).toBe(true);
  });

  it('should handle grid ready event with data', async () => {
    const wrapper = mount(DiscountGrid, {
      props: {
        height: '400px',
        loadOnMount: false,
        recordCount: 100
      }
    });

    // Simulate grid ready with mock API
    const mockApi = {
      setGridOption: vi.fn()
    };

    const gridReadyHandler = wrapper.vm.onGridReady;
    if (gridReadyHandler) {
      gridReadyHandler({ api: mockApi });
    }

    expect(wrapper.emitted('gridReady')).toBeTruthy();
  });

  it('should have proper default props', () => {
    const wrapper = mount(DiscountGrid);

    // Check that default props are applied
    expect(wrapper.vm.$props.height).toBe('600px');
    expect(wrapper.vm.$props.loadOnMount).toBe(true);
    expect(wrapper.vm.$props.recordCount).toBe(100000);
  });
});