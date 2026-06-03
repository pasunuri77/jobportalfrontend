import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReusableTableComponent, TableColumn, TableConfig } from './reusable-table.component';

describe('ReusableTableComponent', () => {
  let component: ReusableTableComponent;
  let fixture: ComponentFixture<ReusableTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReusableTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReusableTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Table Configuration', () => {
    it('should have default config values', () => {
      expect(component.config.pageSize).toBe(10);
      expect(component.config.striped).toBe(true);
      expect(component.config.bordered).toBe(true);
      expect(component.config.hoverable).toBe(true);
      expect(component.config.selectable).toBe(false);
    });

    it('should apply custom config', () => {
      const customConfig: TableConfig = {
        columns: [],
        pageSize: 20,
        striped: false,
        selectable: true,
      };
      component.config = customConfig;
      expect(component.pageSize).toBe(20);
      expect(component.config.selectable).toBe(true);
    });
  });

  describe('Data Rendering', () => {
    beforeEach(() => {
      component.data = [
        { id: 1, name: 'John', email: 'john@example.com', age: 30 },
        { id: 2, name: 'Jane', email: 'jane@example.com', age: 25 },
        { id: 3, name: 'Bob', email: 'bob@example.com', age: 35 },
      ];
      component.config.columns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: false },
      ];
    });

    it('should render correct number of rows on first page', () => {
      component.config.pageSize = 2;
      expect(component.paginatedData.length).toBe(2);
    });

    it('should paginate data correctly', () => {
      component.config.pageSize = 2;
      expect(component.paginatedData[0].id).toBe(1);
      component.nextPage();
      expect(component.paginatedData[0].id).toBe(3);
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      component.data = [
        { id: 3, name: 'Charlie', score: 85 },
        { id: 1, name: 'Alice', score: 95 },
        { id: 2, name: 'Bob', score: 75 },
      ];
      component.config.columns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'score', label: 'Score', sortable: true, type: 'number' },
      ];
    });

    it('should sort by text column ascending', () => {
      const column = component.config.columns[1];
      component.onSort(column);
      expect(component.sortedData[0].name).toBe('Alice');
      expect(component.sortedData[2].name).toBe('Charlie');
    });

    it('should toggle sort direction', () => {
      const column = component.config.columns[1];
      component.onSort(column);
      expect(component.sortDirection).toBe('asc');
      component.onSort(column);
      expect(component.sortDirection).toBe('desc');
    });

    it('should sort by number column', () => {
      const column = component.config.columns[2];
      component.onSort(column);
      expect(component.sortedData[0].score).toBe(75);
      expect(component.sortedData[2].score).toBe(95);
    });

    it('should not sort non-sortable columns', () => {
      component.config.columns[2].sortable = false;
      const initialOrder = [...component.sortedData];
      component.onSort(component.config.columns[2]);
      expect(component.sortedData).toEqual(initialOrder);
    });
  });

  describe('Row Selection', () => {
    beforeEach(() => {
      component.data = [
        { id: 1, name: 'Row 1' },
        { id: 2, name: 'Row 2' },
        { id: 3, name: 'Row 3' },
      ];
      component.config.selectable = true;
    });

    it('should select single row', () => {
      component.toggleRowSelection(component.data[0]);
      expect(component.isRowSelected(component.data[0])).toBe(true);
    });

    it('should deselect row', () => {
      component.toggleRowSelection(component.data[0]);
      component.toggleRowSelection(component.data[0]);
      expect(component.isRowSelected(component.data[0])).toBe(false);
    });

    it('should select all rows on current page', () => {
      component.config.pageSize = 10;
      component.toggleSelectAll();
      expect(component.selectAll).toBe(true);
      expect(component.selectedRows.size).toBe(3);
    });

    it('should emit selection change event', (done) => {
      component.selectionChange.subscribe((selected) => {
        expect(selected.length).toBe(1);
        done();
      });
      component.toggleRowSelection(component.data[0]);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      component.data = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
      }));
      component.config.pageSize = 10;
    });

    it('should calculate total pages correctly', () => {
      expect(component.totalPages).toBe(3);
    });

    it('should navigate to next page', () => {
      const firstPageId = component.paginatedData[0].id;
      component.nextPage();
      expect(component.paginatedData[0].id).toBeGreaterThan(firstPageId);
    });

    it('should navigate to previous page', () => {
      component.nextPage();
      component.previousPage();
      expect(component.currentPage).toBe(1);
    });

    it('should go to specific page', () => {
      component.goToPage(2);
      expect(component.currentPage).toBe(2);
    });

    it('should emit page change event', (done) => {
      component.pageChange.subscribe((page) => {
        expect(page).toBe(2);
        done();
      });
      component.goToPage(2);
    });
  });

  describe('Cell Formatting', () => {
    it('should format date column', () => {
      const testDate = new Date('2024-01-15');
      const formatted = component.formatCellValue(testDate, { key: 'date', label: 'Date', type: 'date' });
      expect(formatted).toContain('1');
    });

    it('should format number column', () => {
      const formatted = component.formatCellValue(123.456, { key: 'price', label: 'Price', type: 'number' });
      expect(formatted).toContain('123.46');
    });

    it('should return dash for empty values', () => {
      const formatted = component.formatCellValue(null, { key: 'test', label: 'Test' });
      expect(formatted).toBe('-');
    });
  });

  describe('Get Page Numbers', () => {
    beforeEach(() => {
      component.data = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));
      component.config.pageSize = 10;
    });

    it('should show page numbers around current page', () => {
      component.currentPage = 3;
      const pages = component.getPageNumbers();
      expect(pages).toContain(3);
      expect(pages.length).toBeLessThanOrEqual(5);
    });

    it('should not show duplicate page numbers', () => {
      const pages = component.getPageNumbers();
      const uniquePages = new Set(pages);
      expect(pages.length).toBe(uniquePages.size);
    });
  });
});
