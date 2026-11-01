import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { type User, type UserFilter, userModel, type UserService } from "./user"

export * from "./user"

export class UserClient extends Client<User, string, UserFilter> implements UserService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, userModel)
    this.searchGet = true
    this.getUsersByRole = this.getUsersByRole.bind(this)
  }
  getUsersByRole(id: string): Promise<User[]> {
    const url = `${this.serviceUrl}?roleId=${id}`
    return this.http.get<User[]>(url)
  }
}

export interface Role {
  roleId: string
  roleName: string
  status: string
  remark: string
}
export interface RoleService {
  all(): Promise<Role[]>
}
export class RoleClient implements RoleService {
  protected http: HttpRequest
  protected url: string
  constructor(http: HttpRequest, url: string) {
    this.http = http
    this.url = url
    this.all = this.all.bind(this)
  }
  all(): Promise<Role[]> {
    return this.http.get<Role[]>(this.url)
  }
}
