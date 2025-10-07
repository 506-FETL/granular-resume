import { Link } from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { ModeToggle } from '../mode-toggle'

export function SiteHeader() {
  const crumbs = useBreadcrumbs()

  return (
    <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          { crumbs.map((crumb, idx) => (
            <Fragment key={crumb.label}>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link to={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {idx < crumbs.length - 1 && (<BreadcrumbSeparator className="hidden md:block" />)}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" asChild size="sm" className="sm:flex">
          <a
            href="https://github.com/506-FETL/granular-resume"
            rel="noopener noreferrer"
            target="_blank"
            className="dark:text-foreground"
          >
            GitHub
          </a>
        </Button>
        <ModeToggle />
      </div>
    </div>
  )
}
