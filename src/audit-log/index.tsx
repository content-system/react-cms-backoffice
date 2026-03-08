import { Item } from "onecore"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import {
  addParametersIntoUrl,
  buildFromUrl,
  buildMessage,
  buildSortFilter,
  ButtonMouseEvent,
  datetimeToString,
  getFields,
  getOffset,
  mergeFilter,
  onPageChanged,
  onPageSizeChanged,
  onSearch,
  onSort,
  PageChange,
  pageSizes,
  resources,
  setSort,
  Sortable
} from "react-hook-core"
import Pagination from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { addDays, addSeconds, createDate, formatFullDateTime } from "ui-plus"
import { toast } from "ui-toast"
import { getDateFormat, handleError, useLocale, useResource } from "uione"
import { AuditLog, AuditLogFilter } from "./audit-log"
import { getAuditLogService } from "./service"
import "./style.css"

interface AuditLogSearch extends Sortable {
  statusList: Item[]
  total?: number
  view?: string
  fields?: string[]
}

const mapStyleStatus: Map<string, string> = new Map([
  ["success", "badge-outline-success"],
  ["fail", "badge-outline-danger "],
])

const sizes = pageSizes
export const AuditLogsForm = () => {
  const dateFormat = getDateFormat()

  const now = new Date()
  const auditLogfilter: AuditLogFilter = {
    limit: resources.defaultLimit,
    id: "",
    action: "",
    time: {
      min: addDays(now, -3),
      max: addSeconds(now, 300),
    },
  }
  const initialState: AuditLogSearch = {
    statusList: [],
  }

  const locale = useLocale()
  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<AuditLogSearch>(initialState)
  const [filter, setFilter] = useState<AuditLogFilter>(auditLogfilter)
  const [list, setList] = useState<AuditLog[]>([])

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<AuditLogFilter>(), filter, sizes, ["status", "auditLogType"])
    setSort(state, initFilter.sort)
    setFilter(initFilter)
    search(true) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sort = (e: ButtonMouseEvent) => onSort(e, search, state)
  const pageSizeChanged = (e: ChangeEvent<HTMLSelectElement>) => onPageSizeChanged(e, search, filter, setFilter)
  const pageChanged = (data: PageChange) => onPageChanged(data, search, filter, setFilter)
  const searchOnClick = (e: ButtonMouseEvent) => onSearch(e, search, filter, state, setFilter, setState)

  const search = (isFirstLoad?: boolean) => {
    showLoading()
    const urlFilter = buildSortFilter(filter, state)
    addParametersIntoUrl(urlFilter, isFirstLoad)
    const fields = getFields(refForm.current, state.fields)
    setFilter(filter)
    const { limit, page } = urlFilter
    getAuditLogService()
      .search({ ...filter }, limit, page, fields)
      .then((res) => {
        setState({ ...state, total: res.total, fields })
        setList(res.list)
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  const offset = getOffset(filter.limit, filter.page)
  return (
    <div>
      <header>
        <h2>{resource.audit_logs}</h2>
        <div className="btn-group float-left">
          {state.view === "list" && (
            <button type="button" id="btnTable" name="btnTable" className="btn-table" onClick={(e) => setState({ ...state, view: "table" })} />
          )}
          {state.view !== "list" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list" onClick={(e) => setState({ ...state, view: "list" })} />
          )}
        </div>
      </header>
      <div className="search-body">
        <form id="rolesForm" name="rolesForm" className="form" noValidate={true} ref={refForm}>
          <section className="row section">
            <label className="col s12 m2 l4">
              {resource.action}
              <input
                type="text"
                id="action"
                name="action"
                value={filter.action}
                maxLength={240}
                onChange={(e) => {
                  filter.action = e.target.value
                  setFilter({ ...filter })
                }}
              />
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
                onChange={(e) => {
                  filter.time.min = createDate(e.target.value)
                  setFilter({ ...filter })
                }}
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
                onChange={(e) => {
                  filter.time.max = createDate(e.target.value)
                  setFilter({ ...filter })
                }}
              />
            </label>
          </section>
          <section className="section search">
            <label>
              {resource.page_size}
              <select id="limit" name="limit" onChange={pageSizeChanged} defaultValue={filter.limit}>
                {sizes.map((item, i) => {
                  return (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  )
                })}
              </select>
            </label>
            <button type="submit" className="btn-search" onClick={searchOnClick}>
              {resource.search}
            </button>
          </section>
        </form>
        <form className="list-result">
          {state.view !== "list" && (
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
                  {list.map((item: any, i: number) => {
                    return (
                      <tr key={i}>
                        <td className="text-right">{offset + i + 1}</td>
                        <td>{formatFullDateTime(item.time, dateFormat, locale.decimalSeparator)}</td>
                        <td>{item.resource}</td>
                        <td>{item.action}</td>
                        <td>
                          <span className={"badge badge-sm " + mapStyleStatus.get(item.status)}>{item.status || ""}</span>
                        </td>
                        <td>{item.userId}</td>
                        <td>{item.ip}</td>
                        <td>{item.remark}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {state.view === "list" && (
            <ul className="row list">
              {list.map((item, i) => {
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
          <Pagination className="col s12 m6" total={state.total} size={filter.limit} max={7} page={filter.page} onChange={pageChanged} />
        </form>
      </div>
    </div>
  )
}
