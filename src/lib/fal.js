import axios from 'axios';
import fal from 'fal';

const FAL_API_BASE = 'https://fal.run';
const FAL_MODEL = 'fal-ai/elevenlabs/music';
const FAL_API_KEY = process.env.FAL_API_KEY;

class FalClient {
  constructor() {
    // Initialize the FAL client with authentication
    if (FAL_API_KEY) {
      try {
        fal.config({
          credentials: FAL_API_KEY
        });
        console.log('✅ FAL SDK initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize FAL SDK:', error.message);
      }
    } else {
      console.warn('⚠️ No FAL_API_KEY found in environment');
    }

    // Fallback axios client for REST API calls
    this.axiosClient = axios.create({
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
      console.log('🎵 Sending music generation request to FAL.ai:', {
        model: FAL_MODEL,
        prompt,
        duration,
        forceInstrumental,
        outputFormat
      });

      // Try to use the official SDK first
      if (FAL_API_KEY) {
        try {
          console.log('📡 Using FAL SDK for request submission...');

          const result = await fal.queue.submit(FAL_MODEL, {
            input: {
              prompt,
              music_length_ms: duration,
              force_instrumental: forceInstrumental,
              output_format: outputFormat,
            },
          });

          console.log('✅ FAL SDK request submitted successfully:', {
            requestId: result.requestId,
            status: result.status
          });

          return {
            success: true,
            requestId: result.requestId,
            status: 'generating',
            estimatedTime: this.estimateTime(duration),
          };
        } catch (sdkError) {
          console.warn('⚠️ FAL SDK failed, falling back to REST API:', sdkError.message);
          // Fall through to REST API
        }
      }

      // Fallback to REST API
      console.log('🔄 Using REST API fallback...');
      const response = await this.axiosClient.post(`/${FAL_MODEL}`, {
        prompt,
        music_length_ms: duration,
        force_instrumental: forceInstrumental,
        output_format: outputFormat,
      });

      // Extract request ID from various possible sources
      let requestId = null;

      if (response.data) {
        if (response.data.request_id) requestId = response.data.request_id;
        else if (response.data.requestId) requestId = response.data.requestId;
        else if (response.data.id) requestId = response.data.id;
        else if (typeof response.data === 'string') requestId = response.data;
      }

      if (!requestId) {
        requestId = response.headers['x-fal-request-id'];
      }

      if (!requestId) {
        requestId = Date.now().toString();
        console.warn('⚠️ No request_id found, using fallback ID:', requestId);
      }

      console.log('✅ REST API request submitted successfully:', { requestId });

      return {
        success: true,
        requestId: requestId,
        status: 'generating',
        estimatedTime: this.estimateTime(duration),
      };
    } catch (error) {
      console.error('❌ Error generando música con fal.ai:', {
        message: error.message,
        error: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: error.message || 'Error al generar música',
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

      // Try to use the official SDK first
      if (FAL_API_KEY) {
        try {
          console.log('📡 Using FAL SDK for status check...');

          const result = await fal.queue.status(FAL_MODEL, requestId);

          console.log('✅ FAL SDK status result:', JSON.stringify({
            requestId,
            status: result.status,
            logs: result.logs?.length || 0,
            output: result.output ? 'has_output' : 'no_output'
          }, null, 2));

          return this.mapFalStatus(result);

        } catch (sdkError) {
          console.warn('⚠️ FAL SDK failed, falling back to REST API:', sdkError.message);
          // Fall through to REST API
        }
      }

      // Fallback to REST API with multiple endpoint patterns
      console.log('🔄 Using REST API fallback...');
      const endpoints = [
        `/${FAL_MODEL}/queue/${requestId}`,
        `/${FAL_MODEL}/${requestId}`,
        `/queue/${requestId}`,
      ];

      for (const endpoint of endpoints) {
        try {
          console.log('🔍 Trying REST endpoint:', endpoint);
          const response = await this.axiosClient.get(endpoint);
          const data = response.data;

          console.log('✅ REST API response from', endpoint, ':', JSON.stringify({
            requestId,
            status: data.status,
            logs: data.logs?.length || 0
          }, null, 2));

          return this.mapFalStatus(data);
        } catch (error) {
          console.log('❌ REST endpoint failed:', endpoint, error.response?.status);
          if (error.response?.status === 404) {
            continue;
          }
          throw error;
        }
      }

      throw new Error('All FAL.ai endpoints failed with 404');

    } catch (error) {
      console.error('❌ Error obteniendo estado de fal.ai:', {
        requestId,
        error: error.message,
        errorType: error.name,
        stack: error.stack?.split('\n')[0] // First line of stack trace
      });

      // Check if it's a 404 error
      if (error.message?.includes('404') || error.message?.toLowerCase().includes('not found')) {
        return {
          success: false,
          error: 'Request not found - may have expired or invalid ID',
        };
      }

      return {
        success: false,
        error: error.message || 'Error al obtener estado',
      };
    }
  }

  /**
   * Map FAL.ai status to our status system
   * @private
   */
  mapFalStatus(result) {
    if (result.status === 'COMPLETED' || result.status === 'SUCCEEDED') {
      let audioUrl = null;
      let title = 'Generated Track';

      if (result.output) {
        audioUrl = result.output.audio_url || result.output.audio?.url || result.output.audio;
        title = result.output.title || result.output.audio?.file_name?.replace('.mp3', '') || title;
      }

      return {
        success: true,
        status: 'completed',
        progress: 100,
        audioUrl,
        title,
      };
    } else if (result.status === 'FAILED' || result.status === 'ERROR') {
      return {
        success: true,
        status: 'failed',
        progress: 0,
        error: result.error || 'Generation failed',
      };
    } else if (result.status === 'IN_PROGRESS' || result.status === 'IN_QUEUE' || result.status === 'PROCESSING') {
      let progress = 25;
      if (result.status === 'IN_PROGRESS') {
        progress = 50;
        if (result.logs && result.logs.length > 0) {
          const lastLog = result.logs[result.logs.length - 1].message?.toLowerCase() || '';
          if (lastLog.includes('finalizing')) progress = 90;
          else if (lastLog.includes('processing')) progress = 75;
          else if (lastLog.includes('generating')) progress = 60;
        }
      }
      return {
        success: true,
        status: 'generating',
        progress: progress,
      };
    } else {
      return {
        success: true,
        status: 'generating',
        progress: 25,
      };
    }
  }

  /**
   * Estimar tiempo de generación basado en la duración
   * @private
   */
  estimateTime(durationMs) {
    const baseTime = 30;
    const additionalTime = Math.min(60, (durationMs / 1000) / 2);
    return Math.ceil(baseTime + additionalTime);
  }
}

// Singleton instance
const falClient = new FalClient();

export default falClient;
