import React, { useEffect, useRef, useState } from "react"
import { afterSaved, goBack, isEmptyObject, makeDiff, OnClick } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import {
  createDate,
  datetimeToString,
  emailOnBlur,
  formatPhone,
  initForm,
  phoneOnBlur,
  registerEvents,
  removePhoneFormat,
  requiredOnBlur,
  showFormError,
  validateForm,
} from "ui-plus"
import { getLocale, handleError, hasPermission, Permission, useResource } from "uione"
import { Contact, getContactService } from "./service"

const createContact = (): Contact => {
  const contact = {} as Contact
  return contact
}

interface InternalState {
  contact: Contact
}
const initialState: InternalState = {
  contact: {} as Contact,
}

export const ContactForm = () => {
  const isReadOnly = !hasPermission(Permission.write, 1)
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  // eslint-disable-next-line
  const [initialContact, setInitialContact] = useState<Contact>(createContact())
  const [state, setState] = useState<InternalState>(initialState)
  const { id } = useParams()
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (id) {
      getContactService()
        .load(id as string)
        .then((contact) => {
          if (contact) {
            setInitialContact(contact)
            setState({ contact })
          }
        })
        .catch(handleError)
    }
  }, [id, isReadOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const contact = state.contact
  
  const back = (event: OnClick) => goBack(navigate, confirm, resource, initialContact, contact)
  
  const save = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      const service = getContactService()
      const diff = makeDiff(initialContact, contact, ["id"])
      if (isEmptyObject(diff)) {
        alertWarning(resource.msg_no_change)
      } else {
        confirm(resource.msg_confirm_save, () => {
          showLoading()
          service
            .patch(contact)
            .then((res) => afterSaved(res, refForm?.current, resource, showFormError, alertSuccess, alertError, navigate))
            .catch(handleError)
            .finally(hideLoading)
        })
      }
    }
  }
  return (
    <form id="contactForm" name="contactForm" className="form" model-name="contact" ref={refForm as any}>
      <header>
        <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
        <h2 className="view-title">{resource.contact}</h2>
      </header>
      <div className="row">
        <label className="col s12 m6">
          {resource.fullname}
          <input
            type="text"
            id="name"
            name="name"
            value={contact.name || ""}
            onChange={(e) => {
              contact.name = e.target.value
              setState({ contact })
            }}
            onBlur={requiredOnBlur}
            maxLength={100}
            required={true}
            placeholder={resource.fullname}
          />
        </label>
        <label className="col s12 m6">
          {resource.country}
          <input
            type="text"
            id="country"
            name="country"
            value={contact.country || ""}
            onChange={(e) => {
              contact.country = e.target.value
              setState({ contact })
            }}
            onBlur={requiredOnBlur}
            maxLength={100}
            required={true}
            placeholder={resource.country}
          />
        </label>
        <label className="col s12 m6">
          {resource.company}
          <input
            type="text"
            id="company"
            name="company"
            value={contact.company || ""}
            onChange={(e) => {
              contact.company = e.target.value
              setState({ contact })
            }}
            onBlur={requiredOnBlur}
            maxLength={100}
            required={true}
            placeholder={resource.company}
          />
        </label>
        <label className="col s12 m6 required">
          {resource.job_title}
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            data-type="jobTitle"
            value={contact.jobTitle || ""}
            onChange={(e) => {
              contact.jobTitle = e.target.value
              setState({ contact })
            }}
            onBlur={requiredOnBlur}
            maxLength={100}
            placeholder={resource.job_title}
          />
        </label>
        <label className="col s12 m6">
          {resource.email}
          <input
            type="text"
            id="email"
            name="email"
            data-type="email"
            value={contact.email || ""}
            onChange={(e) => {
              contact.email = e.target.value
              setState({ contact })
            }}
            onBlur={emailOnBlur}
            required={true}
            maxLength={120}
            placeholder={resource.email}
          />
        </label>
        <label className="col s12 m6">
          {resource.phone}
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formatPhone(contact.phone) || ""}
            onChange={(e) => {
              contact.phone = removePhoneFormat(e.target.value)
              setState({ contact })
            }}
            onBlur={phoneOnBlur}
            required={true}
            maxLength={17}
            placeholder={resource.phone}
          />
        </label>
        <label className="col s12 m6">
          {resource.submitted_at}
          <input
            type="datetime-local"
            id="submittedAt"
            name="submittedAt"
            value={datetimeToString(contact.submittedAt)}
            onChange={(e) => {
              contact.submittedAt = createDate(e.target.value)
              setState({ contact })
            }}
            onBlur={requiredOnBlur}
            maxLength={19}
            required={true}
            placeholder={resource.submitted_at}
          />
        </label>
        <label className="col s12 m6">
          {resource.contacted_by}
          <input
            type="text"
            id="contactedBy"
            name="contactedBy"
            value={contact.contactedBy || ""}
            onChange={(e) => {
              contact.contactedBy = e.target.value
              setState({ contact })
            }}
            maxLength={100}
            placeholder={resource.contacted_by}
          />
        </label>
        <label className="col s12 m6">
          {resource.contacted_at}
          <input
            type="datetime-local"
            id="contactedAt"
            name="contactedAt"
            value={datetimeToString(contact.contactedAt)}
            onChange={(e) => {
              contact.contactedAt = createDate(e.target.value)
              setState({ contact })
            }}
            maxLength={19}
            placeholder={resource.contacted_at}
          />
        </label>
        <label className="col s12 auto-height required">
          {resource.message}
          <textarea
            id="message"
            name="message"
            rows={8}
            value={contact.message}
            onChange={(e) => {
              contact.message = e.target.value
              setState({ contact })
            }}
            onBlur={requiredOnBlur}
            maxLength={400}
            placeholder={resource.message}
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
