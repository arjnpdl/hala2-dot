import { createContext, useContext, useState } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addToast = (message, type = 'info') => {
    const id = Date.now()
    const notification = { id, message, type }
    setNotifications((prev) => [...prev, notification])

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)

    return id
  }

  const removeToast = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ notifications, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-5 py-3 rounded-xl shadow-xl border-l-[4px] font-extrabold text-sm flex items-center gap-3 backdrop-blur-md transition-all animate-in slide-in-from-right fade-in duration-300 ${notification.type === 'success'
                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]'
                : notification.type === 'error'
                  ? 'bg-red-50 text-[#DC2626] border-[#DC2626]'
                  : 'bg-[#EEF5FF] text-[#1B4FD8] border-[#1B4FD8]'
              }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
