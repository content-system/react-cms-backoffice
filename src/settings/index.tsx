import { Item } from "onecore"
import { useEffect, useRef, useState } from "react"
import { confirm } from "ui-alert"
import { getDateFormat, getLanguage, handleError, initForm, registerEvents, requiredOnBlur, showMessage, useResource } from "uione"
import { getMasterDataService, getSettingsService, Settings } from "./service"

interface InternalState {
  settings: Settings
  languageList: Item[]
  dateFormatList: Item[]
}

const initialState: InternalState = {
  settings: {} as any,
  languageList: [],
  dateFormatList: [],
}

export const SettingsForm = () => {
  const resource = useResource()
  const refForm = useRef()
  const [state, setState] = useState<InternalState>(initialState)
  const { settings } = state

  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    const masterDataService = getMasterDataService()
    const dateFormat = getDateFormat()
    const language = getLanguage()
    const settings: Settings = { dateFormat, language }
    Promise.all([masterDataService.getLanguages(), masterDataService.getDateFormats()])
      .then((values) => {
        const [languageList, dateFormatList] = values
        setState({ languageList, dateFormatList, settings })
      })
      .catch(handleError)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const save = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    confirm(resource.msg_confirm_save, () => {
      getSettingsService()
        .save(settings)
        .then((res) => showMessage(resource.msg_save_success))
        .catch(handleError)
    })
  }

  return (
    <div className="view-container">
      <form id="settingsForm" name="settingsForm" model-name="settings" ref={refForm as any}>
        <header>
          <h2>{resource.settings}</h2>
        </header>
        <div className="row">
          <label className="col s12 m6">
            {resource.language}
            <select
              id="language"
              name="language"
              value={settings.language}
              onBlur={requiredOnBlur}
              onChange={(e) => {
                settings.language = e.target.value
                setState({ ...state, settings })
              }}
            >
              {state.languageList.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.text}
                </option>
              ))}
            </select>
          </label>
          <label className="col s12 m6">
            {resource.date_format}
            <select
              id="dateFormat"
              name="dateFormat"
              value={settings.dateFormat}
              onBlur={requiredOnBlur}
              onChange={(e) => {
                settings.dateFormat = e.target.value
                setState({ ...state, settings })
              }}
            >
              {state.dateFormatList.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.text}
                </option>
              ))}
            </select>
          </label>
        </div>
        <footer>
          <button type="submit" id="btnSave" name="btnSave" onClick={save}>
            {resource.save}
          </button>
        </footer>
      </form>
    </div>
  )
}
