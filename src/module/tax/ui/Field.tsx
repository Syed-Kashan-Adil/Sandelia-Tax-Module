import type { ReactNode } from 'react'

import { cn } from '../../../lib/utils'

export function Field(props: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2', props.className)}>
      <div>
        <div className="text-sm font-medium">{props.label}</div>
        {props.hint ? <div className="text-xs text-muted-foreground">{props.hint}</div> : null}
      </div>
      <div>{props.children}</div>
      {props.error ? <div className="text-xs text-destructive">{props.error}</div> : null}
    </div>
  )
}
