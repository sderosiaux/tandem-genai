import OpenAI from 'openai'
import { generateSystemPrompt, generateFirstMessagePrompt } from '@/lib/prompts'
import { Persona, UserProfile, Message } from '@/lib/types'

export async function POST(req: Request) {
  try {
    // Initialize OpenAI client lazily to avoid build-time errors
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const body = await req.json()
    const {
      persona,
      userProfile,
      messages,
      conversationHistory,
      generateFirstMessage,
    } = body as {
      persona: Persona
      userProfile: UserProfile
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      conversationHistory: Message[]
      generateFirstMessage?: boolean
    }

    // Validation
    if (!persona || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'Missing persona or userProfile' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let systemPrompt: string
    let chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>

    if (generateFirstMessage) {
      // Générer le premier message du persona
      systemPrompt = generateFirstMessagePrompt(persona, userProfile)
      chatMessages = [{ role: 'system', content: systemPrompt }]
    } else {
      // Conversation normale
      systemPrompt = generateSystemPrompt(persona, userProfile, conversationHistory)
      chatMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ]
    }

    // Streaming response
    const stream = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: chatMessages,
      stream: true,
    })

    // Créer un stream lisible
    const encoder = new TextEncoder()
    let totalContent = ''
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Log the chunk structure for debugging
            console.log('Chunk received:', JSON.stringify(chunk, null, 2))

            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              totalContent += content
              controller.enqueue(encoder.encode(content))
            }
          }
          console.log('Stream complete. Total content length:', totalContent.length)
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
