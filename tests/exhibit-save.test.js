import { beforeEach, describe, expect, it, vi } from 'vitest'

const storage = { upload: vi.fn(), remove: vi.fn() }
let rowResult
vi.mock('../src/lib/supabase', () => {
  const query = { update: () => query, insert: () => query, eq: () => query, select: () => query, single: async () => rowResult }
  return { supabase: { from: () => query, storage: { from: () => storage } } }
})
const { saveExhibit } = await import('../src/services/exhibits')

const form = { title: 'T', description: '', year_created: '2025', category_id: 'c', technologies: 'React', demo_url: '', github_url: '' }
const file = { type: 'image/png', size: 10 }

describe('saveExhibit upload/save ordering', () => {
  beforeEach(() => {
    storage.upload.mockReset().mockResolvedValue({ error: null })
    storage.remove.mockReset().mockImplementation(async (paths) => ({ data: paths, error: null }))
  })

  it('removes the new upload when the row save fails', async () => {
    rowResult = { data: null, error: new Error('db down') }
    await expect(saveExhibit({ userId: 'u1', form, file, status: 'draft' })).rejects.toThrow('db down')
    const uploaded = storage.upload.mock.calls[0][0]
    expect(uploaded).toMatch(/^exhibits\/u1\/[\w-]+\.png$/)
    expect(storage.remove).toHaveBeenCalledWith([uploaded])
  })

  it('deletes the old image only after the row saved with the new one', async () => {
    rowResult = { data: { id: 'e1' }, error: null }
    const result = await saveExhibit({ id: 'e1', userId: 'u1', form, file, oldImagePath: 'exhibits/u1/old.png', status: 'pending' })
    expect(storage.remove).toHaveBeenCalledWith(['exhibits/u1/old.png'])
    expect(result.cleanupFailed).toBe(false)
  })

  it('reports cleanup failure instead of hiding it', async () => {
    rowResult = { data: { id: 'e1' }, error: null }
    storage.remove.mockResolvedValue({ data: [], error: null })
    const result = await saveExhibit({ id: 'e1', userId: 'u1', form, file, oldImagePath: 'exhibits/u1/old.png', status: 'pending' })
    expect(result.cleanupFailed).toBe(true)
  })
})
