import { ChangeEvent, useEffect, useRef, useState } from "react"
import { createModel, DispatchWithCallback, EditComponentParam, OnClick, setReadOnly, useEdit } from "react-hook-core"
import { useNavigate } from "react-router-dom"
import { checkPatternOnBlur, handleError, hasPermission, inputEdit, Status, write } from "uione"
import { getRoleService, Privilege, Role } from "./service"
import "./style.css"

const regexId = "^(?=.*[a-z])[a-z0-9_]{1,100}$" // lowercase letters, numbers and underscores

interface Permission {
  id: string
  actions: number
  permissions: number
}

interface ShownItem {
  action: number
  shown: boolean
}

interface InternalState {
  role: Role
  allPrivileges: Privilege[]
  shownPrivileges: Privilege[]
  checkedAll?: boolean
  keyword: string
  all: string[]
  actions: Map<string, number>
  maxAction: number
}

const initialState: InternalState = {
  role: {} as Role,
  allPrivileges: [],
  shownPrivileges: [],
  keyword: "",
  checkedAll: false,
  all: [],
  actions: new Map([]),
  maxAction: 0,
}

const createRole = (): Role => {
  const role = createModel<Role>()
  role.privileges = []
  role.status = Status.Active
  return role
}

function getPrivilege(id: string, all: Privilege[]): Privilege | undefined {
  if (!all || !id || id === "") {
    return undefined
  }
  for (const root of all) {
    if (root.id === id) {
      return root
    }
    if (root.children && root.children.length > 0) {
      const m = getPrivilege(id, root.children)
      if (m) {
        return m
      }
    }
  }
  return undefined
}

function buildAll(privileges: string[], all: Privilege[]): void {
  for (const root of all) {
    privileges.push(root.id)
    if (root.children && root.children.length > 0) {
      buildAll(privileges, root.children)
    }
  }
}

function buildActionAll(actions: Map<string, number>, all: Privilege[]): void {
  for (const root of all) {
    actions.set(root.id, +root.actions)
    if (root.children && root.children.length > 0) {
      buildActionAll(actions, root.children)
    }
  }
}

function getMax(map: Map<string, number>): number {
  let max = -Infinity
  map.forEach((value, key) => {
    if (value > max) {
      max = value
    }
  })
  return max
}

function mergeArray(dest: Permission[], src: Permission[], allowPermission0?: Boolean) {
  for (let i = 0; i < src.length; i++) {
    const item = src[i]
    const index = dest.findIndex((k) => k.id === item.id)
    if (index !== -1) {
      dest.splice(index, 1)
    }
    if (allowPermission0) {
      dest.push(item)
    } else {
      if (item.permissions > 0) {
        dest.push(item)
      }
    }
  }
}

function filterPermission(parentId: string | undefined, mapPermissions: Permission[], all: Privilege[], actions: Map<string, number>): Permission[] {
  const parent = getPrivilege(parentId || "", all)
  const childrenIds = parent?.children?.map((item) => item.id) || []
  const hasChild = mapPermissions.some((i) => childrenIds.includes(i.id) && i.permissions > 0)
  if (hasChild && parentId) {
    mergeArray(mapPermissions, [{ id: parentId, actions: actions.get(parentId) || 0, permissions: 0 }], true)
    return mapPermissions
  }
  return mapPermissions.filter((i) => i.id !== parentId)
}

function isChecked(id: string, privileges: Permission[]): boolean {
  if (!privileges) return false
  return privileges && privileges.find((item) => item.id === id && item.permissions > 0) ? true : false
}

function checked(id: string, action: number, privileges: Permission[]): boolean {
  const privilege = privileges.find((item) => item.id === id)
  if (!privilege) return false
  return Boolean(privilege?.permissions & action)
}

function bitwiseAnd(numbers: number[], result: number): number {
  for (let num of numbers) {
    result &= num
  }
  return result
}

function mapPermissionOfParent(id: string, childPermissions: Permission[], actions: Map<string, number>) {
  const groupActionAndPermission = new Map<number, number[]>()
  // check permission of parent
  let permission = 0
  if (childPermissions.length === 1) {
    permission = childPermissions[0].permissions
  } else {
    for (let i = 0; i < childPermissions.length; i++) {
      const item = childPermissions[i]
      let a = groupActionAndPermission.get(item.actions) || []
      a.push(item.permissions)
      groupActionAndPermission.set(item.actions, a)
    }
    groupActionAndPermission.forEach((value, key) => {
      const f = bitwiseAnd(value, key)
      permission = permission | f
    })
  }
  const maxAction = actions.get(id) || 0
  childPermissions.push({ id: id, actions: maxAction, permissions: permission & maxAction })
  return childPermissions
}

function mapPermission(actions: Map<string, number>, item: Permission, pCheckedValue: number, uChecked: boolean): Permission {
  const actionMax = actions.get(item.id) || 1
  const id = item.id
  let v = item.permissions | pCheckedValue
  if (!uChecked) {
    if (pCheckedValue === 1) {
      v = item.permissions & 0 // OR
    } else {
      v = item.permissions ^ pCheckedValue // XOR
    }
  }
  if (pCheckedValue > actionMax) {
    return { id: item.id, actions: actionMax, permissions: actionMax }
  }
  return { id: id, actions: actionMax, permissions: v }
}

function getColumns(maxAction: number): number[] {
  let i = 0
  let total = 0
  let rs = []
  while (total < maxAction) {
    const action = 1 << i
    total = total + action
    rs.push(action)
    i++
  }
  return rs
}

function binaryStringToArray(binaryString: string): string[] {
  // Use the split method to convert the binary string to an array of characters
  return binaryString.split("")
}

function decimalToBinary(decimal: number): string {
  // Convert decimal to binary using the toString method with base 2
  return (decimal >>> 0).toString(2)
}

function padLeft(str: string, num: number) {
  return str.padStart(num, "0")
}

const handleCheckAllModule = (
  e: ChangeEvent<HTMLInputElement>,
  privileges: string[] | undefined,
  all: string[],
  actions: Map<String, number>,
  callback: (privileges: string[]) => void,
) => {
  e.preventDefault()
  const checked = e.target.checked
  if (!checked) {
    callback([])
    return
  }

  if (!privileges) {
    privileges = []
  }
  if (checked) {
    privileges = []
    for (const m of all) {
      privileges.push(m + " " + actions.get(m))
    }
  }

  callback(privileges || [])
}

function buildShownModules(q: string, all: Privilege[]): Privilege[] {
  if (!q || q === "") {
    return all
  }
  const w = q.toLowerCase()
  const shownPrivileges = all
    .map((parent) => {
      const parentCopy = Object.assign({}, parent)
      if (parentCopy.children) {
        parentCopy.children = parentCopy.children.filter((child) => child.name.toLowerCase().includes(w))
      }
      return parentCopy
    })
    .filter((item) => (item.children && item.children.length > 0) || item.name.toLowerCase().includes(w))
  return shownPrivileges
}

function buildPermissions(actions: Map<string, number>, privileges?: string[]): Permission[] {
  if (!privileges || privileges.length === 0) {
    return []
  }
  return privileges.map((privilege) => {
    let permissions: number = 1
    const p = privilege.split(" ")
    if (p.length > 1) {
      permissions = +p[1] // convert string to number
    } else {
      permissions = 0
    }
    const id = p[0]
    return { id: id, actions: actions.get(id) || 0, permissions: permissions || 0 }
  })
}

const initialize = async (roleId: string | null, load: (id: string | null) => void, set: DispatchWithCallback<Partial<InternalState>>) => {
  const roleService = getRoleService()
  roleService
    .getPrivileges()
    .then((allPrivileges) => {
      const all: string[] = []
      const actions = new Map<string, number>()
      buildAll(all, allPrivileges)
      buildActionAll(actions, allPrivileges)
      set({ all, actions, allPrivileges, shownPrivileges: allPrivileges, maxAction: getMax(actions) }, () => load(roleId))
    })
    .catch(handleError)
}
const param: EditComponentParam<Role, string, InternalState> = {
  createModel: createRole,
  initialize,
}

export function RoleForm() {
  const navigate = useNavigate()
  const refForm = useRef()
  const { state, setState, back, flag, updateState, save, resource } = useEdit<Role, string, InternalState>(
    refForm,
    initialState,
    getRoleService(),
    inputEdit(),
    param,
  )
  const isReadOnly = !hasPermission(write, 1)
  const [privileges, setPrivileges] = useState<Permission[]>([])
  let seq = 1

  useEffect(() => {
    const obj = state.role
    if (obj) {
      const { all, actions } = state
      if (!obj.privileges) {
        obj.privileges = []
      } else {
        setPrivileges(buildPermissions(actions, obj.privileges))
      }
      if (isReadOnly) {
        setReadOnly(refForm.current as any, "keyword", "btnSave")
      }
      setState({ role: obj }, () => isCheckedAll(obj.privileges, all))
    }
  }, [state.role, isReadOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const isCheckedAll = (privileges: string[] | undefined, all: string[]) => {
    const checkedAll = privileges && all && privileges.length === all.length
    setState({ checkedAll })
    return checkedAll
  }

  const handleCheckParent = (e: ChangeEvent<HTMLInputElement>, id: string) => {
    e.preventDefault()
    const { all, allPrivileges, actions } = state
    const obj = state.role
    const checked = e.target.checked
    let mapPermissions = privileges
    const parentPrivilege = getPrivilege(id || "", allPrivileges)
    if (parentPrivilege !== undefined) {
      let childrenPermission =
        parentPrivilege?.children?.map((k) => {
          const act = actions.get(k.id) || 0
          return {
            id: k.id,
            actions: act,
            permissions: checked ? act : 0,
          }
        }) || []
      mergeArray(mapPermissions, childrenPermission)
    }
    mapPermissions = filterPermission(id, mapPermissions, allPrivileges, actions)
    const mapToSavePrivileges = mapPermissions.map((p) => {
      return p.id + " " + p.permissions
    })
    setState({ role: { ...obj, privileges: mapToSavePrivileges } }, () => isCheckedAll(role.privileges, all))
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    const { allPrivileges } = state
    const shownPrivileges = buildShownModules(q, allPrivileges)
    setState({ keyword: q, shownPrivileges })
  }

  const assign = (e: OnClick, id: string) => {
    e.preventDefault()
    navigate(`/roles/${id}/assign`)
    return
  }
  const handleCheckBox = (event: ChangeEvent<HTMLInputElement>, id: string, parentId?: string, currentPrivilege?: Privilege, force?: boolean) => {
    event.preventDefault()
    const uChecked: boolean = event.target.checked
    let pChecked: number = +event.target.value
    const { actions, allPrivileges } = state
    let permissions = privileges

    if (currentPrivilege === undefined) {
      return
    }
    // is parent
    const isParent = currentPrivilege?.children !== null && currentPrivilege?.children
    if (isParent) {
      // map privilegeCurrent -> permission current
      let childrenPermission =
        currentPrivilege?.children?.map((k) => {
          const e = permissions.find((i) => i.id === k.id)
          if (e !== undefined) {
            return e
          }
          return {
            id: k.id,
            actions: actions.get(k.id) || 0,
            permissions: uChecked ? 1 : 0,
          }
        }) || []
      let pChildren = childrenPermission.map((p) => {
        return mapPermission(actions, p, pChecked, uChecked)
      })
      pChildren = mapPermissionOfParent(id, pChildren, actions)
      mergeArray(permissions, pChildren)
    } else {
      const existed = permissions.find((i) => i.id === currentPrivilege.id)
      if (!existed) {
        permissions.push({
          id,
          actions: actions.get(id) || 0,
          permissions: 0,
        })
      }
      if (existed !== undefined) {
        existed.actions = actions.get(currentPrivilege.id) || 0
      }
      permissions = permissions.map((p) => {
        if (p.id === currentPrivilege.id) {
          if (force) {
            p.permissions = uChecked ? pChecked : 0
            return p
          }
          if (pChecked > 1) {
            if (p.permissions < pChecked) {
              //case Prevent unchecking "read" if "write" is unchecked, but "delete" is not unchecked => read checked
              pChecked = pChecked ^ 1 // xor 1 - if it has permission is write / delete / approve -> permission read
            }
          }
          return mapPermission(actions, p, pChecked, uChecked)
        }
        return p
      })
      // check permission of parent
      if (parentId !== "") {
        const privilegeParent = getPrivilege(parentId || "", allPrivileges)
        if (privilegeParent !== undefined) {
          let childrenPermission =
            privilegeParent?.children?.map((k) => {
              const e = permissions.find((i) => i.id === k.id)
              if (e !== undefined) {
                e.actions = actions.get(e.id) || 0
                return e
              }
              return {
                id: k.id,
                actions: actions.get(id) || 0,
                permissions: 0,
              }
            }) || []
          const pChildren = mapPermissionOfParent(parentId || "", childrenPermission, actions)
          mergeArray(permissions, pChildren)
        }
      } else {
        for (let i = 0; i < permissions.length; i++) {
          const p = permissions[i]
          if (p.permissions === 0 && p.id === id) {
            permissions.splice(i, 1)
          }
        }
      }
    }
    permissions = filterPermission(parentId, permissions, allPrivileges, actions)
    const mapToSavePrivileges = permissions.map((p) => {
      if (p.id === parentId) {
        return p.id + " 0"
      }
      return p.id + " " + p.permissions
    })
    setPrivileges(permissions)
    setState({ role: { ...state.role, privileges: mapToSavePrivileges } }, function () {
      isCheckedAll(mapToSavePrivileges, state.all)
    })
  }

  const isParentChecked = (id: string, child: Privilege[], privileges: Permission[]) => {
    if (!privileges) {
      return false
    }
    if (child === undefined) {
      return false
    }
    const ids = child?.filter((i) => i.id !== id).map((i) => i.id) || []
    if (privileges.length < ids.length) {
      return false
    }
    const { actions } = state
    const checked = privileges.filter((item) => ids.includes(item.id) && item.permissions === actions.get(item.id))
    return checked.length === ids.length
  }

  const getColumnsOfRow = (action: number): ShownItem[] => {
    const { maxAction: maxActionAll } = state
    let binaryString = decimalToBinary(action)
    let maxLen = decimalToBinary(maxActionAll)
    binaryString = padLeft(binaryString, maxLen.length)
    let binaryArray = binaryStringToArray(binaryString)
    const cols = getColumns(action)
    binaryArray.reverse()
    return binaryArray.map((item, i) => {
      return { shown: item === "1", action: cols[i] }
    })
  }

  const renderForms = (modules: Privilege[] | undefined, parentId: string, disabled: boolean, isChild?: boolean) => {
    if (!modules || modules.length === 0) {
      return ""
    }
    return modules.map((m) => renderForm(m, parentId, disabled, isChild))
  }

  const renderForm = (p: Privilege, parentId: string, disabled: boolean, isChild?: boolean) => {
    if (p.children && p.children.length > 0) {
      return (
        <div className={"row"}>
          <div className="row">
            <div className="flex-gap-2 col s4">
              {seq++} .
              <input type="checkbox" disabled={disabled} onChange={(e) => handleCheckParent(e, p.id)} checked={isParentChecked(p.id, p.children, privileges)} />
              <p>{p.name}</p>
              {resource.select_all}
            </div>
          </div>
          {renderForms(p.children, p.id, disabled, true)}
        </div>
      )
    } else {
      return (
        <div className={`row ${isChild && "sub-menu-level-2"}`} key={p.id}>
          <div className={`col s6 m4 inline flex-gap-2`}>
            {seq++} .
            <input
              type="checkbox"
              value={p.actions}
              disabled={disabled}
              onChange={(e) => handleCheckBox(e, p.id, parentId, p, true)}
              checked={isChecked(p.id, privileges)}
            ></input>
            <p>{p.name}</p>
          </div>
          {getColumnsOfRow(p.actions).map((item, index) => {
            const action = item.action
            const c = checked(p.id, action, privileges)
            return (
              <input
                key={action}
                value={action}
                type="checkbox"
                checked={item.shown ? c : false}
                disabled={disabled}
                className="col s1 m2 center"
                style={{ visibility: item.shown ? "unset" : "hidden" }}
                onChange={(e) => handleCheckBox(e, p.id, parentId, p)}
              ></input>
            )
          })}
        </div>
      )
    }
  }
  const role = state.role
  return (
    <div className="view-container">
      <form id="roleForm" name="roleForm" model-name="role" ref={refForm as any}>
        <header>
          <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
          <h2>{resource.role}</h2>
          <button className="btn-group btn-right" hidden={flag.newMode}>
            <i className="material-icons" onClick={(e) => assign(e, role.roleId)}>
              group
            </i>
          </button>
        </header>
        <div>
          <section className="row">
            <label className="col s6 m6">
              {resource.role_id}
              <input
                type="text"
                id="roleId"
                name="roleId"
                value={role.roleId || ""}
                onBlur={checkPatternOnBlur}
                pattern={regexId}
                config-pattern-error-key={"invalid_pattern_id"}
                onChange={updateState}
                maxLength={20}
                required={true}
                readOnly={!flag.newMode}
                placeholder={resource.role_id}
              />
            </label>
            <label className="col s6 m6">
              {resource.role_name}
              <input
                type="text"
                id="roleName"
                name="roleName"
                value={role.roleName || ""}
                onChange={updateState}
                maxLength={255}
                required={true}
                placeholder={resource.role_name}
              />
            </label>
            <label className="col s12 m6">
              {resource.remark}
              <input type="text" id="remark" name="remark" value={role.remark || ""} onChange={updateState} maxLength={255} placeholder={resource.remark} />
            </label>
            <div className="col s12 m6 radio-section">
              {resource.status}
              <div className="radio-group">
                <label>
                  <input type="radio" id="active" name="status" onChange={(e) => updateState(e, () => setState)} value="A" checked={role.status === "A"} />
                  {resource.active}
                </label>
                <label>
                  <input type="radio" id="inactive" name="status" onChange={(e) => updateState(e, () => setState)} value="I" checked={role.status === "I"} />
                  {resource.inactive}
                </label>
              </div>
            </div>
          </section>
          <section className="row">
            <label className="col s12 m6 search-input">
              <i className="btn-search" />
              <input
                type="text"
                id="keyword"
                name="keyword"
                maxLength={40}
                placeholder={resource.role_filter_modules}
                value={state.keyword}
                onChange={onChange}
              />
            </label>
          </section>
          <section className="tree-view">
            <div className="row">
              <div className="col s6 m4 inline flex-gap-2 col-header">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleCheckAllModule(e, state.role.privileges, state.all, state.actions, (privileges: string[]) => {
                      setState({ role: { ...state.role, privileges: privileges } }, () => {
                        isCheckedAll(privileges, state.all)
                      })
                    })
                  }
                  checked={state.checkedAll}
                  disabled={isReadOnly || state.keyword !== ""}
                />
                <p>{resource.module}</p>
              </div>
              <p className="col s1 m2 center">{resource.read}</p>
              <p className="col s1 m2 center">{resource.write}</p>
              <p className="col s1 m2 center">{resource.delete}</p>
            </div>
            {renderForms(state.shownPrivileges, "", isReadOnly || state.keyword !== "")}
          </section>
        </div>
        <footer>
          {!flag.readOnly && (
            <button type="submit" id="btnSave" name="btnSave" onClick={save}>
              {resource.save}
            </button>
          )}
        </footer>
      </form>
    </div>
  )
}
