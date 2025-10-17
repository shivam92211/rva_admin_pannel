export default function TableHeader({
  headers
}: {
  headers?: string[];
}) {
  return (
    <>
      <thead className="sticky top-0 bg-gray-700/95 backdrop-blur-sm border-b border-gray-700/50">
        <tr>
          {headers && headers.map((header, idx) => {
            return <th
              key={header}
              className={`text-left py-3 px-4 font-medium text-gray-300 
                ${idx === headers.length - 1 ? 'rounded-tr-lg' : idx === 0 ? 'rounded-tl-lg' : ''}`}
            >
              {header}
            </th>;
          })}
        </tr>
      </thead>
    </>
  );
}
