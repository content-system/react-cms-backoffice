import { Attributes, Filter, Result, SearchResult, Service, Tracking } from "onecore"

export interface RoleFilter extends Filter {
  roleId: string
  roleName: string
  status: string[]
  remark: string
  description?: string
}
export interface Role extends Tracking {
  roleId: string
  roleName: string
  status: string
  remark: string
  privileges?: string[]
}
export interface Privilege {
  id: string
  name: string
  actions: number
  children?: Privilege[]
}

export interface RoleService extends Service<Role, string, RoleFilter> {
  getPrivileges(): Promise<Privilege[]>
  search(filter: RoleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Role>>
  load(id: string): Promise<Role | null>
  create(role: Role): Promise<Result<Role>>
  update(role: Role): Promise<Result<Role>>
  patch(role: Partial<Role>): Promise<Result<Role>>
  assign(roleId: string, users: string[]): Promise<number>
}

export const roleModel: Attributes = {
  roleId: {
    length: 40,
    key: true,
    q: true,
  },
  roleName: {
    column: "role_name",
    type: "string",
    length: 120,
    q: true,
  },
  remark: {
    length: 255,
    q: true,
  },
  status: {
    length: 1,
  },
  createdBy: {
    column: "created_by",
    length: 40,
  },
  createdAt: {
    column: "created_at",
    type: "datetime",
  },
  updatedBy: {
    column: "updated_by",
    length: 40,
  },
  updatedAt: {
    column: "updated_at",
    type: "datetime",
  },
  privileges: {
    type: "strings",
    ignored: true,
  },
}
