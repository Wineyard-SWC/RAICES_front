'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { cardStyles } from '../styles/generatestyles'
import { ReactNode } from 'react'

interface GenerationCardProps {
  title: string
  subtitle: string
  description: string
  icon: ReactNode
  href: string
  height?: string 
}

export const GenerationCard = ({
  title,
  subtitle,
  description,
  icon,
  href,
  height = 'h-20',
}: GenerationCardProps) => {
  return (
    <div className={`${cardStyles.container} flex flex-col`}>
        <div className={cardStyles.iconWrapper}>
            {icon}
        </div>

        <div className="flex-2">
            <h3 className={cardStyles.title}>{title}</h3>
            <p className={cardStyles.subtitle}>{subtitle}</p>
        </div>

        <div className={`${cardStyles.divider} flex h-[5px]`}></div>

        <div className="flex-1">
            <p className={cardStyles.description}>{description}</p>
        </div>

        <Link href={href}>
            <Button variant="outline" className={cardStyles.button}>
            <span className={cardStyles.buttonText}>Generate {title}</span>
            <ExternalLink className="h-4 w-4" />
            </Button>
        </Link>
    </div>
  )
}
