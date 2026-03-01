import { Item } from "onecore"
import { ChangeEvent, useEffect, useRef } from "react"
import {
  addParametersIntoUrl,
  buildFromUrl,
  buildMessage,
  buildSortFilter,
  checked,
  getFields,
  getNumber,
  handleSort,
  handleToggle,
  mergeFilter,
  PageChange,
  pageSizes,
  removeSortStatus,
  setSort,
  Sortable,
  useMergeState,
  value
} from "react-hook-core"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { toast } from "ui-toast"
import { getStatusName, handleError, hasPermission, useResource, write } from "uione"
import { getRoleService, Role, RoleFilter } from "./service"

interface RoleSearch extends Sortable {
  statusList: Item[]
  filter: RoleFilter
  list: Role[]
  total?: number
  view?: string
  hideFilter?: boolean
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
    filter: roleFilter,
    hideFilter: true
  }
  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useMergeState<RoleSearch>(initialState)

  useEffect(() => {
    const filter = mergeFilter(buildFromUrl<RoleFilter>(), state.filter, sizes, ["status", "userType"])
    setSort(state, filter.sort)
    search() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const sort = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    if (event && event.target) {
      const target = event.target as any
      const s = handleSort(target, state.sortTarget, state.sortField, state.sortType)
      setState({
        sortField: s.field,
        sortType: s.type,
        sortTarget: target,
      })
      state.sortField = s.field
      state.sortType = s.type
      state.sortTarget = target
    }
    search()
  }
  const pageSizeChanged = (event: any) => {
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
    getRoleService()
      .search(filter, limit, page, fields)
      .then((res) => {
        setState({ ...state, filter: state.filter, list: res.list, total: res.total, fields })
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
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
  const changeView = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (event && event.target) {
      const target = event.target as any
      const v: string = target.getAttribute("data-view")
      if (v && v.length > 0) {
        setState({ view: v })
      }
    }
  }

  const filter = value(state.filter)
  return (
    <div>
      <header>
        <h2>{resource.roles}</h2>
        <div className="btn-group">
          {state.view !== "table" && <button type="button" id="btnTable" name="btnTable" className="btn-table" data-view="table" onClick={changeView} />}
          {state.view === "table" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list" data-view="listview" onClick={changeView} />
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
                        <td className="text-right">{(item as any).sequenceNo}</td>
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
