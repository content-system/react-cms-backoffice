import { Item } from "onecore"
import React, { useEffect, useRef } from "react"
import { createModel, DispatchWithCallback, EditComponentParam, setReadOnly, useEdit } from "react-hook-core"
import { useNavigate } from "react-router-dom"
import { formatPhone } from "ui-plus"
import { emailOnBlur, Gender, handleError, handleSelect, hasPermission, inputEdit, Permission, phoneOnBlur, requiredOnBlur, Status } from "uione"
import { getMasterData, getUserService, User } from "./service"

interface InternalState {
  user: User
  titleList: Item[]
  positionList: Item[]
}

const createUser = (): User => {
  const user = createModel<User>()
  user.status = Status.Active
  return user
}
const initialize = (id: string | null, load: (id: string | null) => void, set: DispatchWithCallback<Partial<InternalState>>) => {
  const masterDataService = getMasterData()
  Promise.all([masterDataService.getTitles(), masterDataService.getPositions()])
    .then((values) => {
      const [titleList, positionList] = values
      set({ titleList, positionList }, () => load(id))
    })
    .catch(handleError)
}
const updateTitle = (ele: HTMLSelectElement, user: User, set: DispatchWithCallback<Partial<InternalState>>) => {
  handleSelect(ele)
  user.title = ele.value
  user.gender = user.title === "Mr" ? Gender.Male : Gender.Female
  set({ user })
}

const initialState: InternalState = {
  user: {} as User,
  titleList: [],
  positionList: [],
}

const param: EditComponentParam<User, string, InternalState> = {
  createModel: createUser,
  initialize,
}
export const UserForm = () => {
  const navigate = useNavigate()
  const refForm = useRef()
  const { resource, state, setState, updateState, flag, save, updatePhoneState, back } = useEdit<User, string, InternalState>(
    refForm,
    initialState,
    getUserService(),
    inputEdit(),
    param,
  )
  useEffect(() => {
    const isReadOnly = !hasPermission(Permission.write, 1)
    if (isReadOnly) {
      setReadOnly(refForm.current as any)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const view = (e: React.MouseEvent<HTMLElement, MouseEvent>, id: string) => {
    e.preventDefault()
    navigate(`/users/${id}/view`)
  }
  const assign = (e: React.MouseEvent<HTMLElement, MouseEvent>, id: string) => {
    e.preventDefault()
    navigate(`/users/${id}/assign`)
  }
  const user = state.user
  return (
    <div className="view-container">
      <form id="userForm" name="userForm" model-name="user" ref={refForm as any}>
        <header className="view-header">
          <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
          <h2 className="view-title">{resource.user}</h2>
          <div className="btn-group">
            <button className="btn-group btn-right" hidden={flag.newMode}>
              <i className="material-icons" onClick={(e) => view(e, user.userId)}>
                group
              </i>
            </button>
            <button className="btn-group btn-right" hidden={flag.newMode}>
              <i className="material-icons" onClick={(e) => assign(e, user.userId)}>
                group
              </i>
            </button>
          </div>
        </header>
        <div className="row">
          <label className="col s12 m6">
            {resource.user_id}
            <input
              type="text"
              id="userId"
              name="userId"
              className="form-control"
              value={user.userId || ""}
              readOnly={!flag.newMode}
              onChange={updateState}
              maxLength={20}
              required={true}
              placeholder={resource.user_id}
            />
          </label>
          <label className="col s12 m6">
            {resource.username}
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={user.username || ""}
              readOnly={!flag.newMode}
              onChange={updateState}
              onBlur={requiredOnBlur}
              maxLength={40}
              required={true}
              placeholder={resource.username}
            />
          </label>
          <label className="col s12 m6">
            {resource.display_name}
            <input
              type="text"
              id="displayName"
              name="displayName"
              className="form-control"
              value={user.displayName || ""}
              onChange={updateState}
              onBlur={requiredOnBlur}
              maxLength={40}
              required={true}
              placeholder={resource.display_name}
            />
          </label>
          <label className="col s12 m6 flying">
            {resource.person_title}
            <select
              id="title"
              name="title"
              value={user.title || ""}
              className="form-control"
              data-value
              onChange={(e) => updateTitle(e.target, state.user, setState)}
            >
              <option value="">{resource.please_select}</option>)
              {state.titleList.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.text}
                </option>
              ))}
            </select>
          </label>
          <label className="col s12 m6 flying">
            {resource.position}
            <select
              style={{ width: "99%" }}
              id="position"
              name="position"
              className="form-control"
              value={user.position || ""}
              data-value
              onChange={updateState}
            >
              <option value="">{resource.please_select}</option>
              {state.positionList.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.text}
                </option>
              ))}
            </select>
          </label>
          <label className="col s12 m6 flying">
            {resource.phone}
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-control"
              value={formatPhone(user.phone) || ""}
              onChange={updatePhoneState}
              onBlur={phoneOnBlur}
              maxLength={17}
              placeholder={resource.phone}
            />
          </label>
          <label className="col s12 m6 flying">
            {resource.email}
            <input
              type="text"
              id="email"
              name="email"
              data-type="email"
              value={user.email || ""}
              onChange={updateState}
              onBlur={emailOnBlur}
              maxLength={100}
              placeholder={resource.email}
            />
          </label>
          <label className="col s12 m6">
            {resource.gender}
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  id="gender"
                  name="gender"
                  onChange={updateState}
                  disabled={user.title !== "Dr"}
                  value={Gender.Male}
                  checked={user.gender === Gender.Male}
                />
                {resource.male}
              </label>
              <label>
                <input
                  type="radio"
                  id="gender"
                  name="gender"
                  onChange={updateState}
                  disabled={user.title !== "Dr"}
                  value={Gender.Female}
                  checked={user.gender === Gender.Female}
                />
                {resource.female}
              </label>
            </div>
          </label>
          <div className="col s12 m6 radio-section">
            {resource.status}
            <div className="radio-group">
              <label>
                <input type="radio" id="active" name="status" onChange={updateState} value={Status.Active} checked={user.status === Status.Active} />
                {resource.yes}
              </label>
              <label>
                <input type="radio" id="inactive" name="status" onChange={updateState} value={Status.Inactive} checked={user.status === Status.Inactive} />
                {resource.no}
              </label>
            </div>
          </div>
        </div>
        <footer className="view-footer">
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
