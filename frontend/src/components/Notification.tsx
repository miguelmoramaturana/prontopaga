import { useEffect } from 'react';

export type NoticeKind = 'error' | 'success' | 'info';

export interface Notice {
  kind: NoticeKind;
  message: string;
}

interface Props {
  notice: Notice | null;
  onDismiss: () => void;
}

/** Banner de notificación fijo arriba, se cierra solo a los 5s. */
export function Notification({ notice, onDismiss }: Props) {
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(onDismiss, 5000);
    return () => clearTimeout(id);
  }, [notice, onDismiss]);

  if (!notice) return null;

  return (
    <div
      className={`notice notice--${notice.kind}`}
      role={notice.kind === 'error' ? 'alert' : 'status'}
    >
      <span>{notice.message}</span>
      <button type="button" className="notice__close" onClick={onDismiss} aria-label="Cerrar">
        ×
      </button>
    </div>
  );
}
