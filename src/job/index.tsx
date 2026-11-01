import { Route, Routes } from "react-router"
import { JobForm } from "./job-form"
import { JobsForm } from "./jobs-form"

export default function JobsRoute() {
  return (
    <Routes>
      <Route path="" element={<JobsForm />} />
      <Route path="/new" element={<JobForm />} />
      <Route path="/:id" element={<JobForm />} />
    </Routes>
  )
}
