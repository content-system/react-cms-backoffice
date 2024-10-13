import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { UserClient, UserService } from "./user"

export * from "./user"
// axios.defaults.withCredentials = true;

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  user_url: string
}
class ApplicationContext {
  userService?: UserService
  constructor() {
    this.getConfig = this.getConfig.bind(this)
    this.getUserService = this.getUserService.bind(this)
  }
  getConfig(): Config {
    return storage.config()
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
export function getUserService(): UserService {
  return context.getUserService()
}
