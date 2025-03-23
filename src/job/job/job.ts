import { Attributes, Filter, Result, SearchResult, Service, TimeRange } from "onecore"

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
  publishedAt: TimeRange
  expiredAt?: TimeRange
  position?: string
  quantity?: number
  location?: string
  applicantCount?: number
  skills?: string[]
  companyId?: string
  status: string[]
}

export interface JobService extends Service<Job, string, JobFilter> {
  search(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>>
  load(id: string): Promise<Job | null>
  create(job: Job): Promise<Result<Job>>
  update(job: Job): Promise<Result<Job>>
  patch(job: Partial<Job>): Promise<Result<Job>>
  delete(id: string): Promise<number>
}

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
