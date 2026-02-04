const FeesTable = ({ title, subtitle, headers, data }) => {
  return (
    <section className="pt-5">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="text-red-500">{subtitle}</p>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed border border-gray-400 border-collapse">
          <thead>
            <tr className="bg-[#F2D9D9]">
              <th className="border p-3 w-[40%] text-left"></th>
              {headers.map((item, index) => (
                <th key={index} className="border p-3 w-[20%]">
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => {
              const rowBg = row.highlight ? "bg-[#F2D9D9]" : "bg-white";

              if (row.merge) {
                return (
                  <tr key={index} className={rowBg}>
                    <td className="border p-3">{row.label}</td>

                    {row.showMerge ? (
                      <td
                        rowSpan={row.rowSpan}
                        colSpan={3}
                        className="border p-3 text-center font-medium"
                      >
                        {row.text}
                      </td>
                    ) : (
                      row.prices?.map((price, i) => (
                        <td
                          key={i}
                          className="border p-3 text-center whitespace-nowrap"
                        >
                          {price}
                        </td>
                      ))
                    )}
                  </tr>
                );
              }

              if (row.colSpan) {
                return (
                  <tr key={index} className={rowBg}>
                    <td className="border p-3">{row.label}</td>
                    <td
                      colSpan={row.colSpan}
                      className="border p-3 text-center"
                    >
                      {row.text}
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={index}
                  className={`${rowBg} hover:bg-[#f2d5d5] transition`}
                >
                  <td className="border p-3 break-words">{row.label}</td>
                  {row.prices.map((price, i) => (
                    <td
                      key={i}
                      className="border p-3 text-center whitespace-nowrap"
                    >
                      {price}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default FeesTable;
