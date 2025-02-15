import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import Button from './Button';

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md w-[95%]',
    md: 'max-w-lg w-[95%]',
    lg: 'max-w-2xl w-[95%]',
    xl: 'max-w-4xl w-[95%]',
    full: 'max-w-full w-[95%]'
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`
            ${sizes[size]}
            transform
            rounded-lg
            bg-white
            shadow-xl
            transition-all
            relative
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b p-3 sm:p-4">
            <h3 className="text-lg font-medium">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 p-2"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t p-3 sm:p-4 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;