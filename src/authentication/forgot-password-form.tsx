import { email, validateAndForgotPassword, validateContact } from "password-client"
import { useEffect, useRef } from "react"
import { OnClick, useMessage, useUpdate } from "react-hook-core"
import { Link } from "react-router-dom"
import { handleError, initForm, message, registerEvents, storage, useResource } from "uione"
import logo from "../assets/images/logo.png"
import { getPasswordService } from "./service"

interface ContactInternalState {
  contact: {
    contact: string
  }
}

const forgotPasswordData = {
  contact: {
    contact: "",
  },
}

const msgData = {
  message: "",
  alertClass: "",
}

export const ForgotPasswordForm = () => {
  const resource = useResource()
  const { msg, showError, hideMessage } = useMessage(msgData)
  const { state, updateState } = useUpdate<ContactInternalState>(forgotPasswordData, "contact")
  const form = useRef()
  useEffect(() => {
    if (form && form.current) {
      initForm(form.current, registerEvents)
    }
  }, [])

  const forgotPassword = (event: OnClick) => {
    event.preventDefault()
    const passwordServicer = getPasswordService()
    validateAndForgotPassword(
      passwordServicer.forgotPassword,
      state.contact.contact,
      "email",
      storage.resource(),
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
    <div className="view-container central-full">
      <form id="forgotPasswordForm" name="forgotPasswordForm" noValidate={true} autoComplete="off" ref={form as any}>
        <div>
          <img className="logo" src={logo} alt="logo" />
          <h2>{resource.forgot_password}</h2>
          <div className={"message " + msg.alertClass}>
            {msg.message}
            <span onClick={hideMessage} hidden={!msg.message || msg.message === ""} />
          </div>
          <label>
            {resource.email}
            <input
              type="text"
              id="contact"
              name="contact"
              value={state.contact.contact}
              placeholder={resource.placeholder_user_email}
              onChange={updateState}
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
