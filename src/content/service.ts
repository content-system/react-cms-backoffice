import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { ContentClient, ContentService } from "./content"

export * from "./content"
// axios.defaults.withCredentials = true;

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  content_url: string
}
let contentService: ContentService | undefined

export function getContentService(): ContentService {
  if (!contentService) {
    const c = storage.config()
    contentService = new ContentClient(httpRequest, c.content_url)
  }
  return contentService
}
