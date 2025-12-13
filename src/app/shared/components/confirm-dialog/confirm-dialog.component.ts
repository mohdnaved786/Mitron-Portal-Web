import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getInitials(agent: any): string {
    if (!agent?.name) return '';
    return agent.name
      .split(' ')
      .map((x: string) => x[0])
      .join('')
      .toUpperCase();
  }

  getInitialsCustomer(customer: any): string {
    if (!customer?.name) return '';
    return customer.name
      .split(' ')
      .map((x: string) => x[0])
      .join('')
      .toUpperCase();
  }


}
