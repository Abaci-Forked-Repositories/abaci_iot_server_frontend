import { Store } from 'react-notifications-component';
import useErrorHandler from './useErrorHandler';
// 401 session expiry is handled by axiosAuthRefresh (refresh → retry, or redirect to login).
// Do not force logout here — that also breaks login wrong-password 401s.

/** Check if a string looks like HTML from a server error page */
const isHtmlContent = (value: unknown): boolean => {
	if (typeof value !== 'string') return false;
	return /<!DOCTYPE|<html|<head|<body|<title|nginx\/|apache\/|<pre>/i.test(value);
};

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
      // Never render raw HTML in a toast
      const safeMessage = isHtmlContent(message)
        ? 'The server returned an unexpected response.'
        : message;
      showNotification('Error', safeMessage, 'danger');
      return;
    }
    // 401: interceptor already refreshed or redirected — avoid duplicate logout/toasts
    if (message?.response?.status === 401) {
      return;
    }

    // Check if the error response data is HTML (Nginx error page)
    const data = message?.response?.data;
    if (isHtmlContent(data)) {
      const status = message?.response?.status;
      if (status === 404) {
        showNotification('Error', 'The service is currently unavailable. Please try again later.', 'danger');
      } else if (status >= 500 && status <= 504) {
        showNotification('Error', 'The server is temporarily unavailable. Please try again later.', 'danger');
      } else {
        showNotification('Error', 'Received an unexpected response from the server.', 'danger');
      }
      return;
    }

    // Network error (no response at all)
    if (message && !message.response) {
      if (message.code === 'ECONNABORTED' || message.code === 'ETIMEDOUT') {
        showNotification('Error', 'The request took too long. Please try again.', 'danger');
      } else {
        showNotification('Error', 'Unable to reach the server. Please check your connection.', 'danger');
      }
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
