// ToastContainer.tsx
import { ToastContainer as BaseToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ToastContainer = () => {
    return <BaseToastContainer />;
};

export const showToast = (message: string, options?: any) => {
    toast(message, options);
};
