import { PasswordReset, resetPassword, validateReset } from "password-client"
import { useEffect, useRef, useState } from "react"
import { OnClick, updateState, useMessage, } from "react-hook-core"
import { Link } from "react-router-dom"
import { initForm, registerEvents } from "ui-plus"
import { handleError, message, storage, useResource } from "uione"
import logo from "../assets/images/logo.png"
import { getPasswordService } from "./service"

interface NewPasswordReset extends PasswordReset {
  confirmPassword: string
}
const initUser: NewPasswordReset = {
  username: "",
  password: "",
  passcode: "",
  confirmPassword: "",
}
const msgData = {
  message: "",
  alertClass: "",
}

export const ResetPasswordForm = () => {
  const resource = useResource()
  const form = useRef<HTMLFormElement>(null)
  const { msg, showError, hideMessage } = useMessage(msgData)
  const [user, setUser] = useState<NewPasswordReset>(initUser)
  // const { state, updateState } = useUpdate<ResetState>(signinData, "user")

  useEffect(() => {
    initForm(form.current, registerEvents)
  }, [])

  const onResetPassword = (e: OnClick) => {
    const passwordService = getPasswordService()
    e.preventDefault()
    const customPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/
    const results = validateReset(user, user.confirmPassword, resource, customPassword)
    if (Array.isArray(results) && results.length > 0) {
      showError(results)
      return
    }
    resetPassword(passwordService.resetPassword, user, resource, message, showError, handleError, storage.loading())
    /*
    validateAndResetPassword(
      this.passwordService.resetPassword, this.state.user, this.state.confirmPassword,
      this.resourceService, this.showMessage, this.showError, this.hideMessage,
      validateReset, this.handleError, strongPassword, this.loading, this.showError);
      */
  }

  return (
    <div className="central-full">
      <form id="userForm" name="userForm" className="form" noValidate={true} autoComplete="off" ref={form as any} model-name="user">
        <div className="view-body row">
          <img className="logo" src={logo} alt="logo" />
          <h2>{resource.reset_password}</h2>
          <div className={"message " + msg.alertClass}>
            {msg.message}
            <span onClick={hideMessage} hidden={!msg.message || msg.message === ""} />
          </div>
          <label className="col s12">
            {resource.username}
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              placeholder={resource.placeholder_username}
              onChange={e => updateState(e, user, setUser)}
              maxLength={255}
              required={true}
            />
          </label>
          <label className="col s12">
            {resource.passcode}
            <input
              type="text"
              id="passcode"
              name="passcode"
              value={user.passcode}
              placeholder={resource.placeholder_passcode}
              onChange={e => updateState(e, user, setUser)}
              maxLength={255}
              required={true}
            />
          </label>
          <label className="col s12">
            {resource.new_password}
            <input
              type="password"
              id="password"
              name="password"
              value={user.password}
              placeholder={resource.placeholder_new_password}
              onChange={e => updateState(e, user, setUser)}
              maxLength={255}
              required={true}
            />
          </label>
          <label className="col s12">
            {resource.confirm_password}
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={user.confirmPassword}
              placeholder={resource.placeholder_confirm_password}
              onChange={e => updateState(e, user, setUser)}
              maxLength={255}
              required={true}
            />
          </label>
          <button type="submit" id="btnResetPassword" name="btnResetPassword" onClick={onResetPassword}>
            {resource.button_reset_password}
          </button>
          <Link id="btnSignin" to="/signin">
            {resource.button_signin}
          </Link>
        </div>
      </form>
    </div>
  )
}
