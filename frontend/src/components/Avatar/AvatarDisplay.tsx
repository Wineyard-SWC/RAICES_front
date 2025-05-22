"use client"

import React, { useEffect } from "react"

// Este componente usa <model-viewer> para renderizar el avatar
function AvatarModelViewer({
  avatarUrl,
  orbit = "0deg 90deg 0.5m",  // Ajusta la cámara a la altura de la cabeza
  target = "0m 1.6m 0m",      // Mueve la cámara para enfocarse en la cabeza
  fov = "10deg",              // Reduce el campo de visión para un primer plano
  style = {},
}) {
  useEffect(() => {
    // Cargamos el script de model-viewer solo en el cliente
    const script = document.createElement("script")
    script.type = "module"
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
    document.head.appendChild(script)
  }, [])

  return (
    <model-viewer
      src={avatarUrl}
      alt="Avatar"
      camera-orbit={orbit}
      camera-target={target}
      field-of-view={fov}
      style={{ width: "100%", height: "100%", ...style }}
    />
  )
}

// Componente principal que envuelve el contenedor circular
export default function AvatarProfileIcon({
  avatarUrl,
  size = 128,
  borderWidth = 4,
  borderColor = "#ebe5eb",
  backgroundColor = "#ebe5eb",
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        border: `${borderWidth}px solid ${borderColor}`,
        background: backgroundColor,
      }}
    >
      <AvatarModelViewer avatarUrl={avatarUrl} />
    </div>
  )
}