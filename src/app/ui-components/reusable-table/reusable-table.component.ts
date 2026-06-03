import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'action' | 'custom';
  customTemplate?: any;
  badgeClass?: (value: any) => string;
}

export interface TableConfig {
  columns: TableColumn[];
  pageSize?: number;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
}

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reusable-table.component.html',
  styleUrls: ['./reusable-table.component.css'],
})
export class ReusableTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() config: TableConfig = {
    columns: [],
    pageSize: 5,
    striped: true,
    bordered: true,
    hoverable: true,
    selectable: false,
  };
  @Input() isLoading: boolean = false;
  @Input() emptyStateMessage: string = 'No data available';

  @Output() rowClick = new EventEmitter<any>();
  @Output() rowAction = new EventEmitter<{ action: string; row: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() pageChange = new EventEmitter<number>();

  currentPage: number = 1;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedRows: Set<any> = new Set();
  selectAll: boolean = false;

  get pageSize(): number {
    return this.config.pageSize || 10;
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.sortedData.slice(start, end);
  }

  get sortedData(): any[] {
    if (!this.sortColumn) return this.data;

    const sorted = [...this.data].sort((a, b) => {
      const aVal = a[this.sortColumn];
      const bVal = b[this.sortColumn];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      return this.sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return sorted;
  }

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
    this.sortChange.emit({ column: column.key, direction: this.sortDirection });
    this.cdr.detectChanges();
  }

  getSortIcon(column: TableColumn): string {
    if (!column.sortable) return '';
    if (this.sortColumn !== column.key) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onAction(action: string, row: any, event?: Event): void {
    if (event) event.stopPropagation();
    this.rowAction.emit({ action, row });
  }

  toggleRowSelection(row: any, event?: Event): void {
    if (event) event.stopPropagation();

    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }

    this.selectAll = this.selectedRows.size === this.paginatedData.length;
    this.selectionChange.emit(Array.from(this.selectedRows));
    this.cdr.detectChanges();
  }

  toggleSelectAll(): void {
    if (this.selectAll) {
      this.paginatedData.forEach(row => this.selectedRows.add(row));
    } else {
      this.paginatedData.forEach(row => this.selectedRows.delete(row));
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
    this.cdr.detectChanges();
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.has(row);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChange.emit(this.currentPage);
      this.cdr.detectChanges();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageChange.emit(this.currentPage);
      this.cdr.detectChanges();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit(this.currentPage);
      this.cdr.detectChanges();
    }
  }

  getCellValue(row: any, column: TableColumn): any {
    return row[column.key];
  }

  formatCellValue(value: any, column: TableColumn): string {
    if (!value) return '-';

    switch (column.type) {
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : new Date(value).toLocaleDateString();
      case 'number':
        return typeof value === 'number' ? value.toFixed(2) : String(value);
      default:
        return String(value);
    }
  }

  trackByRow(index: number, row: any): any {
    return row.id || index;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
