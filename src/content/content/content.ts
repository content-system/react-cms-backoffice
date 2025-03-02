import { Attributes, Filter, Repository, Service, TimeRange } from "onecore"

export interface Content {
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

export interface ContentFilter extends Filter {
  id?: string
  title?: string
  description?: string
  publishedAt?: TimeRange
  tags?: string[]
  status: string[]
}

export interface ContentRepository extends Repository<Content, string> {}
export interface ContentService extends Service<Content, string, ContentFilter> {}

export const contentModel: Attributes = {
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
