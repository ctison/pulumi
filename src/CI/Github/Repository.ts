import * as pulumi from '@pulumi/pulumi'
import * as github from '@pulumi/github'

interface RepositoryArgs {}

export class Repository extends pulumi.ComponentResource {
  readonly name: string

  constructor(name: string, args?: RepositoryArgs, opts?: pulumi.ComponentResourceOptions) {
    super('repo', name, {}, opts)
    this.name = name
  }

  createActionSecret(name: string, secret: pulumi.Input<string>): void {
    new github.ActionsSecret(
      name,
      {
        repository: this.name,
        secretName: name,
        plaintextValue: secret,
      },
      { parent: this }
    )
  }
}
