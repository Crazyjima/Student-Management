import { type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps): ReactElement | null => {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {description !== undefined && <p>{description}</p>}
        <div>{children}</div>
        {footer !== undefined && <div>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};
