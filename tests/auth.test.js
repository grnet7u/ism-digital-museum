import { describe, expect, it } from 'vitest'
import { isAdminUser, validateAuthForm } from '../src/features/auth/auth-context'

describe('validateAuthForm', () => {
  const ok = { email: 'a@ufe.edu.mn', password: '12345678', displayName: 'Бат' }
  it('accepts valid login and register input', () => {
    expect(validateAuthForm(ok, 'login')).toBe('')
    expect(validateAuthForm(ok, 'register')).toBe('')
  })
  it('rejects bad email, short password and blank name only on register', () => {
    expect(validateAuthForm({ ...ok, email: 'abc' }, 'login')).not.toBe('')
    expect(validateAuthForm({ ...ok, password: '1234567' }, 'login')).not.toBe('')
    expect(validateAuthForm({ ...ok, displayName: '  ' }, 'login')).toBe('')
    expect(validateAuthForm({ ...ok, displayName: '  ' }, 'register')).not.toBe('')
  })
})

describe('isAdminUser', () => {
  it('trusts app_metadata only, never user_metadata', () => {
    expect(isAdminUser({ app_metadata: { role: 'admin' } })).toBe(true)
    expect(isAdminUser({ app_metadata: {}, user_metadata: { role: 'admin' } })).toBe(false)
    expect(isAdminUser(null)).toBe(false)
  })
})
