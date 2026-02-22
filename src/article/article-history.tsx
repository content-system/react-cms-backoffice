import { Fragment, useEffect, useState } from "react"
import { OnClick } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { hideLoading, showLoading } from "ui-loading"
import { formatDateTime } from "ui-plus"
import { getActionName, getDateFormat, handleError, useResource } from "uione"
import { Article, getArticleService, History } from "./service"

const limit = 3
export const ArticleHistory = () => {
  const dateFormat = getDateFormat()
  const resource = useResource()
  const navigate = useNavigate()
  const [histories, setHistories] = useState<History<Article>[]>([])
  const [nextPageToken, setNextPageToken] = useState<string>();
  const { id } = useParams()
  const service = getArticleService()

  useEffect(() => {
    if (!id) {
      navigate(-1)
    } else {
      showLoading()
      service
        .getHistories(id, limit)
        .then((res) => {
          let next: string | undefined = undefined
          if (res.length > 0) {
            if (res.length >= limit) {
              next = res[res.length - 1].id
            }
            setHistories(res)
          }
          setNextPageToken(next)
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (event: OnClick) => navigate(-1)
  const loadMore = async (event: OnClick) => {
    event.preventDefault()
    if (id) {
      try {
        showLoading()
        let res = await service.getHistories(id, limit, nextPageToken)
        let next: string | undefined = undefined
        if (res.length > 0) {
          if (res.length >= limit) {
            next = res[res.length - 1].id
          }
          const newList = [...histories].concat(res);
          setHistories(newList)
        }
        setNextPageToken(next)
      } catch (err) {
        handleError(err)
      } finally {
        hideLoading()
      }
    }
  }

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
              <h3 className="article-description">{resource.user}: {item.author}</h3>
              <h4 className="article-description">{formatDateTime(item.time, dateFormat)}</h4>
              <h4 className="article-description">{resource.action}: {getActionName(item.action)}</h4>
              {
                article && <Fragment>
                  <h4 className="article-description">{article.title}</h4>
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
                  <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
                </Fragment>
              }
              <hr></hr>
            </Fragment>
          )
        })}
        {nextPageToken && <button type='submit' id='btnMore' name='btnMore' className='btn-more' onClick={loadMore}>{resource.button_more}</button>}
      </div>
    </form>
  )
}
