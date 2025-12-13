import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  ChatMessage,
  MessagesService,
} from '../../../core/services/messages.service';
import { AssignAgentsComponent } from '../assign-agents/assign-agents.component';
import { QuickReplyComponent } from '../quick-reply/quick-reply.component';

interface FilePreview {
  file: File;
  url: string;
  isImage: boolean;
}

@Component({
  selector: 'app-view-reply',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-reply.component.html',
  styleUrls: ['./view-reply.component.css'],
})
export class ViewReplyComponent implements OnInit {
  searchTerm: string = '';
  newMessage: string = '';
  attachedFiles: File[] = [];
  filePreviews: FilePreview[] = [];
  name!: string;
  number!: string;
  avatar!: string;
  groupedMessages: { dateLabel: string; messages: ChatMessage[] }[] = [];
  messages: ChatMessage[] = [];
  loading = false;
  error: string | null = null;
  selectedMessage: ChatMessage | null = null;
  sending: boolean = false;

  waNumber = '';

  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;
  showScrollToBottom = false;

  constructor(
    public dialogRef: MatDialogRef<ViewReplyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgSvc: MessagesService,
    public dialog: MatDialog
  ) {
    this.name = data.name;
    this.number = data.number;
    this.avatar = data.avatar;
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
        this.scrollAfterMessage();
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

  /** Trigger hidden file input */
  triggerFileInput() {
    const fileInput = document.querySelector<HTMLInputElement>('#fileInput');
    fileInput?.click();
  }

  /** Handle file selection */
  handleFileSelection(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.attachedFiles.push(...files);

    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      if (isImage) {
        reader.onload = () => {
          this.filePreviews.push({
            file,
            url: reader.result as string,
            isImage,
          });
        };
        reader.readAsDataURL(file);
      } else {
        this.filePreviews.push({ file, url: '', isImage });
      }
    });

    input.value = '';
  }

  /** Remove selected file */
  removeFile(index: number) {
    this.attachedFiles.splice(index, 1);
    this.filePreviews.splice(index, 1);
  }

  /** Send message */
  sendMessage() {
    if (!this.newMessage.trim() && this.attachedFiles.length === 0) return;

    const replyingToId = this.selectedMessage?.message_id || 0;

    // Optimistic UI update
    const newMsg: ChatMessage = {
      sender: 'user',
      text: this.newMessage || '[Attachment]',
      time: new Date(),
      message_id: replyingToId,
    };

    this.messages.push(newMsg);
    this.groupedMessages = this.groupMessagesByDate(this.messages);
    this.scrollAfterMessage();

    // Prepare form data
    const formData = new FormData();
    formData.append('message_id', replyingToId.toString());
    formData.append('replyText', this.newMessage);
    this.attachedFiles.forEach((file) => formData.append('files[]', file));

    this.sending = true;

    this.msgSvc.replyMessageWithFiles(formData).subscribe({
      next: (res) => {
        this.sending = false;
        if (res.success) {
          this.loadMessages(this.waNumber);
          this.newMessage = '';
          this.attachedFiles = [];
          this.filePreviews = [];
        } else {
          this.error = 'Failed to send message: ' + res.message;
        }
      },
      error: (err) => {
        this.sending = false;
        console.error('Error sending message:', err);
        this.error = 'Failed to send message';
      },
    });
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

  // Scroll detection
  onScroll() {
    if (this.chatContainer) {
      const container = this.chatContainer.nativeElement;
      this.showScrollToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight >
        10;
    }
  }

  // Scroll to bottom
  scrollToBottom() {
    if (this.chatContainer) {
      const container = this.chatContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
      this.showScrollToBottom = false;
    }
  }

  // Call after messages load or new message send
  scrollAfterMessage() {
    setTimeout(() => this.scrollToBottom(), 100);
  }

  openAssignAgents() {
    const dialogRef = this.dialog.open(AssignAgentsComponent, {
      width: '400px',
      height: '100vh', // optional: full height
      panelClass: 'left-align-dialog',
      hasBackdrop: true, // keep backdrop if needed
    });

    dialogRef.afterOpened().subscribe(() => {
      const overlayPane = document.querySelector(
        '.cdk-overlay-pane.left-align-dialog'
      ) as HTMLElement;
      const wrapper = overlayPane?.closest(
        '.cdk-global-overlay-wrapper'
      ) as HTMLElement;

      if (wrapper && overlayPane) {
        // Move wrapper alignment
        wrapper.style.justifyContent = 'flex-start';
        wrapper.style.alignItems = 'flex-start'; // top aligned

        // Make the dialog flush against the left edge
        overlayPane.style.marginLeft = '0';
        overlayPane.style.right = '0';
        overlayPane.style.position = 'fixed'; // make it stick to the left
        overlayPane.style.top = '0';
        overlayPane.style.transform = 'none'; // remove center transform
      }
    });
  }

  openQuickReply() {
    const dialogRef = this.dialog.open(QuickReplyComponent, {
      width: '95%',
      height: '95%',
      data: {
        message_id: this.selectedMessage?.message_id || 0
      }
    })
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.loadMessages(this.waNumber);
      }
    })
  }





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




}
