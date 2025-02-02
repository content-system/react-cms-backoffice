import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { ArticleClient, ArticleService } from "./article"

export * from "./article"
// axios.defaults.withCredentials = true;

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  article_url: string
}
let articleService: ArticleService | undefined

export function getArticleService(): ArticleService {
  if (!articleService) {
    const c = storage.config()
    articleService = new ArticleClient(httpRequest, c.article_url)
  }
  return articleService
}
