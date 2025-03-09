import { Result } from "onecore"
import React, { useEffect, useRef, useState } from "react"
import { clone, hasDiff, isEmptyObject, isSuccessful, makeDiff, setReadOnly } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import { registerEvents, requiredOnBlur, showFormError, validateForm } from "ui-plus"
import { getLocale, handleError, hasPermission, initForm, Permission, Status, useResource } from "uione"
import { Category, getCategoryService } from "./service"

const createCategory = (): Category => {
  const category = {} as Category
  category.status = Status.Active
  return category
}

interface InternalState {
  category: Category
}
const initialState: InternalState = {
  category: {} as Category,
}

export const CategoryForm = () => {
  const isReadOnly = !hasPermission(Permission.write, 1)
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef()
  const [initialCategory, setInitialCategory] = useState<Category>(createCategory())
  const [state, setState] = useState<InternalState>(initialState)
  const { id } = useParams()
  const newMode = !id
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (!id) {
      const category = createCategory()
      setInitialCategory(clone(category))
      setState({ category })
    } else {
      showLoading()
      getCategoryService()
        .load(id)
        .then((category) => {
          if (!category) {
            alertError(resource.error_404, () => navigate(-1))
          } else {
            setInitialCategory(clone(category))
            setState({ category })
            if (isReadOnly) {
              setReadOnly(refForm?.current)
            }
          }
        })
        .catch(handleError)
        .finally(hideLoading)
    }
  }, [id, newMode, isReadOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const category = state.category
  const back = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!hasDiff(initialCategory, category)) {
      navigate(-1)
    } else {
      confirm(resource.msg_confirm_back, () => navigate(-1))
    }
  }

  const statusOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    category.status = e.target.value
    setState({ ...state, category })
  }
  const save = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      const service = getCategoryService()
      confirm(resource.msg_confirm_save, () => {
        if (newMode) {
          showLoading()
          service
            .create(category)
            .then((res) => afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        } else {
          const diff = makeDiff(initialCategory, category, ["id"])
          if (isEmptyObject(diff)) {
            alertWarning(resource.msg_no_change)
          } else {
            showLoading()
            service
              .patch(category)
              .then((res) => afterSaved(res))
              .catch(handleError)
              .finally(hideLoading)
          }
        }
      })
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
            value={category.id || ""}
            readOnly={!newMode}
            onChange={(e) => {
              category.id = e.target.value
              setState({ ...state, category })
            }}
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
            value={category.name || ""}
            onChange={(e) => {
              category.name = e.target.value
              setState({ ...state, category })
            }}
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
            value={category.path || ""}
            onChange={(e) => {
              category.path = e.target.value
              setState({ ...state, category })
            }}
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
            value={category.resource || ""}
            onChange={(e) => {
              category.resource = e.target.value
              setState({ ...state, category })
            }}
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
            value={category.icon || ""}
            onChange={(e) => {
              category.icon = e.target.value
              setState({ ...state, category })
            }}
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
            value={category.type || ""}
            onChange={(e) => {
              category.type = e.target.value
              setState({ ...state, category })
            }}
            onBlur={requiredOnBlur}
            maxLength={255}
            required={true}
            placeholder={resource.type}
          />
        </label>
        <label className="col s12 m6">
          {resource.parent}
          <input
            type="text"
            id="parent"
            name="parent"
            value={category.parent || ""}
            onChange={(e) => {
              category.parent = e.target.value
              setState({ ...state, category })
            }}
            onBlur={requiredOnBlur}
            maxLength={255}
            required={true}
            placeholder={resource.parent}
          />
        </label>
        <label className="col s12 m6">
          {resource.sequence}
          <input
            type="tel"
            id="sequence"
            name="sequence"
            value={category.sequence || ""}
            onChange={(e) => {
              category.sequence = parseInt(e.target.value)
              setState({ ...state, category })
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
              <input type="radio" id="active" name="status" onChange={statusOnChange} value={Status.Active} checked={category.status === Status.Active} />
              {resource.yes}
            </label>
            <label>
              <input type="radio" id="inactive" name="status" onChange={statusOnChange} value={Status.Inactive} checked={category.status === Status.Inactive} />
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
