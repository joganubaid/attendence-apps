// Performance and utility helpers for better app performance

import { InteractionManager, LayoutAnimation, Platform } from 'react-native';

// Debounce function to prevent rapid state updates
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance-sensitive operations
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Run after interactions for better performance
export const runAfterInteractions = (callback) => {
  return InteractionManager.runAfterInteractions(callback);
};

// Animate layout changes smoothly
export const animateLayoutChange = () => {
  if (Platform.OS === 'ios') {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }
};

// Deep clone utility for state management
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Safe JSON parsing with error handling
export const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
};

// Safe JSON stringify with error handling
export const safeJsonStringify = (obj, defaultValue = '{}') => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('Failed to stringify object:', error);
    return defaultValue;
  }
};

// Memoize expensive computations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Batch AsyncStorage operations for better performance
export const batchAsyncStorageOperations = async (operations) => {
  const results = [];
  for (const operation of operations) {
    try {
      const result = await operation();
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error });
    }
  }
  return results;
};

// Performance monitoring
export const performanceMonitor = {
  timers: new Map(),

  start: (label) => {
    performanceMonitor.timers.set(label, Date.now());
  },

  end: (label) => {
    const startTime = performanceMonitor.timers.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      console.log(`⏱️ ${label}: ${duration}ms`);
      performanceMonitor.timers.delete(label);
      return duration;
    }
    return null;
  }
};

// Error boundary helper
export const createErrorHandler = (context) => {
  return (error, errorInfo) => {
    console.error(`Error in ${context}:`, error);
    if (errorInfo) {
      console.error('Error Info:', errorInfo);
    }

    // You can send error reports to crash analytics here
    // Example: Crashlytics.recordError(error);
  };
};

// Validate data structures
export const validateData = {
  isValidSubject: (subject) => {
    return subject &&
           typeof subject === 'object' &&
           typeof subject.name === 'string' &&
           subject.name.trim().length > 0;
  },

  isValidTimetable: (timetable) => {
    return Array.isArray(timetable) &&
           timetable.length === 7 &&
           timetable.every(day => Array.isArray(day));
  },

  isValidAttendance: (attendance) => {
    return attendance && typeof attendance === 'object';
  },

  isValidDate: (dateStr) => {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  }
};

// Cache implementation for frequently accessed data
export class SimpleCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, item);
      return item;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest item
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

// Network utilities
export const networkUtils = {
  retry: async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  },

  timeout: (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), ms)
      )
    ]);
  }
};
