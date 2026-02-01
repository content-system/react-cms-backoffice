import { useEffect, useRef, useState } from "react"
import { isSuccessful, OnClick } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { formatDateTime } from "ui-plus"
import { getDateFormat, handleError, hasPermission, Permission, useResource } from "uione"
import { Article, getArticleService } from "./service"

export const ApproveArticleForm = () => {
  const canApprove = hasPermission(Permission.approve, 2)
  const dateFormat = getDateFormat().toUpperCase()
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
        .load(id)
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
      <div>
        <dl className="data-list row">
          <dt className="col s4 l3">{resource.id}</dt>
          <dd className="col s8 l9">{article.id}</dd>
          <dt className="col s4 l3">{resource.published_at}</dt>
          <dd className="col s8 l9">{formatDateTime(article.publishedAt, dateFormat)}</dd>
          <dt className="col s4 l3">{resource.status}</dt>
          <dd className="col s8 l9">{article.status}</dd>
          <dt className="col s4 l3">{resource.title}</dt>
          <dd className="col s8 l9">{article.title}</dd>
          <dt className="col s12 l3">{resource.thumbnail}</dt>
          <dd className="col s12 l9">{article.thumbnail}</dd>
          <dt className="col s12 l3">{resource.description}</dt>
          <dd className="col s12 l9">{article.description}</dd>
          <dt className="col s12 l3">{resource.content}</dt>
          <dd className="col s12 l9">{article.content}</dd>
        </dl>
      </div>
      <footer>
        {canApprove && (
          <button type="button" id="btnReject" name="btnReject" onClick={reject}>
            {resource.reject}
          </button>
        )}
        {canApprove && (
          <button type="submit" id="btnApprove" name="btnApprove" onClick={approve}>
            {resource.approve}
          </button>
        )}
      </footer>
    </form>
  )
}
