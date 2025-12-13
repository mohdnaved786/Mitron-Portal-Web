import { Component, Inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { CustomerService } from '../../../core/services/customers.service';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AlertDialogComponent } from '../../../shared/components/alert-dialog/alert-dialog.component';
import { CountrySelectorComponent } from '../../../shared/components/country-selector/country-selector.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../../../shared/components/custom-snackbar/custom-snackbar.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-add-edit-customers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    FormsModule,
    MatSlideToggleModule,
    CountrySelectorComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  templateUrl: './add-edit-customers.component.html',
  styleUrls: ['./add-edit-customers.component.css'],
})
export class AddEditCustomersComponent implements OnInit {
  editCustomerForm: FormGroup;
  isEditMode = false;
  photoUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  formSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditCustomersComponent>,
    private customersService: CustomerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    //  Only 3 required fields
    this.editCustomerForm = this.fb.group({
      name: ['', Validators.required],
      country: [null, Validators.required],
      mobile: ['', Validators.required],
      email: [''],
      gender: [''],
      dob: [''],
      doa: [''],
      profile_image: [null],
    });
  }

  ngOnInit(): void {
    if (this.data?.isEditMode && this.data?.customer) {
      this.isEditMode = true;
      this.editCustomerForm.patchValue({
        profile_image: this.data.customer.profile_image,
        name: this.data.customer.name,
        email: this.data.customer.email,
        gender: this.data.customer.gender,
        dob: this.data.customer.dob,
        doa: this.data.customer.doa,
      });

      if (this.data.customer.profile_image) {
        this.photoUrl = this.data.customer.profile_image;
      }

      // Disable non-editable fields
      // this.editCustomerForm.get('name')?.disable();
      this.editCustomerForm.get('country')?.disable();
      this.editCustomerForm.get('mobile')?.disable();
      // this.editCustomerForm.get('profile_image')?.disable();
    }
  }

  onPhotoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
      const maxSizeMB = 2;

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        this.snackBar.openFromComponent(CustomSnackbarComponent, {
          data: {
            message: 'Invalid file type. Only jpg, jpeg, png, gif allowed.',
            type: 'error',
            icon: 'error',
          },
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        this.snackBar.openFromComponent(CustomSnackbarComponent, {
          data: {
            message: 'File size exceeds 2MB limit.',
            type: 'error',
            icon: 'error',
          },
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        return;
      }

      this.selectedFile = file;
      this.editCustomerForm.get('profile_image')?.setValue(file);

      const reader = new FileReader();
      reader.onload = () => (this.photoUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.selectedFile = null;
    this.photoUrl = null;
    this.editCustomerForm.get('profile_image')?.setValue(null);
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  //  Submit handler
  onSubmit() {
    this.formSubmitted = true;

    if (this.editCustomerForm.invalid) {
      this.editCustomerForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      const payload = {
        email: this.editCustomerForm.get('email')?.value,
        gender: this.editCustomerForm.get('gender')?.value,
        dob: this.formatDate(this.editCustomerForm.get('dob')?.value),
        doa: this.formatDate(this.editCustomerForm.get('doa')?.value),
      };


      this.customersService
        .updateCustomer(this.data.customer.id, payload)
        .subscribe({
          next: (res: any) => {
            this.dialogRef.close(payload);
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              data: {
                message: res.message || 'Customer updated successfully.',
                type: 'success',
                icon: 'check_circle',
              },
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['no-default-snackbar'],
            });
          },
          error: (err) => {
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              data: {
                message: err?.error?.message || 'Update failed.',
                type: 'error',
                icon: 'error',
              },
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['no-default-snackbar'],
            });
          },
        });
    } else {
      // ✅ Always send all fields — even if empty
      const formData = new FormData();
      formData.append('name', this.editCustomerForm.get('name')?.value || '');
      formData.append(
        'dob',
        this.formatDate(this.editCustomerForm.get('dob')?.value)
      );
      formData.append(
        'doa',
        this.formatDate(this.editCustomerForm.get('doa')?.value)
      );

      formData.append(
        'mobile',
        this.editCustomerForm.get('mobile')?.value || ''
      );
      formData.append('email', this.editCustomerForm.get('email')?.value || '');
      formData.append(
        'gender',
        this.editCustomerForm.get('gender')?.value || ''
      );

      const country = this.editCustomerForm.get('country')?.value;
      const countryValue = country?.id || '';
      // console.log('country-id==>', countryValue);
      formData.append('country', countryValue);

      const file = this.editCustomerForm.get('profile_image')?.value;
      if (file) {
        formData.append('profile_image', file);
      } else {
        // ✅ Even if no file selected, include empty value
        formData.append('profile_image', '');
      }

      // ✅ Send all fields (even optional) to API
      this.customersService.addCustomer(formData).subscribe({
        next: (res: any) => {
          // console.log('add====>', res);
          this.dialogRef.close(res.data);
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            data: {
              message: res.message || 'Customer created successfully.',
              type: 'success',
              icon: 'check_circle',
            },
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['no-default-snackbar'],
          });
        },
        error: (err) => {
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            data: {
              message: err?.error?.message || 'Add failed.',
              type: 'error',
              icon: 'error',
            },
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['no-default-snackbar'],
          });
        },
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  get f() {
    return this.editCustomerForm.controls;
  }
}
