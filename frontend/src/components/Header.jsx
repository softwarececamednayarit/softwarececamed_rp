import { Link } from 'react-router-dom'

function Header() {
  return (
    <header style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
      <nav>
        <Link to="/" style={{ marginRight: 10 }}>Inicio</Link>
        <Link to="/about">Acerca de</Link>
      </nav>
    </header>
  )
}

export default Header