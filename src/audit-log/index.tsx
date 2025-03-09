import { Item } from "onecore"
import { useEffect, useRef } from "react"
import { datetimeToString, PageSizeSelect, SearchComponentState, useSearch, value } from "react-hook-core"
import Pagination from "reactx-pagination"
import { addDays, addSeconds, formatFullDateTime } from "ui-plus"
import { getDateFormat, inputSearch, useLocale } from "uione"
import { AuditLog, AuditLogFilter, useAuditLog } from "./service"
import "./style.css"

interface AuditLogSearch extends SearchComponentState<AuditLog, AuditLogFilter> {
  statusList: Item[]
}

const now = new Date()

const auditLogfilter: AuditLogFilter = {
  limit: 24,
  id: "",
  action: "",
  time: {
    min: addDays(now, -3),
    max: addSeconds(now, 300),
  },
}

const AuditSearch: AuditLogSearch = {
  limit: 24,
  statusList: [],
  list: [],
  filter: auditLogfilter,
}

const mapStyleStatus: Map<string, string> = new Map([
  ["success", "badge-outline-success"],
  ["fail", "badge-outline-danger "],
])

export const AuditLogsForm = () => {
  const dateFormat = getDateFormat().toUpperCase()
  const locale = useLocale()
  const refForm = useRef()
  const hooks = useSearch<AuditLog, AuditLogFilter, AuditLogSearch>(refForm, AuditSearch, useAuditLog(), inputSearch())
  const { state, resource, component, updateState, pageSizeChanged, pageChanged, changeView, search, sort } = hooks
  useEffect(() => {
    search() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const filter = value(state.filter)
  return (
    <div>
      <header>
        <h2>{resource.audit_logs}</h2>
        <div className="btn-group float-left">
          {component.view !== "table" && <button type="button" id="btnTable" name="btnTable" className="btn-table" data-view="table" onClick={changeView} />}
          {component.view === "table" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list" data-view="listview" onClick={changeView} />
          )}
        </div>
      </header>
      <div>
        <form id="rolesForm" name="rolesForm" className="form" noValidate={true} ref={refForm as any}>
          <section className="row section">
            <label className="col s12 m2 l4">
              {resource.action}
              <input type="text" id="action" name="action" value={filter.action} onChange={updateState} maxLength={240} />
            </label>
            <label className="col s12 m5 l4">
              {resource.audit_log_time_from}
              <input
                type="datetime-local"
                step=".010"
                id="time_min"
                name="time_min"
                data-field="time.min"
                value={datetimeToString(filter.time?.min)}
                onChange={updateState}
              />
            </label>
            <label className="col s12 m5 l4">
              {resource.audit_log_time_to}
              <input
                type="datetime-local"
                step=".010"
                id="time_max"
                name="time_max"
                data-field="time.max"
                value={datetimeToString(filter.time?.max)}
                onChange={updateState}
              />
            </label>
          </section>
          <section className="section search">
            <label>
              {resource.page_size}
              <PageSizeSelect size={component.limit} sizes={component.pageSizes} onChange={pageSizeChanged} />
            </label>
            <button type="submit" className="btn-search" onClick={hooks.search}>
              {resource.search}
            </button>
          </section>
        </form>
        <form className="list-result">
          {component.view === "table" && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{resource.number}</th>
                    <th data-field="time">
                      <button type="button" id="sortTime" onClick={sort}>
                        {resource.audit_log_time}
                      </button>
                    </th>
                    <th data-field="resource">
                      <button type="button" id="sortResource" onClick={sort}>
                        {resource.resource}
                      </button>
                    </th>
                    <th data-field="action">
                      <button type="button" id="sortAction" onClick={sort}>
                        {resource.action}
                      </button>
                    </th>
                    <th data-field="status">
                      <button type="button" id="sortStatus" onClick={sort}>
                        {resource.status}
                      </button>
                    </th>
                    <th data-field="userId">{resource.audit_log_user}</th>
                    <th data-field="ip">
                      <button type="button" id="sortIp" onClick={sort}>
                        {resource.ip}
                      </button>
                    </th>
                    <th data-field="remark">
                      <button type="button" id="sortRemark" onClick={sort}>
                        {resource.remark}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {state.list &&
                    state.list.length > 0 &&
                    state.list.map((item: any, i: number) => {
                      return (
                        <tr key={i}>
                          <td className="text-right">{(item as any).sequenceNo}</td>
                          <td>{formatFullDateTime(item.time, dateFormat, locale.decimalSeparator)}</td>
                          <td>{item.resource}</td>
                          <td>{item.action}</td>
                          <td>
                            <span className={"badge badge-sm " + mapStyleStatus.get(item.status)}>{item.status || ""}</span>
                          </td>
                          <td>{item.email}</td>
                          <td>{item.ip}</td>
                          <td>{item.remark}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
          {component.view !== "table" && (
            <ul className="row list">
              {state.list &&
                state.list.length > 0 &&
                state.list.map((item, i) => {
                  return (
                    <li key={i} className="col s12 m6 l4 xl3 list-item">
                      <h4>{item.email}</h4>
                      <p className="space-between">
                        {item.resource} <span>{item.action}</span>
                      </p>
                      <p>{item.remark}</p>
                      <p>
                        {formatFullDateTime(item.time, dateFormat, locale.decimalSeparator)}{" "}
                        <span className={"badge badge-sm " + mapStyleStatus.get(item.status)}>{item.status || ""}</span>
                      </p>
                    </li>
                  )
                })}
            </ul>
          )}
          <Pagination
            className="col s12 m6"
            total={component.total}
            size={component.limit}
            max={component.pageMaxSize}
            page={component.page}
            onChange={pageChanged}
          />
        </form>
      </div>
    </div>
  )
}
