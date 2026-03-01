import { Result } from "onecore"
import React, { useEffect, useRef, useState } from "react"
import { clone, datetimeToString, goBack, isEmptyObject, isSuccessful, makeDiff, OnClick, updateState } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { initForm, registerEvents, requiredOnBlur, setReadOnly, showFormError, validateForm } from "ui-plus"
import { getLocale, handleError, hasPermission, Permission, Status, useResource } from "uione"
import { getJobService, Job } from "./service"

const createJob = (): Job => {
  const job = {} as Job
  job.status = Status.Active
  return job
}

export const JobForm = () => {
  const isReadOnly = !hasPermission(Permission.write, 1)
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [initialJob, setInitialJob] = useState<Job>(createJob())
  const [job, setJob] = useState<Job>(createJob())
  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (!id) {
      const job = createJob()
      setInitialJob(clone(job))
      setJob(job)
    } else {
      showLoading()
      getJobService()
        .load(id)
        .then((job) => {
          if (!job) {
            alertError(resource.error_404, () => navigate(-1))
          } else {
            setInitialJob(clone(job))
            setJob(job)
            if (isReadOnly) {
              setReadOnly(refForm?.current)
            }
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id, newMode, isReadOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (event: OnClick) => goBack(navigate, confirm, resource, initialJob, job)

  const save = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      const service = getJobService()
      confirm(resource.msg_confirm_save, () => {
        if (newMode) {
          showLoading()
          service
            .create(job)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        } else {
          const diff = makeDiff(initialJob, job, ["id"])
          if (isEmptyObject(diff)) {
            alertWarning(resource.msg_no_change)
          } else {
            showLoading()
            service
              .patch(job)
              .then((res) => afterSaved(res))
              .catch(handleError)
              .finally(hideLoading)
          }
        }
      })
    }
  }
  const afterSaved = (res: Result<Job>) => {
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
    <form id="jobForm" name="jobForm" className="form" model-name="job" ref={refForm as any}>
      <header>
        <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
        <h2 className="view-title">{resource.job}</h2>
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
            value={job.id || ""}
            readOnly={!newMode}
            onChange={(e) => updateState(e, job, setJob)}
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
            onChange={(e) => updateState(e, job, setJob)}
          />
        </label>
        <label className="col s12 m6">
          {resource.position}
          <input
            type="text"
            id="position"
            name="position"
            value={job.position || ""}
            onChange={(e) => updateState(e, job, setJob)}
            onBlur={requiredOnBlur}
            maxLength={255}
            required={true}
            placeholder={resource.position}
          />
        </label>
        <label className="col s12 m6">
          {resource.quantity}
          <input
            type="text"
            className="text-right"
            id="quantity"
            name="quantity"
            value={job.quantity || ""}
            onChange={(e) => updateState(e, job, setJob)}
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
            value={job.location || ""}
            onChange={(e) => updateState(e, job, setJob)}
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
            value={job.minSalary || ""}
            onChange={(e) => updateState(e, job, setJob)}
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
            value={job.minSalary || ""}
            onChange={(e) => updateState(e, job, setJob)}
            onBlur={requiredOnBlur}
            maxLength={16}
            placeholder={resource.max_salary}
          />
        </label>
        <div className="col s12 m6 radio-section">
          {resource.status}
          <div className="radio-group">
            <label>
              <input type="radio" id="active" name="status" onChange={(e) => updateState(e, job, setJob)} value={Status.Active} checked={job.status === Status.Active} />
              {resource.yes}
            </label>
            <label>
              <input type="radio" id="inactive" name="status" onChange={(e) => updateState(e, job, setJob)} value={Status.Inactive} checked={job.status === Status.Inactive} />
              {resource.no}
            </label>
          </div>
        </div>
        <label className="col s12 flying">
          {resource.title}
          <input
            type="text"
            id="title"
            name="title"
            value={job.title || ""}
            onChange={(e) => updateState(e, job, setJob)}
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
            value={job.description || ""}
            onChange={(e) => updateState(e, job, setJob)}
            onBlur={requiredOnBlur}
            required={true}
            maxLength={1200}
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
