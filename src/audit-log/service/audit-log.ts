import { Attributes, Filter, SearchResult, TimeRange } from "onecore"

export interface AuditLog {
  id: string
  resource: string
  userId: string
  ip: string
  action: string
  time: Date
  email: string
  status: string
  remark?: string
}
export interface AuditLogFilter extends Filter {
  id?: string
  resource?: string
  userId?: string
  ip?: string
  action?: string
  time?: TimeRange
  status?: string
}

export interface AuditLogService {
  search(filter: AuditLogFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<AuditLog>>
  load(id: string): Promise<AuditLog | null>
}

export const auditLogModel: Attributes = {
  id: {
    key: true,
    length: 40,
  },
  resource: {
    column: "resourceType",
    match: "equal",
  },
  userId: {
    required: true,
    length: 40,
    match: "equal",
  },
  ip: {},
  action: {
    match: "equal",
  },
  time: {
    type: "datetime",
  },
  status: {
    match: "equal",
    length: 1,
  },
  remark: {},
}
