import { Component, Inject } from '@angular/core';
import { ViewReplyComponent } from '../view-reply/view-reply.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ChatMessage, MessagesService } from '../../../core/services/messages.service';
import { CustomSnackbarComponent } from '../../../shared/components/custom-snackbar/custom-snackbar.component';
import { AlertDialogComponent } from '../../../shared/components/alert-dialog/alert-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-quick-reply',
  imports: [CommonModule],
  templateUrl: './quick-reply.component.html',
  styleUrl: './quick-reply.component.css'
})
export class QuickReplyComponent {

  frequentlyUsedMessages = [
    { title: 'greeting', text: 'Hello! Thank you for connecting with Circle of Crust. How may I help you today?' },
    { title: 'menu', text: 'Please check the attached menu and let us know what you would like to order today.' },
    { title: 'address', text: 'Kindly share the address where the order is to be delivered.' },
    { title: 'order_details', text: 'Following are your order details.' },
    { title: 'order_details', text: 'Following are your order details.' },
    { title: 'order_details', text: 'Following are your order details.' },
    { title: 'order_details', text: 'Following are your order details.' },
    { title: 'order_details', text: 'Following are your order details.' },
    { title: 'no_jain_pizzas', text: 'No, we do not serve Jain Pizzas.' }
  ];

  allMessages = [
    { title: 'greeting', text: 'Hello! Thank you for connecting with Circle of Crust. How may I help you today?' },
    { title: 'menu', text: 'Please check the attached menu and let us know what you would like to order today.' },
    { title: 'address', text: 'Kindly share the address where the order is to be delivered.' },
    { title: 'order_details', text: 'Following are your order details.' },
    { title: 'no_jain_pizzas', text: 'No, we do not serve Jain Pizzas.' },
    { title: 'new_menu', text: 'We have recently launched a new menu in collaboration with Pind Bathinda, a North Indian cuisine brand based out of Dubai. Sharing the menu.' },
    { title: 'prep_time', text: 'Order preparation takes 15 minutes. Your order will be delivered within 45 minutes.' },
    { title: 'nearest_outlet', text: 'Your order will be delivered from the nearest Circle of Crust outlet.' },
    { title: 'yes_absolute', text: 'Yes, Absolutely.' }
  ];

  messages: ChatMessage[] = [];

  constructor(public dialogRef: MatDialogRef<QuickReplyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private messageService: MessagesService, private dialog: MatDialog, private snackBar: MatSnackBar,) {

  }

  /** Close dialog */
  close() {
    this.dialogRef.close();
  }


  sendMessage(message: any) {
    const replyingToId = this.data?.message_id || 0;


    console.log("----------->", message, this.data?.message_id)

    // Optimistic UI update
    const newMsg: ChatMessage = {
      sender: 'user',
      text: message || '[Attachment]',
      time: new Date(),
      message_id: replyingToId,
    };

    this.messages.push(newMsg);
    // this.groupedMessages = this.groupMessagesByDate(this.messages);
    // this.scrollAfterMessage();

    // Prepare form data
    const formData = new FormData();
    formData.append('message_id', replyingToId.toString());
    formData.append('replyText', message);
    // this.attachedFiles.forEach((file) => formData.append('files[]', file));

    // this.sending = true;

    this.messageService.replyMessageWithFiles(formData).subscribe({
      next: (res) => {
        if (res?.success === true) {
          this.dialogRef.close(true)
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            data: {
              message: res?.message,
              type: 'success',
              icon: 'check_circle',
            },
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['no-default-snackbar'],
          });
        } else {
          this.dialog.open(AlertDialogComponent, {
            data: {
              type: 'warning',
              title: 'Warning!',
              message: res.message || 'Invalid email or password.',
            },
          });

        }
        // this.sending = false;
        // if (res.success) {
        //   this.loadMessages(this.waNumber);
        //   this.newMessage = '';
        //   this.attachedFiles = [];
        //   this.filePreviews = [];
        // } else {
        //   this.error = 'Failed to send message: ' + res.message;
        // }
      },
      error: (err) => {
        // this.sending = false;
        // console.error('Error sending message:', err);
        // this.error = 'Failed to send message';
      },
    });

  }

}
