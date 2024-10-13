import { Attributes, Filter, SearchService } from "onecore"

export interface UserFilter extends Filter {
  userId: string
  username: string
  email: string
  displayName: string
  status: string[]
}
export interface User {
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
}
export interface UserService extends SearchService<User, UserFilter> {
  getUsersByRole(id: string): Promise<User[]>
}

export const userModel: Attributes = {
  userId: {
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
    length: 100,
    required: true,
    q: true,
  },
  imageURL: {
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
    length: 40,
  },
  createdAt: {
    type: "datetime",
  },
  updatedBy: {
    length: 40,
  },
  updatedAt: {
    type: "datetime",
  },
}
