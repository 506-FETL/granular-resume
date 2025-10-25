import { Button } from '@/components/ui/button'
import { Highlighter } from '@/components/ui/highlighter'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { CloudUpload, Wifi, WifiOff } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

const HeadBars = ({
  setShowSyncDialog,
  hasOfflineResumesToSync,
  isOnline,
  offlineResumes,
}: {
  setShowSyncDialog: Dispatch<SetStateAction<boolean>>
  hasOfflineResumesToSync: boolean
  isOnline: boolean
  offlineResumes: any[]
}) => {
  const isMobile = useIsMobile()

  return (
    <div className={isMobile ? 'flex flex-col gap-4' : 'flex items-start justify-between'}>
      <div>
        <h1 className={isMobile ? 'text-2xl font-bold tracking-tight' : 'text-3xl font-bold tracking-tight'}>
          我的简历
        </h1>
        <p className='text-muted-foreground mt-2'>管理和编辑你的简历</p>
      </div>
      <div className={cn('mb-5', isMobile ? 'flex flex-col gap-3 items-end' : 'flex items-center gap-3')}>
        <Highlighter action={isOnline ? 'highlight' : 'underline'} color={isOnline ? '#bbf7d0' : '#e4e4e7'}>
          <div className='flex gap-2 items-center text-sm font-medium'>
            {isOnline ? <Wifi className='h-3.5 w-3.5' /> : <WifiOff className='h-3.5 w-3.5' />}
            <span>{isOnline ? '在线' : '离线'}</span>
          </div>
        </Highlighter>
        <Button
          onClick={() => setShowSyncDialog(true)}
          variant='outline'
          size='sm'
          className={isMobile ? 'w-full' : ''}
          disabled={!hasOfflineResumesToSync}
        >
          <CloudUpload className='h-4 w-4 mr-2' />
          同步本地简历 ({offlineResumes.length})
        </Button>
      </div>
    </div>
  )
}

export default HeadBars
