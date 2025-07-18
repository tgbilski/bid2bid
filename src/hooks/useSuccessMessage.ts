
import { useState } from 'react';

export const useSuccessMessage = () => {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);

  const showSuccess = (msg: string) => {
    setMessage(msg);
    setShow(true);
  };

  const hideSuccess = () => {
    setShow(false);
    setMessage('');
  };

  return {
    message,
    show,
    showSuccess,
    hideSuccess,
  };
};
