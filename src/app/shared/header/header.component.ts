import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UsersService } from '../../core/services/users.service';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, MatButtonModule, MatMenuModule, MatIconModule, MatSlideToggleModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  sidebarOpen = false;
  isActiveStatus: boolean = false;
  loggedUser: any;
  userInfo2: { username: string | null; profile: string | null } = {
    username: null,
    profile: null
  };

  userInfo: any;


  constructor(public router: Router, public authService: AuthService, private _userService: UsersService, private dashboardService: DashboardService) {
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

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  onToggleChange(event: any) {
    this.isActiveStatus = event.checked;
    console.log('Agent active state:', this.isActiveStatus);
  }


}
