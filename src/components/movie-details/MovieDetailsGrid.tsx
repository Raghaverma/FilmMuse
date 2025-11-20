interface MovieDetailsGridProps {
  director?: string;
  writer?: string;
  language?: string;
  country?: string;
  boxOffice?: string;
  production?: string;
}

export default function MovieDetailsGrid({
  director,
  writer,
  language,
  country,
  boxOffice,
  production,
}: MovieDetailsGridProps) {
  const details = [
    { label: "Director", value: director },
    { label: "Writer", value: writer },
    { label: "Language", value: language },
    { label: "Country", value: country },
    { label: "Box Office", value: boxOffice },
    { label: "Production", value: production },
  ].filter((d) => d.value && d.value !== "N/A");

  if (details.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {details.map((detail) => (
        <div key={detail.label}>
          <h4 className="text-sm font-medium text-neutral-400 mb-1">{detail.label}</h4>
          <p className="text-white">{detail.value}</p>
        </div>
      ))}
    </div>
  );
}

