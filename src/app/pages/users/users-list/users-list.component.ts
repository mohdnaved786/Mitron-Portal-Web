import { Component, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddEditUserComponent } from '../add-edit-users/add-edit-users.component';
import { ViewAgentComponent } from '../view-agent/view-agent.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from '../../../shared/components/alert-dialog/alert-dialog.component';
import { UsersService } from '../../../core/services/users.service';
import { CustomSnackbarComponent } from '../../../shared/components/custom-snackbar/custom-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-agents-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent {
  unSubscribeSubject: any = new Subject();
  agent: any;
  isActive: boolean = false;
  items: any[] = [];
  allItems: any[] = [];
  selectedItem: any = null;
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;
  totalItems = 0;
  searchQuery: string = '';
  pageName: string = 'Agents';

  showFilters = false;
  selectedSupervisor = '';
  selectedStatus = '';
  supervisors: string[] = ['John', 'Mary', 'Alex'];
  isArrowOpen = false;
  constructor(
    private _userService: UsersService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getUserList();
  }


  getUserList() {
    this._userService.getAllUsersList().pipe(takeUntil(this.unSubscribeSubject)).subscribe({
      next: ((res) => {
        if (res.success === true) {
          this.items = res.users
          this.allItems = res.users
        }
      }),
      error: ((err) => {

      })
    })
  }












  loadAgentDetails(id: number) {
    this._userService.getUserById(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.agent = res.data;
          // Handle online status
          this.isActive =
            res.data.isOnline === 'yes' || res.data.isOnline === true;
          console.log('Agent data:', this.agent);
        }
      },
      error: (err) => console.error('Error fetching agent details', err),
    });
  }

  addUser() {
    const dialogRef = this.dialog.open(AddEditUserComponent, {
      width: '90%',
      maxWidth: 'var(--mat-dialog-container-max-width, 800px)',
    });

    dialogRef.afterClosed().subscribe((addAgent) => {
      if (addAgent) this.getUserList();
    });
  }

  editUser_old(agent?: any) {
    const dialogRef = this.dialog.open(AddEditUserComponent, {
      width: '90%',
      maxWidth: 'var(--mat-dialog-container-max-width, 800px)',
      data: agent || null,
    });

    dialogRef.afterClosed().subscribe((updatedAgent) => {
      if (updatedAgent) this.loadData(this.currentPage);
    });
  }

  editUser(agent?: any) {
    const agentId = agent?._id;
    this._userService.getUserById(agentId).subscribe({
      next: (res) => {
        if (res?.success === true) {
          const dialogRef = this.dialog.open(AddEditUserComponent, {
            width: '90%',
            maxWidth: 'var(--mat-dialog-container-max-width, 800px)',
            data: res?.user || null,
          });

          dialogRef.afterClosed().subscribe((updatedAgent) => {
            if (updatedAgent) {
              this.getUserList();
            }
          });
        }
      },
      error: (err) => { },
    });
  }

  deleteUser(agent: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `Delete ${agent?.role}`,
        message: `Are you sure you want to delete ${agent.userName} ${agent.last_name ? agent.last_name : ''
          }?`,
        confirmBtnText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this._userService.deleteUser(agent._id).subscribe({
          next: (res: any) => {
            if (res?.success === true) {
              this.snackBar.openFromComponent(CustomSnackbarComponent, {
                data: {
                  message: res?.message,
                  type: 'success',
                  icon: 'check_circle',
                },
                duration: 4000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['no-default-snackbar'],
              });
              this.getUserList();
            }
          },
          error: (err) => {
            console.error(err);
            this.dialog.open(AlertDialogComponent, {
              data: {
                type: 'error',
                title: 'Error!',
                message:
                  err?.error?.message ||
                  'Failed to delete the agent. Please try again later.',
              },
            });
          },
        });
      }
    });
  }

  openViewAgentPage(agentId: number) {
    this.router.navigate(['users/view-agent', agentId]);
  }

  // 🔹 Load and fetch data
  async loadData(page: number = this.currentPage) {
    this.currentPage = Math.max(1, page);
    let visibleAgents: any[] = [];
    let currentPage = this.currentPage;
    let lastResponse: any = null; // store last API response

    // Keep fetching until we have enough non-deleted users or no more pages
    while (visibleAgents.length < this.itemsPerPage) {
      const res = await this.fetchData(currentPage);
      lastResponse = res; // save latest response

      // If no data, stop
      if (!res || !res.data || res.data.length === 0) break;

      // Filter out deleted users
      const filteredData = res.data.filter(
        (agent: any) => agent.status === 0 || agent.status === 1
      );

      visibleAgents = [...visibleAgents, ...filteredData];

      // Stop if reached last backend page
      if (currentPage >= res.totalPages) break;

      currentPage++;
    }

    // Slice to show only 10 items
    this.items = visibleAgents.slice(0, this.itemsPerPage);
    this.allItems = visibleAgents;

    // Use last response for totals if available
    if (lastResponse) {
      this.totalPages = lastResponse.totalPages;
      this.totalItems = lastResponse.totalItems;
    }
  }

  fetchData(
    page: number
  ): Promise<{ data: any[]; totalPages: number; totalItems: number }> {
    return new Promise((resolve) => {
      this._userService.getUser(page).subscribe((res) => {
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

        if (column === 'updated_at') {
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
  toggleArrow() {
    this.isArrowOpen = !this.isArrowOpen;
  }
  toggleFilterDropdown() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.filterItems(['name', 'last_name', 'role', 'email']);
    this.items = this.allItems.filter((item) => {
      const supervisorMatch = this.selectedSupervisor
        ? item.parentid === this.selectedSupervisor
        : true;
      const statusMatch =
        this.selectedStatus !== ''
          ? item.status == this.selectedStatus // double equals handles number/string
          : true;
      return supervisorMatch && statusMatch;
    });
  }

  // 🔹 Filter / Search
  filterItems(searchKeys: string[]) {
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

  // 🔹 Pagination
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

  // 🔹 Modal handling
  openModal(item: any) {
    this.selectedItem = item;
  }
  closeModal() {
    this.selectedItem = null;
  }

  // 🔹 UI helpers
  statusColor(status: string | number): string {
    if (
      status === 1 ||
      status === '1' ||
      status === 'ONLINE' ||
      status === 'yes'
    ) {
      return '#64bcac'; // teal-green for online
    }
    if (
      status === 0 ||
      status === '0' ||
      status === 'OFFLINE' ||
      status === 'no'
    ) {
      return '#e45c64'; // red for offline
    }
    if (
      status === 2 ||
      status === '2' ||
      status === 'DELETED' ||
      status === 'deleted'
    ) {
      return '#CBCBCB'; // gray for deleted
    }
    return 'gray'; // fallback
  }
  // getInitials(agent: any): string {
  //   const first = agent?.name?.charAt(0).toUpperCase() ?? '';
  //   const last = agent?.last_name?.charAt(0).toUpperCase() ?? '';
  //   return first + last || 'NA';
  // }
  getInitials(name: string | undefined): string {
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
  isOverflowing(el: HTMLElement, maxWidth: number = 250): boolean {
    return el.scrollWidth > maxWidth;
  }

  toggleAgentStatus(agent: any): void {
    // agent.status = !agent.status;
    this.cdr.detectChanges();
    const payload = {
      status: agent.status === 0 ? 1 : 0,
    };
    this._userService.updateUserstatus(agent._id, payload).subscribe({
      next: (res: any) => {
        if (res?.success === true) {
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            data: {
              message: res?.message,
              type: 'success',
              icon: 'check_circle',
            },
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['no-default-snackbar'],
          });
          this.getUserList();
        }
      },
      error: (err) => {
        console.error(err);
        this.dialog.open(AlertDialogComponent, {
          data: {
            type: 'error',
            title: 'Error!',
            message: err?.error?.message,
          },
        });
      },
    });
  }
}
