'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

type DrawerContextValue = {
  open: boolean
  setOpen: (value: boolean) => void
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

function useDrawerContext() {
  const ctx = React.useContext(DrawerContext)
  if (!ctx) {
    throw new Error('Drawer components must be used within <Drawer />')
  }
  return ctx
}

type DrawerProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Drawer({ open, defaultOpen, onOpenChange, children }: DrawerProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const isControlled = typeof open === 'boolean'
  const resolvedOpen = isControlled ? open : internalOpen

  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value)
    }
    onOpenChange?.(value)
  }

  return (
    <DrawerContext.Provider value={{ open: resolvedOpen, setOpen }}>
      {children}
    </DrawerContext.Provider>
  )
}

function DrawerTrigger({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDrawerContext()
  return (
    <button
      type="button"
      data-slot="drawer-trigger"
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  )
}

function DrawerPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div data-slot="drawer-portal">{children}</div>,
    document.body,
  )
}

function DrawerClose({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDrawerContext()
  return (
    <button
      type="button"
      data-slot="drawer-close"
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </button>
  )
}

function DrawerOverlay({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useDrawerContext()
  if (!open) return null
  return (
    <div
      role="presentation"
      onClick={() => setOpen(false)}
      data-slot="drawer-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  )
}

type DrawerContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: 'left' | 'right' | 'top' | 'bottom'
}

function DrawerContent({
  className,
  children,
  side = 'bottom',
  ...props
}: DrawerContentProps) {
  const { open, setOpen } = useDrawerContext()
  if (!open) return null

  const sideClasses =
    side === 'top'
      ? 'inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b'
      : side === 'bottom'
        ? 'inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t'
        : side === 'right'
          ? 'inset-y-0 right-0 w-3/4 sm:max-w-sm border-l'
          : 'inset-y-0 left-0 w-3/4 sm:max-w-sm border-r'

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <div
        role="dialog"
        aria-modal="true"
        data-slot="drawer-content"
        className={cn(
          'group/drawer-content bg-background fixed z-50 flex h-auto flex-col',
          sideClasses,
          className,
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        <button
          type="button"
          className="sr-only"
          onClick={() => setOpen(false)}
          aria-label="Close drawer"
        />
        {children}
      </div>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'flex flex-col gap-0.5 p-4 text-center md:text-left',
        className,
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="drawer-title"
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="drawer-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
