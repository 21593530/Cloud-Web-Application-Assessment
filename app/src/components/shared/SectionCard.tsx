type SectionCardProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

export default function SectionCard({ eyebrow, title, children }: SectionCardProps) {
  return (
    <article className="panel" aria-labelledby={title.toLowerCase().replace(/\s+/g, "-")}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={title.toLowerCase().replace(/\s+/g, "-")}>{title}</h2>
      {children}
    </article>
  );
}
