import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { Job, JobFilter, jobModel, JobService } from "./job"

export * from "./job"

export class JobClient extends Client<Job, string, JobFilter> implements JobService {
  constructor(http: HttpRequest, private url: string) {
    super(http, url, jobModel)
    this.searchGet = false
    // this.getJobs = this.getJobs.bind(this);
  }
  // getJobs(id: string): Promise<Job[]> {
  //   console.log(id)
  //   const url = this.url + "/" + id
  //   return this.http.get<Job[]>(url);
  // }
  postOnly(s: JobFilter): boolean {
    return true
  }
}
