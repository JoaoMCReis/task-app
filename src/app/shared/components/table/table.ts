// table.component.ts
import { Component, Input, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn<T> {
  label: string;
  field: keyof T | string; // Permite campos customizados
  sortable?: boolean;
  filterable?: boolean;
  template?: (item: T) => string;
  htmlTemplate?: boolean; // Para permitir HTML
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.html',
  styleUrls: ['./table.css']
})
export class TableComponent<T> {
  @Input() set data(value: T[]) {
    this._data.set(value);
    this.currentPage.set(1); // Reset página ao mudar dados
  }

  @Input() columns: TableColumn<T>[] = [];
  @Input() pageSize = 5;

  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();

  private _data = signal<T[]>([]);
  currentPage = signal(1);
  sortField = signal<keyof T | string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  filterTerm = '';

  // Computed para filtrar dados
  filteredData = computed(() => {
    let filtered = this._data();
    const term = this.filterTerm.toLowerCase();

    if (term) {
      filtered = filtered.filter(item =>
        this.columns.some(col => {
          const field = col.field as keyof T;
          const value = item[field];
          return value != null && value.toString().toLowerCase().includes(term);
        })
      );
    }

    // Ordenação
    if (this.sortField()) {
      const field = this.sortField() as keyof T;
      const dir = this.sortDirection();
      filtered = [...filtered].sort((a, b) => {
        const valA = a[field];
        const valB = b[field];

        if (valA == null) return 1;
        if (valB == null) return -1;

        return dir === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return filtered;
  });

  paginatedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredData().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    const total = Math.ceil(this.filteredData().length / this.pageSize);
    return total || 1;
  });

  changeSort(field: keyof T | string) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onEdit(item: T) {
    this.edit.emit(item);
  }

  onDelete(item: T) {
    this.delete.emit(item);
  }

  getCellValue(item: T, col: TableColumn<T>): string {
    if (col.template) {
      return col.template(item);
    }
    const field = col.field as keyof T;
    return item[field] != null ? String(item[field]) : '-';
  }
}