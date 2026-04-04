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
  resetSearch,
  resources,
  Search,
  setSortFilter,
  Sortable,
  updateState
} from "react-hook-core"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { toast } from "ui-toast"
import { getStatusName, handleError, hasPermission, Permission, useResource } from "uione"
import femaleIcon from "../assets/images/female.png"
import maleIcon from "../assets/images/male.png"
import { getUserService, User, UserFilter } from "./service"

interface UserSearch extends Sortable {
  statusList: Item[]
  total?: number
  view?: string
  fields?: string[]
}

export const UsersForm = () => {
  const canWrite = hasPermission(Permission.write)

  const userFilter: UserFilter = {
    limit: resources.defaultLimit,
    status: ["A"],
  }
  const initialState: UserSearch = {
    statusList: [],
  }

  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [list, setList] = useState<User[]>([])
  const [state, setState] = useState<UserSearch>(initialState)
  const [filter, setFilter] = useState<UserFilter>(userFilter)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => updateState(e, filter, setFilter)
  const statusOnChange = (e: ChangeEvent<HTMLInputElement>) => resetSearch(e, filter, setFilter, search)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<UserFilter>(), filter, pageSizes, ["status"])
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
    getUserService()
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
        <h2>{resource.users}</h2>
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
        <form id="usersForm" name="usersForm" className="form" noValidate={true} ref={refForm}>
          <section className="row search-group">
            <Search className="col s12 m6 search-input"
              id="limit"
              name="limit"
              size={filter.limit}
              sizes={pageSizes}
              maxLength={80}
              value={filter.q}
              placeholder={resource.keyword}
              pageSizeChanged={pageSizeChanged}
              search={searchOnClick}
              toggle={toggleSearch}
              clear={clearQ}
              onChange={onChange} />
            <Pagination className="col s12 m6" total={state.total} size={filter.limit} max={7} page={filter.page} onChange={pageChanged} />
          </section>
          <section className="row search-group inline" hidden={!showFilter}>
            <label className="col s12 m4 l4 checkbox-section">
              {resource.status}
              <section className="checkbox-group">
                <label>
                  <input type="checkbox" id="A" name="status" value="A" checked={checked(filter.status, "A")} onChange={statusOnChange} />
                  {resource.active}
                </label>
                <label>
                  <input type="checkbox" id="I" name="status" value="I" checked={checked(filter.status, "I")} onChange={statusOnChange} />
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
                  <th data-field="userId">
                    <button type="button" id="userIdSort" onClick={sort}>
                      {resource.user_id}
                    </button>
                  </th>
                  <th data-field="username">
                    <button type="button" id="usernameSort" onClick={sort}>
                      {resource.username}
                    </button>
                  </th>
                  <th data-field="email">
                    <button type="button" id="emailSort" onClick={sort}>
                      {resource.email}
                    </button>
                  </th>
                  <th data-field="displayName">
                    <button type="button" id="displayNameSort" onClick={sort}>
                      {resource.display_name}
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
                {list.map((user, i) => {
                  return (
                    <tr key={i}>
                      <td className="text-right">{offset + i + 1}</td>
                      <td>{user.userId}</td>
                      <td>
                        <Link to={`${user.userId}`}>{user.username}</Link>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.displayName}</td>
                      <td>{getStatusName(user.status, resource)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {state.view === "list" && (
          <ul className="row list">
            {list.map((user, i) => {
              return (
                <li key={i} className="col s12 m6 l4 xl3 img-item">
                  <img
                    src={user.imageURL && user.imageURL.length > 0 ? user.imageURL : user.gender === "F" ? femaleIcon : maleIcon}
                    alt="user"
                    className="round-border"
                  />
                  <Link to={`${user.userId}`}>{user.displayName}</Link>
                  <button className="btn-detail" />
                  <p>{user.email}</p>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
