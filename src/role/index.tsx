import { Route, Routes } from "react-router"
import { RoleAssignmentForm } from "./role-assignment-form"
import { RoleForm } from "./role-form"
import { RolesForm } from "./roles-form"

export default function RolesRoute() {
  return (
    <Routes>
      <Route path="" element={<RolesForm />} />
      <Route path="/new" element={<RoleForm />} />
      <Route path="/:id" element={<RoleForm />} />
      <Route path="/:id/assign" element={<RoleAssignmentForm />} />
    </Routes>
  )
}
