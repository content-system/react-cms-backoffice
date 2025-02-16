import axios from "axios"
import { HttpRequest } from "axios-core"
import { options, storage } from "uione"
import { ContactClient, ContactService } from "./contact"

export * from "./contact"
// axios.defaults.withCredentials = true;

const httpRequest = new HttpRequest(axios, options)
export interface Config {
  contact_url: string
}
let contactService: ContactService | undefined

export function getContactService(): ContactService {
  if (!contactService) {
    const c = storage.config()
    contactService = new ContactClient(httpRequest, c.contact_url)
  }
  return contactService
}
