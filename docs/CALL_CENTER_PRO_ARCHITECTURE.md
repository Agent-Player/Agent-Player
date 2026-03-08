# Call Center Pro - Professional Architecture
## 🎯 Vision: Enterprise-Grade AI Call Center System

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Call Center Pro System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Inbound    │  │   Outbound   │  │     IVR      │          │
│  │   Routing    │  │   Campaigns  │  │    Menu      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                   │
│                            ▼                                      │
│                  ┌──────────────────┐                            │
│                  │  Call Orchestrator│                            │
│                  │  (Smart Routing)  │                            │
│                  └────────┬──────────┘                            │
│                           ▼                                       │
│         ┌─────────────────┴─────────────────┐                    │
│         ▼                                   ▼                    │
│  ┌──────────────┐                   ┌──────────────┐            │
│  │  AI Engine   │                   │  Queue Mgmt  │            │
│  │  - Model     │                   │  - Waiting   │            │
│  │  - Voice     │                   │  - Position  │            │
│  │  - Knowledge │                   │  - Music     │            │
│  └──────┬───────┘                   └──────┬───────┘            │
│         │                                   │                    │
│         └───────────────┬───────────────────┘                    │
│                         ▼                                        │
│              ┌────────────────────┐                              │
│              │  Call Session Mgmt  │                              │
│              │  - Recording        │                              │
│              │  - Transcription    │                              │
│              │  - Analytics        │                              │
│              └─────────┬───────────┘                              │
│                        ▼                                          │
│         ┌──────────────┴──────────────┐                          │
│         ▼                             ▼                          │
│  ┌──────────────┐             ┌──────────────┐                  │
│  │   Workflow   │             │     CRM      │                  │
│  │  Integration │             │ Integration  │                  │
│  └──────────────┘             └──────────────┘                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Enhanced Database Schema

### New Tables (6 additional tables):

#### 1. `call_point_knowledge` (Knowledge Base per Call Point)
```sql
CREATE TABLE call_point_knowledge (
  id TEXT PRIMARY KEY,
  call_point_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'faq', 'policy', 'product', 'procedure'
  embedding TEXT, -- Vector embedding for RAG
  language TEXT DEFAULT 'en',
  priority INTEGER DEFAULT 0, -- Higher priority = used first
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (call_point_id) REFERENCES call_points(id) ON DELETE CASCADE
);

CREATE INDEX idx_knowledge_call_point ON call_point_knowledge(call_point_id);
CREATE INDEX idx_knowledge_category ON call_point_knowledge(category);
CREATE INDEX idx_knowledge_active ON call_point_knowledge(is_active);
```

#### 2. `call_point_prompts` (Custom System Prompts)
```sql
CREATE TABLE call_point_prompts (
  id TEXT PRIMARY KEY,
  call_point_id TEXT NOT NULL,
  prompt_type TEXT NOT NULL, -- 'greeting', 'handling', 'closing', 'escalation'
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  variables TEXT, -- JSON: placeholders like {customer_name}, {time}, {location}
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (call_point_id) REFERENCES call_points(id) ON DELETE CASCADE
);

CREATE INDEX idx_prompts_call_point ON call_point_prompts(call_point_id);
CREATE INDEX idx_prompts_type ON call_point_prompts(prompt_type);
```

#### 3. `call_queue` (Call Queuing System)
```sql
CREATE TABLE call_queue (
  id TEXT PRIMARY KEY,
  call_point_id TEXT NOT NULL,
  call_session_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  estimated_wait_seconds INTEGER,
  status TEXT DEFAULT 'waiting', -- 'waiting', 'connected', 'abandoned', 'transferred'
  entered_queue_at TEXT DEFAULT CURRENT_TIMESTAMP,
  left_queue_at TEXT,
  FOREIGN KEY (call_point_id) REFERENCES call_points(id),
  FOREIGN KEY (call_session_id) REFERENCES call_sessions(id)
);

CREATE INDEX idx_queue_call_point ON call_queue(call_point_id);
CREATE INDEX idx_queue_status ON call_queue(status);
CREATE INDEX idx_queue_entered ON call_queue(entered_queue_at);
```

#### 4. `call_analytics` (Advanced Call Analytics)
```sql
CREATE TABLE call_analytics (
  id TEXT PRIMARY KEY,
  call_session_id TEXT NOT NULL UNIQUE,
  sentiment_score REAL, -- -1.0 (very negative) to +1.0 (very positive)
  sentiment_label TEXT, -- 'positive', 'neutral', 'negative'
  customer_satisfaction INTEGER, -- 1-5 stars (if CSAT asked)
  issue_resolved BOOLEAN,
  escalated BOOLEAN DEFAULT 0,
  topics TEXT, -- JSON array: ['billing', 'technical', 'refund']
  keywords TEXT, -- JSON array: extracted important keywords
  speaker_talk_ratio REAL, -- 0.0-1.0 (customer talk time / total)
  silence_percentage REAL, -- % of call that was silence
  interruptions_count INTEGER, -- How many times AI/customer interrupted each other
  average_response_time_ms INTEGER, -- AI response latency
  model_used TEXT, -- 'claude-sonnet-4.5', 'gpt-4', etc.
  tokens_used INTEGER,
  cost_usd REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (call_session_id) REFERENCES call_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_analytics_session ON call_analytics(call_session_id);
CREATE INDEX idx_analytics_sentiment ON call_analytics(sentiment_label);
CREATE INDEX idx_analytics_resolved ON call_analytics(issue_resolved);
```

#### 5. `call_transfers` (Call Transfer History)
```sql
CREATE TABLE call_transfers (
  id TEXT PRIMARY KEY,
  call_session_id TEXT NOT NULL,
  from_call_point_id TEXT,
  to_call_point_id TEXT,
  to_external_number TEXT, -- If transferred to human agent outside system
  reason TEXT, -- Why was it transferred?
  transferred_at TEXT DEFAULT CURRENT_TIMESTAMP,
  transferred_by TEXT, -- 'ai', 'human', 'customer_request'
  FOREIGN KEY (call_session_id) REFERENCES call_sessions(id)
);

CREATE INDEX idx_transfers_session ON call_transfers(call_session_id);
CREATE INDEX idx_transfers_from ON call_transfers(from_call_point_id);
CREATE INDEX idx_transfers_to ON call_transfers(to_call_point_id);
```

#### 6. `caller_profiles` (CRM - Caller History)
```sql
CREATE TABLE caller_profiles (
  id TEXT PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE, -- E.164 format
  name TEXT,
  email TEXT,
  language_preference TEXT DEFAULT 'en',
  tags TEXT, -- JSON array: ['vip', 'frequent_caller', 'issue_history']
  notes TEXT, -- Free-text notes from agents
  total_calls INTEGER DEFAULT 0,
  last_call_at TEXT,
  first_call_at TEXT DEFAULT CURRENT_TIMESTAMP,
  sentiment_average REAL, -- Average sentiment across all calls
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_caller_phone ON caller_profiles(phone_number);
CREATE INDEX idx_caller_last_call ON caller_profiles(last_call_at);
```

---

## 🔧 Enhanced Call Point Configuration

### Updated `call_points` table schema:

```sql
ALTER TABLE call_points ADD COLUMN ai_model TEXT DEFAULT 'claude-sonnet-4.5';
ALTER TABLE call_points ADD COLUMN ai_temperature REAL DEFAULT 0.7;
ALTER TABLE call_points ADD COLUMN ai_max_tokens INTEGER DEFAULT 500;
ALTER TABLE call_points ADD COLUMN knowledge_enabled BOOLEAN DEFAULT 0;
ALTER TABLE call_points ADD COLUMN rag_enabled BOOLEAN DEFAULT 0; -- Vector search in knowledge
ALTER TABLE call_points ADD COLUMN queue_enabled BOOLEAN DEFAULT 0;
ALTER TABLE call_points ADD COLUMN queue_max_size INTEGER DEFAULT 10;
ALTER TABLE call_points ADD COLUMN queue_wait_music_url TEXT;
ALTER TABLE call_points ADD COLUMN transfer_enabled BOOLEAN DEFAULT 0;
ALTER TABLE call_points ADD COLUMN transfer_to_human_number TEXT; -- Phone number of human agent
ALTER TABLE call_points ADD COLUMN sentiment_analysis_enabled BOOLEAN DEFAULT 1;
ALTER TABLE call_points ADD COLUMN auto_escalate_on_negative BOOLEAN DEFAULT 0; -- Transfer if sentiment < -0.5
ALTER TABLE call_points ADD COLUMN csat_survey_enabled BOOLEAN DEFAULT 0; -- Ask "Rate 1-5 stars" at end
ALTER TABLE call_points ADD COLUMN context_window_calls INTEGER DEFAULT 5; -- Remember last N calls from this number
```

---

## 🎨 Frontend Enhancements

### New Dashboard Tabs (Total: 9 tabs)

1. **Call Points** ✅ (existing)
2. **Phone Numbers** ✅ (existing)
3. **Active Calls** ✅ (existing)
4. **Call History** ✅ (existing)
5. **Settings** ✅ (existing)
6. **📚 Knowledge Base** ⭐ NEW
   - Manage FAQ/Policies/Products per Call Point
   - Upload documents (PDF/DOCX) → auto-extract
   - Vector search testing
7. **🎯 Call Analytics** ⭐ NEW
   - Real-time dashboard (calls/min, avg wait, sentiment)
   - Charts: Call volume, resolution rate, CSAT
   - Sentiment distribution
8. **👥 Caller Profiles (CRM)** ⭐ NEW
   - List all callers
   - View call history per caller
   - Add notes/tags
9. **⚙️ Advanced Config** ⭐ NEW
   - AI Model selection per Call Point
   - Prompt editor (greeting/handling/closing)
   - Queue settings
   - Transfer rules

---

## 🤖 AI Engine Architecture

### Multi-Model Support

```javascript
// AI model configuration per Call Point
const AI_MODELS = {
  'claude-sonnet-4.5': {
    provider: 'anthropic',
    maxTokens: 8192,
    costPer1kTokens: 0.015,
    strengths: ['reasoning', 'long-context', 'multilingual']
  },
  'gpt-4-turbo': {
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: 0.01,
    strengths: ['speed', 'consistency', 'function-calling']
  },
  'gemini-pro': {
    provider: 'google',
    maxTokens: 32768,
    costPer1kTokens: 0.0005,
    strengths: ['cost', 'multilingual', 'grounding']
  }
};
```

### Voice Selection

```javascript
// Voice configuration
const VOICE_PROVIDERS = {
  openai_tts: {
    voices: {
      en: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      ar: ['alloy'] // Limited Arabic support
    },
    quality: 'high',
    latency: 'medium',
    cost: 0.015 // per 1k characters
  },
  edge_tts: {
    voices: {
      en: ['en-US-GuyNeural', 'en-US-JennyNeural'],
      ar: ['ar-SA-ZariyahNeural', 'ar-SA-HamedNeural', 'ar-EG-SalmaNeural']
    },
    quality: 'medium',
    latency: 'low',
    cost: 0 // Free!
  },
  elevenlabs: { // Future integration
    voices: {
      en: ['custom_voice_1', 'custom_voice_2'],
      ar: ['custom_voice_ar']
    },
    quality: 'ultra-high',
    latency: 'high',
    cost: 0.3 // per 1k characters - expensive but best quality
  }
};
```

---

## 🔄 Call Flow (Enhanced)

### Example: Customer calls Support Hotline

```
1. Inbound Call Received
   ↓
2. Lookup Caller Profile (CRM)
   - Found: "Ahmed, VIP customer, 15 previous calls"
   ↓
3. IVR Menu (if enabled)
   "Press 1 for Technical Support"
   "Press 2 for Billing"
   "Press 3 for Sales"
   ↓
4. Route to Call Point
   - Selected: Technical Support (Call Point #2)
   ↓
5. Check Queue
   - If queue enabled & full → "All agents busy, position: 3"
   - Play wait music
   ↓
6. AI Engine Initialization
   - Load Model: claude-sonnet-4.5
   - Load Voice: ar-SA-ZariyahNeural (Arabic female)
   - Load Knowledge Base: 150 FAQ entries
   - Load Context: Last 5 calls from Ahmed
   - Load Custom Prompt: "You are Noor, technical support agent..."
   ↓
7. Greeting
   AI: "مرحباً أحمد، كيف يمكنني مساعدتك اليوم؟"
   (Personalized: knows his name from CRM)
   ↓
8. Conversation Handling
   - Customer: "الإنترنت عندي بطيء جداً"
   - AI searches Knowledge Base → finds "Slow Internet Troubleshooting"
   - AI: "دعني أساعدك... هل جربت إعادة تشغيل الراوتر؟"
   ↓
9. Sentiment Analysis (Real-time)
   - Detects frustration (sentiment: -0.6)
   - Auto-escalate if configured
   ↓
10. Issue Resolution
    - AI guides through steps
    - Issue resolved: ✅
    ↓
11. CSAT Survey (if enabled)
    AI: "من 1 إلى 5، كيف تقيم الخدمة؟"
    Customer: "5"
    ↓
12. Workflow Trigger (if configured)
    - Send notification: "Support call completed - 5 stars"
    - Create Jira ticket: "Follow-up: Check Ahmed's internet speed"
    ↓
13. Call End
    - Save recording
    - Save transcript
    - Update caller profile
    - Generate analytics report
```

---

## 🧠 Knowledge Base Integration (RAG)

### How it works:

```javascript
// When customer asks a question
async function handleCustomerQuestion(question, callPointId) {
  // 1. Get all knowledge entries for this Call Point
  const knowledge = db.prepare(`
    SELECT * FROM call_point_knowledge
    WHERE call_point_id = ? AND is_active = 1
    ORDER BY priority DESC
  `).all(callPointId);

  // 2. Vector search (if RAG enabled)
  const relevantDocs = await vectorSearch(question, knowledge);

  // 3. Build context for AI
  const context = relevantDocs.map(doc => `
    [${doc.category}] ${doc.title}
    ${doc.content}
  `).join('\n\n');

  // 4. Send to AI with context
  const response = await ai.chat({
    model: callPoint.ai_model,
    messages: [
      { role: 'system', content: `You are a support agent. Use this knowledge:\n${context}` },
      { role: 'user', content: question }
    ]
  });

  return response;
}
```

---

## 📊 Analytics Dashboard (Real-time)

### Metrics to Track:

1. **Call Volume**:
   - Calls/hour, calls/day, calls/month
   - Peak hours (heatmap)

2. **Performance**:
   - Average call duration
   - Average wait time
   - Abandonment rate (% who hang up in queue)

3. **Quality**:
   - Resolution rate (% issues solved)
   - CSAT average (1-5 stars)
   - Sentiment distribution (positive/neutral/negative)

4. **Cost**:
   - Cost per call (Twilio + AI + storage)
   - Cost breakdown by Call Point
   - Cost trends

5. **AI Performance**:
   - Model accuracy (% correct answers)
   - Average response time
   - Token usage per call

---

## 🔌 Integration Points

### 1. Workflow Integration

```javascript
// Trigger workflow on call events
const WORKFLOW_TRIGGERS = {
  'call_started': ['log_to_crm', 'notify_manager'],
  'call_ended': ['update_ticket', 'send_sms_summary'],
  'call_escalated': ['alert_human_agent', 'create_priority_ticket'],
  'csat_low': ['notify_supervisor', 'schedule_followup']
};
```

### 2. Agent Memory Integration

```javascript
// Store call insights in agent memory
await api.memory.create({
  type: 'experiential',
  content: `Customer ${callerName} prefers Arabic and gets frustrated with long hold times`,
  tags: ['caller_preference', 'support'],
  importance: 0.8
});
```

### 3. Storage Integration

```javascript
// Store recordings in unified storage
await api.storage.upload({
  file: recordingBuffer,
  path: `call-recordings/${callSessionId}.mp3`,
  metadata: {
    callSessionId,
    duration: call.duration_seconds,
    sentiment: analytics.sentiment_label
  }
});
```

---

## 🚀 Implementation Phases

### Phase 1: Enhanced AI Engine (Week 1-2)
- ✅ Multi-model support (Claude/GPT/Gemini)
- ✅ Voice selection UI
- ✅ Custom prompt editor
- ✅ Knowledge Base CRUD

### Phase 2: Call Analytics (Week 3)
- ✅ Sentiment analysis integration
- ✅ Real-time dashboard
- ✅ Analytics database tables
- ✅ Reports generation

### Phase 3: Advanced Features (Week 4-5)
- ✅ Call queuing system
- ✅ Call transfer logic
- ✅ CRM (Caller profiles)
- ✅ CSAT surveys

### Phase 4: Integration (Week 6)
- ✅ Workflow triggers
- ✅ Memory integration
- ✅ Agent coordination
- ✅ RAG vector search

---

## 💰 Cost Optimization

### Smart Routing Based on Complexity:

```javascript
// Use cheaper models for simple queries
function selectModel(question) {
  if (isSimpleQuestion(question)) {
    return 'gemini-pro'; // $0.0005 per 1k tokens
  } else if (isComplexReasoning(question)) {
    return 'claude-sonnet-4.5'; // $0.015 per 1k tokens
  } else {
    return 'gpt-4-turbo'; // $0.01 per 1k tokens - balanced
  }
}
```

---

## 🎯 Success Metrics

1. **Resolution Rate**: >80% of calls resolved by AI
2. **CSAT**: >4.0/5.0 average rating
3. **Cost per Call**: <$0.50 (including Twilio + AI + storage)
4. **Response Time**: <500ms AI response
5. **Abandonment Rate**: <5% callers hang up in queue

---

## 🔐 Security & Compliance

1. **PCI DSS**: Never store credit card info in recordings
2. **GDPR**: Caller consent for recording (auto-played disclosure)
3. **Encryption**: AES-256 for recordings at rest
4. **Access Control**: Role-based access to recordings
5. **Audit Logs**: Track who accessed which recording

---

## 📝 Next Steps

1. Review this architecture
2. Prioritize features
3. Start with Phase 1 (Enhanced AI Engine)
4. Implement incrementally with testing

---

**End of Professional Architecture Document**
