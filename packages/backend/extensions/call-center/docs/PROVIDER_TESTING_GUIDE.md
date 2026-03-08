# Provider Testing Guide

Complete guide for testing TTS and STT providers in the Call Center extension.

## 📋 Prerequisites

1. Extension installed and enabled
2. Backend running on `http://localhost:41522`
3. API keys for providers you want to test
4. Authentication token (if required)

---

## 🎤 Testing TTS Providers

### Test Endpoint
```
POST /api/ext/call-center/test-tts
```

### Request Body
```json
{
  "provider": "openai",
  "voice": "alloy",
  "language": "en-US",
  "api_key": "your_api_key_here",
  "model": "tts-1"
}
```

### cURL Examples

#### 1. Test OpenAI TTS
```bash
curl -X POST http://localhost:41522/api/ext/call-center/test-tts \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "voice": "alloy",
    "language": "en-US",
    "api_key": "sk-..."
  }'
```

#### 2. Test Google Cloud TTS
```bash
curl -X POST http://localhost:41522/api/ext/call-center/test-tts \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "voice": "en-US-Neural2-A",
    "language": "en-US",
    "api_key": "AIza..."
  }'
```

#### 3. Test Azure Neural TTS
```bash
curl -X POST http://localhost:41522/api/ext/call-center/test-tts \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "azure",
    "voice": "en-US-JennyNeural",
    "language": "en-US",
    "api_key": "your_azure_key"
  }'
```

#### 4. Test ElevenLabs
```bash
curl -X POST http://localhost:41522/api/ext/call-center/test-tts \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "elevenlabs",
    "voice": "EXAVITQu4vr4xnSDxMaL",
    "language": "en-US",
    "api_key": "your_elevenlabs_key"
  }'
```

#### 5. Test Twilio (No API key needed)
```bash
curl -X POST http://localhost:41522/api/ext/call-center/test-tts \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "twilio",
    "voice": "Polly.Joanna",
    "language": "en-US"
  }'
```

### Expected Response
```json
{
  "success": true,
  "provider": "openai",
  "audioSize": 12345,
  "format": "mp3",
  "message": "openai TTS is working correctly"
}
```

---

## 📝 Testing STT Providers

### Test Endpoint
```
POST /api/ext/call-center/test-stt
```

### Request Body
```json
{
  "provider": "openai",
  "language": "en-US",
  "api_key": "your_api_key_here"
}
```

### cURL Examples

#### 1. Test OpenAI Whisper
```bash
curl -X POST http://localhost:41522/api/ext/call-center/test-stt \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "language": "en-US",
    "api_key": "sk-..."
  }'
```

#### 2. Test Google Cloud STT
```bash
curl -X POST http://localhost:41522/api/ext/call-center/test-stt \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "language": "en-US",
    "api_key": "AIza..."
  }'
```

#### 3. Test Deepgram
```bash
curl -X POST http://localhost:41522/api/ext/call-center/test-stt \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "deepgram",
    "language": "en-US",
    "api_key": "your_deepgram_key"
  }'
```

#### 4. Test AssemblyAI
```bash
curl -X POST http://localhost:41522/api/ext/call-center/test-stt \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "assemblyai",
    "language": "en",
    "api_key": "your_assemblyai_key"
  }'
```

### Expected Response
```json
{
  "success": true,
  "provider": "openai",
  "text": "transcribed text here",
  "message": "openai STT is working correctly"
}
```

---

## 🎵 Generate TTS Audio (Download MP3)

### Endpoint
```
POST /api/ext/call-center/generate-tts
```

### Request Body
```json
{
  "text": "Hello! This is a test of text-to-speech.",
  "provider": "openai",
  "voice": "alloy",
  "language": "en-US",
  "api_key": "your_api_key_here"
}
```

### cURL Example (Download MP3)
```bash
curl -X POST http://localhost:41522/api/ext/call-center/generate-tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! This is a test of OpenAI text-to-speech.",
    "provider": "openai",
    "voice": "nova",
    "language": "en-US",
    "api_key": "sk-..."
  }' \
  --output test_tts.mp3
```

### Test Arabic Voice
```bash
curl -X POST http://localhost:41522/api/ext/call-center/generate-tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "مرحباً! هذا اختبار لتحويل النص إلى صوت باللغة العربية.",
    "provider": "openai",
    "voice": "alloy",
    "language": "ar",
    "api_key": "sk-..."
  }' \
  --output test_arabic.mp3
```

---

## 🎙️ Transcribe Audio File

### Endpoint
```
POST /api/ext/call-center/transcribe-audio
```

### cURL Example (Upload Audio File)
```bash
curl -X POST http://localhost:41522/api/ext/call-center/transcribe-audio \
  -H "Authorization: Bearer your_auth_token" \
  -F "audio=@/path/to/audio.mp3" \
  -F "provider=openai" \
  -F "language=en-US" \
  -F "api_key=sk-..."
```

### Expected Response
```json
{
  "success": true,
  "provider": "openai",
  "result": {
    "text": "This is the transcribed text from the audio file.",
    "language": "en",
    "duration": 12.5,
    "words": [...],
    "provider": "openai"
  }
}
```

---

## 🔍 Get Available Voices

### Endpoint
```
GET /api/ext/call-center/provider-voices/:provider?api_key=xxx
```

### Examples

#### OpenAI Voices (Fixed list)
```bash
curl http://localhost:41522/api/ext/call-center/provider-voices/openai
```

Response:
```json
{
  "success": true,
  "provider": "openai",
  "count": 6,
  "voices": [
    { "id": "alloy", "name": "Alloy" },
    { "id": "echo", "name": "Echo" },
    { "id": "fable", "name": "Fable" },
    { "id": "onyx", "name": "Onyx" },
    { "id": "nova", "name": "Nova" },
    { "id": "shimmer", "name": "Shimmer" }
  ]
}
```

#### ElevenLabs Voices (Fetched from API)
```bash
curl "http://localhost:41522/api/ext/call-center/provider-voices/elevenlabs?api_key=your_key"
```

---

## 📊 Get All Providers Status

### Endpoint
```
GET /api/ext/call-center/provider-status
```

### Example
```bash
curl http://localhost:41522/api/ext/call-center/provider-status
```

### Response
```json
{
  "success": true,
  "tts": [
    {
      "id": "openai",
      "name": "OpenAI TTS",
      "requiresApiKey": true,
      "pricing": "$0.015 - $0.030 per 1000 characters",
      "supportedLanguages": 50
    },
    ...
  ],
  "stt": [
    {
      "id": "openai",
      "name": "OpenAI Whisper",
      "requiresApiKey": true,
      "pricing": "$0.006 per minute",
      "supportedLanguages": 99
    },
    ...
  ]
}
```

---

## 🧪 JavaScript Testing Examples

### Test in Browser Console

```javascript
// Test OpenAI TTS
async function testOpenAITTS() {
  const response = await fetch('http://localhost:41522/api/ext/call-center/test-tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'openai',
      voice: 'alloy',
      language: 'en-US',
      api_key: 'sk-...'
    })
  });

  const result = await response.json();
  console.log('TTS Test Result:', result);
}

testOpenAITTS();
```

### Generate and Play Audio

```javascript
// Generate TTS and play in browser
async function generateAndPlay() {
  const response = await fetch('http://localhost:41522/api/ext/call-center/generate-tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Hello! This is a test.',
      provider: 'openai',
      voice: 'nova',
      language: 'en-US',
      api_key: 'sk-...'
    })
  });

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  const audio = new Audio(audioUrl);
  await audio.play();

  console.log('Playing audio...');
}

generateAndPlay();
```

---

## 🔑 Getting API Keys

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Format: `sk-...`

### Google Cloud
1. Go to https://console.cloud.google.com/
2. Enable Text-to-Speech API
3. Create credentials → API key
4. Format: `AIza...`

### Azure
1. Go to https://portal.azure.com/
2. Create Cognitive Services resource
3. Get key from Keys and Endpoint
4. Format: 32-character hex string

### Deepgram
1. Go to https://console.deepgram.com/
2. Create API key
3. Format: token string

### ElevenLabs
1. Go to https://elevenlabs.io/
2. Profile → API Key
3. Format: 32-character hex string

### AssemblyAI
1. Go to https://www.assemblyai.com/
2. Dashboard → API Key
3. Format: 32-character hex string

---

## ⚠️ Common Errors

### "API key required for provider"
**Solution**: Add `api_key` field to request body

### "Failed to generate voice preview with openai"
**Possible causes**:
1. Invalid API key
2. Insufficient credits
3. Rate limit exceeded
4. Invalid voice ID

**Check**: OpenAI dashboard for quota and errors

### "Audio file too large"
**Solution**:
- OpenAI Whisper: Max 25 MB
- Compress audio or split into chunks

### "Language not supported"
**Solution**: Check provider's supported languages list

---

## 📈 Performance Tips

1. **Cache API keys** in environment variables
2. **Rate limiting**: Add delays between requests
3. **Error handling**: Always wrap in try-catch
4. **Audio format**: Use MP3 for best compatibility
5. **File size**: Compress audio before transcription

---

## 🐛 Debugging

### Enable Detailed Logs
```bash
# In backend/.env
LOG_LEVEL=debug
```

### Check Backend Logs
```bash
# Terminal where backend is running
# Look for [Provider Test] and [TTS Service] logs
```

### Test with Minimal Example
```bash
# Test with smallest possible request
curl -X POST http://localhost:41522/api/ext/call-center/test-tts \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","voice":"alloy","language":"en-US","api_key":"sk-..."}'
```

---

**Last Updated**: 2026-03-08
**Version**: 1.0.0
**Need Help?** Check backend logs for detailed error messages
