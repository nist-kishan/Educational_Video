import { useDispatch } from 'react-redux';
import { addToast } from '../store/toastSlice';

export const useToast = () => {
  const dispatch = useDispatch();

  return {
    success: (message, duration = 3000) => {
      dispatch(addToast({ message, type: 'success', duration }));
    },
    error: (message, duration = 4000) => {
      dispatch(addToast({ message, type: 'error', duration }));
    },
    warning: (message, duration = 3500) => {
      dispatch(addToast({ message, type: 'warning', duration }));
    },
    info: (message, duration = 3000) => {
      dispatch(addToast({ message, type: 'info', duration }));
    }
  };
};
