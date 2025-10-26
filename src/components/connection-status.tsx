import { useRealtimeCursors } from '@/hooks/use-realtime-cursors'
import { Badge } from '@/components/ui/badge'

interface ConnectionStatusProps {
  roomName: string
  username: string
}

export function ConnectionStatus({ roomName, username }: ConnectionStatusProps) {
  const { cursors } = useRealtimeCursors({ roomName, username, throttleMs: 100 })

  const participantCount = Object.keys(cursors).length

  return (
    <Badge variant='outline' className='text-xs'>
      {participantCount} 参与者
    </Badge>
  )
}
