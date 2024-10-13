import { strongPassword, validateAndChangePassword, validateChange } from "password-client"
import { useEffect, useRef, useState } from "react"
import { OnClick, useMessage, useUpdate } from "react-hook-core"
import { Link } from "react-router-dom"
import { handleError, initForm, loading, message, registerEvents, storage, useResource } from "uione"
import logo from "../assets/images/logo.png"
import { getPasswordService } from "./service"

export interface ChangePasswordState {
  user: User
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

const ChangePasswordData: ChangePasswordState = {
  user: {
    username: "",
    currentPassword: "",
    password: "",
    passcode: "",
    confirmPassword: "",
  },
  message: "",
  hiddenPasscode: true,
}

const msgData = {
  message: "",
  alertClass: "",
}

export const ChangePasswordForm = () => {
  const resource = useResource()
  const form = useRef()
  const { msg, showError, hideMessage } = useMessage(msgData)
  const { state, setState, updateState } = useUpdate<ChangePasswordState>(ChangePasswordData, "user")
  useEffect(() => {
    if (form && form.current) {
      initForm(form.current, registerEvents)
    }
  }, [])

  const changePassword = (event: OnClick) => {
    event.preventDefault()
    const passwordService = getPasswordService()
    const user = state.user
    validateAndChangePassword(
      passwordService.changePassword,
      user,
      state.user.confirmPassword,
      storage.resource(),
      message,
      showError,
      hideMessage,
      validateChange,
      handleError,
      strongPassword,
      loading(),
    )
    setState({ ...state, user })
  }

  const [hiddenPasscode, setHiddenPasscode] = useState(!(state.user.step && state.user.step >= 1))

  useEffect(() => {
    setHiddenPasscode(!(state.user.step && state.user.step >= 1))
  }, [state.user])

  return (
    <div className="view-container central-full">
      <form id="userForm" name="userForm" noValidate={true} autoComplete="off" ref={form as any}>
        <div>
          <img className="logo" src={logo} alt="logo" />
          <h2>{resource.change_password}</h2>
          <div className={"message " + msg.alertClass}>
            {msg.message}
            <span onClick={hideMessage} hidden={!msg.message || msg.message === ""} />
          </div>
          <label hidden={!hiddenPasscode}>
            {resource.username}
            <input
              type="text"
              id="username"
              name="username"
              value={state.user.username}
              onChange={updateState}
              maxLength={255}
              placeholder={resource.placeholder_username}
            />
          </label>
          <label hidden={!hiddenPasscode}>
            {resource.current_password}
            <input
              type="password"
              className="form-control"
              id="currentPassword"
              name="currentPassword"
              value={state.user.currentPassword}
              onChange={updateState}
              maxLength={255}
              placeholder={resource.placeholder_current_password}
            />
          </label>
          <label hidden={!hiddenPasscode}>
            {resource.new_password}
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={state.user.password}
              onChange={updateState}
              maxLength={255}
              placeholder={resource.placeholder_new_password}
            />
          </label>
          <label hidden={!hiddenPasscode}>
            {resource.confirm_password}
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              value={state.user.confirmPassword}
              onChange={updateState}
              maxLength={255}
              placeholder={resource.placeholder_confirm_password}
            />
          </label>
          <label hidden={hiddenPasscode}>
            {resource.passcode}
            <input
              type="password"
              className="form-control"
              id="passcode"
              name="passcode"
              value={state.user.passcode}
              onChange={updateState}
              maxLength={255}
              placeholder={resource.placeholder_passcode}
            />
          </label>
          <button type="submit" id="btnChangePassword" name="btnChangePassword" onClick={changePassword}>
            {resource.button_change_password}
          </button>
          <Link id="btnSignin" to="change-password">
            {resource.button_signin}
          </Link>
        </div>
      </form>
    </div>
  )
}
