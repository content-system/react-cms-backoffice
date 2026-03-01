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
  handleToggle,
  mergeFilter,
  onSort,
  PageChange,
  pageSizes,
  removeSortStatus,
  setSort,
  Sortable
} from "react-hook-core"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { toast } from "ui-toast"
import { handleError, hasPermission, Permission, useResource } from "uione"
import { Contact, ContactFilter, getContactService } from "./service"

interface ContactSearch extends Sortable {
  statusList: Item[]
  list: Contact[]
  total?: number
  view?: string
  fields?: string[]
}

const sizes = pageSizes
export const ContactsForm = () => {
  const canWrite = hasPermission(Permission.write)

  const contactFilter: ContactFilter = {
    limit: 24,
    name: "",
    email: "",
    q: "",
  }
  const initialState: ContactSearch = {
    statusList: [],
    list: [],
  }

  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<ContactSearch>(initialState)
  const [filter, setFilter] = useState<ContactFilter>(contactFilter)
  const [showFilter, setShowFilter] = useState<boolean>(false)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<ContactFilter>(), filter, sizes, ["status", "contactType"])
    setSort(state, initFilter.sort)
    setFilter(initFilter)
    search(true) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sort = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onSort(event, search, state)
  const pageSizeChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    filter.page = 1
    filter.limit = getNumber(event)
    setFilter(filter)
    search()
  }
  const pageChanged = (data: PageChange) => {
    const { page, size } = data
    filter.page = page
    filter.limit = size
    setFilter(filter)
    search()
  }
  const searchOnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.preventDefault()
    removeSortStatus(state.sortTarget)
    filter.page = 1
    state.sortTarget = undefined
    state.sortField = undefined
    setFilter(filter)
    setState(state)
    search()
  }

  const search = (isFirstLoad?: boolean) => {
    showLoading()
    const urlFilter = buildSortFilter(filter, state)
    addParametersIntoUrl(urlFilter, isFirstLoad)
    const fields = getFields(refForm.current, state.fields)
    const { limit, page } = filter
    getContactService()
      .search({ ...filter }, limit, page, fields)
      .then((res) => {
        setState({ ...state, list: res.list, total: res.total, fields })
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  const { list } = state
  const offset = getOffset(filter.limit, filter.page)
  return (
    <div>
      <header>
        <h2>{resource.contacts}</h2>
        <div className="btn-group">
          {state.view === "list" && (
            <button type="button" id="btnTable" name="btnTable" className="btn-table" onClick={(e) => setState({ ...state, view: "table" })} />
          )}
          {state.view !== "list" && (
            <button type="button" id="btnListView" name="btnListView" className="btn-list" onClick={(e) => setState({ ...state, view: "list" })} />
          )}
          {canWrite && <Link id="btnNew" className="btn-new" to="new" />}
        </div>
      </header>
      <div className="search-body">
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
                  setFilter({ ...filter })
                }}
                placeholder={resource.keyword}
              />
              <button
                type="button"
                hidden={!filter.q}
                className="btn-remove-text"
                onClick={(e) => {
                  filter.q = ""
                  setFilter({ ...filter })
                }}
              />
              <button
                type="button"
                className="btn-filter"
                onClick={(e) => {
                  const toggleFilter = handleToggle(e.target as HTMLElement, showFilter)
                  setShowFilter(toggleFilter)
                }}
              />
              <button type="submit" className="btn-search" onClick={searchOnClick} />
            </label>
            <Pagination className="col s12 m6" total={state.total} size={filter.limit} max={7} page={filter.page} onChange={pageChanged} />
          </section>
          <section className="row search-group inline" hidden={!showFilter}>
            <label className="col s12 m4 l4">
              {resource.name}
              <input
                type="text"
                id="name"
                name="name"
                value={filter.name || ""}
                onChange={(e) => {
                  filter.name = e.target.value
                  setFilter({ ...filter })
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
                  setFilter({ ...filter })
                }}
                maxLength={255}
                placeholder={resource.email}
              />
            </label>
          </section>
        </form>
        {state.view !== "list" && (
          <div className="table-responsive">
            <table>
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
                      <tr key={i}>
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
                  <li key={i} className="col s12 m6 l4 xl3 list-item">
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
