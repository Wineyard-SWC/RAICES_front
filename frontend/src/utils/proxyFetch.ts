/**
 * Función para realizar peticiones a través del proxy de la API
 * @param endpoint El tipo de endpoint ('requirements', 'epics', 'userStories')
 * @param data Los datos a enviar
 * @returns La respuesta de la API
 */
export async function proxyFetch(endpoint: 'requirements' | 'epics' | 'userStories', data: any) {
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en proxyFetch para ${endpoint}:`, error);
    throw error;
  }
}