import { Result } from "onecore"
import React, { useEffect, useRef, useState } from "react"
import { clone, datetimeToString, hasDiff, isEmptyObject, isSuccessful, makeDiff, setReadOnly } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { registerEvents, requiredOnBlur, showFormError, validateForm } from "ui-plus"
import { getLocale, handleError, hasPermission, initForm, Permission, Status, useResource } from "uione"
import { Article, getArticleService } from "./service"

const createArticle = (): Article => {
  const article = {} as Article
  article.status = Status.Active
  return article
}

interface InternalState {
  article: Article
}
const initialState: InternalState = {
  article: {} as Article,
}

export const ArticleForm = () => {
  const isReadOnly = !hasPermission(Permission.write, 1)
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef()
  const [initialArticle, setInitialArticle] = useState<Article>(createArticle())
  const [state, setState] = useState<InternalState>(initialState)
  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (!id) {
      const article = createArticle()
      setInitialArticle(clone(article))
      setState({ article })
    } else {
      showLoading()
      getArticleService()
        .load(id)
        .then((article) => {
          if (!article) {
            alertError(resource.error_404, () => navigate(-1))
          } else {
            setInitialArticle(clone(article))
            setState({ article })
            if (isReadOnly) {
              setReadOnly(refForm?.current)
            }
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id, newMode, isReadOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const article = state.article
  const back = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!hasDiff(initialArticle, article)) {
      navigate(-1)
    } else {
      confirm(resource.msg_confirm_back, () => navigate(-1))
    }
  }

  const statusOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    article.status = e.target.value
    setState({ ...state, article })
  }
  const save = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      const service = getArticleService()
      confirm(resource.msg_confirm_save, () => {
        if (newMode) {
          showLoading()
          service
            .create(article)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        } else {
          const diff = makeDiff(initialArticle, article, ["id"])
          if (isEmptyObject(diff)) {
            alertWarning(resource.msg_no_change)
          } else {
            showLoading()
            service
              .patch(article)
              .then((res) => afterSaved(res))
              .catch(handleError)
              .finally(hideLoading)
          }
        }
      })
    }
  }
  const afterSaved = (res: Result<Article>) => {
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
    <form id="articleForm" name="articleForm" className="form" model-name="article" ref={refForm as any}>
      <header>
        <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
        <h2 className="view-title">{resource.article}</h2>
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
            value={article.id || ""}
            readOnly={!newMode}
            onChange={(e) => {
              article.id = e.target.value
              setState({ ...state, article })
            }}
            maxLength={80}
            required={true}
            placeholder={resource.id}
          />
        </label>
        <label className="col s12 m6">
          {resource.thumbnail}
          <input
            type="url"
            id="thumbnail"
            name="thumbnail"
            value={article.thumbnail || ""}
            onChange={(e) => {
              article.thumbnail = e.target.value
              setState({ ...state, article })
            }}
            onBlur={requiredOnBlur}
            maxLength={255}
            required={true}
            placeholder={resource.thumbnail}
          />
        </label>
        <label className="col s12 m6">
          {resource.published_at}
          <input
            type="datetime-local"
            step=".010"
            id="publishedAt"
            name="publishedAt"
            value={datetimeToString(article.publishedAt)}
            onChange={(e) => {
              article.publishedAt = e.target.value.length > 0 ? new Date(e.target.value) : undefined
              setState({ ...state, article })
            }}
          />
        </label>
        <div className="col s12 m6 radio-section">
          {resource.status}
          <div className="radio-group">
            <label>
              <input type="radio" id="active" name="status" onChange={statusOnChange} value={Status.Active} checked={article.status === Status.Active} />
              {resource.yes}
            </label>
            <label>
              <input type="radio" id="inactive" name="status" onChange={statusOnChange} value={Status.Inactive} checked={article.status === Status.Inactive} />
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
            value={article.title || ""}
            onChange={(e) => {
              article.title = e.target.value
              setState({ ...state, article })
            }}
            onBlur={requiredOnBlur}
            maxLength={255}
            required={true}
            placeholder={resource.title}
          />
        </label>
        <label className="col s12 textarea-container required">
          {resource.description}
          <textarea
            id="description"
            name="description"
            rows={4}
            value={article.description || ""}
            onChange={(e) => {
              article.description = e.target.value
              setState({ ...state, article })
            }}
            onBlur={requiredOnBlur}
            required={true}
            maxLength={1200}
            placeholder={resource.content}
          />
        </label>
        <label className="col s12 textarea-container required">
          {resource.content}
          <textarea
            id="content"
            name="content"
            rows={80}
            value={article.content || ""}
            onChange={(e) => {
              article.content = e.target.value
              setState({ ...state, article })
            }}
            onBlur={requiredOnBlur}
            maxLength={9000}
            placeholder={resource.content}
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
