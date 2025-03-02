import { Result } from "onecore"
import React, { useEffect, useRef, useState } from "react"
import { clone, datetimeToString, hasDiff, isEmptyObject, isSuccessful, makeDiff, setReadOnly } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { registerEvents, requiredOnBlur, showFormError, validateForm } from "ui-plus"
import { getLocale, handleError, hasPermission, initForm, Permission, Status, useResource } from "uione"
import { Content, getContentService } from "./service"

const createContent = (): Content => {
  const content = {} as Content
  content.status = Status.Active
  return content
}

interface InternalState {
  content: Content
}
const initialState: InternalState = {
  content: {} as Content,
}

export const ContentForm = () => {
  const isReadOnly = !hasPermission(Permission.write, 1)
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef()
  const [initialContent, setInitialContent] = useState<Content>(createContent())
  const [state, setState] = useState<InternalState>(initialState)
  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (!id) {
      const content = createContent()
      setInitialContent(clone(content))
      setState({ content })
    } else {
      showLoading()
      getContentService()
        .load(id)
        .then((content) => {
          if (!content) {
            alertError(resource.error_404, () => navigate(-1))
          } else {
            setInitialContent(clone(content))
            setState({ content })
            if (isReadOnly) {
              setReadOnly(refForm?.current)
            }
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id, newMode, isReadOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const content = state.content
  const back = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!hasDiff(initialContent, content)) {
      navigate(-1)
    } else {
      confirm(resource.msg_confirm_back, () => navigate(-1))
    }
  }

  const statusOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    content.status = e.target.value
    setState({ ...state, content })
  }
  const save = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      const service = getContentService()
      confirm(resource.msg_confirm_save, () => {
        if (newMode) {
          showLoading()
          service
            .create(content)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        } else {
          const diff = makeDiff(initialContent, content, ["id"])
          if (isEmptyObject(diff)) {
            alertWarning(resource.msg_no_change)
          } else {
            showLoading()
            service
              .patch(content)
              .then((res) => afterSaved(res))
              .catch(handleError)
              .finally(hideLoading)
          }
        }
      })
    }
  }
  const afterSaved = (res: Result<Content>) => {
    if (Array.isArray(res)) {
      showFormError(refForm?.current, res)
    } else if (isSuccessful(res)) {
      alertSuccess(resource.msg_save_success, () => navigate(-1))
    } else if (res === 0) {
      alertError(resource.error_not_found)
    } else {
      alertError(resource.error_conflict)
    }
  }
  return (
    <form id="contentForm" name="contentForm" className="form" model-name="content" ref={refForm as any}>
      <header>
        <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
        <h2 className="view-title">{resource.content}</h2>
        <div className="btn-group">
          <button className="btn-group btn-right" hidden={newMode}>
            <i className="material-icons">group</i>
          </button>
          <button className="btn-group btn-right" hidden={newMode}>
            <i className="material-icons">group</i>
          </button>
        </div>
      </header>
      <div className="row">
        <label className="col s12 m6">
          {resource.id}
          <input
            type="text"
            id="id"
            name="id"
            className="form-control"
            value={content.id || ""}
            readOnly={!newMode}
            onChange={(e) => {
              content.id = e.target.value
              setState({ ...state, content })
            }}
            maxLength={80}
            required={true}
            placeholder={resource.id}
          />
        </label>
        <label className="col s12 m6">
          {resource.published_at}
          <input
            type="datetime-local"
            step=".010"
            id="publishedAt"
            name="publishedAt"
            value={datetimeToString(content.publishedAt)}
            onChange={(e) => {
              content.publishedAt = e.target.value.length > 0 ? new Date(e.target.value) : undefined
              setState({ ...state, content })
            }}
          />
        </label>
        <div className="col s12 m6 radio-section">
          {resource.status}
          <div className="radio-group">
            <label>
              <input type="radio" id="active" name="status" onChange={statusOnChange} value={Status.Active} checked={content.status === Status.Active} />
              {resource.yes}
            </label>
            <label>
              <input type="radio" id="inactive" name="status" onChange={statusOnChange} value={Status.Inactive} checked={content.status === Status.Inactive} />
              {resource.no}
            </label>
          </div>
        </div>
        <label className="col s12">
          {resource.title}
          <input
            type="text"
            id="title"
            name="title"
            value={content.title || ""}
            onChange={(e) => {
              content.title = e.target.value
              setState({ ...state, content })
            }}
            onBlur={requiredOnBlur}
            maxLength={255}
            required={true}
            placeholder={resource.title}
          />
        </label>
        <label className="col s12 textarea-container required">
          {resource.body}
          <textarea
            id="body"
            name="body"
            rows={80}
            value={content.body || ""}
            onChange={(e) => {
              content.body = e.target.value
              setState({ ...state, content })
            }}
            onBlur={requiredOnBlur}
            maxLength={9000}
            placeholder={resource.body}
          />
        </label>
      </div>
      <footer>
        {!isReadOnly && (
          <button type="submit" id="btnSave" name="btnSave" onClick={save}>
            {resource.save}
          </button>
        )}
      </footer>
    </form>
  )
}
