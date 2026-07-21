import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './QrCodeBlock.css'

interface QrCodeBlockProps {
  url: string
  size?: number
}

export function QrCodeBlock({ url, size = 200 }: QrCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="qr-block">
      <div className="qr-block__code">
        <QRCodeSVG value={url} size={size} bgColor="#ffffff" fgColor="#1e1b2e" level="M" />
      </div>
      <div className="qr-block__link-row">
        <span className="qr-block__link">{url}</span>
        <button type="button" className="btn btn-secondary qr-block__copy" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}
