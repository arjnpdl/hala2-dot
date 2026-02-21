import { useState } from 'react'
import { useRequestConnection } from '../../hooks/useConnections'
import { Send, Clock, Check } from 'lucide-react'

export default function ConnectionButton({ targetId, targetRole, currentStatus }) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const requestConnection = useRequestConnection()

  const handleSubmit = () => {
    requestConnection.mutate(
      { targetId, message },
      {
        onSuccess: () => {
          setShowModal(false)
          setMessage('')
        },
      }
    )
  }

  if (currentStatus === 'ACCEPTED') {
    return (
      <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg" disabled>
        <Check size={16} />
        Connected
      </button>
    )
  }

  if (currentStatus === 'PENDING') {
    return (
      <button className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg" disabled>
        <Clock size={16} />
        Pending
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent-light transition-colors"
      >
        <Send size={16} />
        Connect
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Send Connection Request</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message..."
              className="w-full p-3 border rounded-lg mb-4"
              rows="4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={requestConnection.isPending}
                className="px-4 py-2 bg-accent text-primary rounded-lg disabled:opacity-50"
              >
                {requestConnection.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
