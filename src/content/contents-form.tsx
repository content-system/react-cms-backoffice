import { Item } from "onecore"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import {
    addParametersIntoUrl,
    buildFromUrl,
    buildMessage,
    buildSortFilter,
    checked,
    getFields,
    getNumber,
    getOffset,
    getSortElement,
    handleSort,
    handleToggle,
    mergeFilter,
    OnClick,
    PageChange,
    pageSizes,
    removeSortStatus,
    setSort,
    Sortable,
    value,
} from "react-hook-core"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { formatDateTime } from "ui-plus"
import { toast } from "ui-toast"
import { getDateFormat, handleError, hasPermission, Permission, useResource } from "uione"
import { Content, ContentFilter, getContentService } from "./service"

interface ContentSearch extends Sortable {
  statusList: Item[]
  filter: ContentFilter
  list: Content[]
  total?: number
  view?: string
  hideFilter?: boolean
  fields?: string[]
}
const contentFilter: ContentFilter = {
  limit: 24,
  status: ["A"],
  q: "",
}

const sizes = pageSizes
export const ContentsForm = () => {
  const canWrite = hasPermission(Permission.write)
  const dateFormat = getDateFormat()
  const initialState: ContentSearch = {
    statusList: [],
    list: [],
    filter: contentFilter,
    hideFilter: true,
  }
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<ContentSearch>(initialState)

  useEffect(() => {
    const filter = mergeFilter(buildFromUrl<ContentFilter>(), state.filter, sizes, ["status"])
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
    getContentService()
      .search(filter, limit, page, fields)
      .then((res) => {
        setState({ ...state, filter: state.filter, list: res.list, total: res.total, fields })
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }
  const edit = (e: OnClick, id: string, lang: string) => {
    e.preventDefault()
    navigate(`${id}/${lang}`)
  }
  const checkboxOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { filter } = state
    const value = event.target.value
    if (event.target.checked) {
      filter.status.push(value)
    } else {
      filter.status = filter.status.filter((i) => i !== value)
    }
    filter.page = 1
    setState({ ...state, filter })
    search()
  }
  const { list } = state
  const filter = value(state.filter)
  const offset = getOffset(limit, page)
  return (
    <div>
      <header>
        <h2>{resource.contents}</h2>
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
              <input
                type="text"
                id="q"
                name="q"
                value={filter.q || ""}
                maxLength={255}
                onChange={(e) => {
                  filter.q = e.target.value
                  setState({ ...state, filter })
                }}
                placeholder={resource.keyword}
              />
              <button
                type="button"
                hidden={!filter.q}
                className="btn-remove-text"
                onClick={(e) => {
                  filter.q = ""
                  setState({ ...state, filter })
                }}
              />
              <button
                type="button"
                className="btn-filter"
                onClick={(e) => {
                  const hideFilter = handleToggle(e.target as HTMLElement, state.hideFilter)
                  setState({ ...state, hideFilter })
                }}
              />
              <button type="submit" className="btn-search" onClick={searchOnClick} />
            </label>
            <Pagination className="col s12 m6" total={state.total} size={state.filter.limit} max={7} page={state.filter.page} onChange={pageChanged} />
          </section>
          <section className="row search-group inline" hidden={state.hideFilter}>
            <label className="col s12 m4 l4">
              {resource.title}
              <input
                type="text"
                id="title"
                name="title"
                value={filter.title || ""}
                onChange={(e) => {
                  filter.title = e.target.value
                  setState({ ...state, filter })
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
                  setState({ ...state, filter })
                }}
                maxLength={255}
                placeholder={resource.description}
              />
            </label>
            <label className="col s12 m4 l4 checkbox-section">
              {resource.status}
              <section className="checkbox-group">
                <label>
                  <input type="checkbox" id="A" name="status" value="A" checked={checked(filter.status, "A")} onChange={checkboxOnChange} />
                  {resource.active}
                </label>
                <label>
                  <input type="checkbox" id="I" name="status" value="I" checked={checked(filter.status, "I")} onChange={checkboxOnChange} />
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
                      <tr key={i} onClick={(e) => edit(e, item.id, item.lang)}>
                        <td className="text-right">{offset + i + 1}</td>
                        <td>{item.id}</td>
                        <td>{item.lang}</td>
                        <td>
                          <Link to={`${item.id}`}>{item.id}</Link>
                        </td>
                        <td>{formatDateTime(item.publishedAt, dateFormat)}</td>
                        <td>{item.status}</td>
                        <td>
                          <div className="btn-group">
                            <button type="button" className="btn-edit" onClick={(e) => edit(e, item.id, item.lang)}></button>
                            <button type="button" className="btn-history" onClick={(e) => edit(e, item.id, item.lang)}></button>
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
                  <li key={i} className="col s12 m6 l4 xl3 list-item" onClick={(e) => edit(e, item.id, item.lang)}>
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
