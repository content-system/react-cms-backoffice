import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { Category, CategoryFilter, categoryModel, CategoryService } from "./category"

export * from "./category"

export class CategoryClient extends Client<Category, string, CategoryFilter> implements CategoryService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, categoryModel)
  }

  postOnly(s: CategoryFilter): boolean {
    return true
  }
}
