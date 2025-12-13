import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { CustomerService } from '../../core/services/customers.service';

@Component({
  selector: 'app-workflows',
  imports: [CommonModule, FormsModule],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.css'
})
export class WorkflowsComponent {
}

