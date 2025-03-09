import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { CategoryClient, CategoryService } from "./category"

export * from "./category"
// axios.defaults.withCredentials = true;

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  category_url: string
}
let categoryService: CategoryService | undefined

export function getCategoryService(): CategoryService {
  if (!categoryService) {
    const c = storage.config()
    categoryService = new CategoryClient(httpRequest, c.category_url)
  }
  return categoryService
}
