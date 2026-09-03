import React, { useEffect, useRef } from 'react';

const ChargesInfoPopup = ({ message, onClose }) => {
    const popupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click was outside the popup
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };

        // Delay attaching to avoid immediate closing on the click that opens it
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);
        
        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div 
            ref={popupRef} 
            className="absolute left-0 top-6 z-50 bodyBackgroundColor  text-xs p-3 rounded shadow-xl min-w-[220px] font-normal"
        >
            {message}
        </div>
    );
};

export default ChargesInfoPopup;