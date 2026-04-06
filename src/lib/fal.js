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

      // Get request ID from response - fal.ai returns it in the response body as request_id
      const requestId = response.data.request_id || response.headers['x-fal-request-id'] || Date.now().toString();

      console.log('🎵 FAL.ai generate response:', {
        requestId,
        status: response.status,
        response_data: response.data,
        headers: {
          'x-fal-request-id': response.headers['x-fal-request-id'],
          'x-fal-queue-position': response.headers['x-fal-queue-position']
        }
      });

      return {
        success: true,
        requestId: requestId,
        status: 'generating',
        estimatedTime: this.estimateTime(duration),
      };
    } catch (error) {
      console.error('❌ Error generando música con fal.ai:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
      console.log('🔍 Checking status for requestId:', requestId);

      // Fal.ai uses the queue/status endpoint to check job status
      const response = await this.client.get(`/queue/status/${requestId}`);
      const data = response.data;

      console.log('✅ FAL.ai queue status response:', JSON.stringify({
        requestId,
        status: data.status,
        logs: data.logs,
        error: data.error,
        fullData: data
      }, null, 2));

      if (data.status === 'COMPLETED') {
        // When completed, the response contains the output with audio_url
        return {
          success: true,
          status: 'completed',
          progress: 100,
          audioUrl: data.output?.audio_url || data.audio_url,
          title: data.output?.title || 'Generated Track',
        };
      } else if (data.status === 'FAILED') {
        return {
          success: true,
          status: 'failed',
          progress: 0,
          error: data.error || 'Generation failed',
        };
      } else if (data.status === 'IN_PROGRESS' || data.status === 'IN_QUEUE') {
        // Still processing
        return {
          success: true,
          status: 'generating',
          progress: data.status === 'IN_QUEUE' ? 10 : 50,
        };
      } else {
        // Unknown status, assume generating
        return {
          success: true,
          status: 'generating',
          progress: 25,
        };
      }

    } catch (error) {
      console.error('❌ Error obteniendo estado de fal.ai:', {
        requestId,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // If 404, the request might not exist anymore or ID is wrong
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Request not found - may have expired or invalid ID',
        };
      }

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
