import SignInButton from '@/components/SignInButton';
import Image from 'next/image';

export default async function Home() {
  return (
    <section>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
        <h1>Header</h1>
        <SignInButton />
      </div>

      <h3>Image Optimization</h3>
      <Image
        src="https://images.unsplash.com/photo-1755095901325-637deba5b2b5"
        width={1700 / 8}
        height={1100 / 8}
        alt="Some image"
      />

      <h3>Suspense components streaming</h3>
      <p>
        <a href="/streaming">View the demo</a>
      </p>

      <h3>GraphQL example</h3>
      <p>
        <a href="/users">View the demo</a>
      </p>

      <h3>Caching / Incremental Static Regeneration</h3>
      <p>
        <a href="/isr">View the demo</a>
      </p>
    </section>
  );
}
