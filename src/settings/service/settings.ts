import type { HttpRequest } from "onecore"

export interface Settings {
  language: string
  dateFormat: string
}

export interface SettingsService {
  save(settings: Settings): Promise<number>
}

export class SettingsClient implements SettingsService {
  protected http: HttpRequest
  protected url: string
  constructor(http: HttpRequest, url: string) {
    this.http = http
    this.url = url
    this.save = this.save.bind(this)
  }
  save(settings: Settings): Promise<number> {
    return this.http.patch<number>(this.url, settings)
  }
}
