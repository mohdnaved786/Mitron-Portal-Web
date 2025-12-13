import { Routes } from '@angular/router';
import { ViewAgentComponent } from './view-agent/view-agent.component';
import { UsersListComponent } from './users-list/users-list.component';

export const UsersRoute: Routes = [
  { path: '', component: UsersListComponent },
  { path: 'view-agent/:id', component: ViewAgentComponent },
];
