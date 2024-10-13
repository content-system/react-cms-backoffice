import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { ViewSearchClient } from "web-clients"
import { AuditLog, AuditLogFilter, auditLogModel, AuditLogService } from "./audit-log"

export * from "./audit-log"

export class AuditClient extends ViewSearchClient<AuditLog, string, AuditLogFilter> implements AuditLogService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, auditLogModel)
  }
  postOnly(s: AuditLogFilter): boolean {
    return true
  }
}

// axios.defaults.withCredentials = true;
const httpRequest = new HttpRequest(axios, options)
export interface Config {
  audit_log_url: string
}
class ApplicationContext {
  private auditService?: AuditClient
  constructor() {
    this.getConfig = this.getConfig.bind(this)
    this.getAuditService = this.getAuditService.bind(this)
  }
  getConfig(): Config {
    return storage.config()
  }
  getAuditService(): AuditClient {
    if (!this.auditService) {
      const c = this.getConfig()
      this.auditService = new AuditClient(httpRequest, c.audit_log_url)
    }
    return this.auditService
  }
}

export const context = new ApplicationContext()
export const useAuditLog = context.getAuditService
