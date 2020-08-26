import * as pulumi from '@pulumi/pulumi'
import * as github from '@pulumi/github'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GithubArgs {}

export class Github extends pulumi.ComponentResource {
  constructor(name: string, args?: GithubArgs, opts?: pulumi.ComponentResourceOptions) {
    super('github', name, {}, opts)
    new github.ActionsSecret('test', {
      secretName: 'TEST',
      repository: 'ctison/hasura',
      plaintextValue: 'xxx',
    })
  }
}
