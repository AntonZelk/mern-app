import { useCallback } from 'react';

//в materialize есть объект М с методом toast
export const useMessage = () => {
  return useCallback((text) => {
    if (window.M && text) {
      window.M.toast({ html: text });
    }
  }, []);
};
