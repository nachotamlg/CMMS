// This file forces Next.js to regenerate on every request
// Delete this file once Prisma Client is updated

export const revalidate = 0

export default function ForceRevalidate() {
  console.log('[FORCE_REVALIDATE] Next.js will regenerate this page')
  return null
}
