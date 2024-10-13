import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { MasterDataClient, MasterDataService } from "./master-data"
import { RoleClient, RoleService, UserClient, UserService } from "./user"

export * from "./user"
// axios.defaults.withCredentials = true;

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  user_url: string
  role_url: string
}
class ApplicationContext {
  masterDataService?: MasterDataService
  userService?: UserService
  roleService?: RoleService
  constructor() {
    this.getConfig = this.getConfig.bind(this)
    this.getMasterDataService = this.getMasterDataService.bind(this)
    this.getUserService = this.getUserService.bind(this)
    this.getRoleService = this.getRoleService.bind(this)
  }
  getConfig(): Config {
    return storage.config()
  }
  getMasterDataService(): MasterDataService {
    if (!this.masterDataService) {
      this.masterDataService = new MasterDataClient()
    }
    return this.masterDataService
  }
  getUserService(): UserService {
    if (!this.userService) {
      const c = this.getConfig()
      this.userService = new UserClient(httpRequest, c.user_url)
    }
    return this.userService
  }
  getRoleService(): RoleService {
    if (!this.roleService) {
      const c = this.getConfig()
      this.roleService = new RoleClient(httpRequest, c.role_url)
    }
    return this.roleService
  }
}

export const context = new ApplicationContext()
export const getUserService = context.getUserService
export const getMasterData = context.getMasterDataService
export const getRoleService = context.getRoleService
