import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { MasterDataClient, MasterDataService } from "./master-data"
import { SettingsClient, SettingsService } from "./settings"

export * from "./settings"

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  settings_url: string
  master_data_url: string
}

let masterDataService: MasterDataService | undefined
export function getMasterDataService(): MasterDataService {
  if (!masterDataService) {
    const c = storage.config()
    masterDataService = new MasterDataClient(httpRequest, c.master_data_url)
  }
  return masterDataService
}

let settingsService: SettingsService | undefined
export function getSettingsService(): SettingsService {
  if (!settingsService) {
    const c = storage.config()
    settingsService = new SettingsClient(httpRequest, c.settings_url)
  }
  return settingsService
}

