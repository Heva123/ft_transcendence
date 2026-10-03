type BlockUserModalProps = {
  username: string
  onCancel: () => void
  onConfirm: () => void
}

function BlockUserModal({
  username,
  onCancel,
  onConfirm,
}: BlockUserModalProps) {
  return (
    <div className="block-modal-backdrop">
      <div className="block-modal">
        <h2>Block {username}?</h2>
        <p>
          Hide this user’s messages for you and prevent direct interaction.
          Other community members can still see their messages.
        </p>
        <div className="block-modal__actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="button" onClick={onConfirm}>Block user</button>
        </div>
      </div>
    </div>
  )
}

export default BlockUserModal
