

import { OptionCards } from "@/components/inventory/option-cards"
import { ItemGroupsSubheader } from "@/components/inventory/subheaders/item-groups-subheader"

export default async function AppInventoryItemGroupsPage(): Promise<JSX.Element> {
  return (
    <div>
      <ItemGroupsSubheader />
      <OptionCards />
    </div>
  )
}
