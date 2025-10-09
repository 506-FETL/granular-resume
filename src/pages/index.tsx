import { useState } from 'react'
import { NotionEditor } from '@/components/tiptap-templates/notion-like/notion-like-editor'

export default function DemoPage() {
  const [value, setValue] = useState('')

  return (
    <div>
      <NotionEditor room="tests" placeholder="Type your notes here..." />
    </div>
  )
}
