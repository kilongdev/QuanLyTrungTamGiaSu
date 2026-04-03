// Quản lý các AbortController đang chạy để hủy request khi cần
const activeRequests = new Map();

/**
 * Hủy tất cả request của một key cụ thể
 */
export const cancelPreviousRequest = (key) => {
  if (activeRequests.has(key)) {
    const controller = activeRequests.get(key);
    controller.abort();
    activeRequests.delete(key);
  }
};

/**
 * Tạo một AbortSignal mới cho request key
 */
export const getAbortSignal = (key) => {
  cancelPreviousRequest(key);
  const controller = new AbortController();
  activeRequests.set(key, controller);
  return controller.signal;
};

/**
 * Để lại API call bình thường nhưng thêm abort signal
 * Cách dùng trong component: 
 * const signal = getAbortSignal('save-class-' + classId)
 * await apiCall({ ...data, signal })
 */

/**
 * Safe form submission wrapper
 * Tránh double submit và hủy request cũ
 * @param {Function} handler - Hàm xử lý submit
 * @param {String} key - Key để tracking request (ví dụ: 'save-lop-hoc-123')
 * @param {Number} timeout - Timeout tự động (ms)
 * @returns {Function} - Async function để gọi trong onSubmit
 */
export const createSafeSubmitter = (handler, key, timeout = 30000) => {
  let isSubmitting = false;
  let timeoutId = null;

  return async function safeSubmit(...args) {
    // Ngăn chặn double submit
    if (isSubmitting) {
      console.warn(`[${key}] Submission already in progress, ignoring duplicate request`);
      return;
    }

    isSubmitting = true;
    const signal = getAbortSignal(key);
    
    // Auto-reset sau timeout
    timeoutId = setTimeout(() => {
      isSubmitting = false;
      cancelPreviousRequest(key);
      console.warn(`[${key}] Request timeout after ${timeout}ms`);
    }, timeout);

    try {
      await handler(...args, signal);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`[${key}] Request was cancelled (previous submission started)`);
      } else {
        throw error;
      }
    } finally {
      isSubmitting = false;
      if (timeoutId) clearTimeout(timeoutId);
    }
  };
};

// Cleanup khi page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    activeRequests.forEach((controller) => controller.abort());
    activeRequests.clear();
  });
}
