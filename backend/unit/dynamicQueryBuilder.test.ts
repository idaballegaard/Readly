import { describe, expect, it } from 'vitest'

import { buildDynamicQuery } from '../src/controllers/dynamicQueryBuilder'

type MockModel = {
  schema: {
    path: (field: string) => { instance: string } | undefined
  }
}

function createModelWithField(instance: string, field = 'value'): MockModel {
  return {
    schema: {
      path: (path: string) => (path === field ? { instance } : undefined)
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

  it('converts number fields to numeric values', () => {
    const model = createModelWithField('Number')

    const query = buildDynamicQuery(model as never, {
      key: 'value',
      value: '42'
    })

    expect(query).toEqual({ value: 42 })
  })

  it('keeps number range objects intact', () => {
    const model = createModelWithField('Number')

    const query = buildDynamicQuery(model as never, {
      key: 'value',
      value: { $gte: 10, $lte: 20 }
    })

    expect(query).toEqual({
      value: { $gte: 10, $lte: 20 }
    })
  })

  it('converts date fields to Date objects', () => {
    const model = createModelWithField('Date')

    const query = buildDynamicQuery(model as never, {
      key: 'value',
      value: '2024-01-01T00:00:00.000Z'
    })

    expect(query).toEqual({
      value: new Date('2024-01-01T00:00:00.000Z')
    })
  })

  it('converts boolean-like values', () => {
    const model = createModelWithField('Boolean')

    const trueQuery = buildDynamicQuery(model as never, {
      key: 'value',
      value: '1'
    })
    const falseQuery = buildDynamicQuery(model as never, {
      key: 'value',
      value: 0
    })

    expect(trueQuery).toEqual({ value: true })
    expect(falseQuery).toEqual({ value: false })
  })

  it('passes through unsupported schema instances', () => {
    const model = createModelWithField('ObjectId')

    const query = buildDynamicQuery(model as never, {
      key: 'value',
      value: '507f1f77bcf86cd799439011'
    })

    expect(query).toEqual({
      value: '507f1f77bcf86cd799439011'
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
