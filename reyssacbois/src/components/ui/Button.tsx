import Link from "next/link"
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react"

export type ButtonVariant = "primary" | "secondary" | "ghost-dark" | "danger"
export type ButtonSize = "sm" | "md"

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "rb-btn rb-btn-primary",
  secondary: "rb-btn rb-btn-secondary",
  "ghost-dark": "rb-btn rb-btn-ghost-dark",
  danger: "rb-btn rb-btn-danger",
}

// `.rb-btn` (layer components) is overridden by these utilities (layer utilities).
const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-[0.8125rem]",
  md: "",
}

function classesFor(variant: ButtonVariant, size: ButtonSize, extra?: string) {
  return [VARIANT_CLASS[variant], SIZE_CLASS[size], extra].filter(Boolean).join(" ")
}

type CommonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classesFor(variant, size, className)} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={classesFor(variant, size, className)} {...props}>
      {children}
    </Link>
  )
}

export default Button
