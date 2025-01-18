const OpenAI = require('openai')

export async function getTopicList(config) {
  const openai = new OpenAI({ apiKey: config.gptKey, dangerouslyAllowBrowser: true })

  const completion = await openai.chat.completions.create({
    model: config.gptModel || 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Please generate ${config.topicCount} relevant and interesting topics as asking of my opinion by using theme: ${config.topicTheme}. Topic's themes must be unique every time so that before to generate something check your previous generating staff and don't duplicate it.
          Length of topics shouldn't be more than 30 words. Mark each topic as [TOPIC] at the beginning of sentence without numeration and your first explanation. Only marking list.`,
      },
    ],
  })

  return completion
}

export async function verifyRawEssayByGpt(topic, essay, config) {
  const openai = new OpenAI({ apiKey: config.gptKey, dangerouslyAllowBrowser: true })

  const contentList = [`You are a professional English teacher. I want that you validate my essay in terms of grammar accuracy, use of vocabulary and meaning completeness according to the main idea of topic. `]
  config.onlySevereMistakes
    ? contentList.push('After analyzing, explain only severe mistakes if I have done it in my essay in terms of grammar, vocabulary etc. ')
    : contentList.push('After analizing, give me recommendations and possible improvements what comes to grammar and vocabulary using. ')

  config.normilizeInformalWay
    ? contentList.push("You should accept an informal way of my essay and don't reduce the grade for this. ")
    : contentList.push('You should reduce the grade of my essay if I use an informal writing style. ')

  contentList.push(`After all please value my English level from A2 to C2 in general. So, essay's topic sounds like: ${topic}. Here is my essay: ${essay}`)

  const completion = await openai.chat.completions.create({
    model: config.gptModel || 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: ''.concat(...contentList),
      },
    ],
  })

  return completion
}
