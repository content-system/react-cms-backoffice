import { Attributes, Filter, Repository, Service } from "onecore"

export interface Category {
  id: string
  name: string
  resource: string
  path?: string
  icon: string
  sequence: number
  parent: string
  type: string
  status: string
}

export interface CategoryFilter extends Filter {
  id?: string
  name?: string
  resource?: string
  path?: string
  icon?: string
  sequence?: number
  type?: string
  status: string[]
}

export interface CategoryRepository extends Repository<Category, string> {}
export interface CategoryService extends Service<Category, string, CategoryFilter> {}

export const categoryModel: Attributes = {
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
