export default function Footer(){
  return (
    <footer className="footer">
      <div className="container">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
          <div>
            <strong>Ration Register</strong>
            <div className="muted">© {new Date().getFullYear()} Local Distribution</div>
          </div>
          <div className="muted">Built with care — contact support for help</div>
        </div>
      </div>
    </footer>
  )
}
