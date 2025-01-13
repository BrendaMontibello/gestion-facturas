import { useLoadingStore } from '@/lib/store/loading-store';

export function useBlockingLoading() {
  const setLoading = useLoadingStore((state) => state.setLoading);

  const startLoading = (message?: string) => {
    setLoading(true, message);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const withLoading = async <T>(
    fn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      startLoading(message);
      return await fn();
    } finally {
      stopLoading();
    }
  };

  return {
    startLoading,
    stopLoading,
    withLoading,
  };
} 