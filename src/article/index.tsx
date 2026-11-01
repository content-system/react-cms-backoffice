import { Route, Routes } from "react-router"
import { ApproveArticleForm } from "./approve-article"
import { ArticleForm } from "./article-form"
import { ArticleHistory } from "./article-history"
import { ArticlesForm } from "./articles-form"

export default function ArticlesRoute() {
  return (
    <Routes>
      <Route path="" element={<ArticlesForm />} />
      <Route path="/new" element={<ArticleForm />} />
      <Route path="/:id" element={<ArticleForm />} />
      <Route path="/:id/approve" element={<ApproveArticleForm />} />
      <Route path="/:id/history" element={<ArticleHistory />} />
    </Routes>
  )
}
