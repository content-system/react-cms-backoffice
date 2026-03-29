import { Result } from "onecore"
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import { clone, hasDiff, isEmpty, isSuccessful, makeDiff, updateState } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { formatDateTime, formatLongDateTime, initForm, registerEvents, requiredOnBlur, showFormError, validateForm } from "ui-plus"
import { canReject, canSubmit, canUpdate, getDateFormat, getFlowStatusName, getLocale, handleError, hasPermission, Permission, Status, useResource } from "uione"
import { Article, getArticleService } from "./service"

const createArticle = (): Article => {
  const article = {} as Article
  article.status = Status.Draft
  return article
}

export const ArticleForm = () => {
  const canWrite = hasPermission(Permission.write, 1)
  const canApprove = hasPermission(Permission.approve, 1)
  const dateFormat = getDateFormat()

  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [initialArticle, setInitialArticle] = useState<Article>()
  const [article, setArticle] = useState<Article>(createArticle())
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateState(e, article, setArticle)

  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (id) {
      showLoading()
      getArticleService()
        .loadDraft(id)
        .then((article) => {
          if (!article) {
            alertError(resource.error_404, () => navigate(-1))
          } else {
            setInitialArticle(clone(article))
            setArticle(article)
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id, newMode, canWrite, canApprove]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (e: MouseEvent<HTMLElement>) => {
    if (!canWrite || !canSubmit(article.status)) {
      navigate(-1)
    } else {
      if (!hasDiff(article, initialArticle)) {
        navigate(-1)
      } else {
        confirm(resource.msg_confirm_back, () => navigate(-1))
      }
    }
  }
  const viewHistory = (e: MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault()
    navigate(`/articles/${id}/history`)
  }
  const approve = (e: MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault()
    navigate(`/articles/${id}/approve`)
  }

  const saveOnClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const obj = clone(article)
    obj.status = Status.Draft
    onSave(obj)
  }
  const submit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      confirm(resource.msg_confirm_submit, () => {
        const obj = clone(article)
        obj.status = Status.Submitted
        onSave(obj)
      })
    }
  }
  const onSave = (article: Article) => {
    const service = getArticleService()
    if (newMode) {
      save(article, service.create)
    } else {
      if (article.status === Status.Submitted) {
        save(article, service.update)
      } else {
        const diff = makeDiff(article, initialArticle, ["id"])
        if (isEmpty(diff)) {
          alertWarning(resource.msg_no_change)
        } else {
          showLoading()
          service.patch(diff)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        }
      }
    }
  }
  const save = (article: Article, update: (article: Article) => Promise<Result<Article>>) => {
    showLoading()
    update(article)
      .then((res) => afterSaved(res))
      .catch(handleError)
      .finally(hideLoading)
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
    (!canWrite || !canUpdate(article.status) ?
      (<article id="articleForm">
        <header>
          <button type="button" id="backBtn" name="backBtn" className="btn-back" onClick={back} />
          <h2>{resource.article}</h2>
          <div className="btn-group">
            {/*<Link id="approveBtn" className="btn-approve" to={`/articles/${article.id}/approve`}></Link>*/}
            {canApprove && canReject(article.status) && <button type="button" className="btn-approve" onClick={(e) => approve(e, article.id)}></button>}
            <button type="button" className="btn-history" onClick={(e) => viewHistory(e, article.id)}></button>
          </div>
        </header>
        <div className="article-body">
          <h3 className="article-description">{article.title}</h3>
          {article.description && <h4 className="article-description">{article.description}</h4>}
          {article.publishedAt && <h4 className="article-meta center-align-items">{resource.published_at}: {formatDateTime(article.publishedAt, dateFormat)}</h4>}
          {article.createdBy && <div className="article-meta">{resource.created_by}: <strong>{article.createdBy}</strong></div>}
          {article.createdAt && <div className="article-meta">{resource.created_at}: <strong>{formatDateTime(article.createdAt, dateFormat)}</strong></div>}
          {article.submittedBy && <div className="article-meta">{resource.submitted_by}: <strong>{article.submittedBy}</strong></div>}
          {article.submittedAt && <div className="article-meta">{resource.submitted_at}: <strong>{formatDateTime(article.submittedAt, dateFormat)}</strong></div>}
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }}></div>
        </div>
      </article>) :
      <form id="articleForm" name="articleForm" className="form" ref={refForm}>
        <header>
          <button type="button" id="backBtn" name="backBtn" className="btn-back" onClick={back} />
          <h2>{resource.article}</h2>
          <div className="btn-group">
            {/*<Link id="approveBtn" className="btn-approve" to={`/articles/${article.id}/approve`}></Link>*/}
            {canApprove && canReject(article.status) && <button type="button" className="btn-approve" onClick={(e) => approve(e, article.id)}></button>}
            <button type="button" className="btn-history" onClick={(e) => viewHistory(e, article.id)}></button>
          </div>
        </header>
        <div className="row">
          <label className="col s12 m6">
            {resource.id}
            <input
              type="text"
              id="id"
              name="id"
              value={article.id}
              readOnly={true}
              onChange={onChange}
              maxLength={80}
              placeholder={resource.id}
            />
          </label>
          <label className="col s12 m6">
            {resource.thumbnail}
            <input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={article.thumbnail}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={255}
              required={true}
              placeholder={resource.thumbnail}
            />
          </label>
          <label className="col s12 m6">
            {resource.published_at}
            <input
              type="text"
              id="publishedAt"
              name="publishedAt"
              value={formatLongDateTime(article.publishedAt, dateFormat)}
              readOnly={true}
            />
          </label>
          <label className="col s12 m6">
            {resource.status}
            <input
              type="text"
              id="status"
              name="status"
              value={getFlowStatusName(article.status)}
              readOnly={true}
              placeholder={resource.status}
            />
          </label>
          <label className="col s12">
            {resource.title}
            <input
              type="text"
              id="title"
              name="title"
              value={article.title}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={255}
              required={true}
              placeholder={resource.title}
            />
          </label>
          <label className="col s12 auto-height required">
            {resource.description}
            <textarea
              id="description"
              name="description"
              rows={4}
              value={article.description}
              onChange={onChange}
              onBlur={requiredOnBlur}
              required={true}
              maxLength={1200}
              placeholder={resource.content}
            />
          </label>
          <label className="col s12 auto-height required">
            {resource.content}
            <textarea
              id="content"
              name="content"
              rows={80}
              value={article.content}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={9000}
              placeholder={resource.content}
            />
          </label>
        </div>
        <footer>
          <button type="button" id="saveBtn" name="saveBtn" className="btn-secondary" onClick={saveOnClick} disabled={!canSubmit(article.status)}>
            {resource.save_draft}
          </button>
          <button type="submit" id="saveBtn" name="saveBtn" onClick={submit} disabled={!canSubmit(article.status)}>
            {resource.submit}
          </button>
        </footer>
      </form>)
  )
}
