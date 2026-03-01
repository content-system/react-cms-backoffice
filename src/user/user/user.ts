import { Attributes, Filter, Result, SearchResult, Tracking } from "onecore"

export interface UserFilter extends Filter {
  userId?: string
  username: string
  email?: string
  displayName: string
  status: string[]
}
export interface User extends Tracking {
  userId: string
  username: string
  email: string
  displayName: string
  imageURL?: string
  status: string
  gender?: string
  phone?: string
  title?: string
  position?: string
  roles?: string[]
}

export interface UserService {
  search(filter: UserFilter, limit: number, page?: number | string, fields?: string[], ctx?: any): Promise<SearchResult<User>>
  load(id: string): Promise<User | null>
  create(user: User): Promise<Result<User>>
  update(user: User): Promise<Result<User>>
  patch(user: Partial<User>): Promise<Result<User>>
  delete(id: string): Promise<number>
  getUsersByRole(roleId: string): Promise<User[]>
}

export const userModel: Attributes = {
  userId: {
    column: "user_id",
    length: 40,
    required: true,
    key: true,
  },
  username: {
    length: 100,
    required: true,
    q: true,
  },
  displayName: {
    column: "display_name",
    length: 100,
    required: true,
    q: true,
  },
  imageURL: {
    column: "image_url",
    length: 255,
  },
  gender: {
    length: 10,
  },
  title: {
    length: 20,
    q: true,
  },
  position: {
    length: 20,
  },
  phone: {
    format: "phone",
    length: 14,
  },
  email: {
    length: 100,
    q: true,
  },
  status: {
    length: 1,
  },
  createdBy: {
    column: "created_by",
    length: 40,
  },
  createdAt: {
    column: "created_at",
    type: "datetime",
  },
  updatedBy: {
    column: "updated_by",
    length: 40,
  },
  updatedAt: {
    column: "updated_at",
    type: "datetime",
  },
}
