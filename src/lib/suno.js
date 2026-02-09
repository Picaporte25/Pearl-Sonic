import axios from 'axios';

const SUNO_API_BASE = 'https://api.suno.ai/v1';
const SUNO_API_KEY = process.env.SUNO_API_KEY;

class SunoClient {
  constructor() {
    this.client = axios.create({
      baseURL: SUNO_API_BASE,
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generar música con Suno AI
   * @param {Object} params - Parámetros de generación
   * @param {string} params.prompt - Descripción de la música
   * @param {string} params.genre - Género musical
   * @param {string} params.mood - Mood/ambiente
   * @param {number} params.duration - Duración en segundos
   * @returns {Promise<Object>} - Respuesta con jobId y detalles
   */
  async generate({ prompt, genre, mood, duration }) {
    try {
      const fullPrompt = this.buildPrompt(prompt, genre, mood);

      const response = await this.client.post('/generate', {
        prompt: fullPrompt,
        duration: duration,
        format: 'mp3',
      });

      return {
        success: true,
        jobId: response.data.id,
        status: 'generating',
        estimatedTime: response.data.estimated_time || 60,
      };
    } catch (error) {
      console.error('Error generando música con Suno:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al generar música',
      };
    }
  }

  /**
   * Obtener estado de una generación
   * @param {string} jobId - ID del job de generación
   * @returns {Promise<Object>} - Estado del job
   */
  async getStatus(jobId) {
    try {
      const response = await this.client.get(`/generate/${jobId}`);

      const data = response.data;

      return {
        success: true,
        status: data.status, // 'processing', 'completed', 'failed'
        progress: data.progress || 0,
        audioUrl: data.audio_url,
        coverUrl: data.cover_url,
        title: data.title,
      };
    } catch (error) {
      console.error('Error obteniendo estado de Suno:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estado',
      };
    }
  }

  /**
   * Construir el prompt completo con género y mood
   * @private
   */
  buildPrompt(prompt, genre, mood) {
    let fullPrompt = prompt;

    if (genre) {
      fullPrompt += `, ${genre} style`;
    }

    if (mood) {
      fullPrompt += `, ${mood} mood`;
    }

    return fullPrompt;
  }
}

// Singleton instance
const sunoClient = new SunoClient();

export default sunoClient;
