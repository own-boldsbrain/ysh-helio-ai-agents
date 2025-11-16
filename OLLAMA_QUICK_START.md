# Ollama Quick Start - 5 Minutes ⚡

Get local AI running in 5 minutes with zero API costs!

## 🚀 Step 1: Start Ollama (1 min)

```bash
# Start Ollama server
docker-compose -f docker-compose.multi-agent.yml up -d ollama

# Expected output:
# ✅ Container coding-agent-ollama Started
```

## 📥 Step 2: Download Models (10-30 min)

Models are downloaded automatically. Monitor progress:

```bash
# Watch model downloads
docker-compose -f docker-compose.multi-agent.yml logs -f ollama-init

# Expected output:
# 📥 Pulling model: qwen2.5-coder:latest
# ⣾ ████████████████████░░░░░░░░ 75% (12GB/16GB)
```

**Models being downloaded:**

- Qwen2.5 Coder (32B) - ~16GB - Best for code
- Qwen2-VL (7B) - ~4GB - Vision model
- Gemma2 (9B) - ~5GB - Fast general purpose

**Total**: ~25GB download

## ✅ Step 3: Verify Installation (30 sec)

```bash
# Check if models are ready
docker exec ollama ollama list

# Expected output:
# NAME                    ID              SIZE    MODIFIED
# qwen2.5-coder:latest    abc123          16 GB   2 minutes ago
# qwen2-vl:latest         def456          4.1 GB  1 minute ago
# gemma2:latest           ghi789          5.2 GB  30 seconds ago
```

## 🎯 Step 4: Test Your First Request (30 sec)

```bash
# Generate code with Qwen2.5 Coder
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder",
  "prompt": "Write a Python function to reverse a string",
  "stream": false
}' | jq -r '.response'
```

**Expected response:**

```python
def reverse_string(text: str) -> str:
    """Reverse a string using slicing."""
    return text[::-1]

# Example usage
result = reverse_string("hello")
print(result)  # Output: olleh
```

## 🚀 Step 5: Start Ollama Agents (1 min)

```bash
# Start all Ollama agents
docker-compose -f docker-compose.multi-agent.yml up -d \
  agent-ollama-qwen-1 \
  agent-ollama-qwen-2 \
  agent-ollama-gemma-1 \
  agent-ollama-gemma-2 \
  agent-ollama-qwen-vision-1 \
  agent-ollama-qwen-vision-2

# Verify agents
docker-compose -f docker-compose.multi-agent.yml ps | grep ollama
```

## 🎉 Success! You're Ready!

### What You Can Do Now:

#### 1. Code Generation (FREE!)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder",
  "prompt": "Write a REST API endpoint in Node.js for user authentication"
}'
```

#### 2. Code Review (FREE!)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder",
  "prompt": "Review this code and suggest improvements:\n\nfunction add(a,b){return a+b}"
}'
```

#### 3. Image Understanding (FREE!)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2-vl",
  "prompt": "Describe this screenshot and suggest UI improvements",
  "images": ["'$(base64 -w0 screenshot.png)'"]
}'
```

#### 4. Quick Q&A (FREE!)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "gemma2",
  "prompt": "Explain the difference between async and sync in JavaScript"
}'
```

## 💰 Cost Comparison

### Before Ollama:

```
100 code generations/day via GPT-4:
- ~50,000 tokens/day
- ~1.5M tokens/month
- Cost: ~$45/month
```

### With Ollama:

```
100 code generations/day via Ollama:
- ~50,000 tokens/day
- ~1.5M tokens/month
- Cost: $0/month 🎉
```

**Annual Savings: $540**

## 📊 Performance Tips

### Fast Model for Quick Tasks

```bash
# Use Gemma2 for speed (40 tokens/sec)
curl http://localhost:11434/api/generate -d '{
  "model": "gemma2",
  "prompt": "Your quick question here"
}'
```

### Best Model for Code Quality

```bash
# Use Qwen2.5 Coder for production code (20 tokens/sec)
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder",
  "prompt": "Your complex coding task here"
}'
```

### Vision for Screenshots

```bash
# Use Qwen2-VL for image analysis (30 tokens/sec)
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2-vl",
  "prompt": "Analyze this UI",
  "images": ["base64_image"]
}'
```

## 🔧 Common Commands

### List Models

```bash
docker exec ollama ollama list
```

### Check Ollama Status

```bash
docker-compose -f docker-compose.multi-agent.yml ps ollama
```

### View Ollama Logs

```bash
docker-compose -f docker-compose.multi-agent.yml logs -f ollama
```

### Restart Ollama

```bash
docker-compose -f docker-compose.multi-agent.yml restart ollama
```

### Test Model Directly

```bash
docker exec -it ollama ollama run qwen2.5-coder "Write hello world in Python"
```

## 🐛 Troubleshooting

### Models Not Downloaded?

```bash
# Manually pull models
docker exec ollama ollama pull qwen2.5-coder:latest
docker exec ollama ollama pull qwen2-vl:latest
docker exec ollama ollama pull gemma2:latest
```

### Slow Responses?

```bash
# Check if multiple models are loaded (uses more RAM)
# Use smaller model for faster responses:
curl http://localhost:11434/api/generate -d '{
  "model": "gemma2",  # Faster than qwen2.5-coder
  "prompt": "Your prompt"
}'
```

### Out of Memory?

```bash
# Check memory usage
docker stats ollama

# Reduce loaded models in docker-compose.multi-agent.yml:
environment:
  - OLLAMA_MAX_LOADED_MODELS=1  # Instead of 3
```

## 📈 Next Steps

1. ✅ **Integrate with your app**: Use `http://localhost:11434` as base URL
2. ✅ **Monitor usage**: Check Grafana dashboard at `http://localhost:3001`
3. ✅ **Route intelligently**: Use Ollama for code, Cloud APIs for complex reasoning
4. ✅ **Scale up**: Add more Ollama agents for higher throughput

## 🌟 Pro Tips

### Tip 1: Keep Models Loaded

```yaml
# In docker-compose.multi-agent.yml
environment:
  - OLLAMA_KEEP_ALIVE=24h # Keep models in memory
```

**Benefit**: First request is instant (no model load time)

### Tip 2: Run Requests in Parallel

```yaml
environment:
  - OLLAMA_NUM_PARALLEL=4 # Process 4 requests simultaneously
```

**Benefit**: 4x throughput

### Tip 3: Use System Prompts

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder",
  "system": "You are an expert Python developer. Write production-ready code with docstrings.",
  "prompt": "Write a binary search function"
}'
```

**Benefit**: Better quality responses

### Tip 4: Stream Responses

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder",
  "prompt": "Write a sorting algorithm",
  "stream": true
}'
```

**Benefit**: See results as they're generated (better UX)

## 🎓 Learn More

- Full documentation: [docs/OLLAMA_INTEGRATION.md](docs/OLLAMA_INTEGRATION.md)
- Ollama API: <https://github.com/ollama/ollama/blob/main/docs/api.md>
- Model library: <https://ollama.com/library>

---

## ✅ Quick Checklist

- [x] Ollama server running
- [x] Models downloaded (~25GB)
- [x] Test request successful
- [x] Agents running
- [x] Ready to build! 🚀

**Congratulations! You're saving money while running AI locally! 💰**
