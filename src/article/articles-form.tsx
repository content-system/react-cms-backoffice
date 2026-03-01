import { Item } from "onecore"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import {
  addParametersIntoUrl,
  buildFromUrl,
  buildMessage,
  buildSortFilter,
  checked,
  datetimeToString,
  getFields,
  getNumber,
  getOffset,
  handleToggle,
  mergeFilter,
  OnClick,
  onSort,
  PageChange,
  pageSizes,
  removeSortStatus,
  setSort,
  Sortable
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
  list: Article[]
  total?: number
  view?: string
  fields?: string[]
}

const sizes = pageSizes
export const ArticlesForm = () => {
  const canWrite = hasPermission(Permission.write)
  const canApprove = hasPermission(Permission.approve)
  const dateFormat = getDateFormat()
  const userId = getUserId()

  const now = new Date()
  const articleFilter: ArticleFilter = {
    limit: 24,
    status: [],
    q: "",
    publishedAt: {
      max: addSeconds(now, 300),
    },
  }

  const initialState: ArticleSearch = {
    statusList: [],
    list: [],
  }
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<ArticleSearch>(initialState)
  const [filter, setFilter] = useState<ArticleFilter>(articleFilter)
  const [showFilter, setShowFilter] = useState<boolean>(false)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<ArticleFilter>(), filter, sizes, ["status"])
    setSort(state, initFilter.sort)
    setFilter(initFilter)
    search() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sort = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onSort(event, search, state)

  const pageSizeChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    filter.page = 1
    filter.limit = getNumber(event)
    setFilter(filter)
    search()
  }
  const pageChanged = (data: PageChange) => {
    const { page, size } = data
    filter.page = page
    filter.limit = size
    setFilter(filter)
    search()
  }
  const searchOnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.preventDefault()
    removeSortStatus(state.sortTarget)
    filter.page = 1
    state.sortTarget = undefined
    state.sortField = undefined
    setFilter(filter)
    setState(state)
    search()
  }

  const search = (isFirstLoad?: boolean) => {
    showLoading()
    const finalFilter = buildSortFilter(filter, state)
    addParametersIntoUrl(finalFilter, isFirstLoad)
    const fields = getFields(refForm.current, state.fields)
    setFilter(finalFilter)
    const { limit, page } = filter
    getArticleService()
      .search(filter, limit, page, fields)
      .then((res) => {
        setState({ ...state, list: res.list, total: res.total, fields })
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  const edit = (e: OnClick, id: string) => {
    e.preventDefault()
    navigate(`${id}`)
  }
  const viewHistory = (e: OnClick, id: string) => {
    e.preventDefault()
    navigate(`${id}/history`)
  }
  const approve = (e: OnClick, id: string) => {
    e.preventDefault()
    navigate(`${id}/approve`)
  }
  const checkboxOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (event.target.checked) {
      filter.status.push(value)
    } else {
      filter.status = filter.status.filter((i) => i !== value)
    }
    filter.page = 1
    setFilter({ ...filter })
    search()
  }
  const { list } = state
  const offset = getOffset(filter.limit, filter.page)
  return (
    <div>
      <header>
        <h2>{resource.articles}</h2>
        <div className="btn-group">
          {state.view === "list" && (
            <button type="button" id="btnTable" name="btnTable" className="btn-table" onClick={(e) => setState({ ...state, view: "" })} />
          )}
          {state.view !== "list" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list" onClick={(e) => setState({ ...state, view: "list" })} />
          )}
          {canWrite && <Link id="btnNew" className="btn-new" to="new" />}
        </div>
      </header>
      <div className="search-body">
        <form id="articlesForm" name="articlesForm" className="form" noValidate={true} ref={refForm as any}>
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
              <input
                type="text"
                id="q"
                name="q"
                value={filter.q || ""}
                maxLength={255}
                onChange={(e) => {
                  filter.q = e.target.value
                  setFilter({ ...filter })
                }}
                placeholder={resource.keyword}
              />
              <button
                type="button"
                hidden={!filter.q}
                className="btn-remove-text"
                onClick={(e) => {
                  filter.q = ""
                  setFilter({ ...filter })
                }}
              />
              <button
                type="button"
                className="btn-filter"
                onClick={(e) => {
                  const toggleFilter = handleToggle(e.target as HTMLElement, showFilter)
                  setShowFilter(toggleFilter)
                }}
              />
              <button type="submit" className="btn-search" onClick={searchOnClick} />
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
                  <input type="checkbox" id="status_D" name="status" value="D" checked={checked(filter.status, "D")} onChange={checkboxOnChange} />
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
                {list &&
                  list.length > 0 &&
                  list.map((item, i) => {
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
            {state.list &&
              state.list.length > 0 &&
              state.list.map((item, i) => {
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
