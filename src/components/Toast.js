import React, { useState, useEffect } from 'react';
import './Toast.css'; // Assuming you have a CSS file for styling the toast

const Toast = ({ message, duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    return (
        isVisible && (
            <div className="toast">
                {message}
            </div>
        )
    );
};

export default Toast;