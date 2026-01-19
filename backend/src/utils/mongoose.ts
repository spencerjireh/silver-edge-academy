import type { SchemaOptions } from 'mongoose'

export const toJSONOptions: SchemaOptions['toJSON'] = {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id)
    ret._id = undefined
    ret.__v = undefined
    return ret
  },
}

export const toJSONOptionsWithoutPassword: SchemaOptions['toJSON'] = {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id)
    ret._id = undefined
    ret.__v = undefined
    ret.passwordHash = undefined
    return ret
  },
}
