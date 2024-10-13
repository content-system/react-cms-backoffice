import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { MasterDataClient, MasterDataService } from "./master-data"
import { SettingsClient } from "./settings"

export * from "./settings"

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  settings_url: string
  master_data_url: string
}

class ApplicationContext {
  private settingsService?: SettingsClient
  private masterDataService?: MasterDataClient
  constructor() {
    this.getConfig = this.getConfig.bind(this)
    this.getSettingsService = this.getSettingsService.bind(this)
    this.getMasterDataService = this.getMasterDataService.bind(this)
  }
  getConfig(): Config {
    return storage.config()
  }
  getSettingsService(): SettingsClient {
    if (!this.settingsService) {
      const c = this.getConfig()
      this.settingsService = new SettingsClient(httpRequest, c.settings_url)
    }
    return this.settingsService
  }
  getMasterDataService(): MasterDataService {
    if (!this.masterDataService) {
      const c = this.getConfig()
      this.masterDataService = new MasterDataClient(httpRequest, c.master_data_url)
    }
    return this.masterDataService
  }
}

export const context = new ApplicationContext()
export const getSettingsService = context.getSettingsService
export const getMasterDataService = context.getMasterDataService
