import { Attributes, Filter, Repository, Service, TimeRange } from "onecore"

export interface Job {
  id: string
  title?: string
  description?: string
  requirements?: string
  benefit?: string
  publishedAt?: Date
  expiredAt?: Date
  skills?: string[]
  position?: string
  quantity?: number
  location?: string
  applicantCount?: number
  companyId?: string
  status: string
}
export interface JobFilter extends Filter {
  id?: string
  title?: string
  description?: string
  requirements?: string
  benefit?: string
  publishedAt?: TimeRange
  expiredAt?: TimeRange
  skills?: string[]
  position?: string
  quantity?: number
  location?: string
  applicantCount?: number
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
    length: 120,
    q: true,
  },
  description: {
    length: 1000,
  },
  requirements: {
    length: 1000,
  },
  benefit: {
    length: 1000,
  },
  publishedAt: {
    column: "published_at",
    type: "datetime",
  },
  expiredAt: {
    column: "expired_at",
    type: "datetime",
  },
  skills: {
    type: "strings",
  },
  location: {
    length: 120,
  },
  quantity: {
    type: "integer",
  },
  applicantCount: {
    column: "applicant_count",
    type: "integer",
  },
}
