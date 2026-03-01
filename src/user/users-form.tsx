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
import { getStatusName, handleError, hasPermission, Permission, useResource } from "uione"
import femaleIcon from "../assets/images/female.png"
import maleIcon from "../assets/images/male.png"
import { getUserService, User, UserFilter } from "./service"

interface UserSearch extends Sortable {
  statusList: Item[]
  list: User[]
  total?: number
  view?: string
  fields?: string[]
}

const sizes = pageSizes
export const UsersForm = () => {
  const canWrite = hasPermission(Permission.write)

  const userFilter: UserFilter = {
    limit: 24,
    username: "",
    displayName: "",
    status: ["A"],
    q: "",
  }
  const initialState: UserSearch = {
    statusList: [],
    list: [],
  }

  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<UserSearch>(initialState)
  const [filter, setFilter] = useState<UserFilter>(userFilter)
  const [showFilter, setShowFilter] = useState<boolean>(false)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<UserFilter>(), filter, sizes, ["status"])
    setSort(state, filter.sort)
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
    getUserService()
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
  const { list } = state
  const offset = getOffset(filter.limit, filter.page)
  return (
    <div>
      <header>
        <h2>{resource.users}</h2>
        <div className="btn-group">
          {state.view !== "table" && (
            <button type="button" id="btnTable" name="btnTable" className="btn-table" onClick={(e) => setState({ ...state, view: "table" })} />
          )}
          {state.view === "table" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list" onClick={(e) => setState({ ...state, view: "" })} />
          )}
          {canWrite && <Link id="btnNew" className="btn-new" to="new" />}
        </div>
      </header>
      <div className="search-body">
        <form id="usersForm" name="usersForm" className="form" noValidate={true} ref={refForm as any}>
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
            <label className="col s12 m4 l4">
              {resource.username}
              <input
                type="text"
                id="username"
                name="username"
                value={filter.username || ""}
                onChange={(e) => {
                  filter.username = e.target.value
                  setFilter({ ...filter })
                }}
                maxLength={255}
                placeholder={resource.username}
              />
            </label>
            <label className="col s12 m4 l4">
              {resource.display_name}
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={filter.displayName || ""}
                onChange={(e) => {
                  filter.displayName = e.target.value
                  setFilter({ ...filter })
                }}
                maxLength={255}
                placeholder={resource.display_name}
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
        {state.view === "table" && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{resource.sequence}</th>
                  <th data-field="userId">
                    <button type="button" id="sortUserId" onClick={sort}>
                      {resource.user_id}
                    </button>
                  </th>
                  <th data-field="username">
                    <button type="button" id="sortUserName" onClick={sort}>
                      {resource.username}
                    </button>
                  </th>
                  <th data-field="email">
                    <button type="button" id="sortEmail" onClick={sort}>
                      {resource.email}
                    </button>
                  </th>
                  <th data-field="displayName">
                    <button type="button" id="sortDisplayName" onClick={sort}>
                      {resource.display_name}
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
                  list.map((user, i) => {
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
        {state.view !== "table" && (
          <ul className="row list">
            {list &&
              list.length > 0 &&
              list.map((user, i) => {
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
