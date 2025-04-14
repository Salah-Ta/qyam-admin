import { type SVGProps } from 'react'
import { cn } from '~/lib/tw-merge'
import spriteHref from "~/assets/icons/sheet/sprites.svg"


const sizeClassName = {
  font: 'w-[1em] h-[1em]',
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
  xl3: 'w-9 h-9',
  xl4: "w-10 h-10",
  xl7: "md:w-16 md:h-16 w-6 h-6",
  fit:"w-fit h-fit"
} as const

type Size = keyof typeof sizeClassName

const childrenSizeClassName = {
  font: 'gap-1.5',
  xs: 'gap-1.5',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
  xl: 'gap-3',
  xl3:'gap-5',
  xl4: "gap-6",
  xl7: "gap-8",
  fit:"gap-8"
} satisfies Record<Size, string>

export function Icon({
  name,
  size = 'font',
  className,
  children,
  color,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: string
  size?: Size
  color?:string
}) {
  if (children) {
    return (
      <span
        className={`inline-flex items-center ${childrenSizeClassName[size]}`}
      >
        <Icon name={name} size={size}  className={className} {...props} />
        {children}
      </span>
    )
  }
  return (
    <svg
    fill={color}
      {...props}
      className={cn(sizeClassName[size], 'inline self-center', className)}
    >
      <use href={`${spriteHref}#${name}`} />
    </svg>
  )
}