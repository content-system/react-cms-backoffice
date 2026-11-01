import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { type Job, type JobFilter, jobModel, type JobService } from "./job"

export * from "./job"

export class JobClient extends Client<Job, string, JobFilter> implements JobService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, jobModel)
    this.searchGet = true
  }
}
