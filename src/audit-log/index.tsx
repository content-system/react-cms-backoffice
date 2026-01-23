import { Item } from "onecore"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import {
  addParametersIntoUrl,
  buildFromUrl,
  buildMessage,
  buildSortFilter,
  datetimeToString,
  getFields,
  getNumber,
  getOffset,
  getSortElement,
  handleSort,
  mergeFilter,
  PageChange,
  pageSizes,
  PageSizeSelect,
  removeSortStatus,
  setSort,
  Sortable,
  value,
} from "react-hook-core"
import Pagination from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { addDays, addSeconds, createDate, formatFullDateTime } from "ui-plus"
import { toast } from "ui-toast"
import { getDateFormat, handleError, useLocale, useResource } from "uione"
import { AuditLog, AuditLogFilter, getAuditService } from "./service"
import "./style.css"

interface AuditLogSearch extends Sortable {
  statusList: Item[]
  filter: AuditLogFilter
  list: AuditLog[]
  total?: number
  view?: string
  hideFilter?: boolean
  fields?: string[]
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

const mapStyleStatus: Map<string, string> = new Map([
  ["success", "badge-outline-success"],
  ["fail", "badge-outline-danger "],
])

const sizes = pageSizes
export const AuditLogsForm = () => {
  const dateFormat = getDateFormat().toUpperCase()
  const initialState: AuditLogSearch = {
    statusList: [],
    list: [],
    filter: auditLogfilter,
  }
  const locale = useLocale()
  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<AuditLogSearch>(initialState)

  useEffect(() => {
    const filter = mergeFilter(buildFromUrl<AuditLogFilter>(), state.filter, sizes, ["status", "auditLogType"])
    setSort(state, filter.sort)
    search() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const sort = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = getSortElement(event.target as HTMLElement)
    const sort = handleSort(target, state.sortTarget, state.sortField, state.sortType)
    state.sortField = sort.field
    state.sortType = sort.type
    state.sortTarget = target
    search()
  }
  const pageSizeChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    state.filter.page = 1
    state.filter.limit = getNumber(event)
    search()
  }
  const pageChanged = (data: PageChange) => {
    const { page, size } = data
    state.filter.page = page
    state.filter.limit = size
    search()
  }
  const searchOnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.preventDefault()
    removeSortStatus(state.sortTarget)
    state.filter.page = 1
    state.sortTarget = undefined
    state.sortField = undefined
    search()
  }
  const limit = state.filter.limit
  const page = state.filter.page
  const search = (isFirstLoad?: boolean) => {
    showLoading()
    const filter = buildSortFilter(state.filter, state)
    addParametersIntoUrl(filter, isFirstLoad)
    const fields = getFields(refForm.current, state.fields)
    getAuditService()
      .search(filter, limit, page, fields)
      .then((res) => {
        setState({ ...state, filter: state.filter, list: res.list, total: res.total, fields })
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  const { list } = state
  const filter = value(state.filter)
  const offset = getOffset(limit, page)
  return (
    <div>
      <header>
        <h2>{resource.audit_logs}</h2>
        <div className="btn-group float-left">
          {state.view === "list" && (
            <button type="button" id="btnTable" name="btnTable" className="btn-table" onClick={(e) => setState({ ...state, view: "" })} />
          )}
          {state.view !== "list" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list" onClick={(e) => setState({ ...state, view: "list" })} />
          )}
        </div>
      </header>
      <div className="search-body">
        <form id="rolesForm" name="rolesForm" className="form" noValidate={true} ref={refForm as any}>
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
                  setState({ ...state, filter })
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
                  setState({ ...state, filter })
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
                  setState({ ...state, filter })
                }}
              />
            </label>
          </section>
          <section className="section search">
            <label>
              {resource.page_size}
              <PageSizeSelect size={limit} sizes={pageSizes} onChange={pageSizeChanged} />
            </label>
            <button type="submit" className="btn-search" onClick={searchOnClick}>
              {resource.search}
            </button>
          </section>
        </form>
        <form className="list-result">
          {state.view !== "list" && (
            <div className="table-responsive">
              <table>
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
                  {list &&
                    list.length > 0 &&
                    list.map((item: any, i: number) => {
                      return (
                        <tr key={i}>
                          <td className="text-right">{offset + i + 1}</td>
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
          {state.view === "list" && (
            <ul className="row list">
              {list &&
                list.length > 0 &&
                list.map((item, i) => {
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
          <Pagination className="col s12 m6" total={state.total} size={state.filter.limit} max={7} page={state.filter.page} onChange={pageChanged} />
        </form>
      </div>
    </div>
  )
}
