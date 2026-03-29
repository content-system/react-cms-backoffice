import { Result } from "onecore"
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import { clone, datetimeToString, Error, isEmpty, isSuccessful, makeDiff, onBack, updateState } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { formatDateTime, initForm, registerEvents, requiredOnBlur, showFormError, validateForm } from "ui-plus"
import { getDateFormat, getLocale, handleError, hasPermission, Permission, Status, useResource } from "uione"
import { getJobService, Job } from "./service"

const createJob = (): Job => {
  const job = {} as Job
  job.status = Status.Active
  return job
}

export const JobForm = () => {
  const canWrite = hasPermission(Permission.write, 1)
  const dateFormat = getDateFormat()

  const locale = getLocale()
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [error500, setError500] = useState(false)
  const [initialJob, setInitialJob] = useState<Job>()
  const [job, setJob] = useState<Job>(createJob())
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateState(e, job, setJob)

  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (id) {
      showLoading()
      getJobService()
        .load(id)
        .then((job) => {
          if (job) {
            setInitialJob(clone(job))
            setJob(job)
          }
        })
        .catch(err => setError500(true))
        .finally(hideLoading)
    }
  }, [id, newMode, canWrite]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (e: MouseEvent<HTMLButtonElement>) => onBack(e, navigate, confirm, resource, job, initialJob)

  const save = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    const valid = validateForm(refForm?.current, locale)
    if (valid) {
      const service = getJobService()
      if (newMode) {
        confirm(resource.msg_confirm_save, () => {
          showLoading()
          service
            .create(job)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        })
      } else {
        const diff = makeDiff(job, initialJob, ["id"])
        if (isEmpty(diff)) {
          return alertWarning(resource.msg_no_change)
        }
        confirm(resource.msg_confirm_save, () => {
          showLoading()
          service
            .patch(diff)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        })
      }
    }
  }
  const afterSaved = (res: Result<Job>) => {
    if (Array.isArray(res)) {
      showFormError(refForm?.current, res)
    } else if (isSuccessful(res)) {
      alertSuccess(resource.msg_save_success, () => navigate(-1))
    } else {
      alertError(resource.error_not_found)
    }
  }

  const errorTitle = error500 ? resource.error_500_title : resource.error_404_title
  const errorMessage = error500 ? resource.error_500_message : resource.error_404_message
  return (
    error500 || (!newMode && !initialJob) ? <Error title={errorTitle} message={errorMessage} back={back} /> : !canWrite ? (
      <article className="article">
        <header>
          <button type="button" id="backBtn" name="backBtn" className="btn-back" onClick={() => navigate(-1)} />
          <h2>{job.title}</h2>
        </header>
        <div className="article-body">
          <h3 className="article-description">
            {resource.location}: {job.location}
          </h3>
          <h4 className="article-meta">{formatDateTime(job.publishedAt, dateFormat)}</h4>
          <h4 className="article-meta">
            {resource.quantity}: {job.quantity}
          </h4>
          <div className="job-description" dangerouslySetInnerHTML={{ __html: job.description }}></div>
        </div>
      </article>
    ) : (
      <form id="jobForm" name="jobForm" className="form" ref={refForm}>
        <header>
          <button type="button" id="backBtn" name="backBtn" className="btn-back" onClick={back} />
          <h2>{resource.job}</h2>
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
              value={job.id}
              readOnly={!newMode}
              onChange={onChange}
              maxLength={40}
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
              value={datetimeToString(job.publishedAt)}
              onChange={onChange}
            />
          </label>
          <label className="col s12 m6">
            {resource.position}
            <input
              type="text"
              id="position"
              name="position"
              value={job.position}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={255}
              required={true}
              placeholder={resource.position}
            />
          </label>
          <label className="col s12 m6">
            {resource.quantity}
            <input
              type="tel"
              className="text-right"
              id="quantity"
              name="quantity"
              data-type="int"
              value={job.quantity?.toString()}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={255}
              required={true}
              placeholder={resource.quantity}
            />
          </label>
          <label className="col s12 m6">
            {resource.location}
            <input
              type="text"
              id="location"
              name="location"
              value={job.location}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={255}
              required={true}
              placeholder={resource.location}
            />
          </label>
          <label className="col s12 m6">
            {resource.min_salary}
            <input
              type="tel"
              className="text-right"
              id="minSalary"
              name="minSalary"
              data-type="int"
              value={job.minSalary?.toString()}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={16}
              placeholder={resource.min_salary}
            />
          </label>
          <label className="col s12 m6">
            {resource.max_salary}
            <input
              type="tel"
              className="text-right"
              id="maxSalary"
              name="maxSalary"
              data-type="int"
              value={job.maxSalary?.toString()}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={16}
              placeholder={resource.max_salary}
            />
          </label>
          <label className="col s12 m6">
            {resource.status}
            <div className="radio-group">
              <label>
                <input type="radio" id="active" name="status" onChange={onChange} value={Status.Active} checked={job.status === Status.Active} />
                {resource.active}
              </label>
              <label>
                <input type="radio" id="inactive" name="status" onChange={onChange} value={Status.Inactive} checked={job.status === Status.Inactive} />
                {resource.inactive}
              </label>
            </div>
          </label>
          <label className="col s12 flying">
            {resource.title}
            <input
              type="text"
              id="title"
              name="title"
              value={job.title}
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
              rows={24}
              value={job.description}
              onChange={onChange}
              onBlur={requiredOnBlur}
              required={true}
              maxLength={1200}
              placeholder={resource.content}
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
      </form>)
  )
}
