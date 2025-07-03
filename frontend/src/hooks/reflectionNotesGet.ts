// frontend/src/hooks/reflectionNotesGet.ts

export type ReflectionNote = {
  id: number;
  content: string;
  approved_by_parent: boolean;
  created_at: string;
};

export const getReflectionNotes = async (): Promise<ReflectionNote[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reflection_notes`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch reflection notes');
  }
  return res.json();
};
