import { useMemo } from 'react'

import { cn } from '../../../lib/utils'
import type { StepLogicInfo } from '../stepLogic'

export function StepLogicPanel({
  step,
  info,
  className,
}: {
  step: number
  info: StepLogicInfo | null
  className?: string
}) {
  const content = useMemo(() => {
    if (!info) {
      return {
        title: `Step ${step}`,
        bullets: ['No reference notes configured for this step yet.'],
        sources: [],
      }
    }
    return info
  }, [info, step])

  return (
    <aside className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <div className="text-sm font-semibold text-foreground">Logic & Source</div>
      <div className="mt-2 text-sm font-medium text-foreground">{content.title}</div>

      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
        {content.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      {content.sources.length ? (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            References
          </div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {content.sources.map((s) => (
              <li key={`${s.doc}-${s.ref}`}>
                <span className="font-medium text-foreground">{s.doc}</span>
                <span className="text-muted-foreground">{` — ${s.ref}`}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  )
}
