import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { Privilege, Role, RoleFilter, roleModel, RoleService } from "./role"

export * from "./role"

export class RoleClient extends Client<Role, string, RoleFilter> implements RoleService {
  constructor(http: HttpRequest, url: string, protected privilegeUrl: string) {
    super(http, url, roleModel)
    this.searchGet = true
    this.assign = this.assign.bind(this)
    this.getPrivileges = this.getPrivileges.bind(this)
  }
  assign(roleId: string, users: string[]): Promise<number> {
    return this.http.put<number>(`${this.serviceUrl}/${roleId}/assign`, users)
  }
  getPrivileges(): Promise<Privilege[]> {
    return this.http.get<Privilege[]>(this.privilegeUrl)
  }
}
