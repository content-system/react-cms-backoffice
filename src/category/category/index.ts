import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { type Category, type CategoryFilter, categoryModel, type CategoryService } from "./category"

export * from "./category"

export class CategoryClient extends Client<Category, string, CategoryFilter> implements CategoryService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, categoryModel)
    this.searchGet = true
  }
}
