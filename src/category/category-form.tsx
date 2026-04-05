import { Result } from "onecore"
import React, { MouseEvent, useEffect, useRef, useState } from "react"
import { clone, Error, isEmpty, isSuccessful, makeDiff, onBack, updateState } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { initForm, registerEvents, requiredOnBlur, showFormError, validateForm } from "ui-plus"
import { getLocale, handleError, hasPermission, Permission, Status, useResource } from "uione"
import { Category, getCategoryService } from "./service"

const createCategory = (): Category => {
  const category = {} as Category
  category.status = Status.Active
  return category
}

export const CategoryForm = () => {
  const canWrite = hasPermission(Permission.write, 1)
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [error500, setError500] = useState(false)
  const [initialCategory, setInitialCategory] = useState<Category>()
  const [category, setCategory] = useState<Category>(createCategory())
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => updateState(e, category, setCategory)

  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (id) {
      showLoading()
      getCategoryService()
        .load(id)
        .then((category) => {
          if (category) {
            setInitialCategory(clone(category))
            setCategory(category)
          }
        })
        .catch(err => setError500(true))
        .finally(hideLoading)
    }
  }, [id, newMode, canWrite]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (e: MouseEvent<HTMLElement>) => onBack(e, navigate, confirm, resource, category, initialCategory)

  const save = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      const service = getCategoryService()
      if (newMode) {
        confirm(resource.msg_confirm_save, () => {
          showLoading()
          service
            .create(category)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        })
      } else {
        const diff = makeDiff(category, initialCategory, ["id"])
        if (isEmpty(diff)) {
          return alertWarning(resource.msg_no_change)
        }
        confirm(resource.msg_confirm_save, () => {
          showLoading()
          service
            .patch(category)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        })
      }
    }
  }
  const afterSaved = (res: Result<Category>) => {
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
    error500 || (!newMode && !initialCategory) ? <Error title={errorTitle} message={errorMessage} back={back} /> : !canWrite ? (
      <form id="categoryForm" name="categoryForm" className="form" ref={refForm}>
        <header>
          <h2>{resource.category}</h2>
        </header>
        <div>
          <dl className="data-list row">
            <dt className="col s6 l3">{resource.id}</dt>
            <dd className="col s6 l9">{category.id}</dd>
            <dt className="col s6 l3">{resource.name}</dt>
            <dd className="col s6 l9">{category.name}</dd>
            <dt className="col s6 l3">{resource.path}</dt>
            <dd className="col s6 l9">{category.path}</dd>
            <dt className="col s6 l3">{resource.resource}</dt>
            <dd className="col s6 l9">{category.resource}</dd>
            <dt className="col s6 l3">{resource.icon}</dt>
            <dd className="col s6 l9">{category.icon}</dd>
            <dt className="col s6 l3">{resource.type}</dt>
            <dd className="col s6 l9">{category.type}</dd>
            <dt className="col s6 l3">{resource.parent}</dt>
            <dd className="col s6 l9">{category.parent}</dd>
            <dt className="col s6 l3">{resource.sequence}</dt>
            <dd className="col s6 l9">{category.sequence}</dd>
          </dl>
        </div>
        <footer>
          <button type="button" id="closeBtn" name="closeBtn" onClick={back}>
            {resource.close}
          </button>
        </footer>
      </form>) : (
      <form id="categoryForm" name="categoryForm" className="form" ref={refForm}>
        <header>
          <button type="button" id="backBtn" name="backBtn" className="btn-back" onClick={back} />
          <h2>{resource.category}</h2>
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
              value={category.id}
              readOnly={!newMode}
              onChange={onChange}
              maxLength={80}
              required={true}
              placeholder={resource.id}
            />
          </label>
          <label className="col s12 m6">
            {resource.name}
            <input
              type="text"
              id="name"
              name="name"
              value={category.name}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={255}
              required={true}
              placeholder={resource.name}
            />
          </label>
          <label className="col s12 m6">
            {resource.path}
            <input
              type="text"
              id="path"
              name="path"
              value={category.path}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={255}
              required={true}
              placeholder={resource.path}
            />
          </label>
          <label className="col s12 m6">
            {resource.path}
            <input
              type="text"
              id="resource"
              name="resource"
              value={category.resource}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={255}
              required={true}
              placeholder={resource.resource}
            />
          </label>
          <label className="col s12 m6">
            {resource.icon}
            <input
              type="text"
              id="icon"
              name="icon"
              value={category.icon}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={255}
              required={true}
              placeholder={resource.icon}
            />
          </label>
          <label className="col s12 m6">
            {resource.type}
            <input
              type="text"
              id="type"
              name="type"
              value={category.type}
              onChange={onChange}
              maxLength={10}
              placeholder={resource.type}
            />
          </label>
          <label className="col s12 m6">
            {resource.parent}
            <input
              type="text"
              id="parent"
              name="parent"
              value={category.parent}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={40}
              placeholder={resource.parent}
            />
          </label>
          <label className="col s12 m6">
            {resource.sequence}
            <input
              type="tel"
              className="text-right"
              id="sequence"
              name="sequence"
              data-type="integer"
              value={category.sequence}
              onChange={onChange}
              onBlur={requiredOnBlur}
              maxLength={3}
              required={true}
              placeholder={resource.sequence}
            />
          </label>
          <label className="col s12 m6">
            {resource.status}
            <div className="radio-group">
              <label>
                <input type="radio" id="active" name="status" onChange={onChange} value={Status.Active} checked={category.status === Status.Active} />
                {resource.active}
              </label>
              <label>
                <input type="radio" id="inactive" name="status" onChange={onChange} value={Status.Inactive} checked={category.status === Status.Inactive} />
                {resource.inactive}
              </label>
            </div>
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
  )
}
