import { MouseEvent, useEffect, useRef, useState } from "react"
import { afterSaved, clone, isEmpty, makeDiff, onBack, updateState } from "react-hook-core"
import { useNavigate, useParams } from "react-router-dom"
import { alertError, alertSuccess, alertWarning, confirm } from "ui-alert"
import { hideLoading, showLoading } from "ui-loading"
import {
  datetimeToString,
  emailOnBlur,
  formatPhone,
  initForm,
  phoneOnBlur,
  registerEvents,
  removePhoneFormat,
  requiredOnBlur,
  showFormError,
  validateForm
} from "ui-plus"
import { getLocale, handleError, hasPermission, Permission, useResource } from "uione"
import { Contact, getContactService } from "./service"

const createContact = (): Contact => {
  const contact = {} as Contact
  return contact
}

export const ContactForm = () => {
  const canWrite = hasPermission(Permission.write, 1)
  const resource = useResource()
  const navigate = useNavigate()
  const refForm = useRef<HTMLFormElement>(null)
  const [initialContact, setInitialContact] = useState<Contact>()
  const [contact, setContact] = useState<Contact>(createContact())

  const { id } = useParams()
  useEffect(() => {
    initForm(refForm?.current, registerEvents)
    if (id) {
      getContactService()
        .load(id)
        .then((contact) => {
          if (contact) {
            setInitialContact(clone(contact))
            setContact(contact)
          }
        })
        .catch(handleError)
    }
  }, [id, canWrite]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = (e: MouseEvent<HTMLButtonElement>) => onBack(e, navigate, confirm, resource, contact, initialContact)

  const save = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    const valid = validateForm(refForm?.current, getLocale())
    if (valid) {
      const service = getContactService()
      const diff = makeDiff(contact, initialContact, ["id"])
      if (isEmpty(diff)) {
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
    <form id="contactForm" name="contactForm" className="form" ref={refForm}>
      <header>
        <button type="button" id="btnBack" name="btnBack" className="btn-back" onClick={back} />
        <h2>{resource.contact}</h2>
      </header>
      <div className="row">
        <label className="col s12 m6">
          {resource.fullname}
          <input
            type="text"
            id="name"
            name="name"
            value={contact.name}
            onChange={(e) => updateState(e, contact, setContact)}
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
            value={contact.country}
            onChange={(e) => updateState(e, contact, setContact)}
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
            value={contact.company}
            onChange={(e) => updateState(e, contact, setContact)}
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
            value={contact.jobTitle}
            onChange={(e) => updateState(e, contact, setContact)}
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
            value={contact.email}
            onChange={(e) => updateState(e, contact, setContact)}
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
            value={formatPhone(contact.phone)}
            onChange={(e) => {
              contact.phone = removePhoneFormat(e.target.value)
              setContact({ ...contact })
            }}
            onFocus={(e) => {
              e.target.value = removePhoneFormat(e.target.value)
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
            onChange={(e) => updateState(e, contact, setContact)}
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
            value={contact.contactedBy}
            onChange={(e) => updateState(e, contact, setContact)}
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
            onChange={(e) => updateState(e, contact, setContact)}
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
            onChange={(e) => updateState(e, contact, setContact)}
            onBlur={requiredOnBlur}
            maxLength={400}
            placeholder={resource.message}
          />
        </label>
      </div>
      <footer>
        {canWrite && (
          <button type="submit" id="btnSave" name="btnSave" onClick={save}>
            {resource.save}
          </button>
        )}
      </footer>
    </form>
  )
}
