import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UsersService } from '../../core/services/users.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonOtpPopupComponent } from '../popup/common-otp-popup/common-otp-popup.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, MatButtonModule, MatMenuModule, MatIconModule, MatSlideToggleModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  elapsedTime = '00:00:00';
  private timerInterval: any;



  sidebarOpen = false;
  isActiveStatus: boolean = false;
  loggedUser: any;
  userInfo2: { username: string | null; profile: string | null } = {
    username: null,
    profile: null
  };

  userInfo: any;


  constructor(public router: Router, public authService: AuthService, private _userService: UsersService, private dashboardService: DashboardService, private _dialog: MatDialog) {
    const loggedData = sessionStorage.getItem("loginUser");
    if (loggedData != null) {
      this.loggedUser = JSON.parse(loggedData);
    }
    // console.log("header===>",this.loggedUser)

    const userStatus = sessionStorage.getItem('userStatus');
    // if (userStatus == 'yes') {
    //   this.isActiveStatus = true;
    // } else {
    //   this.isActiveStatus = false;
    // }


  }

  ngOnInit() {
    this.getUserProfile();
    const savedLoginTime = localStorage.getItem('loginTime');
    if (savedLoginTime) {
      // this.startTimer(+savedLoginTime);
    }
  }




  getUserProfile() {
    const userId = sessionStorage.getItem('userId')
    this.dashboardService.getUserProfileData(userId).subscribe({
      next: (res) => {
        if (res.success === true) {
          this.userInfo = res?.user;
          this.isActiveStatus = res?.user?.active
          // console.log("this.userInfo", this.userInfo)
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }




  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  validateOtp(linkUrl: string) {
    this.sidebarOpen = false;
    const dialogRef = this._dialog.open(CommonOtpPopupComponent, {
      data: {
        linkName: linkUrl
      },
      disableClose: true,
      backdropClass: 'otp-backdrop'
    })
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (linkUrl === 'dashboard') {
          this.router.navigate(['/dashboard']);
        } else if (linkUrl === 'users') {
          this.router.navigate(['/users'])
        }
      }
    })
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  onToggleChange(event: any) {
    this.isActiveStatus = event.checked;
    console.log('Agent active state:', this.isActiveStatus);
  }

  startTimer(loginTime: number) {
    this.timerInterval = setInterval(() => {
      const diff = Date.now() - loginTime;
      this.elapsedTime = this.formatTime(diff);
    }, 1000);
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }


}
