import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

export interface Customer {
  name: string;
  country:string;
  email: string;
  mobile: string;
  last_contacted: string;
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
    { name: 'Customer 1', country:'India', email: 'agent1@gmail.com', mobile: '+91 9916964002', last_contacted: "12 Nov 2025   09:09 PM" },
    { name: 'Customer 2', country:'India', email: 'agent2@gmail.com', mobile: '+91 9916964002', last_contacted: "12 Nov 2025   09:09 PM" },
    { name: 'Customer 3', country:'India', email: 'agent3@gmail.com', mobile: '+91 9916964002', last_contacted: "12 Nov 2025   09:09 PM" },
    { name: 'Customer 4', country:'India', email: 'agent4@gmail.com', mobile: '+91 9916964002', last_contacted: "12 Nov 2025   09:09 PM" },
    { name: 'Customer 5', country:'India', email: 'agent5@gmail.com', mobile: '+91 9916964002', last_contacted: "12 Nov 2025   09:09 PM" }
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
