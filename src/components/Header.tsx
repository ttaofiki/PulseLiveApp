import { Link } from 'react-router-dom'
import './Header.css'

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-header__brand">
          <span className="app-header__logo" />
          PulseLive
        </Link>
      </div>
    </header>
  )
}
