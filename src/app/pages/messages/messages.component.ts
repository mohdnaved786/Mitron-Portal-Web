import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessagesService } from '../../core/services/messages.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewReplyComponent } from './view-reply/view-reply.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { QuickReplyComponent } from './quick-reply/quick-reply.component';
import { AlertDialogComponent } from '../../shared/components/alert-dialog/alert-dialog.component';
import { CustomSnackbarComponent } from '../../shared/components/custom-snackbar/custom-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-messages',
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent implements OnInit, OnDestroy {
  // Pagination & general properties
  items: any[] = [];
  allItems: any[] = [];
  selectedItem: any = null;

  currentPage = 1;
  totalPages = 1;
  per_page = 10;
  totalItems = 0;
  searchQuery: string = '';
  pageName: string = 'Messages';

  // Component-specific properties
  selectedTab: 'ALL' | 'REPLIED' | 'NOT_REPLIED' = 'ALL';
  filteredMessages: any[] = [];
  data: any[] = [];
  searchTerm: string = '';

  refreshCountdown: number = 20; // 20 seconds default
  countdownInterval: any;
  isRefreshing = false;
  selectedAgentIds: number[] = [];

  loadPercent = 0;
  radius = 20;
  circumference = 2 * Math.PI * this.radius;
  dashOffset = this.circumference;

  // Bulk selection
  selectAll: boolean = false;

  // New filters
  showFilters = false;
  selectedAgent: boolean = true;
  // Populate from your API or define manually
  customers: string[] = ['Digital', 'John Doe', 'Mary Support'];
  types: string[] = ['Text', 'Image', 'video'];

  constructor(
    private messageService: MessagesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  // 🔹 Lifecycle hook: On component initialization
  ngOnInit(): void {
    // this.loadData(1);
    // this.refreshList();
    // this.startAutoRefreshCountdown();
  }

  ngOnDestroy(): void {
    // Stop the countdown when leaving the page
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  // ----------------- Data Loading & API Methods -----------------

  // 🔹 Load messages data with pagination
  async loadData(page: number = this.currentPage) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    const res = await this.fetchData(this.currentPage, this.per_page);
    this.allItems = res.data;
    this.items = [...this.allItems];
    this.totalPages = res.totalPages;
    this.totalItems = res.totalItems;
  }

  // 🔹 Fetch messages from API
  fetchData(
    page: number,
    per_page: number
  ): Promise<{ data: any[]; totalPages: number; totalItems: number }> {
    return new Promise((resolve) => {
      this.messageService.getMessages(page, per_page).subscribe((res) => {
        if (res.success) {
          res.data.data.forEach((msg: any) => {
            msg.wa_types = [];
            if (msg.wa_type === 'image' && msg.wa_media_url)
              msg.wa_types.push('image');
            if (msg.wa_type === 'video' && msg.wa_media_url)
              msg.wa_types.push('video');
            if (msg.wa_req_message?.trim()) msg.wa_types.push('text');
          });

          this.data = res.data.data;
          this.updateFilteredMessages(this.data);

          resolve({
            data: res.data.data,
            totalPages: res.data.last_page,
            totalItems: res.data.total,
          });
        }
      });
    });
  }

  // Bulk selection mode
  bulkSelectMode: boolean = false;

  toggleBulkSelectMode() {
    this.bulkSelectMode = !this.bulkSelectMode;

    if (!this.bulkSelectMode) {
      // Clear all selections when exiting bulk mode
      this.selectAll = false;
      this.filteredMessages.forEach((msg) => (msg.selected = false));
    }
  }

  // toggleSelectAll() {
  //   this.filteredMessages.forEach((msg) => (msg.selected = this.selectAll));
  // }
  toggleSelectAll() {

    this.filteredMessages.forEach((msg) => (msg.selected = this.selectAll));

    // When selecting all → collect all agent IDs
    if (this.selectAll) {
      this.selectedAgent = false;
      this.collectSelectedAgentIds();
    } else {
      this.selectedAgent = true;
      this.selectedAgentIds = [];
    }
  }


  // checkSelectAllStatus(agentId: any) {
  //   this.selectAll = this.filteredMessages.every((msg) => msg.selected);
  // }

  checkSelectAllStatus() {
    this.selectedAgent = false;
    this.selectAll = this.filteredMessages.every((msg) => msg.selected);
    this.collectSelectedAgentIds();
  }

  collectSelectedAgentIds() {
    this.selectedAgentIds = this.filteredMessages
      .filter(msg => msg.selected)
      .map(msg => msg.id);
  }


  // Get selected messages (useful for bulk actions)
  getSelectedMessages(): any[] {
    return this.filteredMessages.filter((msg) => msg.selected);
  }

  toggleFilterDropdown() {
    this.showFilters = !this.showFilters;
  }

  startAutoRefreshCountdown() {
    // clear previous interval if any
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    const totalSeconds = 20;
    this.refreshCountdown = totalSeconds;
    this.loadPercent = 0;
    this.updateDashOffset();

    this.countdownInterval = setInterval(() => {
      this.refreshCountdown--;
      const elapsed = totalSeconds - this.refreshCountdown;
      this.loadPercent = (elapsed / totalSeconds) * 100;
      this.updateDashOffset();

      if (this.refreshCountdown <= 0) {
        clearInterval(this.countdownInterval);
        this.refreshList();
      }
    }, 1000);
  }

  // 🔹 Refresh message list with loading animation
  async refreshList() {
    //  Stop countdown timer while refreshing
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    this.isRefreshing = true;
    this.loadPercent = 0;
    this.updateDashOffset();

    // Simulated smooth loader for UI feel (optional)
    const interval = setInterval(() => {
      if (this.loadPercent < 90) {
        this.loadPercent += 10;
        this.updateDashOffset();
      }
    }, 100);

    //  Actual data load
    await this.loadData(1);

    // Cleanup
    clearInterval(interval);
    this.loadPercent = 100;
    this.updateDashOffset();

    this.isRefreshing = false;

    //  Restart countdown cleanly from 20 again
    this.startAutoRefreshCountdown();
  }

  //  Update circular progress dash offset
  updateDashOffset() {
    const progress = this.loadPercent / 100;
    this.dashOffset = this.circumference * (1 - progress);
  }

  // ----------------- Filtering & Search Methods -----------------

  //  Update filtered messages based on selected tab
  updateFilteredMessages(messages: any[]) {
    switch (this.selectedTab) {
      case 'REPLIED':
        // Show only replied messages (read_status = 1)
        this.filteredMessages = messages.filter((msg) => msg.read_status === 1);
        break;

      case 'NOT_REPLIED':
        // Show only not replied messages (read_status = 0)
        this.filteredMessages = messages.filter((msg) => msg.read_status === 0);
        break;

      case 'ALL':
      default:
        // Show all messages (including those with blank or null status)
        this.filteredMessages = messages;
        break;
    }
  }

  //  Select tab to filter messages
  selectTab(tab: 'ALL' | 'REPLIED' | 'NOT_REPLIED') {
    this.selectedTab = tab;
    this.updateFilteredMessages(this.data);
  }

  //  Filter items based on searchQuery and specified keys
  filterItems(searchKeys: string[]) {
    let filtered = [...this.allItems];

    if (this.searchQuery?.trim()) {
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
    this.updateFilteredMessages(filtered); // optional: keep tab filtering in sync
  }

  //  Search messages
  // onSearch() {
  //   this.messageService.getMessages(1, this.searchTerm).subscribe((res) => {
  //     const messages = res?.data?.data || [];
  //     messages.forEach((msg: any) => {
  //       msg.wa_types = [];
  //       if (msg.wa_type === 'image' && msg.wa_media_url)
  //         msg.wa_types.push('image');
  //       if (msg.wa_type === 'video' && msg.wa_media_url)
  //         msg.wa_types.push('video');
  //       if (msg.wa_req_message?.trim()) msg.wa_types.push('text');
  //     });
  //     this.data = messages;
  //     this.updateFilteredMessages(this.data);
  //   });
  // }

  // ----------------- Pagination Methods -----------------

  //  Pagination controls
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

  //  Go to a specific page
  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.loadData(page);
    }
  }

  //  Get count of filtered items
  get filteredItemsCount(): number {
    if (!this.searchTerm?.trim()) {
      return this.allItems.length;
    }
    return this.filteredMessages.length;
  }

  // 🔹 Get total pages for filtered data
  get filteredTotalPages(): number {
    const data = this.searchTerm?.trim()
      ? this.filteredMessages
      : this.allItems;
    return Math.ceil(data.length / this.per_page) || 1;
  }

  // 🔹 Generate filtered pagination array
  get filteredPagination(): (number | string)[] {
    const data = this.searchTerm?.trim()
      ? this.filteredMessages
      : this.allItems;
    const total = Math.ceil(data.length / this.per_page) || 1;
    const current = this.currentPage;

    const pages: (number | string)[] = [];
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

  // 🔹 Generate pagination array
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

  // ----------------- Modal & Dialog Methods -----------------

  // 🔹 Open dialog to Quick reply
  openQuickReply() {
    this.dialog.open(QuickReplyComponent, {
      width: '95%',
      height: '95%',
    });
  }

  // 🔹 Open dialog to view message reply
  openViewReply(rowData: any) {
    sessionStorage.setItem('customerID', rowData?.id)
    console.log('rowData---------------->', rowData);
    this.dialog.open(ViewReplyComponent, {
      width: '950px',
      maxWidth: 'var(--mat-dialog-container-max-width, 800px)',
      data: {
        name: rowData.wa_name,
        number: rowData.wa_number,
        avatar: rowData.wa_media_url || '',
      },
    });
  }

  // 🔹 Open modal
  openModal(item: any) {
    this.selectedItem = item;
  }

  // 🔹 Close modal
  closeModal() {
    this.selectedItem = null;
  }

  // ----------------- Utility Methods -----------------

  // 🔹 Get initials from a name
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

  // 🔹 Convert timestamp to "time ago" format
  getTimeAgo(receivedAt: string): string {
    const now = new Date();
    const received = new Date(receivedAt);
    const diff = now.getTime() - received.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} sec${seconds > 1 ? 's' : ''} ago`;
  }

  // 🔹 Get icon class based on message type
  getIcon(type: string): string {
    switch (type) {
      case 'image':
        return 'bi bi-card-image';
      case 'video':
        return 'bi bi-camera-video';
      case 'text':
        return '';
      default:
        return 'bi bi-question';
    }
  }


  assignAgent() {
    console.log(this.selectedAgentIds);
    // return
    const formData = new FormData();
    formData.append('agent_id', '1');
    this.selectedAgentIds.forEach(id => {
      formData.append('customer_id[]', id.toString());
    });


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
