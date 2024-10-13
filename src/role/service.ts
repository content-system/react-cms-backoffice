import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { UserClient, UserService } from "../service/user"
import { RoleClient, RoleService } from "./role"

export * from "../service/user"
export * from "./role"

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  user_url: string
  role_url: string
  privilege_url: string
}
class ApplicationContext {
  roleService?: RoleClient
  userService?: UserService
  constructor() {
    this.getConfig = this.getConfig.bind(this)
    this.getRoleService = this.getRoleService.bind(this)
    this.getUserService = this.getUserService.bind(this)
  }
  getConfig(): Config {
    return storage.config()
  }
  getRoleService(): RoleService {
    if (!this.roleService) {
      const c = this.getConfig()
      this.roleService = new RoleClient(httpRequest, c.role_url, c.privilege_url)
    }
    return this.roleService
  }
  getUserService(): UserService {
    if (!this.userService) {
      const c = this.getConfig()
      this.userService = new UserClient(httpRequest, c.user_url)
    }
    return this.userService
  }
}

export const context = new ApplicationContext()
export const getRoleService = context.getRoleService
export const getUserService = context.getUserService
