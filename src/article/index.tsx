import { Route, Routes } from "react-router"
import { ArticleForm } from "./article-form"
import { ArticlesForm } from "./articles-form"

export default function ArticlesRoute() {
  return (
    <Routes>
      <Route path="" element={<ArticlesForm />} />
      <Route path="/new" element={<ArticleForm />} />
      <Route path="/:id" element={<ArticleForm />} />
    </Routes>
  )
}
