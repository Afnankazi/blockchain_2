

import { OptionCards } from "@/components/inventory/option-cards"
import { ItemsSubheader } from "@/components/inventory/subheaders/items-subheader"

export default async function AppInventoryItemsPage(): Promise<JSX.Element> {
  return (
    <div>
      <ItemsSubheader />
      <OptionCards />
    </div>
  )
}
