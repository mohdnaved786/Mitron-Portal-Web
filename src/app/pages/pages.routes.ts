import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MessagesComponent } from './messages/messages.component';
import { WorkflowsComponent } from './workflows/workflows.component';
import { AgentsComponent } from './agents/agents.component';
import { CampaignComponent } from './campaign/campaign.component';
import { SocialComponent } from './social/social.component';
import { UsersComponent } from './users/users.component';
import { CustomersComponent } from './customers/customers.component';
import { ReportsComponent } from './reports/reports.component';
import { AutoPilotComponent } from './auto-pilot/auto-pilot.component';

export const PAGES_ROUTES: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'workflows', component: WorkflowsComponent },
  {
    path: '',
    component: AgentsComponent,
    loadChildren: () => import('./agents/agents.route').then(m => m.AgentsRoute)
  },
  {
    path: '',
    component: CustomersComponent,
    loadChildren: () => import('./customers/customers.route').then(m => m.CustomersRoute)
  },
  { path: 'auto-pilot', component: AutoPilotComponent },
  { path: 'campaign', component: CampaignComponent },
  { path: 'social', component: SocialComponent },
  { path: 'reports', component: ReportsComponent },
  {
    path: 'users',
    component: UsersComponent,
    loadChildren: () => import('./users/users.route').then((m) => m.UsersRoute),
  },
];
