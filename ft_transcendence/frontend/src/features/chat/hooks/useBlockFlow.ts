import { useState } from 'react'
import { blockUser, unblockUser } from '../../auth/api/userApi'
import {
  getBlockTargets,
  type BlockTarget,
} from '../api/blockApi'

type Mode = 'closed' | 'pick' | 'confirm'

type BlockState = {
  blocked: BlockTarget | null
  selected: BlockTarget | null
  candidates: BlockTarget[]
  mode: Mode
}

const initialState: BlockState = {
  blocked: null,
  selected: null,
  candidates: [],
  mode: 'closed',
}

export function useBlockFlow(
  channelId: string,
  currentUserId: string,
  onUnblock: () => Promise<void>,
) {
  const [state, setState] = useState<BlockState>(initialState)

  async function toggle() {
    let users: BlockTarget[]

    if (state.blocked) {
      await unblockUser(state.blocked.id)
      setState(initialState)
      await onUnblock()
      return
    }
    users = await getBlockTargets(channelId, currentUserId)
    if (users.length === 1) {
      setState({ ...state, selected: users[0], mode: 'confirm' })
      return
    }
    setState({ ...state, candidates: users, mode: 'pick' })
  }

  function select(user: BlockTarget) {
    setState({ ...state, selected: user, mode: 'confirm' })
  }

  async function confirm() {
    if (!state.selected)
      return
    await blockUser(state.selected.id)
    setState({ ...initialState, blocked: state.selected })
  }

  function cancel() {
    setState({ ...state, selected: null, mode: 'closed' })
  }

  return { state, toggle, select, confirm, cancel }
}
