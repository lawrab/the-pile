'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'

interface GameCube {
  id: number
  position: [number, number, number]
  color: string
  name: string
}

interface PileVisualizationProps {
  games?: Array<{
    id: number
    name: string
    status: string
  }>
  demo?: boolean
}

function GameCube({ position, color, name }: { position: [number, number, number], color: string, name: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function PileScene({ games, demo }: PileVisualizationProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unplayed': return '#dc2626' // red
      case 'playing': return '#eab308' // yellow
      case 'completed': return '#16a34a' // green
      case 'abandoned': return '#6b7280' // gray
      case 'amnesty_granted': return '#7c3aed' // purple
      default: return '#dc2626'
    }
  }

  const gameCubes = useMemo(() => {
    const cubes: GameCube[] = []
    const gameData = demo ? [
      { id: 1, name: "Cyberpunk 2077", status: "unplayed" },
      { id: 2, name: "The Witcher 3", status: "unplayed" },
      { id: 3, name: "Red Dead Redemption 2", status: "unplayed" },
      { id: 4, name: "Half-Life: Alyx", status: "unplayed" },
      { id: 5, name: "Disco Elysium", status: "unplayed" },
      { id: 6, name: "Control", status: "playing" },
      { id: 7, name: "Death Stranding", status: "amnesty_granted" },
      { id: 8, name: "Sekiro", status: "unplayed" },
    ] : games || []

    // Create a pile-like arrangement
    let x = 0, z = 0, layer = 0
    const layerSize = Math.ceil(Math.sqrt(gameData.length))
    
    gameData.forEach((game, index) => {
      const color = getStatusColor(game.status)
      
      cubes.push({
        id: game.id,
        position: [
          x * 1.2 + (Math.random() - 0.5) * 0.2,
          layer * 0.9,
          z * 1.2 + (Math.random() - 0.5) * 0.2
        ],
        color,
        name: game.name
      })
      
      x++
      if (x >= layerSize) {
        x = 0
        z++
        if (z >= layerSize) {
          z = 0
          layer++
        }
      }
    })
    
    return cubes
  }, [games, demo, getStatusColor])

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {gameCubes.map((cube) => (
        <GameCube
          key={cube.id}
          position={cube.position}
          color={cube.color}
          name={cube.name}
        />
      ))}
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.8} />
      </mesh>
    </>
  )
}

export function PileVisualization(props: PileVisualizationProps) {
  return (
    <div className="h-96 w-full bg-slate-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
        <Suspense fallback={null}>
          <PileScene {...props} />
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}