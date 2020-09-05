import * as pulumi from '@pulumi/pulumi'
import { CI, CIConstructor } from '../CI'
import { Kubernetes } from '../Kubernetes'

interface EnvironmentArgs {
  ci: CIConstructor
  kubeconfig: pulumi.Input<string>
  k8sIP: pulumi.Input<string>
  pgURL: pulumi.Input<string>
}

export class Environment extends pulumi.ComponentResource {
  readonly ci: CI
  private k8s: Kubernetes

  constructor(name: string, args: EnvironmentArgs, opts?: pulumi.ComponentResourceOptions) {
    super('environment', name, {}, opts)
    this.ci = new args.ci(name, {}, { parent: this })
    this.k8s = new Kubernetes(
      name,
      {
        kubeconfig: args.kubeconfig,
      },
      { parent: this }
    )

    const NAME = name.toLocaleUpperCase()
    this.ci.createSecret('ambassador', `${NAME}_K8S_IP`, args.k8sIP.toString())
    const adminAmbassador = this.k8s.createAdmin('ambassador-ci', 'ambassador')
    this.ci.createSecret('ambassador', `${NAME}_KUBECONFIG`, adminAmbassador)
  }
}
