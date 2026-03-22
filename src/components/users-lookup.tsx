import { ChangeEvent, KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react"
import { buildMessage, buildSortFilter, getFields, getOffset, onClearQ, onPageChanged, onPageSizeChanged, onSearch, onSort, PageChange, pageSizes, PageSizeSelect, resources, Sortable, updateState } from "react-hook-core"
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
  onModelClose?: (e: MouseEvent | KeyboardEvent) => void
  onModelSave: (e: User[]) => void
}

interface UserSearch extends Sortable {
  total?: number
  view?: string
  fields?: string[]
}

// props onModelSave onModelClose isOpenModel users?=[]
export const UsersLookup = (props: Props) => {
  const userFilter: UserFilter = {
    limit: resources.defaultLimit,
    status: [],
    excluding: []
  }
  const initialState: UserSearch = {}

  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [users, setUsers] = useState<User[]>([])
  const [list, setList] = useState<User[]>([])
  const [state, setState] = useState<UserSearch>(initialState)
  const [filter, setFilter] = useState<UserFilter>(userFilter)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => updateState(e, filter, setFilter)

  useEffect(() => {
    if (props.isOpenModel) {
      search()
    }
  }, [props.isOpenModel])

  const clearQ = (e: MouseEvent<HTMLButtonElement>) => onClearQ(filter, setFilter)
  const sort = (e: MouseEvent<HTMLButtonElement>) => onSort(e, search, state)
  const pageSizeChanged = (e: ChangeEvent<HTMLSelectElement>) => onPageSizeChanged(e, search, filter, setFilter)
  const pageChanged = (data: PageChange) => onPageChanged(data, search, filter, setFilter)
  const searchOnClick = (e: MouseEvent<HTMLButtonElement>) => onSearch(e, search, filter, state, setFilter, setState)

  const search = () => {
    showLoading()
    const fields = getFields(refForm.current, state.fields)
    buildSortFilter(filter, state)
    filter.excluding = props.users.map(u => u.userId)
    setFilter(filter)
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

  const onCheckUser = (e: MouseEvent<HTMLElement>) => {
    const target: HTMLInputElement = e.target as HTMLInputElement
    const user = list ? list.find((v: User) => v.userId === target.value) : undefined
    if (user) {
      const indexCheck = users.indexOf(user)
      if (indexCheck !== -1) {
        delete users[indexCheck]
      } else {
        users.push(user)
      }
      setUsers(users)
    }
  }

  const onModelSave = () => {
    props.onModelSave(users)
  }

  const onModelClose = (e: MouseEvent | KeyboardEvent) => {
    filter.q = ""
    filter.page = 0
    filter.limit = resources.defaultLimit
    setList([])
    if (props.onModelClose) {
      props.onModelClose(e)
    }
  }

  const offset = getOffset(filter.limit, filter.page)
  return (
    <ReactModal
      isOpen={props.isOpenModel}
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
              <button type="button" id="tableBtn" name="tableBtn" className="btn-table" onClick={(e) => setState({ ...state, view: "table" })} />
            )}
            {state.view !== "list" && (
              <button type="button" id="listViewBtn" name="listViewBtn" className="btn-list" onClick={(e) => setState({ ...state, view: "list" })} />
            )}
          </div>
          <button type="button" id="closeBtn" name="closeBtn" className="btn-close" onClick={onModelClose} />
        </header>
        <div className="search-body">
          <form id="usersLookupForm" name="usersLookupForm" className="usersLookupForm" noValidate={true} ref={refForm}>
            <section className="row search-group">
              <label className="col s12 m6 search-input">
                <PageSizeSelect id="limit" name="limit" size={filter.limit} sizes={pageSizes} onChange={pageSizeChanged} />
                <input type="text" id="q" name="q" value={filter.q} maxLength={80} onChange={onChange} placeholder={resource.keyword} />
                <button type="button" id="clearQBtn" name="clearQBtn" hidden={!filter.q} className="btn-remove-text" onClick={clearQ} />
                <button type="submit" id="searchBtn" name="searchBtn" className="btn-search" onClick={searchOnClick} />
              </label>
              <Pagination className="col s12 m6" total={state.total} size={filter.limit} max={7} page={filter.page} onChange={pageChanged} />
            </section>
          </form>
          <form className="list-result">
            {state.view !== "list" && (
              <div className="table-responsive">
                <table>
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
                      <th data-field="displayname">
                        <button type="button" id="displayNameSort" onClick={sort}>
                          {resource.display_name}
                        </button>
                      </th>
                      <th data-field="status">
                        <button type="button" id="statusSort" onClick={sort}>
                          {resource.status}
                        </button>
                      </th>
                      <th>{resource.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((user: any, i: number) => {
                      return (
                        <tr key={i}>
                          <td className="text-right">{offset + i + 1}</td>
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
                {list.map((user: User, i: number) => {
                  return (
                    <li key={i} className="col s12 m6 l4 xl3 img-item">
                      <img src={user.imageURL && user.imageURL.length > 0 ? user.imageURL : ""} alt="user" className="round-border" />
                      <h4 className={user.status === "I" ? "inactive" : ""}>{user.displayName}</h4>
                      <input type="checkbox" name="selected" value={user.userId} onClick={onCheckUser} />
                      <p>{user.email}</p>
                    </li>
                  )
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
