
/**
 * Respond with a JSON object.
 * @param status - The HTTP status code.
 * @param json - The JSON object to respond with.
 * @returns The response object.
 */
export function respond(status: number, json: object): Response {
  return new Response(JSON.stringify(json), {
      status,
      headers: {
        'content-type': 'application/json',
      },
  });
}