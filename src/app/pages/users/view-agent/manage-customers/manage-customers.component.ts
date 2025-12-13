import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

export interface Customer {
  name: string;
  email: string;
  mobile: string;
  active: boolean;
}
@Component({
  selector: 'app-manage-customers',
  imports: [CommonModule],
  templateUrl: './manage-customers.component.html',
  styleUrl: './manage-customers.component.css'
})
export class ManageCustomersComponent {
  showFilters = false;
  selectedSupervisor = '';
  selectedStatus = '';
  supervisors: string[] = ['John', 'Mary', 'Alex']; // Example list
  customers: Customer[] = [
    { name: 'Customer 1', email: 'agent1@gmail.com', mobile: '+91 9916964002', active: true },
    { name: 'Customer 2', email: 'agent2@gmail.com', mobile: '+91 9916964002', active: false },
    { name: 'Customer 3', email: 'agent3@gmail.com', mobile: '+91 9916964002', active: true },
    { name: 'Customer 4', email: 'agent4@gmail.com', mobile: '+91 9916964002', active: true },
    { name: 'Customer 5', email: 'agent5@gmail.com', mobile: '+91 9916964002', active: false }
  ];

  toggleFilterDropdown() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    // this.filterItems(['name', 'last_name', 'role', 'email']); // your existing method
    // // You can extend this to also filter by supervisor/status:
    // this.items = this.allItems.filter(item => {
    //   const supervisorMatch = this.selectedSupervisor ? item.parentid === this.selectedSupervisor : true;
    //   const statusMatch = this.selectedStatus ? item.isOnline === this.selectedStatus : true;
    //   return supervisorMatch && statusMatch;
    // });
  }
}
