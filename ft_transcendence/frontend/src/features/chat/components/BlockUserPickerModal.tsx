import type { BlockTarget } from '../api/blockApi'

type Props = {
  users: BlockTarget[]
  onSelect: (user: BlockTarget) => void
  onCancel: () => void
}

function BlockUserPickerModal({
  users,
  onSelect,
  onCancel,
}: Props) {
  return (
    <div className="block-modal-backdrop">
      <div className="block-modal">
        <h2>Block user</h2>
        <p>Choose which community member you want to block.</p>

        <div className="block-user-list">
          {users.map((user) => (
            <button key={user.id} type="button"
              onClick={() => onSelect(user)}>
              {user.username}
            </button>
          ))}
        </div>

        <div className="block-modal__actions">
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default BlockUserPickerModal
