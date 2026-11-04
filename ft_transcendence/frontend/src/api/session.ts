



let redirecting = false

export function expireSession() {
  if (redirecting || !localStorage.getItem('accessToken'))
    return
  localStorage.removeItem('accessToken')
  if (window.location.pathname.startsWith('/login'))
    return
  redirecting = true
  window.location.assign('/login?expired=1')
}
