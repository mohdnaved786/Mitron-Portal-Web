import { Component } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';
import { ViewReplyComponent } from '../messages/view-reply/view-reply.component';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  dashboardData: any;
  loading = true;
  activeTab: 'top' | 'inactive' = 'top';
  userInfo: any;

  constructor(
    private dashboardService: DashboardService,
    public dialog: MatDialog,
    private _userService: UsersService
  ) { }

  ngOnInit(): void {
    this.getDashboard();
    // this.getUserProfile();
  }

  getDashboard() {
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        if (res.success === true) {
          this.dashboardData = res.data;
          console.log("this.dashboardData", this.dashboardData?.latestMessages[0]?.from)
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getUserProfile() {
    const userId = sessionStorage.getItem('userId')
    this.dashboardService.getUserProfileData(userId).subscribe({
      next: (res) => {
        if (res.success === true) {
          this.userInfo = res?.user;
          console.log("this.userInfo", this.userInfo)
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // Utility functions
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

  openViewReply(msg: any) {
    this.dialog.open(ViewReplyComponent, {
      width: '100%',
      data: {
        name: msg.wa_name,
        number: msg.wa_number,
        avatar: msg.wa_media_url || '',
      },
    });
  }
}
