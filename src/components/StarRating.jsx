import { Star } from 'lucide-react';
import { useState } from 'react';

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 20,
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={`stars ${readOnly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="star-btn"
          onClick={() => !readOnly && onChange?.(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          disabled={readOnly}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className="star"
            fill={n <= display ? 'currentColor' : 'none'}
            strokeWidth={1.8}
          />
        </button>
      ))}
    </div>
  );
}