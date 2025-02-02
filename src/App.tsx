import axios from "axios"
import * as csv from "csvtojson"
import { currency, locale } from "locale-service"
import { phonecodes } from "phonecodes"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { alertError, confirm, resources as uiplusResources } from "ui-alert"
import { loading } from "ui-loading"
import { resources as uiresources, UIService } from "ui-plus"
import { toast } from "ui-toast"
import { storage, StringMap } from "uione"
import { resources as vresources } from "validation-core"
import { DefaultCsvService, resources } from "web-clients"
import ArticlesRoute from "./article"
import { AuditLogsForm } from "./audit-log"
import { ChangePasswordForm } from "./authentication/change-password-form"
import { ForgotPasswordForm } from "./authentication/forgot-password-form"
import { ResetPasswordForm } from "./authentication/reset-password-form"
import { SigninForm } from "./authentication/signin-form"
import { SignupForm } from "./authentication/signup-form"
import { config } from "./config"
import HomePage from "./core/home"
import LayoutPage from "./core/layout"
import { resources as locales } from "./core/resources"
import JobsRoute from "./job"
import RolesRoute from "./role"
import { SettingsForm } from "./settings"
import UsersRoute from "./user"

// tslint:disable:ordered-imports
import "./App.css"
import "./assets/css/reset.css"
import "./assets/fonts/material-icon/css/material-icons.css"
import "./assets/fonts/Roboto/font.css";
import "./assets/css/checkbox.css"
import "./assets/css/radio.css"
import "./assets/css/grid.css"
import "./assets/css/alert.css"
import "./assets/css/loader.css"
import "./assets/css/page.css"
import "./assets/css/main.css"
import "./assets/css/modal.css"
import "./assets/css/multi-select.css"
import "./assets/css/form.css"
import "./assets/css/article.css"
import "./assets/css/list-view.css"
import "./assets/css/table.css"
import "./assets/css/list-detail.css"
import "./assets/css/data-list.css"
import "./assets/css/solid-container.css"
import "./assets/css/button.css"
import "./assets/css/search.css"
import "./assets/css/layout.css"
import "./assets/css/theme.css"
import "./assets/css/dark.css"
import "./assets/css/grey.css"
import "./assets/css/badge.css"

axios.defaults.withCredentials = true

export const statusNames: Map<string, string> = new Map([
  ["A", "Active"],
  ["I", "Inactive"],
])
function getStatusName(status?: string, map?: StringMap): string | undefined {
  if (!status) {
    return ""
  }
  return statusNames.get(status)
}
let isInit = false
export function init() {
  if (isInit) {
    return
  }
  isInit = true
  storage.setConfig(config)
  resources.csv = new DefaultCsvService(csv)
  resources.config = {
    list: "list",
  }
  storage.home = "/home"
  // storage.token = getToken;
  // storage.moment = true;
  storage.setResources(locales)
  storage.setLoadingService(loading)
  storage.setUIService(new UIService())
  storage.currency = currency
  storage.locale = locale
  storage.alert = alertError
  storage.confirm = confirm
  storage.message = toast
  storage.getStatusName = getStatusName

  const resource = storage.resource()
  vresources.phonecodes = phonecodes
  uiresources.currency = currency
  uiresources.resource = resource

  const res = storage.getResource()

  uiplusResources.confirmHeader = res.confirm
  uiplusResources.leftText = res.no
  uiplusResources.rightText = res.yes
  uiplusResources.errorHeader = res.error
  uiplusResources.warningHeader = res.warning
  uiplusResources.infoHeader = res.info
  uiplusResources.successHeader = res.success
}
function App() {
  init()
  return (
    <BrowserRouter>
      <Routes>
        <Route index={true} element={<SigninForm />} />
        <Route path="signin" element={<SigninForm />} />
        <Route path="signup" element={<SignupForm />} />
        <Route path="change-password" element={<ChangePasswordForm />} />
        <Route path="reset-password" element={<ResetPasswordForm />} />
        <Route path="forgot-password" element={<ForgotPasswordForm />} />
        <Route path="" element={<LayoutPage />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/settings" element={<SettingsForm />} />
          <Route path="users/*" element={<UsersRoute />} />
          <Route path="roles/*" element={<RolesRoute />} />
          <Route path="articles/*" element={<ArticlesRoute />} />
          <Route path="jobs/*" element={<JobsRoute />} />
          <Route path="audit-logs" element={<AuditLogsForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
export default App
