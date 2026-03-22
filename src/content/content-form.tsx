import { Result } from "onecore"
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import { clone, datetimeToString, isEmpty, isSuccessful, makeDiff, onBack, updateState } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { initForm, registerEvents, requiredOnBlur, setReadOnly, showFormError, validateForm } from "ui-plus"
import { getLocale, handleError, hasPermission, Permission, Status, useResource } from "uione"
import { Content, getContentService } from "./service"

const createContent = (): Content => {
  const content = {} as Content
  content.status = Status.Active
  return content
}

export const ContentForm = () => {
  const canWrite = hasPermission(Permission.write, 2)

  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [initialContent, setInitialContent] = useState<Content>()
  const [content, setContent] = useState<Content>(createContent())
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateState(e, content, setContent)

  const { id, lang } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (id && lang) {
      showLoading()
      getContentService()
        .load(id, lang)
        .then((content) => {
          if (!content) {
            alertError(resource.error_404, () => navigate(-1))
          } else {
            setInitialContent(clone(content))
            setContent(content)
            if (!canWrite) {
              setReadOnly(refForm?.current)
            }
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id, newMode, canWrite]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (e: MouseEvent<HTMLElement>) => onBack(e, navigate, confirm, resource, content, initialContent)

  const save = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      const service = getContentService()
      if (newMode) {
        confirm(resource.msg_confirm_save, () => {
          showLoading()
          service
            .create(content)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        })
      } else {
        const diff = makeDiff(content, initialContent, ["id", "lang"])
        if (isEmpty(diff)) {
          return alertWarning(resource.msg_no_change)
        }
        confirm(resource.msg_confirm_save, () => {
          showLoading()
          service
            .patch(content)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        })
      }
    }
  }
  const afterSaved = (res: Result<Content>) => {
    if (Array.isArray(res)) {
      showFormError(refForm?.current, res)
    } else if (isSuccessful(res)) {
      alertSuccess(resource.msg_save_success, () => navigate(-1))
    } else {
      alertError(resource.error_not_found)
    }
  }
  return (
    <form id="contentForm" name="contentForm" className="form" ref={refForm}>
      <header>
        <button type="button" id="backBtn" name="backBtn" className="btn-back" onClick={back} />
        <h2>{resource.content}</h2>
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
            value={content.id}
            readOnly={!newMode}
            onChange={onChange}
            maxLength={80}
            required={true}
            placeholder={resource.id}
          />
        </label>
        <label className="col s12 m6">
          {resource.lang}
          <input
            type="text"
            id="lang"
            name="lang"
            value={content.lang}
            readOnly={!newMode}
            onChange={onChange}
            maxLength={80}
            required={true}
            placeholder={resource.lang}
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
            onChange={onChange}
          />
        </label>
        <label className="col s12 m6">
          {resource.status}
          <div className="radio-group">
            <label>
              <input type="radio" id="active" name="status" onChange={onChange} value={Status.Active} checked={content.status === Status.Active} />
              {resource.active}
            </label>
            <label>
              <input type="radio" id="inactive" name="status" onChange={onChange} value={Status.Inactive} checked={content.status === Status.Inactive} />
              {resource.inactive}
            </label>
          </div>
        </label>
        <label className="col s12">
          {resource.title}
          <input
            type="text"
            id="title"
            name="title"
            value={content.title}
            onChange={onChange}
            onBlur={requiredOnBlur}
            maxLength={255}
            required={true}
            placeholder={resource.title}
          />
        </label>
        <label className="col s12 auto-height required">
          {resource.body}
          <textarea
            id="body"
            name="body"
            rows={80}
            value={content.body}
            onChange={onChange}
            onBlur={requiredOnBlur}
            maxLength={9000}
            placeholder={resource.body}
          />
        </label>
      </div>
      <footer>
        {canWrite && (
          <button type="submit" id="saveBtn" name="saveBtn" onClick={save}>
            {resource.save}
          </button>
        )}
      </footer>
    </form>
  )
}
