'use client'

import { useState } from 'react'
import { useCreateConversation } from '@/hooks/useCreateConversation'
import { useRouter } from 'next/navigation'

export default function CreateConversationButton() {
  const [title, setTitle] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  
  const createConversation = useCreateConversation()

  const handleCreate = async () => {
    if (!title.trim()) return

    try {
      const newConversation = await createConversation.mutateAsync({ 
        title: title.trim() 
      })
      
      console.log('✅ Conversation created:', newConversation)
      
      // Navigate to the new conversation
      router.push(`/conversations/${newConversation.id}`)
      
      // Reset form
      setTitle('')
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        New Conversation
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Conversation</h2>
            
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter conversation title..."
              className="w-full p-3 border rounded mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !createConversation.isPending) {
                  handleCreate()
                }
              }}
            />

            {createConversation.isError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                Error: {createConversation.error.message}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setTitle('')
                }}
                disabled={createConversation.isPending}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createConversation.isPending || !title.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                {createConversation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}