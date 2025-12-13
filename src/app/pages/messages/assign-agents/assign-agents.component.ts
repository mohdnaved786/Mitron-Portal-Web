import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ViewReplyComponent } from '../view-reply/view-reply.component';
import { AgentsService } from '../../../core/services/agents.service';
import { AlertDialogComponent } from '../../../shared/components/alert-dialog/alert-dialog.component';
import { CustomSnackbarComponent } from '../../../shared/components/custom-snackbar/custom-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessagesService } from '../../../core/services/messages.service';

@Component({
  selector: 'app-assign-agents',
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-agents.component.html',
  styleUrl: './assign-agents.component.css',
})
export class AssignAgentsComponent implements OnInit {
  agentData: any = [];
  searchText = '';
  filteredAgents: any[] = [];
  currentPage: number = 1;
  perPage: number = 10; // items per page
  totalPages: number = 0;
  totalItems: number = 0;
  pagination: (number | string)[] = []; // for "1 2 3 ... 10"
  selectedAgent: any = null;

  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  // Smoothly scroll down (but not fully to bottom)
  lastScrollTop = 0; // previous scroll position
  showScrollButton: 'up' | 'down' | null = null; // which button to show
  customerId: any;
  constructor(
    public dialogRef: MatDialogRef<ViewReplyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private AgentsServices: AgentsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private messageService: MessagesService
  ) {

    if (sessionStorage.getItem('customerID')) {
      this.customerId = sessionStorage.getItem('customerID')
    }


  }

  ngOnInit() {
    this.getAgentsList();
  }

  /** Load chat messages for this number */

  getAgentsList(page: number = 1) {
    this.currentPage = page;

    this.AgentsServices.getAgents(page).subscribe({
      next: (res: any) => {
        this.agentData = res.data.data;
        this.totalPages = res.data.last_page;
        this.totalItems = res.data.total;
        this.generatePagination();

        // filter agents with current search term
        this.filterAgents();
      },
      error: (err) => console.error(err),
    });
  }

  filterAgents() {
    const term = this.searchText.toLowerCase().trim();

    if (!term) {
      this.filteredAgents = [...this.agentData];
      return;
    }

    this.filteredAgents = this.agentData.filter(
      (agent: any) =>
        agent.name.toLowerCase().includes(term) ||
        agent.mobile?.toLowerCase().includes(term)
    );
  }

  generatePagination() {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (current >= total - 3) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }

    this.pagination = pages;
  }

  firstPage() {
    this.getAgentsList(1);
  }
  prevPage() {
    if (this.currentPage > 1) this.getAgentsList(this.currentPage - 1);
  }
  nextPage() {
    if (this.currentPage < this.totalPages)
      this.getAgentsList(this.currentPage + 1);
  }
  lastPage() {
    this.getAgentsList(this.totalPages);
  }
  goToPage(page: number) {
    this.getAgentsList(page);
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }

  /** Get initials for avatar */
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

  /** Close dialog */
  close() {
    this.dialogRef.close();
  }

  statusColor(status: any): any {
    return status === 1 ? '#64bcac' : '#e45c64';
  }

  onAgentSelect(agent: any) {
    this.selectedAgent = agent?.id;
  }

  assignAgent() {
    if (this.selectedAgent) {
      console.log('Assigned agent:', this.selectedAgent);
      const formData = new FormData();
      formData.append('agent_id', this.selectedAgent.toString());
      formData.append('customer_id[]', this.customerId.toString());



      this.messageService.assignagent(formData).subscribe({
        next: (res) => {
          console.log(res);
          if (res.success === true) {
            // this.dialogRef.close(true);
            // const dialogRef = this.dialog.open(AlertDialogComponent, {
            //   data: {
            //     type: 'success',
            //     title: 'Success!',
            //     message: 'User created successfully.',
            //   },
            // });
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
          } else {
            this.dialog.open(AlertDialogComponent, {
              data: {
                type: 'warning',
                title: 'Warning!',
                message: res.message || 'Invalid email or password.',
              },
            });
          }
        },
        error: (err) => {
          console.error(err);
          this.dialog.open(AlertDialogComponent, {
            data: {
              type: 'error',
              title: 'Error!',
              message:
                err?.message ||
                'Something went wrong. Please try again later.',
            },
          });
        },
      });















    }
  }


  getOnlineDuration(updatedAt: string): string {
    const now = new Date();
    const lastOnline = new Date(updatedAt);

    const diffMs = now.getTime() - lastOnline.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

}
