import { useEffect, useRef, useState } from "react"
import { isSuccessful, OnClick } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { formatDateTime } from "ui-plus"
import { getDateFormat, handleError, hasPermission, isSubmitted, Permission, useResource } from "uione"
import { Article, getArticleService } from "./service"

export const ApproveArticleForm = () => {
  const canApprove = hasPermission(Permission.approve, 2)
  const dateFormat = getDateFormat()
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [article, setArticle] = useState<Article>({} as Article)
  const { id } = useParams()
  const service = getArticleService()
  useEffect(() => {
    if (!id) {
      navigate(-1)
    } else {
      showLoading()
      service
        .loadDraft(id)
        .then((obj) => {
          if (!obj) {
            alertError(resource.error_404, () => navigate(-1))
          } else {
            setArticle(obj)
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id, canApprove]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (event: OnClick) => navigate(-1)

  const reject = (event: OnClick) => {
    event.preventDefault()
    confirm(resource.msg_confirm_reject, () => {
      const service = getArticleService()
      service
        .reject(article.id)
        .then((res) => {
          if (isSuccessful(res)) {
            alertSuccess(resource.msg_reject_success, () => navigate(-1))
          } else if (res === 0) {
            alertError(resource.error_not_found)
          } else if (res === -2) {
            alertError(resource.msg_approver_conflict)
          } else {
            alertError(resource.msg_reject_conflict)
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    })
  }

  const approve = (event: OnClick) => {
    event.preventDefault()
    confirm(resource.msg_confirm_approve, () => {
      const service = getArticleService()
      service
        .approve(article.id)
        .then((res) => {
          if (isSuccessful(res)) {
            alertSuccess(resource.msg_approve_success, () => navigate(-1))
          } else if (res === 0) {
            alertError(resource.error_not_found)
          } else if (res === -2) {
            alertError(resource.msg_approver_conflict)
          } else {
            alertError(resource.msg_approve_conflict)
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    })
  }

  return (
    <form id="approveArticleForm" name="approveArticleForm" className="form" ref={refForm as any}>
      <header>
        <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
        <h2 className="view-title">{resource.article}</h2>
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
      <footer>
        {canApprove && (
          <button type="button" id="btnReject" name="btnReject" onClick={reject} disabled={!isSubmitted(article.status)}>
            {resource.reject}
          </button>
        )}
        {canApprove && (
          <button type="submit" id="btnApprove" name="btnApprove" onClick={approve} disabled={!isSubmitted(article.status)}>
            {resource.approve}
          </button>
        )}
      </footer>
    </form>
  )
}
