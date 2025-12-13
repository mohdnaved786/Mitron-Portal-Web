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
}
