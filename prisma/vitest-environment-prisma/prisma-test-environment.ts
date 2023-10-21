import { Environment } from 'vitest'

export default <Environment>{
  name: 'prisma',
  async setup() {
    console.log('rodando')

    return {
      async teardown() {
        console.log('parou de executar')
      },
    }
  },
}
