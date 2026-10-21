const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición al servidor');
    }

    return data;
  }

  // Upload
  async uploadImage(file: File): Promise<{ success: boolean; url: string }> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al subir la imagen');
    }

    return data;
  }

  // Auth
  async login(payload: { email: string; password: string }) {
    return this.request<{ success: boolean; data: { user: any; token: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async register(payload: { username: string; email: string; password: string; fullName: string; bio?: string }) {
    return this.request<{ success: boolean; data: { user: any; token: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe() {
    return this.request<{ success: boolean; data: any }>('/api/auth/me');
  }

  // Posts
  async getGlobalFeed(page = 1) {
    return this.request<{ success: boolean; data: any[] }>(`/api/posts/feed?page=${page}`);
  }

  async getFollowingFeed(page = 1) {
    return this.request<{ success: boolean; data: any[] }>(`/api/posts/feed/following?page=${page}`);
  }

  async getUserPosts(username: string) {
    return this.request<{ success: boolean; data: any[] }>(`/api/posts/user/${username}`);
  }

  async createPost(payload: { content: string; imageUrl?: string }) {
    return this.request<{ success: boolean; data: any }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updatePost(id: string, payload: { content?: string; imageUrl?: string }) {
    return this.request<{ success: boolean; data: any }>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deletePost(id: string) {
    return this.request<{ success: boolean; message: string }>(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleLike(postId: string, emoji = '❤️') {
    return this.request<{
      success: boolean;
      data: { postId: string; likesCount: number; isLiked: boolean; userReaction: string | null; topReactions: string[] };
    }>(`/api/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  async getComments(postId: string) {
    return this.request<{ success: boolean; data: any[] }>(`/api/posts/${postId}/comments`);
  }

  async addComment(postId: string, content: string) {
    return this.request<{ success: boolean; data: any }>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Users
  async getProfile(username: string) {
    return this.request<{ success: boolean; data: any }>(`/api/users/${username}`);
  }

  async updateProfile(payload: { fullName?: string; bio?: string; avatarUrl?: string }) {
    return this.request<{ success: boolean; data: any }>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async followUser(userId: string) {
    return this.request<{ success: boolean; message: string }>(`/api/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string) {
    return this.request<{ success: boolean; message: string }>(`/api/users/${userId}/follow`, {
      method: 'DELETE',
    });
  }

  async getSuggestions() {
    return this.request<{ success: boolean; data: any[] }>('/api/users/suggestions');
  }

  // Notifications
  async getNotifications() {
    return this.request<{ success: boolean; data: { notifications: any[]; unreadCount: number } }>(
      '/api/notifications'
    );
  }

  async markNotificationAsRead(id: string) {
    return this.request<{ success: boolean; data: any }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<{ success: boolean; message: string }>('/api/notifications/read-all', {
      method: 'PATCH',
    });
  }
}

export const api = new ApiClient();
