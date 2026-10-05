import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';

export default function SortableHeader({ label, field, sortBy, order, onSort }) {
  const active = sortBy === field;
  return (
    <th>
      <button className="sort-header" onClick={() => onSort(field)}>
        <span>{label}</span>
        {active ? (
          order === 'asc' ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )
        ) : (
          <ChevronsUpDown size={14} className="muted" />
        )}
      </button>
    </th>
  );
}