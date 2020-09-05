import * as pulumi from '@pulumi/pulumi'
import { Repository } from './Repository'
import { CI, CIArgs } from '..'

interface GithubArgs extends CIArgs {}

export class Github extends pulumi.ComponentResource implements CI {
  private _repos: { [key: string]: Repository } = {}

  constructor(name: string, args: GithubArgs, opts?: pulumi.ComponentResourceOptions) {
    super('github', name, {}, opts)
  }

  getRepository(name: string): Repository {
    if (this._repos[name] === undefined) {
      this._repos[name] = this.createRepository(name)
    }
    return this._repos[name]
  }

  createRepository(name: string): Repository {
    return new Repository(name, undefined, { parent: this })
  }

  createSecret(repo: string, name: string, value: pulumi.Input<string>): void {
    this.getRepository(repo).createActionSecret(name, value)
  }
}
