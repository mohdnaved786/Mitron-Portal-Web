import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CustomerService } from '../../../core/services/customers.service';
import { AddEditCustomersComponent } from '../add-edit-customers/add-edit-customers.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ViewHistoricalMessagesComponent } from '../view-historical-messages/view-historical-messages.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CustomSnackbarComponent } from '../../../shared/components/custom-snackbar/custom-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-customers-list',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.css',
})
export class CustomersListComponent implements OnInit {
  // 🔹 Pagination and data handling
  items: any[] = [];
  allItems: any[] = [];
  selectedItem: any = null;

  currentPage = 1;
  totalPages = 1;
  per_page = 10;
  totalItems = 0;
  searchQuery: string = '';
  pageName: string = 'Contacts';

  // 🔹 A–Z filter state
  alphabet: string[] = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  selectedLetter: string = 'ALL';
  showFilters = false;

  // New filters
  selectedAgent = '';
  selectedDate = '';

  fromDate = '';
  toDate = '';

  // Populate from your API or define manually
  agents: string[] = ['Kalam Digital', 'John Doe', 'Mary Support'];
  status: string[] = ['Online', 'Offline']
  isArrowOpen = false;

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadData(1);
  }

  toggleArrow() {
    this.isArrowOpen = !this.isArrowOpen;
  }
  addCustomer() {
    const dialogRef = this.dialog.open(AddEditCustomersComponent, {
      width: '90%',
      maxWidth: 'var(--mat-dialog-container-max-width, 800px)',
      data: { isEditMode: false },
    });

    dialogRef.afterClosed().subscribe((addCustomer) => {
      if (addCustomer) {
        this.loadData(this.currentPage); // reload table after add
      }
    });
  }

  editCustomer(customer?: any) {
    const dialogRef = this.dialog.open(AddEditCustomersComponent, {
      width: '90%',
      maxWidth: 'var(--mat-dialog-container-max-width, 800px)',
      data: { isEditMode: true, customer: customer }, // pass agent data if provided
    });

    dialogRef.afterClosed().subscribe((updatedCustomer) => {
      if (updatedCustomer) {
        this.loadData(this.currentPage); // reload table after edit
      }
    });
  }

  openViewCustomerPage(customerId: number) {
    this.router.navigate(['/view-customer', customerId]); // match the route
  }

  // 🔹 Load and fetch customers
  async loadData(page: number = this.currentPage) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    const res = await this.fetchData(this.currentPage, this.per_page);
    this.allItems = res.data;
    this.items = [...this.allItems];
    this.totalPages = res.totalPages;
    this.totalItems = res.totalItems;
  }

  fetchData(
    page: number,
    per_page: number
  ): Promise<{ data: any[]; totalPages: number; totalItems: number }> {
    return new Promise((resolve) => {
      this.customerService.getCustomers(page, per_page).subscribe((res) => {
        if (res.success) {
          resolve({
            data: res.data.data,
            totalPages: res.data.last_page,
            totalItems: res.data.total,
          });
        }
      });
    });
  }

  toggleFilterDropdown() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    let filtered = [...this.allItems];

    // 🔹 Agent filter
    if (this.selectedAgent) {
      filtered = filtered.filter(
        (item) => item.agent_name === this.selectedAgent
      );
    }

    // 🔹 Date range filter
    if (this.fromDate || this.toDate) {
      const from = this.fromDate ? new Date(this.fromDate) : null;
      const to = this.toDate ? new Date(this.toDate) : null;

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at);
        if (from && itemDate < from) return false;
        if (to) {
          // include items created on the same end date
          const endOfDay = new Date(to);
          endOfDay.setHours(23, 59, 59, 999);
          if (itemDate > endOfDay) return false;
        }
        return true;
      });
    }

    // 🔹 Apply A–Z or search filter if already active
    if (this.searchQuery?.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        ['name', 'mobile'].some((key) =>
          String(item[key] ?? '')
            .toLowerCase()
            .includes(query)
        )
      );
    }

    this.items = filtered;
  }
  filterItems(searchKeys: string[]) {
    let filtered = [...this.allItems];

    // Apply A–Z filter
    if (this.selectedLetter !== 'ALL') {
      filtered = filtered.filter((item) =>
        item.name?.trim().toUpperCase().startsWith(this.selectedLetter)
      );
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        searchKeys.some((key) =>
          String(item[key] ?? '')
            .toLowerCase()
            .includes(query)
        )
      );
    }

    this.items = filtered;
  }

  // 🔹 When a letter is clicked
  filterByLetter(letter: string) {
    this.selectedLetter = letter;
    this.filterItems(['name', 'mobile']);
    // this.applyFilters();
  }

  // 🔹 Pagination controls
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
    if (typeof page === 'number') {
      this.loadData(page);
    }
  }

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

  openViewReply(rowData: any) {
    this.dialog.open(ViewHistoricalMessagesComponent, {
      width: '100%',
      data: {
        name: rowData.name,
        number: rowData.mobile,
        country_code: rowData.country_code,
        avatar: rowData.profile_image || '',
      },
    });
  }

  deleteCustomer(customer: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        isCustomer: true,
        customer: customer,
        title: 'Delete Customer',
        message: `Are you sure you want to delete?`,
        confirmBtnText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.customerService.deleteCustomer(customer.id).subscribe({
          next: (res: any) => {
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              data: {
                message: res?.message || 'Customer deleted successfully.',
                type: 'success',
                icon: 'check_circle',
              },
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['no-default-snackbar'],
            });
            this.loadData(this.currentPage);
          },
          error: (err) => {
            console.error(err);
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              data: {
                message:
                  err?.error?.message ||
                  'Failed to delete the customer. Please try again later.',
                type: 'error',
                icon: 'error',
              },
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['no-default-snackbar'],
            });
          },
        });
      }
    });
  }



  // 🔹 Modal methods
  openModal(item: any) {
    this.selectedItem = item;
  }
  closeModal() {
    this.selectedItem = null;
  }

  // 🔹 Utility
  getInitialsCustomer(name: string | undefined): string {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    const initials: string[] = [];
    for (let word of words) {
      const firstChar = word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) initials.push(firstChar);
      if (initials.length === 2) break;
    }
    return initials.length > 0 ? initials.join('') : '?';
  }

  // 🔹 Overflow check
  isOverflowing(el: HTMLElement, maxWidth: number = 250): boolean {
    return el.scrollWidth > maxWidth;
  }

  // Sorting state
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sortData(column: string, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // ✅ Delay sorting to let arrow update
    setTimeout(() => {
      const dir = this.sortDirection === 'asc' ? 1 : -1;

      const comparer = (a: any, b: any) => {
        let A = a[column];
        let B = b[column];
        if (A == null) A = '';
        if (B == null) B = '';

        if (column === 'created_at') {
          const dateA = new Date(A).getTime();
          const dateB = new Date(B).getTime();
          return (dateA - dateB) * dir;
        }

        const numA = parseFloat(A);
        const numB = parseFloat(B);
        const isNum = !isNaN(numA) && !isNaN(numB);
        if (isNum) return (numA - numB) * dir;

        return String(A).localeCompare(String(B)) * dir;
      };

      this.items = [...this.items.sort(comparer)];
      this.allItems = [...this.allItems.sort(comparer)];
      this.cdr.detectChanges(); // ensure Angular sees the update
    }, 0);
  }

  toggleOverlay(customer: any) {
    // Hide overlay on all other rows first if you want
    this.items.forEach(a => {
      if (a !== customer) a.showOverlay = false;
    });

    // Toggle the clicked row
    customer.showOverlay = !customer.showOverlay;
  }
}
