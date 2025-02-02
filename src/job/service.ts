import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { JobClient, JobService } from "./job"

export * from "./job"
// axios.defaults.withCredentials = true;

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  job_url: string
}
let jobService: JobService | undefined

export function getJobService(): JobService {
  if (!jobService) {
    const c = storage.config()
    jobService = new JobClient(httpRequest, c.job_url)
  }
  return jobService
}
