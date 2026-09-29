import { Store } from 'react-notifications-component';
import useErrorHandler from './useErrorHandler';
// 401 session expiry is handled by axiosAuthRefresh (refresh → retry, or redirect to login).
// Do not force logout here — that also breaks login wrong-password 401s.

const useToasterNotification = () => {
  const { handleError } = useErrorHandler();

  const showNotification = (
    title: string | JSX.Element,
    message: string | JSX.Element,
    type: 'default' | 'success' | 'danger' | 'info' | 'warning' = 'default'
  ) => {
    Store.addNotification({
      title,
      message,
      type,
      insert: 'top',
      container: 'top-right',
      animationOut: ['animate__animated', 'animate__fadeOut'],
      dismiss: {
        duration: 2000,
        pauseOnHover: true,
        onScreen: true,
        showIcon: true,
        waitForAnimation: true,
      },
    });
  };

  const showErrorNotification = (message: any| JSX.Element) => {
    if (typeof message === 'string') {
      showNotification('Error', message, 'danger');
      return;
    }
    // 401: interceptor already refreshed or redirected — avoid duplicate logout/toasts
    if (message?.response?.status === 401) {
      return;
    }
    // 403: permission denied — show message, do not log the user out
    if (message?.response?.status === 403) {
      showNotification('Error', handleError(message), 'danger');
      return;
    }
    showNotification('Error', handleError(message), 'danger');
  };

  const showSuccessNotification = (message: string | JSX.Element) => {
    showNotification('Success', message, 'success');
  };

  return {
    showNotification,
    showErrorNotification,
    showSuccessNotification,
  };
};

export default useToasterNotification;
