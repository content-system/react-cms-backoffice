import { Item } from "onecore"
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import {
  addParametersIntoUrlWithSort,
  buildFromUrl,
  buildMessage,
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
import { toast } from "ui-toast"
import { handleError, hasPermission, Permission, useResource } from "uione"
import { Category, CategoryFilter, getCategoryService } from "./service"

interface CategorySearch extends Sortable {
  statusList: Item[]
  total?: number
  view?: string
  fields?: string[]
}

export const CategoriesForm = () => {
  const canWrite = hasPermission(Permission.write)

  const categoryFilter: CategoryFilter = {
    limit: resources.defaultLimit,
    status: ["A"],
  }
  const initialState: CategorySearch = {
    statusList: [],
  }

  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [list, setList] = useState<Category[]>([])
  const [state, setState] = useState<CategorySearch>(initialState)
  const [filter, setFilter] = useState<CategoryFilter>(categoryFilter)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => updateState(e, filter, setFilter)
  const statusOnChange = (e: ChangeEvent<HTMLInputElement>) => resetSearch(e, filter, setFilter, search)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<CategoryFilter>(), filter, pageSizes, ["status"])
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
    addParametersIntoUrlWithSort(filter, state, isFirstLoad, setFilter)
    const { limit, page } = filter
    getCategoryService()
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
        <h2>{resource.categories}</h2>
        <div className="btn-group">
          {state.view === "list" && (
            <button type="button" id="tableBtn" name="tableBtn" className="btn-table" onClick={(e) => setState({ ...state, view: "table" })} />
          )}
          {state.view !== "list" && (
            <button type="button" id="listViewBtn" name="listViewBtn" className="btn-list" onClick={(e) => setState({ ...state, view: "list" })} />
          )}
          {canWrite && <Link id="newBtn" className="btn-new" to="new" />}
        </div>
      </header>
      <div className="search-body">
        <form id="categoriesForm" name="categoriesForm" className="form" noValidate={true} ref={refForm}>
          <section className="row search-group">
            <label className="col s12 m6 search-input">
              <PageSizeSelect id="limit" name="limit" size={filter.limit} sizes={pageSizes} onChange={pageSizeChanged} />
              <input type="text" id="q" name="q" value={filter.q} maxLength={80} onChange={onChange} placeholder={resource.keyword} />
              <button type="button" id="clearQBtn" name="clearQBtn" hidden={!filter.q} className="btn-remove-text" onClick={clearQ} />
              <button type="button" id="toggleSearchBtn" name="toggleSearchBtn" className="btn-filter" onClick={toggleSearch} />
              <button type="submit" id="searchBtn" name="searchBtn" className="btn-search" onClick={searchOnClick} />
            </label>
            <Pagination className="col s12 m6" total={state.total} size={filter.limit} max={7} page={filter.page} onChange={pageChanged} />
          </section>
          <section className="row search-group inline" hidden={!showFilter}>
            <label className="col s12 m6">
              {resource.status}
              <section className="checkbox-group">
                <label>
                  <input type="checkbox" id="active" name="status" value="A" checked={checked(filter.status, "A")} onChange={statusOnChange} />
                  {resource.active}
                </label>
                <label>
                  <input type="checkbox" id="inactive" name="status" value="I" checked={checked(filter.status, "I")} onChange={statusOnChange} />
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
                    <button type="button" id="idSort" onClick={sort}>
                      {resource.id}
                    </button>
                  </th>
                  <th data-field="name">
                    <button type="button" id="nameSort" onClick={sort}>
                      {resource.name}
                    </button>
                  </th>
                  <th data-field="path">
                    <button type="button" id="pathSort" onClick={sort}>
                      {resource.path}
                    </button>
                  </th>
                  <th data-field="resource">
                    <button type="button" id="resourceSort" onClick={sort}>
                      {resource.resource}
                    </button>
                  </th>
                  <th data-field="icon">
                    <button type="button" id="iconSort" onClick={sort}>
                      {resource.icon}
                    </button>
                  </th>
                  <th data-field="type">
                    <button type="button" id="typeSort" onClick={sort}>
                      {resource.type}
                    </button>
                  </th>
                  <th data-field="parent">
                    <button type="button" id="parentSort" onClick={sort}>
                      {resource.parent}
                    </button>
                  </th>
                  <th data-field="sequence">
                    <button type="button" id="sequenceSort" onClick={sort}>
                      {resource.sequence}
                    </button>
                  </th>
                  <th data-field="status">
                    <button type="button" id="statusSort" onClick={sort}>
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
            {list.map((item, i) => {
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
