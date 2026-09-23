import { ButtonLink } from '@/components/ui'

export default function NotFound() {
  return (
    <section className="container-page flex flex-col items-center py-28 text-center">
      <p className="num text-6xl font-extrabold text-brand-800">404</p>
      <h1 className="mt-3 text-2xl font-bold">This bridge doesn’t lead anywhere.</h1>
      <p className="mt-2 text-ink-muted">The page you’re looking for doesn’t exist.</p>
      <ButtonLink to="/" className="mt-6">Back to home</ButtonLink>
    </section>
  )
}
