import React, { useEffect, useRef } from 'react'
import FlowerLoader from './flowerLoader'

const DefaultLoading = ({ text = '' }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      new FlowerLoader(containerRef.current)
    }
  }, [])

  return (
    <div className="loading-container" ref={containerRef}>
      <div className="flower">
        <div className="flower__center" />
        <div className="flower__leaves" />
      </div>
      <br></br>
      <br></br>
      <div className="loading-text">
        {text ? `Loading ${text}...` : 'Loading...'}
      </div>

      {/* estilos globales para esta animación */}
      <style jsx global>{`
        /* reset box-sizing */
        *, *:before, *:after { box-sizing: border-box; }

        /* contenedor centrado */
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #F5F0F1;
        }

        /* flor */
        .flower {
          position: relative;
          transform: translate3d(0, 0, 0);
        }
        .flower__center {
          width: 2rem;
          height: 2rem;
          border-radius: 2rem;
          background: #BF96AE;
          position: relative;
          z-index: 10;
          will-change: transform;
        }
        .flower__leaves {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 5;
          width: 100%;
          height: 100%;
          will-change: transform;
        }
        .flower__leaf {
          width: 70%;
          transform-origin: center bottom;
          position: absolute;
          will-change: transform;
        }
        .flower__leaf-inner {
          transform-origin: center bottom;
          transform: scale(0);
          will-change: transform;
        }
        .flower__leaf svg path {
          fill: #4A2B4A;
        }

        /* texto descriptivo */
        .loading-text {
          margin-top: 1rem;
          font-size: 1rem;
          color: #4A2B4A;
        }
      `}</style>
    </div>
  )
}

export default DefaultLoading
