import { Item } from "onecore"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { clone, Error, isEmpty, isSuccessful, makeDiff, normalizePhone, onBack } from "react-hook-core"
import { Link, useNavigate, useParams } from "react-router"
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

  const service = getUserService()
  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    const masterDataService = getMasterDataService()
    Promise.all([masterDataService.getTitles(), masterDataService.getPositions()])
      .then((values) => {
        const [titleList, positionList] = values
        setTitleList(titleList)
        setPositionList(positionList)
        if (id) {
          showLoading()
          service
            .load(id)
            .then((user) => {
              if (user) {
                setInitialUser(clone(user))
                setUser(user)
                initForm(refForm?.current, registerEvents)
              }
            })
            .catch((err) => setError500(true))
            .finally(hideLoading)
        } else {
          initForm(refForm?.current, registerEvents)
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
  return error500 || (!newMode && !initialUser) ? (
    <Error title={errorTitle} message={errorMessage} back={back} />
  ) : !canWrite ? (
    <form id="userForm" name="userForm" className="form" ref={refForm}>
      <header>
        <h2>{resource.user}</h2>
        <Link to={`/users/${user.userId}/assign`} className="btn-right">
          <i className="material-icons">group</i>
        </Link>
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
        <Link to={`/users/${user.userId}/assign`} className="btn-right">
          <i className="material-icons">group</i>
        </Link>
      </header>
      <div>
        <section className="row section">
          <h3 className="header">{resource.user_info}</h3>
          <label className="col s12 m6">
            {resource.user_id}
            <input
              type="text"
              id="userId"
              name="userId"
              defaultValue={user.userId}
              readOnly={!newMode}
              onChange={(e) => {
                user.userId = e.target.value
                setUser(user)
              }}
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
              defaultValue={user.username}
              readOnly={!newMode}
              onChange={(e) => {
                user.username = e.target.value
                setUser(user)
              }}
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
              defaultValue={user.displayName}
              onChange={(e) => {
                user.displayName = e.target.value
                setUser(user)
              }}
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
                  onChange={(e) => {
                    user.gender = e.target.value
                    setUser(user)
                  }}
                  disabled={user.title !== "Dr"}
                  defaultValue={Gender.Male}
                  checked={user.gender === Gender.Male}
                />
                {resource.male}
              </label>
              <label>
                <input
                  type="radio"
                  id="gender"
                  name="gender"
                  onChange={(e) => {
                    user.gender = e.target.value
                    setUser(user)
                  }}
                  disabled={user.title !== "Dr"}
                  defaultValue={Gender.Female}
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
                <input
                  type="radio"
                  id="active"
                  name="status"
                  defaultValue={Status.Active}
                  checked={user.status === Status.Active}
                  onChange={(e) => {
                    user.status = e.target.value
                    setUser(user)
                  }}
                />
                {resource.yes}
              </label>
              <label>
                <input
                  type="radio"
                  id="inactive"
                  name="status"
                  defaultValue={Status.Inactive}
                  checked={user.status === Status.Inactive}
                  onChange={(e) => {
                    user.status = e.target.value
                    setUser(user)
                  }}
                />
                {resource.no}
              </label>
            </div>
          </div>
        </section>
        <section className="row section">
          <h4 className="header">{resource.contact_info}</h4>
          <label className="col s12 m6 flying ">
            {resource.position}
            <select
              style={{ width: "99%" }}
              id="position"
              name="position"
              defaultValue={user.position}
              data-value
              onChange={(e) => {
                user.position = e.target.value
                setUser(user)
              }}
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
            <select id="title" name="title" defaultValue={user.title} data-value onChange={(e) => updateTitle(e.target, user)}>
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
              data-type="phone"
              defaultValue={formatPhone(user.phone)}
              onChange={(e) => {
                user.phone = normalizePhone(e.target.value)
                setUser(user)
              }}
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
              defaultValue={user.email}
              onChange={(e) => {
                user.email = normalizePhone(e.target.value)
                setUser(user)
              }}
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
    </form>
  )
}
