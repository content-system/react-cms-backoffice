import { useState } from "react"
import { buildShownItems, Groups, type Item } from "react-groups"
import { useSearchParams } from "react-router"
import { getPrivileges, useResource } from "uione"

export default function HomePage() {
  const resource = useResource()
  const groups = getPrivileges()
  const [items] = useState<Item[]>(groups)
  const [searchParams] = useSearchParams()
  const v = (searchParams.get("q") as string) || ""
  const shownItems = buildShownItems(v, items)
  return (
    <Groups
      title={resource.welcome_title}
      groups={shownItems}
      resource={resource}
      className="view-container menu"
      groupClass="row group hr-height-1"
      headerClass="col s12 m12"
      subClass="col s6 m6 l3 xl2 group-span"
    />
  )
}
