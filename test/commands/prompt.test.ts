import {expect, test} from '@oclif/test'

describe('make-server', () => {
  test
  .stdout()
  .command(['prompt'])
  .it('runs prompt', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['hello', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
