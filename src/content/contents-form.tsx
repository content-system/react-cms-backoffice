import { Item } from "onecore"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import {
  addParametersIntoUrl,
  buildFromUrl,
  buildMessage,
  buildSortFilter,
  ButtonMouseEvent,
  checked,
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
  resetSearch,
  resources,
  setSort,
  Sortable,
  updateState
} from "react-hook-core"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { formatDateTime } from "ui-plus"
import { toast } from "ui-toast"
import { getDateFormat, handleError, hasPermission, Permission, useResource } from "uione"
import { Content, ContentFilter, getContentService } from "./service"

interface ContentSearch extends Sortable {
  statusList: Item[]
  list: Content[]
  total?: number
  view?: string
  fields?: string[]
}

const sizes = pageSizes
export const ContentsForm = () => {
  const canWrite = hasPermission(Permission.write)
  const dateFormat = getDateFormat()

  const contentFilter: ContentFilter = {
    limit: resources.defaultLimit,
    status: [],
  }
  const initialState: ContentSearch = {
    statusList: [],
    list: [],
  }

  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<ContentSearch>(initialState)
  const [filter, setFilter] = useState<ContentFilter>(contentFilter)
  const [showFilter, setShowFilter] = useState<boolean>(false)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<ContentFilter>(), filter, sizes, ["status"])
    setSort(state, initFilter.sort)
    search() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sort = (event: ButtonMouseEvent) => onSort(event, search, state)
  const pageSizeChanged = (event: ChangeEvent<HTMLSelectElement>) => onPageSizeChanged(event, search, filter, setFilter)
  const pageChanged = (data: PageChange) => onPageChanged(data, search, filter, setFilter)
  const searchOnClick = (event: ButtonMouseEvent) => onSearch(event, search, filter, state, setFilter, setState)

  const search = (isFirstLoad?: boolean) => {
    showLoading()
    const urlFilter = buildSortFilter(filter, state)
    addParametersIntoUrl(urlFilter, isFirstLoad)
    const fields = getFields(refForm.current, state.fields)
    setFilter(filter)
    const { limit, page } = filter
    getContentService()
      .search({ ...filter }, limit, page, fields)
      .then((res) => {
        setState({ ...state, list: res.list, total: res.total, fields })
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  const { list } = state
  const offset = getOffset(filter.limit, filter.page)
  return (
    <div>
      <header>
        <h2>{resource.contents}</h2>
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
        <form id="contentsForm" name="contentsForm" className="form" noValidate={true} ref={refForm as any}>
          <section className="row search-group">
            <label className="col s12 m6 search-input">
              <select id="limit" name="limit" onChange={pageSizeChanged} defaultValue={filter.limit}>
                {sizes.map((item, i) => {
                  return (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  )
                })}
              </select>
              <input type="text" id="q" name="q" value={filter.q} maxLength={100} onChange={(e) => updateState(e, filter, setFilter)} placeholder={resource.keyword} />
              <button type="button" hidden={!filter.q} className="btn-remove-text" onClick={(e) => onClearQ(filter, setFilter)} />
              <button type="button" className="btn-filter" onClick={(e) => onToggleSearch(e, showFilter, setShowFilter)} />
              <button type="submit" className="btn-search" onClick={searchOnClick} />
            </label>
            <Pagination className="col s12 m6" total={state.total} size={filter.limit} max={7} page={filter.page} onChange={pageChanged} />
          </section>
          <section className="row search-group inline" hidden={!showFilter}>
            <label className="col s12 m4 l4">
              {resource.title}
              <input
                type="text"
                id="title"
                name="title"
                value={filter.title || ""}
                onChange={(e) => {
                  filter.title = e.target.value
                  setFilter({ ...filter })
                }}
                maxLength={255}
                placeholder={resource.title}
              />
            </label>
            <label className="col s12 m4 l4">
              {resource.description}
              <input
                type="text"
                id="description"
                name="description"
                value={filter.body || ""}
                onChange={(e) => {
                  filter.body = e.target.value
                  setFilter({ ...filter })
                }}
                maxLength={255}
                placeholder={resource.description}
              />
            </label>
            <label className="col s12 m4 l4 checkbox-section">
              {resource.status}
              <section className="checkbox-group">
                <label>
                  <input type="checkbox" id="A" name="status" value="A" checked={checked(filter.status, "A")} onChange={e => resetSearch(e, filter, setFilter, search)} />
                  {resource.active}
                </label>
                <label>
                  <input type="checkbox" id="I" name="status" value="I" checked={checked(filter.status, "I")} onChange={e => resetSearch(e, filter, setFilter, search)} />
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
                  <th data-field="lang">
                    <button type="button" id="sortLang" onClick={sort}>
                      {resource.lang}
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
                  <th data-field="status">
                    <button type="button" id="sortStatus" onClick={sort}>
                      {resource.status}
                    </button>
                  </th>
                  <th className="action">{resource.action}</th>
                </tr>
              </thead>
              <tbody>
                {list &&
                  list.length > 0 &&
                  list.map((item, i) => {
                    return (
                      <tr key={i}>
                        <td className="text-right">{offset + i + 1}</td>
                        <td>{item.id}</td>
                        <td>{item.lang}</td>
                        <td>
                          <Link to={`${item.id}/${item.lang}`}>{item.title}</Link>
                        </td>
                        <td>{formatDateTime(item.publishedAt, dateFormat)}</td>
                        <td>{item.status}</td>
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
            {state.list &&
              state.list.length > 0 &&
              state.list.map((item, i) => {
                return (
                  <li key={i} className="col s12 m6 l4 xl3 list-item">
                    <Link to={`${item.id}/${item.lang}`}>
                      {item.id} {item.lang}
                    </Link>
                    <p>{formatDateTime(item.publishedAt, dateFormat)}</p>
                  </li>
                )
              })}
          </ul>
        )}
      </div>
    </div>
  )
}
