import { HttpRequest } from "axios-core"
import { Client, json } from "web-clients"
import { Article, ArticleFilter, articleModel, ArticleService, History } from "./article"
export * from "./article"

export class ArticleClient extends Client<Article, string, ArticleFilter> implements ArticleService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, articleModel)
  }
  loadDraft(id: string): Promise<Article | null> {
    let url = `${this.serviceUrl}/${id}/draft`
    return this.http.get<Article>(url).then(obj => {
      if (!this._metamodel) {
        return obj;
      }
      return json(obj, this._metamodel);
    }).catch(err => {
      const data = (err && err.response) ? err.response : err;
      if (data && (data.status === 404 || data.status === 410)) {
        return Promise.resolve(null);
      }
      throw err;
    });
  }
  async getHistories(id: string, limit: number, nextPageToken?: string): Promise<History<Article>[]> {
    const s = nextPageToken ? `&historyId=${nextPageToken}` : ""
    let url = `${this.serviceUrl}/${id}/history?limit=${limit}${s}`
    const histories = await this.http.get<History<Article>[]>(url)
    for (const history of histories) {
      history.time = new Date(history.time)
      history.data = json(history.data, this._metamodel)
    }
    return histories
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
