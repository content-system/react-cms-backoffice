import { Item, Result } from "onecore"
import React, { useEffect, useRef, useState } from "react"
import { clone, createModel, isEmptyObject, isSuccessful, makeDiff, setReadOnly, useUpdate } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { emailOnBlur, formatPhone, phoneOnBlur, registerEvents, requiredOnBlur, showFormError, validateForm } from "ui-plus"
import { Gender, getLocale, handleError, handleSelect, hasPermission, initForm, Permission, Status, useResource } from "uione"
import { getMasterData, getUserService, User } from "./service"

const createUser = (): User => {
  const user = createModel<User>()
  user.status = Status.Active
  return user
}

interface InternalState {
  user: User
  titleList: Item[]
  positionList: Item[]
}
const initialState: InternalState = {
  user: {} as User,
  titleList: [],
  positionList: [],
}

export const UserForm = () => {
  const isReadOnly = !hasPermission(Permission.write, 1)
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef()
  const [initialUser, setInitialUser] = useState<User>(createUser())
  const { state, setState, updateState, updatePhoneState } = useUpdate<InternalState>(initialState)
  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    const masterDataService = getMasterData()
    Promise.all([masterDataService.getTitles(), masterDataService.getPositions()])
      .then((values) => {
        const [titleList, positionList] = values
        if (!id) {
          const user = createUser()
          setInitialUser(clone(user))
          setState({ titleList, positionList, user })
        } else {
          showLoading()
          getUserService()
            .load(id)
            .then((user) => {
              if (!user) {
                alertError(resource.error_404, () => navigate(-1))
              } else {
                setInitialUser(clone(user))
                setState({ titleList, positionList, user })
                if (isReadOnly) {
                  setReadOnly(refForm?.current)
                }
              }
            })
            .catch(handleError)
            .finally(hideLoading)
        }
      })
      .catch(handleError)
  }, [id, newMode, isReadOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const view = (e: React.MouseEvent<HTMLElement, MouseEvent>, userId: string) => {
    e.preventDefault()
    navigate(`/users/${userId}/view`)
  }
  const assign = (e: React.MouseEvent<HTMLElement, MouseEvent>, userId: string) => {
    e.preventDefault()
    navigate(`/users/${userId}/assign`)
  }
  const updateTitle = (ele: HTMLSelectElement, user: User) => {
    handleSelect(ele)
    user.title = ele.value
    user.gender = user.title === "Mr" ? Gender.Male : Gender.Female
    setState({ user })
  }
  const validate = (user: User): boolean => {
    const valid = validateForm(refForm?.current, getLocale())
    return valid
  }

  const user = state.user
  const back = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    const diff = makeDiff(initialUser, user)
    if (isEmptyObject(diff)) {
      navigate(-1)
    } else {
      confirm(resource.msg_confirm_back, () => navigate(-1))
    }
  }
  const save = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    const valid = validate(user)
    if (valid) {
      const service = getUserService()
      confirm(resource.msg_confirm_save, () => {
        if (newMode) {
          showLoading()
          service
            .create(user)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        } else {
          const diff = makeDiff(initialUser, user, ["userId"])
          if (isEmptyObject(diff)) {
            alertWarning(resource.msg_no_change)
          } else {
            showLoading()
            service
              .patch(user)
              .then((res) => afterSaved(res))
              .catch(handleError)
              .finally(hideLoading)
          }
        }
      })
    }
  }
  const afterSaved = (res: Result<User>) => {
    if (Array.isArray(res)) {
      showFormError(refForm?.current, res)
    } else if (isSuccessful(res)) {
      alertSuccess(resource.msg_save_success, () => navigate(-1))
    } else if (res === 0) {
      alertError(resource.error_not_found)
    } else {
      alertError(resource.error_conflict)
    }
  }
  return (
    <div className="view-container">
      <form id="userForm" name="userForm" model-name="user" ref={refForm as any}>
        <header className="view-header">
          <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
          <h2 className="view-title">{resource.user}</h2>
          <div className="btn-group">
            <button className="btn-group btn-right" hidden={newMode}>
              <i className="material-icons" onClick={(e) => view(e, user.userId)}>
                group
              </i>
            </button>
            <button className="btn-group btn-right" hidden={newMode}>
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
              readOnly={!newMode}
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
              readOnly={!newMode}
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
            <select id="title" name="title" value={user.title || ""} className="form-control" data-value onChange={(e) => updateTitle(e.target, state.user)}>
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
          {!isReadOnly && (
            <button type="submit" id="btnSave" name="btnSave" onClick={save}>
              {resource.save}
            </button>
          )}
        </footer>
      </form>
    </div>
  )
}
