// Script de prueba rápida para FAL.ai
import fal from 'fal';

const FAL_MODEL = 'fal-ai/elevenlabs/music';
const FAL_API_KEY = process.env.FAL_API_KEY;

async function testFalIntegration() {
  console.log('🎵 Testing FAL.ai integration...');

  try {
    // Configure FAL client
    if (FAL_API_KEY) {
      fal.config({
        credentials: FAL_API_KEY
      });
    }

    console.log('1️⃣ Submitting music generation request...');

    // Submit a simple test request
    const result = await fal.queue.submit(FAL_MODEL, {
      input: {
        prompt: "A gentle piano melody",
        music_length_ms: 5000, // 5 seconds for quick test
        force_instrumental: true,
        output_format: 'mp3_44100_128',
      },
    });

    console.log('✅ Request submitted successfully!');
    console.log('   Request ID:', result.requestId);
    console.log('   Status:', result.status);

    console.log('\n2️⃣ Checking status...');

    // Wait a bit and check status
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResult = await fal.queue.status(FAL_MODEL, result.requestId);

    console.log('📊 Status result:');
    console.log('   Status:', statusResult.status);
    console.log('   Logs:', statusResult.logs?.length || 0);

    if (statusResult.status === 'COMPLETED') {
      console.log('🎉 Test PASSED! Integration works correctly.');
    } else if (statusResult.status === 'FAILED') {
      console.log('❌ Test FAILED - Generation failed.');
      console.log('   Error:', statusResult.error);
    } else {
      console.log('⏳ Still processing... Integration seems to work.');
    }

  } catch (error) {
    console.error('❌ Test FAILED with error:', error.message);

    if (error.message?.includes('404') || error.message?.toLowerCase().includes('not found')) {
      console.log('💡 Possible issues:');
      console.log('   - Model name might be incorrect');
      console.log('   - API key might not have access to this model');
    } else if (error.message?.toLowerCase().includes('credit') || error.message?.toLowerCase().includes('quota')) {
      console.log('💡 No credits available. Check your FAL.ai account.');
    } else if (error.message?.toLowerCase().includes('unauthorized') || error.message?.toLowerCase().includes('authentication')) {
      console.log('💡 API key might be invalid or expired.');
    }
  }
}

testFalIntegration();
