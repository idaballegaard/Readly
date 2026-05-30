import { describe, expect, it } from 'vitest'

import {
  validateUserLoginInfo,
  validateUserRegistrationInfo
} from '../src/controllers/authController'

describe('auth validation helpers', () => {
  it('accepts valid registration payloads', () => {
    const result = validateUserRegistrationInfo({
      name: 'Ida Ballegaard',
      email: 'ida@example.com',
      password: 'secret123'
    } as never)

    expect(result.error).toBeUndefined()
  })

  it('rejects invalid registration payloads', () => {
    const result = validateUserRegistrationInfo({
      name: 'Ida',
      email: 'not-an-email',
      password: '123'
    } as never)

    expect(result.error?.details[0].message).toContain('"name" length must be at least 6 characters long')
  })

  it('accepts valid login payloads', () => {
    const result = validateUserLoginInfo({
      email: 'ida@example.com',
      password: 'secret123'
    } as never)

    expect(result.error).toBeUndefined()
  })

  it('rejects invalid login payloads', () => {
    const result = validateUserLoginInfo({
      email: 'bad-email',
      password: '123'
    } as never)

    expect(result.error?.details[0].message).toContain('"email" must be a valid email')
  })
})