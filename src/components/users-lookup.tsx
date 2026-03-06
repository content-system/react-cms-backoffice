import { Item } from "onecore"
import React, { ChangeEvent, useRef, useState } from "react"
import { buildMessage, buildSortFilter, getFields, getNumber, OnClick, onSort, PageChange, pageSizes, removeSortStatus, resources, SearchComponentState } from "react-hook-core"
import ReactModal from "react-modal"
import Pagination from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { toast } from "ui-toast"
import { handleError, useResource } from "uione"
import { getUserService, User, UserFilter } from "../service"

ReactModal.setAppElement("#root")
interface Props {
  isOpenModel: boolean
  users: User[]
  onModelClose?: (e: React.MouseEvent | React.KeyboardEvent) => void
  onModelSave: (e: User[]) => void
}

interface UserSearch extends SearchComponentState<User, UserFilter> {
  statusList: Item[]
  users: any[]
  availableUsers: any[]
  filter: UserFilter
  list: any[]
  model: {
    q?: string
    userId?: string
    status: string[]
  }
}
const userFilter: UserFilter = {
  limit: resources.defaultLimit,
  status: [],
}
const initialState: UserSearch = {
  limit: resources.defaultLimit,
  statusList: [],
  list: [],
  filter: userFilter,
  users: [],
  model: {
    userId: "",
    status: [],
  },
  availableUsers: [],
}
// props onModelSave onModelClose isOpenModel users?=[]
const sizes = pageSizes
export const UsersLookup = (props: Props) => {
  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  //const [state, setState] = useState<UserSearch>(initialState)
  const [state, setState] = useState<UserSearch>(initialState)
  const [filter, setFilter] = useState<UserFilter>(userFilter)
  const [list, setList] = useState<User[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [users, setUsers] = useState<User[]>(props.users)

  const isOpenModel = props.isOpenModel
  // const { list } = state
  // const filter = value(state.model)
  let index = 0

  const sort = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onSort(e, search, state, setState)
  const pageSizeChanged = (e: ChangeEvent<HTMLSelectElement>) => {
    filter.page = 1
    filter.limit = getNumber(e)
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
  const searchOnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    e.preventDefault()
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
    const urlFilter = buildSortFilter(filter, state)
    const fields = getFields(refForm.current, state.fields)
    setFilter(urlFilter)
    const { limit, page } = urlFilter
    getUserService()
      .search(urlFilter, limit, page, fields)
      .then((res) => {
        setState({ ...state, total: res.total, fields })
        setList(res.list)
        setUsers(res.list)
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  const onCheckUser = (e: OnClick) => {
    const listState = list
    const usersState = users
    const target: HTMLInputElement = e.target as HTMLInputElement
    const result = listState ? listState.find((v: any) => v.userId === target.value) : undefined
    if (result) {
      const indexCheck = usersState.indexOf(result)
      if (indexCheck !== -1) {
        delete usersState[indexCheck]
      } else {
        usersState.push(result)
      }
      setUsers(usersState)
      // setState({ users: usersState })
    }
  }

  const onModelSave = () => {
    const xUser = users
    setUsers([])
    setAvailableUsers([])
    filter.q = ""
    filter.page = 1
    setFilter(filter)
    /*
    setState({
      users: [],
      availableUsers: [],
      model: { ...state.model, q: "" },
    })
      */
    props.onModelSave(xUser)
  }

  const onModelClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    setUsers([])
    setAvailableUsers([])
    filter.q = ""
    filter.page = 1
    setFilter(filter)
    /*
    setState({
      users: [],
      availableUsers: [],
      model: { ...state.model, q: "" },
    })*/
    if (props.onModelClose) {
      props.onModelClose(e)
    }
  }

  const clearQ = () => {
    filter.q = ""
    setFilter(filter)
  }

  const onChangeText = (e: ChangeEvent<HTMLInputElement>) => {
    filter.q = e.target.value
    setFilter(filter)
    /*
    const { model } = state
    setState({
      model: { ...model, ...({ [e.target.name]: e.target.value } as any) },
    })
      */
  }
  /*
    const onSearch = (e: OnClick) => {
      setState({ list: [] })
      search(e)
    }
  */
  return (
    <ReactModal
      isOpen={isOpenModel}
      onRequestClose={onModelClose}
      contentLabel="Modal"
      // portalClassName='modal-portal'
      className="modal-portal-content"
      bodyOpenClassName="modal-portal-open"
      overlayClassName="modal-portal-backdrop"
    >
      <div>
        <header className="view-header">
          <h2>{resource.users_lookup}</h2>
          <div className="btn-group">
            {state.view === "list" && (
              <button type="button" id="btnTable" name="btnTable" className="btn-table" onClick={(e) => setState({ ...state, view: "table" })} />
            )}
            {state.view !== "list" && (
              <button type="button" id="btnListView" name="btnListView" className="btn-list" onClick={(e) => setState({ ...state, view: "list" })} />
            )}
          </div>
          <button type="button" id="btnClose" name="btnClose" className="btn-close" onClick={onModelClose} />
        </header>
        <div className="search-body">
          <form id="usersLookupForm" name="usersLookupForm" className="usersLookupForm" noValidate={true} ref={refForm as any}>
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
                <input type="text" id="q" name="q" onChange={onChangeText} value={filter.q} maxLength={40} placeholder={resource.user_lookup} />
                <button type="button" hidden={!filter.q} className="btn-remove-text" onClick={clearQ} />
                <button type="submit" className="btn-search" onClick={searchOnClick} />
              </label>
              <Pagination className="col s12 m6" total={state.total} size={filter.limit} max={7} page={filter.page} onChange={pageChanged} />
            </section>
          </form>
          <form className="list-result">
            {state.view === "list" && (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>{resource.number}</th>
                      <th data-field="userId">
                        <button type="button" id="sortUserId" onClick={sort}>
                          {resource.user_id}
                        </button>
                      </th>
                      <th data-field="username">
                        <button type="button" id="sortUsername" onClick={sort}>
                          {resource.username}
                        </button>
                      </th>
                      <th data-field="email">
                        <button type="button" id="sortEmail" onClick={sort}>
                          {resource.email}
                        </button>
                      </th>
                      <th data-field="displayname">
                        <button type="button" id="sortDisplayName" onClick={sort}>
                          {resource.display_name}
                        </button>
                      </th>
                      <th data-field="status">
                        <button type="button" id="sortStatus" onClick={sort}>
                          {resource.status}
                        </button>
                      </th>
                      <th>{resource.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state &&
                      list &&
                      list.map((user: any, i: number) => {
                        const result = users.find((v) => v.userId === user.userId)
                        return (
                          <tr key={i}>
                            <td className="text-right">{index}</td>
                            <td>{user.userId}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.displayName}</td>
                            <td>{user.status}</td>
                            <td>
                              <input type="checkbox" id={`chkSelect${i}`} value={user.userId} onClick={onCheckUser} />
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
                {
                  list.map((user: any, i: number) => {
                    const result = users.find((v) => v.userId === user.userId)
                    if (!result) {
                      index++
                      return (
                        <li key={i} className="col s12 m6 l4 xl3 img-item">
                          <img src={user.imageURL && user.imageURL.length > 0 ? user.imageURL : ""} alt="user" className="round-border" />
                          <h4 className={user.status === "I" ? "inactive" : ""}>{user.displayName}</h4>
                          <input type="checkbox" name="selected" value={user.userId} onClick={onCheckUser} />
                          <p>{user.email}</p>
                        </li>
                      )
                    }
                    return null
                  })}
              </ul>
            )}
          </form>
        </div>
        <footer className="view-footer">
          <button type="button" onClick={onModelSave}>
            {resource.select}
          </button>
        </footer>
      </div>
    </ReactModal>
  )
}
