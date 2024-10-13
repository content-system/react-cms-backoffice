import { ChangeEvent, useEffect, useState } from "react"
import { OnClick } from "react-hook-core"
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
  const resource = useResource()
  const navigate = useNavigate()
  const [state, setState] = useState(initialState)
  const { role, isOpenModel, q } = state
  let { users, selectedUsers, isCheckboxShown } = state
  const { shownUsers } = state
  const isReadOnly = !hasPermission(write, 2)
  const { id } = useParams()
  useEffect(() => {
    if (id) {
      const userService = getUserService()
      const roleService = getRoleService()
      showLoading()
      Promise.all([userService.getUsersByRole(id), roleService.load(id)])
        .then((values) => {
          const [users, role] = values
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
  const save = (e: OnClick) => {
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
      selectedUsers = []
      setState({ ...state, role, users, selectedUsers, isCheckboxShown: false })
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

  const back = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    navigate(-1)
  }
  const clearQ = (e: OnClick) => {
    e.preventDefault()
    setState({ ...state, q: "" })
  }
  return (
    <div className="view-container">
      <form id="roleAssignmentForm" name="roleAssignmentForm" model-name="role">
        <header>
          <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
          <h2>{role.roleName && role.roleName.length > 0 ? role.roleName : resource.role_assignment_subject}</h2>
        </header>
        <div>
          <section className="row">
            <label className="col s12 m6">
              {resource.role_id}
              <input type="text" id="roleId" name="roleId" value={role.roleId || ""} maxLength={255} placeholder={resource.roleId} disabled={true} />
            </label>
            <label className="col s12 m6">
              {resource.role_name}
              <input type="text" id="roleName" name="roleName" value={role.roleName || ""} maxLength={255} placeholder={resource.role_name} disabled={true} />
            </label>
          </section>
          <section className="row detail">
            <h4>
              {resource.user}
              {!isReadOnly && (
                <div className="btn-group">
                  <button type="button" name="btnAdd" onClick={() => setState({ ...state, isOpenModel: true })}>
                    {resource.add}
                  </button>
                  <button type="button" name="btnSelect" onClick={onShowCheckBox}>
                    {isCheckboxShown ? resource.deselect : resource.select}
                  </button>
                  {isCheckboxShown && (
                    <button type="button" name="btnCheckAll" onClick={onCheckAll}>
                      {resource.check_all}
                    </button>
                  )}
                  {isCheckboxShown && (
                    <button type="button" name="btnUncheckAll" onClick={onUnCheckAll}>
                      {resource.uncheck_all}
                    </button>
                  )}
                  {isCheckboxShown && (
                    <button type="button" name="btnDelete" onClick={onDelete}>
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
              <button type="button" hidden={!q} className="btn-remove-text" onClick={clearQ} />
            </label>
            <ul className="row list-view">
              {shownUsers &&
                shownUsers?.map((user, i) => {
                  const result = selectedUsers.find((v) => v.userId === user.userId)
                  return (
                    <li key={i} className="col s12 m6 l4 xl3" onClick={isCheckboxShown === true ? () => onCheck(user.userId) : () => {}}>
                      <section>
                        {isCheckboxShown === true ? <input type="checkbox" name="selected" checked={result ? true : false} /> : ""}
                        <img
                          alt=""
                          src={user.imageURL && user.imageURL.length > 0 ? user.imageURL : user.gender === "F" ? femaleIcon : maleIcon}
                          className="round-border"
                        />
                        <div>
                          <h3>{user.displayName}</h3>
                          <p>{user.email}</p>
                        </div>
                      </section>
                    </li>
                  )
                })}
            </ul>
          </section>
        </div>
        <footer>
          <button type="submit" id="btnSave" name="btnSave" onClick={save} disabled={isReadOnly}>
            {resource.save}
          </button>
        </footer>
      </form>
      <UsersLookup isOpenModel={isOpenModel} onModelClose={onModelClose} onModelSave={onModelSave} users={users} />
    </div>
  )
}
