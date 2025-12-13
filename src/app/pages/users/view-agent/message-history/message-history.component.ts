import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-message-history',
  imports: [CommonModule],
  templateUrl: './message-history.component.html',
  styleUrl: './message-history.component.css'
})
export class MessageHistoryComponent {
  messageGroups = [
    {
      dateLabel: 'Today',
      customers: [
        { name: 'Customer 1', messages: 12 },
        { name: 'Customer 2', messages: 12 },
        { name: 'Customer 3', messages: 12 },
        { name: 'Customer 4', messages: 12 },
        { name: 'Customer 5', messages: 12 },
      ],
    },
    {
      dateLabel: 'Yesterday',
      customers: [
        { name: 'Customer 1', messages: 12 },
        { name: 'Customer 2', messages: 12 },
      ],
    },
  ];
}
