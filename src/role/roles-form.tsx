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
  handleToggle,
  mergeFilter,
  onSort,
  PageChange,
  pageSizes,
  removeSortStatus,
  setSort,
  Sortable
} from "react-hook-core"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { toast } from "ui-toast"
import { getStatusName, handleError, hasPermission, useResource, write } from "uione"
import { getRoleService, Role, RoleFilter } from "./service"

interface RoleSearch extends Sortable {
  statusList: Item[]
  list: Role[]
  total?: number
  view?: string
  fields?: string[]
}
const roleFilter: RoleFilter = {
  limit: 24,
  q: "",
  roleId: "",
  roleName: "",
  status: [],
  remark: "",
}

const sizes = pageSizes
export const RolesForm = () => {
  const canWrite = hasPermission(write)
  const initialState: RoleSearch = {
    statusList: [],
    list: [],
  }
  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<RoleSearch>(initialState)
  const [filter, setFilter] = useState<RoleFilter>(roleFilter)
  const [showFilter, setShowFilter] = useState<boolean>(false)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<RoleFilter>(), filter, sizes, ["status", "userType"])
    setSort(state, initFilter.sort)
    setFilter(initFilter)
    search() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const sort = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onSort(event, search, state, setState)
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
    getRoleService()
      .search(filter, limit, page, fields)
      .then((res) => {
        setState({ ...state, list: res.list, total: res.total, fields })
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
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

  const offset = getOffset(filter.limit, filter.page)
  return (
    <div>
      <header>
        <h2>{resource.roles}</h2>
        <div className="btn-group">
          {state.view !== "table" && <button type="button" id="btnTable" name="btnTable" className="btn-table" onClick={(e) => setState({ ...state, view: "table" })} />}
          {state.view === "table" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list" onClick={(e) => setState({ ...state, view: "" })} />
          )}
          {canWrite && <Link id="btnNew" className="btn-new" to="new" />}
        </div>
      </header>
      <div className="search-body">
        <form id="rolesForm" name="rolesForm" noValidate={true} ref={refForm as any}>
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
        {state.view === "table" && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{resource.sequence}</th>
                  <th data-field="roleId">
                    <button type="button" id="sortRoleId" onClick={sort}>
                      {resource.role_id}
                    </button>
                  </th>
                  <th data-field="roleName">
                    <button type="button" id="sortRoleName" onClick={sort}>
                      {resource.role_name}
                    </button>
                  </th>
                  <th data-field="remark">
                    <button type="button" id="sortRemark" onClick={sort}>
                      {resource.remark}
                    </button>
                  </th>
                  <th data-field="status">
                    <button type="button" id="sortStatus" onClick={sort}>
                      {resource.status}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.list &&
                  state.list.length > 0 &&
                  state.list.map((item, i) => {
                    return (
                      <tr key={i}>
                        <td className="text-right">{offset + i + 1}</td>
                        <td>{item.roleId}</td>
                        <td>
                          <Link to={`${item.roleId}`}>{item.roleName}</Link>
                        </td>
                        <td>{item.remark}</td>
                        <td>{getStatusName(item.status, resource)}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
        {state.view !== "table" && (
          <ul className="row list">
            {state.list &&
              state.list.length > 0 &&
              state.list.map((item, i) => {
                return (
                  <li key={i} className="col s12 m6 l4 xl3 list-item">
                    <Link to={`${item.roleId}`}>{item.roleName}</Link>
                    <button className="btn-detail"></button>
                    <p>{item.remark}</p>
                  </li>
                )
              })}
          </ul>
        )}
      </div>
    </div>
  )
}
