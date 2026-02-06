import * as React from "react"
import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import Link from "next/link"

import { db } from "@/db/index"
import { brands } from "@/db/schema"
import { env } from "@/env.mjs"
import { desc, sql } from "drizzle-orm"

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
import { BrandsSubheader } from "@/components/inventory/subheaders/brands-subheader"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Brands",
  description: "Manage your product brands",
}

export default async function AppInventoryBrandsPage(): Promise<JSX.Element> {
  noStore()
  
  const allBrands = await db
    .select()
    .from(brands)
    .orderBy(brands.name)

  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(brands)
    .then((res) => res[0]?.count ?? 0)

  return (
    <div>
      <BrandsSubheader />
      <div className="p-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Brands</CardTitle>
              <CardDescription>
                Total: {totalCount} brands
              </CardDescription>
            </div>
            <Link href="/app/inventory/brands/new-brand">
              <Button>
                <Icons.plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {allBrands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icons.shoppingBasket className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No brands yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Get started by adding your first brand
                </p>
                <Link href="/app/inventory/brands/new-brand">
                  <Button>
                    <Icons.plus className="mr-2 h-4 w-4" />
                    Add Brand
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Brand Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allBrands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell className="font-medium">{brand.id}</TableCell>
                        <TableCell>{brand.name}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Icons.moreHorizontal className="h-4 w-4" />
                          </Button>
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
    </div>
  )
}
