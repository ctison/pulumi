import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import { KubeConfig } from '@kubernetes/client-node'

interface AdminArgs {
  kubeconfig: pulumi.Input<KubeConfig>
  namespace?: string
}

export class Admin extends pulumi.ComponentResource {
  private _kubeconfig: pulumi.Input<KubeConfig>
  readonly kubeconfig: pulumi.Output<string>

  constructor(name: string, args: AdminArgs, opts?: pulumi.ComponentResourceOptions) {
    super('admin', name, {}, opts)
    this._kubeconfig = args.kubeconfig

    const namespace = args.namespace ?? name
    const metadata: k8s.types.input.meta.v1.ObjectMeta = {
      name: name,
      namespace: namespace,
    }
    const serviceAccount = new k8s.core.v1.ServiceAccount(
      name,
      {
        metadata: metadata,
      },
      { parent: this }
    )
    const role = new k8s.rbac.v1.Role(
      name,
      {
        metadata: metadata,
        rules: [
          {
            apiGroups: [''],
            verbs: ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete'],
          },
        ],
      },
      { parent: this }
    )
    new k8s.rbac.v1.RoleBinding(
      name,
      {
        metadata: metadata,
        roleRef: {
          apiGroup: role.apiVersion,
          kind: role.kind,
          name: role.metadata.name,
        },
        subjects: [
          {
            kind: serviceAccount.kind,
            name: serviceAccount.metadata.name,
          },
        ],
      },
      { parent: this }
    )
    const secret = k8s.core.v1.Secret.get(name, serviceAccount.secrets[0].uid)
    this.kubeconfig = this.generateKubeconfigForServiceAccount(
      name,
      namespace,
      secret.stringData['token']
    )
  }

  generateKubeconfigForServiceAccount(
    name: pulumi.Input<string>,
    namespace: pulumi.Input<string>,
    token: pulumi.Input<string>
  ): pulumi.Output<string> {
    return pulumi
      .all([this._kubeconfig, name, namespace, token])
      .apply(([_kubeconfig, name, namespace, token]) => {
        const kubeconfig = new KubeConfig()
        const cluster = _kubeconfig.getCurrentCluster()!
        kubeconfig.addUser({
          name: name,
          token: token,
        })
        kubeconfig.addContext({
          name: `${name}@${cluster.name}`,
          cluster: cluster.name,
          user: name,
          namespace: namespace,
        })
        kubeconfig.setCurrentContext('default')
        return kubeconfig.exportConfig()
      })
  }
}
