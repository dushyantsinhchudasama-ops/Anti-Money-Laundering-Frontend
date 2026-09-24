import { Component, Input, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationResponse } from '../../core/models/notification.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() portalTitle: string = 'AML Compliance Portal';

  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  private elementRef = inject(ElementRef);

  isOpenPanel: boolean = false;
  notifications: NotificationResponse[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  pendingMarkAsReadIds = new Set<string>();

  get currentUser() {
    return this.authService.currentUser();
  }

  get unreadCount(): number {
    return this.notificationService.unreadCount();
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.notificationService.fetchUnreadCount().subscribe({
        error: () => { }
      });
      this.loadNotifications();
    }
  }

  toggleDropdown(): void {
    this.isOpenPanel = !this.isOpenPanel;
    if (this.isOpenPanel) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    if (this.notifications.length === 0) {
      this.isLoading = true;
    }
    this.errorMessage = null;

    this.notificationService.getNotifications(0, 20).subscribe({
      next: (res) => {
        this.notifications = Array.isArray(res) ? res : (res?.content || []);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load notifications', err);
        if (this.notifications.length === 0) {
          this.errorMessage = 'Unable to load notifications. Please try again.';
        }
        this.isLoading = false;
      }
    });

    // Refresh unread count concurrently
    this.notificationService.fetchUnreadCount().subscribe({
      error: () => { }
    });
  }

  onMarkAsRead(notif: NotificationResponse, event: Event): void {
    event.stopPropagation();

    if (notif.isRead || this.pendingMarkAsReadIds.has(notif.notificationId)) {
      return;
    }

    this.pendingMarkAsReadIds.add(notif.notificationId);

    this.notificationService.markAsRead(notif.notificationId).subscribe({
      next: (res) => {
        if (res && res.isRead) {
          notif.isRead = true;
        }
        this.pendingMarkAsReadIds.delete(notif.notificationId);
      },
      error: () => {
        // Keep notification unread and retain unread count on API failure
        this.pendingMarkAsReadIds.delete(notif.notificationId);
      }
    });
  }

  onNotificationClick(notif: NotificationResponse): void {
    const role = this.currentUser?.role;

    if (notif.sarStrId) {
      if (role === 'BANK_ADMIN') {
        this.router.navigate(['/bank/sar-str']);
      } else if (role === 'COMPLIANCE_OFFICER') {
        this.router.navigate(['/compliance/cases']);
      }
    }

    this.isOpenPanel = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpenPanel && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpenPanel = false;
    }
  }

  onLogout(): void {
    this.isOpenPanel = false;
    this.authService.logout().subscribe(
      {
        next: (next: any) => {
          this.authService.clearLocalSession();
          this.router.navigate(
            ['/login'],
            { replaceUrl: true }
          );
        },
        error: (error: any) => {
          console.log(error);
          alert(error);
        }
      }
    );
  }
}
