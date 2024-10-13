import { HttpRequest } from "onecore"

export interface Settings {
  language: string
  dateFormat: string
}

export interface SettingsService {
  save(settings: Settings): Promise<number>
}

export class SettingsClient implements SettingsService {
  constructor(protected http: HttpRequest, protected url: string) {
    this.save = this.save.bind(this)
  }
  save(settings: Settings): Promise<number> {
    return this.http.patch<number>(this.url, settings)
  }
}
