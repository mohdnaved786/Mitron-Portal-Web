import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { CommonValidators } from '../../validators/common-validators';
import { OtpService } from '../../../core/services/otp.service';
import { Subject, take, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../../components/custom-snackbar/custom-snackbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-common-otp-popup',
  imports: [MatRadioModule, FormsModule, CommonModule, ReactiveFormsModule, MatIconModule, MatTooltip],
  templateUrl: './common-otp-popup.component.html',
  styleUrl: './common-otp-popup.component.css'
})
export class CommonOtpPopupComponent {
  @ViewChild('otp6') otp6!: ElementRef;
  unSubscribeSubject: any = new Subject();
  form: FormGroup;
  timer = 30;
  showResend: boolean = false;
  interval: any;
  canResend = true;
  showSendIcon: boolean = false;
  selectedOption = '';
  showTimer: boolean = false;
  constructor(public dialogRef: MatDialogRef<CommonOtpPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _fb: FormBuilder, private _otpService: OtpService, private snackBar: MatSnackBar, private matDialog: MatDialog) {
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

  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  startTimer() {
    this.timer = 30;
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
      this.showSendIcon = true;
      // this.showResend = true;
      // this.getOtp();
    }
  }


  getOtp() {
    const payload = {
      email: "naved@gmail.com",
      purpose: "verification"
    }

    this._otpService.getOtp(payload).pipe(takeUntil(this.unSubscribeSubject)).subscribe({
      next: ((res) => {
        if (res?.success === true) {
          this.showTimer = true;
          this.startTimer();
          this.showResend = true;
          this.showSendIcon = false;
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




  verifyOtp() {
    if (this.form.valid) {
      const otp1 = this.form?.value?.otp1;
      const otp2 = this.form?.value?.otp2;
      const otp3 = this.form?.value?.otp3;
      const otp4 = this.form?.value?.otp4;
      const otp5 = this.form?.value?.otp5;
      const otp6 = this.form?.value?.otp6;
      const OTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
      const payload = {
        email: "naved@gmail.com",
        purpose: "verification",
        otp: OTP
      }
      this._otpService.validateOtp(payload).pipe(takeUntil(this.unSubscribeSubject)).subscribe({
        next: ((res) => {
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
            this.dialogRef.close(true);
          } else {
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              data: {
                message: res?.message,
                type: 'error',
                icon: 'check_circle',
              },
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['no-default-snackbar'],
            });
          }
        }),
        error: ((err) => {
          console.log(err)
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            data: {
              message: err?.error?.message,
              type: 'error',
              icon: 'check_circle',
            },
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['no-default-snackbar'],
          });
        })
      })
    } else { }
  }

  resendOtp() {
    this.getOtp();
    this.form.reset();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  handlePaste(event: ClipboardEvent) {
    if (this.form.valid) return;
    event.preventDefault();

    const otp = event.clipboardData
      ?.getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (otp && otp.length === 6) {
      ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6']
        .forEach((key, i) => this.form.get(key)?.setValue(otp[i]));

      setTimeout(() => this.otp6.nativeElement.focus());
    }
  }

  // handlePaste(event: ClipboardEvent) {
  //   event.preventDefault();

  //   const pastedData = event.clipboardData?.getData('text') || '';
  //   const otp = pastedData.replace(/\D/g, '').slice(0, 6); // numbers only

  //   if (otp.length === 6) {
  //     const controls = ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6'];

  //     controls.forEach((control, index) => {
  //       this.form.get(control)?.setValue(otp[index]);
  //     });
  //   }
  // }

}