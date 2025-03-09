import { HttpRequest } from "axios-core"
import { Result } from "onecore"
import { SearchWebClient } from "web-clients"
import { Content, ContentFilter, contentModel, ContentService } from "./content"

export * from "./content"

export class ContentClient extends SearchWebClient<Content, ContentFilter> implements ContentService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, contentModel)
  }
  postOnly(s: ContentFilter): boolean {
    return true
  }

  load(id: string, lang: string): Promise<Content | null> {
    const url = `${this.serviceUrl}/${id}/${lang}`
    return this.http
      .get<Content>(url)
      .then((content) => {
        return content
      })
      .catch((err) => {
        const data = err && err.response ? err.response : err
        if (data.status === 404 || data.status === 410) {
          return Promise.resolve(null)
        } else {
          throw err
        }
      })
  }
  create(obj: Content): Promise<Result<Content>> {
    const url = `${this.serviceUrl}`
    return this.http
      .post<Content>(url, obj)
      .then((res) => {
        return res
      })
      .catch((err) => {
        const data = err && err.response ? err.response : err
        if (data.status === 409) {
          return Promise.resolve(0)
        } else if (data.status === 422) {
          return Promise.resolve(data.data)
        } else {
          throw err
        }
      })
  }
  update(obj: Content): Promise<Result<Content>> {
    const url = `${this.serviceUrl}/${obj.id}/${obj.lang}`
    return this.http
      .put<Content>(url, obj)
      .then((res) => {
        return res
      })
      .catch((err) => {
        const data = err && err.response ? err.response : err
        if (data.status === 404 || data.status === 410) {
          return Promise.resolve(0)
        } else if (data.status === 409) {
          return Promise.resolve(-1)
        } else if (data.status === 422) {
          return Promise.resolve(data.data)
        } else {
          throw err
        }
      })
  }
  patch(obj: Partial<Content>): Promise<Result<Content>> {
    const url = `${this.serviceUrl}/${obj.id}/${obj.lang}`
    return this.http
      .patch<Content>(url, obj)
      .then((res) => {
        return res
      })
      .catch((err) => {
        const data = err && err.response ? err.response : err
        if (data.status === 404 || data.status === 410) {
          return Promise.resolve(0)
        } else if (data.status === 409) {
          return Promise.resolve(-1)
        } else if (data.status === 422) {
          return Promise.resolve(data.data)
        } else {
          throw err
        }
      })
  }
  delete(id: string, lang: string): Promise<number> {
    const url = `${this.serviceUrl}/${id}/${lang}`
    return this.http
      .delete<number>(url)
      .then((res) => {
        return res
      })
      .catch((err) => {
        const data = err && err.response ? err.response : err
        if (data.status === 404 || data.status === 410) {
          return Promise.resolve(0)
        } else {
          throw err
        }
      })
  }
}
