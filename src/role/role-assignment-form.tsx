import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { handleError, hasPermission, showMessage, useResource, write } from "uione"
import femaleIcon from "../assets/images/female.png"
import maleIcon from "../assets/images/male.png"
import { UsersLookup } from "../components/users-lookup"
import { getRoleService, getUserService, Role, User } from "./service"

interface InternalState {
  role: Role
  users: User[]
  shownUsers: User[]
  q: string
  isOpenModel: boolean
  isCheckboxShown: boolean
  selectedUsers: User[]
}

const initialState: InternalState = {
  role: {} as any,
  users: [],
  shownUsers: [],
  q: "",
  isOpenModel: false,
  isCheckboxShown: false,
  selectedUsers: [],
}
const getIds = (users?: User[]): string[] => {
  return users ? users.map((item) => item.userId) : []
}

export const RoleAssignmentForm = () => {
  const isReadOnly = !hasPermission(write, 2)
  const resource = useResource()
  const navigate = useNavigate()
  const [state, setState] = useState(initialState)
  const { role, isOpenModel, q } = state
  let { users, selectedUsers, isCheckboxShown } = state
  const { shownUsers } = state

  const { id } = useParams()
  useEffect(() => {
    if (id) {
      const userService = getUserService()
      const roleService = getRoleService()
      showLoading()
      Promise.all([userService.getUsersByRole(id), roleService.load(id)])
        .then((values) => {
          let [users, role] = values
          if (!users) {
            users = []
          }
          if (role) {
            setState({ ...state, users, shownUsers: users, role })
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (users) {
      const v = e.target.value
      const result = users.filter(
        (u) => (u.username && u.username.includes(v)) || (u.displayName && u.displayName.includes(v)) || (u.email && u.email.includes(v)),
      )
      const obj = { [e.target.name]: e.target.value, shownUsers: result } as any
      setState({ ...state, ...obj })
    }
  }
  const save = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const userIDs = getIds(users)
    confirm(resource.msg_confirm_save, () => {
      showLoading()
      getRoleService()
        .assign(role.roleId, userIDs)
        .then((res) => showMessage(resource.msg_save_success))
        .catch(handleError)
        .finally(hideLoading)
    })
  }

  const onModelSave = (arr: User[]) => {
    arr.map((value) => users.push(value))
    setState({ ...state, q: "", role, users, shownUsers: users, isOpenModel: false })
  }

  const onModelClose = () => {
    setState({ ...state, isOpenModel: false })
  }

  const onCheck = (userId: string) => {
    if (users) {
      const user = users.find((v) => v.userId === userId)
      if (user) {
        const index = selectedUsers.indexOf(user)
        if (index !== -1) {
          delete selectedUsers[index]
        } else {
          selectedUsers.push(user)
        }
      }
    }
    setState({ ...state, selectedUsers })
  }

  const onShowCheckBox = () => {
    if (isCheckboxShown === false) {
      isCheckboxShown = true
    } else {
      isCheckboxShown = false
    }
    setState({ ...state, isCheckboxShown })
  }

  const onDelete = () => {
    confirm(resource.msg_confirm_delete, () => {
      const arr: User[] = []
      users.map((value) => {
        const user = selectedUsers.find((v) => v.userId === value.userId)
        if (!user) {
          arr.push(value)
        }
        return null
      })
      users = arr
      const shownUsers = arr
      selectedUsers = []
      setState({ ...state, role, users, shownUsers, selectedUsers, isCheckboxShown: false })
    })
  }

  const onCheckAll = () => {
    if (users) {
      selectedUsers = users
    }
    setState({ ...state, selectedUsers })
  }

  const onUnCheckAll = () => {
    setState({ ...state, selectedUsers: [] })
  }

  return (
    <div className="view-container">
      <form id="roleAssignmentForm" name="roleAssignmentForm" className="form">
        <header className="view-header">
          <button type="button" id="backBtn" name="backBtn" className="btn-back" onClick={e => navigate(-1)} />
          <h2>{role.roleName && role.roleName.length > 0 ? role.roleName : resource.role_assignment_subject}</h2>
        </header>
        <div className="form-body">
          <section className="row section">
            <label className="col s12 m6">
              {resource.role_id}
              <input type="text" id="roleId" name="roleId" value={role.roleId} maxLength={255} placeholder={resource.roleId} disabled={true} />
            </label>
            <label className="col s12 m6">
              {resource.role_name}
              <input type="text" id="roleName" name="roleName" value={role.roleName} maxLength={255} placeholder={resource.role_name} disabled={true} />
            </label>
          </section>
          <section className="row section">
            <h4 className="header">
              {resource.user}
              {!isReadOnly && (
                <div className="btn-group">
                  <button type="button" id="addBtn" name="addBtn" onClick={() => setState({ ...state, isOpenModel: true })}>
                    {resource.add}
                  </button>
                  <button type="button" id="selectBtn" name="selectBtn" onClick={onShowCheckBox}>
                    {isCheckboxShown ? resource.deselect : resource.select}
                  </button>
                  {isCheckboxShown && (
                    <button type="button" id="checkAllBtn" name="checkAllBtn" onClick={onCheckAll}>
                      {resource.check_all}
                    </button>
                  )}
                  {isCheckboxShown && (
                    <button type="button" id="uncheckAllBtn" name="uncheckAllBtn" onClick={onUnCheckAll}>
                      {resource.uncheck_all}
                    </button>
                  )}
                  {isCheckboxShown && (
                    <button type="button" id="deleteBtn" name="deleteBtn" onClick={onDelete}>
                      {resource.delete}
                    </button>
                  )}
                </div>
              )}
            </h4>
            <label className="col s12 search-input">
              <i className="btn-search" />
              <input
                type="text"
                id="q"
                name="q"
                onChange={onSearch}
                value={q}
                maxLength={40}
                placeholder={resource.role_assignment_search_user}
                autoComplete="off"
              />
              {/*<button type="button" hidden={!q} className="btn-remove-text" onClick={clearQ} />*/}
            </label>
          </section>
          <ul className="row list">
            {shownUsers &&
              shownUsers?.map((user, i) => {
                const result = selectedUsers.find((v) => v.userId === user.userId)
                return (
                  <li key={i} className="col s12 m6 l4 xl3 small img-item" onClick={isCheckboxShown === true ? () => onCheck(user.userId) : () => { }}>
                    <img
                      alt=""
                      src={user.imageURL && user.imageURL.length > 0 ? user.imageURL : user.gender === "F" ? femaleIcon : maleIcon}
                      className="round-border"
                    />
                    <h4>{user.displayName}</h4>
                    {isCheckboxShown === true ? <input type="checkbox" name="selected" checked={result ? true : false} /> : ""}
                    <p>{user.email}</p>
                  </li>
                )
              })}
          </ul>
        </div>
        <footer className="view-footer">
          <button type="submit" id="saveBtn" name="saveBtn" onClick={save} disabled={isReadOnly}>
            {resource.save}
          </button>
        </footer>
      </form>
      <UsersLookup isOpenModel={isOpenModel} onModelClose={onModelClose} onModelSave={onModelSave} users={users} />
    </div>
  )
}
