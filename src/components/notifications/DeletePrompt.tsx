import React, { useMemo, useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { UserNotification } from '@/types/notification'
import styles from './DeletePrompt.module.css'

interface DeletePromptProps {
  notification: UserNotification | null
  isOpen: boolean
  onArchiveInstead: (notificationId: string) => Promise<void>
  onDeleteConfirm: (notificationId: string) => Promise<void>
  onClose: () => void
  allowArchiveOption?: boolean
}

const DeletePrompt: React.FC<DeletePromptProps> = ({
  notification,
  isOpen,
  onArchiveInstead,
  onDeleteConfirm,
  onClose,
  allowArchiveOption = true
}) => {
  const [pending, setPending] = useState<'archive' | 'delete' | null>(null)

  const title = useMemo(() => notification?.title || 'this notification', [notification])

  const handleArchive = async () => {
    if (!notification || !allowArchiveOption) return
    setPending('archive')
    try {
      await onArchiveInstead(notification._id)
      onClose()
    } finally {
      setPending(null)
    }
  }

  const handleDelete = async () => {
    if (!notification) return
    setPending('delete')
    try {
      await onDeleteConfirm(notification._id)
      onClose()
    } finally {
      setPending(null)
    }
  }

  const footer = (
    <div className={styles.actions}>
      <Button variant="ghost" onClick={onClose} disabled={!!pending}>
        Cancel
      </Button>
      {allowArchiveOption && (
        <Button
          variant="secondary"
          onClick={handleArchive}
          loading={pending === 'archive'}
          disabled={!notification}
        >
          Archive instead
        </Button>
      )}
      <Button
        variant="primary"
        className={styles.dangerButton}
        onClick={handleDelete}
        loading={pending === 'delete'}
        disabled={!notification}
      >
        Delete permanently
      </Button>
    </div>
  )

  const handleClose = () => {
    if (!pending) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen && !!notification} onClose={handleClose} title="Delete notification?" footer={footer}>
      <div className={styles.body}>
        <p>
          You are about to remove <strong>{title}</strong>.
        </p>
        <p>
          <span className={styles.dangerText}>Deleting is permanent.</span> You can archive the notification instead and
          restore it later if needed.
        </p>
      </div>
    </Modal>
  )
}

export default DeletePrompt
