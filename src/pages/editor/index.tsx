import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import BasicResumeForm from './components/forms/BasicResumeForm'
import ResumePreview from './components/preview/BasicResumePreview'

function Editor() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">编辑简历</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>简历信息</DrawerTitle>
          </DrawerHeader>
          <DrawerDescription></DrawerDescription>
          <div className="p-4">
            <BasicResumeForm />
          </div>
        </DrawerContent>
      </Drawer>

      <div className="max-w-screen-2xl mx-auto">
        <ResumePreview />
      </div>

    </>
  )
}

export default Editor
