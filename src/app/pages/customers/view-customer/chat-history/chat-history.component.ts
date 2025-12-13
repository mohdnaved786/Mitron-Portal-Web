import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Message {
  sender: 'customer' | 'user';
  text?: string;
  time: string;
  imageUrl?: string;
}

interface MessageDay {
  dateLabel: string; // e.g., Today, Yesterday
  messages: Message[];
}

interface Customer {
  name: string;
  messagesCount: number;
  showMessages: boolean;
  items: MessageDay[]; // messages grouped by day
}

interface MessageGroup {
  dateLabel: string;
  customers: Customer[];
}

@Component({
  selector: 'app-chat-history',
  imports: [CommonModule],
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.css'],
})
export class ChatHistoryComponent {
  messageGroups: MessageGroup[] = [
    {
      dateLabel: 'Today',
      customers: [
        {
          name: 'Customer 1',
          messagesCount: 5,
          showMessages: false,
          items: [
            {
              dateLabel: 'Today',
              messages: [
                { sender: 'customer', text: 'Hello!', time: '10:00 AM' },
                { sender: 'user', text: 'Hi! How can I help?', time: '10:02 AM' },
              ],
            },
            {
              dateLabel: 'Yesterday',
              messages: [
                {
                  sender: 'customer',
                  text: 'Here is the screenshot.',
                  imageUrl: 'https://picsum.photos/200/150',
                  time: '10:05 AM',
                },
                { sender: 'user', text: 'Got it!', time: '10:07 AM' },
              ],
            },
          ],
        },
        {
          name: 'Customer 2',
          messagesCount: 4,
          showMessages: false,
          items: [
            {
              dateLabel: 'Today',
              messages: [
                { sender: 'customer', text: 'Hi there', time: '11:00 AM' },
                { sender: 'user', text: 'Hello!', time: '11:05 AM' },
              ],
            },

            {
              dateLabel: 'Yesterday',
              messages: [
                { sender: 'customer', text: 'Hi there', time: '11:00 AM' },
                { sender: 'user', text: 'Hello!', time: '11:05 AM' },
              ],
            },
          ],
        },

        {
          name: 'Customer 3',
          messagesCount: 4,
          showMessages: false,
          items: [
            {
              dateLabel: 'Today',
              messages: [
                { sender: 'customer', text: 'Hi there', time: '11:00 AM' },
                { sender: 'user', text: 'Hello!', time: '11:05 AM' },
              ],
            },

            {
              dateLabel: 'Yesterday',
              messages: [
                { sender: 'customer', text: 'Hi there', time: '11:00 AM' },
                { sender: 'user', text: 'Hello!', time: '11:05 AM' },
              ],
            },

          ],
        },

        {
          name: 'Customer 4',
          messagesCount: 4,
          showMessages: false,
          items: [
            {
              dateLabel: 'Today',
              messages: [
                { sender: 'customer', text: 'Hi there', time: '11:00 AM' },
                { sender: 'user', text: 'Hello!', time: '11:05 AM' },
              ],
            },

            {
              dateLabel: 'Yesterday',
              messages: [
                { sender: 'customer', text: 'Hi there', time: '11:00 AM' },
                { sender: 'user', text: 'Hello!', time: '11:05 AM' },
              ],
            }
            ,
          ],
        },
      ],
    },
  ];

  toggleFilterDropdown(customer: Customer) {
    customer.showMessages = !customer.showMessages;
  }
}
