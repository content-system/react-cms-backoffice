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

let roleService: RoleService | undefined

export function getRoleService(): RoleService {
  if (!roleService) {
    const c = storage.config()
    roleService = new RoleClient(httpRequest, c.role_url, c.privilege_url)
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
