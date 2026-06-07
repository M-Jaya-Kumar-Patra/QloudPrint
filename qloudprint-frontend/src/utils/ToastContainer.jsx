// ToastContainer.jsx
import React, { useSyncExternalStore, useEffect, useState } from 'react';
import { toastStore } from './toastStore';

// Configuration for colors, glowing effects, and SVG icons
const TOAST_THEMES = {
  success: {
    title: 'Success',
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  error: {
    title: 'Error',
    color: '#EF4444',
    glow: 'rgba(239, 68, 68, 0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  warning: {
    title: 'Warning',
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    title: 'Info',
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};

const styles = {
  container: {
    position: 'fixed',
    top: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    fontFamily: '"Inter", "Segoe UI", sans-serif', // Using modern typography
  },
  toastCard: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    width: '320px',
    padding: '16px',
    borderRadius: '10px 10px 8px 8px', // Bottom corners slightly tighter for the line
    background: 'linear-gradient(135deg, #1e222b 0%, #13161c 100%)', // Sleek dark slate gradient
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.21, 1.02, 0.73, 1)',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  message: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#9ca3af', // Dimmer gray text for secondary description
    margin: 0,
    lineHeight: '1.4',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
    marginTop: '2px',
    transition: 'color 0.2s',
  },
};

// Sub-component handling individual progress bar instances smoothly
// Replace the old ToastItem function in ToastContainer.jsx with this:
function ToastItem({ toastItem }) {
  const theme = TOAST_THEMES[toastItem.type] || TOAST_THEMES.info;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Force a tiny paint delay so the browser registers the 100% -> 0% width change
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div 
      style={{ 
        ...styles.toastCard,
        background: `linear-gradient(90deg, ${theme.glow} 0%, rgba(26,29,37,0) 25%), #171921`
      }}
      className="toast-animate"
    >
      <div style={styles.iconWrapper}>{theme.icon}</div>
      <div style={styles.content}>
        <h4 style={styles.title}>{theme.title}</h4>
        <p style={styles.message}>{toastItem.message}</p>
      </div>
      <button 
        style={styles.closeBtn} 
        onClick={() => toastStore.remove(toastItem.id)}
        onMouseEnter={(e) => e.target.style.color = '#fff'}
        onMouseLeave={(e) => e.target.style.color = '#6b7280'}
      >
        ✕
      </button>

      {/* Optimized Progress Timeline Line */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          // Starts at 100%, transitions to 0% smoothly via hardware-accelerated CSS
          width: isMounted ? '0%' : '100%',
          backgroundColor: theme.color,
          boxShadow: `0 -1px 8px ${theme.color}`,
          // Let CSS handle the interpolation linearly over the exact duration
          transition: isMounted ? `width ${toastItem.duration}ms linear` : 'none'
        }}
      />
    </div>
  );
}

export function ToastContainer() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);

  return (
    <div style={styles.container}>
      {toasts.map((toastItem) => (
        <ToastItem key={toastItem.id} toastItem={toastItem} />
      ))}
    </div>
  );
}