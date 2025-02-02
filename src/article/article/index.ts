import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { Article, ArticleFilter, articleModel, ArticleService } from "./article"

export * from "./article"

export class ArticleClient extends Client<Article, string, ArticleFilter> implements ArticleService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, articleModel)
  }

  postOnly(s: ArticleFilter): boolean {
    return true
  }
}
