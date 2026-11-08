import { describe, expect, it } from 'vitest'
import { demoReply } from '../src/features/chat/demoReply'

describe('demoReply', () => {
  it('matches Mongolian and English keywords and answers in the requested language', () => {
    expect(demoReply('Технологийн хувьсал гэж юу вэ?', 'mn').links).toEqual([['/evolution', 'Технологийн хувьсал']])
    expect(demoReply('show me the evolution chart', 'en').links).toEqual([['/evolution', 'Technology Evolution']])
    expect(demoReply('багш нар', 'en').text).toMatch(/Teachers page/)
  })
  it('prefers "add a work" over the generic works rule', () => {
    expect(demoReply('бүтээл нэмэх', 'mn').links[0][0]).toBe('/my-works/new')
  })
  it('does not fire short keys inside other words, and falls back politely', () => {
    expect(demoReply('this is said', 'en').text).toMatch(/did not get that/)
    expect(demoReply('hi', 'en').text).toMatch(/Hello/)
    expect(demoReply('', 'mn').links).toEqual([])
  })
})
