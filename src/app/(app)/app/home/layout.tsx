import * as React from "react"

interface AppHomeLayoutProps {
  children: React.ReactNode
}

export default function AppHomeLayout({
  children,
}: AppHomeLayoutProps): JSX.Element {
  return <div>{children}</div>
}
