import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AgentsService } from '../../../core/services/agents.service';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CustomSnackbarComponent } from '../../../shared/components/custom-snackbar/custom-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-add-edit-agents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSlideToggleModule],
  templateUrl: './add-edit-agents.component.html',
  styleUrls: ['./add-edit-agents.component.css'],
})
export class AddEditAgentsComponent implements OnInit {
  editAgentForm!: FormGroup;
  isOpen = false;
  supervisors: any[] = [
    { key: 1, value: 'Team A' },
    { key: 2, value: 'Team B' },
    { key: 3, value: 'Team C' },
  ];

  photoUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;
  teamName: any;
  IsActive: any;
  isEditMode: boolean = false;
  formSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private agentsService: AgentsService,
    private _userService: UsersService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddEditAgentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // Initialize form
    this.editAgentForm = this.fb.group({
      agentName: [{ value: '', disabled: true }], // readonly
      nickName: ['', Validators.required],
      teamName: ['', Validators.required],
      supervisorName: [''],
      isOnline: [''],
      profile_image: [null],
    });

    // If editing existing agent
    if (this.data) {
      console.log('Loading agent data:', this.data);

      const fullName = `${this.data.name || this.data.email || ''}`.trim();

      this.editAgentForm.patchValue({
        agentName: fullName,
        nickName: this.data.nickname || '',
        teamName: this.data.team ? String(this.data.team) : '',
        supervisorName: this.data.supervisor || '',
        isOnline: this.data.status === 1 ? true : false,
      });

      // Load profile image if available
      if (this.data.profile_image) {
        this.photoUrl = this.data.profile_image;
      }
    }
  }

  /**  Generate Initials from Agent Name */
  getInitials(): string {
    const agentName = this.editAgentForm.get('agentName')?.value?.trim() || '';
    if (!agentName) return 'NA';

    const nameParts = agentName
      .split(/[\s@._]+/) // split on spaces or email-like characters
      .filter((part: string) => part.length > 0);

    if (nameParts.length === 0) return 'NA';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    const initials =
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
    return initials.toUpperCase();
  }

  /**  Handle Photo Selection */
  // onPhotoSelect(event: any) {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   if (!file.type.startsWith('image/')) {
  //     alert('Please select an image file.');
  //     return;
  //   }

  //   if (file.size > 5 * 1024 * 1024) {
  //     alert('File size must be less than 5MB.');
  //     return;
  //   }

  //   this.selectedFile = file;
  //   const reader = new FileReader();
  //   reader.onload = () => (this.photoUrl = reader.result as string);
  //   reader.readAsDataURL(file);
  // }

  /** Remove Photo */
  // removePhoto() {
  //   this.photoUrl = this.data?.profile_image || null;
  //   this.selectedFile = null;

  //   const fileInput = document.getElementById(
  //     'photoUpload'
  //   ) as HTMLInputElement;
  //   if (fileInput) fileInput.value = '';
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
      this.editAgentForm.get('profile_image')?.setValue(file);

      const reader = new FileReader();
      reader.onload = () => (this.photoUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.selectedFile = null;
    this.photoUrl = null;
    this.editAgentForm.get('profile_image')?.setValue(null);
  }

  /**  Dropdown Toggle */
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  /**  Close Dropdown */
  closeDropdown() {
    this.isOpen = false;
  }

  /**  Select Team from Dropdown */
  selectTeam(option: string) {
    this.teamName = option;
    this.editAgentForm.patchValue({ teamName: option });
    this.isOpen = false;
  }

  /**  Submit Form */
  onSubmit() {
    this.formSubmitted = true;
    if (this.editAgentForm.invalid) {
      Object.keys(this.editAgentForm.controls).forEach((key) => {
        this.editAgentForm.get(key)?.markAllAsTouched();
      });
      return;
    }

    if (this.isSubmitting) return;

    const values = this.editAgentForm.getRawValue();
    const formData = new FormData();

    // Append updated fields
    formData.append('nickname', values.nickName || '');
    formData.append('team', values.teamName || '');
    formData.append('supervisor', values.supervisorName || '');
    // formData.append('isOnline', values.isOnline ? 'yes' : 'no');
    let status = this.editAgentForm.get('isOnline')?.value;
    status = status === true ? 1 : 0;
    formData.append('status', status);
    const file = this.editAgentForm.get('profile_image')?.value;
    if (file) {
      formData.append('profile_image', file);
    } else {
      formData.append('profile_image', '');
    }

    const agentId = this.data?.id;
    if (!agentId) {
      alert('Agent ID not found.');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      nickname: this.editAgentForm?.get('nickName')?.value,
      team: this.teamName,
      supervisor: this.editAgentForm?.get('supervisorName')?.value,
      // status: this.editAgentForm?.get('isOnline')?.value,
      status: this.IsActive ? 1 : 0,
    };

    console.log(payload);

    //  Call update API
    this._userService.updateUser(agentId, formData).subscribe({
      next: (res: any) => {
        if (res && res?.success === true) {
          this.isSubmitting = false;
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
        }
      },
      error: (err) => {
        console.error('Error updating agent:', err);
        this.isSubmitting = false;
        alert('Error updating agent. Please try again.');
      },
    });
  }

  getToogleValue(event: any) {
    console.log(event?.checked);
    this.IsActive = event?.checked;
  }

  /**  Close Dialog */
  closeDialog() {
    this.dialogRef.close();
  }
}
