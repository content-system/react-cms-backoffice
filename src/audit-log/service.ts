import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { AuditLogClient, AuditLogService } from "./audit-log"

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
