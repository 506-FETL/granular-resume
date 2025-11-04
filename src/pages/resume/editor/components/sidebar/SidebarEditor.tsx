import type { VisibilityItemsType } from '@/lib/schema'
import { DraggableList } from '@/components/DraggableList'
import { SideTabs, SideTabsWrapper, Tab, ViewPort } from '@/components/SideTabs'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ITEMS } from '../../data'
import { DraggableItem } from './DraggableItem'

interface SidebarEditorProps {
  activeTabId: string
  order: string[]
  visibilityState: Record<string, boolean>
  fill: string
  stroke: string
  isMobile: boolean
  onUpdateActiveTabId: (id: any) => void
  onUpdateOrder: (order: any[]) => void
  onToggleVisibility: (id: VisibilityItemsType) => void
}

export function SidebarEditor({
  activeTabId,
  order,
  visibilityState,
  fill,
  stroke,
  isMobile,
  onUpdateActiveTabId,
  onUpdateOrder,
  onToggleVisibility,
}: SidebarEditorProps) {
  const orderDraggable = order.filter(id => id !== 'basics')

  return (
    <DraggableList items={orderDraggable} onOrderChange={order => onUpdateOrder(['basics', ...order])}>
      <SideTabsWrapper defaultId={activeTabId}>
        <SideTabs>
          <div className="flex flex-col items-center justify-end gap-2">
            <Tab
              id="basics"
              onClick={() => onUpdateActiveTabId('basics')}
              disabled={visibilityState['basics' as VisibilityItemsType]}
            >
              {ITEMS.find(item => item.id === 'basics')?.icon}
              {!isMobile && ITEMS.find(item => item.id === 'basics')?.label}
            </Tab>
          </div>
          {orderDraggable.map((itm, index) => {
            const item = ITEMS.find(it => it.id === itm)!
            return (
              <DraggableItem id={item.id} index={index} key={item.id} disabled={item.id === 'basics'}>
                <div key={item.id} className="flex flex-col items-center justify-end gap-2">
                  {item.id !== 'basics' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Switch
                            checked={!visibilityState[item.id as VisibilityItemsType]}
                            onCheckedChange={() => onToggleVisibility(item.id as VisibilityItemsType)}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>点击可隐藏模块</TooltipContent>
                    </Tooltip>
                  )}
                  <Tab
                    id={item.id}
                    onClick={() => onUpdateActiveTabId(item.id)}
                    disabled={visibilityState[item.id as VisibilityItemsType]}
                  >
                    {item.icon}
                    {!isMobile && item.label}
                  </Tab>
                </div>
              </DraggableItem>
            )
          })}
        </SideTabs>
        <ViewPort items={ITEMS} fill={fill} stroke={stroke} />
      </SideTabsWrapper>
    </DraggableList>
  )
}
