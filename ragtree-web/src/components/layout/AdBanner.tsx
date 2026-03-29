'use client'
import Script from 'next/script'
import { useEffect } from 'react'

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal'
  className?: string
}

export function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID

  useEffect(() => {
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  if (!clientId || clientId === 'ca-pub-XXXXXXXXXXXXXXXX') return null

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}

export function AdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID
  if (!clientId || clientId === 'ca-pub-XXXXXXXXXXXXXXXX') return null
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  )
}
