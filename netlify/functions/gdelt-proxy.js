exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const query = params.query || "supply chain OR shipping OR trade disruption";
  const maxrecords = params.maxrecords || "200";

  const gdeltUrl =
    "https://api.gdeltproject.org/api/v2/geo/geo?query=" +
    encodeURIComponent(query) +
    "&format=GeoJSON&maxrecords=" +
    maxrecords;

  try {
    const response = await fetch(gdeltUrl);
    const body = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
      body: body,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
