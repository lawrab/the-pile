import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GameDetailModal } from '@/components/game-detail-modal'

// Mock game data
const mockGame = {
  id: '1',
  status: 'unplayed' as const,
  playtime_minutes: 0,
  steam_game: {
    steam_app_id: 400,
    name: 'Portal',
    image_url: 'https://example.com/portal.jpg',
    price: 9.99,
    genres: ['Puzzle', 'Platformer'],
    description: 'A mind-bending puzzle adventure that challenges you to think in portals.',
    developer: 'Valve Corporation',
    publisher: 'Valve Corporation',
    release_date: '2007-10-09',
    screenshots: [
      'https://example.com/screenshot1.jpg',
      'https://example.com/screenshot2.jpg',
      'https://example.com/screenshot3.jpg',
      'https://example.com/screenshot4.jpg',
      'https://example.com/screenshot5.jpg'
    ],
    achievements_total: 15,
    metacritic_score: 90,
    positive_reviews: 50000,
    negative_reviews: 2000
  }
}

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  game: mockGame,
  onGrantAmnesty: jest.fn(),
  onStartPlaying: jest.fn(),
  onMarkCompleted: jest.fn(),
}

describe('GameDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open with game data', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    expect(screen.getByText('Portal')).toBeInTheDocument()
    expect(screen.getByText('Developer:')).toBeInTheDocument()
    expect(screen.getByText('Publisher:')).toBeInTheDocument()
    expect(screen.getByText('$9.99')).toBeInTheDocument()
    expect(screen.getByText('Awaiting Your Touch')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<GameDetailModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Portal')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    // The close button has no accessible name, so find by SVG X icon
    const closeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(closeButton)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    // Click the backdrop (first div with bg-black/80)
    const backdrop = document.querySelector('.bg-black\\/80')
    fireEvent.click(backdrop!)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape key press', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 })
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('displays game screenshots', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    expect(screen.getByText('Screenshots')).toBeInTheDocument()
    
    // Check that screenshots are rendered (first 4)
    const screenshots = screen.getAllByAltText(/Screenshot \d+/)
    expect(screenshots).toHaveLength(4)
    
    // Check for "more screenshots" text
    expect(screen.getByText('+1 more screenshots')).toBeInTheDocument()
  })

  it('displays game metadata', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    // Check for basic game information
    expect(screen.getByText(/Puzzle/)).toBeInTheDocument()
    expect(screen.getByText(/Platformer/)).toBeInTheDocument()
  })

  it('displays metacritic score', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    expect(screen.getByText('90/100')).toBeInTheDocument()
  })

  it('displays genres as tags', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    expect(screen.getByText('Genres')).toBeInTheDocument()
    expect(screen.getByText('Puzzle')).toBeInTheDocument()
    expect(screen.getByText('Platformer')).toBeInTheDocument()
  })

  it('displays formatted playtime for unplayed game', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    expect(screen.getByText('Never played')).toBeInTheDocument()
  })

  it('displays formatted playtime for played game', () => {
    const playedGame = {
      ...mockGame,
      playtime_minutes: 150, // 2h 30m
      status: 'playing' as const
    }
    
    render(<GameDetailModal {...defaultProps} game={playedGame} />)
    
    expect(screen.getByText('2h 30m')).toBeInTheDocument()
  })

  it('displays correct action buttons for unplayed game', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    expect(screen.getByText('Begin Quest')).toBeInTheDocument()
    expect(screen.getByText('Grant Peace')).toBeInTheDocument()
  })

  it('displays correct action buttons for playing game', () => {
    const playingGame = {
      ...mockGame,
      status: 'playing' as const
    }
    
    render(<GameDetailModal {...defaultProps} game={playingGame} />)
    
    expect(screen.getByText('Mark Complete')).toBeInTheDocument()
    expect(screen.queryByText('Begin Quest')).not.toBeInTheDocument()
  })

  it('calls onStartPlaying when Begin Quest is clicked', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    const beginButton = screen.getByText('Begin Quest')
    fireEvent.click(beginButton)
    
    expect(defaultProps.onStartPlaying).toHaveBeenCalledWith('1')
  })

  it('calls onGrantAmnesty when Grant Peace is clicked', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    const amnestyButton = screen.getByText('Grant Peace')
    fireEvent.click(amnestyButton)
    
    expect(defaultProps.onGrantAmnesty).toHaveBeenCalledWith('1')
  })

  it('calls onMarkCompleted when Mark Complete is clicked', () => {
    const playingGame = {
      ...mockGame,
      status: 'playing' as const
    }
    
    render(<GameDetailModal {...defaultProps} game={playingGame} />)
    
    const completeButton = screen.getByText('Mark Complete')
    fireEvent.click(completeButton)
    
    expect(defaultProps.onMarkCompleted).toHaveBeenCalledWith('1')
  })

  it('opens Steam store page when View on Steam is clicked', () => {
    // Mock window.open
    const mockOpen = jest.fn()
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    })
    
    render(<GameDetailModal {...defaultProps} />)
    
    const steamButton = screen.getByText('View on Steam')
    fireEvent.click(steamButton)
    
    expect(mockOpen).toHaveBeenCalledWith('https://store.steampowered.com/app/400', '_blank')
  })

  it('handles missing optional game data gracefully', () => {
    const minimalGame = {
      id: '1',
      status: 'unplayed' as const,
      playtime_minutes: 0,
      steam_game: {
        steam_app_id: 400,
        name: 'Minimal Game',
        // Missing optional fields
      }
    }
    
    expect(() => {
      render(<GameDetailModal {...defaultProps} game={minimalGame} />)
    }).not.toThrow()
    
    expect(screen.getByText('Minimal Game')).toBeInTheDocument()
  })

  it('truncates long descriptions', () => {
    const longDescriptionGame = {
      ...mockGame,
      steam_game: {
        ...mockGame.steam_game,
        description: 'A'.repeat(600) // 600 characters
      }
    }
    
    render(<GameDetailModal {...defaultProps} game={longDescriptionGame} />)
    
    const description = screen.getByText(/A+\.\.\./)
    expect(description.textContent?.length).toBeLessThanOrEqual(503) // 500 + "..."
  })

  it('prevents body scroll when modal is open', () => {
    render(<GameDetailModal {...defaultProps} />)
    
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when modal is closed', () => {
    const { rerender } = render(<GameDetailModal {...defaultProps} />)
    
    rerender(<GameDetailModal {...defaultProps} isOpen={false} />)
    
    expect(document.body.style.overflow).toBe('unset')
  })

  it('handles screenshot click to open in new tab', () => {
    const mockOpen = jest.fn()
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    })
    
    render(<GameDetailModal {...defaultProps} />)
    
    const firstScreenshot = screen.getByAltText('Screenshot 1')
    fireEvent.click(firstScreenshot)
    
    expect(mockOpen).toHaveBeenCalledWith('https://example.com/screenshot1.jpg', '_blank')
  })
})