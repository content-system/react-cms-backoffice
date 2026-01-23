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
import { toast } from "ui-toast"
import { handleError, hasPermission, Permission, useResource } from "uione"
import { Category, CategoryFilter, getCategoryService } from "./service"

interface CategorySearch extends Sortable {
  statusList: Item[]
  filter: CategoryFilter
  list: Category[]
  total?: number
  view?: string
  hideFilter?: boolean
  fields?: string[]
}
const categoryFilter: CategoryFilter = {
  limit: 24,
  status: ["A"],
  q: "",
}

const sizes = pageSizes
export const CategoriesForm = () => {
  const canWrite = hasPermission(Permission.write)
  const initialState: CategorySearch = {
    statusList: [],
    list: [],
    filter: categoryFilter,
    hideFilter: true,
  }
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<CategorySearch>(initialState)

  useEffect(() => {
    const filter = mergeFilter(buildFromUrl<CategoryFilter>(), state.filter, sizes, ["status"])
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
    getCategoryService()
      .search(filter, limit, page, fields)
      .then((res) => {
        setState({ ...state, filter: state.filter, list: res.list, total: res.total, fields })
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }
  const edit = (e: OnClick, id: string) => {
    e.preventDefault()
    navigate(`${id}`)
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
        <h2>{resource.categories}</h2>
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
            <label className="col s12 m6">
              {resource.status}
              <section className="checkbox-group">
                <label>
                  <input type="checkbox" id="active" name="status" value="A" checked={checked(filter.status, "A")} onChange={checkboxOnChange} />
                  {resource.active}
                </label>
                <label>
                  <input type="checkbox" id="inactive" name="status" value="I" checked={checked(filter.status, "I")} onChange={checkboxOnChange} />
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
                      <tr key={i} onClick={(e) => edit(e, item.id)}>
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
                            <button type="button" className="btn-edit" onClick={(e) => edit(e, item.id)}></button>
                            <button type="button" className="btn-history" onClick={(e) => edit(e, item.id)}></button>
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
