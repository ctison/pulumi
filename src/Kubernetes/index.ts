import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import { KubeConfig } from '@kubernetes/client-node'
import { Admin } from './Admin'

interface KubernetesArgs {
  kubeconfig: pulumi.Input<string>
}

export class Kubernetes extends pulumi.ComponentResource {
  readonly kubeconfig: KubeConfig
  readonly provider: k8s.Provider
  constructor(name: string, args: KubernetesArgs, opts?: pulumi.ComponentResourceOptions) {
    super('k8s', name, args, opts)
    this.kubeconfig = new KubeConfig()
    pulumi.output(args.kubeconfig).apply(kubeconfig => {
      this.kubeconfig.loadFromString(kubeconfig)
    })
    this.provider = new k8s.Provider(
      name,
      {
        kubeconfig: args.kubeconfig,
      },
      { parent: this }
    )
  }

  createAdmin(name: string, namespace: string): pulumi.Output<string> {
    const admin = new Admin(
      name,
      {
        kubeconfig: this.kubeconfig,
        namespace: namespace,
      },
      {
        parent: this,
        provider: this.provider,
      }
    )
    return admin.kubeconfig
  }
}
