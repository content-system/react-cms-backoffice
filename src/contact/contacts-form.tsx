import { Item } from "onecore"
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import {
  addParametersIntoUrlWithSort,
  buildFromUrl,
  buildMessage,
  getFields,
  getOffset,
  mergeFilter,
  onClearQ,
  onPageChanged,
  onPageSizeChanged,
  onSearch,
  onSort,
  onToggleSearch,
  PageChange,
  pageSizes,
  PageSizeSelect,
  resetSearch,
  resources,
  setSortFilter,
  Sortable,
  updateState
} from "react-hook-core"
import { Link } from "react-router-dom"
import { Pagination } from "reactx-pagination"
import { hideLoading, showLoading } from "ui-loading"
import { toast } from "ui-toast"
import { handleError, hasPermission, Permission, useResource } from "uione"
import { Contact, ContactFilter, getContactService } from "./service"

interface ContactSearch extends Sortable {
  statusList: Item[]
  total?: number
  view?: string
  fields?: string[]
}

export const ContactsForm = () => {
  const canWrite = hasPermission(Permission.write)

  const contactFilter: ContactFilter = {
    limit: resources.defaultLimit,
  }
  const initialState: ContactSearch = {
    statusList: [],
  }

  const resource = useResource()
  const refForm = useRef<HTMLFormElement>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [list, setList] = useState<Contact[]>([])
  const [state, setState] = useState<ContactSearch>(initialState)
  const [filter, setFilter] = useState<ContactFilter>(contactFilter)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => updateState(e, filter, setFilter)
  const statusOnChange = (e: ChangeEvent<HTMLInputElement>) => resetSearch(e, filter, setFilter, search)

  useEffect(() => {
    const initFilter = mergeFilter(buildFromUrl<ContactFilter>(), filter, pageSizes, ["status", "contactType"])
    setSortFilter(initFilter, state, setFilter)
    search(true) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearQ = (e: MouseEvent<HTMLButtonElement>) => onClearQ(filter, setFilter)
  const toggleSearch = (e: MouseEvent<HTMLButtonElement>) => onToggleSearch(e, showFilter, setShowFilter)
  const sort = (e: MouseEvent<HTMLButtonElement>) => onSort(e, search, state)
  const pageSizeChanged = (e: ChangeEvent<HTMLSelectElement>) => onPageSizeChanged(e, search, filter, setFilter)
  const pageChanged = (data: PageChange) => onPageChanged(data, search, filter, setFilter)
  const searchOnClick = (e: MouseEvent<HTMLButtonElement>) => onSearch(e, search, filter, state, setFilter, setState)

  const search = (isFirstLoad?: boolean) => {
    showLoading()
    const fields = getFields(refForm.current, state.fields)
    addParametersIntoUrlWithSort(filter, state, isFirstLoad)
    setFilter(filter)
    const { limit, page } = filter
    getContactService()
      .search({ ...filter }, limit, page, fields)
      .then((res) => {
        setState({ ...state, total: res.total, fields })
        setList(res.list)
        toast(buildMessage(resource, res.list, limit, page, res.total))
      })
      .catch(handleError)
      .finally(hideLoading)
  }

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
        <form id="contactsForm" name="contactsForm" className="form" noValidate={true} ref={refForm}>
          <section className="row search-group">
            <label className="col s12 m6 search-input">
              <PageSizeSelect id="limit" name="limit" size={filter.limit} sizes={pageSizes} onChange={pageSizeChanged} />
              <input type="text" id="q" name="q" value={filter.q} maxLength={80} onChange={onChange} placeholder={resource.keyword} />
              <button type="button" id="btnClearQ" hidden={!filter.q} className="btn-remove-text" onClick={clearQ} />
              <button type="button" id="btnToggleSearch" className="btn-filter" onClick={toggleSearch} />
              <button type="submit" id="btnSearch" className="btn-search" onClick={searchOnClick} />
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
