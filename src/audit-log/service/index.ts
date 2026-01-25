import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { ViewSearchClient } from "web-clients"
import { AuditLog, AuditLogFilter, auditLogModel, AuditLogService } from "./audit-log"

export * from "./audit-log"

export class AuditLogClient extends ViewSearchClient<AuditLog, string, AuditLogFilter> implements AuditLogService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, auditLogModel)
  }
  postOnly(s: AuditLogFilter): boolean {
    return true
  }
}

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  audit_log_url: string
}

let auditLogService: AuditLogService | undefined

export function getAuditLogService(): AuditLogService {
  if (!auditLogService) {
    const c = storage.config()
    auditLogService = new AuditLogClient(httpRequest, c.audit_log_url)
  }
  return auditLogService
}
