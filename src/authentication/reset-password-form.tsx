import { PasswordReset, resetPassword, validateReset } from "password-client"
import { useEffect, useRef } from "react"
import { OnClick, useMessage, useUpdate } from "react-hook-core"
import { Link } from "react-router-dom"
import { initForm, registerEvents } from "ui-plus"
import { handleError, message, storage, useResource } from "uione"
import logo from "../assets/images/logo.png"
import { getPasswordService } from "./service"

interface ResetState {
  user: NewPasswordReset
  message: string
}
interface NewPasswordReset extends PasswordReset {
  confirmPassword: ""
}

const signinData: ResetState = {
  user: {
    username: "",
    password: "",
    passcode: "",
    confirmPassword: "",
  },
  message: "",
}

const msgData = {
  message: "",
  alertClass: "",
}

export const ResetPasswordForm = () => {
  const resource = useResource()
  const form = useRef()
  const { msg, showError, hideMessage } = useMessage(msgData)
  const { state, updateState } = useUpdate<ResetState>(signinData, "user")
  useEffect(() => {
    if (form && form.current) {
      initForm(form.current, registerEvents)
    }
  }, [])

  const onResetPassword = (event: OnClick) => {
    const passwordService = getPasswordService()
    event.preventDefault()
    const { user } = state
    const customPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/
    const results = validateReset(user, user.confirmPassword, resource, customPassword)
    if (Array.isArray(results) && results.length > 0) {
      showError(results)
      return
    }
    resetPassword(passwordService.resetPassword, user, storage.resource().resource(), message, showError, handleError, storage.loading())
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
              value={state.user.username}
              placeholder={resource.placeholder_username}
              onChange={updateState}
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
              value={state.user.passcode}
              placeholder={resource.placeholder_passcode}
              onChange={updateState}
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
              value={state.user.password}
              placeholder={resource.placeholder_new_password}
              onChange={updateState}
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
              value={state.user.confirmPassword}
              placeholder={resource.placeholder_confirm_password}
              onChange={updateState}
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
