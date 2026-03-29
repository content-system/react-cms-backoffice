import { Item } from "onecore"
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import { clone, Error, isEmpty, isSuccessful, makeDiff, onBack, updateState } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { emailOnBlur, formatPhone, initForm, phoneOnBlur, registerEvents, requiredOnBlur, showFormError, validateForm } from "ui-plus"
import { Gender, getLocale, handleError, handleSelect, hasPermission, Permission, Status, useResource } from "uione"
import { getMasterDataService, getUserService, User } from "./service"

const createUser = (): User => {
  const user = {} as User
  user.status = Status.Active
  return user
}

export const UserForm = () => {
  const canWrite = hasPermission(Permission.write, 1)

  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [error500, setError500] = useState(false)
  const [titleList, setTitleList] = useState<Item[]>([])
  const [positionList, setPositionList] = useState<Item[]>([])
  const [initialUser, setInitialUser] = useState<User>()
  const [user, setUser] = useState<User>(createUser())
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => updateState(e, user, setUser)

  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    const masterDataService = getMasterDataService()
    Promise.all([masterDataService.getTitles(), masterDataService.getPositions()])
      .then((values) => {
        const [titleList, positionList] = values
        setTitleList(titleList)
        setPositionList(positionList)
        if (id) {
          showLoading()
          getUserService()
            .load(id)
            .then((user) => {
              if (user) {
                setInitialUser(clone(user))
                setUser(user)
              }
            })
            .catch(err => setError500(true))
            .finally(hideLoading)
        }
      })
      .catch(handleError)
  }, [id, newMode, canWrite]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (e: MouseEvent<HTMLElement>) => onBack(e, navigate, confirm, resource, user, initialUser)

  const updateTitle = (ele: HTMLSelectElement, user: User) => {
    handleSelect(ele)
    user.title = ele.value
    user.gender = user.title === "Mr" ? Gender.Male : Gender.Female
    setUser({ ...user })
  }

  const save = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      const service = getUserService()
      if (newMode) {
        confirm(resource.msg_confirm_save, () => {
          showLoading()
          service
            .create(user)
            .then((res) => {
              if (Array.isArray(res)) {
                showFormError(refForm?.current, res)
              } else {
                alertSuccess(resource.msg_save_success, () => navigate(-1))
              }
            })
            .catch(handleError)
            .finally(hideLoading)
        })
      } else {
        const diff = makeDiff(user, initialUser, ["userId"])
        if (isEmpty(diff)) {
          return alertWarning(resource.msg_no_change)
        }
        confirm(resource.msg_confirm_save, () => {
          showLoading()
          service
            .patch(diff)
            .then((res) => {
              if (Array.isArray(res)) {
                showFormError(refForm?.current, res)
              } else if (isSuccessful(res)) {
                alertSuccess(resource.msg_save_success, () => navigate(-1))
              } else {
                alertError(resource.error_not_found)
              }
            })
            .catch(handleError)
            .finally(hideLoading)
        })
      }
    }
  }

  const errorTitle = error500 ? resource.error_500_title : resource.error_404_title
  const errorMessage = error500 ? resource.error_500_message : resource.error_404_message
  return (
    error500 || (!newMode && !initialUser) ? <Error title={errorTitle} message={errorMessage} back={back} /> : !canWrite ? (
      <form id="userForm" name="userForm" className="form" ref={refForm}>
        <header>
          <h2>{resource.user}</h2>
          <div className="btn-group">
            <button className="btn-group btn-right" hidden={newMode}>
              <i className="material-icons" onClick={(e) => navigate(`/users/${user.userId}/assign`)}>
                group
              </i>
            </button>
          </div>
        </header>
        <div>
          <dl className="data-list row">
            <dt className="col s6 l3">{resource.user_id}</dt>
            <dd className="col s6 l9">{user.userId}</dd>
            <dt className="col s6 l3">{resource.username}</dt>
            <dd className="col s6 l9">{user.username}</dd>
            <dt className="col s6 l3">{resource.display_name}</dt>
            <dd className="col s6 l9">{user.displayName}</dd>
            <dt className="col s6 l3">{resource.person_title}</dt>
            <dd className="col s6 l9">{user.title}</dd>
            <dt className="col s6 l3">{resource.gender}</dt>
            <dd className="col s6 l9">{user.gender === Gender.Male ? resource.male : resource.female}</dd>
            <dt className="col s6 l3">{resource.phone}</dt>
            <dd className="col s6 l9">{formatPhone(user?.phone)}</dd>
            <dt className="col s6 l3">{resource.email}</dt>
            <dd className="col s6 l9">{user.email}</dd>
          </dl>
        </div>
        <footer>
          <button type="submit" id="closeBtn" name="closeBtn" onClick={back}>
            {resource.close}
          </button>
        </footer>
      </form>
    ) : (
      <form id="userForm" name="userForm" className="form" ref={refForm}>
        <header>
          <button type="button" id="backBtn" name="backBtn" className="btn-back" onClick={back} />
          <h2>{resource.user}</h2>
          <div className="btn-group">
            <button className="btn-group btn-right" hidden={newMode}>
              <i className="material-icons" onClick={(e) => navigate(`/users/${user.userId}/assign`)}>
                group
              </i>
            </button>
          </div>
        </header>
        <div>
          <section className="row section">
            <h3 className="header">User Information</h3>
            <label className="col s12 m6">
              {resource.user_id}
              <input
                type="text"
                id="userId"
                name="userId"
                value={user.userId}
                readOnly={!newMode}
                onChange={onChange}
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
                value={user.username}
                readOnly={!newMode}
                onChange={onChange}
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
                value={user.displayName}
                onChange={onChange}
                onBlur={requiredOnBlur}
                maxLength={40}
                required={true}
                placeholder={resource.display_name}
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
                    onChange={onChange}
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
                    onChange={onChange}
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
                  <input type="radio" id="active" name="status" onChange={onChange} value={Status.Active} checked={user.status === Status.Active} />
                  {resource.yes}
                </label>
                <label>
                  <input type="radio" id="inactive" name="status" onChange={onChange} value={Status.Inactive} checked={user.status === Status.Inactive} />
                  {resource.no}
                </label>
              </div>
            </div>
          </section>
          <section className="row section">
            <h4 className="header">Contact Information</h4>
            <label className="col s12 m6 flying ">
              {resource.position}
              <select
                style={{ width: "99%" }}
                id="position"
                name="position"
                value={user.position}
                data-value
                onChange={onChange}
              >
                <option value="">{resource.please_select}</option>
                {positionList.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.text}
                  </option>
                ))}
              </select>
            </label>
            <label className="col s12 m6 flying">
              {resource.person_title}
              <select id="title" name="title" value={user.title} data-value onChange={(e) => updateTitle(e.target, user)}>
                <option value="">{resource.please_select}</option>
                {titleList.map((item, index) => (
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
                value={formatPhone(user.phone)}
                onChange={onChange}
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
                value={user.email}
                onChange={onChange}
                onBlur={emailOnBlur}
                maxLength={100}
                placeholder={resource.email}
              />
            </label>
          </section>
        </div>
        <footer>
          <button type="submit" id="saveBtn" name="saveBtn" onClick={save}>
            {resource.save}
          </button>
        </footer>
      </form >)
  )
}
