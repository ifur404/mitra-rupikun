import { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export default function MyTooltip({ children, title }: { children: ReactNode; title: string }) {
    return <Tooltip>
        <TooltipTrigger asChild>
            {children}
        </TooltipTrigger>
        <TooltipContent>
            <p>{title}</p>
        </TooltipContent>
    </Tooltip>
}
