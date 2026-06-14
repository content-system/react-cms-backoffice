import { Route, Routes } from "react-router"
import { CategoriesForm } from "./categories-form"
import { CategoryForm } from "./category-form"

export default function CategoriesRoute() {
  return (
    <Routes>
      <Route path="" element={<CategoriesForm />} />
      <Route path="/new" element={<CategoryForm />} />
      <Route path="/:id" element={<CategoryForm />} />
    </Routes>
  )
}
