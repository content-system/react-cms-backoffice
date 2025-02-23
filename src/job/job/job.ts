import { Attributes, Filter, Repository, Service, TimeRange } from "onecore"

export interface Job {
  id: string
  title: string
  description: string
  publishedAt?: Date
  expiredAt?: Date
  position?: string
  quantity?: number
  location?: string
  applicantCount?: number
  skills?: string[]
  minSalary?: number
  maxSalary?: number
  companyId?: string
  status: string
}
export interface JobFilter extends Filter {
  id?: string
  title?: string
  description?: string
  publishedAt?: TimeRange
  expiredAt?: TimeRange
  position?: string
  quantity?: number
  location?: string
  applicantCount?: number
  skills?: string[]
  companyId?: string
  status: string[]
}

export interface JobRepository extends Repository<Job, string> {}
export interface JobService extends Service<Job, string, JobFilter> {}

export const jobModel: Attributes = {
  id: {
    length: 40,
    required: true,
    key: true,
  },
  title: {
    length: 300,
    q: true,
  },
  description: {
    length: 9800,
  },
  publishedAt: {
    column: "published_at",
    type: "datetime",
  },
  expiredAt: {
    column: "expired_at",
    type: "datetime",
  },
  position: {
    length: 100,
  },
  quantity: {
    type: "integer",
    min: 1,
  },
  location: {
    length: 120,
  },
  applicantCount: {
    column: "applicant_count",
    type: "integer",
  },
  skills: {
    type: "strings",
  },
  minSalary: {
    type: "integer",
  },
  maxSalary: {
    type: "integer",
  },
}
