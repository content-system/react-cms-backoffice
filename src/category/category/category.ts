import { Attributes, Filter, Result, SearchResult, Service } from "onecore"

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
  version?: number
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

export interface CategoryService extends Service<Category, string, CategoryFilter> {
  search(filter: CategoryFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Category>>
  load(id: string): Promise<Category | null>
  create(category: Category): Promise<Result<Category>>
  update(category: Category): Promise<Result<Category>>
  patch(category: Partial<Category>): Promise<Result<Category>>
}

export const categoryModel: Attributes = {
  id: {
    key: true,
    length: 40,
    required: true,
  },
  name: {
    length: 120,
    required: true,
    q: true,
  },
  status: {},
  path: {
    length: 1200,
    required: true,
    q: true,
  },
  resource: {
    column: "resource_key",
    length: 255,
  },
  icon: {
    length: 255,
    required: true,
  },
  sequence: {
    type: "integer",
  },
  type: {},
  parent: {
    length: 40,
  },
  version: {
    type: "integer",
    version: true,
  },
}
