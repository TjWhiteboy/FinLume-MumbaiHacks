
// Mock Authentication Service

export interface User {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock validation
      if (email && password.length >= 6) {
        resolve({
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          email: email,
          name: email.split('@')[0], // Simple name extraction
          isGuest: false
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1500); // Simulate network delay
  });
};

export const loginGuest = async (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'guest_user_001',
        email: 'guest@finlume.ai',
        name: 'Guest User',
        isGuest: true
      });
    }, 800); // Faster guest login
  });
};
