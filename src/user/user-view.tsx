import { useLayoutEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { hideLoading, showLoading } from "ui-loading"
import { formatPhone } from "ui-plus"
import { handleError, useResource } from "uione"
import { getUserService, User } from "./service"

export const UserView = () => {
  const navigate = useNavigate()
  const resource = useResource()
  const refForm = useRef()
  const [user, setUser] = useState<User>()
  const { id } = useParams()
  useLayoutEffect(() => {
    if (id) {
      showLoading()
      getUserService()
        .load(id)
        .then((tmpUser) => {
          if (tmpUser) {
            setUser(tmpUser)
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id])
  const back = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    navigate(-1)
  }
  return (
    <div className="view-container">
      <form id="userForm" name="userForm" model-name="user" ref={refForm as any}>
        <header className="view-header">
          <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
          <h2 className="view-title">{resource.user}</h2>
        </header>
        <div className="row">
          <dl className="data-list row">
            <dt className="col s6 l3">{resource.user_id}</dt>
            <dd className="col s6 l9">{user?.userId}</dd>
            <dt className="col s6 l3">{resource.username}</dt>
            <dd className="col s6 l9">{user?.username}</dd>
            <dt className="col s6 l3">{resource.person_title}</dt>
            <dd className="col s6 l9">{user?.title}</dd>
            <dt className="col s6 l3">{resource.display_name}</dt>
            <dd className="col s6 l9">{user?.displayName}</dd>
            <dt className="col s6 l3">{resource.phone}</dt>
            <dd className="col s6 l9">{formatPhone(user?.phone)}</dd>
            <dt className="col s6 l3">{resource.email}</dt>
            <dd className="col s6 l9">{user?.email}</dd>
          </dl>
        </div>
        <footer className="view-footer">
          <button type="submit" id="btnClose" name="btnClose" onClick={back}>
            {resource.close}
          </button>
        </footer>
      </form>
    </div>
  )
}
