import './Timeline.module.css';
import type { TimelineItem as TimelineItemData } from '../../data/timeline';

interface TimelineItemProps {
  item: TimelineItemData;
}

export function TimelineItem({ item }: TimelineItemProps) {
  const className = item.sabbatical ? 'tl-item tl-sabbatical' : 'tl-item';

  return (
    <div className={className}>
      <div className="tl-year">{item.year}</div>
      <div className="tl-body">
        <div className="tl-title">{item.title}</div>
        {item.subtitle && <div className="tl-subtitle">{item.subtitle}</div>}
        {item.badge && <span className="tl-badge">{item.badge}</span>}
      </div>
    </div>
  );
}
