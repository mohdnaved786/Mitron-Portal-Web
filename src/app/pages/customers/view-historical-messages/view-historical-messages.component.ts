import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ChatMessage,
  MessagesService,
} from '../../../core/services/messages.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewReplyComponent } from '../../messages/view-reply/view-reply.component';

@Component({
  selector: 'app-view-historical-messages',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-historical-messages.component.html',
  styleUrl: './view-historical-messages.component.css',
})
export class ViewHistoricalMessagesComponent implements OnInit {
  searchTerm: string = '';
  newMessage: string = '';
  name!: string;
  number!: string;
  country_code!: string;
  avatar!: string;
  groupedMessages: { dateLabel: string; messages: ChatMessage[] }[] = [];
  messages: ChatMessage[] = [];
  loading = false;
  error: string | null = null;
  selectedMessage: ChatMessage | null = null;

  waNumber = '';

  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  // Smoothly scroll down (but not fully to bottom)
  lastScrollTop = 0; // previous scroll position
  showScrollButton: 'up' | 'down' | null = null; // which button to show

  constructor(
    public dialogRef: MatDialogRef<ViewReplyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgSvc: MessagesService
  ) {
    this.name = data.name;
    this.number = data.number;
    (this.country_code = data.country_code), (this.avatar = data.avatar);
  }

  ngOnInit() {
    this.waNumber = this.number;
    this.loadMessages(this.waNumber);
  }

  /** Load chat messages for this number */
  loadMessages(number: string) {
    this.loading = true;
    this.error = null;

    this.msgSvc.getMessagesForNumber(number).subscribe({
      next: (msgs) => {
        // Convert time to Date
        this.messages = msgs.map((msg) => ({
          ...msg,
          time: new Date(msg.time),
        }));
        this.groupedMessages = this.groupMessagesByDate(this.messages);

        // auto select last message for reply
        this.selectedMessage = this.messages[this.messages.length - 1] || null;

        this.loading = false;

        // Scroll to bottom after messages load
        // this.scrollAfterMessage();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load messages';
        this.loading = false;
      },
    });
  }

  /** Group messages by date */
  private groupMessagesByDate(msgs: ChatMessage[]) {
    const groups: { [date: string]: ChatMessage[] } = {};
    for (const msg of msgs) {
      const dateKey = new Date(msg.time).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    }

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    return Object.keys(groups).map((dateKey) => {
      let dateLabel = '';
      if (dateKey === today) dateLabel = 'Today';
      else if (dateKey === yesterday) dateLabel = 'Yesterday';
      else
        dateLabel = new Date(dateKey).toLocaleDateString(undefined, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

      return { dateLabel, messages: groups[dateKey] };
    });
  }

  // Add this function to filter messages by searchTerm
  get filteredGroupedMessages() {
    if (!this.searchTerm) return this.groupedMessages;

    const term = this.searchTerm.toLowerCase();

    const filteredGroups = this.groupedMessages
      .map((group) => {
        const filteredMessages = group.messages.filter(
          (msg) =>
            (msg.text && msg.text.toLowerCase().includes(term)) ||
            (msg.sender && msg.sender.toLowerCase().includes(term))
        );

        return { ...group, messages: filteredMessages };
      })
      .filter((group) => group.messages.length > 0); // remove empty groups

    return filteredGroups;
  }

  /** Highlight search term in message text */
  highlightText(text: string): string {
    if (!this.searchTerm) return text;

    const term = this.searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // escape special chars
    const regex = new RegExp(`(${term})`, 'gi'); // case-insensitive match

    return text.replace(regex, `<span class="bg-yellow-200">$1</span>`);
  }

  /** Get initials for avatar */
  getInitials(name: string | undefined): string {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    const initials: string[] = [];
    for (const word of words) {
      const firstChar = word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) initials.push(firstChar);
      if (initials.length === 2) break;
    }
    return initials.join('') || '?';
  }

  /** Close dialog */
  close() {
    this.dialogRef.close();
  }

  onScroll() {
    if (!this.chatContainer) return;
    const container = this.chatContainer.nativeElement;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    const threshold = 5; // minimal scroll detection

    // Detect scroll direction
    if (scrollTop - this.lastScrollTop > threshold) {
      // Scrolling down
      if (scrollTop + clientHeight < scrollHeight - 5) {
        this.showScrollButton = 'down';
      } else {
        this.showScrollButton = null; // at bottom
      }
    } else if (this.lastScrollTop - scrollTop > threshold) {
      // Scrolling up
      if (scrollTop > 5) {
        this.showScrollButton = 'up';
      } else {
        this.showScrollButton = null; // at top
      }
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // prevent negative
  }

  // Smooth scroll functions
  scrollUp() {
    if (!this.chatContainer) return;
    const container = this.chatContainer.nativeElement;
    container.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollDown() {
    if (!this.chatContainer) return;
    const container = this.chatContainer.nativeElement;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }
}
