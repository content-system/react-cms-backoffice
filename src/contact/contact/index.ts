import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { Contact, ContactFilter, contactModel, ContactService } from "./contact"

export * from "./contact"

export class ContactClient extends Client<Contact, string, ContactFilter> implements ContactService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, contactModel)
    this.searchGet = true
  }
}
