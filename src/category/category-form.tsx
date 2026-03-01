import { Result } from "onecore"
import React, { useEffect, useRef, useState } from "react"
import { clone, hasDiff, isEmptyObject, isSuccessful, makeDiff, updateState } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { initForm, registerEvents, requiredOnBlur, setReadOnly, showFormError, validateForm } from "ui-plus"
import { getLocale, handleError, hasPermission, Permission, Status, useResource } from "uione"
import { Category, getCategoryService } from "./service"

const createCategory = (): Category => {
  const category = {} as Category
  category.status = Status.Active
  return category
}

export const CategoryForm = () => {
  const isReadOnly = !hasPermission(Permission.write, 1)
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [initialCategory, setInitialCategory] = useState<Category>(createCategory())
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
          if (!category) {
            alertError(resource.error_404, () => navigate(-1))
          } else {
            setInitialCategory(clone(category))
            setCategory(category)
            if (isReadOnly) {
              setReadOnly(refForm?.current)
            }
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id, newMode, isReadOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!hasDiff(initialCategory, category)) {
      navigate(-1)
    } else {
      confirm(resource.msg_confirm_back, () => navigate(-1))
    }
  }

  const save = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      const service = getCategoryService()
      if (!newMode) {
        const diff = makeDiff(initialCategory, category, ["id"])
        if (isEmptyObject(diff)) {
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
      } else {
        confirm(resource.msg_confirm_save, () => {
          showLoading()
          service
            .create(category)
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
    } else if (res === 0) {
      alertError(resource.error_not_found)
    } else {
      alertError(resource.error_conflict)
    }
  }

  return (
    <form id="categoryForm" name="categoryForm" className="form" model-name="category" ref={refForm as any}>
      <header>
        <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
        <h2 className="view-title">{resource.category}</h2>
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
            onChange={(e) => {
              category.sequence = parseInt(e.target.value)
              setCategory({ ...category })
            }}
            onBlur={requiredOnBlur}
            maxLength={3}
            required={true}
            placeholder={resource.sequence}
          />
        </label>
        <div className="col s12 m6 radio-section">
          {resource.status}
          <div className="radio-group">
            <label>
              <input type="radio" id="active" name="status" onChange={onChange} value={Status.Active} checked={category.status === Status.Active} />
              {resource.yes}
            </label>
            <label>
              <input type="radio" id="inactive" name="status" onChange={onChange} value={Status.Inactive} checked={category.status === Status.Inactive} />
              {resource.number}
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
