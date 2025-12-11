'use client'

import * as React from 'react'

type ThemeProviderProps = {
  children: React.ReactNode
}

// Placeholder theme provider until theming is needed.
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>
}
