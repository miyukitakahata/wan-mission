// src/utils/reflectionNotes.ts
export const createReflectionNote = async (content: string) => {
  const res = await fetch('http://localhost:8000/api/reflection_notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error('Failed to create reflection note');
  }

  return res.json();
};
