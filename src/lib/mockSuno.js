/**
 * Mock Service for Suno AI music generation
 * This is a placeholder until a real Suno AI API becomes available
 */

export default class MockSunoService {
  constructor() {
    this.mockDelay = 3000; // 3 segundos para simular respuesta
  }

  /**
   * Simulate music generation
   * @param {Object} options - Generation parameters
   * @returns {Promise<Object>} Result object
   */
  async generate(options = {}) {
    const { prompt, genre, mood, duration } = options;

    // Simular delay para efecto de generación
    await this.delay();

    // Generar respuesta mock
    const result = {
      success: true,
      sunoId: `mock_${Date.now()}`,
      jobId: `job_${Date.now()}`,
      status: 'generating',
      progress: 0,
      estimatedTime: 60, // 60 segundos
      audioUrl: null,
      coverUrl: null,
      title: `${genre} - ${mood}`,
    };

    console.log('MOCK: Simulating Suno AI generation:', { prompt, genre, mood, duration });

    return result;
  }

  /**
   * Simulate status polling
   * @param {string} sunoId - The Suno AI job ID to check status for
   * @returns {Promise<Object>} Status object
   */
  async getStatus(sunoId) {
    await this.delay();

    const progress = Math.min(100, Math.floor(Date.now() % 120)); // Progreso simulado

    const result = {
      success: true,
      sunoId,
      status: progress < 100 ? 'generating' : 'completed',
      progress,
      audioUrl: progress >= 100 ? this.getMockAudioUrl() : null,
      coverUrl: progress >= 100 ? this.getMockCoverUrl() : null,
      title: this.getMockTitle(genre, mood),
    estimatedTime: progress < 100 ? 0 : 10, // segundos restantes si completado
    };

    console.log('MOCK: Simulating Suno AI status check:', { sunoId, progress });

    return result;
  }

  /**
   * Generate mock audio URL
   * @returns {string} Audio URL
   */
  getMockAudioUrl() {
    return 'https://example.com/mock-audio-' + Math.random().toString(36) + '.mp3';
  }

  /**
   * Generate mock cover image URL
   * @returns {string} Image URL
   */
  getMockCoverUrl() {
    return 'https://example.com/mock-cover-' + Math.random().toString(36) + '.jpg';
  }

  /**
   * Generate mock song title
   * @param {string} genre - Music genre
   * @param {string} mood - Music mood
   * @returns {string} Song title
   */
  getMockTitle(genre, mood) {
    const titles = {
      'Electronic': {
        'Chill': 'Chill Electronic Beats',
        'Energetic': 'Energetic Drops',
        'Sad': 'Melancholy Blues',
        'Happy': 'Happy Vibes',
        'Dramatic': 'Cinematic Score',
        'Romantic': 'Loving Moments',
      },
      'Rock': {
        'Chill': 'Ambient Rock Vibes',
        'Energetic': 'Power Rock',
        'Happy': 'Upbeat Groove',
        'Dramatic': 'Heavy Metal Riffs',
        'Romantic': 'Emotional Rock',
      },
      'Pop': {
        'Chill': 'Pop Dreams',
        'Energetic': 'Upbeat Pop',
        'Sad': 'Sad Pop Ballad',
        'Happy': 'Dance Pop',
        'Dramatic': 'Cinematic Pop',
        'Romantic': 'Love Pop',
      },
      'Classical': {
        'Chill': 'Classical Moods',
        'Energetic': 'Energetic Pieces',
        'Sad': 'Melancholy',
        'Happy': 'Joyful Sonatas',
        'Dramatic': 'Dramatic Overture',
        'Romantic': 'Romantic Era Classics',
      },
      'Jazz': {
        'Chill': 'Jazz Cafe',
        'Energetic': 'Swingin Jazz',
        'Happy': 'Groove Train',
        'Dramatic': 'Blue Note Riffs',
        'Romantic': 'Smooth Jazz',
      },
      'Hip-Hop': {
        'Chill': 'Hip-Hop Beats',
        'Energetic': 'Trap Heat',
        'Sad': 'Mood Trap',
        'Chill': 'Chill Hop Vibes',
        'Happy': 'Rap Party',
        'Dramatic': 'Dark Trap',
        'Romantic': 'Loyal Hip-Hop',
      },
      'Country': {
        'Chill': 'Country Folk',
        'Energetic': 'Upbeat Country',
        'Happy': 'Country Sunshine',
        'Sad': 'Sad Country',
      },
      'R&B': {
        'Chill': 'Smooth R&B',
        'Energetic': 'Groove Factory',
        'Happy': 'Happy R&B',
        'Dramatic': 'Smooth R&B Jam',
        'Romantic': 'Loving R&B',
      },
      'Folk': {
        'Chill': 'Acoustic Folk',
        'Energetic': 'Upbeat Folk',
        'Happy': 'Happy Folk',
        'Sad': 'Sad Folk',
        'Dramatic': 'Cinematic Folk`,
        'Romantic': 'Warm Folk',
      },
      'Blues': {
        'Chill': 'Blues Lounge',
        'Energetic': 'Electric Blues',
        'Happy': 'Jump Blues',
        'Sad': 'Melancholy Blues',
        'Dramatic': 'Delta Blues',
        'Romantic': 'Soulful Blues',
      },
    'Reggae': {
        'Chill': 'Reggae Vibes',
        'Energetic': 'Upbeat Reggae',
        'Happy': 'Island Vibes',
        'Sad': 'Sad Reggae',
        'Dramatic': 'Punk Reggae',
        'Romantic': 'Loving Reggae',
      },
    };

    const moodKey = `${genre}-${mood}`;

    return titles[moodKey]?.[moodKey]?.[genre] || `${genre} - ${mood}` || 'AI Generated Song';
  }

  /**
   * Simulate delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
