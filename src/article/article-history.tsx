import { Fragment, useEffect, useState } from "react"
import { OnClick } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { hideLoading, showLoading } from "ui-loading"
import { formatDateTime } from "ui-plus"
import { getDateFormat, handleError, useResource } from "uione"
import { Article, getArticleService, History } from "./service"

export const ArticleHistory = () => {
  const dateFormat = getDateFormat()
  const resource = useResource()
  const navigate = useNavigate()
  const [histories, setHistories] = useState<History<Article>[]>([])
  const { id } = useParams()
  const service = getArticleService()

  useEffect(() => {
    if (!id) {
      navigate(-1)
    } else {
      showLoading()
      service
        .getHistories(id)
        .then((objs) => setHistories(objs))
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (event: OnClick) => navigate(-1)

  return (
    <form id="approveArticleForm" name="approveArticleForm" className="form">
      <header>
        <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
        <h2 className="view-title">{resource.article}</h2>
      </header>
      <div className="article-body">
        {histories.map((item, i) => {
          const article = item.data
          return (
            <Fragment key={i}>
              <h3 className="article-description">{article.title}</h3>
              {article.description && <h4 className="article-description">{article.description}</h4>}
              {article.publishedAt && (
                <h4 className="article-meta center-align-items">
                  {resource.published_at}: {formatDateTime(article.publishedAt, dateFormat)}
                </h4>
              )}
              {article.submittedAt && (
                <div className="article-meta">
                  {resource.submitted_at}: <strong>{formatDateTime(article.submittedAt, dateFormat)}</strong>
                </div>
              )}
              <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }}/>
            </Fragment>
          )
        })}
      </div>
      <footer>
        <button type="submit" id="btnApprove" name="btnApprove" className="btn-approve">
          {resource.approve}
        </button>
      </footer>
    </form>
  )
}
