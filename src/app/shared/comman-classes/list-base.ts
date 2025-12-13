// list-base.ts
export abstract class ListBase<T> {
  items: T[] = []; // Current filtered items
  allItems: T[] = []; // All fetched items
  selectedItem: T | null = null;

  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;
  searchQuery: string = '';

  showExportModal = false;
  pageName: string = 'Export';
  totalItems = 0;

  constructor() {}

  // Each component should implement this method according to its API
  abstract fetchData(
    page: number
  ): Promise<{ data: T[]; totalPages: number; totalItems: number }>;

  // Load data from API and update items
  async loadData(page: number = this.currentPage) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));

    const res = await this.fetchData(this.currentPage);
    this.allItems = res.data;
    this.items = [...this.allItems];
    this.totalPages = res.totalPages;
    this.totalItems = res.totalItems;
  }

  // Filter items based on search query and given keys
  filterItems(searchKeys: (keyof T)[]) {
    if (!this.searchQuery) {
      this.items = [...this.allItems];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.items = this.allItems.filter((item) =>
        searchKeys.some((key) =>
          String(item[key] ?? '')
            .toLowerCase()
            .includes(query)
        )
      );
    }
  }

  // Reload current page data
  refresh() {
    this.loadData(this.currentPage);
  }

  // Export items to CSV
  exportToCSV(headers: string[], mapFn: (item: T) => (string | number)[]) {
    if (!this.items.length) return;

    const rows = this.items.map(mapFn);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.pageName}-list-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.closeExportModal();
  }

  // Pagination methods
  prevPage() {
    this.loadData(this.currentPage - 1);
  }
  nextPage() {
    this.loadData(this.currentPage + 1);
  }
  firstPage() {
    this.loadData(1);
  }
  lastPage() {
    this.loadData(this.totalPages);
  }
  goToPage(page: number | string) {
    if (typeof page === 'number') this.loadData(page);
  }

  // Returns array for pagination display
  get pagination(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    pages.push(1);
    if (current > 4) pages.push('...');
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);
    pages.push(...Array.from({ length: end - start + 1 }, (_, i) => start + i));
    if (current < total - 3) pages.push('...');
    pages.push(total);

    return pages;
  }

  // Modal handling
  openModal(item: T) {
    this.selectedItem = item;
  }
  closeModal() {
    this.selectedItem = null;
  }

  openExportModal() {
    this.showExportModal = true;
  }
  closeExportModal() {
    this.showExportModal = false;
  }

  // Check if element is overflowing given width
  isOverflowing(el: HTMLElement, maxWidth: number = 250): boolean {
    return el.scrollWidth > maxWidth;
  }
}
