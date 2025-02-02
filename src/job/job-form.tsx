import { Result } from "onecore"
import React, { useEffect, useRef, useState } from "react"
import { clone, hasDiff, isEmptyObject, isSuccessful, makeDiff, setReadOnly } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { registerEvents, requiredOnBlur, showFormError, validateForm } from "ui-plus"
import { getLocale, handleError, hasPermission, initForm, Permission, Status, useResource } from "uione"
import { getJobService, Job } from "./service"

const createJob = (): Job => {
  const job = {} as Job
  job.status = Status.Active
  return job
}

interface InternalState {
  job: Job
}
const initialState: InternalState = {
  job: {} as Job,
}

export const JobForm = () => {
  const isReadOnly = !hasPermission(Permission.write, 1)
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef()
  const [initialJob, setInitialJob] = useState<Job>(createJob())
  const [state, setState] = useState<InternalState>(initialState)
  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (!id) {
      const job = createJob()
      setInitialJob(clone(job))
      setState({ job })
    } else {
      showLoading()
      getJobService()
        .load(id)
        .then((job) => {
          if (!job) {
            alertError(resource.error_404, () => navigate(-1))
          } else {
            setInitialJob(clone(job))
            setState({ job })
            if (isReadOnly) {
              setReadOnly(refForm?.current)
            }
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id, newMode, isReadOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const job = state.job
  const back = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!hasDiff(initialJob, job)) {
      navigate(-1)
    } else {
      confirm(resource.msg_confirm_back, () => navigate(-1))
    }
  }

  const statusOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    job.status = e.target.value
    setState({ ...state, job })
  }
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
            className="form-control"
            value={job.id || ""}
            readOnly={!newMode}
            onChange={(e) => {
              job.id = e.target.value
              setState({ ...state, job })
            }}
            maxLength={40}
            required={true}
            placeholder={resource.id}
          />
        </label>
        <label className="col s12 m6">
          {resource.title}
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={job.title || ""}
            onChange={(e) => {
              job.title = e.target.value
              setState({ ...state, job })
            }}
            onBlur={requiredOnBlur}
            maxLength={300}
            required={true}
            placeholder={resource.title}
          />
        </label>
        <label className="col s12 m6">
          {resource.description}
          <input
            type="text"
            id="description"
            name="description"
            className="form-control"
            value={job.description || ""}
            onChange={(e) => {
              job.description = e.target.value
              setState({ ...state, job })
            }}
            onBlur={requiredOnBlur}
            maxLength={2000}
            required={true}
            placeholder={resource.description}
          />
        </label>
        {/*
        <label className="col s12 m6 flying">
          {resource.content}
          <input
            type="text"
            id="content"
            name="content"
            data-type="content"
            value={job.content || ""}
            onChange={(e) => {
              job.content = e.target.value
              setState({ ...state, job })
            }}
            onBlur={requiredOnBlur}
            maxLength={100}
            placeholder={resource.content}
          />
        </label>
        */}
        <div className="col s12 m6 radio-section">
          {resource.status}
          <div className="radio-group">
            <label>
              <input type="radio" id="active" name="status" onChange={statusOnChange} value={Status.Active} checked={job.status === Status.Active} />
              {resource.yes}
            </label>
            <label>
              <input type="radio" id="inactive" name="status" onChange={statusOnChange} value={Status.Inactive} checked={job.status === Status.Inactive} />
              {resource.no}
            </label>
          </div>
        </div>
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
