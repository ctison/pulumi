import * as pulumi from '@pulumi/pulumi'

export interface CI {
  createSecret(repo: string, name: string, value: pulumi.Input<string>): void
}

export interface CIConstructor {
  new (name: string, args: CIArgs, opts?: pulumi.ComponentResourceOptions): CI
}

export interface CIArgs {}
