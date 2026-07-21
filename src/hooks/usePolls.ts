import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Poll } from '../types'

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [{ data: pollsData }, { data: votesData }, { data: questionsData }] = await Promise.all([
      supabase.from('polls').select('*').order('created_at', { ascending: false }),
      supabase.from('votes').select('poll_id'),
      supabase.from('questions').select('poll_id'),
    ])

    const counts: Record<string, number> = {}
    for (const vote of votesData ?? []) {
      counts[vote.poll_id] = (counts[vote.poll_id] ?? 0) + 1
    }
    for (const question of questionsData ?? []) {
      counts[question.poll_id] = (counts[question.poll_id] ?? 0) + 1
    }

    setPolls(pollsData ?? [])
    setResponseCounts(counts)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('dashboard-polls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  return { polls, responseCounts, loading }
}
