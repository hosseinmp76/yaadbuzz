import { useCallback, useEffect, useRef, useState } from 'react'

type QueryState<T> = {
  data: T | undefined
  fetching: boolean
  error: Error | undefined
}

/** urql-compatible shape: `[{ data, fetching, error }, reexecute]` */
export function useApiQuery<T>(
  enabled: boolean,
  fetcher: () => Promise<T>,
  deps: unknown[],
): [QueryState<T>, (opts?: { requestPolicy?: string }) => void] {
  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    fetching: enabled,
    error: undefined,
  })
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const gen = useRef(0)

  const reexecute = useCallback((_opts?: { requestPolicy?: string }) => {
    if (!enabled) {
      setState((s) => ({ ...s, fetching: false }))
      return
    }
    const id = ++gen.current
    setState((s) => ({ ...s, fetching: true, error: undefined }))
    void fetcherRef
      .current()
      .then((data) => {
        if (id !== gen.current) return
        setState({ data, fetching: false, error: undefined })
      })
      .catch((err: unknown) => {
        if (id !== gen.current) return
        setState((s) => ({
          ...s,
          fetching: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps passed by caller
  }, deps)

  useEffect(() => {
    reexecute()
  }, [reexecute, enabled])

  return [state, reexecute]
}

type MutationResult<T> = { data?: T; error?: Error }

/** urql-compatible: returns `[unused, mutate]` where mutate resolves `{ data, error }` */
export function useApiMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): [null, (...args: TArgs) => Promise<MutationResult<TResult>>] {
  const fnRef = useRef(fn)
  fnRef.current = fn

  const mutate = useCallback(async (...args: TArgs): Promise<MutationResult<TResult>> => {
    try {
      const data = await fnRef.current(...args)
      return { data }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  }, [])

  return [null, mutate]
}
