const MONDAY_API_KEY = process.env.MONDAY_API_KEY;
const MONDAY_API_BASE_URL = "https://api.monday.com/v2";

export async function mondayGraphQL<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  try {
    const response = await fetch(MONDAY_API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: MONDAY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      const error = new Error(
        `Monday.com API error: ${response.status} ${response.statusText}`
      );
      const responseBody = await response.text();
      console.error("Response body:", responseBody);
      throw error;
    }
    const data = await response.json();
    if (data.errors) {
      const error = new Error(
        `Monday.com API error: ${JSON.stringify(data.errors)}`
      );
      console.error(error);
      throw error;
    }
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
