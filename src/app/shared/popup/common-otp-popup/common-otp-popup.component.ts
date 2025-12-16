import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { CommonValidators } from '../../validators/common-validators';

@Component({
  selector: 'app-common-otp-popup',
  imports: [MatRadioModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './common-otp-popup.component.html',
  styleUrl: './common-otp-popup.component.css'
})
export class CommonOtpPopupComponent {
  constructor(private _fb: FormBuilder) {
    this.form = this._fb.group({

      otp1: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
      otp2: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
      otp3: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
      otp4: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
      otp5: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
      otp6: ['', [Validators.required, CommonValidators.onlyAllowNumbers()]],
    });

  }
  form: FormGroup | any;
  timer = 10;
  interval: any;
  canResend = true;
  selectedOption = '';

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



  verifyOtp() {

  }

  resendOtp() {
    this.startTimer();
  }

}
