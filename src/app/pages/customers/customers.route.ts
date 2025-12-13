import { Routes } from "@angular/router";
import { CustomersListComponent } from "./customers-list/customers-list.component";
import { ViewCustomerComponent } from "./view-customer/view-customer.component";

export const CustomersRoute: Routes = [
    { path: 'customers', component: CustomersListComponent },
    { path: 'view-customer/:id', component: ViewCustomerComponent } // or view-agents/:id
];