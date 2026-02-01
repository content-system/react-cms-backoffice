import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { Article, ArticleFilter, articleModel, ArticleService } from "./article"
export * from "./article"

export class ArticleClient extends Client<Article, string, ArticleFilter> implements ArticleService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, articleModel)
  }
  approve(id: string): Promise<number> {
    let url = `${this.serviceUrl}/${id}/approve`
    return this.http
      .patch<number>(url, undefined)
      .then((r) => r)
      .catch((err) => {
        if (err) {
          const data = err && err.response ? err.response : err
          if (data.status === 404 || data.status === 410) {
            return Promise.resolve(0)
          } else if (data.status === 409) {
            return Promise.resolve(data.data)
          } else {
            throw err
          }
        }
      })
  }
  reject(id: string): Promise<number> {
    let url = `${this.serviceUrl}/${id}/reject`
    return this.http
      .patch<number>(url, undefined)
      .then((r) => r)
      .catch((err) => {
        if (err) {
          const data = err && err.response ? err.response : err
          if (data.status === 404 || data.status === 410) {
            return Promise.resolve(0)
          } else if (data.status === 409) {
            return Promise.resolve(data.data)
          } else {
            throw err
          }
        }
      })
  }
}
