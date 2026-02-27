import { revalidatePath } from 'next/cache';
import { FreshnessTimer } from './timer';

async function revalidateAction(): Promise<void> {
  'use server';
  revalidatePath('/isr');
}

async function getPokemon(): Promise<{
  id: number;
  name: string;
  type: string[];
  generatedAt: number;
}> {
  const randomId = Math.floor(Math.random() * 151) + 1;
  const res = await fetch(`https://api.vercel.app/pokemon/${randomId}`, {
    next: { revalidate: 10 },
  });
  const data = await res.json();
  return { ...data, generatedAt: Date.now() };
}

export default async function ISRDemo(): Promise<React.JSX.Element> {
  const pokemon = await getPokemon();

  return (
    <div>
      <h1>ISR Demo</h1>
      <p>Pokemon ID: {pokemon.id}</p>
      <p>Name: {pokemon.name}</p>
      <p>Types: {pokemon.type.join(', ')}</p>
      <FreshnessTimer generatedAt={pokemon.generatedAt} />
      <form action={revalidateAction}>
        <button type="submit">Revalidate</button>
      </form>
    </div>
  );
}
