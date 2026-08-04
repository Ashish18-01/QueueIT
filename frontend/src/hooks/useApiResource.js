import { useCallback, useEffect, useState } from 'react';

export function useApiResource(loader, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: '' });
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const result = await loader();
      setState({ data: result.data?.items ?? result.data, meta: result.meta ?? result.data?.meta, loading: false, error: '' });
    } catch (error) {
      setState({ data: null, meta: null, loading: false, error: error.response?.data?.error?.message || error.message });
    }
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
