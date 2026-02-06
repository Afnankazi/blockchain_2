import * as React from "react"
import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import Link from "next/link"

import { db } from "@/db/index"
import { items, type Item } from "@/db/schema"
import { env } from "@/env.mjs"
import { asc, desc, like, sql } from "drizzle-orm"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icons } from "@/components/icons"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "All Items",
  description: "View and manage all inventory items",
}

export default async function AllItemsPage(): Promise<JSX.Element> {
  noStore()
  
  const allItems = await db
    .select()
    .from(items)
    .orderBy(desc(items.createdAt))
    .limit(50)

  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(items)
    .then((res) => res[0]?.count ?? 0)

  return (
    <div className="p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Items</h1>
          <p className="text-muted-foreground">
            Total: {totalCount} items
          </p>
        </div>
        <Link href="/app/inventory/items/new-item">
          <Button>
            <Icons.plus className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Manage your product inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Icons.inventory className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No items yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get started by adding your first inventory item
              </p>
              <Link href="/app/inventory/items/new-item">
                <Button>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.sellingPrice}
                      </TableCell>
                      <TableCell>{item.warehouse}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/app/inventory/items/${item.id}`}>
                          <Button variant="ghost" size="sm">
                            <Icons.moreHorizontal className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
