import React from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: string
  className?: string
}

export function Tooltip({ children, content, className = '' }: TooltipProps) {
  return (
    <div className={`relative group ${className}`}>
      {children}
      <div className="
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
        bg-black/90 backdrop-blur-fix text-white text-xs
        px-2 py-1 rounded border border-white/10
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        pointer-events-none
        z-50
      ">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90" />
      </div>
    </div>
  )
}