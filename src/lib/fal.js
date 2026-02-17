import axios from 'axios';

const FAL_API_BASE = 'https://fal.run';
const FAL_MODEL = 'fal-ai/elevenlabs/music';
const FAL_API_KEY = process.env.FAL_API_KEY;

class FalClient {
  constructor() {
    this.client = axios.create({
      baseURL: FAL_API_BASE,
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generar música con Elevenlabs Music a través de fal.ai
   * @param {Object} params - Parámetros de generación
   * @param {string} params.prompt - Descripción de la música
   * @param {number} params.duration - Duración en milisegundos (entre 3000 y 600000)
   * @param {boolean} params.forceInstrumental - Solo instrumental (default: false)
   * @param {string} params.outputFormat - Formato de salida (default: 'mp3_44100_128')
   * @returns {Promise<Object>} - Respuesta con requestId y detalles
   */
  async generate({ prompt, duration = 60000, forceInstrumental = false, outputFormat = 'mp3_44100_128' }) {
    try {
      const response = await this.client.post(`/${FAL_MODEL}`, {
        prompt,
        music_length_ms: duration,
        force_instrumental: forceInstrumental,
        output_format: outputFormat,
      });

      return {
        success: true,
        requestId: response.headers['x-fal-request-id'] || Date.now().toString(),
        status: 'generating',
        estimatedTime: this.estimateTime(duration),
      };
    } catch (error) {
      console.error('Error generando música con fal.ai:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al generar música',
      };
    }
  }

  /**
   * Obtener estado de una generación
   * @param {string} requestId - ID del request de generación
   * @returns {Promise<Object>} - Estado del job
   */
  async getStatus(requestId) {
    try {
      const response = await this.client.get(`/${FAL_MODEL}/requests/${requestId}/status`);

      const data = response.data;

      if (data.status === 'COMPLETED') {
        // Obtener el resultado completo
        const resultResponse = await this.client.get(`/${FAL_MODEL}/requests/${requestId}`);
        const result = resultResponse.data;

        return {
          success: true,
          status: 'completed',
          progress: 100,
          audioUrl: result.audio?.url,
          title: result.audio?.file_name?.replace('.mp3', '') || 'Generated Track',
        };
      } else if (data.status === 'FAILED') {
        return {
          success: true,
          status: 'failed',
          progress: 0,
          error: data.error || 'Generation failed',
        };
      } else {
        // IN_PROGRESS or IN_QUEUE
        return {
          success: true,
          status: 'generating',
          progress: data.status === 'IN_QUEUE' ? 10 : data.progress || 50,
        };
      }
    } catch (error) {
      console.error('Error obteniendo estado de fal.ai:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener estado',
      };
    }
  }

  /**
   * Estimar tiempo de generación basado en la duración
   * @private
   */
  estimateTime(durationMs) {
    // Fal.ai generalmente tarda entre 30-90 segundos
    const baseTime = 30;
    const additionalTime = Math.min(60, (durationMs / 1000) / 2);
    return Math.ceil(baseTime + additionalTime);
  }
}

// Singleton instance
const falClient = new FalClient();

export default falClient;
