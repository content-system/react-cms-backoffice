import { HttpRequest } from "axios-core"
import { Client } from "web-clients"
import { type Contact, type ContactFilter, contactModel, type ContactService } from "./contact"

export * from "./contact"

export class ContactClient extends Client<Contact, string, ContactFilter> implements ContactService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, contactModel)
    this.searchGet = true
  }
}
