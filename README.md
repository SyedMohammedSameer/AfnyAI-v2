# 🌸 Sakura AI - Japanese Language Learning Companion

An AI-powered Japanese language tutor that helps you practice conversational Japanese with real-time translations and speech synthesis.

## ✨ Features

- 🤖 **AI Conversation** - Practice Japanese with an AI tutor powered by Groq's llama-3.3-70b-versatile model
- 🔊 **Text-to-Speech** - Hear proper Japanese pronunciation
- 🎤 **Voice Input** - Speak in Japanese using speech recognition
- 🌐 **Real-time Translation** - See English translations of all messages
- 📚 **Word of the Day** - Learn a new Japanese word every day
- 🌓 **Dark Mode** - Easy on the eyes
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 🔐 **Secure** - API keys never exposed to the frontend

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AfnyAI-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get a Groq API Key**
   - Visit [Groq Console](https://console.groq.com/keys)
   - Create a new API key (it's free!)

4. **Configure environment**
   ```bash
   # Copy the example file
   cp .env.local.example .env.local

   # Edit .env.local and add your Groq API key
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:8888`
   - Start chatting in Japanese! 🎉

## 🌐 Deploy to Netlify

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

**Important**: After deployment, set the `GROQ_API_KEY` environment variable in your Netlify dashboard!

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Netlify Serverless Functions
- **AI Model**: Groq llama-3.3-70b-versatile
- **Build Tool**: Vite
- **Deployment**: Netlify

## 📁 Project Structure

```
AfnyAI-v2/
├── components/           # React components
│   ├── ChatView.tsx     # Main chat interface
│   ├── WordOfTheDay.tsx # Daily word widget
│   └── ...
├── netlify/
│   └── functions/       # Serverless API endpoints
│       ├── chat.ts      # Chat completions
│       ├── translate.ts # Translation
│       └── word-of-day.ts
├── services/
│   ├── apiService.ts    # API client for Netlify functions
│   └── speechService.ts # Speech synthesis & recognition
├── App.tsx              # Main application component
├── netlify.toml         # Netlify configuration
└── package.json
```

## 🔐 Security

- ✅ API keys stored securely in Netlify environment variables
- ✅ All AI requests go through serverless functions
- ✅ No sensitive data exposed to the frontend
- ✅ `.env.local` is gitignored by default

## 🎯 Usage Tips

1. **Practice Greetings**: Start with "こんにちは" or "はじめまして"
2. **Use Voice Input**: Click the microphone to practice speaking
3. **Check Translations**: All Japanese text shows English translation below
4. **Learn Daily Words**: Click the speaker icon on the Word of the Day
5. **Dark Mode**: Toggle with the moon/sun icon in the header

## 🐛 Troubleshooting

### Functions not working locally
- Make sure you run `npm run dev` (not `vite`)
- Check that `.env.local` has your `GROQ_API_KEY`

### CORS errors
- Access via `http://localhost:8888` (Netlify Dev port)
- Not `http://localhost:5173` (Vite port)

### Build fails
- Ensure Node.js version 18+
- Delete `node_modules` and `package-lock.json`, then `npm install`

## 📝 Environment Variables

### For Local Development (.env.local)

```env
GROQ_API_KEY=your_groq_api_key_here
```

### For Netlify Production

Set in Netlify Dashboard → Site Settings → Environment Variables:
- `GROQ_API_KEY` = your_groq_api_key_here

## 📜 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ❤️ Acknowledgments

- Powered by [Groq](https://groq.com/)
- Deployed on [Netlify](https://www.netlify.com/)
- Built with ❤️ for Japanese language learners
