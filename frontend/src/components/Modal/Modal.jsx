import { useEffect } from 'react';

export default function Modal({ title, children, onClose }) {
  useEffect(() => {
    function handleEsc(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
