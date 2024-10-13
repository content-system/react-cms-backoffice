import { Item } from "onecore"
import { ChangeEvent, useRef } from "react"
import { checked, OnClick, PageSizeSelect, SearchComponentState, useSearch, value } from "react-hook-core"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { getStatusName, hasPermission, inputSearch, write } from "uione"
import { getRoleService, Role, RoleFilter } from "./service"

interface RoleSearch extends SearchComponentState<Role, RoleFilter> {
  statusList: Item[]
}
const roleFilter: RoleFilter = {
  q: "",
  roleId: "",
  roleName: "",
  status: [],
  remark: "",
}
const roleSearch: RoleSearch = {
  statusList: [],
  list: [],
  filter: roleFilter,
}
export const RolesForm = () => {
  const navigate = useNavigate()
  const refForm = useRef()
  const { state, resource, component, updateState, doSearch, search, sort, toggleFilter, clearQ, changeView, pageChanged, pageSizeChanged } = useSearch<
    Role,
    RoleFilter,
    RoleSearch
  >(refForm, roleSearch, getRoleService(), inputSearch())
  const canWrite = hasPermission(write)
  const edit = (e: OnClick, id: string) => {
    e.preventDefault()
    navigate(`${id}`)
  }
  const checkboxOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateState(event, (newState) => {
      component.pageIndex = 1
      doSearch({ ...component, ...newState.filter })
    })
  }
  const filter = value(state.filter)
  return (
    <div className="view-container">
      <header>
        <h2>{resource.roles}</h2>
        <div className="btn-group">
          {component.view !== "table" && <button type="button" id="btnTable" name="btnTable" className="btn-table" data-view="table" onClick={changeView} />}
          {component.view === "table" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list-view" data-view="listview" onClick={changeView} />
          )}
          {canWrite && <Link id="btnNew" className="btn-new" to="new" />}
        </div>
      </header>
      <div>
        <form id="rolesForm" name="rolesForm" noValidate={true} ref={refForm as any}>
          <section className="row search-group">
            <label className="col s12 m6 search-input">
              <PageSizeSelect size={component.pageSize} sizes={component.pageSizes} onChange={pageSizeChanged} />
              <input type="text" id="q" name="q" value={filter.q || ""} onChange={updateState} maxLength={255} placeholder={resource.keyword} />
              <button type="button" hidden={!filter.q} className="btn-remove-text" onClick={clearQ} />
              <button type="button" className="btn-filter" onClick={toggleFilter} />
              <button type="submit" className="btn-search" onClick={search} />
            </label>
            <Pagination
              className="col s12 m6"
              total={component.total}
              size={component.pageSize}
              max={component.pageMaxSize}
              page={component.pageIndex}
              onChange={pageChanged}
            />
          </section>
          <section className="row search-group inline" hidden={component.hideFilter}>
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
        <form className="list-result">
          {component.view === "table" && (
            <div className="table-responsive">
              <table>
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
                        <tr key={i} onClick={(e) => edit(e, item.roleId)}>
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
          {component.view !== "table" && (
            <ul className="row list-view">
              {state.list &&
                state.list.length > 0 &&
                state.list.map((item, i) => {
                  return (
                    <li key={i} className="col s12 m6 l4 xl3" onClick={(e) => edit(e, item.roleId)}>
                      <section>
                        <div>
                          <h3 className={item.status === "I" ? "inactive" : ""}>
                            <Link to={`${item.roleId}`}>{item.roleName}</Link>
                          </h3>
                          <p>{item.remark}</p>
                        </div>
                        <button className="btn-detail" />
                      </section>
                    </li>
                  )
                })}
            </ul>
          )}
        </form>
      </div>
    </div>
  )
}
