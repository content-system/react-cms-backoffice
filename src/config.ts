export const config = {
  authentication_url: "http://localhost:8083",
  signup_url: "http://localhost:8082/signup",
  password_url: "http://localhost:8082/password",
  oauth2_url: "http://localhost:8082/oauth2",

  master_data_url: "http://localhost:8083/code",
  user_url: "http://localhost:8083/users",
  role_url: "http://localhost:8083/roles",
  privilege_url: "http://localhost:8083/privileges",
  audit_log_url: "http://localhost:8083/audit-logs",
  settings_url: "http://localhost:8083/settings",

  category_url: "http://localhost:8083/categories",
  content_url: "http://localhost:8083/contents",
  article_url: "http://localhost:8083/articles",
  job_url: "http://localhost:8083/jobs",
  contact_url: "http://localhost:8083/contacts",
}

export const env = {
  sit: {
    authentication_url: "http://10.1.0.234:3003",
  },
  deploy: {
    authentication_url: "/server",
  },
}
