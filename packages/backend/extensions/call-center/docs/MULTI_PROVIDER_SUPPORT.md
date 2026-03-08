# Multi-Provider TTS & STT Support

Complete implementation of multiple Text-to-Speech and Speech-to-Text providers for the Call Center extension.

## 🎤 TTS (Text-to-Speech) Providers

### 1. Twilio (Default - Built-in)
- **Pricing**: Included in Twilio call pricing ($0.0140/min)
- **Voices**: 100+ voices (Amazon Polly + Google)
- **Languages**: 25+ languages
- **Features**: Real-time streaming, No additional setup, Multiple accents
- **API Key Required**: ❌ No

### 2. OpenAI TTS
- **Pricing**: $0.015 - $0.030 per 1000 characters
- **Models**:
  - tts-1 (Standard): $0.015/1k chars
  - tts-1-hd (High Quality): $0.030/1k chars
- **Voices**: 6 voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- **Languages**: 50+ languages
- **Features**: Ultra-natural, Fast generation
- **API Key Required**: ✅ Yes

### 3. Google Cloud TTS
- **Pricing**: $4 - $16 per 1 million characters
- **Voice Types**:
  - Standard: $4/1M chars
  - WaveNet: $16/1M chars (Premium)
  - Neural2: $16/1M chars (Excellent)
  - Studio: $160/1M chars (Ultra-Premium)
- **Voices**: 400+ voices
- **Languages**: 50+ languages
- **Features**: WaveNet technology, SSML support, Custom voices
- **API Key Required**: ✅ Yes

### 4. Azure Neural TTS
- **Pricing**: $15 per 1 million characters
- **Voices**: 400+ neural voices
- **Languages**: 140+ languages
- **Features**: Emotional styles, Custom Neural Voice, SSML support
- **API Key Required**: ✅ Yes

### 5. ElevenLabs
- **Pricing**: Free tier (10k chars/mo), Paid plans from $5/mo
- **Plans**:
  - Free: 10,000 chars/month
  - Starter: 30,000 chars/month ($5)
  - Creator: 100,000 chars/month ($22)
  - Pro: 500,000 chars/month ($99)
- **Voices**: 100+ ultra-realistic voices
- **Languages**: 29 languages
- **Features**: Voice cloning, Emotion control, Ultra-realistic
- **API Key Required**: ✅ Yes

---

## 📝 STT (Speech-to-Text) Providers

### 1. Twilio (Default - Built-in)
- **Pricing**: $0.02 per minute (includes call + transcription)
- **Languages**: 119 languages
- **Features**: Real-time, Call recording transcription, Easy integration
- **API Key Required**: ❌ No

### 2. OpenAI Whisper
- **Pricing**: $0.006 per minute
- **Model**: whisper-1
- **Languages**: 99+ languages
- **Features**: Timestamps, Word-level precision, Speaker detection
- **Max File Size**: 25 MB
- **Formats**: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm
- **API Key Required**: ✅ Yes

### 3. Google Cloud Speech-to-Text
- **Pricing**: $0.016 - $0.09 per minute
- **Models**:
  - Standard: $0.016/min
  - Command & Search: $0.016/min
  - Phone Call Enhanced: $0.04/min
  - Video: $0.09/min
  - Medical Dictation: $0.09/min
- **Languages**: 125+ languages
- **Features**: Real-time streaming, Speaker diarization, Punctuation
- **Max Audio Length**: 480 minutes
- **API Key Required**: ✅ Yes

### 4. Azure Speech-to-Text
- **Pricing**: $1 per audio hour
- **Languages**: 100+ languages
- **Features**: Custom models, Speaker recognition, Sentiment analysis
- **Advanced Features**: Custom vocabulary, Profanity filter, Diarization, Word-level timestamps
- **API Key Required**: ✅ Yes

### 5. Deepgram
- **Pricing**: $0.0043 - $0.0125 per minute
- **Models**:
  - Nova-2 (Latest): $0.0043/min ⭐ Fastest
  - Enhanced: $0.0125/min
  - Whisper Cloud: $0.0048/min
- **Languages**: 36 languages
- **Features**: Fastest transcription, Real-time streaming, Custom vocabulary, Topic detection
- **API Key Required**: ✅ Yes

### 6. AssemblyAI
- **Pricing**: ~$0.015 per minute + optional add-ons
- **Models**:
  - Best (Recommended): $0.015/min
  - Nano (Fast): $0.005/min
- **Languages**: English only
- **Features**: Speaker labels, Chapter detection, Auto-highlights, Sentiment
- **Add-ons**:
  - Speaker Labels: +$0.003/min
  - Auto Chapters: +$0.003/min
  - Sentiment Analysis: +$0.003/min
  - Entity Detection: +$0.003/min
  - Content Moderation: +$0.01/min
- **API Key Required**: ✅ Yes

---

## 💾 Database Schema

### Migration 007: TTS Provider Support
```sql
ALTER TABLE phone_numbers ADD COLUMN tts_provider TEXT DEFAULT 'twilio';
ALTER TABLE phone_numbers ADD COLUMN provider_api_key TEXT;
CREATE INDEX idx_phone_numbers_provider ON phone_numbers(tts_provider);
```

### Migration 008: STT Provider Support
```sql
ALTER TABLE phone_numbers ADD COLUMN stt_provider TEXT DEFAULT 'twilio';
ALTER TABLE phone_numbers ADD COLUMN stt_provider_api_key TEXT;
CREATE INDEX idx_phone_numbers_stt_provider ON phone_numbers(stt_provider);
```

---

## 🎨 UI Features

### Phone Number Settings Page

1. **TTS Provider Section** (Blue theme)
   - Provider dropdown with pricing info
   - Conditional API key input
   - Feature badges
   - Documentation links

2. **STT Provider Section** (Green theme)
   - Provider dropdown with pricing info
   - Conditional API key input
   - Feature badges
   - Documentation links

3. **Voice & Language Settings**
   - Language dropdown (25+ languages with flags)
   - Voice dropdown (filtered by provider and language)
   - Voice preview button
   - Live recommendations

---

## 📦 Files Created/Modified

### New Files (10)
1. `migrations/007_tts_provider_support.sql`
2. `migrations/008_stt_provider_support.sql`
3. `config/tts-providers.js` (Backend)
4. `config/stt-providers.js` (Backend)
5. `frontend/tts-providers-config.ts` (Frontend)
6. `frontend/stt-providers-config.ts` (Frontend)
7. `docs/MULTI_PROVIDER_SUPPORT.md` (This file)

### Modified Files (2)
1. `frontend/settings.tsx` - Added TTS/STT provider UI
2. `routes/numbers.js` - Added provider fields to API

---

## 🚀 Usage

### For Users

1. Navigate to Call Center → Settings
2. Select a phone number to edit
3. Choose your preferred TTS provider
4. Choose your preferred STT provider
5. Enter API keys if required
6. Select voice and language
7. Preview the voice
8. Save changes

### For Developers

```javascript
// Backend: Get provider config
const { getProvider } = require('./config/tts-providers');
const openai = getProvider('openai');
console.log(openai.pricing); // "$0.015 - $0.030 per 1000 characters"

// Frontend: Import providers
import { TTS_PROVIDERS, getAllProviders } from './tts-providers-config';
import { STT_PROVIDERS, getAllProviders as getAllSttProviders } from './stt-providers-config';

const providers = getAllProviders(); // Returns all TTS providers
const sttProviders = getAllSttProviders(); // Returns all STT providers
```

---

## 💡 Cost Optimization Tips

### Cheapest Options
- **TTS**: ElevenLabs Free Tier (10k chars/month free)
- **STT**: Deepgram Nova-2 ($0.0043/min = $0.26/hour)

### Best Quality
- **TTS**: ElevenLabs Pro or OpenAI TTS-1-HD
- **STT**: OpenAI Whisper or Google Cloud Phone Call Enhanced

### Balanced (Quality + Price)
- **TTS**: OpenAI TTS-1 ($0.015/1k chars)
- **STT**: OpenAI Whisper ($0.006/min = $0.36/hour)

### No API Key Required
- **TTS**: Twilio (included in call pricing)
- **STT**: Twilio ($0.02/min extra)

---

## 📊 Provider Comparison

| Provider | TTS Pricing | STT Pricing | Languages | Best For |
|----------|-------------|-------------|-----------|----------|
| Twilio | Included | $0.02/min | 25 / 119 | Simplicity |
| OpenAI | $0.015-0.03/1k | $0.006/min | 50+ / 99+ | Quality + Price |
| Google Cloud | $4-16/1M | $0.016-0.09/min | 50+ / 125+ | Enterprise |
| Azure | $15/1M | $1/hour | 140+ / 100+ | Microsoft ecosystem |
| Deepgram | - | $0.0043/min | - / 36 | Speed (fastest) |
| ElevenLabs | $0-99/mo | - | 29 / - | Ultra-realistic voices |
| AssemblyAI | - | $0.015/min | - / 1 (EN) | Advanced AI features |

---

## 🔒 Security Notes

- API keys are stored in the `provider_api_key` and `stt_provider_api_key` columns
- Keys should be encrypted at rest (recommended)
- Each phone number can have different providers
- Keys are not exposed in API responses
- Use environment variables for system-wide default keys

---

## 🎯 Next Steps

1. ✅ Add TTS provider selection UI
2. ✅ Add STT provider selection UI
3. ✅ Database migrations
4. ✅ Backend API support
5. ⏳ Implement actual TTS/STT API integrations (provider-specific code)
6. ⏳ Add voice preview with real audio (not beep)
7. ⏳ Add provider status/health checks
8. ⏳ Add usage analytics per provider
9. ⏳ Add automatic failover to backup provider

---

**Last Updated**: 2026-03-08
**Version**: 1.0.0
**Status**: ✅ Core implementation complete, API integrations pending
