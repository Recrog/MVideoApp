import { useEffect, useState } from 'react'

export function RecordingBadge() {
  const [isRec, setIsRec] = useState(false)
  useEffect(() => {
    function onState(e: Event) {
      const s = (e as CustomEvent).detail?.state
      setIsRec(s === 'recording')
    }
    window.addEventListener('recording:state' as any, onState)
    return () => window.removeEventListener('recording:state' as any, onState)
  }, [])

  if (!isRec) return null
  return (
    <div style={{ position: 'absolute', top: 12, right: 12, background: '#b00020', color: '#fff', padding: '6px 10px', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 10, height: 10, background: '#ff5a5a', borderRadius: '50%', boxShadow: '0 0 0 2px #ff5a5a55' }} />
      KAYIT – Mic açık
    </div>
  )
}


