import { AuthenClient, AuthenService, OAuth2Client, OAuth2Service, User } from "authen-client"
import axios from "axios"
import { HttpRequest } from "axios-core"
import { PasswordClient, PasswordService } from "password-client"
import { Signup, SignupClient, SignupService } from "signup-client"
import { storage } from "uione"
// axios.defaults.withCredentials = true;

export interface Config {
  authentication_url: string
  signup_url: string
  password_url: string
  oauth2_url: string
  public_privilege_url: string
}
const httpRequest = new HttpRequest(axios)
class ApplicationContext {
  private signupService?: SignupService<Signup>
  private authenticator?: AuthenClient<User>
  private passwordService?: PasswordService
  private oauth2Service?: OAuth2Service
  constructor() {
    this.getConfig = this.getConfig.bind(this)
    this.getSignupService = this.getSignupService.bind(this)
    this.getAuthenticator = this.getAuthenticator.bind(this)
    this.getPasswordService = this.getPasswordService.bind(this)
    this.getOAuth2Service = this.getOAuth2Service.bind(this)
  }
  getConfig(): Config {
    return storage.config()
  }
  getSignupService(): SignupService<Signup> {
    if (!this.signupService) {
      const c = this.getConfig()
      this.signupService = new SignupClient<Signup>(httpRequest, c.signup_url + "/signup", c.signup_url)
    }
    return this.signupService
  }
  getAuthenticator(): AuthenService<User> {
    if (!this.authenticator) {
      const c = this.getConfig()
      this.authenticator = new AuthenClient<User>(httpRequest, c.authentication_url + "/authenticate")
    }
    return this.authenticator
  }
  getPasswordService(): PasswordService {
    if (!this.passwordService) {
      const c = this.getConfig()
      this.passwordService = new PasswordClient(httpRequest, c.password_url)
    }
    return this.passwordService
  }
  getOAuth2Service(): OAuth2Service {
    if (!this.oauth2Service) {
      const c = this.getConfig()
      this.oauth2Service = new OAuth2Client(httpRequest, c.oauth2_url + "/authenticate", c.oauth2_url + "/configurations")
    }
    return this.oauth2Service
  }
}

export const context = new ApplicationContext()
export function getAuthen(): AuthenService<User> {
  return context.getAuthenticator()
}
export function getPasswordService(): PasswordService {
  return context.getPasswordService()
}
export function getOAuth2Service(): OAuth2Service {
  return context.getOAuth2Service()
}
export function getSignupService(): SignupService<Signup> {
  return context.getSignupService()
}
