

import { OptionCards } from "@/components/inventory/option-cards"
import { CompositeItemsSubheader } from "@/components/inventory/subheaders/compoite-items-subheader"

export default async function AppInventoryCompositeItemsPage(): Promise<JSX.Element> {
  return (
    <div>
      <CompositeItemsSubheader />
      <OptionCards />
    </div>
  )
}
