import { Route, Routes } from "react-router"
import { ContentForm } from "./content-form"
import { ContentsForm } from "./contents-form"

export default function ContentsRoute() {
  return (
    <Routes>
      <Route path="" element={<ContentsForm />} />
      <Route path="/new" element={<ContentForm />} />
      <Route path="/:id/:lang" element={<ContentForm />} />
    </Routes>
  )
}
