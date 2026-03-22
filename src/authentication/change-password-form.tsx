import { strongPassword, validateAndChangePassword, validateChange } from "password-client"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { updateState, useMessage } from "react-hook-core"
import { Link } from "react-router-dom"
import { initForm, registerEvents } from "ui-plus"
import { handleError, loading, message, useResource } from "uione"
import logo from "../assets/images/logo.png"
import { getPasswordService } from "./service"

export interface ChangePasswordState {
  hiddenPasscode: boolean
  message: string
}

interface User {
  username: string
  password: string
  contact?: string
  confirmPassword: string
  step?: number
  passcode?: string
  currentPassword: string
}

const initUser: User = {
  username: "",
  currentPassword: "",
  password: "",
  passcode: "",
  confirmPassword: "",
}

const msgData = {
  message: "",
  alertClass: "",
}

export const ChangePasswordForm = () => {
  const resource = useResource()
  const form = useRef<HTMLFormElement>(null)
  const { msg, showError, hideMessage } = useMessage(msgData)
  const [user, setUser] = useState<User>(initUser)

  useEffect(() => {
    initForm(form.current, registerEvents)
  }, [])

  const changePassword = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const passwordService = getPasswordService()
    validateAndChangePassword(
      passwordService.changePassword,
      user,
      user.confirmPassword,
      resource,
      message,
      showError,
      hideMessage,
      validateChange,
      handleError,
      strongPassword,
      loading(),
    )
    setUser(user)
  }

  const [hiddenPasscode, setHiddenPasscode] = useState(!(user.step && user.step >= 1))

  useEffect(() => {
    setHiddenPasscode(!(user.step && user.step >= 1))
  }, [user])

  return (
    <div className="central-full">
      <form id="userForm" name="userForm" className="form" noValidate={true} autoComplete="off" ref={form}>
        <div className="view-body row">
          <img className="logo" src={logo} alt="logo" />
          <h2>{resource.change_password}</h2>
          <div className={"message " + msg.alertClass}>
            {msg.message}
            <span onClick={hideMessage} hidden={!msg.message || msg.message === ""} />
          </div>
          <label className="col s12" hidden={!hiddenPasscode}>
            {resource.username}
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              onChange={e => updateState(e, user, setUser)}
              maxLength={120}
              placeholder={resource.placeholder_username}
            />
          </label>
          <label className="col s12" hidden={!hiddenPasscode}>
            {resource.current_password}
            <input
              type="password"
              className="form-control"
              id="currentPassword"
              name="currentPassword"
              value={user.currentPassword}
              onChange={e => updateState(e, user, setUser)}
              maxLength={100}
              placeholder={resource.placeholder_current_password}
            />
          </label>
          <label className="col s12" hidden={!hiddenPasscode}>
            {resource.new_password}
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={user.password}
              onChange={e => updateState(e, user, setUser)}
              maxLength={100}
              placeholder={resource.placeholder_new_password}
            />
          </label>
          <label className="col s12" hidden={!hiddenPasscode}>
            {resource.confirm_password}
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={e => updateState(e, user, setUser)}
              maxLength={100}
              placeholder={resource.placeholder_confirm_password}
            />
          </label>
          <label className="col s12" hidden={hiddenPasscode}>
            {resource.passcode}
            <input
              type="password"
              className="form-control"
              id="passcode"
              name="passcode"
              value={user.passcode}
              onChange={e => updateState(e, user, setUser)}
              maxLength={255}
              placeholder={resource.placeholder_passcode}
            />
          </label>
          <button type="submit" id="changePasswordBtn" name="changePasswordBtn" onClick={changePassword}>
            {resource.button_change_password}
          </button>
          <Link id="signinBtn" to="change-password">
            {resource.button_signin}
          </Link>
        </div>
      </form>
    </div>
  )
}
