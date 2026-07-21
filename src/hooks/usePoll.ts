import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Poll } from '../types'

export function usePoll(pollId: string | undefined) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchData = useCallback(async () => {
    if (!pollId) return
    const { data } = await supabase.from('polls').select('*').eq('id', pollId).maybeSingle()
    setPoll(data)
    setNotFound(!data)
    setLoading(false)
  }, [pollId])

  useEffect(() => {
    if (!pollId) return
    fetchData()

    const channel = supabase
      .channel(`poll-${pollId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'polls', filter: `id=eq.${pollId}` },
        fetchData,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pollId, fetchData])

  return { poll, loading, notFound, refetch: fetchData }
}
