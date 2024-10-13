import { ChangeEvent, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { handleError, hasPermission, Permission, showMessage, useResource } from "uione"
import { getRoleService, getUserService, User } from "./service"
import "./style.css"
import { Role } from "./user"

interface InternalState {
  user: User
  roles: Role[]
  selectedRoles: Role[]
  checkedAll: boolean
}

const initialState: InternalState = {
  user: {} as any,
  roles: [],
  selectedRoles: [],
  checkedAll: false,
}
const getRoles = (roles?: Role[]): string[] => {
  return roles ? roles.map((item) => item.roleId) : []
}

export const RoleAssignmentForm = () => {
  const resource = useResource()
  const navigate = useNavigate()
  const userService = getUserService()
  const [state, setState] = useState(initialState)
  const { user } = state
  let { roles, selectedRoles, checkedAll } = state
  const disabled = !hasPermission(Permission.write, 2)
  const { id } = useParams()
  useEffect(() => {
    if (id) {
      const userService = getUserService()
      const roleService = getRoleService()
      showLoading()
      Promise.all([roleService.all(), userService.load(id)])
        .then((values) => {
          const [roles, user] = values
          const userRoles = roles.filter((role) => user?.roles?.includes(role.roleId))
          if (user) {
            const checkedAll = roles.length === user?.roles?.length
            setState({ ...state, roles, selectedRoles: userRoles, user, checkedAll })
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    const userRoles = getRoles(selectedRoles)
    confirm(resource.msg_confirm_save, () => {
      showLoading()
      userService
        .patch({
          userId: user.userId,
          roles: userRoles,
        })
        .then((res) => {
          showMessage(resource.msg_save_success)
        })
        .catch(handleError)
        .finally(hideLoading)
    })
  }

  const onCheck = (e: ChangeEvent<HTMLInputElement>, id: string) => {
    if (roles) {
      const role = roles.find((v) => v.roleId === id)
      if (role) {
        const index = selectedRoles.indexOf(role)
        if (index !== -1) {
          selectedRoles = selectedRoles.filter((item) => item.roleId !== id)
        } else {
          selectedRoles.push(role)
        }
      }
      checkedAll = roles.length === selectedRoles.length
    }
    setState({ ...state, selectedRoles, checkedAll })
  }

  const onCheckAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && roles) {
      selectedRoles = roles
      checkedAll = true
    } else {
      selectedRoles = []
      checkedAll = false
    }
    setState({ ...state, selectedRoles, checkedAll })
  }

  const back = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    navigate(-1)
  }
  return (
    <div className="view-container">
      <form id="roleAssignmentForm" name="roleAssignmentForm" model-name="role">
        <header>
          <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
          <h2>{resource.role_assignment_subject}</h2>
        </header>
        <div>
          <section className="row">
            <label className="col s12 m6">
              {resource.email}
              <input type="text" id="email" name="email" value={user.email || ""} maxLength={255} placeholder={resource.email} disabled={true} />
            </label>
          </section>
          <section className="list-container">
            <ul className="row list-view">
              <li className="col check-item header">
                <input type="checkbox" id="checkAll" name="checkAll" disabled={disabled} checked={checkedAll} onChange={(e) => onCheckAll(e)} />
                <p>{resource.check_all}</p>
              </li>
              {roles &&
                roles?.map((item, i) => {
                  return (
                    <li key={i} className="col check-item">
                      <input
                        type="checkbox"
                        name="selected"
                        disabled={disabled}
                        checked={selectedRoles.includes(item)}
                        onChange={(e) => onCheck(e, item.roleId)}
                      />
                      <p>{item.roleName}</p>
                    </li>
                  )
                })}
            </ul>
          </section>
        </div>
        <footer>
          <button type="submit" id="btnSave" name="btnSave" onClick={save} disabled={disabled}>
            {resource.save}
          </button>
        </footer>
      </form>
    </div>
  )
}
