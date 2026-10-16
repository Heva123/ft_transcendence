import { useEffect, useState } from 'react'
import {
  blockUser,
  getBlockedUsers,
  unblockUser,
} from '../../auth/api/userApi'
import type { BlockTarget } from '../api/blockApi'

type Mode = 'closed' | 'pick' | 'confirm'

type BlockState = {
  blocked: BlockTarget[]
  selected: BlockTarget | null
  mode: Mode
  error: string
}

/*
  The blocked list comes from the backend, so it survives a reload
  and several people can be blocked at once.
*/
export function useBlockFlow(
  members: BlockTarget[],
  currentUserId: string,
  onChange: () => void,
) {
  const [state, setState] = useState<BlockState>({
    blocked: [],
    selected: null,
    mode: 'closed',
    error: '',
  })

  useEffect(() => {
    let active = true

    getBlockedUsers()
      .then((items) => {
        if (active)
          setState((current) => ({
            ...current,
            blocked: items.map((item) => item.blocked),
          }))
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  const blockedIds = new Set(state.blocked.map((user) => user.id))
  const candidates = members.filter((user) =>
    user.id !== currentUserId && !blockedIds.has(user.id))

  function open() {
    setState((current) => ({ ...current, mode: 'pick', error: '' }))
  }

  function select(user: BlockTarget) {
    setState((current) => ({ ...current, selected: user, mode: 'confirm' }))
  }

  async function confirm() {
    const user = state.selected

    if (!user)
      return
    try {
      await blockUser(user.id)
      setState((current) => ({
        ...current,
        blocked: [...current.blocked, user],
        selected: null,
        mode: 'closed',
      }))
      onChange()
    } catch {
      setState((current) => ({
        ...current,
        mode: 'closed',
        error: `Could not block ${user.username}.`,
      }))
    }
  }

  async function unblock(user: BlockTarget) {
    try {
      await unblockUser(user.id)
      setState((current) => ({
        ...current,
        blocked: current.blocked.filter((item) => item.id !== user.id),
      }))
      onChange()
    } catch {
      setState((current) => ({
        ...current,
        error: `Could not unblock ${user.username}.`,
      }))
    }
  }

  function cancel() {
    setState((current) => ({ ...current, selected: null, mode: 'closed' }))
  }

  return { state, blockedIds, candidates, open, select, confirm, unblock, cancel }
}
