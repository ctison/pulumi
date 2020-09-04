import * as pulumi from '@pulumi/pulumi'
import { Repository } from './Repository'

interface Environment {
  kubeconfig: string
  postgresURL: string
  k8sIP: string
}

interface GithubArgs {
  staging: Environment
  // production: Environment
}

export class Github extends pulumi.ComponentResource {
  constructor(name: string, args: GithubArgs, opts?: pulumi.ComponentResourceOptions) {
    super('github', name, {}, opts)

    const hasura = new Repository('hasura')
    hasura.createActionSecret('K8S_STAGING', args.staging.kubeconfig)
  }
}
