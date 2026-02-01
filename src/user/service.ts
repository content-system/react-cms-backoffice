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

let masterDataService: MasterDataService | undefined
export function getMasterDataService(): MasterDataService {
  if (!masterDataService) {
    masterDataService = new MasterDataClient()
  }
  return masterDataService
}

let roleService: RoleService | undefined
export function getRoleService(): RoleService {
  if (!roleService) {
    const c = storage.config()
    roleService = new RoleClient(httpRequest, c.role_url)
  }
  return roleService
}

let userService: UserService | undefined
export function getUserService(): UserService {
  if (!userService) {
    const c = storage.config()
    userService = new UserClient(httpRequest, c.user_url)
  }
  return userService
}
