import { describe, expect, it } from 'vitest'

import { buildDynamicQuery } from '../src/controllers/dynamicQueryBuilder'

type MockModel = {
  schema: {
    path: (field: string) => { instance: string } | undefined
  }
}

function createModelWithField(instance: string): MockModel {
  return {
    schema: {
      path: (field: string) => (field === 'value' ? { instance } : undefined)
    }
  }
}

describe('buildDynamicQuery', () => {
  it('builds case-insensitive regex for string fields', () => {
    const model = createModelWithField('String')

    const query = buildDynamicQuery(model as never, {
      key: 'value',
      value: 'harry'
    })

    expect(query).toEqual({
      value: { $regex: 'harry', $options: 'i' }
    })
  })

  it('throws for unknown fields', () => {
    const model: MockModel = {
      schema: {
        path: () => undefined
      }
    }

    expect(() =>
      buildDynamicQuery(model as never, {
        key: 'missing',
        value: 'x'
      })
    ).toThrow('Unknown field: missing')
  })
})
