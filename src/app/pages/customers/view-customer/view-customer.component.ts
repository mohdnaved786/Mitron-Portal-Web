import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgentsService } from '../../../core/services/agents.service';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChatHistoryComponent } from "./chat-history/chat-history.component";
import { CustomerService } from '../../../core/services/customers.service';
import { CustomerViewAgentComponent } from "./customer-view-agent/customer-view-agent.component";
@Component({
  selector: 'app-view-customer',
  imports: [CommonModule,
    MatSlideToggleModule,
    RouterLink, ChatHistoryComponent, CustomerViewAgentComponent],
  templateUrl: './view-customer.component.html',
  styleUrl: './view-customer.component.css'
})
export class ViewCustomerComponent {
  customer: any;
  isActive: boolean = false;
  constructor(
    private route: ActivatedRoute, private customerService:CustomerService
  ) { }

  tabs = [
    { name: 'Agent', component: 'agent' },
    { name: 'Message History', component: 'chat' },
    { name: 'Performance', component: 'performance' },
  ];

    onToggleChange(event: any) {
    this.isActive = event.checked;
    console.log('Agent active state:', this.isActive);
  }

  activeTab = this.tabs[0];

  setActiveTab(tab: any) {
    this.activeTab = tab;
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadCustomerDetails(id);
  }


  loadCustomerDetails(id: number) {
    this.customerService.getCustomerById(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          // console.log("=========>", res.data)
          this.customer = res.data;
          // Handle online status
          // this.isActive = res.data.isOnline === 'yes' || res.data.isOnline === true;
          // console.log('Customer data:', this.customer);
        }
      },
      error: (err) => console.error('Error fetching agent details', err),
    });
  }

// 🔹 Utility
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

}
