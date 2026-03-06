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
import { toast } from "ui-toast"
import { handleError, hasPermission, Permission, useResource } from "uione"
import { Category, CategoryFilter, getCategoryService } from "./service"

interface CategorySearch extends Sortable {
  statusList: Item[]
  list: Category[]
  total?: number
  view?: string
  fields?: string[]
}

const sizes = pageSizes
export const CategoriesForm = () => {
  const canWrite = hasPermission(Permission.write)

  const categoryFilter: CategoryFilter = {
    limit: resources.defaultLimit,
    status: ["A"],
  }
  const initialState: CategorySearch = {
    statusList: [],
    list: [],
  }

  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<CategorySearch>(initialState)
  const [filter, setFilter] = useState<CategoryFilter>(categoryFilter)
  const [showFilter, setShowFilter] = useState<boolean>(false)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<CategoryFilter>(), filter, sizes, ["status"])
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
    const { limit, page } = filter
    getCategoryService()
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
        <h2>{resource.categories}</h2>
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
        <form id="categoriesForm" name="categoriesForm" className="form" noValidate={true} ref={refForm as any}>
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
            <label className="col s12 m6">
              {resource.status}
              <section className="checkbox-group">
                <label>
                  <input type="checkbox" id="active" name="status" value="A" checked={checked(filter.status, "A")} onChange={e => resetSearch(e, filter, setFilter, search)} />
                  {resource.active}
                </label>
                <label>
                  <input type="checkbox" id="inactive" name="status" value="I" checked={checked(filter.status, "I")} onChange={e => resetSearch(e, filter, setFilter, search)} />
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
                  <th data-field="name">
                    <button type="button" id="sortName" onClick={sort}>
                      {resource.name}
                    </button>
                  </th>
                  <th data-field="path">
                    <button type="button" id="sortPath" onClick={sort}>
                      {resource.path}
                    </button>
                  </th>
                  <th data-field="resource">
                    <button type="button" id="sortResource" onClick={sort}>
                      {resource.resource}
                    </button>
                  </th>
                  <th data-field="icon">
                    <button type="button" id="sortIcon" onClick={sort}>
                      {resource.icon}
                    </button>
                  </th>
                  <th data-field="type">
                    <button type="button" id="sortType" onClick={sort}>
                      {resource.type}
                    </button>
                  </th>
                  <th data-field="parent">
                    <button type="button" id="sortParent" onClick={sort}>
                      {resource.parent}
                    </button>
                  </th>
                  <th data-field="sequence">
                    <button type="button" id="sortSequence" onClick={sort}>
                      {resource.sequence}
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
                          <Link to={`${item.id}`}>{item.name}</Link>
                        </td>
                        <td>{item.path}</td>
                        <td>{item.resource}</td>
                        <td>{item.icon}</td>
                        <td>{item.type}</td>
                        <td>{item.parent}</td>
                        <td className="right-align">{item.sequence}</td>
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
                    <Link to={`${item.id}`}>{item.name}</Link>
                    <button className="btn-detail"></button>
                    <p>
                      {item.path} {item.parent}
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
