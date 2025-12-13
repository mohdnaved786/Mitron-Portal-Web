import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AgentsService } from '../../../../core/services/agents.service';
import { AlertDialogComponent } from '../../../../shared/components/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-add-edit-teams',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatSlideToggleModule,
  ],
  templateUrl: './add-edit-teams.component.html',
  styleUrl: './add-edit-teams.component.css',
})
export class AddEditTeamsComponent {
  teamForm: FormGroup;
  isOpen = false;
  supervisors = ['John Doe', 'Jane Smith', 'Robert Brown'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditTeamsComponent>,
    private agentService: AgentsService, // ✅ reuse existing service
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.teamForm = this.fb.group({
      teamName: [''],
      supervisor: [''],
      status: [true],
    });
  }

  ngOnInit() {
    if (this.data) {
      this.teamForm.patchValue({
        teamName: this.data.teamName,
        supervisor: this.data.supervisor,
        status: this.data.status === 'Active' || this.data.status === true,
      });
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectSupervisor(option: string) {
    this.teamForm.get('supervisor')?.setValue(option);
    this.isOpen = false;
  }

  onSubmit() {
    if (this.teamForm.valid) {
      const payload = this.teamForm.value;

      if (this.data?.id) {
        this.agentService.updateAgent(this.data.id, payload).subscribe({
          next: (res: any) => {
            this.dialog.open(AlertDialogComponent, {
              data: {
                type: 'success',
                title: 'Updated!',
                message: 'Team updated successfully.',
              },
            });
            this.dialogRef.close(payload);
          },
          error: () => {
            this.dialog.open(AlertDialogComponent, {
              data: {
                type: 'error',
                title: 'Error!',
                message: 'Failed to update team. Please try again.',
              },
            });
          },
        });
      } else {
        this.agentService.addAgent(payload).subscribe({
          next: (res: any) => {
            this.dialog.open(AlertDialogComponent, {
              data: {
                type: 'success',
                title: 'Success!',
                message: 'Team added successfully.',
              },
            });
            this.dialogRef.close(payload);
          },
          error: () => {
            this.dialog.open(AlertDialogComponent, {
              data: {
                type: 'error',
                title: 'Error!',
                message: 'Failed to add team. Please try again.',
              },
            });
          },
        });
      }
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
