import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CommonValidators {
  static numericOnly(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const isNumeric = /^[0-9]*$/.test(value);

    if (!isNumeric) {
      control.setValue('', { emitEvent: false });
      return { numericOnly: true };
    }

    return null;
  }

  static onlyAllowNumbers(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // If empty, no validation needed (can be combined with required validator)
      if (!value) {
        return null;
      }

      // Allow only digits, and no leading zeros unless it's a single zero
      const validFormat = /^[0-9][0-9]*$/;

      if (!validFormat.test(value)) {
        control.setValue('', { emitEvent: false });
        return null;
      }

      const numericValue = parseInt(value, 10);
      if (numericValue <= -1) {
        control.setValue('', { emitEvent: false });
        return null;
      }

      return null;
    };
  }
}
