export function EmptyState({
  title = 'Nothing here yet',
  message = 'There is no content to display right now.',
  icon = '📭',
}: {
  title?: string;
  message?: string;
  icon?: string;
}) {
  return (
    <div className="card fade-in" style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ margin: '0 0 6px' }}>{title}</h3>
      <p className="muted" style={{ margin: 0 }}>{message}</p>
    </div>
  );
}
