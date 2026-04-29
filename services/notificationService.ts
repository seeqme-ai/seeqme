import { messaging } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';
import { API_BASE_URL } from './apiService';
import { toast } from 'sonner';

export const notificationService = {
  async requestPermissionAndGetToken() {
    try {
      const vapidKey = 'BGr1M2pbA5olLwFGdApbPnXtjJWhkLLO2D0WWtNgqQZLrFrKKAhzaKritfwDklvJo2sB-Zd4XRMrDDvvl_MeVks';

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey });
        
        if (token) {
          console.log('🔔 FCM Token:', token);
          await this.saveTokenToBackend(token);
        }
      }
    } catch (error) {
      console.error('❌ [NotificationService] Error getting FCM token. This usually means the VAPID key is invalid or mismatched:', error);
    }
  },

  async saveTokenToBackend(fcmToken: string) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_BASE_URL}/auth/fcm-token`, { fcmToken }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ FCM Token saved to backend.');
    } catch (error) {
      console.error('❌ Failed to save FCM token to backend:', error);
    }
  },

  listenForMessages() {
    onMessage(messaging, (payload) => {
      console.log('📨 Foreground message received:', payload);
      toast.info(payload.notification?.title || 'Notification', {
        description: payload.notification?.body || '',
      });
    });
  }
};
