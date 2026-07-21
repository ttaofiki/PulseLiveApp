import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Option, Question } from '../types'

export function useOptionResults(pollId: string | undefined) {
  const [options, setOptions] = useState<Option[]>([])
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!pollId) return
    const [{ data: optionsData }, { data: votesData }] = await Promise.all([
      supabase.from('options').select('*').eq('poll_id', pollId).order('display_order'),
      supabase.from('votes').select('option_id').eq('poll_id', pollId),
    ])

    const counts: Record<string, number> = {}
    for (const vote of votesData ?? []) {
      counts[vote.option_id] = (counts[vote.option_id] ?? 0) + 1
    }

    setOptions(optionsData ?? [])
    setVoteCounts(counts)
    setTotalVotes((votesData ?? []).length)
    setLoading(false)
  }, [pollId])

  useEffect(() => {
    if (!pollId) return
    fetchData()

    const channel = supabase
      .channel(`votes-${pollId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `poll_id=eq.${pollId}` },
        fetchData,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pollId, fetchData])

  return { options, voteCounts, totalVotes, loading, refetch: fetchData }
}

export function useQuestions(pollId: string | undefined) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!pollId) return
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('poll_id', pollId)
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: true })
    setQuestions(data ?? [])
    setLoading(false)
  }, [pollId])

  useEffect(() => {
    if (!pollId) return
    fetchData()

    const channel = supabase
      .channel(`questions-${pollId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions', filter: `poll_id=eq.${pollId}` },
        fetchData,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pollId, fetchData])

  return { questions, loading, refetch: fetchData }
}
