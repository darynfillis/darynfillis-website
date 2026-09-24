const HOUSING_LINK_ORIGIN = 'https://housing.link';

export default async function handler(_request, context) {
  const response = await context.next();
  const headers = new Headers(response.headers);

  headers.delete('x-frame-options');
  headers.set(
    'content-security-policy',
    `frame-ancestors 'self' ${HOUSING_LINK_ORIGIN}`
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export const config = {
  path: ['/sell-with-intention', '/sell-with-intention.html']
};
