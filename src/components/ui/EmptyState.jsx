import { Inbox } from 'lucide-react'
import cn from '../../lib/cn'

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-100 text-ink-400">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      {title && <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>}
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
