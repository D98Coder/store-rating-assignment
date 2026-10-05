import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-card">
        <Compass size={48} />
        <h1>404</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary btn-md">
          Back to Home
        </Link>
      </div>
    </div>
  );
}