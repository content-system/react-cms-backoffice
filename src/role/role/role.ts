import { Attributes, Filter, Service, Tracking } from "onecore"

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
  assign(roleId: string, users: string[]): Promise<number>
}

export const roleModel: Attributes = {
  roleId: {
    length: 40,
    key: true,
    q: true,
  },
  roleName: {
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
    length: 40,
  },
  createdAt: {
    type: "datetime",
  },
  updatedBy: {
    length: 40,
  },
  updatedAt: {
    type: "datetime",
  },
}
