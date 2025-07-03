const createReflectionNote = async (content: string) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${API_BASE_URL}/api/reflection_notes`, {
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

export default createReflectionNote;
