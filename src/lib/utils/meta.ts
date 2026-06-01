export const getTitle = (pagePrefix?: string) => {
  const SITE_TITLE = 'NORMAN WONG'
  return `${pagePrefix ? `${pagePrefix} - ` : ''}${SITE_TITLE}`
}