export default function PageHeader({ title, subtitle, buttons }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
      <div className="flex flex-col gap-1.5">
        {title && (
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </div>
        )}
        {subtitle && (
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        )}
      </div>
      {buttons && <div className="flex items-center gap-3">{buttons}</div>}
    </div>
  );
}
