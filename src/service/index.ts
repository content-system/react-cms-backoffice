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

let userService: UserService | undefined
export function getUserService(): UserService {
  if (!userService) {
    const c = storage.config()
    userService = new UserClient(httpRequest, c.user_url)
  }
  return userService
}
