import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Conversation } from '../model/conversation.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  conversations: Conversation[] = [];
  messages: any[] = [];
  selectedConversation: Conversation | null = null;
  newMessage: string = '';
  otherUserId: string = '';
  currentUserId: string = '';
  errorMessage: string = '';
  isSidebarOpen: boolean = false;
  currentUser: string = '';
  _currentUser: string = '';
  private userSubscription: Subscription | null = null;

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit() {
    this.userSubscription = this.authService.getCurrentUser().subscribe(username => {
      this.currentUser = username || 'User';
      if(this.currentUser!=null && this.currentUser!='') {
          localStorage.setItem('username', username);
      }
    });

    const token = this.authService.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserId = payload['nameid'];
    }

  const storedUsername = localStorage.getItem('username');
  if (storedUsername) {
    this._currentUser = storedUsername;
  }


    this.chatService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations.map((conv: any) => ({
          ...conv,
          displayName: conv.participantUsernames.find((username: string) =>
        username !== this._currentUser
          ) || this._currentUser
        }));
      },
      error: () => this.errorMessage = 'Failed to load conversations'
    });

    this.chatService.getMessageUpdates().subscribe(message => {
      if (this.selectedConversation && message.conversationId === this.selectedConversation.id) {
        this.messages.push(message);
      }
    });
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.chatService.joinConversation(conversation.id);
    this.chatService.getMessages(conversation.id).subscribe({
      next: (messages) => this.messages = messages,
      error: () => this.errorMessage = 'Failed to load messages'
    });
    this.isSidebarOpen = false; // Close sidebar on mobile
  }

  sendMessage() {
    if (this.newMessage && this.selectedConversation) {
      this.chatService.sendMessage(this.selectedConversation.id, this.newMessage).subscribe({
        next: () => this.newMessage = '',
        error: () => this.errorMessage = 'Failed to send message'
      });
    }
  }

  createConversation() {
    if (this.otherUserId) {
      this.chatService.createConversation(this.otherUserId).subscribe({
        next: (conversation: Conversation) => {
          this.conversations.push({
            ...conversation,
            displayName: 'New User'
          });
          this.otherUserId = '';
          this.errorMessage = '';
          this.chatService.getConversations().subscribe({
            next: (conversations) => {
              this.conversations = conversations.map((conv: any) => ({
                ...conv,
                displayName: conv.participantUsernames.find((username: string) => 
                  username !== this._currentUser
                ) || this._currentUser
              }));
            },
            error: () => this.errorMessage = 'Failed to refresh conversations'
          });
        },
        error: () => this.errorMessage = 'Failed to create conversation. Ensure User ID is valid.'
      });
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  isMobile(): boolean {
    return window.innerWidth < 640; // Tailwind's 'sm' breakpoint
  }
}