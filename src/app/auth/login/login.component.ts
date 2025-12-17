import { CommonModule } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { AlertDialogComponent } from '../../shared/components/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoadingBarHttpClientModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  showPassword = false;
  loginError: string = '';
  isSubmitting = false;


  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private zone: NgZone,
    private dialog: MatDialog
  ) { }
  ngOnInit(): void {
    this.UserLogin();
  }
  loginForm!: FormGroup;

  UserLogin() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  // onLogin() {
  //   this.authService.login(this.loginForm.value).subscribe({
  //     next: (res: any) => {
  //       if (res.message === "Login successful") {
  //         this.authService.saveToken(res.access_token);
  //         alert(res.message);
  //         this.router.navigate(['/dashboard']);
  //       } else {
  //         alert(res.message);
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       alert("Login failed. Please try again.");
  //     }
  //   });
  // }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true; // To disable the button

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        if (res.message === 'Login successful') {
          this.authService.saveToken(res.token);
          sessionStorage.setItem('userId', res.user.id)
          this.loginError = 'Login Successful';
          this.zone.run(() => this.router.navigate(['/dashboard']));
          this.startSessionTimer();
          // this.router.navigate(['/dashboard']);
        } else {
          this.loginError = 'Invalid email/password';
        }
        this.isSubmitting = false; // enable after request is completed
      },
      error: (err) => {
        console.error(err);
        this.loginError = 'Invalid email/password';
        this.isSubmitting = false; // Enabled even on error
      },
    });
  }


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get f() {
    return this.loginForm.controls;
  }

  startSessionTimer() {
    const loginTime = Date.now();
    localStorage.setItem('loginTime', loginTime.toString());
  }
}
