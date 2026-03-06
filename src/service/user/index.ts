import { HttpRequest } from "axios-core"
import { SearchClient } from "web-clients"
import { User, UserFilter, userModel, UserService } from "./user"

export * from "./user"

export class UserClient extends SearchClient<User, string, UserFilter> implements UserService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, userModel)
    this.searchGet = true
    this.getUsersByRole = this.getUsersByRole.bind(this)
  }
  getUsersByRole(id: string): Promise<User[]> {
    const url = `${this.serviceUrl}?roleId=${id}`
    return this.http.get<User[]>(url)
  }
  protected postOnly(filter: UserFilter): boolean {
    if (filter.excluding && filter.excluding.length > 0) {
      return true
    }
    return false;
  }
}
