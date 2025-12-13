import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-snackbar',
  imports: [CommonModule, MatIconModule],
  templateUrl: './custom-snackbar.component.html',
  styleUrl: './custom-snackbar.component.css'
})
export class CustomSnackbarComponent {
 constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent>
  ) {}

  close() {
    this.snackBarRef.dismiss();
  }
}
