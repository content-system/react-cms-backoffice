import type { HttpRequest, Item } from "onecore"

export interface MasterDataService {
  getLanguages(): Promise<Item[]>
  getDateFormats(): Promise<Item[]>
}
export class MasterDataClient implements MasterDataService {
  protected http: HttpRequest
  protected url: string
  constructor(http: HttpRequest, url: string) {
    this.http = http
    this.url = url
    this.getMasterData = this.getMasterData.bind(this)
    this.getLanguages = this.getLanguages.bind(this)
    this.getDateFormats = this.getDateFormats.bind(this)
  }
  protected getMasterData(code: string): Promise<Item[]> {
    return this.http.get<Item[]>(`${this.url}/${code}`)
  }
  getLanguages(): Promise<Item[]> {
    return this.getMasterData("language")
  }
  getDateFormats(): Promise<Item[]> {
    return this.getMasterData("date_format")
  }
}
