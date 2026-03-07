import { email, validateAndForgotPassword, validateContact } from "password-client"
import { useEffect, useRef, useState } from "react"
import { OnClick, useMessage } from "react-hook-core"
import { Link } from "react-router-dom"
import { initForm, registerEvents } from "ui-plus"
import { handleError, message, storage, useResource } from "uione"
import logo from "../assets/images/logo.png"
import { getPasswordService } from "./service"

const msgData = {
  message: "",
  alertClass: "",
}

export const ForgotPasswordForm = () => {
  const resource = useResource()
  const form = useRef<HTMLFormElement>(null)
  const { msg, showError, hideMessage } = useMessage(msgData)
  const [contact, setContact] = useState<string>("")

  useEffect(() => {
    initForm(form.current, registerEvents)
  }, [])

  const forgotPassword = (e: OnClick) => {
    e.preventDefault()
    const passwordServicer = getPasswordService()
    validateAndForgotPassword(
      passwordServicer.forgotPassword,
      contact,
      "email",
      resource,
      message,
      showError,
      hideMessage,
      validateContact,
      handleError,
      email,
      storage.loading(),
    )
  }

  return (
    <div className="central-full">
      <form id="forgotPasswordForm" name="forgotPasswordForm" className="form" noValidate={true} autoComplete="off" ref={form as any}>
        <div className="view-body row">
          <img className="logo" src={logo} alt="logo" />
          <h2>{resource.forgot_password}</h2>
          <div className={"message " + msg.alertClass}>
            {msg.message}
            <span onClick={hideMessage} hidden={!msg.message || msg.message === ""} />
          </div>
          <label className="col s12">
            {resource.email}
            <input
              type="text"
              id="contact"
              name="contact"
              value={contact}
              placeholder={resource.placeholder_user_email}
              onChange={e => setContact(e.target.value)}
              maxLength={255}
              required={true}
            />
          </label>
          <button type="submit" id="btnForgotPassword" name="btnForgotPassword" onClick={forgotPassword}>
            {resource.button_send_code_to_reset_password}
          </button>
          <Link id="btnSignin" to="/signin">
            {resource.button_signin}
          </Link>
          <Link id="btnResetPassword" to="/reset-password">
            {resource.button_reset_password}
          </Link>
        </div>
      </form>
    </div>
  )
}
