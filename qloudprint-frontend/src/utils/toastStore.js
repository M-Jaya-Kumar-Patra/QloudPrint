// toastStore.js
let listeners = [];
let toasts = [];

export const toastStore = {
  subscribe(listener) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  getSnapshot() {
    return toasts;
  },

  add(message, type = 'info', duration = 4000) { // Defaulting to 4 seconds
    const id = Math.random().toString(36).substring(2, 9);
    
    // Save duration on the object so the component timeline can read it
    toasts = [...toasts, { id, message, type, duration }];
    listeners.forEach((listener) => listener());

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  },

  remove(id) {
    toasts = toasts.filter((toast) => toast.id !== id);
    listeners.forEach((listener) => listener());
  }
};

export const toast = {
  success: (msg, dur) => toastStore.add(msg, 'success', dur),
  error: (msg, dur) => toastStore.add(msg, 'error', dur),
  info: (msg, dur) => toastStore.add(msg, 'info', dur),
  warning: (msg, dur) => toastStore.add(msg, 'warning', dur),
};