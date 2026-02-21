import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { getPitchFeedback } from '../../api/ai'
import PageHeader from '../../components/shared/PageHeader'
import { useNotification } from '../../contexts/NotificationContext'

export default function PitchCoPilot() {
  const [pitchText, setPitchText] = useState('')
  const { addToast } = useNotification()

  const feedbackMutation = useMutation({
    mutationFn: getPitchFeedback,
    onError: () => {
      addToast('Failed to analyze pitch', 'error')
    },
  })

  const handleAnalyze = () => {
    if (!pitchText.trim()) {
      addToast('Please enter pitch text', 'error')
      return
    }
    feedbackMutation.mutate(pitchText)
  }

  const feedback = feedbackMutation.data

  return (
    <div>
      <PageHeader title="Pitch Co-Pilot" subtitle="Get AI feedback on your pitch" />
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Your Pitch</h3>
          <textarea
            value={pitchText}
            onChange={(e) => setPitchText(e.target.value)}
            placeholder="Paste your pitch deck content or write your pitch here..."
            rows="20"
            className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
          />
          <button
            onClick={handleAnalyze}
            disabled={feedbackMutation.isPending}
            className="mt-4 w-full px-4 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-accent-light transition-colors disabled:opacity-50"
          >
            {feedbackMutation.isPending ? 'Analyzing...' : 'Analyze Pitch'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Feedback</h3>
          {feedbackMutation.isPending ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-20 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : feedback ? (
            <div className="space-y-6">
              {feedback.market_size_score && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Market Size</h4>
                    <span className="text-accent font-bold">{feedback.market_size_score}/10</span>
                  </div>
                  <p className="text-sm text-gray-600">{feedback.market_size_feedback}</p>
                </div>
              )}
              {feedback.team_market_fit_score && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Team-Market Fit</h4>
                    <span className="text-accent font-bold">{feedback.team_market_fit_score}/10</span>
                  </div>
                  <p className="text-sm text-gray-600">{feedback.team_market_fit_feedback}</p>
                </div>
              )}
              {feedback.overall_assessment && (
                <div>
                  <h4 className="font-semibold mb-2">Overall Assessment</h4>
                  <p className="text-sm text-gray-600">{feedback.overall_assessment}</p>
                </div>
              )}
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Suggestions</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {feedback.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Enter your pitch and click Analyze to get feedback</p>
          )}
        </div>
      </div>
    </div>
  )
}
