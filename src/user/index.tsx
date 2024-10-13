import { Route, Routes } from "react-router"
import { RoleAssignmentForm } from "./role-assignment-form"
import { UserForm } from "./user-form"
import { UserView } from "./user-view"
import { UsersForm } from "./users-form"

export default function UsersRoute() {
  return (
    <Routes>
      <Route path="" element={<UsersForm />} />
      <Route path="/new" element={<UserForm />} />
      <Route path="/:id" element={<UserForm />} />
      <Route path="/:id/view" element={<UserView />} />
      <Route path="/:id/assign" element={<RoleAssignmentForm />} />
    </Routes>
  )
}
