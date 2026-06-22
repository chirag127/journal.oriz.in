/**
 * HabitNewView — wraps HabitForm with AuthGate and redirects on save.
 */
import AuthGate from './AuthGate'
import HabitForm from './HabitForm'

export default function HabitNewView() {
  return (
    <AuthGate>
      {(uid) => (
        <HabitForm
          uid={uid}
          onSaved={(h) => window.location.assign(`/habits/${h.id}`)}
          onCancel={() => window.location.assign('/habits')}
        />
      )}
    </AuthGate>
  )
}
