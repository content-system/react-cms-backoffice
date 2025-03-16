import { Attributes, Filter, Result, SearchResult, Service, TimeRange } from "onecore"

export interface Article {
  id: string
  title: string
  description?: string
  content: string
  thumbnail?: string
  publishedAt?: Date
  tags?: string[]
  type?: string
  authorId?: string
  status?: string
}

export interface ArticleFilter extends Filter {
  id?: string
  title?: string
  description?: string
  publishedAt?: TimeRange
  tags?: string[]
  status: string[]
}

export interface ArticleService extends Service<Article, string, ArticleFilter> {
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>>
  load(id: string): Promise<Article | null>
  create(article: Article): Promise<Result<Article>>
  update(article: Article): Promise<Result<Article>>
  patch(article: Partial<Article>): Promise<Result<Article>>
  delete(id: string): Promise<number>
}

export const articleModel: Attributes = {
  id: {
    key: true,
    length: 40,
    required: true,
  },
  title: {
    length: 255,
    required: true,
    q: true,
  },
  description: {
    length: 1200,
    required: true,
    q: true,
  },
  publishedAt: {
    column: "published_at",
    type: "datetime",
  },
  content: {
    length: 9000,
    required: true,
  },
  thumbnail: {},
  highThumbnail: {
    column: "high_thumbnail",
  },
  tags: {
    type: "strings",
  },
  /*
  author: {
    length: 40,
  },
  */
  type: {},
  status: {},
}
