import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NotificationResponse,
  PageResponse,
  UnreadCountResponse
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);

  unreadCount = signal<number>(0);

  getNotifications(page: number = 0, size: number = 20): Observable<PageResponse<NotificationResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<NotificationResponse>>(environment.endpoints.notifications.getAll, { params });
  }

  getUnreadNotifications(page: number = 0, size: number = 20): Observable<PageResponse<NotificationResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<NotificationResponse>>(environment.endpoints.notifications.getUnread, { params });
  }

  fetchUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(environment.endpoints.notifications.getUnreadCount).pipe(
      tap(res => {
        if (res && typeof res.unreadCount === 'number') {
          this.unreadCount.set(res.unreadCount);
        }
      })
    );
  }

  markAsRead(notificationId: string): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(
      environment.endpoints.notifications.markAsRead(notificationId),
      {}
    ).pipe(
      tap(res => {
        if (res && res.isRead) {
          const current = this.unreadCount();
          if (current > 0) {
            this.unreadCount.set(current - 1);
          }
        }
      })
    );
  }

  resetState(): void {
    this.unreadCount.set(0);
  }
}
