import { messaging } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';
import { API_BASE_URL } from './apiService';
import { toast } from 'sonner';

export const notificationService = {
  async requestPermissionAndGetToken() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'BM3Fk9T8E3Z5M9W4I9O6U9T8Y7R6E5W4Q3A2S1D0F9G8H7J6K5L4M3N2B1V0C9X8Z7' // Replace with your actual VAPID key from Firebase Console
        });
        
        if (token) {
          console.log('🔔 FCM Token:', token);
          await this.saveTokenToBackend(token);
        } else {
          console.warn('⚠️ No registration token available. Request permission to generate one.');
        }
      } else {
        console.warn('🚫 Notification permission denied.');
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
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
