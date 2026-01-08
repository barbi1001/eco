/**
 * Retry mechanism utility for handling API failures with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
}

/**
 * Default retry condition - retry on network errors and 5xx server errors
 */
const defaultRetryCondition = (error: any): boolean => {
  // Retry on network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Retry on server errors (5xx)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }
  
  // Retry on timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return true;
  }
  
  return false;
};

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition
  } = options;

  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts: attempt
      };
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt
      if (attempt === maxAttempts) {
        break;
      }
      
      // Don't retry if the error doesn't meet retry conditions
      if (!retryCondition(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      
      // Add some jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      const finalDelay = delay + jitter;
      
      console.warn(`Attempt ${attempt} failed, retrying in ${Math.round(finalDelay)}ms:`, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  return {
    success: false,
    error: lastError,
    attempts: maxAttempts
  };
}

/**
 * Create a retry wrapper for API functions
 */
export function createRetryWrapper<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  return async (...args: T): Promise<R> => {
    const result = await withRetry(() => fn(...args), options);
    
    if (result.success) {
      return result.data!;
    } else {
      throw result.error;
    }
  };
}

/**
 * Specific retry configurations for different types of operations
 */
export const retryConfigs = {
  // For template fetching - more aggressive retry
  templates: {
    maxAttempts: 4,
    baseDelay: 500,
    maxDelay: 5000,
    backoffFactor: 1.5
  } as RetryOptions,
  
  // For component fetching - moderate retry
  components: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    backoffFactor: 2
  } as RetryOptions,
  
  // For order submission - conservative retry
  orders: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error: any) => {
      // Only retry on network errors for orders, not server errors
      return error instanceof TypeError && error.message.includes('fetch');
    }
  } as RetryOptions,
  
  // For image uploads - minimal retry
  uploads: {
    maxAttempts: 2,
    baseDelay: 1500,
    maxDelay: 5000,
    backoffFactor: 2
  } as RetryOptions
};