import type { Resources, StringMap } from "uione"
import { en as adminEN } from "./admin/en"
import { vi as adminVI } from "./admin/vi"
import { en as authenticationEN } from "./authentication/en"
import { vi as authenticationVI } from "./authentication/vi"
import { en as countryEN } from "./country/en"
import { vi as countryVI } from "./country/vi"
import { en as commonEN } from "./en"
import { vi as commonVI } from "./vi"

const en: StringMap = {
  ...commonEN,
  ...authenticationEN,
  ...adminEN,
  ...countryEN,
}
const vi: StringMap = {
  ...commonVI,
  ...authenticationVI,
  ...adminVI,
  ...countryVI,
}

export const resources: Resources = {
  en: en,
  vi: vi,
}
