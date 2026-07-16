import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav className="breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="breadcrumb-sep">›</span>}
          {item.path ? (
            <Link to={item.path}>{item.label}</Link>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
