
import { Navigate, useLocation } from 'react-router-dom'

function RequireAuth({ children }) {
  const location = useLocation()

  let loggedUser = null

  try {
    const savedUser = localStorage.getItem('bokyra_logged_user')
    loggedUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    loggedUser = null
  }

  if (!loggedUser?.email) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  return children
}

export default RequireAuth
