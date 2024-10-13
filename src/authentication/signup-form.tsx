import { useEffect, useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { OnClick, useMessage, useUpdate } from "react-hook-core"
import { Link } from "react-router-dom"
import { isEmail, isValidUsername, Status, strongPassword, validate, validateAndSignup } from "signup-client"
import { handleError, initForm, message, registerEvents, storage, useResource } from "uione"
import logo from "../assets/images/logo.png"
import { getSignupService } from "./service"

const status: Status = {
  error: 0,
  success: 1,
  username: 2,
  contact: 3,
  format_username: -2,
  format_contact: -3,
  format_password: -1,
}

interface User {
  username: string
  password: string
  contact?: string
  confirmPassword: string
}

const userData: SignupState = {
  user: {
    username: "",
    contact: "",
    password: "",
    confirmPassword: "",
  },
  reCAPTCHA: "",
  passwordRequired: true,
  message: "",
}

const msgData = {
  message: "",
  alertClass: "",
}

interface SignupState {
  user: User
  reCAPTCHA: string | null
  passwordRequired: boolean
  message: string
}
export const SignupForm = () => {
  const resource = useResource()
  const form = useRef()
  const { msg, showError, hideMessage } = useMessage(msgData)
  const { state, setState, updateState } = useUpdate<SignupState>(userData, "user")
  useEffect(() => {
    if (form && form.current) {
      initForm(form.current, registerEvents)
    }
  }, [])

  const signup = (event: OnClick) => {
    event.preventDefault()
    const signupService = getSignupService()
    const { reCAPTCHA } = state
    if (!reCAPTCHA) {
      showError(resource.error_captcha)
      return
    }
    const { user, passwordRequired } = state
    validateAndSignup(
      signupService.signup,
      status,
      user,
      passwordRequired,
      user.confirmPassword,
      storage.resource(),
      message,
      showError,
      hideMessage,
      isValidUsername,
      isEmail,
      validate,
      handleError,
      strongPassword,
      storage.loading(),
    )
  }

  const onChange = (value: string | null) => {
    setState({ reCAPTCHA: value })
  }

  return (
    <div className="view-container central-full">
      <form id="userForm" name="userForm" noValidate={true} autoComplete="off" ref={form as any}>
        <div>
          <img className="logo" src={logo} alt="logo" />
          <h2>{resource.signup}</h2>
          <div className={"message " + msg.alertClass}>
            {msg.message}
            <span onClick={hideMessage} hidden={!msg.message || msg.message === ""} />
          </div>
          <label>
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
          <label>
            {resource.email}
            <input
              type="text"
              id="contact"
              name="contact"
              value={state.user.contact}
              placeholder={resource.placeholder_email}
              onChange={updateState}
              maxLength={255}
              required={true}
            />
          </label>
          <label hidden={!state.passwordRequired}>
            {resource.password}
            <input
              type="password"
              id="password"
              name="password"
              value={state.user.password}
              placeholder={resource.placeholder_password}
              onChange={updateState}
              maxLength={255}
            />
          </label>
          <label hidden={!state.passwordRequired}>
            {resource.confirm_password}
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder={resource.placeholder_confirm_password}
              onChange={updateState}
              maxLength={255}
            />
          </label>
          <div style={{ marginTop: "10px" }}>
            <ReCAPTCHA sitekey="6LetDbQUAAAAAEqIqVnSKgrI644y8w7O8mk89ijV" onChange={onChange} />
          </div>
          <button type="submit" id="btnSignup" name="btnSignup" onClick={signup}>
            {resource.button_signup}
          </button>
          <Link id="btnSignin" to="/signin">
            {resource.button_signin}
          </Link>
        </div>
      </form>
    </div>
  )
}
