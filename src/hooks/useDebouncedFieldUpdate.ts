import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { useEffect, useRef } from 'react'

export function useDebouncedFieldUpdate<T extends FieldValues>(
  form: UseFormReturn<T>,
  updater: (delta: Partial<T>) => void,
  delay = 300,
) {
  const timersRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const timers = timersRef.current
    const subscription = form.watch((_, info) => {
      const name = info.name as keyof T | undefined
      if (!name)
        return
      const value = form.getValues(name as any)
      const key = String(name)
      if (timers[key]) {
        clearTimeout(timers[key])
      }
      timers[key] = setTimeout(() => {
        updater({ [name]: value } as Partial<T>)
      }, delay)
    })
    return () => {
      subscription.unsubscribe()
      Object.values(timers).forEach(id => clearTimeout(id))
    }
  }, [form, updater, delay])
}

export default useDebouncedFieldUpdate
