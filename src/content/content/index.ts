import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { Content, ContentFilter, contentModel, ContentService } from "./content"

export * from "./content"

export class ContentClient extends Client<Content, string, ContentFilter> implements ContentService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, contentModel)
  }

  postOnly(s: ContentFilter): boolean {
    return true
  }
}
