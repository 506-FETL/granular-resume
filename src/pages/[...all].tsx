import { IconTool } from '@tabler/icons-react'
import { ArrowUpRightIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Highlighter } from '@/components/ui/highlighter'
import { LightRays } from '@/components/ui/light-rays'
import { useIsMobile } from '@/hooks/use-mobile'
import { lazy } from 'react'

const Globe = lazy(() => import('@/components/ui/globe').then((module) => ({ default: module.Globe })))

export default function NotFound() {
  const isMobile = useIsMobile()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <IconTool />
        </EmptyMedia>
        <EmptyTitle>
          <Highlighter action='box' color='#FF9800'>
            正在建设中...
          </Highlighter>
        </EmptyTitle>
        <EmptyDescription>敬请期待</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant='link' asChild className='text-muted-foreground' size='sm'>
          <Link to='/'>
            回到首页
            <ArrowUpRightIcon />
          </Link>
        </Button>
      </EmptyContent>
      {!isMobile && <LightRays length='100vh' />}
      <div className='absolute bottom-1/4 w-full'>
        <Globe />
      </div>
    </Empty>
  )
}
