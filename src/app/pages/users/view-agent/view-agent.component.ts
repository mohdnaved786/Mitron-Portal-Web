import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessagesComponent } from '../../messages/messages.component';
import { ManageCustomersComponent } from './manage-customers/manage-customers.component';
import { MessageHistoryComponent } from './message-history/message-history.component';
import { PerformanceComponent } from './performance/performance.component';
import { AgentsService } from '../../../core/services/agents.service';

@Component({
  selector: 'app-view-agent',
  imports: [
    CommonModule,
    MatSlideToggleModule,
    RouterLink,
    ManageCustomersComponent,
    MessageHistoryComponent,
    PerformanceComponent,
  ],
  templateUrl: './view-agent.component.html',
  styleUrl: './view-agent.component.css',
})
export class ViewAgentComponent {
  agent: any;
  isActive: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private agentsService: AgentsService
  ) { }

  tabs = [
    { name: 'Performance', component: 'performance' },
    { name: 'Manage Customers', component: 'customers' },
    { name: 'Message History', component: 'messages' },
  ];

  activeTab = this.tabs[0];

  setActiveTab(tab: any) {
    this.activeTab = tab;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadAgentDetails(id);
  }

  loadAgentDetails(id: any) {
    this.agentsService.getAgentById(id).subscribe({
      next: (res: any) => {
        if (res.success === true) {
          this.agent = res.user;
          console.log(this.agent)
          this.isActive =
            res.user.status === 1 ? true : false;
        }
      },
      error: (err) => console.error('Error fetching agent details', err),
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    const initials: string[] = [];
    for (let word of words) {
      const firstChar = word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) initials.push(firstChar);
      if (initials.length === 2) break;
    }
    return initials.length > 0 ? initials.join('') : '?';
  }

  getInitials2(agent: any): string {
    const first = agent?.name?.charAt(0).toUpperCase() ?? '';
    const last = agent?.last_name?.charAt(0).toUpperCase() ?? '';
    return first + last || '?';
  }
  onToggleChange(event: any) {
    this.isActive = event.checked;
    console.log('Agent active state:', this.isActive);
  }
}
