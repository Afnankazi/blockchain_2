import * as React from "react"
import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import Link from "next/link"

import { db } from "@/db/index"
import { units } from "@/db/schema"
import { env } from "@/env.mjs"
import { sql } from "drizzle-orm"

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
  title: "Units",
  description: "Manage measurement units",
}

export default async function AppInventoryUnitsPage(): Promise<JSX.Element> {
  noStore()
  
  const allUnits = await db
    .select()
    .from(units)
    .orderBy(units.name)

  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(units)
    .then((res) => res[0]?.count ?? 0)

  return (
    <div className="p-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Measurement Units</CardTitle>
            <CardDescription>
              Total: {totalCount} units
            </CardDescription>
          </div>
          <Link href="/app/inventory/units/new-unit">
            <Button>
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {allUnits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Icons.list className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No units yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get started by adding measurement units (kg, pieces, meters, etc.)
              </p>
              <Link href="/app/inventory/units/new-unit">
                <Button>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Unit
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Unit Name</TableHead>
                    <TableHead>Abbreviation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.id}</TableCell>
                      <TableCell>{unit.name}</TableCell>
                      <TableCell className="font-mono">{unit.abbreviation}</TableCell>
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
  )
}
