import { Item } from "onecore"
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import {
  addParametersIntoUrlWithSort,
  buildFromUrl,
  buildMessage,
  checked,
  datetimeToString,
  getFields,
  getOffset,
  mergeFilter,
  onClearQ,
  onPageChanged,
  onPageSizeChanged,
  onSearch,
  onSort,
  onToggleSearch,
  PageChange,
  pageSizes,
  PageSizeSelect,
  resetSearch,
  resources,
  setSortFilter,
  Sortable,
  updateState
} from "react-hook-core"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { addSeconds, formatDateTime } from "ui-plus"
import { toast } from "ui-toast"
import { getDateFormat, handleError, hasPermission, Permission, useResource } from "uione"
import { getJobService, Job, JobFilter } from "./service"

interface JobSearch extends Sortable {
  statusList: Item[]
  total?: number
  view?: string
  fields?: string[]
}

export const JobsForm = () => {
  const canWrite = hasPermission(Permission.write)
  const dateFormat = getDateFormat()

  const now = new Date()
  const jobFilter: JobFilter = {
    limit: resources.defaultLimit,
    status: ["A"],
    publishedAt: {
      max: addSeconds(now, 300),
    },
  }
  const initialState: JobSearch = {
    statusList: [],
  }

  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [list, setList] = useState<Job[]>([])
  const [state, setState] = useState<JobSearch>(initialState)
  const [filter, setFilter] = useState<JobFilter>(jobFilter)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => updateState(e, filter, setFilter)
  const statusOnChange = (e: ChangeEvent<HTMLInputElement>) => resetSearch(e, filter, setFilter, search)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<JobFilter>(), filter, pageSizes, ["status"])
    setSortFilter(initFilter, state, setFilter)
    search(true) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearQ = (e: MouseEvent<HTMLButtonElement>) => onClearQ(filter, setFilter)
  const toggleSearch = (e: MouseEvent<HTMLButtonElement>) => onToggleSearch(e, showFilter, setShowFilter)
  const sort = (e: MouseEvent<HTMLButtonElement>) => onSort(e, search, state)
  const pageSizeChanged = (e: ChangeEvent<HTMLSelectElement>) => onPageSizeChanged(e, search, filter, setFilter)
  const pageChanged = (data: PageChange) => onPageChanged(data, search, filter, setFilter)
  const searchOnClick = (e: MouseEvent<HTMLButtonElement>) => onSearch(e, search, filter, state, setFilter, setState)

  const search = (isFirstLoad?: boolean) => {
    showLoading()
    const fields = getFields(refForm.current, state.fields)
    addParametersIntoUrlWithSort(filter, state, isFirstLoad)
    setFilter(filter)
    const { limit, page } = filter
    getJobService()
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
        <h2>{resource.jobs}</h2>
        <div className="btn-group">
          {state.view === "list" && (
            <button type="button" id="btnTable" name="btnTable" className="btn-table" onClick={(e) => setState({ ...state, view: "table" })} />
          )}
          {state.view !== "list" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list" onClick={(e) => setState({ ...state, view: "list" })} />
          )}
          {canWrite && <Link id="btnNew" className="btn-new" to="new" />}
        </div>
      </header>
      <div className="search-body">
        <form id="jobsForm" name="jobsForm" className="form" noValidate={true} ref={refForm}>
          <section className="row search-group">
            <label className="col s12 m6 search-input">
              <PageSizeSelect id="limit" name="limit" size={filter.limit} sizes={pageSizes} onChange={pageSizeChanged} />
              <input type="text" id="q" name="q" value={filter.q} maxLength={80} onChange={onChange} placeholder={resource.keyword} />
              <button type="button" id="btnClearQ" hidden={!filter.q} className="btn-remove-text" onClick={clearQ} />
              <button type="button" id="btnToggleSearch" className="btn-filter" onClick={toggleSearch} />
              <button type="submit" id="btnSearch" className="btn-search" onClick={searchOnClick} />
            </label>
            <Pagination className="col s12 m6" total={state.total} size={filter.limit} max={7} page={filter.page} onChange={pageChanged} />
          </section>
          <section className="row search-group inline" hidden={!showFilter}>
            <label className="col s12 m6">
              {resource.published_at_from}
              <input
                type="datetime-local"
                step=".010"
                id="publishedAt_min"
                name="publishedAt_min"
                data-field="publishedAt.min"
                value={datetimeToString(filter.publishedAt?.min)}
                onChange={onChange}
              />
            </label>
            <label className="col s12 m6">
              {resource.published_at_to}
              <input
                type="datetime-local"
                step=".010"
                id="publishedAt_max"
                name="publishedAt_max"
                data-field="publishedAt.max"
                value={datetimeToString(filter.publishedAt?.max)}
                onChange={onChange}
              />
            </label>
            <label className="col s12 m4 l4">
              {resource.title}
              <input
                type="text"
                id="title"
                name="title"
                value={filter.title}
                onChange={onChange}
                maxLength={255}
                placeholder={resource.title}
              />
            </label>
            <label className="col s12 m4 l4">
              {resource.position}
              <input
                type="text"
                id="position"
                name="position"
                value={filter.position}
                onChange={onChange}
                maxLength={255}
                placeholder={resource.position}
              />
            </label>
            <label className="col s12 m4 l4 checkbox-section">
              {resource.status}
              <section className="checkbox-group">
                <label>
                  <input type="checkbox" id="A" name="status" value="A" checked={checked(filter.status, "A")} onChange={statusOnChange} />
                  {resource.active}
                </label>
                <label>
                  <input type="checkbox" id="I" name="status" value="I" checked={checked(filter.status, "I")} onChange={statusOnChange} />
                  {resource.inactive}
                </label>
              </section>
            </label>
          </section>
        </form>
        {state.view !== "list" && (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>{resource.number}</th>
                  <th data-field="id">
                    <button type="button" id="sortId" onClick={sort}>
                      {resource.id}
                    </button>
                  </th>
                  <th data-field="title">
                    <button type="button" id="sortTitle" onClick={sort}>
                      {resource.title}
                    </button>
                  </th>
                  <th data-field="publishedAt" className="datetime">
                    <button type="button" id="sortPublishedAt" onClick={sort}>
                      {resource.published_at}
                    </button>
                  </th>
                  <th data-field="position">
                    <button type="button" id="sortPosition" onClick={sort}>
                      {resource.position}
                    </button>
                  </th>
                  <th data-field="quantity">
                    <button type="button" id="sortQuantity" onClick={sort}>
                      {resource.quantity}
                    </button>
                  </th>
                  <th data-field="location">
                    <button type="button" id="sortLocation" onClick={sort}>
                      {resource.location}
                    </button>
                  </th>
                  <th className="action">{resource.action}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => {
                  return (
                    <tr key={i}>
                      <td className="text-right">{offset + i + 1}</td>
                      <td>{item.id}</td>
                      <td>
                        <Link to={`${item.id}`}>{item.title}</Link>
                      </td>
                      <td>{formatDateTime(item.publishedAt, dateFormat)}</td>
                      <td>{item.position}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td>{item.location}</td>
                      <td>
                        <div className="btn-group">
                          <button type="button" className="btn-edit"></button>
                          <button type="button" className="btn-history"></button>
                        </div>
                      </td>
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
                  <Link to={`${item.id}`}>{item.title}</Link>
                  <p>
                    {item.location} {item.quantity}
                    <span>{formatDateTime(item.publishedAt, dateFormat)}</span>
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
