import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {
  conversations: any[] = [];
  messages: any[] = [];
  selectedConversation: any = null;
  newMessage: string = '';
  otherUserId: string = '';
  currentUserId: string = '';

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit() {
    // Get current user's ID from JWT token
    const token = this.authService.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserId = payload['nameid']; // Adjust based on your JWT claim structure
    }

    this.chatService.getConversations().subscribe(conversations => {
      this.conversations = conversations.map((conv: { participantUsernames: any[]; participantIds: string[]; }) => ({
        ...conv,
        displayName: conv.participantUsernames.find((username: string, index: number) => 
          conv.participantIds[index] !== this.currentUserId
        ) || 'Unknown'
      }));
    });

    this.chatService.getMessageUpdates().subscribe(message => {
      if (this.selectedConversation && message.conversationId === this.selectedConversation.id) {
        this.messages.push(message);
      }
    });
  }

  selectConversation(conversation: any) {
    this.selectedConversation = conversation;
    this.chatService.joinConversation(conversation.id);
    this.chatService.getMessages(conversation.id).subscribe(messages => {
      this.messages = messages;
    });
  }

  sendMessage() {
    if (this.newMessage && this.selectedConversation) {
      this.chatService.sendMessage(this.selectedConversation.id, this.newMessage).subscribe(() => {
        this.newMessage = '';
      });
    }
  }

  createConversation() {
    if (this.otherUserId) {
      this.chatService.createConversation(this.otherUserId).subscribe(conversation => {
        this.conversations.push({
          ...conversation,
          displayName: 'New User' // Temporary; will be updated on next fetch
        });
        this.otherUserId = '';
        // Refresh conversations to get usernames
        this.chatService.getConversations().subscribe(conversations => {
          this.conversations = conversations.map((conv: { participantUsernames: any[]; participantIds: string[]; }) => ({
            ...conv,
            displayName: conv.participantUsernames.find((username: string, index: number) => 
              conv.participantIds[index] !== this.currentUserId
            ) || 'Unknown'
          }));
        });
      });
    }
  }
}