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
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { addSeconds, createDate, formatDateTime } from "ui-plus"
import { toast } from "ui-toast"
import { canReject, canUpdate, getDateFormat, getFlowStatusName, getUserId, handleError, hasPermission, Permission, useResource } from "uione"
import { Article, ArticleFilter, getArticleService } from "./service"

interface ArticleSearch extends Sortable {
  statusList: Item[]
  total?: number
  view?: string
  fields?: string[]
}

export const ArticlesForm = () => {
  const canWrite = hasPermission(Permission.write)
  const canApprove = hasPermission(Permission.approve)
  const dateFormat = getDateFormat()
  const userId = getUserId()

  const now = new Date()
  const articleFilter: ArticleFilter = {
    limit: resources.defaultLimit,
    status: [],
    publishedAt: {
      max: addSeconds(now, 300),
    },
  }
  const initialState: ArticleSearch = {
    statusList: [],
  }

  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [list, setList] = useState<Article[]>([])
  const [state, setState] = useState<ArticleSearch>(initialState)
  const [filter, setFilter] = useState<ArticleFilter>(articleFilter)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => updateState(e, filter, setFilter)
  const statusOnChange = (e: ChangeEvent<HTMLInputElement>) => resetSearch(e, filter, setFilter, search)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<ArticleFilter>(), filter, pageSizes, ["status"])
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
    getArticleService()
      .search({ ...filter }, limit, page, fields)
      .then((res) => {
        setState({ ...state, total: res.total, fields })
        setList(res.list)
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  const edit = (e: MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault()
    navigate(`${id}`)
  }
  const viewHistory = (e: MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault()
    navigate(`${id}/history`)
  }
  const approve = (e: MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault()
    navigate(`${id}/approve`)
  }
  const checkboxOnChange = (e: ChangeEvent<HTMLInputElement>) => resetSearch(e, filter, setFilter, search)

  const offset = getOffset(filter.limit, filter.page)
  return (
    <div>
      <header>
        <h2>{resource.articles}</h2>
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
        <form id="articlesForm" name="articlesForm" className="form" noValidate={true} ref={refForm}>
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
                onChange={(e) => {
                  filter.publishedAt.min = createDate(e.target.value)
                  setFilter({ ...filter })
                }}
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
                onChange={(e) => {
                  filter.publishedAt.max = createDate(e.target.value)
                  setFilter({ ...filter })
                }}
              />
            </label>
            <label className="col s12 checkbox-section">
              {resource.status}
              <section className="checkbox-group">
                <label>
                  <input type="checkbox" id="status_D" name="status" value="D" checked={checked(filter.status, "D")} onChange={e => resetSearch(e, filter, setFilter, search)} />
                  {resource.status_draft}
                </label>
                <label>
                  <input type="checkbox" id="status_S" name="status" value="S" checked={checked(filter.status, "S")} onChange={checkboxOnChange} />
                  {resource.status_submitted}
                </label>
                <label>
                  <input type="checkbox" id="status_R" name="status" value="R" checked={checked(filter.status, "R")} onChange={checkboxOnChange} />
                  {resource.status_rejected}
                </label>
                <label>
                  <input type="checkbox" id="status_A" name="status" value="A" checked={checked(filter.status, "A")} onChange={checkboxOnChange} />
                  {resource.status_approved}
                </label>
                <label>
                  <input type="checkbox" id="status_P" name="status" value="P" checked={checked(filter.status, "P")} onChange={checkboxOnChange} />
                  {resource.status_published}
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
                  <th data-field="description">
                    <button type="button" id="sortDescription" onClick={sort}>
                      {resource.description}
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
                {list.map((item, i) => {
                  return (
                    <tr key={i}>
                      <td className="text-right">{offset + i + 1}</td>
                      <td>{item.id}</td>
                      <td>
                        <Link to={`${item.id}`}>{item.title}</Link>
                      </td>
                      <td>{formatDateTime(item.publishedAt, dateFormat)}</td>
                      <td>{item.description}</td>
                      <td>{getFlowStatusName(item.status, resource)}</td>
                      <td>
                        <div className="btn-group">
                          {canWrite && <button type="button" className="btn-copy" onClick={(e) => edit(e, item.id)}></button>}
                          {canWrite && canUpdate(item.status) && <button type="button" className="btn-edit" onClick={(e) => edit(e, item.id)}></button>}
                          {canApprove && userId !== item.submittedBy &&
                            canReject(item.status) && <button type="button" className="btn-approve" onClick={(e) => approve(e, item.id)}></button>}
                          <button type="button" className="btn-history" onClick={(e) => viewHistory(e, item.id)}></button>
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
                <li key={i} className="col s12 m6 l4 xl3 img-card" onClick={(e) => edit(e, item.id)}>
                  <section>
                    <div className="cover" style={{ backgroundImage: `url('${item.thumbnail}')` }}></div>
                    <Link to={`${item.id}`}>{item.title}</Link>
                    <p>{formatDateTime(item.publishedAt, dateFormat)}</p>
                    <p>{item.description}</p>
                  </section>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
