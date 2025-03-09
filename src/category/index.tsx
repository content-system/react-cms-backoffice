import { Route, Routes } from "react-router"
import { CategoryForm } from "./category-form"
import { CategoriesForm } from "./categories-form"

export default function CategoriesRoute() {
  return (
    <Routes>
      <Route path="" element={<CategoriesForm />} />
      <Route path="/new" element={<CategoryForm />} />
      <Route path="/:id" element={<CategoryForm />} />
    </Routes>
  )
}
