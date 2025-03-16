import { Item } from "onecore"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import {
  addParametersIntoUrl,
  buildFromUrl,
  buildMessage,
  buildSortFilter,
  getFields,
  getNumber,
  getOffset,
  getSortElement,
  handleSort,
  handleToggle,
  mergeFilter,
  OnClick,
  PageChange,
  pageSizes,
  removeSortStatus,
  setSort,
  Sortable,
  value,
} from "react-hook-core"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { toast } from "ui-toast"
import { handleError, hasPermission, inputSearch, Permission } from "uione"
import { Contact, ContactFilter, getContactService } from "./service"

interface ContactSearch extends Sortable {
  statusList: Item[]
  filter: ContactFilter
  list: Contact[]
  total?: number
  view?: string
  hideFilter?: boolean
  fields?: string[]
}
const contactFilter: ContactFilter = {
  limit: 24,
  name: "",
  email: "",
  q: "",
}

const sizes = pageSizes
export const ContactsForm = () => {
  const initialState: ContactSearch = {
    statusList: [],
    list: [],
    filter: contactFilter,
    hideFilter: true,
  }
  const navigate = useNavigate()
  const refForm = useRef()
  const sp = inputSearch()
  const resource = sp.resource.resource()
  const [state, setState] = useState<ContactSearch>(initialState)

  const canWrite = hasPermission(Permission.write)
  useEffect(() => {
    const filter = mergeFilter(buildFromUrl<ContactFilter>(), state.filter, sizes, ["status", "contactType"])
    setSort(state, filter.sort)
    search() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const sort = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = getSortElement(event.target as HTMLElement)
    const sort = handleSort(target, state.sortTarget, state.sortField, state.sortType)
    state.sortField = sort.field
    state.sortType = sort.type
    state.sortTarget = target
    search()
  }
  const pageSizeChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    state.filter.page = 1
    state.filter.limit = getNumber(event)
    search()
  }
  const pageChanged = (data: PageChange) => {
    const { page, size } = data
    state.filter.page = page
    state.filter.limit = size
    search()
  }
  const searchOnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.preventDefault()
    removeSortStatus(state.sortTarget)
    state.filter.page = 1
    state.sortTarget = undefined
    state.sortField = undefined
    search()
  }
  const limit = state.filter.limit
  const page = state.filter.page
  const search = (isFirstLoad?: boolean) => {
    showLoading()
    const filter = buildSortFilter(state.filter, state)
    addParametersIntoUrl(filter, isFirstLoad)
    const fields = getFields(refForm.current, state.fields)
    getContactService()
      .search(filter, limit, page, fields)
      .then((res) => {
        setState({ ...state, filter: state.filter, list: res.list, total: res.total, fields })
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }
  const edit = (e: OnClick, id: string) => {
    e.preventDefault()
    navigate(`${id}`)
  }
  const { list } = state
  const filter = value(state.filter)
  const offset = getOffset(limit, page)
  return (
    <div>
      <header>
        <h2>{resource.contacts}</h2>
        <div className="btn-group">
          {state.view === "list" && (
            <button type="button" id="btnTable" name="btnTable" className="btn-table" onClick={(e) => setState({ ...state, view: "" })} />
          )}
          {state.view !== "list" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list" onClick={(e) => setState({ ...state, view: "list" })} />
          )}
          {canWrite && <Link id="btnNew" className="btn-new" to="new" />}
        </div>
      </header>
      <div>
        <form id="contactsForm" name="contactsForm" className="form" noValidate={true} ref={refForm as any}>
          <section className="row search-group">
            <label className="col s12 m6 search-input">
              <select id="limit" name="limit" onChange={pageSizeChanged} defaultValue={filter.limit}>
                {sizes.map((item, i) => {
                  return (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  )
                })}
              </select>
              <input
                type="text"
                id="q"
                name="q"
                value={filter.q || ""}
                maxLength={255}
                onChange={(e) => {
                  filter.q = e.target.value
                  setState({ ...state, filter })
                }}
                placeholder={resource.keyword}
              />
              <button
                type="button"
                hidden={!filter.q}
                className="btn-remove-text"
                onClick={(e) => {
                  filter.q = ""
                  setState({ ...state, filter })
                }}
              />
              <button
                type="button"
                className="btn-filter"
                onClick={(e) => {
                  const hideFilter = handleToggle(e.target as HTMLElement, state.hideFilter)
                  setState({ ...state, hideFilter })
                }}
              />
              <button type="submit" className="btn-search" onClick={searchOnClick} />
            </label>
            <Pagination className="col s12 m6" total={state.total} size={state.filter.limit} max={7} page={state.filter.page} onChange={pageChanged} />
          </section>
          <section className="row search-group inline" hidden={state.hideFilter}>
            <label className="col s12 m4 l4">
              {resource.name}
              <input
                type="text"
                id="name"
                name="name"
                value={filter.name || ""}
                onChange={(e) => {
                  filter.name = e.target.value
                  setState({ ...state, filter })
                }}
                maxLength={255}
                placeholder={resource.name}
              />
            </label>
            <label className="col s12 m4 l4">
              {resource.email}
              <input
                type="text"
                id="email"
                name="email"
                value={filter.email || ""}
                onChange={(e) => {
                  filter.email = e.target.value
                  setState({ ...state, filter })
                }}
                maxLength={255}
                placeholder={resource.email}
              />
            </label>
          </section>
        </form>
        {state.view !== "list" && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{resource.number}</th>
                  <th data-field="name">
                    <button type="button" id="sortContactName" onClick={sort}>
                      {resource.name}
                    </button>
                  </th>
                  <th data-field="email">
                    <button type="button" id="sortEmail" onClick={sort}>
                      {resource.email}
                    </button>
                  </th>
                  <th data-field="phone">
                    <button type="button" id="sortPhone" onClick={sort}>
                      {resource.phone}
                    </button>
                  </th>
                  <th data-field="company">
                    <button type="button" id="sortCompany" onClick={sort}>
                      {resource.company}
                    </button>
                  </th>
                  <th data-field="country">
                    <button type="button" id="sortCountry" onClick={sort}>
                      {resource.country}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list &&
                  list.length > 0 &&
                  list.map((contact, i) => {
                    return (
                      <tr key={i} onClick={(e) => edit(e, contact.id)}>
                        <td className="text-right">{offset + i + 1}</td>
                        <td>
                          <Link to={`${contact.id}`}>{contact.name}</Link>
                        </td>
                        <td>{contact.email}</td>
                        <td>{contact.phone}</td>
                        <td>{contact.company}</td>
                        <td>{contact.country}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
        {state.view === "list" && (
          <ul className="row list">
            {list &&
              list.length > 0 &&
              list.map((contact, i) => {
                return (
                  <li key={i} className="col s12 m6 l4 xl3 list-item" onClick={(e) => edit(e, contact.id)}>
                    <Link to={`${contact.id}`}>{contact.name}</Link>
                    <button className="btn-detail" />
                    <p>
                      {contact.email} {contact.phone}
                    </p>
                  </li>
                )
              })}
          </ul>
        )}
      </div>
    </div>
  )
}
