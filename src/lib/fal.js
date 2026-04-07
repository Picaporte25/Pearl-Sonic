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
   * FAL.ai devuelve el audio inmediatamente (sincrónico), no usa colas
   * @param {Object} params - Parámetros de generación
   * @param {string} params.prompt - Descripción de la música
   * @param {number} params.duration - Duración en milisegundos (entre 3000 y 600000)
   * @param {boolean} params.forceInstrumental - Solo instrumental (default: false)
   * @param {string} params.outputFormat - Formato de salida (default: 'mp3_44100_128')
   * @returns {Promise<Object>} - Respuesta con audioUrl y detalles
   */
  async generate({ prompt, duration = 60000, forceInstrumental = false, outputFormat = 'mp3_44100_128' }) {
    try {
      console.log('🎵 Sending music generation request to FAL.ai (synchronous):', {
        model: FAL_MODEL,
        prompt,
        duration,
        forceInstrumental,
        outputFormat
      });

      const response = await this.client.post(`/${FAL_MODEL}`, {
        prompt,
        music_length_ms: duration,
        force_instrumental: forceInstrumental,
        output_format: outputFormat,
      });

      console.log('✅ FAL.ai response received:', {
        status: response.status,
        hasAudio: !!response.data.audio,
        audioUrl: response.data.audio?.url
      });

      // Extract request ID from headers (for tracking purposes)
      const requestId = response.headers['x-fal-request-id'] || Date.now().toString();

      // FAL.ai returns audio immediately (synchronous)
      if (response.data.audio && response.data.audio.url) {
        console.log('🎉 Audio generated successfully!');
        return {
          success: true,
          requestId: requestId,
          status: 'completed', // Audio is available immediately
          audioUrl: response.data.audio.url,
          title: response.data.audio?.file_name?.replace('.mp3', '') || 'Generated Track',
          fileSize: response.data.audio?.file_size,
          contentType: response.data.audio?.content_type,
        };
      } else {
        console.warn('⚠️ No audio in response');
        return {
          success: false,
          error: 'No audio received from FAL.ai',
        };
      }

    } catch (error) {
      console.error('❌ Error generando música con fal.ai:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Error al generar música',
      };
    }
  }

  /**
   * Obtener estado de una generación
   * NOTA: FAL.ai no usa sistema de colas, devuelve audio inmediatamente
   * Este método está por compatibilidad pero siempre devolverá que no se encuentra
   * @param {string} requestId - ID del request de generación
   * @returns {Promise<Object>} - Estado del job
   */
  async getStatus(requestId) {
    // FAL.ai no tiene status checking porque es síncrono
    // Audio está disponible inmediatamente en generate()
    console.log('⚠️ getStatus() called but FAL.ai is synchronous - no queue status available');

    return {
      success: false,
      error: 'FAL.ai does not support status checking - audio is generated synchronously',
    };
  }

  /**
   * Estimar tiempo de generación basado en la duración
   * @private
   */
  estimateTime(durationMs) {
    // FAL.ai es muy rápido, generalmente menos de 10 segundos
    const baseTime = 2;
    const additionalTime = Math.min(5, (durationMs / 1000) / 10);
    return Math.ceil(baseTime + additionalTime);
  }
}

// Singleton instance
const falClient = new FalClient();

export default falClient;
