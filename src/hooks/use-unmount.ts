import { useEffect, useRef } from 'react'

/**
 * Hook that executes a callback when the component unmounts.
 *
 * @param callback Function to be called on component unmount
 */
export function useUnmount(callback: (...args: Array<any>) => any) {
  const ref = useRef(callback)
  // eslint-disable-next-line react-hooks/refs
  ref.current = callback

  useEffect(
    () => () => {
      ref.current()
    },
    [],
  )
}

export default useUnmount
