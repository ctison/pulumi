import * as pulumi from '@pulumi/pulumi'
import { Repository } from './Repository'
import { Input } from '@pulumi/pulumi'

interface Environment {
  kubeconfig: Input<string>
  postgresURL: Input<string>
  k8sIP: Input<string>
}

interface GithubArgs {
  staging: Environment
  // production: Environment
}

export class Github extends pulumi.ComponentResource {
  constructor(name: string, args: GithubArgs, opts?: pulumi.ComponentResourceOptions) {
    super('github', name, {}, opts)

    const ambassador = this.createRepository('ambassador')
    ambassador.createActionSecret('K8S_STAGING_IP', args.staging.k8sIP.toString())
  }

  createRepository(name: string): Repository {
    return new Repository(name, undefined, { parent: this })
  }
}
