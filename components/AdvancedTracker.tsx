'use client';

import { useEffect } from 'react';

interface TrackingEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  url: string;
}

export default function AdvancedTracker() {
  useEffect(() => {
    const trackEvent = (type: string, data: Record<string, unknown> = {}) => {
      const event: TrackingEvent = {
        type,
        data,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };

      // Send to your analytics endpoint
      fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(error => console.error('Tracking failed:', error));
    };

    // Track page visit
    trackEvent('page_visit', {
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });

    // Track mouse movements
    let mouseTrackingTimeout: NodeJS.Timeout;
    const trackMouseMovement = (e: MouseEvent) => {
      clearTimeout(mouseTrackingTimeout);
      mouseTrackingTimeout = setTimeout(() => {
        trackEvent('mouse_move', {
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now()
        });
      }, 1000); // Throttle to every second
    };

    // Track clicks
    const trackClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      trackEvent('click', {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.slice(0, 100),
        x: e.clientX,
        y: e.clientY
      });
    };

    // Track scroll behavior
    let scrollTimeout: NodeJS.Timeout;
    const trackScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        trackEvent('scroll', {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          documentHeight: document.documentElement.scrollHeight,
          windowHeight: window.innerHeight
        });
      }, 500);
    };

    // Track key presses (be careful with privacy)
    const trackKeyPress = (e: KeyboardEvent) => {
      // Only track non-sensitive keys
      if (!['Enter', 'Escape', 'Tab', 'Backspace'].includes(e.key)) return;
      
      trackEvent('key_press', {
        key: e.key,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey
      });
    };

    // Track form interactions
    const trackFormInteraction = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.type === 'password') return; // Don't track passwords
      
      trackEvent('form_interaction', {
        eventType: e.type,
        inputType: target.type,
        inputName: target.name,
        inputId: target.id,
        formId: target.form?.id
      });
    };

    // Track time spent on page
    const startTime = Date.now();
    const trackTimeSpent = () => {
      const timeSpent = Date.now() - startTime;
      trackEvent('time_spent', {
        timeSpent: Math.floor(timeSpent / 1000), // in seconds
        url: window.location.href
      });
    };

    // Track when user leaves page
    const trackPageLeave = () => {
      trackTimeSpent();
      trackEvent('page_leave');
    };

    // Track browser/tab visibility changes
    const trackVisibilityChange = () => {
      trackEvent('visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
    };

    // Add event listeners
    document.addEventListener('mousemove', trackMouseMovement);
    document.addEventListener('click', trackClick);
    window.addEventListener('scroll', trackScroll);
    document.addEventListener('keydown', trackKeyPress);
    
    // Form event listeners
    const forms = document.querySelectorAll('input, textarea, select');
    forms.forEach(form => {
      form.addEventListener('focus', trackFormInteraction);
      form.addEventListener('blur', trackFormInteraction);
      form.addEventListener('change', trackFormInteraction);
    });

    window.addEventListener('beforeunload', trackPageLeave);
    document.addEventListener('visibilitychange', trackVisibilityChange);

    // Track periodic activity (heartbeat)
    const heartbeat = setInterval(() => {
      trackEvent('heartbeat', {
        activeTime: Date.now() - startTime
      });
    }, 30000); // Every 30 seconds

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', trackMouseMovement);
      document.removeEventListener('click', trackClick);
      window.removeEventListener('scroll', trackScroll);
      document.removeEventListener('keydown', trackKeyPress);
      window.removeEventListener('beforeunload', trackPageLeave);
      document.removeEventListener('visibilitychange', trackVisibilityChange);
      clearInterval(heartbeat);
      clearTimeout(mouseTrackingTimeout);
      clearTimeout(scrollTimeout);
      
      forms.forEach(form => {
        form.removeEventListener('focus', trackFormInteraction);
        form.removeEventListener('blur', trackFormInteraction);
        form.removeEventListener('change', trackFormInteraction);
      });
      
      trackTimeSpent();
    };
  }, []);

  return null; // This component doesn't render anything visible
}
