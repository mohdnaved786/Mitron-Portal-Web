import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Agent {
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
}
@Component({
  selector: 'app-customer-view-agent',
  imports: [CommonModule],
  templateUrl: './customer-view-agent.component.html',
  styleUrl: './customer-view-agent.component.css'
})
export class CustomerViewAgentComponent {
agents: Agent[] = [
    {
      name: 'Agent 1',
      phone: '9869285692',
      email: 'rehan@test.com',
      avatarUrl: 'https://picsum.photos/400?random=1'
    },
    {
      name: 'Agent 2',
      phone: '9876543210',
      email: 'john@test.com',
      avatarUrl: 'https://picsum.photos/400?random=2'
    },
    {
      name: 'Agent 3',
      phone: '9123456780',
      email: 'alice@test.com',
      avatarUrl: 'https://picsum.photos/400?random=3'
    }
  ];

  removeAgent(index: number) {
    this.agents.splice(index, 1);
  }
}
