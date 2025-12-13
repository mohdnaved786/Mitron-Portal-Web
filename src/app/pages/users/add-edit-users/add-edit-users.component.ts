import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AgentsService } from '../../../core/services/agents.service';
import { AlertDialogComponent } from '../../../shared/components/alert-dialog/alert-dialog.component';
import { CountrySelectorComponent } from '../../../shared/components/country-selector/country-selector.component';
import { UsersService } from '../../../core/services/users.service';
import { CommonValidators } from '../../../shared/validators/common-validators';
import { CustomSnackbarComponent } from '../../../shared/components/custom-snackbar/custom-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-edit-agents',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    FormsModule,
    MatSlideToggleModule,
    MatSelectModule,
  ],
  templateUrl: './add-edit-users.component.html',
  styleUrl: './add-edit-users.component.css',
})
export class AddEditUserComponent {
  unSubscribeSubject: any = new Subject();
  UserForm: FormGroup;
  photoUrl: string | ArrayBuffer | null = null;
  isChecked = false;
  isOpen = false;
  selectedSupervisor: string = '';
  formSubmitted: boolean = false;
  isEditMode: boolean = false;
  selectedFile: File | null = null;
  countries: Array<any> = [];
  supervisors = [
    'John Doe',
    'Jane Smith',
    'Robert Brown',
    'John Doe',
    'Jane Smith',
    'Robert Brown',
    'John Doe',
    'Jane Smith',
    'Robert Brown',
    'John Doe',
    'Jane Smith',
    'Robert Brown',
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditUserComponent>,
    private _userService: UsersService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {
    console.log('data-------------------->', data);
    this.UserForm = this.fb.group({
      userId: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      country: ['', Validators.required],
      mobile: ['', [Validators.required, CommonValidators.numericOnly]],
      role: ['agent', Validators.required],
      active: [true],
      photo: [null],
      // mobile: [''],
      // role: ['Agent'],
      // communicationName: [''],
      // supervisor: [''],
      // isChecked: [true],
      // photo: [null]
    });
  }

  ngOnInit(): void {
    this.getCountryList();
    if (this.data) {
      this.UserForm.patchValue({
        userId: this.data.userId,
        userName: this.data.userName,
        email: this.data.email,
        mobile: this.data.mobile,
        role: this.data.role,
        isChecked: this.data.status,
        country: this.data.country,
        active: this.data.status === 1 ? true : false,
        password: '#######',
        // leave password empty for security
      });
      this.UserForm.get('userId')?.disable();
      this.UserForm.get('password')?.disable();
    }
  }

  // removePhoto() {
  //   this.selectedFile = null;
  //   this.photoUrl = null;
  //   this.UserForm.get('photo')?.setValue(null);
  // }

  selectSupervisor(option: string) {
    this.UserForm.get('supervisor')?.setValue(option);
    this.isOpen = false;
  }

  getCountryList() {
    this._userService.getAllCountriesList().pipe(takeUntil(this.unSubscribeSubject)).subscribe({
      next: ((res) => {
        if (res?.success === true) {
          this.countries = res?.countries
        }
      }),
      error: ((err) => {

      })
    })
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onToggleChange(event: any) {
    const isChecked = event.checked;
    this.UserForm.get('isChecked')?.setValue(isChecked);
    // console.log('Toggle status:', isChecked ? 'Active' : 'Inactive');
  }

  // onPhotoUpload(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const reader = new FileReader();
  //     reader.onload = () => (this.photoUrl = reader.result);
  //     reader.readAsDataURL(input.files[0]);
  //   }
  // }

  // onPhotoSelect(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const file = input.files[0];

  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.photoUrl = reader.result;
  //     };
  //     reader.readAsDataURL(file);

  //     this.UserForm.get('photo')?.setValue(file);
  //   }
  // }

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
      this.UserForm.get('photo')?.setValue(file);

      const reader = new FileReader();
      reader.onload = () => (this.photoUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.selectedFile = null;
    this.photoUrl = null;
    this.UserForm.get('photo')?.setValue(null);
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.UserForm.valid) {
      if (this.data?._id) {
        const payload = {
          userName: this.UserForm.get('userName')?.value,
          email: this.UserForm.get('email')?.value,
          mobile: this.UserForm.get('mobile')?.value,
          country: this.UserForm.get('country')?.value,
          role: this.UserForm.get('role')?.value,
          status: this.UserForm.get('active')?.value === true ? 1 : 0,
          photo: "1764849839640-dummy-profile.png"
        }
        this._userService.updateUserById(this.data._id, payload).subscribe({
          next: (res: any) => {
            if (res.success === true) {
              this.dialogRef.close(true);
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
            } else {
              this.dialog.open(AlertDialogComponent, {
                data: {
                  type: 'warning',
                  title: 'Warning!',
                  message: res.message || 'Invalid email or password.',
                },
              });
            }
          },
          error: (err) => {
            console.error(err);
            this.dialog.open(AlertDialogComponent, {
              data: {
                type: 'error',
                title: 'Error!',
                message:
                  err?.error?.message ||
                  'Something went wrong. Please try again later.',
              },
            });
          },
        });
      } else {
        const formData = new FormData();
        formData.append('userId', this.UserForm.get('userId')?.value || '');
        formData.append('userName', this.UserForm.get('userName')?.value || '');
        formData.append('email', this.UserForm.get('email')?.value || '');
        formData.append('password', this.UserForm.get('password')?.value || '');
        formData.append('country', this.UserForm.get('country')?.value || '');
        formData.append('mobile', this.UserForm.get('mobile')?.value || '');
        formData.append('role', this.UserForm.get('role')?.value || '');
        formData.append('active', this.UserForm.get('active')?.value || '');
        const file = this.UserForm.get('photo')?.value;
        if (file) {
          formData.append('photo', file);
        } else {
          formData.append('photo', '');
        }
        this._userService.addNewUser(formData).subscribe({
          next: (res) => {
            console.log(res);
            if (res.success === true) {
              this.dialogRef.close(true);
              // const dialogRef = this.dialog.open(AlertDialogComponent, {
              //   data: {
              //     type: 'success',
              //     title: 'Success!',
              //     message: 'User created successfully.',
              //   },
              // });
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
            } else {
              this.dialog.open(AlertDialogComponent, {
                data: {
                  type: 'warning',
                  title: 'Warning!',
                  message: res.message || 'Invalid email or password.',
                },
              });
            }
          },
          error: (err) => {
            console.error(err);
            this.dialog.open(AlertDialogComponent, {
              data: {
                type: 'error',
                title: 'Error!',
                message:
                  err?.error?.errors?.email[0] ||
                  'Something went wrong. Please try again later.',
              },
            });
          },
        });
      }
    } else {
      this.UserForm.markAllAsTouched();
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        data: {
          message: 'Please fill all required fields.',
          type: 'error',
          icon: 'check_circle',
        },
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['no-default-snackbar'],
      });
    }
  }
  getInitials(agent: any): string {
    const name = agent?.name?.trim() || '';
    if (!name) return '?';

    const parts = name.split(' ');
    const first = parts[0]?.charAt(0).toUpperCase() || '';
    const last =
      parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '';

    return first + last || '?';
  }

  closeDialog() {
    this.dialogRef.close('');
  }
}
