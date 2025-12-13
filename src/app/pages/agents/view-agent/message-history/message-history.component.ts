import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Customer {
  name: string;
  messages: number;
  showMessages?: boolean; // Accordion state
  items?: string[]; // dropdown list content
}

@Component({
  selector: 'app-message-history',
  imports: [CommonModule],
  templateUrl: './message-history.component.html',
  styleUrls: ['./message-history.component.css'],
})
export class MessageHistoryComponent {
  messageGroups = [
    {
      dateLabel: 'Today',
      customers: [
        { name: 'Customer 1', messages: 12 , items: ['', '', '']},
        { name: 'Customer 2', messages: 12, items: ['', '', ''] },
        { name: 'Customer 3', messages: 12, items: ['', '', ''] },
        { name: 'Customer 4', messages: 12, items: ['', '', ''] },
      ] as Customer[],
    },
    {
      dateLabel: 'Yesterday',
      customers: [
        { name: 'Customer 5', messages: 12,  items: ['', '', '']  },
        { name: 'Customer 6', messages: 12,  items: ['', '', '']  },
      ] as Customer[],
    },
  ];

  toggleFilterDropdown(customer: Customer) {
    customer.showMessages = !customer.showMessages;
  }
}
