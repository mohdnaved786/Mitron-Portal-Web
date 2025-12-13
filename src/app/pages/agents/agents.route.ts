import { Routes } from '@angular/router';
import { ViewAgentComponent } from './view-agent/view-agent.component';
import { AgentsListComponent } from './agents-list/agents-list.component';

export const AgentsRoute: Routes = [
    { path: 'agents', component: AgentsListComponent },
    { path: 'view-agent/:id', component: ViewAgentComponent } // or view-agents/:id
];

