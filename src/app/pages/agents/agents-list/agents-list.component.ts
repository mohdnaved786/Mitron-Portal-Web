import { Component, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgentsService } from '../../../core/services/agents.service';
import { AddEditAgentsComponent } from '../add-edit-agents/add-edit-agents.component';
import { ViewAgentComponent } from '../view-agent/view-agent.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AddEditTeamsComponent } from '../teams/add-edit-teams/add-edit-teams.component';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from '../../../shared/components/alert-dialog/alert-dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UsersService } from '../../../core/services/users.service';
import { CustomSnackbarComponent } from '../../../shared/components/custom-snackbar/custom-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-agents-list',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './agents-list.component.html',
  styleUrl: './agents-list.component.css',
})
export class AgentsListComponent {
  // Pagination and data properties
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
  supervisors: string[] = ['John', 'Mary', 'Alex']; // Example list

  isArrowOpen = false;

  constructor(
    private agentsService: AgentsService,
    private _userSerice: UsersService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private _agentService: AgentsService
  ) { }

  ngOnInit(): void {
    // this.loadData(1);
    this.getAgentList();
  }

  getAgentList() {
    this.agentsService.getAgentList().pipe(takeUntil(this.unSubscribeSubject)).subscribe({
      next: ((res) => {
        if (res?.success === true) {
          this.items = res?.agents
          this.allItems = res?.agents
        }
      }),
      error: ((err) => {

      })
    })
  }
  toggleArrow() {
    this.isArrowOpen = !this.isArrowOpen;
  }
  loadAgentDetails(id: number) {
    this.agentsService.getAgentById(id).subscribe({
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

  // addAgents() {
  //   const dialogRef = this.dialog.open(AddEditAgentsComponent, {
  //     width: '90%',
  //     maxWidth: 'var(--mat-dialog-container-max-width, 800px)',
  //   });

  //   dialogRef.afterClosed().subscribe((addAgent) => {
  //     if (addAgent) {
  //       this.loadData(this.currentPage); // reload table after add
  //     }
  //   });
  // }

  editAgent(agent?: any) {
    const agentId = agent?._id;
    this._agentService.getAgentByIdNew(agentId).subscribe({
      next: (res) => {
        if (res?.success === true) {
          const dialogRef = this.dialog.open(AddEditAgentsComponent, {
            width: '90%',
            panelClass: 'agent-edit-dialog',
            maxWidth: 'var(--mat-dialog-container-max-width, 800px)',
            data: res?.data || null,
          });

          dialogRef.afterClosed().subscribe((updatedAgent) => {
            if (updatedAgent) {
              this.loadData(this.currentPage);
            }
          });
        }
      },
      error: (err) => { },
    });
  }

  deleteAgent(agent: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Agent',
        message: `Are you sure you want to delete ${agent.name} ${agent.last_name}?`,
        confirmBtnText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.agentsService.deleteAgent(agent.id).subscribe({
          next: (res: any) => {
            this.dialog.open(AlertDialogComponent, {
              data: {
                type: 'success',
                title: 'Deleted!',
                message: res?.message || 'Agent deleted successfully.',
              },
            });
            this.loadData(this.currentPage); // refresh data
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

  // openDialog() {
  //   this.dialog.open(AddEditAgentsComponent, {
  //     width: '90%',
  //     maxWidth: 'var(--mat-dialog-container-max-width, 800px)',
  //   });
  //   // dialogRef.afterClosed().subscribe((val) => {
  //   // });
  // }

  openViewAgentPage(agentId: number) {
    this.router.navigate(['/view-agent', agentId]); // match the route
  }

  //   openViewAgentDialog() {
  //   this.dialog.open(ViewAgentComponent, {
  //     width: '90%',
  //     maxWidth: 'var(--mat-dialog-container-max-width, 800px)',

  //   });

  //   // dialogRef.afterClosed().subscribe((val) => {
  //   // });
  // }

  // 🔹 Load and fetch data
  async loadData(page: number = this.currentPage) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    const res = await this.fetchData(this.currentPage);
    this.allItems = res.data;
    this.items = [...this.allItems];
    this.totalPages = res.totalPages;
    this.totalItems = res.totalItems;
  }

  fetchData(
    page: number
  ): Promise<{ data: any[]; totalPages: number; totalItems: number }> {
    return new Promise((resolve) => {
      this.agentsService.getAgents(page).subscribe((res) => {
        if (res.success) {
          resolve({
            data: res.data.data,
            totalPages: res.data.last_page,
            totalItems: res.data.total,
          });
          console.log('this.items----------->', res.data.data);
        }
      });
    });
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
          ? item.isOnline === this.selectedStatus
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

  // 🔹 Pagination Controls
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

  // 🔹 Modal handling
  openModal(item: any) {
    this.selectedItem = item;
  }
  closeModal() {
    this.selectedItem = null;
  }

  // teams
  openTeamsDialog(data?: any) {
    const dialogRef = this.dialog.open(AddEditTeamsComponent, {
      width: '500px',
      data: data || null,
      disableClose: true,
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Optionally refresh list or handle new/updated team
        console.log('Team saved or updated:', result);
      }
    });
  }

  // 🔹 Status
  statusColor(status: any): any {
    return status === 1 ? '#64bcac' : '#e45c64';
  }
  // image initials
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
  } // 🔹 Active/Inactive Toggle
  toggleAgentStatus_old(agent: any): void {
    alert(agent.online);
    agent.online = !agent.online;
    this.cdr.detectChanges();

    console.log(
      `Agent ${agent.name} is now ${agent.active ? 'Active' : 'Inactive'}`
    );

    // Optional backend call
    const payload = {
      online: agent.active ? 1 : 0,
    };
    return;
    this._userSerice.updatestatus(agent.id, payload).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => { },
    });
  }

  toggleAgentStatus(agent: any): void {
    // agent.status = !agent.status;
    this.cdr.detectChanges();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        isAgent: true,
        agent: agent,
        title: 'Are you Sure?',
        message: `Are you sure you want to ${agent.online === 0 ? 'online' : 'offline'
          }?`,
        confirmBtnText: 'YES',
        cancelBtnText: 'NO',
      },
    });

    dialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        const payload = {
          online: agent.online === 0 ? 1 : 0,
        };
        this._agentService.updateAgentOnlineStatus(agent._id, payload).subscribe({
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
              this.getAgentList();
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
    });
  }

  toggleOverlay(agent: any) {
    // Hide overlay on all other rows first if you want
    this.items.forEach(a => {
      if (a !== agent) a.showOverlay = false;
    });

    // Toggle the clicked row
    agent.showOverlay = !agent.showOverlay;
  }

}
