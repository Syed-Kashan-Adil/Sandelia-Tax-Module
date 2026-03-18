import { cn } from '../../../lib/utils'
import { useTaxOnboardingStore } from '../store'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

export function Step3ActivityStartDate() {
  const activityStartDate = useTaxOnboardingStore((s) => s.values.activityStartDate)
  const activityType = useTaxOnboardingStore((s) => s.values.activityType)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  return (
    <div className="space-y-6">
      <Field label="When did you start your self-employed activity?">
        <Input
          type="date"
          value={activityStartDate}
          onChange={(e) => setValues({ activityStartDate: e.target.value })}
        />
      </Field>

      <Field
        label="What type of activity do you carry out?"
        hint="This can be used for future logic and reporting."
      >
        <div className="grid gap-3">
          <ActivityOption
            title="Commercial activity"
            description="Buying and selling goods, trading"
            selected={activityType === 'commercial'}
            onSelect={() => setValues({ activityType: 'commercial' })}
          />
          <ActivityOption
            title="Liberal profession"
            description="Professional services, consulting"
            selected={activityType === 'liberal'}
            onSelect={() => setValues({ activityType: 'liberal' })}
          />
        </div>
      </Field>
    </div>
  )
}

function ActivityOption(props: {
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition',
        props.selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-muted-foreground/50'
      )}
    >
      <span
        className={cn(
          'mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border-2',
          props.selected ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}
        aria-hidden
      >
        {props.selected ? <span className="h-2 w-2 rounded-sm bg-white" /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{props.title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{props.description}</span>
      </span>
    </button>
  )
}
