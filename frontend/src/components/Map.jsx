const Map = () => {
  return (
    <div className="w-full h-[420px] overflow-hidden shadow-lg">
      <iframe
        src="https://www.google.com/maps?q=10.760102076980505, 106.68227387629504&z=16&output=embed"
        width="100%"
        height="420"
        style={{ border: 0 }}
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default Map;
