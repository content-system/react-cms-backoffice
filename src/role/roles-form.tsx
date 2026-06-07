import { Item } from "onecore"
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import {
  buildFromUrl,
  buildMessage,
  checked,
  getFields,
  getOffset,
  mergeFilter,
  onPageChanged,
  onPageSizeChanged,
  onSearch,
  onSort,
  onToggleSearch,
  PageChange,
  pageSizes,
  PageSizeSelect,
  resources,
  setSortFilter,
  Sortable,
  updateUrl
} from "react-hook-core"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { toast } from "ui-toast"
import { getStatusName, handleError, hasPermission, useResource, write } from "uione"
import { getRoleService, Role, RoleFilter } from "./service"

interface RoleSearch extends Sortable {
  statusList: Item[]
  total?: number
  view?: string
  fields?: string[]
}

export const RolesForm = () => {
  const canWrite = hasPermission(write)

  const roleFilter: RoleFilter = { limit: resources.defaultLimit, status: [] }
  const initialState: RoleSearch = { statusList: [] }

  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [list, setList] = useState<Role[]>([])
  const [state, setState] = useState<RoleSearch>(initialState)
  const [filter, setFilter] = useState<RoleFilter>(roleFilter)

  const statusOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    filter.page = 1
    setFilter(filter)
    search(filter)
  }

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<RoleFilter>(), filter, pageSizes, ["status"])
    setSortFilter(state, initFilter, setFilter)
    search(initFilter, state, true) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSearch = (e: MouseEvent<HTMLButtonElement>) => onToggleSearch(e, showFilter, setShowFilter)
  const pageSizeChanged = (e: ChangeEvent<HTMLSelectElement>) => onPageSizeChanged(e, search, filter)
  const pageChanged = (data: PageChange) => onPageChanged(data, search, filter)
  const sort = (e: MouseEvent<HTMLButtonElement>) => onSort(e, search, filter, state)
  const searchOnClick = (e: MouseEvent<HTMLButtonElement>) => onSearch(e, search, filter, state)

  const search = (obj: RoleFilter, sort?: Sortable, isFirstLoad?: boolean) => {
    showLoading()
    const fields = getFields(refForm.current, state.fields)
    updateUrl(obj, isFirstLoad, setFilter, sort)
    getRoleService()
      .search({ ...obj }, obj.limit, obj.page, fields)
      .then((res) => {
        setState({ ...state, total: res.total, fields })
        setList(res.list)
        toast(buildMessage(resource, res.list, obj.limit, obj.page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  const offset = getOffset(filter.limit, filter.page)
  return (
    <div>
      <header>
        <h2>{resource.roles}</h2>
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
      <div className="main-body">
        <form id="rolesForm" name="rolesForm" noValidate={true} ref={refForm}>
          <section className="row search-group">
            <label className="col s12 m6 search-input">
              <PageSizeSelect id="limit" name="limit" size={filter.limit} sizes={pageSizes} onChange={pageSizeChanged} />
              <input type="text" id="q" name="q" value={filter.q} maxLength={80} placeholder={resource.keyword}
                onChange={e => {
                  filter.q = e.target.value
                  setFilter(filter)
                }} />
              <button type="button" id="clearQBtn" name="clearQBtn" hidden={!filter.q} className="btn-remove-text"
                onClick={e => {
                  filter.q = ""
                  setFilter(filter)
                }} />
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
            <table className="table">
              <thead>
                <tr>
                  <th>{resource.number}</th>
                  <th data-field="roleId">
                    <button type="button" id="roleIdSort" onClick={sort}>
                      {resource.role_id}
                    </button>
                  </th>
                  <th data-field="roleName">
                    <button type="button" id="roleNameSort" onClick={sort}>
                      {resource.role_name}
                    </button>
                  </th>
                  <th data-field="remark">
                    <button type="button" id="remarkSort" onClick={sort}>
                      {resource.remark}
                    </button>
                  </th>
                  <th data-field="status">
                    <button type="button" id="statusSort" onClick={sort}>
                      {resource.status}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => {
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
        {state.view === "list" && (
          <ul className="row list">
            {list.map((item, i) => {
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
