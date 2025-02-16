import { Route, Routes } from "react-router"
import { ContactForm } from "./contact-form"
import { ContactsForm } from "./contacts-form"

export default function ContactsRoute() {
  return (
    <Routes>
      <Route path="" element={<ContactsForm />} />
      <Route path="/:id" element={<ContactForm />} />
    </Routes>
  )
}
