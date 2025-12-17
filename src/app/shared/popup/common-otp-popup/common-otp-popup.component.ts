import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { CommonValidators } from '../../validators/common-validators';
import { OtpService } from '../../../core/services/otp.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../../components/custom-snackbar/custom-snackbar.component';

@Component({
  selector: 'app-common-otp-popup',
  imports: [MatRadioModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './common-otp-popup.component.html',
  styleUrl: './common-otp-popup.component.css'
})
export class CommonOtpPopupComponent {
  unSubscribeSubject: any = new Subject();
  form: FormGroup | any;
  timer = 10;
  interval: any;
  canResend = true;
  selectedOption = '';
  showTimer: boolean = false;
  constructor(private _fb: FormBuilder, private _otpService: OtpService, private snackBar: MatSnackBar) {
    this.form = this._fb.group({

      otp1: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
      otp2: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
      otp3: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
      otp4: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
      otp5: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
      otp6: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
    });

  }


  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  startTimer() {
    this.timer = 10;
    this.canResend = true;

    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        this.canResend = false;
        this.showTimer = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }

  moveFocus(
    currentInput: HTMLInputElement,
    nextInput: HTMLInputElement | null
  ): void {
    if (currentInput.value.length === currentInput.maxLength) {
      nextInput?.focus();
    }
  }

  handleBackspace(
    event: KeyboardEvent,
    currentInput: HTMLInputElement,
    prevInput: HTMLInputElement | null
  ): void {
    if (event.key === 'Backspace' && currentInput.value === '') {
      prevInput?.focus();
    }
  }

  chooseVal(event: any) {
    if (event?.value) {
      const payload = {
        email: "naved@gmail.com",
        purpose: "verification"
      }

      this._otpService.getOtp(payload).pipe(takeUntil(this.unSubscribeSubject)).subscribe({
        next: ((res) => {
          if (res?.success === true) {
            this.showTimer = true;
            this.startTimer();
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
          }
        }),
        error: ((err) => {

        })
      })
    }
  }



  verifyOtp() {

  }

  resendOtp() {
    this.startTimer();
    this.showTimer = true;
  }

}
